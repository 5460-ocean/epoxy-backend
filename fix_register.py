@router.post("/register")
def register(user: UserCreate):
    db: Session = next(get_db())

    hashed_password = hash_password(user.password)

    new_user = models.User(
        email=user.email,
        hashed_password=hashed_password
    )

    db.add(new_user)
    db.commit()

    return {"message": "registered"}
