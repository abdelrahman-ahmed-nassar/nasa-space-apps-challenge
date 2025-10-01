import { TIME_CONTROL_CONFIG, SETTINGS } from "./constants.js";

/**
 * Time Control Module
 * Handles time progression, UI controls, and simulation timing
 */
export class TimeControl {
  constructor() {
    this.isPaused = false;
    this.currentSpeedIndex = TIME_CONTROL_CONFIG.defaultSpeedIndex; // Start at REAL RATE (center)
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
   * Check if currently in reverse time mode
   */
  isReversing() {
    if (this.isPaused) return false;
    return this.speedModes[this.currentSpeedIndex].multiplier < 0;
  }

  /**
   * Check if currently in real rate mode
   */
  isRealRate() {
    if (this.isPaused) return false;
    return this.speedModes[this.currentSpeedIndex].direction === "real";
  }

  /**
   * Get the center index (REAL RATE position)
   */
  getCenterIndex() {
    return TIME_CONTROL_CONFIG.defaultSpeedIndex;
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

    // Calculate position along the curved line
    const centerIndex = this.getCenterIndex();
    const totalModes = this.speedModes.length;

    // Calculate progress based on current position relative to center
    const progress = this.currentSpeedIndex / (totalModes - 1);

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

    // Calculate center position for progress line
    const centerProgress = centerIndex / (totalModes - 1);
    const centerT = centerProgress;
    const centerCx =
      Math.pow(1 - centerT, 2) * startX +
      2 * (1 - centerT) * centerT * controlX +
      Math.pow(centerT, 2) * endX;
    const centerCy =
      Math.pow(1 - centerT, 2) * startY +
      2 * (1 - centerT) * centerT * controlY +
      Math.pow(centerT, 2) * endY;

    // Update progress curve path - from center to current position
    if (this.currentSpeedIndex < centerIndex) {
      // Progress goes from current position to center (for reverse time)
      this.elements.progressArc.setAttribute(
        "d",
        `M ${cx} ${cy} Q ${centerCx + (controlX - centerCx) * (centerT - t)} ${
          centerCy + (controlY - centerCy) * (centerT - t)
        } ${centerCx} ${centerCy}`
      );
      // Set reverse color (red/orange)
      this.elements.progressArc.setAttribute("stroke", "#ff6b35");
    } else if (this.currentSpeedIndex > centerIndex) {
      // Progress goes from center to current position (for forward time)
      this.elements.progressArc.setAttribute(
        "d",
        `M ${centerCx} ${centerCy} Q ${
          centerCx + (controlX - centerCx) * (t - centerT)
        } ${centerCy + (controlY - centerCy) * (t - centerT)} ${cx} ${cy}`
      );
      // Set forward color (green)
      this.elements.progressArc.setAttribute("stroke", "#00ff88");
    } else {
      // At center position (REAL RATE) - no progress line visible
      this.elements.progressArc.setAttribute(
        "d",
        `M ${centerCx} ${centerCy} Q ${centerCx} ${centerCy} ${centerCx} ${centerCy}`
      );
      // Set green color for real rate
      this.elements.progressArc.setAttribute(
        "stroke",
        "rgba(0, 255, 136, 0.6)"
      );
    }

    // Update speed indicator color and glow based on direction
    if (!this.isPaused) {
      // Only set colors when not paused - let CSS handle paused state
      if (this.isReversing()) {
        this.elements.speedIndicator.setAttribute("fill", "#ff6b35");
        this.elements.speedIndicator.style.filter =
          "drop-shadow(0 0 8px rgba(255, 107, 53, 0.8))";
      } else if (this.isRealRate()) {
        this.elements.speedIndicator.setAttribute("fill", "#00ff88"); // Green color for real rate
        this.elements.speedIndicator.style.filter =
          "drop-shadow(0 0 8px rgba(0, 255, 136, 0.8))";
      } else {
        this.elements.speedIndicator.setAttribute("fill", "#00ff88");
        this.elements.speedIndicator.style.filter =
          "drop-shadow(0 0 8px rgba(0, 255, 136, 0.8))";
      }
    } else {
      // Clear inline styles when paused to let CSS take over
      this.elements.speedIndicator.style.filter = "";
    }

    // Update paused state and direction classes
    this.elements.timeControlContainer.classList.remove(
      "paused",
      "reverse",
      "real-rate"
    );

    if (this.isPaused) {
      this.elements.timeControlContainer.classList.add("paused");
      this.elements.playPauseBtn.innerHTML = "&#9654;"; // Play symbol
    } else {
      this.elements.playPauseBtn.innerHTML = "&#9208;"; // Pause symbol

      // Add direction-specific classes
      if (this.isReversing()) {
        this.elements.timeControlContainer.classList.add("reverse");
      } else if (this.isRealRate()) {
        this.elements.timeControlContainer.classList.add("real-rate");
      }
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
      const radiansPerSecond = radiansPerDay * speedMultiplier; // Scale by current speed (can be negative)

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
      // For reverse time, this should be negative
      const targetSecondsForOneOrbit = 365.25 / Math.abs(speedMultiplier);
      const targetFramesForOneOrbit = targetSecondsForOneOrbit * 60; // Assuming 60 fps
      const requiredAcceleration =
        (Math.PI * 2) / (0.001 * targetFramesForOneOrbit);

      // Apply direction multiplier for reverse time
      const directionMultiplier = speedMultiplier >= 0 ? 1 : -1;

      // Update settings for planets based on time speed and direction
      SETTINGS.accelerationOrbit = requiredAcceleration * directionMultiplier;
      SETTINGS.acceleration = Math.abs(speedMultiplier) * directionMultiplier;
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
