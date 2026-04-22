let animationId;

function applyColors(colors) {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  const w = canvas.width;
  const h = canvas.height;

  let time = 0;

  // stop previous animation
  if (animationId) cancelAnimationFrame(animationId);

  function draw() {
    ctx.clearRect(0, 0, w, h);

    // 🌑 deep background
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);

    // 🌌 flowing blobs
    colors.forEach((color, index) => {
      for (let i = 0; i < 4; i++) {
        const x = w / 2 + Math.sin(time * 0.5 + i + index) * 100;
        const y = h / 2 + Math.cos(time * 0.7 + i + index) * 100;

        const radius = 80 + Math.sin(time + i) * 30;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, "transparent");

        ctx.globalAlpha = 0.35;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // ⭐ twinkling stars
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const size = Math.random() * 1.5;

      ctx.globalAlpha = Math.random();
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;

    time += 0.02;
    animationId = requestAnimationFrame(draw);
  }

  draw();
}
