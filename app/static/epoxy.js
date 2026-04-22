function applyColors(colors) {
  const el = document.getElementById("canvas");

  if (!colors || colors.length < 2) {
    colors = ["#000000", "#222222"];
  }

  // 🌑 Deep space base
  let base = "linear-gradient(180deg, #000000, #020202)";

  // 🌌 Nebula layers (offset + stretched)
  let clouds = colors.map((c, i) => {
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const size = 60 + Math.random() * 40;

    return `radial-gradient(circle at ${x}% ${y}%, ${c} ${size}px, transparent 70%)`;
  }).join(",");

  // ⭐ Stars (random sizes + brightness)
  let stars = "";
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const size = Math.random() * 2 + 0.5;
    const opacity = Math.random() * 0.8 + 0.2;

    stars += `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,${opacity}) ${size}px, transparent ${size + 1}px),`;
  }

  // 🌫️ Depth fog layer
  let fog = "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.08), transparent 70%)";

  el.style.background = `
    ${stars}
    ${clouds},
    ${fog},
    ${base}
  `;

  el.style.backgroundBlendMode = "screen";
}
