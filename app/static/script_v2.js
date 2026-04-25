const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let t = 0;

let colors = ["#00c6ff", "#003366"];
let amplitude = 20;
let speed = 0.05;
let type = "waves";

document.getElementById("generateBtn").addEventListener("click", generate);

async function generate() {
    const prompt = document.getElementById("prompt").value;

    const res = await fetch("/ai/generate-style", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ prompt })
    });

    const data = await res.json();

    colors = data.colors;
    amplitude = data.amplitude;
    speed = data.speed;
    type = data.type;
}

function draw() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // 🔥 MULTI-LAYER GRADIENT (depth)
    let gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(0.5, "#111");
    gradient.addColorStop(1, colors[1]);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // 🌊 WAVES (soft epoxy flow)
    if (type === "waves") {
        for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.lineWidth = 3;
            ctx.strokeStyle = `rgba(255,255,255,${0.05 * i})`;

            for (let x = 0; x < w; x++) {
                let y = h/2 +
                    Math.sin(x * 0.01 + t + i) * amplitude +
                    Math.cos(x * 0.02 + t) * 10;

                ctx.lineTo(x, y);
            }

            ctx.stroke();
        }
    }

    // 🌌 SWIRL (galaxy epoxy)
    if (type === "swirl") {
        for (let i = 0; i < 300; i++) {
            let angle = i * 0.1 + t;
            let r = i * 0.6;

            let x = w/2 + Math.cos(angle) * r;
            let y = h/2 + Math.sin(angle) * r;

            ctx.fillStyle = `rgba(255,255,255,0.3)`;
            ctx.fillRect(x, y, 2, 2);
        }
    }

    // 🔥 CHAOS (fire epoxy)
    if (type === "chaos") {
        for (let i = 0; i < 200; i++) {
            let x = Math.random() * w;
            let y = Math.random() * h;

            ctx.fillStyle = colors[i % 2];
            ctx.fillRect(x, y, 2, 2);
        }
    }

    // ✨ SOFT BLUR overlay (epoxy feel)
    ctx.fillStyle = "rgba(255,255,255,0.02)";
    ctx.fillRect(0, 0, w, h);

    t += speed;
    requestAnimationFrame(draw);
}

draw();
