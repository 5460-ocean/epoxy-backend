let animationId;

function applyColors(colors, theme = "") {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  const w = canvas.width;
  const h = canvas.height;

  let time = 0;

  if (animationId) cancelAnimationFrame(animationId);

  theme = theme.toLowerCase();

  function draw() {
    ctx.clearRect(0, 0, w, h);

    // background
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);

    // 🌊 OCEAN (SMOOTH + LIGHTWEIGHT)
    if (theme.includes("ocean") || theme.includes("wave") || theme.includes("water")) {

      ctx.filter = "blur(4px)"; // 👈 lighter blur = no lag

      colors.forEach((color, i) => {
        for (let y = 0; y < h; y += 12) {

          const wave = Math.sin((y * 0.04) + time * 2 + i) * 15;

          // gradient = smooth edge
          const gradient = ctx.createLinearGradient(0, y, 0, y + 30);
          gradient.addColorStop(0, color);
          gradient.addColorStop(1, "transparent");

          ctx.globalAlpha = 0.25;
          ctx.fillStyle = gradient;

          ctx.beginPath();
          ctx.moveTo(0, y + wave);
          ctx.lineTo(w, y - wave);
          ctx.lineTo(w, y + 30);
          ctx.lineTo(0, y + 30);
          ctx.closePath();
          ctx.fill();
        }
      });

      ctx.filter = "none";
    }

    // 🌌 GALAXY (unchanged, stable)
    else if (theme.includes("space") || theme.includes("galaxy")) {

      ctx.filter = "blur(10px)";

      colors.forEach((color, index) => {
        for (let i = 0; i < 4; i++) {
          const x = w / 2 + Math.sin(time + i + index) * 100;
          const y = h / 2 + Math.cos(time + i) * 100;

          const radius = 60 + Math.sin(time + i) * 40;

          const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
          gradient.addColorStop(0, color);
          gradient.addColorStop(1, "transparent");

          ctx.globalAlpha = 0.3;
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      ctx.filter = "none";

      // stars
      for (let i = 0; i < 60; i++) {
        const x = (i * 37) % w;
        const y = (i * 83) % h;

        ctx.globalAlpha = 0.5 + Math.sin(time + i) * 0.5;
        ctx.fillStyle = "white";
        ctx.fillRect(x, y, 1.5, 1.5);
      }
    }

    ctx.globalAlpha = 1;

    time += 0.015;
    animationId = requestAnimationFrame(draw);
  }

  draw();
}
