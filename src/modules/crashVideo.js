/**
 * Crash Video Module
 * Handles the crash video playback after asteroid impact
 */
export class CrashVideo {
  constructor() {
    this.overlay = null;
    this.video = null;
    this.skipBtn = null;
    this.onComplete = null;
    this.isPlaying = false;
  }

  /**
   * Initialize crash video elements
   * @param {Function} onComplete - Callback function when video completes
   */
  init(onComplete) {
    this.onComplete = onComplete;

    // Get elements
    this.overlay = document.getElementById("crashVideoOverlay");
    this.video = document.getElementById("crashVideo");
    this.skipBtn = document.getElementById("skipCrashBtn");

    if (!this.overlay || !this.video || !this.skipBtn) {
      console.error("Crash video elements not found");
      return;
    }

    // Setup event listeners
    this.setupEventListeners();

    console.log("✓ Crash video module initialized");
  }

  /**
   * Setup event listeners for video and buttons
   */
  setupEventListeners() {
    // Video ended event
    this.video.addEventListener("ended", () => {
      this.completeCrashVideo();
    });

    // Skip button click
    this.skipBtn.addEventListener("click", () => {
      this.skipCrashVideo();
    });

    // Video error handling
    this.video.addEventListener("error", (e) => {
      console.error("Crash video error:", e);
      this.completeCrashVideo();
    });

    // Video loaded event
    this.video.addEventListener("loadeddata", () => {
      console.log("✓ Crash video loaded and ready");
    });
  }

  /**
   * Play the crash video
   */
  play() {
    if (!this.overlay || !this.video) {
      console.error("Crash video elements not available");
      return;
    }

    console.log("🎬 Playing crash video...");

    // Show overlay
    this.overlay.classList.remove("hidden");
    this.isPlaying = true;

    // Reset video to beginning
    this.video.currentTime = 0;

    // Play video
    const playPromise = this.video.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log("✓ Crash video started playing");
        })
        .catch((error) => {
          console.error("Error playing crash video:", error);
          // Auto-skip if can't play
          setTimeout(() => {
            this.completeCrashVideo();
          }, 100);
        });
    }
  }

  /**
   * Skip the crash video
   */
  skipCrashVideo() {
    console.log("⏭️ Skipping crash video");

    if (this.video) {
      this.video.pause();
    }

    this.completeCrashVideo();
  }

  /**
   * Complete crash video and transition back to simulation
   */
  completeCrashVideo() {
    console.log("✅ Crash video completed");

    this.isPlaying = false;

    // Hide overlay
    if (this.overlay) {
      this.overlay.classList.add("hidden");
    }

    // Pause video
    if (this.video) {
      this.video.pause();
      this.video.currentTime = 0;
    }

    // Call completion callback
    if (this.onComplete && typeof this.onComplete === "function") {
      this.onComplete();
    }
  }

  /**
   * Check if crash video is currently playing
   */
  isVideoPlaying() {
    return this.isPlaying;
  }

  /**
   * Get video duration
   */
  getDuration() {
    return this.video ? this.video.duration : 0;
  }

  /**
   * Get current video time
   */
  getCurrentTime() {
    return this.video ? this.video.currentTime : 0;
  }
}
