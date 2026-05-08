
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# 🔥 THIS LINE FIXES EVERYTHING
app.mount("/static", StaticFiles(directory="app/static"), name="static")

@app.get("/")
def home():
    return {"message": "API running"}

@app.get("/app", response_class=HTMLResponse)
def app_page():
    return """
    <!DOCTYPE html>
    <html>
    <body style="margin:0;background:#0b0f1a;color:white;text-align:center;">

    <h1>Epoxy Generator</h1>

    <input placeholder="Describe epoxy style..." />

    <canvas id="canvas" style="
        width:100%;
        height:300px;
        display:block;
        background:black;
        margin-top:20px;
    "></canvas>

    <div style="margin-top:20px;">
        <button>Generate</button>
        <button>Download</button>
    </div>

    <!-- ✅ FIXED PATH -->
    <script src="/static/script_v4.js"></script>

    </body>
    </html>
    """

@app.route("/app/v5")
def app_v5():
    return render_template("app_v5.html")



@app.route("/app/v5")
def app_v5():
    return render_template("app_v5.html")



@app.get("/app/v5", response_class=HTMLResponse)
async def app_v5():
    return """
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Epoxy Shader V5</title>

<style>
html, body {
    margin: 0;
    overflow: hidden;
    background: black;
}

canvas {
    width: 100vw;
    height: 100vh;
    display: block;
}
</style>
</head>

<body>

<canvas id="glcanvas"></canvas>

<script src="/static/script_v5.js"></script>

</body>
</html>
"""
"""
