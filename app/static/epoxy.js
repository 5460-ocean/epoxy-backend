function applyColors(colors) {
  const el = document.getElementById("canvas");

  // fallback safety
  if (!colors || colors.length < 2) {
    colors = ["#00c6ff", "#003366"];
  }

  // build multiple layers
  let layers = "";

  colors.forEach((c, i) => {
    const x = Math.random() * 100;
    const y = Math.random() * 100;

    layers += `radial-gradient(circle at ${x}% ${y}%, ${c}, transparent 60%),`;
  });

  el.style.background = `
    ${layers}
    linear-gradient(135deg, ${colors[0]}, ${colors[1]})
  `;

  el.style.backgroundBlendMode = "screen";
}
