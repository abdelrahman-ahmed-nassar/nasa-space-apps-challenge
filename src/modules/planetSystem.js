import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  TEXTURES,
  MOON_CONFIGS,
  SUN_CONFIG,
  ORBITAL_COLORS,
  REAL_PLANET_POSITIONS,
} from "./constants.js";
import { MaterialManager } from "./materials.js";

/**
 * Planet System Module
 * Handles planet creation, sun creation, and celestial body management
 */
export class PlanetSystem {
  constructor(scene, textureLoader, pointLight) {
    this.scene = scene;
    this.textureLoader = textureLoader;
    this.pointLight = pointLight;
    this.materialManager = new MaterialManager(
      textureLoader,
      pointLight.position
    );
    this.gltfLoader = new GLTFLoader();

    this.planets = {};
    this.sun = null;
    this.asteroids = [];
    this.raycastTargets = [];
  }

  /**
   * Create the sun
   */
  createSun() {
    const sunGeom = new THREE.SphereGeometry(SUN_CONFIG.size, 32, 20);
    const sunMat = this.materialManager.createSunMaterial(
      SUN_CONFIG.emissiveIntensity
    );
    this.sun = new THREE.Mesh(sunGeom, sunMat);
    this.scene.add(this.sun);

    // Add sun to raycast targets for click interaction
    this.raycastTargets.push(this.sun);

    return this.sun;
  }

  /**
   * Calculate real astronomical position on circular orbit
   * Converts AU coordinates to angle on the existing circular orbit
   */
  calculateRealPosition(planetName, orbitRadius) {
    const planetKey = planetName.toLowerCase();
    const realPos = REAL_PLANET_POSITIONS[planetKey];

    if (!realPos) {
      console.warn(
        `No real position data for ${planetName}, using default position`
      );
      return { x: orbitRadius, z: 0 };
    }

    // Calculate angle from AU coordinates (atan2 gives us the angle in radians)
    const angle = Math.atan2(realPos.y_au, realPos.x_au);

    // Convert angle to position on our circular orbit
    const x = orbitRadius * Math.cos(angle);
    const z = orbitRadius * Math.sin(angle);

    console.log(
      `${planetName} positioned at angle: ${((angle * 180) / Math.PI).toFixed(
        1
      )}° (${x.toFixed(1)}, ${z.toFixed(1)})`
    );

    return { x, z };
  }

  /**
   * Create a planet with all its components
   */
  createPlanet(
    planetName,
    size,
    position,
    tilt,
    texture,
    bump,
    ring,
    atmosphere,
    moons
  ) {
    let material;

    // Handle different material types
    if (texture instanceof THREE.Material) {
      material = texture;
    } else if (bump) {
      material = this.materialManager.createPlanetMaterial(texture, bump);
    } else {
      material = this.materialManager.createPlanetMaterial(texture);
    }

    const name = planetName;
    const geometry = new THREE.SphereGeometry(size, 32, 20);
    const planet = new THREE.Mesh(geometry, material);
    const planet3d = new THREE.Object3D();
    const planetSystem = new THREE.Group();

    planetSystem.add(planet);

    // Calculate real astronomical position on the circular orbit
    const realPosition = this.calculateRealPosition(planetName, position);
    planet.position.x = realPosition.x;
    planet.position.z = realPosition.z;
    planet.rotation.z = (tilt * Math.PI) / 180;

    // Create orbit path with planet-specific color
    this.createOrbitPath(planetSystem, position, planetName);

    // Add ring system
    let Ring = null;
    if (ring) {
      Ring = this.createRing(planetSystem, ring, realPosition, tilt);
    }

    // Add atmosphere
    let Atmosphere = null;
    if (atmosphere) {
      Atmosphere = this.createAtmosphere(planet, atmosphere, size);
    }

    // Add moons
    let moonObjects = null;
    if (moons) {
      moonObjects = this.createMoons(planetSystem, moons, size);
    }

    // Setup shadows
    this.setupShadows(planet, Atmosphere, moonObjects);

    // Add to scene
    planet3d.add(planetSystem);
    this.scene.add(planet3d);

    // Add to raycast targets
    this.raycastTargets.push(planet);
    if (Atmosphere) {
      this.raycastTargets.push(Atmosphere);
    }

    const planetObject = {
      name,
      planet,
      planet3d,
      Atmosphere,
      moons: moonObjects,
      planetSystem,
      Ring,
    };

    this.planets[planetName] = planetObject;
    return planetObject;
  }

