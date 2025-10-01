import * as THREE from "three";
import { PLANET_DATA, CAMERA_CONFIG } from "./constants.js";

/**
 * Interaction System Module
 * Handles mouse events, planet selection, camera controls, and UI interactions
 */
export class InteractionSystem {
  constructor(
    camera,
    controls,
    outlinePass,
    raycastTargets,
    planetSystem,
    timeControl
  ) {
    this.camera = camera;
    this.controls = controls;
    this.outlinePass = outlinePass;
    this.raycastTargets = raycastTargets;
    this.planetSystem = planetSystem;
    this.timeControl = timeControl;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Planet selection state
    this.selectedPlanet = null;
    this.isMovingTowardsPlanet = false;
    this.targetCameraPosition = new THREE.Vector3();
    this.offset = 0;
    this.isPlanetInfoVisible = false;

    // Planet tracking state (follows planet after info card is closed)
    this.isTrackingPlanet = false;
    this.trackedPlanet = null;
    this.cameraRelativePosition = new THREE.Vector3();

    // Zoom out state
    this.isZoomingOut = false;
    this.zoomOutTargetPosition = new THREE.Vector3(
      CAMERA_CONFIG.zoomOutPosition.x,
      CAMERA_CONFIG.zoomOutPosition.y,
      CAMERA_CONFIG.zoomOutPosition.z
    );

    this.init();
  }

  /**
   * Initialize interaction system
   */
  init() {
    this.setupEventListeners();
    this.setupGlobalFunctions();
  }

  /**
   * Setup event listeners for mouse interactions
   */
  setupEventListeners() {
    window.addEventListener(
      "mousemove",
      (event) => this.onMouseMove(event),
      false
    );
    window.addEventListener(
      "mousedown",
      (event) => this.onMouseDown(event),
      false
    );
  }

  /**
   * Setup global functions for UI callbacks
   */
  setupGlobalFunctions() {
    // Make closeInfo function globally accessible for HTML onclick
    window.closeInfo = () => this.closeInfo();

    // Initialize tab functionality
    this.initializeTabs();
  }

  /**
   * Initialize tab switching functionality
   */
  initializeTabs() {
    document.addEventListener("click", (event) => {
      if (event.target.classList.contains("tab-btn")) {
        const tabId = event.target.getAttribute("data-tab");
        this.switchTab(tabId);
      }
    });
  }

  /**
   * Switch between tabs in planet info panel
   */
  switchTab(targetTab) {
    // Remove active class from all tabs and panels
    document
      .querySelectorAll(".tab-btn")
      .forEach((btn) => btn.classList.remove("active"));
    document
      .querySelectorAll(".tab-panel")
      .forEach((panel) => panel.classList.remove("active"));

    // Add active class to clicked tab and corresponding panel
    document.querySelector(`[data-tab="${targetTab}"]`).classList.add("active");
    document.getElementById(`tab-${targetTab}`).classList.add("active");
  }

  /**
   * Handle mouse movement for raycasting
   */
  onMouseMove(event) {
    event.preventDefault();
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  /**
   * Handle mouse click for planet selection
   */
  onMouseDown(event) {
    event.preventDefault();

    // Check if click is on time control UI area to avoid auto-pausing
    const timeControlContainer = document.getElementById(
      "timeControlContainer"
    );
    if (timeControlContainer) {
      const rect = timeControlContainer.getBoundingClientRect();
      const isOnTimeControl =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      if (isOnTimeControl) {
        // Don't process planet clicks if clicking on time control UI
        return;
      }
    }

    // Don't process planet clicks if planet info is currently visible
    if (this.isPlanetInfoVisible) {
      return;
    }

    // Store initial mouse position to detect if this is a drag operation
    this.mouseDownPosition = { x: event.clientX, y: event.clientY };
    this.mouseDownTime = Date.now();

    // Add mouseup listener to detect actual clicks vs drags
    const handleMouseUp = (upEvent) => {
      window.removeEventListener("mouseup", handleMouseUp);

      const mouseMoved =
        Math.abs(upEvent.clientX - this.mouseDownPosition.x) > 5 ||
        Math.abs(upEvent.clientY - this.mouseDownPosition.y) > 5;
      const timeElapsed = Date.now() - this.mouseDownTime;

      // Only process as planet selection if it's a quick click without much movement
      if (!mouseMoved && timeElapsed < 300) {
        this.processPlanetSelection(upEvent);
      }
    };

    window.addEventListener("mouseup", handleMouseUp);
  }

  /**
   * Process actual planet selection (separated from mouse down to avoid camera drag interference)
   */
  processPlanetSelection(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.raycastTargets);

    if (intersects.length > 0) {
      const clickedObject = intersects[0].object;
      this.selectedPlanet = this.identifyPlanet(clickedObject);

      if (this.selectedPlanet) {
        this.closeInfoNoZoomOut();

        // Automatically pause time control when celestial body is clicked
        this.timeControl.pause();

        // Update camera to look at the selected celestial body
        const bodyPosition = new THREE.Vector3();

        if (this.selectedPlanet.isSun) {
          // Sun is at the origin
          bodyPosition.set(0, 0, 0);
        } else {
          // Get planet position
          this.selectedPlanet.planet.getWorldPosition(bodyPosition);
        }

        this.controls.target.copy(bodyPosition);

        // Ensure controls remain enabled during focus
        this.controls.enabled = true;
        this.controls.enableRotate = true;
        this.controls.enableZoom = true;
        this.controls.enablePan = true;

        this.camera.lookAt(bodyPosition);

        this.targetCameraPosition
          .copy(bodyPosition)
          .add(
            this.camera.position
              .clone()
              .sub(bodyPosition)
              .normalize()
              .multiplyScalar(this.offset)
          );
        this.isMovingTowardsPlanet = true;
      }
    } else {
      // Clicked on empty space - stop tracking and free camera controls
      this.stopPlanetTracking();
      this.closeInfoNoZoomOut();
      this.freeCameraControls();
    }
  }

