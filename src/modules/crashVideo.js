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
      console.log("✓ Crash video ended naturally");
      this.completeCrashVideo();
    });

    // Skip button click
    this.skipBtn.addEventListener("click", () => {
      this.skipCrashVideo();
    });

    // Video error handling - don't auto-close immediately
    this.video.addEventListener("error", (e) => {
      console.error("Crash video error:", e);
      console.log("Video error details:", {
        error: e.target.error,
        networkState: this.video.networkState,
        readyState: this.video.readyState,
        src: this.video.src,
      });
      // Give user option to skip instead of auto-closing
      if (this.skipBtn) {
        this.skipBtn.textContent = "Continue (Video Error)";
        this.skipBtn.style.display = "block";
      }
    });

    // Video loaded event
    this.video.addEventListener("loadeddata", () => {
      console.log("✓ Crash video loaded and ready");
    });

    // Add keyboard support for skipping
    document.addEventListener("keydown", (e) => {
      if (this.isPlaying && (e.code === "Escape" || e.code === "Space")) {
        e.preventDefault();
        this.skipCrashVideo();
      }
    });
  }

  /**
   * Play the crash video
   */
  play() {
    console.log("🎬 CrashVideo.play() called");

    if (!this.overlay || !this.video) {
      console.error("Crash video elements not available:", {
        overlay: !!this.overlay,
        video: !!this.video,
      });
      return;
    }

    if (this.isPlaying) {
      console.log("Crash video already playing, ignoring duplicate call");
      return;
    }

    console.log("🎬 Playing crash video after asteroid impact...");
    console.log("Video element current state:", {
      src: this.video.src,
      readyState: this.video.readyState,
      networkState: this.video.networkState,
    });

    // Change video source to crash video
    this.video.src = "/videos/crash-video.m4v";
    this.video.load(); // Reload the video with new source

    console.log("Video source set to:", this.video.src);

    // Show overlay
    this.overlay.classList.remove("hidden");
    this.isPlaying = true;

    console.log("Overlay shown, isPlaying set to true");

    // Reset video to beginning
    this.video.currentTime = 0;

    // Wait for video to be loaded before playing
    const playVideo = () => {
      console.log("Attempting to play video...");
      const playPromise = this.video.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("✓ Crash video started playing after impact");
          })
          .catch((error) => {
            console.error("Error playing crash video:", error);
            console.log("Video state on error:", {
              readyState: this.video.readyState,
              networkState: this.video.networkState,
              error: this.video.error,
            });
            // Don't auto-skip immediately, give more time for loading
            setTimeout(() => {
              // Try playing again before giving up
              this.video.play().catch(() => {
                console.log(
                  "Still can't play video, completing crash video sequence"
                );
                this.completeCrashVideo();
              });
            }, 2000);
          });
      }
    };

    // If video is already loaded, play immediately
    if (this.video.readyState >= 2) {
      console.log("Video already loaded, playing immediately");
      playVideo();
    } else {
      console.log("Waiting for video to load...");
      // Wait for video to load
      this.video.addEventListener(
        "loadeddata",
        () => {
          console.log("Video loadeddata event fired");
          playVideo();
        },
        { once: true }
      );

      // Timeout fallback
      setTimeout(() => {
        if (this.video.readyState < 2) {
          console.warn("Video taking too long to load, trying to play anyway");
          playVideo();
        }
      }, 3000);
    }
  }

  /**
   * Skip the crash video
   */
  skipCrashVideo() {
    console.log("⏭️ Skipping crash video - user requested skip");

    if (this.video) {
      this.video.pause();
    }

    this.completeCrashVideo();
  }

  /**
   * Complete crash video and transition back to simulation
   */
  completeCrashVideo() {
    if (!this.isPlaying) {
      console.log("Crash video already completed, ignoring duplicate call");
      return;
    }

    console.log("✅ Crash video completed - transitioning back to simulation");

    this.isPlaying = false;

    // Hide overlay with transition
    if (this.overlay) {
      this.overlay.style.transition = "opacity 0.5s ease-out";
      this.overlay.style.opacity = "0";

      setTimeout(() => {
        this.overlay.classList.add("hidden");
        this.overlay.style.opacity = "1"; // Reset for next time
      }, 500);
    }

    // Pause video
    if (this.video) {
      this.video.pause();
      this.video.currentTime = 0;
    }

    // Reset skip button text
    if (this.skipBtn) {
      this.skipBtn.textContent = "Skip";
    }

    // Call completion callback after a short delay
    setTimeout(() => {
      if (this.onComplete && typeof this.onComplete === "function") {
        console.log("🔄 Calling crash video completion callback");
        this.onComplete();
      }

      // Redirect to dashboard after asteroid impact
      console.log("🔄 Redirecting to dashboard after crash video");
      window.location.href = "/dashboard";
    }, 600);
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
