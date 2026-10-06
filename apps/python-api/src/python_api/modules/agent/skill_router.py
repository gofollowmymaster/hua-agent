from __future__ import annotations

from typing import Annotated, Any

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from python_api.core.context import get_request_context
from python_api.core.database import get_db
from python_api.modules.agent.skill_schemas import (
    CreateUserSkillRequest,
    SystemSkillQuery,
    UpdateUserSkillRequest,
    UserSkillItem,
    UserSkillPage,
    UserSkillPageRequest,
)
from python_api.modules.agent.skills import AgentSkillService
from python_api.modules.auth.dependencies import require_bearer

router = APIRouter(prefix="/agent/skills", tags=["业务 Agent Skill"])


def _service(db: AsyncSession, user: dict[str, Any]) -> AgentSkillService:
    """Builds a Skill service from verified JWT identity and request tenant."""
    raw_user_id = user.get("userId")
    user_id = raw_user_id if isinstance(raw_user_id, int) and not isinstance(raw_user_id, bool) else None
    return AgentSkillService(db, get_request_context().tenant_code, user_id)


@router.get("/system")
async def list_system_skills(
    query: Annotated[SystemSkillQuery, Depends()],
    _user: dict[str, Any] = Depends(require_bearer),
) -> list[dict[str, Any]]:
    """Returns the filtered read-only system Skill catalog."""
    return AgentSkillService.list_system_skills(query.keyword)


@router.post("/user/page", response_model=UserSkillPage, response_model_by_alias=True)
async def page_user_skills(
    body: UserSkillPageRequest,
    db: AsyncSession = Depends(get_db),
    user: dict[str, Any] = Depends(require_bearer),
) -> UserSkillPage:
    """Pages Skills owned by the verified JWT user."""
    return await _service(db, user).page_user_skills(body)


@router.post("/user", response_model=UserSkillItem, response_model_by_alias=True)
async def create_user_skill(
    body: CreateUserSkillRequest,
    db: AsyncSession = Depends(get_db),
    user: dict[str, Any] = Depends(require_bearer),
) -> UserSkillItem:
    """Creates one Skill for the verified JWT user."""
    return await _service(db, user).create_user_skill(body)


@router.post("/user/{skill_id}", response_model=UserSkillItem, response_model_by_alias=True)
async def update_user_skill(
    skill_id: int,
    body: UpdateUserSkillRequest,
    db: AsyncSession = Depends(get_db),
    user: dict[str, Any] = Depends(require_bearer),
) -> UserSkillItem:
    """Updates one Skill owned by the verified JWT user."""
    return await _service(db, user).update_user_skill(skill_id, body)


@router.delete("/user/{skill_id}")
async def delete_user_skill(
    skill_id: int,
    db: AsyncSession = Depends(get_db),
    user: dict[str, Any] = Depends(require_bearer),
) -> None:
    """Deletes one Skill owned by the verified JWT user."""
    await _service(db, user).delete_user_skill(skill_id)
