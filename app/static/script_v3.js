alert("NOW USING ROOT INDEX.HTML");

const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");

canvas.width = window.innerWidth;
canvas.height = 300;

gl.viewport(0,0,canvas.width,canvas.height);

// 🔴 FULL RED SCREEN
gl.clearColor(1,0,0,1);
gl.clear(gl.COLOR_BUFFER_BIT);
