alert("REAL RENDER ACTIVE");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = 300;

let t = 0;

// 🎨 Better default epoxy palette
let palette = [
    [10, 20, 80],    // deep blue
    [0, 180, 255],   // cyan
    [255, 255, 255]  // white highlight
];

// 🔥 Multi-layer noise (THIS is the key difference)
function noise(x, y, t) {
    let n = 0;

    n += Math.sin(x * 0.01 + t);
    n += Math.cos(y * 0.01 - t * 0.7);
    n += Math.sin((x + y) * 0.008 + t * 0.5);
    n += Math.cos(Math.sqrt(x*x + y*y) * 0.02 - t);

    return n;
}

// 🎨 Color blending (more contrast)
function getColor(v) {
    const c1 = palette[0];
    const c2 = palette[1];
    const c3 = palette[2];

    // normalize value
    const n = (Math.sin(v) + 1) / 2;

    if (n < 0.5) {
        const t = n * 2;
        return [
            lerp(c1[0], c2[0], t),
            lerp(c1[1], c2[1], t),
            lerp(c1[2], c2[2], t)
        ];
    } else {
        const t = (n - 0.5) * 2;
        return [
            lerp(c2[0], c3[0], t),
            lerp(c2[1], c3[1], t),
            lerp(c2[2], c3[2], t)
        ];
    }
}

// ✨ Subtle swirl distortion (adds realism)
function distort(x, y, t) {
    return {
        x: x + Math.sin(y * 0.02 + t) * 10,
        y: y + Math.cos(x * 0.02 - t) * 10
    };
}

function draw() {
    const img = ctx.createImageData(canvas.width, canvas.height);

    for (let x = 0; x < canvas.width; x++) {
        for (let y = 0; y < canvas.height; y++) {

            const i = (x + y * canvas.width) * 4;

            // apply distortion
            const d = distort(x, y, t);

            // layered noise
            const n = noise(d.x, d.y, t * 0.4);

            const color = getColor(n);

            img.data[i]     = color[0];
            img.data[i + 1] = color[1];
            img.data[i + 2] = color[2];
            img.data[i + 3] = 255;
        }
    }

    ctx.putImageData(img, 0, 0);

    t += 0.01; // slower = thicker fluid feel
    requestAnimationFrame(draw);
}

// helper
function lerp(a, b, t) {
    return a + (b - a) * t;
}

draw();
