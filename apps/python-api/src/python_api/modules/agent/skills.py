from __future__ import annotations

from typing import Any

from fastapi import HTTPException
from sqlalchemy import func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from python_api.core.errors import NotReportError
from python_api.modules.agent.models import AgentUserSkill
from python_api.modules.agent.skill_catalog import SYSTEM_SKILLS
from python_api.modules.agent.skill_schemas import (
    CreateUserSkillRequest,
    SkillInstruction,
    UpdateUserSkillRequest,
    UserSkillItem,
    UserSkillPage,
    UserSkillPageRequest,
)

MAX_ENABLED_USER_SKILLS = 20
MAX_ENABLED_INSTRUCTION_LENGTH = 30_000


class AgentSkillService:
    """Manages read-only system Skills and tenant-user-owned personal Skills."""

    def __init__(self, db: AsyncSession, tenant_code: str, user_id: int | None) -> None:
        self.db = db
        self.tenant_code = tenant_code
        self.user_id = user_id

    @staticmethod
    def list_system_skills(keyword: str | None = None) -> list[dict[str, Any]]:
        """Returns system Skills in catalog order with optional text filtering."""
        normalized = keyword.casefold() if keyword else None
        return [
            dict(skill)
            for skill in SYSTEM_SKILLS
            if normalized is None
            or any(
                normalized in value.casefold()
                for value in (skill["name"], skill["description"], skill["instruction"])
            )
        ]

    async def page_user_skills(self, request: UserSkillPageRequest) -> UserSkillPage:
        """Pages Skills owned by the authenticated tenant and user."""
        user_id = self._require_user_id()
        filters: list[Any] = [
            AgentUserSkill.tenant_code == self.tenant_code,
            AgentUserSkill.user_id == user_id,
        ]
        if request.is_enabled is not None:
            filters.append(AgentUserSkill.is_enabled == request.is_enabled)
        if request.keyword:
            pattern = f"%{request.keyword}%"
            filters.append(
                or_(
                    AgentUserSkill.name.ilike(pattern),
                    AgentUserSkill.description.ilike(pattern),
                    AgentUserSkill.instruction.ilike(pattern),
                )
            )
        total = int(
            (await self.db.execute(select(func.count()).select_from(AgentUserSkill).where(*filters)))
            .scalar_one()
        )
        rows = (
            await self.db.execute(
                select(AgentUserSkill)
                .where(*filters)
                .order_by(AgentUserSkill.created_at.desc(), AgentUserSkill.id.desc())
                .offset((request.page - 1) * request.page_size)
                .limit(request.page_size)
            )
        ).scalars()
        return UserSkillPage(
            list=[self._to_item(row) for row in rows],
            total=total,
            page=request.page,
            page_size=request.page_size,
        )

    async def create_user_skill(self, request: CreateUserSkillRequest) -> UserSkillItem:
        """Creates one private Skill and commits the transaction."""
        user_id = self._require_user_id()
        if request.is_enabled:
            await self._assert_enabled_limits(request.instruction)
        skill = AgentUserSkill(
            tenant_code=self.tenant_code,
            user_id=user_id,
            name=request.name,
            description=request.description or "",
            instruction=request.instruction,
            is_enabled=request.is_enabled,
        )
        self.db.add(skill)
        await self._commit_unique_name()
        await self.db.refresh(skill)
        return self._to_item(skill)

    async def update_user_skill(
        self, skill_id: int, request: UpdateUserSkillRequest
    ) -> UserSkillItem:
        """Updates one owned Skill after rechecking enabled limits."""
        if not request.model_fields_set:
            raise HTTPException(400, "至少提供一个需要修改的字段")
        skill = await self._find_owned_skill(skill_id)
        next_instruction = request.instruction or skill.instruction
        next_enabled = request.is_enabled if request.is_enabled is not None else skill.is_enabled
        if next_enabled:
            await self._assert_enabled_limits(next_instruction, excluded_id=skill.id)
        for field in ("name", "description", "instruction", "is_enabled"):
            if field in request.model_fields_set:
                setattr(skill, field, getattr(request, field))
        await self._commit_unique_name()
        await self.db.refresh(skill)
        return self._to_item(skill)

    async def delete_user_skill(self, skill_id: int) -> None:
        """Deletes one owned Skill and commits the transaction."""
        skill = await self._find_owned_skill(skill_id)
        await self.db.delete(skill)
        await self.db.commit()

    async def list_enabled_instructions(self) -> list[SkillInstruction]:
        """Returns system then enabled user instructions in deterministic order."""
        instructions = [
            SkillInstruction(
                key=skill["key"],
                type="system",
                name=skill["name"],
                instruction=skill["instruction"],
            )
            for skill in SYSTEM_SKILLS
        ]
        if self.user_id is None:
            return instructions
        rows = (
            await self.db.execute(
                select(AgentUserSkill)
                .where(
                    AgentUserSkill.tenant_code == self.tenant_code,
                    AgentUserSkill.user_id == self.user_id,
                    AgentUserSkill.is_enabled.is_(True),
                )
                .order_by(AgentUserSkill.created_at.asc(), AgentUserSkill.id.asc())
            )
        ).scalars()
        return [
            *instructions,
            *[
                SkillInstruction(
                    key=f"user:{skill.id}",
                    type="user",
                    name=skill.name,
                    instruction=skill.instruction,
                )
                for skill in rows
            ],
        ]

    def _require_user_id(self) -> int:
        """Rejects management operations without a trusted JWT user ID."""
        if self.user_id is None:
            raise NotReportError("缺少可信的用户身份", 401)
        return self.user_id

    async def _find_owned_skill(self, skill_id: int) -> AgentUserSkill:
        """Looks up a Skill using its full tenant-owner boundary."""
        user_id = self._require_user_id()
        skill = (
            await self.db.execute(
                select(AgentUserSkill).where(
                    AgentUserSkill.id == skill_id,
                    AgentUserSkill.tenant_code == self.tenant_code,
                    AgentUserSkill.user_id == user_id,
                )
            )
        ).scalar_one_or_none()
        if skill is None:
            raise NotReportError("Skill 不存在", 404)
        return skill

    async def _assert_enabled_limits(
        self, instruction: str, excluded_id: int | None = None
    ) -> None:
        """Checks the enabled count and combined instruction length."""
        user_id = self._require_user_id()
        filters: list[Any] = [
            AgentUserSkill.tenant_code == self.tenant_code,
            AgentUserSkill.user_id == user_id,
            AgentUserSkill.is_enabled.is_(True),
        ]
        if excluded_id is not None:
            filters.append(AgentUserSkill.id != excluded_id)
        rows = (
            await self.db.execute(select(AgentUserSkill.instruction).where(*filters))
        ).scalars().all()
        if len(rows) >= MAX_ENABLED_USER_SKILLS:
            raise HTTPException(400, f"最多启用 {MAX_ENABLED_USER_SKILLS} 个用户 Skill")
        if sum(len(value) for value in rows) + len(instruction) > MAX_ENABLED_INSTRUCTION_LENGTH:
            raise HTTPException(
                400,
                f"启用的用户 Skill 指令总长度不能超过 {MAX_ENABLED_INSTRUCTION_LENGTH} 字",
            )

    async def _commit_unique_name(self) -> None:
        """Commits a write and maps the owner-scoped unique name conflict."""
        try:
            await self.db.commit()
        except IntegrityError as error:
            await self.db.rollback()
            sqlstate = getattr(error.orig, "sqlstate", None) or getattr(
                error.orig, "pgcode", None
            )
            if sqlstate == "23505" or "unique" in str(error.orig).casefold():
                raise HTTPException(400, "Skill 名称已存在") from error
            raise

    @staticmethod
    def _to_item(skill: AgentUserSkill) -> UserSkillItem:
        """Maps one ORM row to the stable HTTP response model."""
        return UserSkillItem(
            id=skill.id,
            name=skill.name,
            description=skill.description,
            instruction=skill.instruction,
            is_enabled=skill.is_enabled,
            created_at=skill.created_at,
            updated_at=skill.updated_at,
        )
