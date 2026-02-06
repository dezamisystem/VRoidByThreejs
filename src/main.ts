import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils, VRM } from '@pixiv/three-vrm';
import { createVRMAnimationClip, VRMAnimationLoaderPlugin, VRMAnimation } from "@pixiv/three-vrm-animation";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui'

// シーンの作成
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x00af00);

// カメラの作成
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1, 2);
camera.lookAt(0, 1, 0);

// レンダラーの作成
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// OrbitControlsの作成
const controls = new OrbitControls(camera, renderer.domElement);
controls.autoRotate = true;
controls.autoRotateSpeed = 4.0;
controls.target.set(0, 1.0, 0);
controls.update();

// 環境光の追加
const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
scene.add(ambientLight);
// 平行光源の追加
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 6, 3);
scene.add(directionalLight);

// フロアを作成
const floorGeometry = new THREE.PlaneGeometry(5, 5);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xa0a0a0, side: THREE.DoubleSide });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2; // 水平にするために回転
scene.add(floor);

// グリッドヘルパー
const gridHelper = new THREE.GridHelper(10, 10);
scene.add(gridHelper);

// VRMモデルインスタンス
let currentVrm: VRM | null = null;
// VRMアニメーションインスタンス
let currentVrmAnimation: VRMAnimation | null = null;
// VRMアニメーションミキサー
let currentMixer: THREE.AnimationMixer | null = null;
// アニメーションアクション
let currentAction: THREE.AnimationAction | null = null;

// GUI設定
const settings = {
    paused: false,
    time: 0.0,
    togglePause: function () {
        this.paused = !this.paused;
    }
};
// GUIインスタンス
const gui = new GUI();

// Loaderのセットアップ
const loader = new GLTFLoader();
loader.register((parser) => {
    return new VRMLoaderPlugin(parser);
});
loader.register((parser) => {
    return new VRMAnimationLoaderPlugin(parser);
});

// ファイルの読み込み
function load(url: string) {
    loader.load(
        url,
        // ロード時に呼ばれる
        (gltf) => {
            const vrm = gltf.userData.vrm;
            const vrmAnimations = gltf.userData.vrmAnimations;

            if (vrm) {
                tryInitVRM(vrm);
            }

            if (vrmAnimations) {
                tryInitVRMA(vrmAnimations);
            }
        },
        // プログレス時に呼ばれる
        (progress) => console.log(
            "Loading model...",
            100.0 * (progress.loaded / progress.total), "%"
        ),
        // エラー時に呼ばれる
        (error) => console.error(error)
    );
}

// VRMの読み込み
function tryInitVRM(vrm: VRM) {
    currentVrm = vrm;
    scene.add(vrm.scene);
    VRMUtils.rotateVRM0(vrm); // VRM0.x読み込み時の回転補正(必要であれば)
    initAnimationClip();
}

// VRMAの読み込み
function tryInitVRMA(vrmAnimations: VRMAnimation[]) {
    currentVrmAnimation = vrmAnimations[0] ?? null;
    initAnimationClip();
}

// クリップの初期化
function initAnimationClip() {
    if (currentVrm && currentVrmAnimation) {
        currentMixer = new THREE.AnimationMixer(currentVrm.scene);
        const clip = createVRMAnimationClip(currentVrmAnimation, currentVrm);
        currentAction = currentMixer.clipAction(clip);
        currentAction.play();
        setupGUI(currentAction, currentMixer);
    }
}

// GUIのセットアップ
function setupGUI(action: THREE.AnimationAction, mixer: THREE.AnimationMixer) {
    if (!action) return;

    const clip = action.getClip();
    const duration = clip.duration;

    gui.add(settings, 'togglePause').name('Pause | Resume');

    gui.add(settings, 'time', 0, duration).name('Time').listen().onChange((t: number) => {
        if (action) {
            action.time = t;
            // 停止中もタイムスライダーを動かしたときは強制的にポーズ状態として更新
            settings.paused = true;
            // アニメーションを即座に反映
            if (mixer) {
                mixer.update(0);
            }
        }
    });
}

// VRMとVRMAの読み込み
load("./models/SimpleGirl01.vrm");
load("./models/vpdloop_kick01.vrma");

// clockの準備
const clock = new THREE.Clock();
clock.start();

// アニメーションループ
function animate() {
    requestAnimationFrame(animate);

    controls.update();

    // モデルアニメーション
    const deltaTime = clock.getDelta();
    if (currentMixer) {
        if (!settings.paused) {
            currentMixer.update(deltaTime);
            if (currentAction) {
                settings.time = currentAction.time;
            }
        }
    }

    // VRMの更新
    if (currentVrm) {
        currentVrm.update(deltaTime);
    }

    renderer.render(scene, camera);
}
animate();

// リサイズ対応
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
