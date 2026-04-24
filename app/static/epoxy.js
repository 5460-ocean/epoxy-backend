const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let t = 0;
let colors = ["#000000", "#111111"]; // default fallback

// 🔥 FETCH STYLE FROM API
async function generateStyle(prompt) {
    try {
        const res = await fetch("/ai/generate-style", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ prompt })
        });

        const data = await res.json();

        if (data.colors && data.colors.length >= 2) {
            colors = data.colors;
        }

    } catch (e) {
        console.error("AI error", e);
    }
}

// 🎨 DRAW LOOP
function draw() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // 🌈 USE API COLORS
    let gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // 🌊 SIMPLE MOTION
    ctx.beginPath();
    for (let x = 0; x < w; x++) {
        let y = h / 2 + Math.sin(x * 0.02 + t) * 20;
        ctx.lineTo(x, y);
    }

    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.stroke();

    t += 0.05;
    requestAnimationFrame(draw);
}

draw();

// 🔥 CONNECT INPUT (IMPORTANT)
window.generate = function () {
    const input = document.getElementById("prompt").value;
    generateStyle(input);
};
