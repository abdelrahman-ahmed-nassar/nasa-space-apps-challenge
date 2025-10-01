import { SceneSetup } from "./modules/sceneSetup.js";
import { PlanetSystem } from "./modules/planetSystem.js";
import { TimeControl } from "./modules/timeControl.js";
import { InteractionSystem } from "./modules/interactionSystem.js";
import { AnimationSystem } from "./modules/animationSystem.js";

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
  }

  /**
   * Initialize the entire application
   */
  async init() {
    console.log("Initializing Solar System 3D Application...");

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

      console.log("🚀 Solar System 3D Application fully initialized!");
    } catch (error) {
      console.error("❌ Error initializing application:", error);
      throw error;
    }
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
    await app.init();

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
