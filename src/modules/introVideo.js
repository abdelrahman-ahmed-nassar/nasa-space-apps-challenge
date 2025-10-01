/**
 * Intro Video Module
 * Handles the intro video playback, skip functionality, and cleanup
 */
export class IntroVideo {
  constructor() {
    this.overlay = null;
    this.video = null;
    this.skipBtn = null;
    this.isCompleted = false;
    this.onCompleteCallback = null;
  }

  /**
   * Initialize the intro video system
   * @param {Function} onComplete - Callback function to execute when intro is complete
   */
  init(onComplete) {
    this.onCompleteCallback = onComplete;
    this.initializeElements();
    this.setupEventListeners();
    this.showClickToStart(); // Show click to start immediately instead of trying autoplay
  }

  /**
   * Initialize DOM element references
   */
  initializeElements() {
    this.overlay = document.getElementById("introVideoOverlay");
    this.video = document.getElementById("introVideo");
    this.skipBtn = document.getElementById("skipIntroBtn");

    if (!this.overlay || !this.video || !this.skipBtn) {
      console.error("Intro video elements not found in DOM");
      this.completeIntro();
      return;
    }
  }

  /**
   * Setup event listeners for video and skip button
   */
  setupEventListeners() {
    if (!this.video || !this.skipBtn) return;

    // Video ended event
    this.video.addEventListener("ended", () => {
      if (!this.isCompleted) {
        console.log("Intro video ended naturally");
        this.completeIntro();
      }
    });

    // Video error event - only handle if not already completed
    this.video.addEventListener("error", (e) => {
      if (!this.isCompleted) {
        console.warn(
          "Intro video error (this may be normal during cleanup):",
          e
        );
        this.completeIntro();
      }
    });

    // Skip button click
    this.skipBtn.addEventListener("click", () => {
      console.log("Intro video skipped by user");
      this.completeIntro();
    });

    // Keyboard event for skipping (ESC or Space)
    document.addEventListener("keydown", (e) => {
      if (!this.isCompleted && (e.code === "Escape" || e.code === "Space")) {
        e.preventDefault();
        console.log("Intro video skipped via keyboard");
        this.completeIntro();
      }
    });
  }

  /**
   * Show space journey startup overlay
   */
  showClickToStart() {
    if (!this.overlay || this.isCompleted) return;

    // Create space journey overlay
    const spaceOverlay = document.createElement("div");
    spaceOverlay.className = "space-journey-overlay";
    spaceOverlay.innerHTML = `
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
          <div class="mission-subtitle">SPACE APPS CHALLENGE</div>
        </div>
        
        <div class="mission-status">
          <div class="status-line">
            <span class="status-label">MISSION STATUS:</span>
            <span class="status-value mission-ready">READY FOR LAUNCH</span>
          </div>
          <div class="status-line">
            <span class="status-label">DESTINATION:</span>
            <span class="status-value">SOLAR SYSTEM</span>
          </div>
          <div class="status-line">
            <span class="status-label">CREW STATUS:</span>
            <span class="status-value">AWAITING COMMANDER</span>
          </div>
        </div>
        
        <div class="launch-button-container">
          <button class="launch-button">
            <div class="button-glow"></div>
            <div class="button-content">
              <div class="launch-icon">🚀</div>
              <div class="launch-text">BEGIN MISSION</div>
            </div>
          </button>
          <div class="launch-subtitle">Click to start your space journey</div>
        </div>
        
        <div class="system-messages">
          <div class="message-line typing-animation">
            <span class="message-prefix">[MISSION CONTROL]</span>
            <span class="message-text">All systems nominal...</span>
          </div>
          <div class="message-line typing-animation delay-1">
            <span class="message-prefix">[NAVIGATION]</span>
            <span class="message-text">Solar system coordinates locked...</span>
          </div>
          <div class="message-line typing-animation delay-2">
            <span class="message-prefix">[PROPULSION]</span>
            <span class="message-text">Engines ready for interplanetary travel...</span>
          </div>
        </div>
      </div>
    `;

    this.overlay.appendChild(spaceOverlay);

    // Launch button click handler
    const launchButton = spaceOverlay.querySelector(".launch-button");
    const startMission = () => {
      // Add launch animation
      spaceOverlay.classList.add("launching");

      // Play launch sound if video has audio
      this.video.muted = false;

      // Start countdown effect
      this.showCountdownSequence(spaceOverlay).then(() => {
        this.video
          .play()
          .then(() => {
            console.log("Mission launched! Video started with sound");
            setTimeout(() => {
              spaceOverlay.remove();
            }, 1000); // Allow time for launch animation
          })
          .catch((error) => {
            console.error("Failed to start mission video:", error);
            this.completeIntro();
          });
      });
    };

    launchButton.addEventListener("click", startMission);

    // Add keyboard support for Enter or Space
    document.addEventListener("keydown", (e) => {
      if (!this.isCompleted && (e.code === "Enter" || e.code === "Space")) {
        e.preventDefault();
        startMission();
      }
    });
  }

  /**
   * Show countdown sequence before launching
   */
  async showCountdownSequence(overlay) {
    return new Promise((resolve) => {
      const countdownEl = document.createElement("div");
      countdownEl.className = "countdown-sequence";
      countdownEl.innerHTML = `
        <div class="countdown-number">3</div>
        <div class="countdown-text">MISSION LAUNCH IN...</div>
      `;

      overlay.appendChild(countdownEl);

      let count = 3;
      const countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
          countdownEl.querySelector(".countdown-number").textContent = count;
        } else {
          countdownEl.querySelector(".countdown-number").textContent = "GO!";
          countdownEl.querySelector(".countdown-text").textContent =
            "LAUNCHING...";
          clearInterval(countdownInterval);

          setTimeout(() => {
            resolve();
          }, 500);
        }
      }, 800);
    });
  }

  /**
   * Complete the intro and transition to main app
   */
  completeIntro() {
    if (this.isCompleted) return;

    this.isCompleted = true;

    // Fade out the overlay
    if (this.overlay) {
      this.overlay.style.transition = "opacity 0.5s ease-out";
      this.overlay.style.opacity = "0";

      setTimeout(() => {
        // Remove the overlay from DOM
        if (this.overlay && this.overlay.parentNode) {
          this.overlay.parentNode.removeChild(this.overlay);
          console.log("Intro video overlay removed from DOM");
        }

        // Call the completion callback
        if (this.onCompleteCallback) {
          this.onCompleteCallback();
        }
      }, 500); // Wait for fade out animation
    } else {
      // If overlay doesn't exist, call callback immediately
      if (this.onCompleteCallback) {
        this.onCompleteCallback();
      }
    }

    // Clean up video resources more gently
    if (this.video) {
      try {
        this.video.pause();
        // Don't clear src immediately to avoid errors
        setTimeout(() => {
          if (this.video) {
            this.video.src = "";
            this.video.load();
          }
        }, 1000); // Wait longer before cleanup
      } catch (error) {
        console.warn("Video cleanup warning (safe to ignore):", error);
      }
    }
  }

  /**
   * Check if intro is completed
   */
  isIntroCompleted() {
    return this.isCompleted;
  }

  /**
   * Force skip the intro (for external use)
   */
  skip() {
    this.completeIntro();
  }
}
