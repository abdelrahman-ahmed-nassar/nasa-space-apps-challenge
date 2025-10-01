import { SceneSetup } from "./modules/sceneSetup.js";
import { PlanetSystem } from "./modules/planetSystem.js";
import { TimeControl } from "./modules/timeControl.js";
import { InteractionSystem } from "./modules/interactionSystem.js";
import { AnimationSystem } from "./modules/animationSystem.js";
import { IntroVideo } from "./modules/introVideo.js";

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
    this.isInitialized = false;
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

      // Initialize animation system
      this.animationSystem = new AnimationSystem(
        this.planetSystem,
        this.timeControl,
        this.interactionSystem,
        this.sceneSetup.getComposer(),
        this.sceneSetup.getControls()
      );

      // Start the animation loop
      this.animationSystem.start();
      console.log("✓ Animation system started");

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
   * Get application modules for external access if needed
   */
  getModules() {
    return {
      sceneSetup: this.sceneSetup,
      planetSystem: this.planetSystem,
      timeControl: this.timeControl,
      interactionSystem: this.interactionSystem,
      animationSystem: this.animationSystem,
    };
  }

  /**
   * Cleanup resources when needed
   */
  destroy() {
    if (this.animationSystem) {
      this.animationSystem.stop();
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
    await app.start(); // Changed from app.init() to app.start()

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
