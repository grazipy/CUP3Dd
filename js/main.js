import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// Inicialização do cenário Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("COPO").appendChild(renderer.domElement);

let controls = new OrbitControls(camera, renderer.domElement);

// Função para criar a textura a partir de um arquivo
function criarTexturaDoArquivo(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (event) {
            const textureLoader = new THREE.TextureLoader();
            const texture = textureLoader.load(event.target.result, () => resolve(texture), undefined, reject);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function criarLuzDirecional(posicao) {
    const luz = new THREE.DirectionalLight(0x383838, 1);
    luz.position.copy(posicao);
    luz.castShadow = true;
    scene.add(luz);
}

// Adicionar luzes direcionais
criarLuzDirecional(new THREE.Vector3(2, 2, 2));
criarLuzDirecional(new THREE.Vector3(2, 2, -2));
criarLuzDirecional(new THREE.Vector3(-2, 2, 2));
criarLuzDirecional(new THREE.Vector3(-2, 2, -2));
criarLuzDirecional(new THREE.Vector3(2, 0, 2));
criarLuzDirecional(new THREE.Vector3(2, 0, -2));
criarLuzDirecional(new THREE.Vector3(-2, 0, 2));
criarLuzDirecional(new THREE.Vector3(-2, 0, -2));
criarLuzDirecional(new THREE.Vector3(2, -2, 2));
criarLuzDirecional(new THREE.Vector3(2, -2, -2));
criarLuzDirecional(new THREE.Vector3(-2, -2, 2));
criarLuzDirecional(new THREE.Vector3(-2, -2, -2));

// Carregar o modelo GLTF e aplicar a textura da imagem
const loader = new GLTFLoader();
let object;

loader.load(
    'models/CUP3D/scene.glb',
    async function (gltf) {
        object = gltf.scene;

        // Ajustar a escala do objeto para que ele fique maior
        object.scale.set(5,5, 5); // Aumente a escala conforme necessário

        // Ajustar a posição do objeto para ficar no topo da página
        object.position.set(0, 10, 40); // Coloque o objeto na origem (ajuste conforme necessário)

        // Adicionar o modelo à cena
        scene.add(object);

        // Ajustar a posição da câmera
        const caixaLimitadora = new THREE.Box3().setFromObject(object);
        const centro = new THREE.Vector3();
        caixaLimitadora.getCenter(centro);
        controls.target.copy(centro);
        camera.position.set(centro.x + 15, centro.y + 0, centro.z + 10); // Ajuste o valor conforme necessário
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
        console.error('Erro ao carregar o modelo GLTF:', error);
    }
);

// Adicionar listener para o input de arquivo
document.getElementById('fileInput').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (file && object) {
        try {
            const texturaImagem = await criarTexturaDoArquivo(file);
            const material = new THREE.MeshBasicMaterial({ map: texturaImagem });

            object.traverse((child) => {
                if (child.isMesh) {
                    child.material = material;
                }
            });
        } catch (error) {
            console.error('Erro ao carregar a textura do arquivo:', error);
        }
    }
});

// Função de animação
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Configurar controles de zoom
controls.enableZoom = true; // Habilita o zoom
controls.zoomSpeed = 1.2; // Ajusta a velocidade do zoom

window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