  /**
   * Create orbit path for a planet with custom color
   */
  createOrbitPath(planetSystem, position, planetName) {
    const orbitPath = new THREE.EllipseCurve(
      0,
      0, // ax, aY
      position,
      position, // xRadius, yRadius
      0,
      2 * Math.PI, // aStartAngle, aEndAngle
      false, // aClockwise
      0 // aRotation
    );

    const pathPoints = orbitPath.getPoints(100);
    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);

    // Get planet-specific color from ORBITAL_COLORS
    const planetKey = planetName.toLowerCase();
    const orbitColor = ORBITAL_COLORS[planetKey] || 0xffffff;

    const orbitMaterial = this.materialManager.createOrbitMaterial(
      orbitColor,
      0.15
    );
    const orbit = new THREE.LineLoop(orbitGeometry, orbitMaterial);
    orbit.rotation.x = Math.PI / 2;
    planetSystem.add(orbit);
  }

  /**
   * Create ring system for a planet
   */
  createRing(planetSystem, ringConfig, realPosition, tilt) {
    const RingGeo = new THREE.RingGeometry(
      ringConfig.innerRadius,
      ringConfig.outerRadius,
      30
    );
    const RingMat = this.materialManager.createRingMaterial(ringConfig.texture);
    const Ring = new THREE.Mesh(RingGeo, RingMat);

    planetSystem.add(Ring);
    Ring.position.x = realPosition.x;
    Ring.position.z = realPosition.z;
    Ring.rotation.x = -0.5 * Math.PI;
    Ring.rotation.y = (-tilt * Math.PI) / 180;

    return Ring;
  }

  /**
   * Create atmosphere for a planet
   */
  createAtmosphere(planet, atmosphereTexture, size) {
    const atmosphereGeom = new THREE.SphereGeometry(size + 0.1, 32, 20);
    const atmosphereMaterial =
      this.materialManager.createAtmosphereMaterial(atmosphereTexture);
    const Atmosphere = new THREE.Mesh(atmosphereGeom, atmosphereMaterial);

    Atmosphere.rotation.z = 0.41;
    planet.add(Atmosphere);

    return Atmosphere;
  }

  /**
   * Create moons for a planet
   */
  createMoons(planetSystem, moons, planetSize) {
    const moonObjects = [];

    moons.forEach((moon) => {
      if (moon.modelPath) {
        // Load 3D model moon (like Mars moons)
        this.loadMoonModel(moon, planetSystem);
        moonObjects.push(moon);
      } else {
        // Create sphere moon
        const moonMaterial = this.materialManager.createMoonMaterial(
          moon.texture,
          moon.bump
        );
        const moonGeometry = new THREE.SphereGeometry(moon.size, 32, 20);
        const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
        const moonOrbitDistance = planetSize * 1.5;
        moonMesh.position.set(moonOrbitDistance, 0, 0);
        planetSystem.add(moonMesh);

        moon.mesh = moonMesh;
        moonObjects.push(moon);
      }
    });

    return moonObjects;
  }

  /**
   * Load 3D model for moons (like Mars moons)
   */
  loadMoonModel(moon, planetSystem) {
    this.gltfLoader.load(
      moon.modelPath,
      (gltf) => {
        const obj = gltf.scene;
        obj.position.set(moon.position || 0, 0, 0);
        obj.scale.set(moon.scale, moon.scale, moon.scale);
        moon.mesh = obj;
        planetSystem.add(obj);

        obj.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
      },
      undefined,
      (error) => console.error("Moon loading error:", error)
    );
  }

  /**
   * Setup shadows for planets and moons
   */
  setupShadows(planet, atmosphere, moons) {
    planet.castShadow = true;
    planet.receiveShadow = true;

    if (atmosphere) {
      atmosphere.castShadow = true;
      atmosphere.receiveShadow = true;
    }

    if (moons) {
      moons.forEach((moon) => {
        if (moon.mesh) {
          moon.mesh.castShadow = true;
          moon.mesh.receiveShadow = true;
        }
      });
    }
  }

  /**
   * Load and distribute asteroids in belts
   */
  loadAsteroids(path, numberOfAsteroids, minOrbitRadius, maxOrbitRadius) {
    this.gltfLoader.load(
      path,
      (gltf) => {
        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            for (let i = 0; i < numberOfAsteroids / 12; i++) {
              const asteroid = child.clone();
              const orbitRadius = THREE.MathUtils.randFloat(
                minOrbitRadius,
                maxOrbitRadius
              );
              const angle = Math.random() * Math.PI * 2;
              const x = orbitRadius * Math.cos(angle);
              const y = 0;
              const z = orbitRadius * Math.sin(angle);

              child.receiveShadow = true;
              asteroid.position.set(x, y, z);
              asteroid.scale.setScalar(THREE.MathUtils.randFloat(0.8, 1.2));
              this.scene.add(asteroid);
              this.asteroids.push(asteroid);
            }
          }
        });
      },
      undefined,
      (error) => console.error("Asteroid loading error:", error)
    );
  }

  /**
   * Create all planets in the solar system
   */
  createAllPlanets() {
    // Create Earth material separately (custom shader)
    const earthMaterial = this.materialManager.createEarthMaterial();

    // Create all planets
    this.createPlanet(
      "Mercury",
      2.4,
      40,
      0,
      TEXTURES.mercury.map,
      TEXTURES.mercury.bump
    );

    this.createPlanet(
      "Venus",
      6.1,
      65,
      3,
      TEXTURES.venus.map,
      TEXTURES.venus.bump,
      null,
      TEXTURES.venus.atmosphere
    );

    this.createPlanet(
      "Earth",
      6.4,
      90,
      23,
      earthMaterial,
      null,
      null,
      TEXTURES.earth.atmosphere,
      MOON_CONFIGS.earth
    );

    this.createPlanet(
      "Mars",
      3.4,
      115,
      25,
      TEXTURES.mars.map,
      TEXTURES.mars.bump
    );

    this.createPlanet(
      "Jupiter",
      69 / 4,
      200,
      3,
      TEXTURES.jupiter.map,
      null,
      null,
      null,
      MOON_CONFIGS.jupiter
    );

    this.createPlanet("Saturn", 58 / 4, 270, 26, TEXTURES.saturn.map, null, {
      innerRadius: 18,
      outerRadius: 29,
      texture: TEXTURES.saturn.ring,
    });

    this.createPlanet("Uranus", 25 / 4, 320, 82, TEXTURES.uranus.map, null, {
      innerRadius: 6,
      outerRadius: 8,
      texture: TEXTURES.uranus.ring,
    });

    this.createPlanet("Neptune", 24 / 4, 340, 28, TEXTURES.neptune.map);

    this.createPlanet("Pluto", 1, 350, 57, TEXTURES.pluto.map);

    // Load Mars moons separately (3D models)
    this.loadMarsMoons();
  }

  /**
   * Load Mars moons specifically (3D models)
   */
  loadMarsMoons() {
    const mars = this.planets.Mars;
    if (!mars) return;

    MOON_CONFIGS.mars.forEach((moon) => {
      this.gltfLoader.load(
        moon.modelPath,
        (gltf) => {
          const obj = gltf.scene;
          obj.position.set(moon.position, 0, 0);
          obj.scale.set(moon.scale, moon.scale, moon.scale);
          moon.mesh = obj;
          mars.planetSystem.add(obj);

          obj.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
        },
        undefined,
        (error) => console.error("Mars moon loading error:", error)
      );
    });
  }

  // Getter methods
  getPlanets() {
    return this.planets;
  }
  getSun() {
    return this.sun;
  }
  getAsteroids() {
    return this.asteroids;
  }
  getRaycastTargets() {
    return this.raycastTargets;
  }
}
