import os
import json
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Text, DateTime, ForeignKey, create_engine
)
from sqlalchemy.orm import DeclarativeBase, relationship, sessionmaker

# Support persistent storage on Render/Docker via DATA_DIR
DATA_DIR = os.environ.get("DATA_DIR", ".")
if not os.path.isabs(DATA_DIR):
    # If relative, make it relative to the backend directory
    DATA_DIR = os.path.join(os.path.dirname(__file__), DATA_DIR)

if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR, exist_ok=True)

DATABASE_URL = f"sqlite:///{os.path.join(DATA_DIR, 'notebooklm.db')}"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def utcnow():
    return datetime.now(timezone.utc)


class Notebook(Base):
    __tablename__ = "notebooks"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    last_modified = Column(DateTime, default=utcnow, onupdate=utcnow)

    sources = relationship("Source", back_populates="notebook", cascade="all, delete-orphan")
    notes = relationship("Note", back_populates="notebook", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="notebook", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "lastModified": self.last_modified.isoformat() if self.last_modified else None,
            "sources": [s.to_dict() for s in self.sources],
            "notes": [n.to_dict() for n in self.notes],
            "messages": [m.to_dict() for m in self.messages],
        }


class Source(Base):
    __tablename__ = "sources"

    id = Column(String, primary_key=True)
    notebook_id = Column(String, ForeignKey("notebooks.id"), nullable=False)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # pdf | url | youtube | text
    date_added = Column(DateTime, default=utcnow)
    content_text = Column(Text, default="")  # Extracted text content

    notebook = relationship("Notebook", back_populates="sources")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "dateAdded": self.date_added.isoformat() if self.date_added else None,
        }


class Note(Base):
    __tablename__ = "notes"

    id = Column(String, primary_key=True)
    notebook_id = Column(String, ForeignKey("notebooks.id"), nullable=False)
    title = Column(String, default="")
    content = Column(Text, default="")
    color = Column(String, default="bg-white/5")
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    notebook = relationship("Notebook", back_populates="notes")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "color": self.color,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }


class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True)
    notebook_id = Column(String, ForeignKey("notebooks.id"), nullable=False)
    role = Column(String, nullable=False)  # user | model
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=utcnow)
    source_ids_json = Column(Text, default="[]")  # JSON list of source IDs cited

    notebook = relationship("Notebook", back_populates="messages")

    @property
    def sources(self):
        try:
            return json.loads(self.source_ids_json or "[]")
        except (json.JSONDecodeError, TypeError):
            return []

    @sources.setter
    def sources(self, value):
        self.source_ids_json = json.dumps(value or [])

    def to_dict(self):
        return {
            "id": self.id,
            "role": self.role,
            "content": self.content,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "sources": self.sources,
        }


def init_db():
    Base.metadata.create_all(bind=engine)
