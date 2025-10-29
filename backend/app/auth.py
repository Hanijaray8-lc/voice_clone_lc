# backend/app/auth.py
from fastapi import APIRouter, HTTPException, Depends, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.status import HTTP_201_CREATED, HTTP_401_UNAUTHORIZED
from .db import db
from . import utils
from . import schemas
from bson import ObjectId
import jwt
import os

router = APIRouter(prefix="/api/auth", tags=["auth"])
security = HTTPBearer()
SECRET_KEY = os.getenv("SECRET_KEY")

@router.post("/signup", response_model=schemas.Token, status_code=HTTP_201_CREATED)
async def signup(user: schemas.UserCreate):
    existing = await db["users"].find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = utils.hash_password(user.password)
    user_doc = {"name": user.name, "email": user.email, "password": hashed, "created_at": __import__("datetime").datetime.utcnow()}
    result = await db["users"].insert_one(user_doc)
    user_id = str(result.inserted_id)
    token = utils.create_access_token({"sub": user_id})
    return {"access_token": token, "token_type": "bearer"}

@router.post("/login", response_model=schemas.Token)
async def login(credentials: schemas.UserLogin):
    user = await db["users"].find_one({"email": credentials.email})
    if not user or not utils.verify_password(credentials.password, user.get("password", "")):
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = utils.create_access_token({"sub": str(user["_id"])})
    return {"access_token": token, "token_type": "bearer"}

async def get_current_user(creds: HTTPAuthorizationCredentials = Depends(security)):
    token = creds.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[os.getenv("ALGORITHM", "HS256")])
        user_id = payload.get("sub")
    except Exception:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="User not found")
    return utils.serialize_user(user)

@router.get("/me", response_model=schemas.UserOut)
async def me(current_user = Depends(get_current_user)):
    return current_user

@router.post("/change-password")
async def change_password(
    email: str = Body(...),
    new_password: str = Body(...),
    current_user = Depends(get_current_user)
):
    # Only allow changing own password
    if email != current_user["email"]:
        raise HTTPException(status_code=403, detail="Email does not match your account.")
    hashed = utils.hash_password(new_password)
    await db["users"].update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$set": {"password": hashed}}
    )
    return {"message": "Password changed successfully"}

@router.delete("/delete-account")
async def delete_account(current_user = Depends(get_current_user)):
    await db["users"].delete_one({"_id": ObjectId(current_user["id"])})
    return {"message": "Account deleted"}
