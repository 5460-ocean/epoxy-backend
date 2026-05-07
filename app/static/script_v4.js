const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");

canvas.width = window.innerWidth;
canvas.height = 300;

gl.viewport(0,0,canvas.width,canvas.height);

const vs = `
attribute vec2 p;
varying vec2 vUv;

void main(){
  vUv = p * 0.5 + 0.5;
  gl_Position = vec4(p,0.0,1.0);
}
`;

const fs = `
precision highp float;

uniform float t;
varying vec2 vUv;

float hash(vec2 p){
  return fract(
    sin(dot(p,vec2(127.1,311.7)))
    * 43758.5453123
  );
}

float noise(vec2 p){

  vec2 i = floor(p);
  vec2 f = fract(p);

  float a = hash(i);
  float b = hash(i + vec2(1.0,0.0));
  float c = hash(i + vec2(0.0,1.0));
  float d = hash(i + vec2(1.0,1.0));

  vec2 u = f*f*(3.0-2.0*f);

  return mix(a,b,u.x)
      + (c-a)*u.y*(1.0-u.x)
      + (d-b)*u.x*u.y;
}

float fbm(vec2 p){

  float v = 0.0;
  float a = 0.5;

  for(int i=0;i<6;i++){

    v += a * noise(p);

    p *= 2.0;

    a *= 0.5;
  }

  return v;
}

void main(){

  vec2 uv = vUv;

  // 🔥 DIAGONAL FLOW
  uv += vec2(t*0.05, t*0.025);

  // slight rotation
  mat2 rot = mat2(
    0.8, -0.6,
    0.6,  0.8
  );

  vec2 p = rot * (uv * 3.0);

  // fluid distortion
  for(int i=0;i<5;i++){

    vec2 d = vec2(
      fbm(p + vec2(0.0,t*0.03)),
      fbm(p + vec2(4.0,t*0.03))
    );

    p += (d - 0.5) * 0.35;
  }

  float h = fbm(p);

  // ===== NORMALS =====

  float e = 0.002;

  float hx = fbm(p + vec2(e,0.0));
  float hy = fbm(p + vec2(0.0,e));

  vec3 normal =
      normalize(vec3(h-hx,h-hy,0.02));

  vec3 light =
      normalize(vec3(0.5,0.3,1.0));

  float diff =
      clamp(dot(normal,light),0.0,1.0);

  // ===== BASE COLORS =====

  vec3 deep =
      vec3(0.01,0.02,0.05);

  vec3 mid =
      vec3(0.0,0.18,0.32);

  vec3 high =
      vec3(0.1,0.65,0.95);

  vec3 col = mix(
    deep,
    mid,
    smoothstep(0.2,0.7,h)
  );

  col = mix(
    col,
    high,
    smoothstep(0.55,0.85,h)
  );

  // ===== PIGMENTS =====

  float pigment = fbm(p*8.0);

  vec3 pigmentColor =
      vec3(0.0,0.45,0.8)
      * pigment
      * 0.25;

  col += pigmentColor;

  // ===== METALLIC FLAKES =====

  float flakes =
      pow(fbm(p*25.0), 18.0);

  col += flakes
      * vec3(0.8,0.9,1.0)
      * 0.15;

  // ===== GOLD VEINS =====

  float veinField =
      fbm(p*5.0 + 20.0);

  // stronger luxury veins
  float veins =
      smoothstep(0.68,0.73,veinField)
    - smoothstep(0.73,0.80,veinField);

  // clustered placement
  float cluster =
      smoothstep(
        0.55,
        0.8,
        fbm(p*1.5)
      );

  veins *= cluster;

  vec3 gold =
      vec3(1.0,0.78,0.25);

  // richer gold
  col = mix(
    col,
    gold,
    veins * 2.8
  );

  // glowing metallic edge
  col += veins
      * vec3(1.0,0.85,0.35)
      * 0.35;

  // ===== BLACK CRACKS =====

  float cracks =
      smoothstep(0.49,0.5,h)
    - smoothstep(0.5,0.51,h);

  col = mix(
    col,
    vec3(0.0),
    cracks * 0.9
  );

  // ===== METALLIC LIGHTING =====

  vec3 viewDir =
      vec3(0.0,0.0,1.0);

  vec3 halfVec =
      normalize(light + viewDir);

  // 🔥 anisotropic reflections
  float anisotropic =
      pow(
        abs(
          dot(
            normalize(
              vec3(
                normal.x * 2.0,
                normal.y * 0.2,
                normal.z
              )
            ),
            halfVec
          )
        ),
        180.0
      );

  float spec = anisotropic;

  // fresnel reflection
  float fresnel =
      pow(
        1.0 - dot(normal,viewDir),
        4.0
      );

  vec3 metalTint =
      vec3(0.6,0.85,1.0);

  // reduce diffuse
  col *= diff * 0.45;

  // metallic streak highlight
  col += spec
      * vec3(1.0,0.95,0.85)
      * 2.0;

  // metallic edge reflection
  col += fresnel
      * metalTint
      * 1.5;

  // ===== DEPTH BOOST =====

  col *= 0.75 + diff * 0.9;

  gl_FragColor = vec4(col,1.0);
}
`;

function compile(type,src){

  const s = gl.createShader(type);

  gl.shaderSource(s,src);

  gl.compileShader(s);

  return s;
}

const prog = gl.createProgram();

gl.attachShader(
  prog,
  compile(gl.VERTEX_SHADER,vs)
);

gl.attachShader(
  prog,
  compile(gl.FRAGMENT_SHADER,fs)
);

gl.linkProgram(prog);

gl.useProgram(prog);

const buf = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER,buf);

gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array([
    -1,-1,
     1,-1,
    -1, 1,

    -1, 1,
     1,-1,
     1, 1
  ]),
  gl.STATIC_DRAW
);

const loc =
    gl.getAttribLocation(prog,"p");

gl.enableVertexAttribArray(loc);

gl.vertexAttribPointer(
  loc,
  2,
  gl.FLOAT,
  false,
  0,
  0
);

const ut =
    gl.getUniformLocation(prog,"t");

let start = performance.now();

function draw(){

  let time =
      (performance.now()-start)
      * 0.001;

  gl.uniform1f(ut,time);

  gl.drawArrays(gl.TRIANGLES,0,6);

  requestAnimationFrame(draw);
}

draw();