  /**
   * Identify which planet or sun was clicked based on the clicked object
   */
  identifyPlanet(clickedObject) {
    const planets = this.planetSystem.getPlanets();
    const sun = this.planetSystem.getSun();

    // Check if sun was clicked
    if (sun && clickedObject.material === sun.material) {
      this.offset = this.getCameraOffset("Sun");
      return { name: "Sun", planet: sun, isSun: true };
    }

    // Check each planet and set appropriate camera offset
    for (const [name, planet] of Object.entries(planets)) {
      if (clickedObject.material === planet.planet.material) {
        this.offset = this.getCameraOffset(name);
        return { ...planet, name, isSun: false };
      }

      // Check atmospheres
      if (
        planet.Atmosphere &&
        clickedObject.material === planet.Atmosphere.material
      ) {
        this.offset = this.getCameraOffset(name);
        return { ...planet, name, isSun: false };
      }
    }

    return null;
  }

  /**
   * Get appropriate camera offset for each planet and sun
   */
  getCameraOffset(planetName) {
    const offsets = {
      Sun: 80, // Much larger distance to view the whole sun properly
      Mercury: 10,
      Venus: 25,
      Earth: 25,
      Mars: 15,
      Jupiter: 50,
      Saturn: 50,
      Uranus: 25,
      Neptune: 20,
      Pluto: 10,
    };

    return offsets[planetName] || 20;
  }

