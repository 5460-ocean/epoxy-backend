//
// script_v5.js
//
// EXTENDS script_v4.js
//
// Adds:
// - epoxy resin cells
// - acrylic pour lacing
// - oceanic membranes
// - clustered gold particles
// - Voronoi cellular structures
// - multilayer fluid interaction
// - premium ocean epoxy preset
// - luxury metallic rendering
//

const canvas = document.getElementById("glcanvas");
const gl = canvas.getContext("webgl");

if (!gl) {
    alert("WebGL not supported");
}

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const vertexShaderSource = `
attribute vec2 position;
varying vec2 vUv;


void main() {

    vec2 uv = vUv;

    uv -= 0.5;
    uv.x *= uResolution.x / uResolution.y;

    ///////////////////////////////////////////////////////
    // BUILD OCEAN MASSES FIRST
    ///////////////////////////////////////////////////////

    vec2 flowUV = riverFlow(uv * 1.2);

    float ocean =
        fbm(flowUV * 1.2);

    float ocean2 =
        fbm(flowUV * 2.5 + 4.0);

    float resinMask =
        smoothstep(
            0.25,
            0.8,
            ocean
        );

    float depthMask =
        smoothstep(
            0.4,
            0.9,
            ocean2
        );

    ///////////////////////////////////////////////////////
    // LARGE SCALE FLUID FLOW
    ///////////////////////////////////////////////////////

    vec2 flowUV = uv;

    flowUV.x += sin(flowUV.y * 1.5 + uTime * 0.08) * 0.4;
    flowUV.y += cos(flowUV.x * 1.2 - uTime * 0.05) * 0.35;

    vec2 p = flow(flowUV * 0.6);

    ///////////////////////////////////////////////////////
    // LARGE RESIN STRUCTURES
    ///////////////////////////////////////////////////////

    float largeFlow =
        fbm(p * 1.4) * 0.7 +
        fbm(p * 2.8) * 0.3;

    float deepAreas =
        smoothstep(
            0.25,
            0.75,
            largeFlow
        );

    float shallowAreas =
        smoothstep(
            0.45,
            0.9,
            fbm(p * 1.1 + 5.0)
        );

    ///////////////////////////////////////////////////////
    // OCEAN PALETTE
    ///////////////////////////////////////////////////////

    vec3 abyss = vec3(0.01, 0.02, 0.06);
    vec3 deepBlue = vec3(0.02, 0.12, 0.24);
    vec3 teal = vec3(0.0, 0.35, 0.42);
    vec3 cyan = vec3(0.4, 0.75, 0.82);
    vec3 foam = vec3(0.92, 0.96, 1.0);

    vec3 color = mix(
        abyss,
        deepBlue,
        deepAreas
    );

    color = mix(
        color,
        teal,
        shallowAreas * 0.7
    );

    color = mix(
        color,
        cyan,
        smoothstep(
            0.65,
            0.95,
            shallowAreas
        ) * 0.5
    );

    ///////////////////////////////////////////////////////
    // SUBTLE RESIN DEPTH
    ///////////////////////////////////////////////////////

    float resinDepth =
        fbm(p * 6.0) * 0.6 +
        fbm(p * 12.0) * 0.4;

    color += resinDepth * 0.06;

    ///////////////////////////////////////////////////////
    // LOCALIZED CELLS ONLY
    ///////////////////////////////////////////////////////

    float cellMask =
        smoothstep(
            0.55,
            0.82,
            fbm(p * 1.8)
        );

    float foamZone =
        smoothstep(
            0.55,
            0.8,
            edge
        );

    float cells =
        oceanMembrane(
            flowUV * 3.0
        ) * foamZone;

    color += cells * vec3(0.9) * 0.22;

    ///////////////////////////////////////////////////////
    // SOFT LACING
    ///////////////////////////////////////////////////////

    float lace =
        acrylicLacing(p * 2.0) *
        smoothstep(
            0.45,
            0.8,
            shallowAreas
        );

    color += lace * foam * 0.12;

    ///////////////////////////////////////////////////////
    // GOLD BOUNDARY DETECTION
    ///////////////////////////////////////////////////////

    float boundary =
        abs(
            dFdx(largeFlow)
        ) +
        abs(
            dFdy(largeFlow)
        );

    boundary = smoothstep(
        0.03,
        0.12,
        boundary
    );

    float goldNoise =
        fbm(p * 10.0);

    float goldMask =
        boundary *
        smoothstep(
            0.35,
            0.75,
            goldNoise
        );

    vec3 gold =
        vec3(
            1.0,
            0.82,
            0.32
        );

    color += gold * goldMask * 0.55;

    ///////////////////////////////////////////////////////
    // GOLD MUST FOLLOW BOUNDARIES
    ///////////////////////////////////////////////////////

    float edge =
        abs(dFdx(resinMask)) +
        abs(dFdy(resinMask));

    edge =
        smoothstep(
            0.02,
            0.08,
            edge
        );

    vec3 gold =
        vec3(
            1.0,
            0.82,
            0.3
        );

    color += gold * edge * 0.5;

    ///////////////////////////////////////////////////////
    // GOLD PARTICLE CLUSTERS
    ///////////////////////////////////////////////////////

    float goldParticles =
        clusteredGold(p * 0.9) *
        boundary;

    color += gold * goldParticles * 0.25;

    ///////////////////////////////////////////////////////
    // ADD SUBSURFACE DEPTH
    ///////////////////////////////////////////////////////

    float depthNoise =
        fbm(flowUV * 8.0);

    color += depthNoise * 0.04;

    ///////////////////////////////////////////////////////
    // PEARL METALLIC SHEEN
    ///////////////////////////////////////////////////////

    float pearl =
        sin(
            flowUV.x * 120.0 +
            flowUV.y * 80.0
        );

    pearl =
        smoothstep(
            0.92,
            1.0,
            pearl
        );

    color += pearl * 0.05;

    ///////////////////////////////////////////////////////
    // GLOSS / FRESNEL
    ///////////////////////////////////////////////////////

    float fresnel =
        pow(
            1.0 -
            max(
                dot(
                    normalize(vec3(uv,1.0)),
                    vec3(0.0,0.0,1.0)
                ),
                0.0
            ),
            3.0
        );

    color += fresnel * 0.22;

    ///////////////////////////////////////////////////////
    // CONTRAST
    ///////////////////////////////////////////////////////

    color = pow(
        color,
        vec3(0.9)
    );

    gl_FragColor = vec4(color, 1.0);
}

`;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

const vertexShader = createShader(
    gl,
    gl.VERTEX_SHADER,
    vertexShaderSource
);

const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
);

const program = gl.createProgram();

gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);

gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
}

gl.useProgram(program);

const vertices = new Float32Array([
    -1, -1,
     1, -1,
    -1,  1,
    -1,  1,
     1, -1,
     1,  1
]);

const buffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

const position = gl.getAttribLocation(program, "position");

gl.enableVertexAttribArray(position);

gl.vertexAttribPointer(
    position,
    2,
    gl.FLOAT,
    false,
    0,
    0
);

const uTime = gl.getUniformLocation(program, "uTime");
const uResolution = gl.getUniformLocation(program, "uResolution");

function render(time) {

    time *= 0.001;

    gl.viewport(
        0,
        0,
        canvas.width,
        canvas.height
    );

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform1f(uTime, time);

    gl.uniform2f(
        uResolution,
        canvas.width,
        canvas.height
    );

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(render);
}

requestAnimationFrame(render);

window.addEventListener("resize", () => {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

});
