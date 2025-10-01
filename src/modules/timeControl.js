import { TIME_CONTROL_CONFIG, SETTINGS } from "./constants.js";

/**
 * Time Control Module
 * Handles time progression, UI controls, and simulation timing
 */
export class TimeControl {
  constructor() {
    this.isPaused = false;
    this.currentSpeedIndex = 0;
    this.speedModes = TIME_CONTROL_CONFIG.speedModes;

    // Simulation time tracking
    this.simulationDate = new Date(2025, 9, 1, 6, 39, 36); // Oct 1, 2025, 06:39:36
    this.lastFrameTime = performance.now();
    this.earthOrbitAngle = 0; // Track Earth's orbital angle in radians
    this.startingDate = new Date(2025, 9, 1); // Starting date for synchronization
    this.startingOrbitAngle = 0; // Earth's orbital position at the starting date

    // UI element references
    this.elements = {
      speedLabel: null,
      playPauseBtn: null,
      speedIndicator: null,
      progressArc: null,
      timeControlContainer: null,
      currentDateElement: null,
    };

    this.isDragging = false;
  }

  /**
   * Initialize time control UI and event listeners
   */
  init() {
    this.initializeElements();
    this.setupEventListeners();
    this.updateUI();
    this.updateTimeDisplay();
  }

  /**
   * Initialize DOM element references
   */
  initializeElements() {
    this.elements.speedLabel = document.getElementById("speedLabel");
    this.elements.playPauseBtn = document.getElementById("playPause");
    this.elements.speedIndicator = document.getElementById("speedIndicator");
    this.elements.progressArc = document.getElementById("progressArc");
    this.elements.timeControlContainer = document.getElementById(
      "timeControlContainer"
    );
    this.elements.currentDateElement = document.getElementById("currentDate");
  }

  /**
   * Setup event listeners for time control UI
   */
  setupEventListeners() {
    const prevBtn = document.getElementById("prevSpeed");
    const nextBtn = document.getElementById("nextSpeed");

    // Previous speed button
    prevBtn.addEventListener("click", () => {
      if (this.currentSpeedIndex > 0) {
        this.currentSpeedIndex--;
        this.updateUI();
      }
    });

    // Next speed button
    nextBtn.addEventListener("click", () => {
      if (this.currentSpeedIndex < this.speedModes.length - 1) {
        this.currentSpeedIndex++;
        this.updateUI();
      }
    });

    // Play/pause button
    this.elements.playPauseBtn.addEventListener("click", () => {
      this.togglePause();
    });

    // Dragging functionality for speed indicator
    this.setupDragControls();
  }

  /**
   * Setup drag controls for the speed indicator
   */
  setupDragControls() {
    this.elements.speedIndicator.addEventListener("mousedown", (e) => {
      this.isDragging = true;
      e.preventDefault();
    });

    document.addEventListener("mousemove", (e) => {
      if (!this.isDragging) return;

      const svg = document.querySelector(".curved-progress-svg");
      const rect = svg.getBoundingClientRect();

      // Get mouse position relative to SVG
      const mouseX = e.clientX - rect.left;

      // Clamp mouseX to the curve bounds (50 to 350)
      const clampedX = Math.max(50, Math.min(350, mouseX));

      // Calculate progress based on X position (0 to 1)
      const progress = (clampedX - 50) / (350 - 50);

      this.currentSpeedIndex = Math.round(
        progress * (this.speedModes.length - 1)
      );
      this.updateUI();
    });

    document.addEventListener("mouseup", () => {
      this.isDragging = false;
    });
  }

  /**
   * Get current speed multiplier
   */
  getCurrentSpeed() {
    if (this.isPaused) return 0;
    return this.speedModes[this.currentSpeedIndex].multiplier;
  }

  /**
   * Get current speed label
   */
  getSpeedLabel() {
    if (this.isPaused) return "PAUSED";
    return this.speedModes[this.currentSpeedIndex].label;
  }

  /**
   * Toggle pause state
   */
  togglePause() {
    this.isPaused = !this.isPaused;
    this.updateUI();
  }

  /**
   * Pause the simulation
   */
  pause() {
    this.isPaused = true;
    this.updateUI();
  }

  /**
   * Resume the simulation
   */
  resume() {
    this.isPaused = false;
    this.updateUI();
  }

