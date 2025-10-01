import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";
import { TEXTURES, CAMERA_CONFIG } from "./constants.js";

/**
 * Scene Setup Module
 * Handles Three.js scene, camera, renderer, lights, and postprocessing setup
 */
export class SceneSetup {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.composer = null;
    this.outlinePass = null;
    this.pointLight = null;
    this.cubeTextureLoader = new THREE.CubeTextureLoader();
    this.textureLoader = new THREE.TextureLoader();

    this.init();
  }

  init() {
    this.createScene();
    this.createCamera();
    this.createRenderer();
    this.createControls();
    this.createLights();
    this.createPostProcessing();
    this.setBackground();
    this.setupEventListeners();
  }

  createScene() {
    console.log("Create the scene");
    this.scene = new THREE.Scene();
  }

  createCamera() {
    console.log("Create a perspective projection camera");
    this.camera = new THREE.PerspectiveCamera(
      CAMERA_CONFIG.fov,
      CAMERA_CONFIG.aspect,
      CAMERA_CONFIG.near,
      CAMERA_CONFIG.far
    );
    this.camera.position.set(
      CAMERA_CONFIG.initialPosition.x,
      CAMERA_CONFIG.initialPosition.y,
      CAMERA_CONFIG.initialPosition.z
    );
  }

  createRenderer() {
    console.log("Create the renderer");
    this.renderer = new THREE.WebGL1Renderer({
      antialias: true,
      powerPreference: "high-performance",
      alpha: false,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.shadowMap.enabled = true;
    document.body.appendChild(this.renderer.domElement);
  }

  createControls() {
    console.log("Create an orbit control");
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.75;
    this.controls.screenSpacePanning = false;
  }

  createLights() {
    console.log("Add lights");

    // Ambient light
    const lightAmbient = new THREE.AmbientLight(0x222222, 6);
    this.scene.add(lightAmbient);

    // Point light (sun)
    this.pointLight = new THREE.PointLight(0xfdffd3, 1200, 400, 1.4);
    this.pointLight.castShadow = true;

    // Shadow properties
    this.pointLight.shadow.mapSize.width = 1024;
    this.pointLight.shadow.mapSize.height = 1024;
    this.pointLight.shadow.camera.near = 10;
    this.pointLight.shadow.camera.far = 20;

    this.scene.add(this.pointLight);
  }

  createPostProcessing() {
    console.log("Setup post-processing");

    // Effect composer
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    // Outline pass
    this.outlinePass = new OutlinePass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      this.scene,
      this.camera
    );
    this.outlinePass.edgeStrength = 3;
    this.outlinePass.edgeGlow = 1;
    this.outlinePass.visibleEdgeColor.set(0xffffff);
    this.outlinePass.hiddenEdgeColor.set(0x190a05);
    this.composer.addPass(this.outlinePass);

    // Bloom pass
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1,
      0.4,
      0.85
    );
    bloomPass.threshold = 1;
    bloomPass.radius = 0.9;
    this.composer.addPass(bloomPass);
  }

  setBackground() {
    console.log("Set star background");
    this.scene.background = this.cubeTextureLoader.load(
      TEXTURES.backgroundCube
    );
  }

  setupEventListeners() {
    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.composer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  // Getter methods for external access
  getScene() {
    return this.scene;
  }
  getCamera() {
    return this.camera;
  }
  getRenderer() {
    return this.renderer;
  }
  getControls() {
    return this.controls;
  }
  getComposer() {
    return this.composer;
  }
  getOutlinePass() {
    return this.outlinePass;
  }
  getPointLight() {
    return this.pointLight;
  }
  getTextureLoader() {
    return this.textureLoader;
  }
}
