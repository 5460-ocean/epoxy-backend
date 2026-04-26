alert("EPOXY V2 FIXED");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = 300;

let t = 0;
let theme = "ocean";

// 🎨 CLEAN THEMES (fixed colors)
const themes = {
    ocean: [
        [0, 60, 150],
        [0, 180, 255],
        [200, 240, 255]
    ],
    fire: [
        [120, 0, 0],
        [255, 80, 0],
        [255, 200, 0]
    ],
    galaxy: [
        [10, 0, 40],
        [80, 0, 150],
        [255, 0, 200]
    ],
    marble: [
        [240, 240, 240],
        [200, 200, 200],
        [100, 100, 100]
    ]
};

// 🔥 stronger noise = visible motion
function noise(x, y, t) {
    return Math.sin(x * 0.03 + t * 1.5) +
           Math.cos(y * 0.03 - t * 1.2) +
           Math.sin((x + y) * 0.02 + t);
}

// 🧱 layered depth
function layered(x, y, t) {
    return (
        noise(x, y, t) * 0.6 +
        noise(x * 1.8, y * 1.8, t * 1.3) * 0.4
    );
}

// 🪨 veins (lighter, not overpowering)
function veins(x, y, t) {
    return Math.abs(Math.sin(x * 0.05 + noise(x,y,t)));
}

// ✨ FIXED highlight (subtle, not washing color)
function highlight(x, y) {
    const dx = x - canvas.width / 2;
    const dy = y - canvas.height / 2;
    const d = Math.sqrt(dx*dx + dy*dy);
    return Math.max(0, 1 - d / 500);
}

// 🎨 TRUE color interpolation (no weird purple mixing)
function blend(c1, c2, t) {
    return [
        c1[0] + (c2[0] - c1[0]) * t,
        c1[1] + (c2[1] - c1[1]) * t,
        c1[2] + (c2[2] - c1[2]) * t
    ];
}

// 🎨 FIXED color logic
function getColor(v, vein, light) {
    const p = themes[theme];

    let base = (Math.sin(v) + 1) / 2;

    let c;
    if (base < 0.5) {
        c = blend(p[0], p[1], base * 2);
    } else {
        c = blend(p[1], p[2], (base - 0.5) * 2);
    }

    // veins (darken slightly)
    c[0] *= (1 - vein * 0.3);
    c[1] *= (1 - vein * 0.3);
    c[2] *= (1 - vein * 0.3);

    // highlight (lighten slightly)
    c[0] += 50 * light;
    c[1] += 50 * light;
    c[2] += 50 * light;

    return c;
}

// 🔥 STRONGER motion distortion
function distort(x, y, t) {
    return {
        x: x + Math.sin(y * 0.05 + t * 2) * 40,
        y: y + Math.cos(x * 0.05 - t * 2) * 40
    };
}

// 🎬 render loop
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

    t += 0.05; // 🔥 MUCH more visible motion
    requestAnimationFrame(draw);
}

// 🎯 theme switch
document.getElementById("generateBtn").onclick = () => {
    const keys = Object.keys(themes);
    theme = keys[Math.floor(Math.random() * keys.length)];
};

draw();
