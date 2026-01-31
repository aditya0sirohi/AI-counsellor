from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True)
    onboarding_complete = Column(Boolean, default=False)


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    education = Column(String)
    degree = Column(String)
    target_country = Column(String)
    budget = Column(String)
    exams = Column(String)
    stage = Column(String, default="discover")  # discover / finalize / apply


class UniversityShortlist(Base):
    __tablename__ = "shortlists"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    name = Column(String)
    category = Column(String)  # dream / target / safe


class LockedUniversity(Base):
    __tablename__ = "locked_universities"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    name = Column(String)


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    completed = Column(Boolean, default=False)
