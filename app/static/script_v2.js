alert("SCRIPT V2 RUNNING");

// Canvas setup
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = 300;

// State
let t = 0;
let currentStyle = {
    colors: ["#0a1aff", "#00cfff", "#ffffff"],
    intensity: 1
};

// 🎯 Step 2: Generate button → call backend
document.getElementById("generateBtn").onclick = async () => {
    const prompt = document.getElementById("promptInput").value;
    const theme = document.getElementById("themeSelect").value;

    try {
        const res = await fetch("/ai/generate-style", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ prompt, theme })
        });

        const data = await res.json();

        applyStyle(data);
    } catch (e) {
        console.log("AI route failed, using fallback theme");
        applyTheme(theme);
    }
};

// 🎯 Step 4: Theme fallback system
function applyTheme(theme) {
    if (theme === "ocean") {
        currentStyle.colors = ["#001f3f", "#0074D9", "#7FDBFF"];
    }
    else if (theme === "fire") {
        currentStyle.colors = ["#ff0000", "#ff6600", "#ffff00"];
    }
    else if (theme === "galaxy") {
        currentStyle.colors = ["#2c003e", "#6a00ff", "#ff00cc"];
    }
    else if (theme === "marble") {
        currentStyle.colors = ["#eeeeee", "#bbbbbb", "#777777"];
    }
}

// Apply AI style
function applyStyle(data) {
    if (data.colors) currentStyle.colors = data.colors;
    if (data.intensity) currentStyle.intensity = data.intensity;
}

// 🎯 Step 3: Better fluid renderer
function noise(x, y, t) {
    return Math.sin(x * 0.01 + t) +
           Math.cos(y * 0.01 + t) +
           Math.sin((x + y) * 0.005 + t * 0.5);
}

function draw() {
    const img = ctx.createImageData(canvas.width, canvas.height);

    const c1 = hexToRgb(currentStyle.colors[0]);
    const c2 = hexToRgb(currentStyle.colors[1]);
    const c3 = hexToRgb(currentStyle.colors[2]);

    for (let x = 0; x < canvas.width; x++) {
        for (let y = 0; y < canvas.height; y++) {
            const i = (x + y * canvas.width) * 4;

            const n = noise(x, y, t * currentStyle.intensity);

            const mix = (Math.sin(n) + 1) / 2;

            const r = lerp(c1.r, c2.r, mix);
            const g = lerp(c2.g, c3.g, mix);
            const b = lerp(c1.b, c3.b, mix);

            img.data[i] = r;
            img.data[i + 1] = g;
            img.data[i + 2] = b;
            img.data[i + 3] = 255;
        }
    }

    ctx.putImageData(img, 0, 0);
    t += 0.02;
    requestAnimationFrame(draw);
}

// Helpers
function lerp(a, b, t) {
    return a + (b - a) * t;
}

function hexToRgb(hex) {
    const bigint = parseInt(hex.replace("#", ""), 16);
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255
    };
}

// Start animation
draw();
