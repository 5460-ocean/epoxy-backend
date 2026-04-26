alert("EPOXY REALISM V1");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = 300;

let t = 0;
let theme = "ocean";

// 🎨 THEMES
const themes = {
    ocean: [
        [10, 30, 120],
        [0, 200, 255],
        [255, 255, 255]
    ],
    fire: [
        [120, 10, 0],
        [255, 80, 0],
        [255, 220, 0]
    ],
    galaxy: [
        [20, 0, 40],
        [120, 0, 255],
        [255, 0, 200]
    ],
    marble: [
        [230, 230, 230],
        [180, 180, 180],
        [80, 80, 80]
    ]
};

// 🔥 multi-layer noise (depth)
function noise(x, y, t) {
    let n = 0;
    n += Math.sin(x * 0.02 + t);
    n += Math.cos(y * 0.02 - t * 0.7);
    n += Math.sin((x + y) * 0.01 + t * 0.5);
    n += Math.cos(Math.sqrt(x*x + y*y) * 0.02 - t);
    return n;
}

// 🧱 layer blending (simulates poured resin layers)
function layeredNoise(x, y, t) {
    return (
        noise(x, y, t) * 0.6 +
        noise(x * 1.5, y * 1.5, t * 1.2) * 0.3 +
        noise(x * 3, y * 3, t * 2) * 0.1
    );
}

// 🪨 marble veins (sharp contrast lines)
function veins(x, y, t) {
    const v = Math.sin((x + noise(x, y, t) * 20) * 0.05);
    return Math.abs(v);
}

// ✨ glossy highlight
function highlight(x, y) {
    const dx = x - canvas.width / 2;
    const dy = y - canvas.height / 2;
    const dist = Math.sqrt(dx * dx + dy * dy);

    return Math.max(0, 1 - dist / 400);
}

// 🎨 color blending
function getColor(v, vein, light) {
    const p = themes[theme];

    const base = (Math.sin(v) + 1) / 2;

    let r, g, b;

    if (base < 0.5) {
        const t = base * 2;
        r = lerp(p[0][0], p[1][0], t);
        g = lerp(p[0][1], p[1][1], t);
        b = lerp(p[0][2], p[1][2], t);
    } else {
        const t = (base - 0.5) * 2;
        r = lerp(p[1][0], p[2][0], t);
        g = lerp(p[1][1], p[2][1], t);
        b = lerp(p[1][2], p[2][2], t);
    }

    // 🪨 apply veins (dark streaks)
    r *= (1 - vein * 0.5);
    g *= (1 - vein * 0.5);
    b *= (1 - vein * 0.5);

    // ✨ apply glossy highlight
    r += 255 * light * 0.2;
    g += 255 * light * 0.2;
    b += 255 * light * 0.2;

    return [r, g, b];
}

// ✨ swirl distortion (fluid motion)
function distort(x, y, t) {
    return {
        x: x + Math.sin(y * 0.04 + t) * 25,
        y: y + Math.cos(x * 0.04 - t) * 25
    };
}

// 🎬 render
function draw() {
    const img = ctx.createImageData(canvas.width, canvas.height);

    for (let x = 0; x < canvas.width; x++) {
        for (let y = 0; y < canvas.height; y++) {

            const i = (x + y * canvas.width) * 4;

            const d = distort(x, y, t);

            const n = layeredNoise(d.x, d.y, t);
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

    t += 0.015;
    requestAnimationFrame(draw);
}

// helper
function lerp(a, b, t) {
    return a + (b - a) * t;
}

// 🎯 button = switch themes (for now)
document.getElementById("generateBtn").onclick = () => {
    const keys = Object.keys(themes);
    theme = keys[Math.floor(Math.random() * keys.length)];
};

draw();
