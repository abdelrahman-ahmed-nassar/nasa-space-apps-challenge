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
   * Show click to start overlay
   */
  showClickToStart() {
    if (!this.overlay || this.isCompleted) return;

    // Create click to start overlay
    const clickOverlay = document.createElement("div");
    clickOverlay.className = "click-to-start-overlay";
    clickOverlay.innerHTML = `
      <div class="click-to-start-content">
        <div class="play-icon">▶</div>
        <p>Click to Start</p>
      </div>
    `;

    this.overlay.appendChild(clickOverlay);

    // Click to start video with sound
    const startVideo = () => {
      this.video.muted = false; // Ensure sound is enabled
      this.video
        .play()
        .then(() => {
          console.log("Video started with sound after user interaction");
          clickOverlay.remove();
        })
        .catch((error) => {
          console.error(
            "Failed to start video even after user interaction:",
            error
          );
          // If it still fails, skip to main app
          this.completeIntro();
        });
    };

    clickOverlay.addEventListener("click", startVideo);
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
