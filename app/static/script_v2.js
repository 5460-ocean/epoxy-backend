alert("EPOXY V3 COLOR FIX");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = 300;

let t = 0;
let theme = "ocean";

// 🎨 STRICT palettes (no weird mixes)
const themes = {
    ocean: [
        [0, 80, 200],
        [0, 150, 255],
        [180, 230, 255]
    ],
    fire: [
        [180, 20, 0],
        [255, 100, 0],
        [255, 200, 0]
    ],
    galaxy: [
        [30, 0, 60],
        [120, 0, 200],
        [255, 0, 150]
    ],
    marble: [
        [240, 240, 240],
        [200, 200, 200],
        [120, 120, 120]
    ]
};

// 🔥 STRUCTURE ONLY (not color)
function noise(x, y, t) {
    return Math.sin(x * 0.03 + t) +
           Math.cos(y * 0.03 - t) +
           Math.sin((x + y) * 0.02 + t);
}

// 🧱 layered structure
function layered(x, y, t) {
    return (
        noise(x, y, t) * 0.6 +
        noise(x * 2, y * 2, t * 1.5) * 0.4
    );
}

// 🪨 veins
function veins(x, y, t) {
    return Math.abs(Math.sin(x * 0.05 + noise(x,y,t)));
}

// ✨ highlight (reduced)
function highlight(x, y) {
    const dx = x - canvas.width / 2;
    const dy = y - canvas.height / 2;
    const d = Math.sqrt(dx*dx + dy*dy);
    return Math.max(0, 1 - d / 600);
}

// 🎨 HARD palette mapping (this fixes color issue)
function getColor(v, vein, light) {
    const p = themes[theme];

    // normalize noise
    let n = (v + 3) / 6; // normalize approx range

    if (n < 0) n = 0;
    if (n > 1) n = 1;

    let c;

    if (n < 0.5) {
        const t = n * 2;
        c = [
            p[0][0] + (p[1][0] - p[0][0]) * t,
            p[0][1] + (p[1][1] - p[0][1]) * t,
            p[0][2] + (p[1][2] - p[0][2]) * t
        ];
    } else {
        const t = (n - 0.5) * 2;
        c = [
            p[1][0] + (p[2][0] - p[1][0]) * t,
            p[1][1] + (p[2][1] - p[1][1]) * t,
            p[1][2] + (p[2][2] - p[1][2]) * t
        ];
    }

    // veins (controlled)
    const veinStrength = 0.25;
    c[0] *= (1 - vein * veinStrength);
    c[1] *= (1 - vein * veinStrength);
    c[2] *= (1 - vein * veinStrength);

    // highlight (subtle)
    const h = light * 40;
    c[0] += h;
    c[1] += h;
    c[2] += h;

    // clamp (VERY IMPORTANT)
    c[0] = Math.min(255, Math.max(0, c[0]));
    c[1] = Math.min(255, Math.max(0, c[1]));
    c[2] = Math.min(255, Math.max(0, c[2]));

    return c;
}

// 🔥 motion
function distort(x, y, t) {
    return {
        x: x + Math.sin(y * 0.05 + t * 2) * 40,
        y: y + Math.cos(x * 0.05 - t * 2) * 40
    };
}

// 🎬 render
function draw() {
    const img = ctx.createImageData(canvas.width, canvas.height);

    for (let x = 0; x < canvas.width; x++) {
        for (let y = 0; y < canvas.height; y++) {

            const i = (x + y * canvas.width) * 4;

            const d = distort(x, y, t);

            const n = layered(d.x, d.y, t);
            const v = veins(d.x, d.y, t);
            const l = highlight(x, y);

            const c = getColor(n, v, l);

            img.data[i]     = c[0];
            img.data[i + 1] = c[1];
            img.data[i + 2] = c[2];
            img.data[i + 3] = 255;
        }
    }

    ctx.putImageData(img, 0, 0);

    t += 0.05;
    requestAnimationFrame(draw);
}

// 🎯 switch themes
document.getElementById("generateBtn").onclick = () => {
    const keys = Object.keys(themes);
    theme = keys[Math.floor(Math.random() * keys.length)];
};

draw();
