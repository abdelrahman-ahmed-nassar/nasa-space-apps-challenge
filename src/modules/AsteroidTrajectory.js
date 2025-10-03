import * as THREE from "three";
import { SETTINGS, getCurrentAsteroid } from "./constants.js";

/**
 * Simplified Asteroid Trajectory System
 * Creates a linear path from starting XYZ to Earth at impact date
 */
export class AsteroidTrajectory {
  constructor(scene, timeControl, earth) {
    this.scene = scene;
    this.timeControl = timeControl;
    this.earth = earth;

    this.asteroid = null;
    this.isActive = false;
    this.startPosition = new THREE.Vector3();
    this.endPosition = new THREE.Vector3();
    this.impactDate = null;
    this.startDate = null;
    this.trajectory = [];
    this.trajectoryLine = null; // Visual trajectory path
  }

  /**
   * Calculate Earth's position at any given date
   * Uses same orbital mechanics as existing Earth animation
   */
  calculateEarthPosition(date) {
    // Get days since epoch (same as your existing system)
    const epoch = new Date(2025, 9, 1); // Oct 1, 2025 (your starting date)
    const daysSinceEpoch = (date - epoch) / (1000 * 60 * 60 * 24);

    // Calculate Earth's orbital angle (same as existing system)
    const earthOrbitRadius = 90; // Your Earth's distance from Sun
    const earthOrbitAngle = (daysSinceEpoch / 365.25) * Math.PI * 2;

    return new THREE.Vector3(
      Math.cos(earthOrbitAngle) * earthOrbitRadius,
      0,
      Math.sin(earthOrbitAngle) * earthOrbitRadius
    );
  }

  /**
   * Setup asteroid trajectory
   * @param {Object} config - { startXYZ: {x, y, z}, endXYZ: {x, y, z}, impactDate: Date }
   */
  setupTrajectory(config = null) {
    // Use provided config or get current asteroid configuration
    const asteroidConfig = config || getCurrentAsteroid();

    const { startPosition, endPosition, impactDate } = asteroidConfig;

    // Store configuration
    this.startPosition.set(startPosition.x, startPosition.y, startPosition.z);
    this.impactDate = new Date(impactDate);
    this.startDate = new Date(this.timeControl.getSimulationDate());

    // Use direct end position
    this.endPosition.set(endPosition.x, endPosition.y, endPosition.z);
    console.log(
      `Using direct end position: (${endPosition.x}, ${endPosition.y}, ${endPosition.z})`
    );

    console.log(
      `Asteroid trajectory setup for: ${asteroidConfig.name || "Unknown"}`
    );
    console.log(
      `Start: (${startPosition.x}, ${startPosition.y}, ${startPosition.z})`
    );
    console.log(
      `End: (${this.endPosition.x.toFixed(1)}, ${this.endPosition.y.toFixed(
        1
      )}, ${this.endPosition.z.toFixed(1)})`
    );
    console.log(`Impact date: ${this.impactDate.toDateString()}`);

    // Create asteroid object
    this.createAsteroid();

    // Generate trajectory points for visualization
    this.generateTrajectoryPoints();

    this.isActive = true;
    return true;
  }

  /**
   * Create the asteroid 3D object
   */
  createAsteroid() {
    // Remove existing asteroid if any
    if (this.asteroid) {
      this.scene.remove(this.asteroid);
    }

    // Get current asteroid configuration
    const asteroidConfig = getCurrentAsteroid();

    // Create asteroid geometry using configuration
    const geometry = new THREE.SphereGeometry(asteroidConfig.size, 16, 16);
    const material = new THREE.MeshPhongMaterial({
      color: asteroidConfig.color,
      emissive: asteroidConfig.color,
      emissiveIntensity: 0.3,
      roughness: 0.8,
      metalness: 0.1,
    });

    this.asteroid = new THREE.Mesh(geometry, material);
    this.asteroid.position.copy(this.startPosition);
    this.asteroid.castShadow = true;
    this.scene.add(this.asteroid);

    console.log(
      `🌑 Asteroid "${asteroidConfig.name}" created at starting position:`,
      this.startPosition
    );
    console.log("🌑 Asteroid size:", asteroidConfig.size);
    console.log("🌑 Asteroid color:", asteroidConfig.color.toString(16));
  }

  /**
   * Generate trajectory visualization points
   */
  generateTrajectoryPoints() {
    this.trajectory = [];
    const numPoints = 100;

    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;

      // Linear interpolation between start and end
      const point = new THREE.Vector3().lerpVectors(
        this.startPosition,
        this.endPosition,
        t
      );

      // Calculate corresponding date
      const timeDiff = this.impactDate - this.startDate;
      const pointDate = new Date(this.startDate.getTime() + timeDiff * t);

      this.trajectory.push({
        position: point.clone(),
        date: pointDate,
        progress: t,
      });
    }

    console.log(`Generated ${this.trajectory.length} trajectory points`);

