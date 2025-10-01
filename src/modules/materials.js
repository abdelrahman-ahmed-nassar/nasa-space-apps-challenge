import * as THREE from "three";
import { TEXTURES } from "./constants.js";

/**
 * Materials and Shaders Module
 * Handles all material creation including custom shaders
 */
export class MaterialManager {
  constructor(textureLoader, sunPosition) {
    this.textureLoader = textureLoader;
    this.sunPosition = sunPosition;
  }

  /**
   * Create Earth's day/night shader material
   */
  createEarthMaterial() {
    return new THREE.ShaderMaterial({
      uniforms: {
        dayTexture: {
          type: "t",
          value: this.textureLoader.load(TEXTURES.earth.day),
        },
        nightTexture: {
          type: "t",
          value: this.textureLoader.load(TEXTURES.earth.night),
        },
        sunPosition: { type: "v3", value: this.sunPosition },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec2 vUv;
        varying vec3 vSunDirection;

        uniform vec3 sunPosition;

        void main() {
          vUv = uv;
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vNormal = normalize(modelMatrix * vec4(normal, 0.0)).xyz;
          vSunDirection = normalize(sunPosition - worldPosition.xyz);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D dayTexture;
        uniform sampler2D nightTexture;

        varying vec3 vNormal;
        varying vec2 vUv;
        varying vec3 vSunDirection;

        void main() {
          float intensity = max(dot(vNormal, vSunDirection), 0.0);
          vec4 dayColor = texture2D(dayTexture, vUv);
          vec4 nightColor = texture2D(nightTexture, vUv) * 0.2;
          gl_FragColor = mix(nightColor, dayColor, intensity);
        }
      `,
    });
  }

  /**
   * Create sun material
   */
  createSunMaterial(emissiveIntensity) {
    return new THREE.MeshStandardMaterial({
      emissive: 0xfff88f,
      emissiveMap: this.textureLoader.load(TEXTURES.sun),
      emissiveIntensity: emissiveIntensity,
    });
  }

  /**
   * Create standard planet material with optional bump mapping
   */
  createPlanetMaterial(texture, bump = null, bumpScale = 0.7) {
    const materialConfig = {
      map: this.textureLoader.load(texture),
    };

    if (bump) {
      materialConfig.bumpMap = this.textureLoader.load(bump);
      materialConfig.bumpScale = bumpScale;
    }

    return new THREE.MeshPhongMaterial(materialConfig);
  }

  /**
   * Create atmosphere material
   */
  createAtmosphereMaterial(texture) {
    return new THREE.MeshPhongMaterial({
      map: this.textureLoader.load(texture),
      transparent: true,
      opacity: 0.4,
      depthTest: true,
      depthWrite: false,
    });
  }

  /**
   * Create ring material
   */
  createRingMaterial(texture) {
    return new THREE.MeshStandardMaterial({
      map: this.textureLoader.load(texture),
      side: THREE.DoubleSide,
    });
  }

  /**
   * Create moon material with optional bump mapping
   */
  createMoonMaterial(texture, bump = null, bumpScale = 0.5) {
    const materialConfig = {
      map: this.textureLoader.load(texture),
    };

    if (bump) {
      materialConfig.bumpMap = this.textureLoader.load(bump);
      materialConfig.bumpScale = bumpScale;
    }

    return new THREE.MeshStandardMaterial(materialConfig);
  }

  /**
   * Create orbit path material
   */
  createOrbitMaterial() {
    return new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.03,
    });
  }
}
