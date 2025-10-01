import { SETTINGS, MOON_CONFIGS } from "./constants.js";

/**
 * Animation Module
 * Handles the main animation loop and orbital mechanics for all celestial bodies
 */
export class AnimationSystem {
  constructor(
    planetSystem,
    timeControl,
    interactionSystem,
    composer,
    controls
  ) {
    this.planetSystem = planetSystem;
    this.timeControl = timeControl;
    this.interactionSystem = interactionSystem;
    this.composer = composer;
    this.controls = controls;

    this.isAnimating = false;
  }

  /**
   * Start the animation loop
   */
  start() {
    if (!this.isAnimating) {
      this.isAnimating = true;
      this.animate();
    }
  }

  /**
   * Stop the animation loop
   */
  stop() {
    this.isAnimating = false;
  }

  /**
   * Main animation loop
   */
  animate() {
    if (!this.isAnimating) return;

    // Update simulation time and time control
    this.timeControl.updateSimulationTime();

    // Animate all celestial bodies
    this.animateSun();
    this.animatePlanets();
    this.animateMoons();
    this.animateAsteroids();

    // Update interaction systems
    this.interactionSystem.updateOutlineHighlighting();
    this.interactionSystem.updateCameraMovement();

    // Update controls and render
    this.controls.update();
    requestAnimationFrame(() => this.animate());
    this.composer.render();
  }

  /**
   * Animate the sun's rotation
   */
  animateSun() {
    const sun = this.planetSystem.getSun();
    if (sun) {
      // Sun rotation (handles reverse with SETTINGS.acceleration sign)
      sun.rotateY(0.001 * SETTINGS.acceleration);
    }
  }

  /**
   * Animate all planets' rotation and orbital motion
   */
  animatePlanets() {
    const planets = this.planetSystem.getPlanets();

    // Define rotation and orbital speeds for each planet
    const planetAnimationData = {
      Mercury: { rotation: 0.001, orbit: 0.004 },
      Venus: { rotation: 0.0005, orbit: 0.0006 },
      Earth: { rotation: 0.005, orbit: 0.001 },
      Mars: { rotation: 0.01, orbit: 0.0007 },
      Jupiter: { rotation: 0.005, orbit: 0.0003 },
      Saturn: { rotation: 0.01, orbit: 0.0002 },
      Uranus: { rotation: 0.005, orbit: 0.0001 },
      Neptune: { rotation: 0.005, orbit: 0.00008 },
      Pluto: { rotation: 0.001, orbit: 0.00006 },
    };

    // Animate each planet
    Object.entries(planets).forEach(([name, planet]) => {
      const animData = planetAnimationData[name];
      if (animData) {
        // Planet self-rotation (handles reverse with SETTINGS.acceleration sign)
        planet.planet.rotateY(animData.rotation * SETTINGS.acceleration);

        // Planet orbital motion around sun (handles reverse with SETTINGS.accelerationOrbit sign)
        planet.planet3d.rotateY(animData.orbit * SETTINGS.accelerationOrbit);

        // Animate atmosphere if it exists (also follows rotation direction)
        if (planet.Atmosphere) {
          if (name === "Venus") {
            planet.Atmosphere.rotateY(0.0005 * SETTINGS.acceleration);
          } else if (name === "Earth") {
            planet.Atmosphere.rotateY(0.001 * SETTINGS.acceleration);
          }
        }
      }
    });
  }

  /**
   * Animate all moons orbiting their planets
   */
  animateMoons() {
    const planets = this.planetSystem.getPlanets();

    // Animate Earth's moon
    if (planets.Earth?.moons) {
      this.animateSphereMoons(planets.Earth, planets.Earth.moons);
    }

    // Animate Mars' moons (3D models)
    this.animateMarsMoons(planets.Mars);

    // Animate Jupiter's moons
    if (planets.Jupiter?.moons) {
      this.animateSphereMoons(planets.Jupiter, planets.Jupiter.moons);
    }
  }

  /**
   * Animate sphere-based moons (Earth, Jupiter)
   */
  animateSphereMoons(planet, moons) {
    moons.forEach((moon) => {
      if (!moon.mesh) return;

      const time = performance.now();
      let tiltAngle = 0;

      // Apply tilt for Earth's moon
      if (planet.name === "Earth") {
        tiltAngle = (5 * Math.PI) / 180;
      }

      // Moon orbital motion (handles reverse with SETTINGS.accelerationOrbit sign)
      const orbitDirection = SETTINGS.accelerationOrbit >= 0 ? 1 : -1;

      const moonX =
        planet.planet.position.x +
        moon.orbitRadius *
          Math.cos(time * moon.orbitSpeed * SETTINGS.accelerationOrbit);

      const moonY =
        moon.orbitRadius *
        Math.sin(time * moon.orbitSpeed * SETTINGS.accelerationOrbit) *
        Math.sin(tiltAngle);

      const moonZ =
        planet.planet.position.z +
        moon.orbitRadius *
          Math.sin(time * moon.orbitSpeed * SETTINGS.accelerationOrbit) *
          Math.cos(tiltAngle);

      moon.mesh.position.set(moonX, moonY, moonZ);

      // Moon self-rotation (handles reverse with SETTINGS.acceleration sign)
      moon.mesh.rotateY(0.01 * SETTINGS.acceleration);
    });
  }

  /**
   * Animate Mars' moons (3D models)
   */
  animateMarsMoons(mars) {
    if (!mars) return;

    MOON_CONFIGS.mars.forEach((moon) => {
      if (moon.mesh) {
        const time = performance.now();

        // Moon orbital motion (handles reverse with SETTINGS.accelerationOrbit sign)
        const moonX =
          mars.planet.position.x +
          moon.orbitRadius *
            Math.cos(time * moon.orbitSpeed * SETTINGS.accelerationOrbit);

        const moonY =
          moon.orbitRadius *
          Math.sin(time * moon.orbitSpeed * SETTINGS.accelerationOrbit);

        const moonZ =
          mars.planet.position.z +
          moon.orbitRadius *
            Math.sin(time * moon.orbitSpeed * SETTINGS.accelerationOrbit);

        moon.mesh.position.set(moonX, moonY, moonZ);

        // Moon self-rotation (handles reverse with SETTINGS.acceleration sign)
        moon.mesh.rotateY(0.001 * SETTINGS.acceleration);
      }
    });
  }

  /**
   * Animate asteroid belt rotation
   */
  animateAsteroids() {
    const asteroids = this.planetSystem.getAsteroids();

    asteroids.forEach((asteroid) => {
      // Asteroid self-rotation (handles reverse with SETTINGS.acceleration sign)
      asteroid.rotation.y += 0.0001 * (SETTINGS.acceleration >= 0 ? 1 : -1);

      // Orbital motion around sun (handles reverse with SETTINGS.accelerationOrbit sign)
      const orbitSpeed = 0.0001 * SETTINGS.accelerationOrbit;
      const cosOrbit = Math.cos(orbitSpeed);
      const sinOrbit = Math.sin(orbitSpeed);

      const newX =
        asteroid.position.x * cosOrbit + asteroid.position.z * sinOrbit;
      const newZ =
        asteroid.position.z * cosOrbit - asteroid.position.x * sinOrbit;

      asteroid.position.x = newX;
      asteroid.position.z = newZ;
    });
  }

  /**
   * Get animation status
   */
  isRunning() {
    return this.isAnimating;
  }
}
