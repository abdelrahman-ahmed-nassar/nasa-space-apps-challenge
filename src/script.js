import { SceneSetup } from "./modules/sceneSetup.js";
import { PlanetSystem } from "./modules/planetSystem.js";
import { TimeControl } from "./modules/timeControl.js";
import { InteractionSystem } from "./modules/interactionSystem.js";
import { AnimationSystem } from "./modules/animationSystem.js";
import { IntroVideo } from "./modules/introVideo.js";
import { AsteroidTrajectory } from "./modules/AsteroidTrajectory.js";
import {
  ASTEROIDS_CONFIG,
  getCurrentAsteroid,
  setCurrentAsteroid,
} from "./modules/constants.js";

/**
 * Helper function to calculate countdown in years, months, days, hours, minutes, seconds
 * @param {number} timeDiffMs - Time difference in milliseconds
 * @returns {Object} - Object containing years, months, days, hours, minutes, seconds
 */
function calculateCountdownTime(timeDiffMs) {
  const absTimeDiff = Math.abs(timeDiffMs);

  // Calculate time units
  const years = Math.floor(absTimeDiff / (1000 * 60 * 60 * 24 * 365.25));
  const months = Math.floor(
    (absTimeDiff % (1000 * 60 * 60 * 24 * 365.25)) /
      (1000 * 60 * 60 * 24 * 30.44)
  );
  const days = Math.floor(
    (absTimeDiff % (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24)
  );
  const hours = Math.floor(
    (absTimeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((absTimeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((absTimeDiff % (1000 * 60)) / 1000);

  return { years, months, days, hours, minutes, seconds };
}

/**
 * Format countdown time for display
 * @param {Object} timeObj - Object with years, months, days, hours, minutes, seconds
 * @returns {string} - Formatted countdown string
 */
function formatCountdownTime(timeObj) {
  const { years, months, days, hours, minutes, seconds } = timeObj;

  // Show different formats based on time remaining
  if (years > 0) {
    return `${String(years).padStart(2, "0")}Y : ${String(months).padStart(
      2,
      "0"
    )}M : ${String(days).padStart(2, "0")}D : ${String(hours).padStart(
      2,
      "0"
    )}H`;
  } else if (months > 0) {
    return `${String(months).padStart(2, "0")}M : ${String(days).padStart(
      2,
      "0"
    )}D : ${String(hours).padStart(2, "0")}H : ${String(minutes).padStart(
      2,
      "0"
    )}m`;
  } else {
    return `${String(days).padStart(2, "0")}D : ${String(hours).padStart(
      2,
      "0"
    )}H : ${String(minutes).padStart(2, "0")}m : ${String(seconds).padStart(
      2,
      "0"
    )}s`;
  }
}

/**
 * ASTEROID CONFIGURATION:
 * To modify asteroid settings, edit ASTEROID_CONFIG in /modules/constants.js
 *
 * Available settings:
 * - startPosition: { x, y, z } - Starting coordinates of asteroid
 * - impactDate: 'YYYY-MM-DD' - Date when asteroid hits Earth
 * - size: number - Radius of asteroid sphere
 * - color: hex - Color of asteroid (e.g., 0x8B4513 for brown)
 * - trailColor: hex - Color of explosion effect
 * - explosionParticles: number - Amount of particles in explosion
 */

/**
 * Solar System 3D Application
 * Main application class that orchestrates all modules
 */
class SolarSystemApp {
  constructor() {
    this.sceneSetup = null;
    this.planetSystem = null;
    this.timeControl = null;
    this.interactionSystem = null;
    this.animationSystem = null;
    this.introVideo = null;
    this.asteroidTrajectory = null;
    this.isInitialized = false;

    // Asteroid swiper properties
    this.currentAsteroidIndex = 0;
    this.asteroidSwiperContainer = null;
    this.asteroidCards = null;
  }

  /**
   * Initialize the intro video first
   */
  async start() {
    console.log("🎬 Starting Solar System 3D Application with intro video...");

    // Initialize intro video
    this.introVideo = new IntroVideo();
    this.introVideo.init(() => {
      // This callback runs when intro is complete
      this.initMainApp();
    });
  }

  /**
   * Initialize the main application after intro
   */
  async initMainApp() {
    if (this.isInitialized) return;

    console.log("🚀 Initializing main Solar System 3D Application...");

    try {
      // Initialize scene setup
      this.sceneSetup = new SceneSetup();
      console.log("✓ Scene setup completed");

      // Initialize planet system
      this.planetSystem = new PlanetSystem(
        this.sceneSetup.getScene(),
        this.sceneSetup.getTextureLoader(),
        this.sceneSetup.getPointLight()
      );

      // Create sun and all planets
      this.planetSystem.createSun();
      this.planetSystem.createAllPlanets();
      console.log("✓ Planet system created");

      // Load asteroid belts
      this.planetSystem.loadAsteroids(
        "/asteroids/asteroidPack.glb",
        1000,
        130,
        160
      );
      this.planetSystem.loadAsteroids(
        "/asteroids/asteroidPack.glb",
        3000,
        352,
        370
      );
      console.log("✓ Asteroid belts loaded");

      // Initialize time control system
      this.timeControl = new TimeControl();
      this.timeControl.init();
      console.log("✓ Time control system initialized");

      // Initialize interaction system
      this.interactionSystem = new InteractionSystem(
        this.sceneSetup.getCamera(),
        this.sceneSetup.getControls(),
        this.sceneSetup.getOutlinePass(),
        this.planetSystem.getRaycastTargets(),
        this.planetSystem,
        this.timeControl
      );
      console.log("✓ Interaction system initialized");

      // Initialize asteroid trajectory system
      this.asteroidTrajectory = new AsteroidTrajectory(
        this.sceneSetup.getScene(),
        this.timeControl,
        this.planetSystem.planets.earth?.planetMesh
      );

      // Initialize the asteroid trajectory system (including crash video)
      this.asteroidTrajectory.init();
      console.log("✓ Asteroid trajectory system initialized");

      // Initialize asteroid swiper UI
      this.initializeAsteroidSwiper();

      // Initialize animation system
      this.animationSystem = new AnimationSystem(
        this.planetSystem,
        this.timeControl,
        this.interactionSystem,
        this.sceneSetup.getComposer(),
        this.sceneSetup.getControls(),
        this.asteroidTrajectory,
        this // Pass the app instance for countdown updates
      );

      // Start the animation loop
      this.animationSystem.start();
      console.log("✓ Animation system started");

      // Setup first asteroid immediately when app starts
      this.setupDefaultAsteroid();

      // Initialize navigation button states
      this.updateNavigationButtons();

      this.isInitialized = true;
      console.log("🌌 Solar System 3D Application fully initialized!");
    } catch (error) {
      console.error("❌ Error initializing main application:", error);
      throw error;
    }
  }

  /**
   * Initialize the entire application (legacy method for compatibility)
   */
  async init() {
    return this.start();
  }

  /**
   * Public method to update countdown timers - called by animation system
   */
  updateCountdownTimersPublic() {
    this.updateCountdownTimers();
  }

  /**
   * Get application modules for external access if needed
   */
  getModules() {
    return {
      sceneSetup: this.sceneSetup,
      planetSystem: this.planetSystem,
      timeControl: this.timeControl,
      interactionSystem: this.interactionSystem,
      animationSystem: this.animationSystem,
      asteroidTrajectory: this.asteroidTrajectory,
      updateCountdownTimers: () => this.updateCountdownTimersPublic(),
    };
  }

  /**
   * Setup default asteroid with current configuration
   */
  setupDefaultAsteroid() {
    // Setup asteroid trajectory using current asteroid
    if (this.asteroidTrajectory) {
      const success = this.asteroidTrajectory.setupTrajectory();
      if (success) {
        const currentAsteroid = getCurrentAsteroid();
        console.log(
          `🌑 Default asteroid "${currentAsteroid.name}" trajectory initialized`
        );
        console.log(
          `Start position: (${currentAsteroid.startPosition.x}, ${currentAsteroid.startPosition.y}, ${currentAsteroid.startPosition.z})`
        );
        console.log(`Impact date: ${currentAsteroid.impactDate}`);
      } else {
        console.error("❌ Failed to setup default asteroid");
      }
    }
  }

  /**
   * Initialize asteroid swiper UI
   */
  initializeAsteroidSwiper() {
    this.asteroidSwiperContainer = document.getElementById(
      "asteroidSwiperContainer"
    );
    this.asteroidCards = document.getElementById("asteroidCards");

    if (!this.asteroidSwiperContainer || !this.asteroidCards) {
      console.error("Asteroid swiper elements not found");
      return;
    }

    // Generate asteroid cards
    this.generateAsteroidCards();

    // Setup navigation buttons
    this.setupSwiperNavigation();

    // Start countdown timer updates
    this.startCountdownUpdates();

    // Show the swiper immediately
    this.asteroidSwiperContainer.classList.add("visible");
    this.asteroidSwiperContainer.classList.remove("hidden");

    console.log("✓ Asteroid swiper initialized (visible)");
  }

  /**
   * Generate HTML cards for all asteroids
   */
  generateAsteroidCards() {
    const cardsHTML = ASTEROIDS_CONFIG.map((asteroid, index) => {
      const riskClass = `risk-${asteroid.riskLevel
        .toLowerCase()
        .replace(" ", "-")}`;

      // Calculate time until impact using simulation time
      const impactDate = new Date(asteroid.impactDate);
      const simulationTime = this.timeControl
        ? this.timeControl.getSimulationDate()
        : new Date();
      const timeDiff = impactDate - simulationTime;

      const countdownTime = calculateCountdownTime(timeDiff);
      const countdownText =
        timeDiff > 0 ? formatCountdownTime(countdownTime) : "IMPACT OCCURRED";

      return `
        <div class="asteroid-card" data-index="${index}" style="--asteroid-color: #${asteroid.color
        .toString(16)
        .padStart(6, "0")}">
          <div class="asteroid-name">${asteroid.name}</div>
          <div class="asteroid-description">${asteroid.description}</div>
          
          <div class="asteroid-data-section">
            <div class="asteroid-data-row">
              <span class="asteroid-data-label">DIAMETER</span>
              <span class="asteroid-data-value">${asteroid.diameter}</span>
            </div>
            <div class="asteroid-data-row">
              <span class="asteroid-data-label">RISK LEVEL</span>
              <span class="asteroid-data-value">${asteroid.riskLevel}</span>
            </div>
            <div class="asteroid-data-row">
              <span class="asteroid-data-label">VELOCITY</span>
              <span class="asteroid-data-value">${asteroid.velocity}</span>
            </div>
          </div>

          <div class="asteroid-countdown">
            <div class="countdown-label">TIME TO IMPACT</div>
            <div class="countdown-time">${countdownText}</div>
            <div class="countdown-units">YEARS : MONTHS : DAYS : HOURS</div>
          </div>
        </div>
      `;
    }).join("");

    this.asteroidCards.innerHTML = cardsHTML;

    // Update total count
    const totalAsteroidsElement = document.getElementById("totalAsteroids");
    if (totalAsteroidsElement) {
      totalAsteroidsElement.textContent = ASTEROIDS_CONFIG.length;
    }

    // Update current index
    this.updateCurrentAsteroidIndicator();
  }

  /**
   * Setup swiper navigation buttons
   */
  setupSwiperNavigation() {
    const prevBtn = document.getElementById("prevAsteroid");
    const nextBtn = document.getElementById("nextAsteroid");

    if (prevBtn) {
      prevBtn.addEventListener("click", () => this.previousAsteroid());
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => this.nextAsteroid());
    }

    // Add keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        this.previousAsteroid();
      } else if (e.key === "ArrowRight") {
        this.nextAsteroid();
      }
    });

    // Add touch/swipe support
    this.setupTouchNavigation();
  }

  /**
   * Setup touch navigation for mobile devices
   */
  setupTouchNavigation() {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    this.asteroidCards.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    });

    this.asteroidCards.addEventListener("touchmove", (e) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
    });

    this.asteroidCards.addEventListener("touchend", () => {
      if (!isDragging) return;
      isDragging = false;

      const deltaX = currentX - startX;
      const minSwipeDistance = 50;

      if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0) {
          this.previousAsteroid();
        } else {
          this.nextAsteroid();
        }
      }
    });
  }

  /**
   * Navigate to previous asteroid (with looping)
   */
  previousAsteroid() {
    let newIndex;
    if (this.currentAsteroidIndex > 0) {
      newIndex = this.currentAsteroidIndex - 1;
    } else {
      // Loop to last asteroid when at first
      newIndex = ASTEROIDS_CONFIG.length - 1;
    }
    this.switchToAsteroid(newIndex);
  }

  /**
   * Navigate to next asteroid (with looping)
   */
  nextAsteroid() {
    let newIndex;
    if (this.currentAsteroidIndex < ASTEROIDS_CONFIG.length - 1) {
      newIndex = this.currentAsteroidIndex + 1;
    } else {
      // Loop to first asteroid when at last
      newIndex = 0;
    }
    this.switchToAsteroid(newIndex);
  }

  /**
   * Switch to specific asteroid by index
   */
  switchToAsteroid(index) {
    if (index < 0 || index >= ASTEROIDS_CONFIG.length) return;

    this.currentAsteroidIndex = index;

    // Update global current asteroid
    setCurrentAsteroid(index);

    // Update card position
    this.updateCardPosition();

    // Always update asteroid in 3D scene since cards are always visible
    if (this.asteroidTrajectory) {
      this.asteroidTrajectory.reset();
      this.asteroidTrajectory.setupTrajectory();
    }

    // Update UI indicators
    this.updateCurrentAsteroidIndicator();
    this.updateNavigationButtons();

    const currentAsteroid = getCurrentAsteroid();
    console.log(`Switched to asteroid: ${currentAsteroid.name}`);
  }

  /**
   * Update card position for smooth animation
   */
  updateCardPosition() {
    const offset = -this.currentAsteroidIndex * 100;
    this.asteroidCards.style.transform = `translateX(${offset}%)`;
  }

  /**
   * Update current asteroid indicator
   */
  updateCurrentAsteroidIndicator() {
    const indicator = document.getElementById("currentAsteroidIndex");
    if (indicator) {
      indicator.textContent = this.currentAsteroidIndex + 1;
    }
  }

  /**
   * Update navigation button states (always enabled for looping)
   */
  updateNavigationButtons() {
    const prevBtn = document.getElementById("prevAsteroid");
    const nextBtn = document.getElementById("nextAsteroid");

    // Always enable both buttons since we have looping
    if (prevBtn) {
      prevBtn.disabled = false;
    }

    if (nextBtn) {
      nextBtn.disabled = false;
    }
  }

  /**
   * Start countdown timer updates synchronized with simulation time
   */
  startCountdownUpdates() {
    // Update countdown every animation frame for smooth time control synchronization
    // This will be called from the animation loop rather than a fixed interval
    console.log(
      "✓ Countdown timers will update with animation loop for time sync"
    );
  }

  /**
   * Update all countdown timers based on simulation time
   */
  updateCountdownTimers() {
    if (!this.timeControl) return;

    const cards = document.querySelectorAll(".asteroid-card");
    cards.forEach((card, index) => {
      const asteroid = ASTEROIDS_CONFIG[index];
      const impactDate = new Date(asteroid.impactDate);

      // Use simulation time instead of real time
      const simulationTime = this.timeControl.getSimulationDate();
      const timeDiff = impactDate - simulationTime;

      const countdownElement = card.querySelector(".countdown-time");
      if (countdownElement) {
        if (timeDiff > 0) {
          const countdownTime = calculateCountdownTime(timeDiff);
          countdownElement.textContent = formatCountdownTime(countdownTime);
        } else {
          // Impact has passed
          countdownElement.textContent = "IMPACT OCCURRED";
        }
      }
    });
  }

  /**
   * Setup asteroid impact simulation
   * @param {Object} config - { startXYZ: {x, y, z}, impactDate: Date }
   */
  setupAsteroidImpact(config) {
    if (this.asteroidTrajectory) {
      return this.asteroidTrajectory.setupTrajectory(config);
    }
    return false;
  }

  /**
   * Cleanup resources when needed
   */
  destroy() {
    if (this.animationSystem) {
      this.animationSystem.stop();
    }

    // Clear any intervals
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }

    // Additional cleanup can be added here if needed
    console.log("Application destroyed");
  }
}

/**
 * Initialize and start the application
 */
async function startApplication() {
  try {
    const app = new SolarSystemApp();
    await app.start();

    // Make app available globally for debugging
    window.solarSystemApp = app;
  } catch (error) {
    console.error("Failed to start Solar System application:", error);
  }
}

// Start the application when the page loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startApplication);
} else {
  startApplication();
}
