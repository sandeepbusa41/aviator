// Sound Manager for Aviator Game
// Handles airplane flying sound and crash sound

class SoundManager {
  constructor() {
    this.airplaneAudio = null;
    this.crashAudio = null;
    this.isInitialized = false;
    this.isMuted = false;
    this.gameSoundEnabled = true;
    this.appMusicEnabled = true;
  }

  // Initialize audio elements
  initialize() {
    try {
      // Create airplane sound element (looping)
      this.airplaneAudio = new Audio('/sounds/airplane-flying.mp3');
      this.airplaneAudio.loop = true;
      this.airplaneAudio.volume = 0.5;
      this.airplaneAudio.preload = 'auto';

      // Create crash sound element (plays once)
      this.crashAudio = new Audio('/sounds/crash.mp3');
      this.crashAudio.loop = false;
      this.crashAudio.volume = 0.7;
      this.crashAudio.preload = 'auto';

      // Load saved settings
      this.loadSettings();

      this.isInitialized = true;
      console.log('Sound Manager Initialized');
      return true;
    } catch (error) {
      console.warn('Sound initialization failed:', error);
      this.isInitialized = false;
      return false;
    }
  }

  // Load settings from localStorage
  loadSettings() {
    try {
      const savedSettings = localStorage.getItem('aerox_sound_settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        this.gameSoundEnabled = settings.gameSoundEnabled !== false;
        this.appMusicEnabled = settings.appMusicEnabled !== false;
      }
    } catch (_) {
      // Use defaults
    }
  }

  // Update settings
  updateSettings(settings) {
    if (settings.gameSoundEnabled !== undefined) {
      this.gameSoundEnabled = settings.gameSoundEnabled;
    }
    if (settings.appMusicEnabled !== undefined) {
      this.appMusicEnabled = settings.appMusicEnabled;
    }
    // Stop sounds if they're being disabled
    if (!this.gameSoundEnabled) {
      this.stopAirplaneSound();
    }
  }

  // Play airplane flying sound (starts looping)
  playAirplaneSound() {
    if (!this.isInitialized) {
      console.warn('Sound Manager not initialized');
      return;
    }

    if (this.isMuted || !this.gameSoundEnabled) {
      console.info('Sounds muted or disabled');
      return;
    }

    try {
      if (this.airplaneAudio) {
        // Always restart the sound
        this.airplaneAudio.currentTime = 0;
        const playPromise = this.airplaneAudio.play();

        if (playPromise !== undefined) {
          playPromise.catch(err => {
            console.warn('Airplane sound play failed:', err);
          }).then(() => {
            console.log('Airplane sound playing');
          });
        }
      }
    } catch (error) {
      console.warn('Error playing airplane sound:', error);
    }
  }

  // Stop airplane flying sound
  stopAirplaneSound() {
    try {
      if (this.airplaneAudio && !this.airplaneAudio.paused) {
        this.airplaneAudio.pause();
        this.airplaneAudio.currentTime = 0;
        console.log('Airplane sound stopped');
      }
    } catch (error) {
      console.warn('Error stopping airplane sound:', error);
    }
  }

  // Play crash sound (one-shot)
  playCrashSound() {
    if (!this.isInitialized) {
      console.warn('Sound Manager not initialized');
      return;
    }

    if (this.isMuted || !this.gameSoundEnabled) {
      console.info('Sounds muted or disabled');
      return;
    }

    try {
      if (this.crashAudio) {
        this.crashAudio.currentTime = 0;
        const playPromise = this.crashAudio.play();

        if (playPromise !== undefined) {
          playPromise.catch(err => {
            console.warn('Crash sound play failed:', err);
          }).then(() => {
            console.log('Crash sound playing');
          });
        }
      }
    } catch (error) {
      console.warn('Error playing crash sound:', error);
    }
  }

  // Set master mute
  setMuted(muted) {
    this.isMuted = muted;
    if (muted) {
      this.stopAirplaneSound();
    }
  }

  // Set volume (0-1)
  setVolume(volume) {
    const v = Math.max(0, Math.min(1, volume));
    if (this.airplaneAudio) {
      this.airplaneAudio.volume = v * 0.5; // Airplane at 50% of master volume
    }
    if (this.crashAudio) {
      this.crashAudio.volume = v * 0.7; // Crash at 70% of master volume
    }
  }

  // Stop all sounds
  stopAll() {
    this.stopAirplaneSound();
    try {
      if (this.crashAudio && !this.crashAudio.paused) {
        this.crashAudio.pause();
        this.crashAudio.currentTime = 0;
      }
    } catch (error) {
      console.warn('Error stopping all sounds:', error);
    }
  }
}

// Single instance
const soundManager = new SoundManager();

export default soundManager;
