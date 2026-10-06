from __future__ import annotations

import asyncio
import json
import logging
import time
from typing import Any

from python_api.config import get_settings
from python_api.redis_service import FEISHU_MTABLE, redis_service

logger = logging.getLogger("python_api.feishu")
CLIENT_SECRET_TABLE_ID = "tblM4JUNtLKnrewV"


class FeishuClient:
    """Lazily creates the official SDK client for the retained Feishu app."""

    def __init__(self) -> None:
        self._client: Any | None = None

    @property
    def client(self) -> Any:
        """Returns a singleton official lark-oapi client."""
        if self._client is None:
            import lark_oapi as lark

            settings = get_settings()
            self._client = (
                lark.Client.builder()
                .app_id(settings.feishu_alert_app_appid)
                .app_secret(settings.feishu_alert_app_appsecret)
                .log_level(lark.LogLevel.WARNING)
                .build()
            )
        return self._client


class ClientSecretTable:
    """Reads the shared fixed-token record with NestJS-compatible caching."""

    async def get(self, record_id: str) -> dict[str, Any]:
        """Gets one Bitable record and caches the SDK data shape for 24 hours."""
        settings = get_settings()
        app_token = settings.feishu_aplus_node_admin_app_token
        key = (
            FEISHU_MTABLE.replace("{appToken}", app_token).replace(
                "{tableId}", CLIENT_SECRET_TABLE_ID
            )
            + f":mtable-get:{record_id}"
        )
        cached = await redis_service.client.get(key)
        if cached:
            return json.loads(cached)

        def execute() -> dict[str, Any]:
            from lark_oapi.api.bitable.v1 import GetAppTableRecordRequest

            request = (
                GetAppTableRecordRequest.builder()
                .app_token(app_token)
                .table_id(CLIENT_SECRET_TABLE_ID)
                .record_id(record_id)
                .build()
            )
            response = feishu_client.client.bitable.v1.app_table_record.get(request)
            if not response.success():
                raise RuntimeError(f"飞书接口请求异常: {response.code} {response.msg}")
            data = json.loads(response.raw.content.decode("utf-8")).get("data", {})
            return data.get("record", data)

        record = await asyncio.to_thread(execute)
        await redis_service.client.setex(key, 86_400, json.dumps(record, ensure_ascii=False))
        return record


class FeishuAlertService:
    """Sends throttled exception cards without exposing secrets in logs."""

    def __init__(self) -> None:
        self._last_sent = 0.0

    async def send_exception(self, error: Exception, context: str = "") -> None:
        """Sends at most one retained alert card per 400 milliseconds."""
        settings = get_settings()
        if not settings.server_alert_groupid or not settings.feishu_alert_app_appid:
            return
        now = time.monotonic()
        if now - self._last_sent < 0.4:
            return
        self._last_sent = now
        content = json.dumps(
            {
                "type": "template",
                "data": {
                    "template_id": "AAqSyNBCovM2j",
                    "template_version_name": "1.0.14",
                    "template_variable": {
                        "project": "aplus-sql-python-api",
                        "level": "error",
                        "title": "异常报警",
                        "color": "orange",
                        "message": str(error),
                        "content": context[:1000] or "--",
                        "environment": settings.node_env,
                    },
                },
            },
            ensure_ascii=False,
        )

        def execute() -> None:
            from lark_oapi.api.im.v1 import CreateMessageRequest, CreateMessageRequestBody

            request = (
                CreateMessageRequest.builder()
                .receive_id_type("chat_id")
                .request_body(
                    CreateMessageRequestBody.builder()
                    .receive_id(settings.server_alert_groupid)
                    .msg_type("interactive")
                    .content(content)
                    .build()
                )
                .build()
            )
            response = feishu_client.client.im.v1.message.create(request)
            if not response.success():
                logger.error("feishu_alert_failed code=%s message=%s", response.code, response.msg)

        await asyncio.to_thread(execute)


feishu_client = FeishuClient()
client_secret_table = ClientSecretTable()
feishu_alert_service = FeishuAlertService()
