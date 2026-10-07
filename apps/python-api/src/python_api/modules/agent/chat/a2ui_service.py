from __future__ import annotations

from typing import Any

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from python_api.modules.agent.chat.a2ui import apply_order_action, update_order_command
from python_api.modules.agent.chat.memory import AgentMemoryService
from python_api.modules.agent.chat.schemas import AgentA2uiActionRequest
from python_api.modules.business.ds_order.service import DsOrderService


class AgentA2uiActionService:
    """Executes persisted order-card actions for the authenticated chat owner."""

    def __init__(self, db: AsyncSession) -> None:
        self.memory = AgentMemoryService(db)
        self.orders = DsOrderService()

    async def execute(
        self, request: AgentA2uiActionRequest, participant_id: str
    ) -> dict[str, Any]:
        """Finds the source surface, applies its allowed action and persists its data update."""
        session = self.memory.resolve(request.conversation_id, participant_id, None)
        source = await self.memory.find_a2ui_surface(session, request.surface_id)
        if not source:
            raise HTTPException(404, "未找到当前会话的订单卡片")
        order = _surface_order(source)
        command = update_order_command(
            request.surface_id,
            apply_order_action(order, request.action, request.reason, self.orders),
        )
        if not await self.memory.append_a2ui_command(session, request.surface_id, command):
            raise HTTPException(409, "订单卡片已失效，请刷新会话后重试")
        return {"surfaceId": request.surface_id, "commands": [command]}


def _surface_order(data: dict[str, Any]) -> dict[str, Any]:
    for command in data.get("commands", []):
        update = command.get("updateDataModel") if isinstance(command, dict) else None
        if isinstance(update, dict) and update.get("path") == "/order" and isinstance(update.get("value"), dict):
            return update["value"]
    raise HTTPException(400, "该卡片不支持订单操作")
