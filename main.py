
from fastapi.responses import HTMLResponse
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

<script src="/static/script_v5.js?v=9"></script>

</body>
</html>
"""

@app.get("/app/v6", response_class=HTMLResponse)
def app_v6():

    return """
<!DOCTYPE html>
<html lang="en">

<head>

<meta charset="UTF-8">

<meta name="viewport"
content="width=device-width, initial-scale=1.0">

<title>Epoxy Shader V6</title>

<style>

html, body {

    margin: 0;
    padding: 0;

    overflow: hidden;

    background: black;

    width: 100%;
    height: 100%;
}

canvas {

    width: 100vw;
    height: 100vh;

    display: block;
}

.ui {

    position: fixed;

    top: 20px;
    left: 20px;

    z-index: 10;

    display: flex;

    gap: 10px;

    flex-wrap: wrap;
}

@app.get("/app/v8" , response_class=HTMLResponse)
def app_v8():

    return HTMLResponse(
"""
button {

    background: rgba(0,0,0,0.55);

    color: white;

    border: 1px solid rgba(255,255,255,0.15);

    padding: 10px 16px;

    border-radius: 12px;

    backdrop-filter: blur(12px);

    cursor: pointer;

    font-size: 14px;
}

</style>

</head>

<body>

<div class="ui">

<button>Generate</button>

<button>Randomize</button>

<button>Save</button>

<button>Load</button>

<button>Download</button>

</div>

<canvas id="glcanvas"></canvas>

<script src="/static/script_v6.js?v=1"></script>

</body>
</html>
"""

@app.get("/app/v7", response_class=HTMLResponse)
def app_v7():

    return """

<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="UTF-8">

<meta name="viewport"
content="width=device-width, initial-scale=1.0">

<title>Epoxy Shader V7</title>

<style>

html, body {

    margin: 0;
    padding: 0;

    overflow: hidden;

    background: black;

    width: 100%;
    height: 100%;
}

canvas {

    width: 100vw;
    height: 100vh;

    display: block;
}

.ui {

    position: fixed;

    top: 20px;
    left: 20px;

    z-index: 10;

    display: flex;

    gap: 10px;

    flex-wrap: wrap;
}

button {

    background: rgba(0,0,0,0.55);

    color: white;

    border:
    1px solid rgba(255,255,255,0.15);

    padding: 10px 16px;

    border-radius: 12px;

    backdrop-filter: blur(12px);

    cursor: pointer;

    font-size: 14px;
}

</style>

</head>

<body>

<div class="ui">

<button>Generate</button>

<button>Randomize</button>

<button>Save</button>

<button>Load</button>

<button>Download</button>

</div>

<canvas id="glcanvas"></canvas>

<script src="/static/script_v7.js?v=1"></script>

</body>

</html>

"""

@app.get("/app/v8", response_class=HTMLResponse)
async def app_v8():
    return """
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Epoxy Fluid V8</title>

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

.ui {
    position: fixed;
    top: 16px;
    left: 16px;
    z-index: 10;
    display: flex;
    gap: 10px;
}

button {
    background: rgba(0,0,0,0.5);
    color: white;
    border: 1px solid rgba(255,255,255,0.15);
    padding: 10px 14px;
    border-radius: 10px;
}

</style>
</head>

<body>

<div class="ui">
<button>Generate</button>
<button>Randomize</button>
<button>Save</button>
<button>Load</button>
<button>Download</button>
</div>

<canvas id="glcanvas"></canvas>

<script src="/static/script_v8.js"></script>

</body>
</html>
"""

