from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base for read/write mappings of the Prisma-owned schema."""
