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

    // Don't process planet clicks if planet info is currently visible
    if (this.isPlanetInfoVisible) {
      return;
    }

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
      // Clicked on empty space - free the camera controls
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

      if (this.camera.position.distanceTo(this.zoomOutTargetPosition) < 1) {
        this.isZoomingOut = false;

        // Ensure controls are fully enabled and free after zoom out completes
        this.freeCameraControls();

        // Clear any target constraints to allow free rotation
        // Note: We don't set target to (0,0,0) here to avoid forcing focus on sun
      }
    }
  }

  /**
   * Show planet information panel
   */
  showPlanetInfo(planetName) {
    const info = document.getElementById("planetInfo");
    const name = document.getElementById("planetName");
    const details = document.getElementById("planetDetails");

    name.innerText = planetName;
    const planetData = PLANET_DATA[planetName];
    details.innerText = `Radius: ${planetData.radius}\nTilt: ${planetData.tilt}\nRotation: ${planetData.rotation}\nOrbit: ${planetData.orbit}\nDistance: ${planetData.distance}\nMoons: ${planetData.moons}\nInfo: ${planetData.info}`;

    info.style.display = "block";
    this.isPlanetInfoVisible = true;
  }

  /**
   * Close planet info and zoom out to overview
   */
  closeInfo() {
    const info = document.getElementById("planetInfo");
    info.style.display = "none";
    this.isPlanetInfoVisible = false;
    this.isZoomingOut = true;

    // Don't force target to sun - let user freely navigate
    // this.controls.target.set(0, 0, 0); // Removed this line

    // Free camera controls for unrestricted navigation
    this.freeCameraControls();

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

    // Resume time control when closing planet details to view another planet
    this.timeControl.resume();
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
