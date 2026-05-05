const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");

canvas.width = window.innerWidth;
canvas.height = 300;
gl.viewport(0, 0, canvas.width, canvas.height);

const vs = `
attribute vec2 p;
void main(){
  gl_Position = vec4(p,0.0,1.0);
}
`;

const fs = `
precision highp float;

void main(){
  gl_FragColor = vec4(1.0,0.0,0.0,1.0); // PURE RED
}
`;

function compile(type,src){
  const s = gl.createShader(type);
  gl.shaderSource(s,src);
  gl.compileShader(s);

  if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)){
    alert(gl.getShaderInfoLog(s));
  }

  return s;
}

const prog = gl.createProgram();
gl.attachShader(prog, compile(gl.VERTEX_SHADER,vs));
gl.attachShader(prog, compile(gl.FRAGMENT_SHADER,fs));
gl.linkProgram(prog);

if(!gl.getProgramParameter(prog, gl.LINK_STATUS)){
  alert(gl.getProgramInfoLog(prog));
}

gl.useProgram(prog);

const buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
  -1,-1, 1,-1, -1,1,
  -1,1, 1,-1, 1,1
]), gl.STATIC_DRAW);

const loc = gl.getAttribLocation(prog,"p");
gl.enableVertexAttribArray(loc);
gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);

gl.drawArrays(gl.TRIANGLES,0,6);
