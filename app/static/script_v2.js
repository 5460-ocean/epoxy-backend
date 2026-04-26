alert("ANIMATION ACTIVE");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = 300;

let t = 0;

// 🎨 palette (will change later with themes)
let palette = [
    [10, 20, 80],
    [0, 180, 255],
    [255, 255, 255]
];

// 🔥 layered noise = motion
function noise(x, y, t) {
    return Math.sin(x * 0.02 + t) +
           Math.cos(y * 0.02 - t) +
           Math.sin((x + y) * 0.01 + t);
}

// 🎨 color blending
function getColor(v) {
    const n = (Math.sin(v) + 1) / 2;

    const c1 = palette[0];
    const c2 = palette[1];
    const c3 = palette[2];

    if (n < 0.5) {
        const k = n * 2;
        return [
            lerp(c1[0], c2[0], k),
            lerp(c1[1], c2[1], k),
            lerp(c1[2], c2[2], k)
        ];
    } else {
        const k = (n - 0.5) * 2;
        return [
            lerp(c2[0], c3[0], k),
            lerp(c2[1], c3[1], k),
            lerp(c2[2], c3[2], k)
        ];
    }
}

// ✨ swirl distortion (this creates flow)
function distort(x, y, t) {
    return {
        x: x + Math.sin(y * 0.05 + t) * 20,
        y: y + Math.cos(x * 0.05 - t) * 20
    };
}

// 🎬 animation loop (THIS was missing before)
function draw() {
    const img = ctx.createImageData(canvas.width, canvas.height);

    for (let x = 0; x < canvas.width; x++) {
        for (let y = 0; y < canvas.height; y++) {

            const i = (x + y * canvas.width) * 4;

            const d = distort(x, y, t);
            const n = noise(d.x, d.y, t);

            const color = getColor(n);

            img.data[i]     = color[0];
            img.data[i + 1] = color[1];
            img.data[i + 2] = color[2];
            img.data[i + 3] = 255;
        }
    }

    ctx.putImageData(img, 0, 0);

    t += 0.03; // speed of motion
    requestAnimationFrame(draw);
}

// helper
function lerp(a, b, t) {
    return a + (b - a) * t;
}

// 🚀 START animation
draw();

// 🎯 Hook generate button (basic test)
document.getElementById("generateBtn").onclick = () => {
    // change palette randomly so you SEE change
    palette = [
        [Math.random()*255, Math.random()*255, Math.random()*255],
        [Math.random()*255, Math.random()*255, Math.random()*255],
        [Math.random()*255, Math.random()*255, Math.random()*255]
    ];
};
