const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let t = 0;

let colors = ["#1CA7EC", "#023E8A"];
let type = "ocean";

// ===== GENERATE =====
document.getElementById("generateBtn").addEventListener("click", generate);

async function generate() {
    const prompt = document.getElementById("prompt").value.toLowerCase();

    const res = await fetch("/ai/generate-style", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ prompt })
    });

    const data = await res.json();

    colors = data.colors;
    type = data.type;
}

// ===== NOISE =====
function noise(x, y, t) {
    return Math.sin(x * 0.01 + t) + Math.cos(y * 0.01 + t);
}

// ===== DRAW =====
function draw() {
    const w = canvas.width;
    const h = canvas.height;

    let img = ctx.createImageData(w, h);

    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {

            let nx = x;
            let ny = y;

            // ===== STYLE PHYSICS =====

            // 🌊 OCEAN
            if (type === "waves") {
                ny += Math.sin(x * 0.02 + t) * 20;
                nx += noise(x, y, t) * 10;
            }

            // 🔥 FIRE
            if (type === "chaos") {
                ny -= t * 30; // upward motion
                nx += noise(x, y, t) * 15;
            }

            // 🌌 GALAXY
            if (type === "swirl") {
                let dx = x - w/2;
                let dy = y - h/2;

                let angle = Math.atan2(dy, dx) + t * 0.2;
                let dist = Math.sqrt(dx*dx + dy*dy);

                nx = w/2 + Math.cos(angle) * dist;
                ny = h/2 + Math.sin(angle) * dist;
            }

            // ===== COLOR BLEND =====
            let mix = (Math.sin(nx * 0.02 + ny * 0.02) + 1) / 2;

            let r1 = parseInt(colors[0].substring(1,3),16);
            let g1 = parseInt(colors[0].substring(3,5),16);
            let b1 = parseInt(colors[0].substring(5,7),16);

            let r2 = parseInt(colors[1].substring(1,3),16);
            let g2 = parseInt(colors[1].substring(3,5),16);
            let b2 = parseInt(colors[1].substring(5,7),16);

            let r = r1 * mix + r2 * (1-mix);
            let g = g1 * mix + g2 * (1-mix);
            let b = b1 * mix + b2 * (1-mix);

            // ===== DEPTH LAYER (epoxy thickness) =====
            let depth = Math.sin((nx + ny) * 0.01 + t) * 0.5 + 0.5;
            r *= 0.7 + depth * 0.6;
            g *= 0.7 + depth * 0.6;
            b *= 0.7 + depth * 0.6;

            // ===== LIGHT REFLECTION =====
            let light = Math.pow(Math.max(0, Math.sin(nx * 0.05 + t)), 6);
            r += light * 200;
            g += light * 200;
            b += light * 200;

            let i = (y * w + x) * 4;
            img.data[i] = r;
            img.data[i+1] = g;
            img.data[i+2] = b;
            img.data[i+3] = 255;
        }
    }

    ctx.putImageData(img, 0, 0);

    // ===== BLUR PASS (epoxy softness) =====
    ctx.globalAlpha = 0.08;
    ctx.drawImage(canvas, 1, 1);
    ctx.drawImage(canvas, -1, -1);
    ctx.globalAlpha = 1;

    t += 0.05;
    requestAnimationFrame(draw);
}

draw();
