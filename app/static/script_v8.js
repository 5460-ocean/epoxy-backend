// ============================================================
// LUXURY EPOXY WEBGL SHADER — CLEAN STABLE VERSION
// ============================================================

const scene = new THREE.Scene();

const camera = new THREE.OrthographicCamera(
    -1,
    1,
    1,
    -1,
    0.1,
    10
);

camera.position.z = 1;

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

document.body.appendChild(renderer.domElement);

const uniforms = {
    time: { value: 0 },
    resolution: {
        value: new THREE.Vector2(
            window.innerWidth,
            window.innerHeight
        )
    }
};

const material = new THREE.ShaderMaterial({

    uniforms,

    vertexShader: `

        varying vec2 vUv;

        void main() {

            vUv = uv;

            gl_Position = projectionMatrix *
                          modelViewMatrix *
                          vec4(position, 1.0);
        }

    `,

    fragmentShader: `

        precision highp float;

uniform float u_time;
uniform vec2 u_resolution;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123);
}

float noise(vec2 p) {

    vec2 i = floor(p);
    vec2 f = fract(p);

    float a = hash(i);
    float b = hash(i + vec2(1.0,0.0));
    float c = hash(i + vec2(0.0,1.0));
    float d = hash(i + vec2(1.0,1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a,b,u.x)
         + (c-a) * u.y * (1.0-u.x)
         + (d-b) * u.x * u.y;
}

float fbm(vec2 p) {

    float v = 0.0;
    float a = 0.5;

    for(int i=0; i<5; i++) {
        v += a * noise(p);
        p *= 2.0;
        a *= 0.5;
    }

    return v;
}

void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution.xy;

    vec2 p = uv * 3.0;

    float n = fbm(p + u_time * 0.05);

    vec3 deep = vec3(0.02, 0.03, 0.07);
    vec3 blue = vec3(0.05, 0.12, 0.28);

    vec3 color = mix(deep, blue, n);

    gl_FragColor = vec4(color, 1.0);
}
        }
        }

    `
});

const geometry = new THREE.PlaneGeometry(2, 2);

const mesh = new THREE.Mesh(
    geometry,
    material
);

scene.add(mesh);

function animate(t) {

    requestAnimationFrame(animate);

    uniforms.time.value = t * 0.001;

    renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    uniforms.resolution.value.set(
        window.innerWidth,
        window.innerHeight
    );
});