  /**
   * Update outline highlighting based on mouse hover
   */
  updateOutlineHighlighting() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.raycastTargets);

    // Reset all outlines
    this.outlinePass.selectedObjects = [];

    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object;
      const planets = this.planetSystem.getPlanets();

      // If the intersected object is an atmosphere, find the corresponding planet
      if (intersectedObject === planets.Earth?.Atmosphere) {
        this.outlinePass.selectedObjects = [planets.Earth.planet];
      } else if (intersectedObject === planets.Venus?.Atmosphere) {
        this.outlinePass.selectedObjects = [planets.Venus.planet];
      } else {
        // For other planets, outline the intersected object itself
        this.outlinePass.selectedObjects = [intersectedObject];
      }
    }
  }

  /**
   * Update camera movement animations
   */
  updateCameraMovement() {
    if (this.isMovingTowardsPlanet) {
      // Smoothly move the camera towards the target position
      this.camera.position.lerp(this.targetCameraPosition, 0.07);

      // Check if the camera is close to the target position
      if (this.camera.position.distanceTo(this.targetCameraPosition) < 1) {
        this.isMovingTowardsPlanet = false;
        this.showPlanetInfo(this.selectedPlanet.name);
      }
    } else if (this.isZoomingOut) {
      this.camera.position.lerp(this.zoomOutTargetPosition, 0.08);

      // More robust completion check with multiple conditions
      const distance = this.camera.position.distanceTo(
        this.zoomOutTargetPosition
      );
      const isCloseEnough = distance < 2; // Increased threshold for reliability
      const isDampingComplete = distance < 0.1; // Very close for damping end

      if (isCloseEnough || isDampingComplete) {
        this.isZoomingOut = false;

        // Clear safety timeout
        if (this.zoomOutTimeout) {
          clearTimeout(this.zoomOutTimeout);
          this.zoomOutTimeout = null;
        }

        // Force final position to avoid floating point issues
        this.camera.position.copy(this.zoomOutTargetPosition);

        // Ensure controls are fully enabled and free after zoom out completes
        this.freeCameraControls();

        // Additional safety: force controls update
        this.controls.update();

        // Clear any target constraints to allow free rotation
        // Note: We don't set target to (0,0,0) here to avoid forcing focus on sun

        console.log("Zoom out animation completed - controls should be free");
      }
    } else if (this.isTrackingPlanet && this.trackedPlanet) {
      // Update camera and controls to follow the tracked planet
      this.updatePlanetTracking();
    }
  }

  /**
   * Update camera tracking for the selected planet
   */
  updatePlanetTracking() {
    if (!this.trackedPlanet || this.trackedPlanet.isSun) return;

    // Get current planet position
    const planetPosition = new THREE.Vector3();
    this.trackedPlanet.planet.getWorldPosition(planetPosition);

    // Instantly update camera position to follow the planet (no lerp delay)
    // Don't touch controls.target - let user control where they look
    const newCameraPosition = planetPosition
      .clone()
      .add(this.cameraRelativePosition);
    this.camera.position.copy(newCameraPosition); // Instant following - no lerp

    // Keep controls completely free - user can look anywhere, zoom, rotate
    // No target constraints - total freedom of movement
  }

  /**
   * Show planet information panel
   */
  showPlanetInfo(planetName) {
    const info = document.getElementById("planetInfo");
    const name = document.getElementById("planetName");
    const planetData = PLANET_DATA[planetName];

    // Update header
    name.innerText = planetName;
    const planetType = document.getElementById("planetType");
    planetType.innerText = planetName === "Sun" ? "Star" : "Planet";

    // Update planet type indicator dot color
    const planetTypeDot = document.querySelector(".planet-type-dot");
    const planetColors = {
      Sun: "#FFD700",
      Mercury: "#8C7853",
      Venus: "#FFC649",
      Earth: "#4A9EFF",
      Mars: "#CD5C5C",
      Jupiter: "#D8A260",
      Saturn: "#FAE5A3",
      Uranus: "#4FD0E7",
      Neptune: "#4169E1",
      Pluto: "#8C6239",
    };
    planetTypeDot.style.backgroundColor = planetColors[planetName] || "#4A9EFF";

    // Update info cards
    document.getElementById("planetRadius").textContent = planetData.radius;
    document.getElementById("planetTilt").textContent = planetData.tilt;
    document.getElementById("planetRotation").textContent = planetData.rotation;
    document.getElementById("planetOrbit").textContent = planetData.orbit;
    document.getElementById("planetDistance").textContent = planetData.distance;
    document.getElementById("planetMoons").textContent = planetData.moons;

    // Update related items based on planet
    this.updateRelatedItems(planetName);

    // Reset to first tab
    this.switchTab("info");

    info.style.display = "block";
    this.isPlanetInfoVisible = true;
  }

  /**
   * Update related missions and satellites for each planet
   */
  updateRelatedItems(planetName) {
    const relatedMissions = document.getElementById("relatedMissions");
    const relatedMoons = document.getElementById("relatedMoons");

    // Clear existing content
    relatedMissions.innerHTML = "";
    relatedMoons.innerHTML = "";

    // Planet-specific missions and satellites
    const planetRelated = {
      Sun: {
        missions: ["Parker Solar Probe", "Solar Orbiter", "SOHO"],
        moons: [],
      },
      Mercury: {
        missions: ["MESSENGER", "BepiColombo"],
        moons: [],
      },
      Venus: {
        missions: ["Magellan", "Venus Express", "Akatsuki"],
        moons: [],
      },
      Earth: {
        missions: [
          "International Space Station",
          "Hubble Space Telescope",
          "James Webb Space Telescope",
        ],
        moons: ["Moon"],
      },
      Mars: {
        missions: [
          "Perseverance Rover",
          "Curiosity Rover",
          "Mars Reconnaissance Orbiter",
        ],
        moons: ["Phobos", "Deimos"],
      },
      Jupiter: {
        missions: ["Juno", "Galileo", "Europa Clipper"],
        moons: ["Io", "Europa", "Ganymede", "Callisto"],
      },
      Saturn: {
        missions: ["Cassini-Huygens", "Dragonfly"],
        moons: ["Titan", "Enceladus", "Mimas", "Iapetus"],
      },
      Uranus: {
        missions: ["Voyager 2"],
        moons: ["Titania", "Oberon", "Umbriel", "Ariel"],
      },
      Neptune: {
        missions: ["Voyager 2"],
        moons: ["Triton", "Nereid"],
      },
      Pluto: {
        missions: ["New Horizons"],
        moons: ["Charon", "Nix", "Hydra"],
      },
    };

    const data = planetRelated[planetName] || { missions: [], moons: [] };

    // Add missions
    data.missions.forEach((mission) => {
      const item = document.createElement("div");
      item.className = "related-item";
      item.innerHTML = `
        <span class="related-icon">🛰️</span>
        <span class="related-name">${mission}</span>
      `;
      relatedMissions.appendChild(item);
    });

    // Add moons
    data.moons.forEach((moon) => {
      const item = document.createElement("div");
      item.className = "related-item";
      item.innerHTML = `
        <span class="related-icon">🌙</span>
        <span class="related-name">${moon}</span>
      `;
      relatedMoons.appendChild(item);
    });

    // Hide sections if empty
    const missionsSection = relatedMissions.closest(".related-section");
    const moonsSection = relatedMoons.closest(".related-section");

    missionsSection.style.display = data.missions.length > 0 ? "block" : "none";
    moonsSection.style.display = data.moons.length > 0 ? "block" : "none";
  }

  /**
   * Close planet info and zoom out with free controls
   */
  closeInfo() {
    const info = document.getElementById("planetInfo");
    info.style.display = "none";
    this.isPlanetInfoVisible = false;

    // Stop any current tracking to prevent conflicts
    this.stopPlanetTracking();

    // Always start zoom out animation when closing info panel
    this.isZoomingOut = true;

    // Safety timeout: if zoom out doesn't complete in 5 seconds, force free controls
    this.zoomOutTimeout = setTimeout(() => {
      if (this.isZoomingOut) {
        console.warn("Zoom out animation timeout - forcing free controls");
        this.isZoomingOut = false;
        this.freeCameraControls();
        this.controls.update();
      }
    }, 5000);

    // Resume time control when closing planet details
    this.timeControl.resume();
  }

  /**
   * Close info when clicking another planet (no zoom out)
   */
  closeInfoNoZoomOut() {
    const info = document.getElementById("planetInfo");
    info.style.display = "none";
    this.isPlanetInfoVisible = false;

    // Stop any current tracking
    this.stopPlanetTracking();

    // Resume time control when closing planet details to view another planet
    this.timeControl.resume();
  }

  /**
   * Start tracking a planet's movement
   */
  startPlanetTracking() {
    if (!this.selectedPlanet || this.selectedPlanet.isSun) return;

    this.isTrackingPlanet = true;
    this.trackedPlanet = this.selectedPlanet;

    // Get planet position
    const planetPosition = new THREE.Vector3();
    this.selectedPlanet.planet.getWorldPosition(planetPosition);

    // Position camera directly above the planet (like initial sun view)
    // Use similar offset as the initial camera position relative to sun
    const overheadPosition = new THREE.Vector3(
      planetPosition.x - 175, // Same X offset as initial camera
      planetPosition.y + 115, // Same Y offset (above)
      planetPosition.z + 5 // Same Z offset as initial camera
    );

    // Set camera to overhead position
    this.camera.position.copy(overheadPosition);

    // Set controls target to the planet (directly below camera)
    this.controls.target.copy(planetPosition);

    // Store the relative offset for tracking (overhead view)
    this.cameraRelativePosition.set(-175, 115, 5);

    // Free camera controls but maintain tracking
    this.freeCameraControls();

    console.log(`Started overhead tracking of ${this.selectedPlanet.name}`);
  }

  /**
   * Stop tracking a planet
   */
  stopPlanetTracking() {
    this.isTrackingPlanet = false;
    this.trackedPlanet = null;
    this.cameraRelativePosition.set(0, 0, 0);
    console.log("Stopped planet tracking");
  }

  /**
   * Free camera controls for unrestricted navigation
   */
  freeCameraControls() {
    // Enable all control types
    this.controls.enabled = true;
    this.controls.enableRotate = true;
    this.controls.enableZoom = true;
    this.controls.enablePan = true;
    this.controls.autoRotate = false;

    // Reset damping to ensure smooth navigation
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.75;

    // Don't force any specific target - let user control the view
    // this.controls.target.set(0, 0, 0); // Removed to allow free navigation

    this.controls.update();
  }

  // Getter methods
  getSelectedPlanet() {
    return this.selectedPlanet;
  }
  getIsPlanetInfoVisible() {
    return this.isPlanetInfoVisible;
  }
}
