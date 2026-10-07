from sqlalchemy.orm import configure_mappers

from python_api.core.model_base import Base
from python_api.modules.agent.models import (
    AgentChatMessage,
    AgentChatSession,
    AgentChunk,
    AgentDocument,
    AgentUserSkill,
)
from python_api.modules.auth.models import RagAdminUser
from python_api.modules.digital_avatar.models import (
    DigitalAvatarChunk,
    DigitalAvatarDocument,
)
from python_api.modules.rag.models import (
    AplusChunk,
    AplusDocument,
    AplusRagMessage,
    AplusRagSession,
)

EXPECTED_TABLES = {
    "agent_chat_messages",
    "agent_user_skills",
    "agent_chat_sessions",
    "agent_chunks",
    "agent_documents",
    "aplus_chunks",
    "aplus_documents",
    "aplus_rag_messages",
    "aplus_rag_sessions",
    "rag_admin_users",
    "digital_avatar_documents",
    "digital_avatar_chunks",
}


def test_model_package_registers_all_prisma_owned_tables() -> None:
    """Verifies package exports load every mapping and resolve relationships."""
    configure_mappers()

    exported_tables = {
        AgentChatMessage.__tablename__,
        AgentChatSession.__tablename__,
        AgentChunk.__tablename__,
        AgentDocument.__tablename__,
        AgentUserSkill.__tablename__,
        AplusChunk.__tablename__,
        AplusDocument.__tablename__,
        AplusRagMessage.__tablename__,
        AplusRagSession.__tablename__,
        RagAdminUser.__tablename__,
        DigitalAvatarDocument.__tablename__,
        DigitalAvatarChunk.__tablename__,
    }

    assert exported_tables == EXPECTED_TABLES
    assert set(Base.metadata.tables) == EXPECTED_TABLES
    assert AgentDocument.content.property.deferred is True