    // Create visual trajectory line
    this.createTrajectoryVisualization();
  }

  /**
   * Create visual trajectory line
   */
  createTrajectoryVisualization() {
    // Remove existing trajectory line if any
    if (this.trajectoryLine) {
      this.scene.remove(this.trajectoryLine);
    }

    // Get current asteroid configuration
    const asteroidConfig = getCurrentAsteroid();

    // Create line geometry from trajectory points
    const points = this.trajectory.map((point) => point.position);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const material = new THREE.LineBasicMaterial({
      color: asteroidConfig.trailColor,
      transparent: true,
      opacity: 0.6,
      linewidth: 2,
    });

    this.trajectoryLine = new THREE.Line(geometry, material);
    this.scene.add(this.trajectoryLine);

    console.log(
      `🛤️ Trajectory path visualization created for ${asteroidConfig.name}`
    );
  }

  /**
   * Update asteroid position based on current simulation time
   */
  update() {
    if (!this.isActive || !this.asteroid || !this.trajectory.length) return;

    const currentDate = this.timeControl.getSimulationDate();

    // Check if we've passed the impact date
    if (currentDate >= this.impactDate) {
      this.triggerImpact();
      return;
    }

    // Check if we're before the start date
    if (currentDate < this.startDate) {
      this.asteroid.position.copy(this.startPosition);
      return;
    }

    // Calculate progress based on time
    const totalTime = this.impactDate - this.startDate;
    const elapsed = currentDate - this.startDate;
    const progress = Math.max(0, Math.min(1, elapsed / totalTime));

    // Interpolate position
    const currentPosition = new THREE.Vector3().lerpVectors(
      this.startPosition,
      this.endPosition,
      progress
    );

    this.asteroid.position.copy(currentPosition);

    // Optional: Rotate asteroid
    this.asteroid.rotation.x += 0.01;
    this.asteroid.rotation.y += 0.02;

    // Debug info
    if (Math.random() < 0.01) {
      // Log occasionally
      const timeToImpact =
        (this.impactDate - currentDate) / (1000 * 60 * 60 * 24);
      console.log(
        `Asteroid progress: ${(progress * 100).toFixed(
          1
        )}%, Time to impact: ${timeToImpact.toFixed(1)} days`
      );
    }
  }

  /**
   * Trigger impact event
   */
  triggerImpact() {
    console.log("ASTEROID IMPACT!");

    // Position asteroid at Earth
    this.asteroid.position.copy(this.endPosition);

    // Create impact effects
    this.createImpactEffects();

    // Stop the simulation
    this.isActive = false;
  }

  /**
   * Create simple impact effects
   */
  createImpactEffects() {
    // Get current asteroid configuration
    const asteroidConfig = getCurrentAsteroid();

    // Create explosion particle system using configuration
    const particleCount = asteroidConfig.explosionParticles;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = this.endPosition.x + (Math.random() - 0.5) * 5;
      positions[i + 1] = this.endPosition.y + (Math.random() - 0.5) * 5;
      positions[i + 2] = this.endPosition.z + (Math.random() - 0.5) * 5;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xff0000, // Always use red for collision effects
      size: 0.5,
      transparent: true,
      opacity: 0.8,
    });

    const explosion = new THREE.Points(geometry, material);
    this.scene.add(explosion);

    // Remove explosion after 3 seconds
    setTimeout(() => {
      this.scene.remove(explosion);
    }, 3000);

    console.log(
      `Impact effects created for ${asteroidConfig.name} (red explosion)`
    );
  }

  /**
   * Switch to a different asteroid (this method is now handled by the main app)
   * @param {number} asteroidIndex - Index of the asteroid to switch to
   */
  switchAsteroid(asteroidIndex) {
    console.warn(
      "switchAsteroid method is deprecated. Use the main app switchToAsteroid method instead."
    );
    return null;
  }

  /**
   * Get current asteroid information for UI display
   */
  getCurrentAsteroidInfo() {
    return getCurrentAsteroid();
  }

  /**
   * Get trajectory visualization points for debugging
   */
  getTrajectoryPoints() {
    return this.trajectory.map((point) => point.position);
  }

  /**
   * Reset the simulation
   */
  reset() {
    if (this.asteroid) {
      this.scene.remove(this.asteroid);
      this.asteroid = null;
    }

    if (this.trajectoryLine) {
      this.scene.remove(this.trajectoryLine);
      this.trajectoryLine = null;
    }

    this.isActive = false;
    this.trajectory = [];

    console.log("Asteroid simulation reset");
  }

  /**
   * Check if simulation is active
   */
  getIsActive() {
    return this.isActive;
  }

  /**
   * Get current asteroid position
   */
  getAsteroidPosition() {
    return this.asteroid ? this.asteroid.position.clone() : null;
  }

  /**
   * Get time until impact in days
   */
  getTimeToImpact() {
    if (!this.isActive || !this.impactDate) return null;

    const currentDate = this.timeControl.getSimulationDate();
    return (this.impactDate - currentDate) / (1000 * 60 * 60 * 24);
  }

  /**
   * Helper function to get current Earth position for experimentation
   * Call this in console to see where Earth is right now
   */
  getCurrentEarthPosition() {
    const currentDate = this.timeControl.getSimulationDate();
    const earthPos = this.calculateEarthPosition(currentDate);
    console.log(
      `🌍 Current Earth position: (${earthPos.x.toFixed(
        2
      )}, ${earthPos.y.toFixed(2)}, ${earthPos.z.toFixed(2)})`
    );
    console.log(`📅 Current date: ${currentDate.toDateString()}`);
    return earthPos;
  }

  /**
   * Helper function to get Earth position at any specific date
   */
  getEarthPositionAtDate(dateString) {
    const date = new Date(dateString);
    const earthPos = this.calculateEarthPosition(date);
    console.log(
      `🌍 Earth position on ${date.toDateString()}: (${earthPos.x.toFixed(
        2
      )}, ${earthPos.y.toFixed(2)}, ${earthPos.z.toFixed(2)})`
    );
    return earthPos;
  }
}
