"""JIRA connection database model."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class JiraConnection(Base):
    """JIRA server connection configuration."""

    __tablename__ = "jira_connections"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    jira_url: Mapped[str] = mapped_column(String(500), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    api_token_encrypted: Mapped[str] = mapped_column(String(500), nullable=False)
    api_version: Mapped[int] = mapped_column(Integer, default=3)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)
    is_locked: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="connections")

    def __repr__(self) -> str:
        return f"<JiraConnection(id={self.id}, name={self.name}, url={self.jira_url})>"


# Import here to avoid circular imports
from app.models.user import User  # noqa: E402, F401
