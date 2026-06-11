const canvas = document.getElementById("glcanvas");
const gl = canvas.getContext("webgl");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const vertexShaderSource = `
attribute vec2 position;

void main() {
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShaderSource = `
precision highp float;

uniform vec2 uResolution;
uniform float uTime;

float hash(vec2 p) {
    return fract(
        sin(dot(p, vec2(127.1,311.7))) *
        43758.5453123
    );
}

float noise(vec2 p) {

    vec2 i = floor(p);
    vec2 f = fract(p);

    f = f * f * (3.0 - 2.0 * f);

    float a = hash(i);
    float b = hash(i + vec2(1.0,0.0));
    float c = hash(i + vec2(0.0,1.0));
    float d = hash(i + vec2(1.0,1.0));

    return mix(
        mix(a,b,f.x),
        mix(c,d,f.x),
        f.y
    );
}

float fbm(vec2 p) {

    float v = 0.0;
    float a = 0.5;

    for(int i=0;i<6;i++) {

        v += noise(p) * a;

        p *= 2.0;

        a *= 0.5;
    }

    return v;
}

// -----------------------------------
// STEP 1
// FIX FLOW PHYSICS
// -----------------------------------

vec2 riverFlow(vec2 uv) {

    float t = uTime * 0.10;

    vec2 p = uv * 1.3;

    // -----------------------------------
    // LARGE SCALE CURRENT
    // -----------------------------------

    vec2 velocity = vec2(
        0.14,
        0.03
    );

    // sweeping bends
velocity.x +=
    sin(
        p.y * 0.25
    ) * 0.060;

velocity.y +=
    sin(
        p.x * 0.15
    ) * 0.020;

    // -----------------------------------
    // RECURSIVE FLUID ADVECTION
    // -----------------------------------

    vec2 q = p;

    for(int i = 0; i < 2; i++) {

        float e = 0.18;

        float n1 =
            fbm(q + vec2(0.0, e));

        float n2 =
            fbm(q - vec2(0.0, e));

        float n3 =
            fbm(q + vec2(e, 0.0));

        float n4 =
            fbm(q - vec2(e, 0.0));

        vec2 curl = vec2(
            n1 - n2,
            -(n3 - n4)
        );

        q += curl * 0.08;

        q += velocity * 4.00;
    }

    // -----------------------------------
    // FLOW STRETCHING
    // -----------------------------------

    q *= mat2(
        2.4, 0.8,
       -0.4, 1.15
    );

    // -----------------------------------
    // DENSITY ACCUMULATION
    // -----------------------------------

    vec2 accum;

    accum.x =
        fbm(
            q * 2.5 +
t * 0.05
        );

    accum.y =
        fbm(
            q * 2.5 -
t * 0.05
        );

    q +=
        (accum - 0.5) * 0.50;

    // -----------------------------------
    // MICRO FLUID DETAIL
    // -----------------------------------

    vec2 micro;

    micro.x =
        fbm(
            q * 7.0 +
t * 0.10
        );

    micro.y =
        fbm(
            q * 7.0 -
t * 0.10
        );

    q +=
        (micro - 0.5) * 0.10;

    return q;
}

