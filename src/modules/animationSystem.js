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
    controls,
    asteroidTrajectory = null,
    app = null
  ) {
    this.planetSystem = planetSystem;
    this.timeControl = timeControl;
    this.interactionSystem = interactionSystem;
    this.composer = composer;
    this.controls = controls;
    this.asteroidTrajectory = asteroidTrajectory;
    this.app = app; // Reference to main app for countdown updates

    this.isAnimating = false;
    this.frameCounter = 0; // Add frame counter for throttling UI updates
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

    this.frameCounter++;

    // Update simulation time and time control
    this.timeControl.updateSimulationTime();

    // Animate all celestial bodies
    this.animateSun();
    this.animatePlanets();
    this.animateMoons();
    this.animateAsteroids();

    // Update asteroid trajectory if active
    this.updateAsteroidTrajectory();

    // Update countdown timers (throttled to every 30 frames ≈ 0.5 seconds at 60 FPS)
    if (this.app && this.frameCounter % 30 === 0) {
      this.app.updateCountdownTimersPublic();
    }

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
    // Orbital speeds are relative to Earth's orbital speed (29.78 km/s = 1.000 reference)
    // Based on NASA data: https://nssdc.gsfc.nasa.gov/planetary/factsheet/
    const baseOrbitSpeed = 0.001; // Earth's reference orbital speed
    const planetAnimationData = {
      Mercury: {
        rotation: 0.001,
        orbit: baseOrbitSpeed * 1.59, // 47.36 km/s = 1.590 × Earth speed
      },
      Venus: {
        rotation: -0.0005, // Venus rotates backwards (retrograde)
        orbit: baseOrbitSpeed * 1.176, // 35.02 km/s = 1.176 × Earth speed
      },
      Earth: {
        rotation: 0.005,
        orbit: baseOrbitSpeed * 1.0, // 29.78 km/s = 1.000 × Earth speed (reference)
      },
      Mars: {
        rotation: 0.01,
        orbit: baseOrbitSpeed * 0.809, // 24.077 km/s = 0.809 × Earth speed
      },
      Jupiter: {
        rotation: 0.005,
        orbit: baseOrbitSpeed * 0.439, // 13.07 km/s = 0.439 × Earth speed
      },
      Saturn: {
        rotation: 0.01,
        orbit: baseOrbitSpeed * 0.325, // 9.69 km/s = 0.325 × Earth speed
      },
      Uranus: {
        rotation: -0.005, // Uranus rotates on its side, effectively backwards
        orbit: baseOrbitSpeed * 0.229, // 6.81 km/s = 0.229 × Earth speed
      },
      Neptune: {
        rotation: 0.005,
        orbit: baseOrbitSpeed * 0.182, // 5.43 km/s = 0.182 × Earth speed
      },
      Pluto: {
        rotation: 0.001,
        orbit: baseOrbitSpeed * 0.159, // 4.74 km/s = 0.159 × Earth speed
      },
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
            // Venus atmosphere rotates backwards (retrograde) like the planet
            planet.Atmosphere.rotateY(-0.0005 * SETTINGS.acceleration);
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
   * Update asteroid trajectory simulation
   */
  updateAsteroidTrajectory() {
    if (this.asteroidTrajectory && this.asteroidTrajectory.getIsActive()) {
      this.asteroidTrajectory.update();
    }
  }

  /**
   * Set asteroid trajectory system
   */
  setAsteroidTrajectory(asteroidTrajectory) {
    this.asteroidTrajectory = asteroidTrajectory;
  }

  /**
   * Get animation status
   */
  isRunning() {
    return this.isAnimating;
  }
}
