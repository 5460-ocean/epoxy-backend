function applyColors(colors) {
  const el = document.getElementById("canvas");

  if (!colors || colors.length < 2) {
    colors = ["#000000", "#222222"];
  }

  // Base dark background (space)
  let base = "linear-gradient(180deg, #000000, #050505)";

  // Color clouds
  let layers = colors.map(c => {
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    return `radial-gradient(circle at ${x}% ${y}%, ${c}, transparent 60%)`;
  }).join(",");

  // ⭐ Star layer
  let stars = "";
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    stars += `radial-gradient(circle at ${x}% ${y}%, white 1px, transparent 2px),`;
  }

  el.style.background = `
    ${stars}
    ${layers},
    ${base}
  `;

  el.style.backgroundBlendMode = "screen";
}
