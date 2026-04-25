const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let t = 0;
let type = "ocean";
let colors = ["#1CA7EC", "#023E8A"];

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

// smooth flow function (key difference)
function flow(x, y, t) {
    return Math.sin(x * 0.01 + t) + Math.cos(y * 0.01 + t * 0.7);
}

function draw() {
    const w = canvas.width;
    const h = canvas.height;

    let img = ctx.createImageData(w, h);

    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {

            let fx = x;
            let fy = y;

            // 🌊 OCEAN = horizontal flow
            if (type === "waves") {
                fy += flow(x, y, t) * 20;
            }

            // 🔥 FIRE = upward flow
            if (type === "chaos") {
                fy -= t * 40;
                fx += flow(x, y, t) * 15;
            }

            // 🌌 GALAXY = rotational flow
            if (type === "swirl") {
                let dx = x - w/2;
                let dy = y - h/2;

                let angle = Math.atan2(dy, dx) + t * 0.2;
                let dist = Math.sqrt(dx*dx + dy*dy);

                fx = w/2 + Math.cos(angle) * dist;
                fy = h/2 + Math.sin(angle) * dist;
            }

            // smooth blend
            let mix = (Math.sin(fx * 0.02 + fy * 0.02) + 1) / 2;

            let r1 = parseInt(colors[0].substring(1,3),16);
            let g1 = parseInt(colors[0].substring(3,5),16);
            let b1 = parseInt(colors[0].substring(5,7),16);

            let r2 = parseInt(colors[1].substring(1,3),16);
            let g2 = parseInt(colors[1].substring(3,5),16);
            let b2 = parseInt(colors[1].substring(5,7),16);

            let r = r1 * mix + r2 * (1-mix);
            let g = g1 * mix + g2 * (1-mix);
            let b = b1 * mix + b2 * (1-mix);

            // soft highlight
            let light = Math.pow(Math.max(0, Math.sin(fx * 0.03 + t)), 6);
            r += light * 180;
            g += light * 180;
            b += light * 180;

            let i = (y * w + x) * 4;
            img.data[i] = r;
            img.data[i+1] = g;
            img.data[i+2] = b;
            img.data[i+3] = 255;
        }
    }

    ctx.putImageData(img, 0, 0);

    t += 0.05;
    requestAnimationFrame(draw);
}

draw();
