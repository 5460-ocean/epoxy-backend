const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let t = 0;

function draw() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // 🌊 animated gradient (waves)
    let gradient = ctx.createLinearGradient(
        0,
        0,
        w,
        h + Math.sin(t) * 80
    );

    gradient.addColorStop(0, "#001f3f");
    gradient.addColorStop(0.5, "#0074D9");
    gradient.addColorStop(1, "#7FDBFF");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // 🌊 flowing wave lines
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();

        for (let x = 0; x < w; x++) {
            let y =
                h / 2 +
                Math.sin(x * 0.02 + t + i) * 20 +
                i * 10;

            ctx.lineTo(x, y);
        }

        ctx.strokeStyle = "rgba(255,255,255,0.05)";
        ctx.stroke();
    }

    t += 0.08; // ⚡ faster motion
    requestAnimationFrame(draw);
}

draw();
