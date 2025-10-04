/**
 * Starting Page Module
 * Creates an interactive starting screen without video playback
 */
export class StartingPage {
  constructor() {
    this.overlay = null;
    this.isCompleted = false;
    this.onCompleteCallback = null;
  }

  /**
   * Initialize the starting page
   * @param {Function} onComplete - Callback function to execute when user starts mission
   */
  init(onComplete) {
    this.onCompleteCallback = onComplete;
    this.createStartingOverlay();
    this.setupEventListeners();
  }

  /**
   * Create the starting overlay with space theme
   */
  createStartingOverlay() {
    // Create the main overlay
    this.overlay = document.createElement("div");
    this.overlay.className = "starting-page-overlay";
    this.overlay.innerHTML = `
      <div class="space-background">
        <div class="stars"></div>
        <div class="asteroid asteroid-1"></div>
        <div class="asteroid asteroid-2"></div>
        <div class="asteroid asteroid-3"></div>
        <div class="asteroid asteroid-4"></div>
        <div class="floating-debris debris-1"></div>
        <div class="floating-debris debris-2"></div>
        <div class="floating-debris debris-3"></div>
      </div>
      
      <div class="mission-control-ui">
        <div class="nasa-logo">
          <div class="nasa-text">NASA</div>
          <div class="mission-subtitle">ASTEROID IMPACT SIMULATION</div>
        </div>
        
        <div class="mission-status">
          <div class="status-line">
            <span class="status-label">THREAT LEVEL:</span>
            <span class="status-value mission-ready">IMPACTOR-2025 DETECTED</span>
          </div>
          <div class="status-line">
            <span class="status-label">MISSION:</span>
            <span class="status-value">IMPACT RISK ASSESSMENT</span>
          </div>
          <div class="status-line">
            <span class="status-label">SIMULATION STATUS:</span>
            <span class="status-value">READY FOR ANALYSIS</span>
          </div>
        </div>
        
        <div class="launch-button-container">
          <button class="launch-button">
            <div class="button-glow"></div>
            <div class="button-content">
              <div class="launch-icon">🌍</div>
              <div class="launch-text">DEFEND EARTH</div>
            </div>
          </button>
          <div class="launch-subtitle">Enter the asteroid impact simulation</div>
        </div>
        
        <div class="system-messages">
          <div class="message-line typing-animation">
            <span class="message-prefix">[NEO TRACKING]</span>
            <span class="message-text">Near-Earth asteroid trajectory calculated...</span>
          </div>
          <div class="message-line typing-animation delay-1">
            <span class="message-prefix">[IMPACT ANALYSIS]</span>
            <span class="message-text">Collision scenarios modeling initiated...</span>
          </div>
          <div class="message-line typing-animation delay-2">
            <span class="message-prefix">[DEFENSE SYSTEMS]</span>
            <span class="message-text">Mitigation strategies database loaded...</span>
          </div>
        </div>
      </div>
    `;

    // Add to document body
    document.body.appendChild(this.overlay);
  }

  /**
   * Setup event listeners for the starting page
   */
  setupEventListeners() {
    if (!this.overlay) return;

    const launchButton = this.overlay.querySelector(".launch-button");

    // Launch button click handler
    const startMission = () => {
      if (this.isCompleted) return;

      console.log("Mission launched! Starting simulation immediately...");
      this.completePage();
    };

    launchButton.addEventListener("click", startMission);

    // Add keyboard support for Enter or Space
    const keyHandler = (e) => {
      if (!this.isCompleted && (e.code === "Enter" || e.code === "Space")) {
        e.preventDefault();
        startMission();
      }
    };

    document.addEventListener("keydown", keyHandler);

    // Store reference to remove later
    this.keyHandler = keyHandler;
  }

  /**
   * Complete the starting page and transition to main app
   */
  completePage() {
    if (this.isCompleted) return;

    this.isCompleted = true;

    // Add launch animation
    if (this.overlay) {
      this.overlay.classList.add("launching");

      // Fade out the overlay
      setTimeout(() => {
        this.overlay.style.transition = "opacity 0.5s ease-out";
        this.overlay.style.opacity = "0";

        setTimeout(() => {
          // Remove the overlay from DOM
          if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
            console.log("Starting page overlay removed from DOM");
          }

          // Call the completion callback
          if (this.onCompleteCallback) {
            this.onCompleteCallback();
          }
        }, 500); // Wait for fade out animation
      }, 1000); // Allow time for launch animation
    } else {
      // If overlay doesn't exist, call callback immediately
      if (this.onCompleteCallback) {
        this.onCompleteCallback();
      }
    }

    // Clean up event listeners
    if (this.keyHandler) {
      document.removeEventListener("keydown", this.keyHandler);
    }
  }

  /**
   * Check if starting page is completed
   */
  isPageCompleted() {
    return this.isCompleted;
  }

  /**
   * Force complete the starting page (for external use)
   */
  skip() {
    this.completePage();
  }
}
