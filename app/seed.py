from app.database import SessionLocal
from app.models.asset import Asset
from app.models.theme import Theme
from app.models.surface import Surface

db = SessionLocal()

# 🎨 ASSETS
assets = [

# 🌊 Nature
("Water (still)", "nature"),
("Water (flowing)", "nature"),
("Sand (desert)", "nature"),
("Sand (beach)", "nature"),
("Rocks (sedimentary)", "nature"),
("Trees", "nature"),
("Leaves (seasonal)", "nature"),
("Grass", "nature"),
("Clouds", "nature"),
("Fog", "effects"),

# 🌊 Marine
("Coral", "marine"),
("Fish", "marine"),
("Underwater plants", "marine"),

# ✨ Effects
("Neon lights", "lighting"),
("Glow effect", "effects"),
("3D depth", "effects"),
("Transparency", "effects"),
("Mirror effect", "effects"),
("Glass effect", "effects"),

# 💎 Materials
("Gold flakes", "materials"),
("Metallic dust", "materials"),
("Glass shards", "materials"),
("Crystals", "materials"),

# 🏙 CITY / BUILDINGS (your addition)
("Skyscraper", "buildings"),
("Residential building", "buildings"),
("Commercial building", "buildings"),
("Traditional huts", "buildings"),
("Road", "infrastructure"),
("Street lights", "lighting"),
("Traffic lights", "infrastructure"),
("Bridges", "infrastructure"),

# 🎭 Decorative
("Paintings", "decor"),
("Musical instruments", "decor"),
("Seeds", "decor"),
("Cartoon elements", "decor"),
]

# 🌍 THEMES
themes = [
"Forest",
"Beach",
"Waterfall",
"Desert",
"Mountain",
"Seasons",
"Underwater",
"Cyberpunk",
"Space",
"Galaxy",
"Volcano",
"Luxury Marble",
"Gold Resin",
"Crystal Resin",

# 🏙 NEW
"City",
"Futuristic City",
"Cyberpunk City",
"Ancient Civilization",
]

# 🪑 SURFACES
surfaces = [
"Table",
"Floor",
"Wall",
"Countertop",
"Stairs",
"Bathroom",
"Kitchen Island",
"Reception Desk",
"Pool",
"Glass Panel",
"Garage Door",
"Ceiling"
]

# Insert assets
for name, category in assets:
    db.add(Asset(name=name, category=category))

# Insert themes
for name in themes:
    db.add(Theme(name=name))

# Insert surfaces
for name in surfaces:
    db.add(Surface(name=name))

db.commit()
db.close()

print("✅ Seed data inserted!")
