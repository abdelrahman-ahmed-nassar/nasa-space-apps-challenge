import * as THREE from "three";
import { SETTINGS, getCurrentAsteroid } from "./constants.js";
import { CrashVideo } from "./crashVideo.js";

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

    // Initialize crash video system (modified to show intro video)
    this.crashVideo = new CrashVideo();
  }

  /**
   * Initialize the asteroid trajectory system
   */
  init() {
    // Initialize crash video system (modified to show intro video)
    this.crashVideo.init(() => {
      console.log(
        "Intro video completed after asteroid impact, resetting simulation..."
      );
      // Reset simulation after intro video completes
      this.reset();
    });

    console.log("✓ Asteroid trajectory system initialized");
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
   * Create the asteroid 3D object with enhanced visuals
   */
  createAsteroid() {
    // Remove existing asteroid if any
    if (this.asteroid) {
      this.scene.remove(this.asteroid);
    }

    // Get current asteroid configuration
    const asteroidConfig = getCurrentAsteroid();

    // Create asteroid geometry with more detail
    const geometry = new THREE.SphereGeometry(asteroidConfig.size, 32, 32);

    // Slightly deform the sphere to make it more realistic
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const vertex = new THREE.Vector3();
      vertex.fromBufferAttribute(positions, i);

      // Add random deformation to make it look more like a real asteroid
      const noise = (Math.random() - 0.5) * 0.2;
      vertex.multiplyScalar(1 + noise);

      positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    positions.needsUpdate = true;
    geometry.computeVertexNormals();

    // Enhanced material with more realistic properties
    const material = new THREE.MeshPhongMaterial({
      color: asteroidConfig.color,
      emissive: new THREE.Color(asteroidConfig.color).multiplyScalar(0.1),
      emissiveIntensity: 0.2,
      roughness: 0.9,
      metalness: 0.05,
      shininess: 1,
      specular: 0x111111,
    });

    this.asteroid = new THREE.Mesh(geometry, material);
    this.asteroid.position.copy(this.startPosition);
    this.asteroid.castShadow = true;
    this.asteroid.receiveShadow = true;

    // Add rotation data for animation
    this.asteroidRotationSpeed = {
      x: (Math.random() - 0.5) * 0.02,
      y: (Math.random() - 0.5) * 0.03,
      z: (Math.random() - 0.5) * 0.01,
    };

    this.scene.add(this.asteroid);

    // Create particle trail system
    this.createParticleTrail();

    console.log(
      `🌑 Enhanced asteroid "${asteroidConfig.name}" created at starting position:`,
      this.startPosition
    );
    console.log("🌑 Asteroid size:", asteroidConfig.size);
    console.log("🌑 Asteroid color:", asteroidConfig.color.toString(16));
  }

  /**
   * Create particle trail system for the asteroid
   */
  createParticleTrail() {
    // Remove existing trail if any
    if (this.particleTrail) {
      this.scene.remove(this.particleTrail);
    }

    const asteroidConfig = getCurrentAsteroid();
    const particleCount = 200;

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const trailColor = new THREE.Color(asteroidConfig.trailColor);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Initially position all particles at asteroid start position
      positions[i3] = this.startPosition.x;
      positions[i3 + 1] = this.startPosition.y;
      positions[i3 + 2] = this.startPosition.z;

      // Color with slight variation
      const colorVariation = 0.3;
      colors[i3] = trailColor.r + (Math.random() - 0.5) * colorVariation;
      colors[i3 + 1] = trailColor.g + (Math.random() - 0.5) * colorVariation;
      colors[i3 + 2] = trailColor.b + (Math.random() - 0.5) * colorVariation;

      // Random sizes
      sizes[i] = Math.random() * 0.5 + 0.1;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 0.3,
      transparent: true,
      opacity: 0.8,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    this.particleTrail = new THREE.Points(geometry, material);
    this.scene.add(this.particleTrail);

    // Initialize trail tracking
    this.trailPositions = [];
    this.trailMaxLength = 50;

    console.log("✨ Particle trail system created");
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
   * Create enhanced trajectory visualization with animated particles
   */
  createTrajectoryVisualization() {
    // Remove existing trajectory elements if any
    if (this.trajectoryLine) {
      this.scene.remove(this.trajectoryLine);
    }
    if (this.trajectoryParticles) {
      this.scene.remove(this.trajectoryParticles);
    }

    // Get current asteroid configuration
    const asteroidConfig = getCurrentAsteroid();

    // Create trajectory line
    this.createTrajectoryLine(asteroidConfig);

    // Create animated particles along trajectory
    this.createTrajectoryParticles(asteroidConfig);

    console.log(
      `🛤️ Enhanced trajectory visualization created for ${asteroidConfig.name}`
    );
  }

  /**
   * Create the trajectory line
   */
  createTrajectoryLine(asteroidConfig) {
    // Create infinite trajectory line extending backwards from starting point
    const direction = new THREE.Vector3()
      .subVectors(this.endPosition, this.startPosition)
      .normalize();

    // Extend the line infinitely backwards from the starting position
    const infiniteDistance = 10000; // Very large distance to simulate infinity
    const infiniteStartPosition = new THREE.Vector3()
      .copy(this.startPosition)
      .add(direction.clone().multiplyScalar(-infiniteDistance));

    // Create infinite trajectory points from infinite start to original end
    const infinitePoints = [];
    const totalPoints = 300; // Many points for smooth infinite line

    for (let i = 0; i <= totalPoints; i++) {
      const t = i / totalPoints;
      const point = new THREE.Vector3().lerpVectors(
        infiniteStartPosition,
        this.endPosition,
        t
      );
      infinitePoints.push(point);
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(infinitePoints);

    // Enhanced material with gradient effect
    const material = new THREE.LineBasicMaterial({
      color: asteroidConfig.trailColor,
      transparent: true,
      opacity: 0.6,
      linewidth: 3,
    });

    this.trajectoryLine = new THREE.Line(geometry, material);
    this.scene.add(this.trajectoryLine);
  }

  /**
   * Create animated particles along trajectory
   */
  createTrajectoryParticles(asteroidConfig) {
    const particleCount = 100;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const trailColor = new THREE.Color(asteroidConfig.trailColor);

    // Initialize particles along the trajectory
    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount;
      const position = new THREE.Vector3().lerpVectors(
        this.startPosition,
        this.endPosition,
        t
      );

      const i3 = i * 3;
      positions[i3] = position.x;
      positions[i3 + 1] = position.y;
      positions[i3 + 2] = position.z;

      // Color with brightness variation
      const brightness = 0.5 + Math.random() * 0.5;
      colors[i3] = trailColor.r * brightness;
      colors[i3 + 1] = trailColor.g * brightness;
      colors[i3 + 2] = trailColor.b * brightness;

      sizes[i] = Math.random() * 0.5 + 0.2;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 0.4,
      transparent: true,
      opacity: 0.8,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    this.trajectoryParticles = new THREE.Points(geometry, material);
    this.scene.add(this.trajectoryParticles);

    // Initialize animation properties
    this.trajectoryParticleOffsets = new Array(particleCount)
      .fill()
      .map(() => Math.random() * Math.PI * 2);
    this.trajectoryAnimationTime = 0;
  }

  /**
   * Update trajectory particle animation
   */
  updateTrajectoryAnimation() {
    if (!this.trajectoryParticles) return;

    this.trajectoryAnimationTime += 0.05;

    const positions = this.trajectoryParticles.geometry.attributes.position;
    const positionArray = positions.array;
    const sizes = this.trajectoryParticles.geometry.attributes.size;
    const sizeArray = sizes.array;

    for (let i = 0; i < positionArray.length / 3; i++) {
      const i3 = i * 3;

      // Create pulsing effect
      const pulse =
        Math.sin(
          this.trajectoryAnimationTime + this.trajectoryParticleOffsets[i]
        ) *
          0.3 +
        0.7;
      sizeArray[i] = (Math.random() * 0.5 + 0.2) * pulse;

      // Add subtle movement along trajectory
      const t = i / (positionArray.length / 3);
      const basePosition = new THREE.Vector3().lerpVectors(
        this.startPosition,
        this.endPosition,
        t
      );

      // Add flowing motion
      const flowOffset =
        (this.trajectoryAnimationTime + i * 0.1) % (Math.PI * 2);
      const flowIntensity = 0.5;

      positionArray[i3] = basePosition.x + Math.sin(flowOffset) * flowIntensity;
      positionArray[i3 + 1] =
        basePosition.y + Math.cos(flowOffset * 1.3) * flowIntensity;
      positionArray[i3 + 2] =
        basePosition.z + Math.sin(flowOffset * 0.7) * flowIntensity;
    }

    positions.needsUpdate = true;
    sizes.needsUpdate = true;

    // Update material opacity with pulsing effect
    const basePulse = Math.sin(this.trajectoryAnimationTime * 2) * 0.2 + 0.8;
    this.trajectoryParticles.material.opacity = basePulse;
  }

  /**
   * Update asteroid position based on current simulation time with enhanced effects
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
      this.updateParticleTrail();
      return;
    }

    // Calculate progress based on time
    const totalTime = this.impactDate - this.startDate;
    const elapsed = currentDate - this.startDate;
    let progress = Math.max(0, Math.min(1, elapsed / totalTime));

    // Add acceleration effect as asteroid gets closer to Earth (gravity effect)
    // Use easing function to simulate gravitational acceleration
    progress = this.applyGravitationalAcceleration(progress);

    // Interpolate position
    const currentPosition = new THREE.Vector3().lerpVectors(
      this.startPosition,
      this.endPosition,
      progress
    );

    this.asteroid.position.copy(currentPosition);

    // Enhanced rotation with realistic asteroid tumbling
    if (this.asteroidRotationSpeed) {
      this.asteroid.rotation.x += this.asteroidRotationSpeed.x;
      this.asteroid.rotation.y += this.asteroidRotationSpeed.y;
      this.asteroid.rotation.z += this.asteroidRotationSpeed.z;
    }

    // Scale asteroid slightly as it approaches (perspective effect)
    const scaleMultiplier = 1 + progress * 0.5; // Grows up to 50% larger
    this.asteroid.scale.setScalar(scaleMultiplier);

    // Update particle trail
    this.updateParticleTrail();

    // Update trajectory animation
    this.updateTrajectoryAnimation();

    // Add atmospheric entry effects when close to Earth
    if (progress > 0.8) {
      this.addAtmosphericEntryEffects(progress);
    }

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
   * Apply gravitational acceleration effect
   * @param {number} linearProgress - Linear progress from 0 to 1
   * @returns {number} - Accelerated progress
   */
  applyGravitationalAcceleration(linearProgress) {
    // Use quadratic easing for the last 30% of the journey
    if (linearProgress > 0.7) {
      const lastPhase = (linearProgress - 0.7) / 0.3;
      const accelerated = lastPhase * lastPhase;
      return 0.7 + accelerated * 0.3;
    }
    return linearProgress;
  }

  /**
   * Update particle trail to follow asteroid
   */
  updateParticleTrail() {
    if (!this.particleTrail || !this.asteroid) return;

    // Add current asteroid position to trail
    this.trailPositions.push(this.asteroid.position.clone());

    // Limit trail length
    if (this.trailPositions.length > this.trailMaxLength) {
      this.trailPositions.shift();
    }

    // Update particle positions
    const positions = this.particleTrail.geometry.attributes.position;
    const positionArray = positions.array;

    for (
      let i = 0;
      i < Math.min(this.trailPositions.length, positionArray.length / 3);
      i++
    ) {
      const trailPos = this.trailPositions[this.trailPositions.length - 1 - i];
      const particleIndex = i * 3;

      // Add some randomness to particle positions
      const spread = 0.5;
      positionArray[particleIndex] =
        trailPos.x + (Math.random() - 0.5) * spread;
      positionArray[particleIndex + 1] =
        trailPos.y + (Math.random() - 0.5) * spread;
      positionArray[particleIndex + 2] =
        trailPos.z + (Math.random() - 0.5) * spread;
    }

    positions.needsUpdate = true;
  }

  /**
   * Add atmospheric entry effects when asteroid is close to Earth
   * @param {number} progress - Current progress (0-1)
   */
  addAtmosphericEntryEffects(progress) {
    if (!this.asteroid) return;

    // Increase emissive intensity as asteroid heats up
    const heatIntensity = (progress - 0.8) / 0.2; // 0 to 1 for last 20%
    const material = this.asteroid.material;

    // Heat up effect - make it glow more
    material.emissiveIntensity = 0.2 + heatIntensity * 0.8;

    // Shift color towards red/orange as it heats up
    const originalColor = new THREE.Color(material.color);
    const heatColor = new THREE.Color(0xff4400); // Orange-red
    material.emissive.lerpColors(originalColor, heatColor, heatIntensity * 0.5);

    // Add flickering effect
    const flicker = Math.sin(Date.now() * 0.02) * 0.1;
    material.emissiveIntensity += flicker * heatIntensity;
  }

  /**
   * Trigger impact event
   */
  triggerImpact() {
    console.log("🚨 ASTEROID IMPACT DETECTED!");

    // Position asteroid at Earth for final moment
    this.asteroid.position.copy(this.endPosition);

    // Create brief impact effects
    this.createImpactEffects();

    // Remove asteroid and trajectory after brief delay
    setTimeout(() => {
      console.log("💥 Removing asteroid and trajectory...");

      // Remove asteroid from scene
      if (this.asteroid) {
        this.scene.remove(this.asteroid);
        this.asteroid = null;
      }

      // Remove trajectory line from scene
      if (this.trajectoryLine) {
        this.scene.remove(this.trajectoryLine);
        this.trajectoryLine = null;
      }

      // Stop the simulation
      this.isActive = false;

      // Play crash video after impact
      console.log("🎬 Starting crash video sequence after asteroid impact...");
      this.crashVideo.play();
    }, 1000); // 1 second delay to show impact effects briefly
  }

  /**
   * Create enhanced impact effects with multiple stages
   */
  createImpactEffects() {
    // Get current asteroid configuration
    const asteroidConfig = getCurrentAsteroid();

    console.log(
      `💥 Creating enhanced impact effects for ${asteroidConfig.name}`
    );

    // Stage 1: Initial flash
    this.createInitialFlash();

    // Stage 2: Main explosion (immediate)
    this.createMainExplosion(asteroidConfig);

    // Stage 3: Shockwave (0.2s delay)
    setTimeout(() => {
      this.createShockwave();
    }, 200);

    // Stage 4: Debris cloud (0.5s delay)
    setTimeout(() => {
      this.createDebrisCloud(asteroidConfig);
    }, 500);

    // Stage 5: Secondary explosions (1s delay)
    setTimeout(() => {
      this.createSecondaryExplosions();
    }, 1000);

    // Add screen effects
    this.createScreenEffects();
  }

  /**
   * Create initial bright flash effect with reduced size
   */
  createInitialFlash() {
    const flashGeometry = new THREE.SphereGeometry(8, 16, 16); // Reduced from 15 to 8
    const flashMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8, // Reduced from 0.9
    });

    const flash = new THREE.Mesh(flashGeometry, flashMaterial);
    flash.position.copy(this.endPosition);
    this.scene.add(flash);

    // Animate flash expansion and fade - faster animation
    let scale = 0.1;
    let opacity = 0.8;
    const flashInterval = setInterval(() => {
      scale += 0.4; // Faster expansion
      opacity -= 0.15; // Faster fade

      flash.scale.setScalar(scale);
      flash.material.opacity = Math.max(0, opacity);

      if (opacity <= 0) {
        this.scene.remove(flash);
        clearInterval(flashInterval);
      }
    }, 40); // Slightly faster interval (was 50)
  }

  /**
   * Create main explosion with controlled particles
   */
  createMainExplosion(asteroidConfig) {
    // Reduce particle count - use original amount instead of doubling
    const particleCount = Math.min(asteroidConfig.explosionParticles, 150); // Cap at 150 particles
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Initial positions at impact point
      positions[i3] = this.endPosition.x;
      positions[i3 + 1] = this.endPosition.y;
      positions[i3 + 2] = this.endPosition.z;

      // Reduced velocities for more controlled explosion
      velocities[i3] = (Math.random() - 0.5) * 8; // Reduced from 20 to 8
      velocities[i3 + 1] = (Math.random() - 0.5) * 8;
      velocities[i3 + 2] = (Math.random() - 0.5) * 8;

      // Color gradient from white to red to orange
      const colorType = Math.random();
      if (colorType < 0.3) {
        // White hot
        colors[i3] = 1.0;
        colors[i3 + 1] = 1.0;
        colors[i3 + 2] = 1.0;
      } else if (colorType < 0.6) {
        // Red
        colors[i3] = 1.0;
        colors[i3 + 1] = 0.2;
        colors[i3 + 2] = 0.0;
      } else {
        // Orange
        colors[i3] = 1.0;
        colors[i3 + 1] = 0.5;
        colors[i3 + 2] = 0.0;
      }

      // Smaller particle sizes
      sizes[i] = Math.random() * 1.2 + 0.3; // Reduced from 2 + 0.5
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 0.8, // Reduced from 1.0
      transparent: true,
      opacity: 1.0,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    const explosion = new THREE.Points(geometry, material);
    this.scene.add(explosion);

    // Animate explosion particles
    let time = 0;
    const maxTime = 120; // Reduced from 300 to 120 (2 seconds instead of 5)
    const explosionInterval = setInterval(() => {
      time++;
      const positions = explosion.geometry.attributes.position;
      const positionArray = positions.array;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positionArray[i3] += velocities[i3] * 0.08; // Slightly reduced speed
        positionArray[i3 + 1] += velocities[i3 + 1] * 0.08;
        positionArray[i3 + 2] += velocities[i3 + 2] * 0.08;

        // Apply gravity
        velocities[i3 + 1] -= 0.08; // Reduced gravity effect
      }

      positions.needsUpdate = true;

      // Faster fade out
      explosion.material.opacity = Math.max(0, 1 - time / maxTime);

      if (time >= maxTime) {
        this.scene.remove(explosion);
        clearInterval(explosionInterval);
      }
    }, 16); // ~60fps
  }

  /**
   * Create expanding shockwave effect with controlled size
   */
  createShockwave() {
    const shockwaveGeometry = new THREE.RingGeometry(0, 1, 32);
    const shockwaveMaterial = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.6, // Reduced from 0.7
      side: THREE.DoubleSide,
    });

    const shockwave = new THREE.Mesh(shockwaveGeometry, shockwaveMaterial);
    shockwave.position.copy(this.endPosition);
    shockwave.lookAt(0, 0, 0); // Orient towards camera
    this.scene.add(shockwave);

    // Animate shockwave expansion with smaller maximum size
    let scale = 0.1;
    let opacity = 0.6;
    const maxScale = 15; // Limit maximum size
    const shockwaveInterval = setInterval(() => {
      scale += 1.5; // Slightly slower expansion
      opacity -= 0.06; // Faster fade

      shockwave.scale.setScalar(Math.min(scale, maxScale));
      shockwave.material.opacity = Math.max(0, opacity);

      if (opacity <= 0 || scale >= maxScale) {
        this.scene.remove(shockwave);
        clearInterval(shockwaveInterval);
      }
    }, 50);
  }

  /**
   * Create debris cloud effect with reduced duration
   */
  createDebrisCloud(asteroidConfig) {
    const debrisCount = 25; // Reduced from 50
    const debrisGroup = new THREE.Group();

    for (let i = 0; i < debrisCount; i++) {
      const debrisGeometry = new THREE.BoxGeometry(
        Math.random() * 0.3 + 0.1, // Smaller debris
        Math.random() * 0.3 + 0.1,
        Math.random() * 0.3 + 0.1
      );
      const debrisMaterial = new THREE.MeshPhongMaterial({
        color: asteroidConfig.color,
        emissive: new THREE.Color(asteroidConfig.color).multiplyScalar(0.2),
      });

      const debris = new THREE.Mesh(debrisGeometry, debrisMaterial);
      debris.position.copy(this.endPosition);
      debris.position.add(
        new THREE.Vector3(
          (Math.random() - 0.5) * 6, // Reduced spread from 10 to 6
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 6
        )
      );

      // Random rotation
      debris.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );

      debrisGroup.add(debris);
    }

    this.scene.add(debrisGroup);

    // Remove debris after 4 seconds instead of 10
    setTimeout(() => {
      this.scene.remove(debrisGroup);
    }, 4000);
  }

  /**
   * Create fewer secondary explosions
   */
  createSecondaryExplosions() {
    const numSecondary = 2; // Reduced from 3

    for (let i = 0; i < numSecondary; i++) {
      setTimeout(() => {
        const secondaryPosition = this.endPosition.clone().add(
          new THREE.Vector3(
            (Math.random() - 0.5) * 12, // Reduced spread from 20 to 12
            (Math.random() - 0.5) * 12,
            (Math.random() - 0.5) * 12
          )
        );

        this.createSecondaryExplosion(secondaryPosition);
      }, i * 300);
    }
  }

  /**
   * Create a single secondary explosion with fewer particles
   */
  createSecondaryExplosion(position) {
    const particleCount = 50; // Reduced from 100
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = position.x + (Math.random() - 0.5) * 3; // Reduced spread from 5 to 3
      positions[i3 + 1] = position.y + (Math.random() - 0.5) * 3;
      positions[i3 + 2] = position.z + (Math.random() - 0.5) * 3;

      // Orange/red colors
      colors[i3] = 1.0;
      colors[i3 + 1] = Math.random() * 0.5;
      colors[i3 + 2] = 0.0;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.6, // Reduced from 0.8
      transparent: true,
      opacity: 0.8,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
    });

    const secondaryExplosion = new THREE.Points(geometry, material);
    this.scene.add(secondaryExplosion);

    // Remove after 1.5 seconds instead of 2
    setTimeout(() => {
      this.scene.remove(secondaryExplosion);
    }, 1500);
  }

  /**
   * Create screen effects for impact
   */
  createScreenEffects() {
    // Add camera shake effect by modifying the camera position slightly
    const originalCameraShake = 0;
    let shakeIntensity = 5;
    let shakeTime = 0;
    const maxShakeTime = 100; // frames

    const shakeInterval = setInterval(() => {
      if (this.scene && this.scene.userData && this.scene.userData.camera) {
        const camera = this.scene.userData.camera;

        // Apply random shake
        camera.position.x += (Math.random() - 0.5) * shakeIntensity;
        camera.position.y += (Math.random() - 0.5) * shakeIntensity;
        camera.position.z += (Math.random() - 0.5) * shakeIntensity;
      }

      shakeTime++;
      shakeIntensity *= 0.95; // Gradually reduce shake

      if (shakeTime >= maxShakeTime || shakeIntensity < 0.1) {
        clearInterval(shakeInterval);
      }
    }, 16); // ~60fps

    console.log("📺 Screen effects added (camera shake)");
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

    if (this.trajectoryParticles) {
      this.scene.remove(this.trajectoryParticles);
      this.trajectoryParticles = null;
    }

    if (this.particleTrail) {
      this.scene.remove(this.particleTrail);
      this.particleTrail = null;
    }

    this.isActive = false;
    this.trajectory = [];
    this.trailPositions = [];
    this.asteroidRotationSpeed = null;

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