  /**
   * Update time control UI elements
   */
  updateUI() {
    if (
      !this.elements.speedLabel ||
      !this.elements.playPauseBtn ||
      !this.elements.speedIndicator ||
      !this.elements.progressArc ||
      !this.elements.timeControlContainer
    ) {
      return; // Exit if elements aren't initialized yet
    }

    this.elements.speedLabel.textContent = this.getSpeedLabel();

    // Update progress curve position
    const progress = this.currentSpeedIndex / (this.speedModes.length - 1);

    // Calculate position along the curved line using quadratic Bezier curve
    const t = progress;
    const startX = 50,
      startY = 20;
    const controlX = 200,
      controlY = 60;
    const endX = 350,
      endY = 20;

    // Quadratic Bezier curve formula: B(t) = (1-t)²P₀ + 2(1-t)tP₁ + t²P₂
    const cx =
      Math.pow(1 - t, 2) * startX +
      2 * (1 - t) * t * controlX +
      Math.pow(t, 2) * endX;
    const cy =
      Math.pow(1 - t, 2) * startY +
      2 * (1 - t) * t * controlY +
      Math.pow(t, 2) * endY;

    this.elements.speedIndicator.setAttribute("cx", cx);
    this.elements.speedIndicator.setAttribute("cy", cy);

    // Update progress curve path - from start to current position
    this.elements.progressArc.setAttribute(
      "d",
      `M 50 20 Q ${50 + (controlX - 50) * t} ${
        20 + (controlY - 20) * t
      } ${cx} ${cy}`
    );

    // Update paused state
    if (this.isPaused) {
      this.elements.timeControlContainer.classList.add("paused");
      this.elements.playPauseBtn.innerHTML = "&#9654;"; // Play symbol
    } else {
      this.elements.timeControlContainer.classList.remove("paused");
      this.elements.playPauseBtn.innerHTML = "&#9208;"; // Pause symbol
    }
  }

  /**
   * Update simulation time based on time control settings
   */
  updateSimulationTime() {
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastFrameTime) / 1000; // Convert to seconds
    this.lastFrameTime = currentTime;

    if (!this.isPaused) {
      const speedMultiplier = this.getCurrentSpeed();

      // Calculate orbital progression based on simulation time
      const radiansPerDay = (Math.PI * 2) / 365.25; // How many radians Earth moves per day
      const radiansPerSecond = radiansPerDay * speedMultiplier; // Scale by current speed

      // Update Earth's orbital angle based on real time elapsed
      this.earthOrbitAngle += radiansPerSecond * deltaTime;

      // Calculate how many complete orbits Earth has made since the starting point
      const totalOrbitAngle = this.earthOrbitAngle - this.startingOrbitAngle;

      // Convert total orbital angle to years (2π radians = 1 year)
      const yearsElapsed = totalOrbitAngle / (Math.PI * 2);

      // Convert years to days
      const daysElapsed = yearsElapsed * 365.25; // Using 365.25 for leap years

      // Calculate the new simulation date
      const millisecondsElapsed = daysElapsed * 24 * 60 * 60 * 1000;
      this.simulationDate = new Date(
        this.startingDate.getTime() + millisecondsElapsed
      );

      // Calculate the required accelerationOrbit so that Earth completes one orbit in exactly 365.25 simulation days
      const targetSecondsForOneOrbit = 365.25 / speedMultiplier;
      const targetFramesForOneOrbit = targetSecondsForOneOrbit * 60; // Assuming 60 fps
      const requiredAcceleration =
        (Math.PI * 2) / (0.001 * targetFramesForOneOrbit);

      // Update settings for planets based on time speed
      SETTINGS.accelerationOrbit = requiredAcceleration;
      SETTINGS.acceleration = speedMultiplier;
    } else {
      SETTINGS.accelerationOrbit = 0;
      SETTINGS.acceleration = 0;
    }

    // Always update the time display
    this.updateTimeDisplay();
  }

  /**
   * Update the date display in the UI
   */
  updateTimeDisplay() {
    if (!this.elements.currentDateElement) return;

    const months = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ];

    const month = months[this.simulationDate.getMonth()];
    const day = this.simulationDate.getDate().toString().padStart(2, "0");
    const year = this.simulationDate.getFullYear();

    const newText = `${month} ${day}, ${year}`;
    this.elements.currentDateElement.textContent = newText;
  }

  // Getter methods
  getSimulationDate() {
    return this.simulationDate;
  }
  getIsPaused() {
    return this.isPaused;
  }
}
