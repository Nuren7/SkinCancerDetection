import os 
from sqlalchemy import create_engine
from sqlalchemy.ext.declerative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

#load env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

#create engine for neon
engine = create_engine(DATABASE_URL)

#create session 
SessionLocal = sessionmaker(autocommit = False, autoflush = False, bind = engine)

#baselass for tbales 
Base = declarative_base()

def get_db():
  """
  create database session for req and close it
  """
  db = SessionLocal()
  try :
    yield db
  finally:
    db.close