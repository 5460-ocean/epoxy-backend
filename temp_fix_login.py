@router.post("/login")
def login(user: UserLogin):
    db = next(get_db())

    existing_user = db.query(models.User).filter(models.User.email == user.email).first()

    if not existing_user:
        raise HTTPException(status_code=400, detail="User not found")

    print("INPUT PASSWORD:", user.password)
    print("DB PASSWORD:", existing_user.hashed_password)

    if existing_user.hashed_password != user.password:
        raise HTTPException(status_code=400, detail="Wrong password")

    return {"message": "Login successful"}
