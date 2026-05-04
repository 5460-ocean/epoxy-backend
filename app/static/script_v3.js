alert("SCRIPT RUNNING FINAL CHECK");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = 300;

// 🔴 HARD RED DRAW (no WebGL)
ctx.fillStyle = "red";
ctx.fillRect(0, 0, canvas.width, canvas.height);