void main() {

    vec2 uv =
        gl_FragCoord.xy /
        uResolution.xy;

    uv -= 0.5;

    uv.x *=
        uResolution.x /
        uResolution.y;

    // cinematic composition bias
    uv.x += uv.y * 0.35;

    vec2 flowUV =
        riverFlow(
        uv * 2.0 +
        vec2( uTime * 0.15, 0.0 )
    );

    // -----------------------------------
    // MACRO OCEAN MASSES
    // -----------------------------------

    float basinA =
        fbm(flowUV * 0.8);

    float basinB =
        fbm(flowUV * 1.4 + 4.0);

    float basinC =
        fbm(flowUV * 2.2 - 2.0);

    // -----------------------------------
    // STEP 2
    // FLOW COMPRESSION
    // -----------------------------------

    float ocean =
        basinA * 0.55 +
        basinB * 0.30 +
        basinC * 0.15;

    ocean =
        pow(
            ocean,
            2.8
        );

    // -----------------------------------
    // STEP 3
    // GOLD RIDGE EXTRACTION
    // MOBILE SAFE
    // -----------------------------------

    float ridgeNoise =
        fbm(flowUV * 5.0);

    float ridge =

        smoothstep(
            0.45,
            0.72,
            ridgeNoise
        );

    ridge *=
        smoothstep(
            0.25,
            0.85,
            ocean
        );

    float goldMask = ridge;

    // -----------------------------------
    // STEP 4
    // DEPTH STACKING
    // -----------------------------------

    float deepLayer =
        fbm(flowUV * 0.35);

    float midLayer =
        fbm(flowUV * 1.1);

    float surfaceLayer =
        fbm(flowUV * 3.0);

    float translucent =

        deepLayer * 0.55 +

        midLayer * 0.30 +

        surfaceLayer * 0.15;

    translucent =
        smoothstep(
            0.1,
            0.9,
            translucent
        );

    // -----------------------------------
    // COLORS
    // -----------------------------------

    vec3 deepOcean = vec3(
        0.01,
        0.05,
        0.12
    );

    vec3 tealFlow = vec3(
        0.00,
        0.34,
        0.48
    );

    vec3 cyanBloom = vec3(
        0.28,
        0.72,
        0.82
    );

    vec3 pearl = vec3(
        0.90,
        0.95,
        1.0
    );

    vec3 gold = vec3(
        1.0,
        0.82,
        0.35
    );

    // -----------------------------------
    // STEP 5
    // VOLUME FLOW RENDERING
    // -----------------------------------

    vec3 color = deepOcean;

    // stronger basin depth
    color +=
        tealFlow *
        ocean *
        1.8;

    // reduced cloudiness
    color +=
        cyanBloom *
        translucent *
        0.10;

    // pearl metallic sheen
    float pearlScatter =

        pow(
            surfaceLayer,
            4.0
        );

    color +=
        pearl *
        pearlScatter *
        0.18;

    // gold ridge transport
    color +=
        gold *
        goldMask *
        1.45;

    // -----------------------------------
    // STEP 6
    // SUBSURFACE DEPTH
    // -----------------------------------

    float depth =
        fbm(flowUV * 0.3);

    color *=
        0.82 +
        depth * 0.35;

    // reflective micro particles
    float sparkle =
        pow(
            noise(flowUV * 20.0),
            15.0
        );

    color += sparkle * 0.05;

    // cinematic soft response
    color =
        pow(
            color,
            vec3(0.92)
        );

    gl_FragColor =
        vec4(color, 1.0);
}
`;

function compileShader(type, source) {

    const shader =
        gl.createShader(type);

    gl.shaderSource(shader, source);

    gl.compileShader(shader);

    if (
        !gl.getShaderParameter(
            shader,
            gl.COMPILE_STATUS
        )
    ) {
        console.error(
            gl.getShaderInfoLog(shader)
        );
    }

    return shader;
}

const vertexShader =
    compileShader(
        gl.VERTEX_SHADER,
        vertexShaderSource
    );

const fragmentShader =
    compileShader(
        gl.FRAGMENT_SHADER,
        fragmentShaderSource
    );

const program =
    gl.createProgram();

gl.attachShader(program, vertexShader);

gl.attachShader(program, fragmentShader);

gl.linkProgram(program);

gl.useProgram(program);

const vertices =
    new Float32Array([
        -1,-1,
         1,-1,
        -1, 1,
        -1, 1,
         1,-1,
         1, 1
    ]);

const buffer =
    gl.createBuffer();

gl.bindBuffer(
    gl.ARRAY_BUFFER,
    buffer
);

gl.bufferData(
    gl.ARRAY_BUFFER,
    vertices,
    gl.STATIC_DRAW
);

const position =
    gl.getAttribLocation(
        program,
        "position"
    );

gl.enableVertexAttribArray(position);

gl.vertexAttribPointer(
    position,
    2,
    gl.FLOAT,
    false,
    0,
    0
);

const uTime =
    gl.getUniformLocation(
        program,
        "uTime"
    );

const uResolution =
    gl.getUniformLocation(
        program,
        "uResolution"
    );

function render(time) {

    time *= 0.001;

    gl.viewport(
        0,
        0,
        canvas.width,
        canvas.height
    );

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform1f(
        uTime,
        time
    );

    gl.uniform2f(
        uResolution,
        canvas.width,
        canvas.height
    );

    gl.drawArrays(
        gl.TRIANGLES,
        0,
        6
    );

    requestAnimationFrame(render);
}

requestAnimationFrame(render);

window.addEventListener("resize", () => {

    canvas.width =
        window.innerWidth;

    canvas.height =
        window.innerHeight;
});