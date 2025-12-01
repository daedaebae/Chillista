export class AudioSystem {
    constructor() {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.enabled = true; // Music enabled by default
        this.bgm = null;
        this.musicVolume = 0.3;
        this.sfxVolume = 0.1; // 10% volume
        this.ambienceVolume = 0.3; // 30% volume
        this.ambienceAudio = null;
        this.playlist = ['assets/music_lofi.mp3', 'assets/synthesis.mp3', 'assets/funkylofi.mp3'];
        this.currentTrackIndex = 0;
        this.trackPlayCount = 0; // Track how many times the current song has played
    }

    toggle() {
        this.enabled = !this.enabled;
        if (this.enabled) {
            this.context.resume();
            this.playMusic();
            if (this.ambienceAudio) this.ambienceAudio.play();
        } else {
            this.fadeOutAndStop();
            if (this.ambienceAudio) this.ambienceAudio.pause();
        }
        return this.enabled;
    }

    setMusicVolume(val) {
        this.musicVolume = val / 100;
        if (this.bgm) this.bgm.volume = this.musicVolume;
    }

    setSFXVolume(val) {
        this.sfxVolume = val / 100;
    }

    setAmbienceVolume(val) {
        this.ambienceVolume = val / 100;
        if (this.ambienceAudio) this.ambienceAudio.volume = this.ambienceVolume;
    }

    playTone(freq, type, duration) {
        if (!this.enabled) return;
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.context.currentTime);

        // Soften the volume based on global SFX volume
        const volume = this.sfxVolume * 0.3; // Reduced base volume for softer clicks

        gain.gain.setValueAtTime(volume, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.context.destination);
        osc.start();
        osc.stop(this.context.currentTime + duration);
    }

    playAction() {
        // Softer, lower pitch for general actions
        this.playTone(300, 'sine', 0.1);
    }
    playSuccess() {
        this.playTone(523.25, 'sine', 0.1);
        setTimeout(() => this.playTone(659.25, 'sine', 0.1), 100);
    }
    playError() {
        console.log("playError called");
        console.trace();
        this.playTone(150, 'sawtooth', 0.3);
    }
    playChime() { this.playTone(880, 'triangle', 0.5); }

    playGrind() {
        // Low pitch sawtooth for grinding
        this.playTone(80, 'sawtooth', 1.5);
        setTimeout(() => this.playTone(90, 'sawtooth', 1.5), 100);
        setTimeout(() => this.playTone(80, 'sawtooth', 1.5), 200);
    }

    playPour() {
        // Sliding pitch to simulate liquid filling
        if (!this.enabled) return;
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, this.context.currentTime);
        osc.frequency.linearRampToValueAtTime(800, this.context.currentTime + 1.0);

        const volume = this.sfxVolume * 0.5;
        gain.gain.setValueAtTime(volume, this.context.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.context.currentTime + 1.0);

        osc.connect(gain);
        gain.connect(this.context.destination);
        osc.start();
        osc.stop(this.context.currentTime + 1.0);
    }

    playMusic() {
        if (!this.bgm) {
            this.playNextTrack();
        } else if (this.enabled && this.bgm.paused) {
            this.fadeIn(this.bgm);
        }
    }

    playNextTrack() {
        if (this.bgm) {
            this.bgm.pause();
            this.bgm.onended = null;
        }

        const track = this.playlist[this.currentTrackIndex];
        this.bgm = new Audio(track);
        this.bgm.volume = 0; // Start at 0 for fade in
        this.bgm.loop = false;

        this.bgm.onended = () => {
            this.trackPlayCount++;
            if (this.trackPlayCount < 3) {
                // Replay same track
                this.bgm.currentTime = 0;
                this.fadeIn(this.bgm);
            } else {
                // Next track
                this.trackPlayCount = 0;
                this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
                this.playNextTrack();
            }
        };

        if (this.enabled) {
            this.fadeIn(this.bgm);
        }
    }

    fadeIn(audio) {
        audio.volume = 0;
        audio.play().catch(e => console.log("Audio play failed:", e));

        const fadeInterval = setInterval(() => {
            if (audio.volume < this.musicVolume) {
                audio.volume = Math.min(audio.volume + 0.05, this.musicVolume);
            } else {
                clearInterval(fadeInterval);
            }
        }, 200); // Fade in over ~1-2 seconds
    }

    fadeOutAndStop() {
        if (!this.bgm) return;

        const fadeInterval = setInterval(() => {
            if (this.bgm.volume > 0.05) {
                this.bgm.volume -= 0.05;
            } else {
                this.bgm.volume = 0;
                this.bgm.pause();
                clearInterval(fadeInterval);
            }
        }, 100);
    }

    stopMusic() {
        this.fadeOutAndStop();
    }

    playAmbience(url) {
        if (this.ambienceAudio) {
            if (this.ambienceAudio.src.includes(url) && !this.ambienceAudio.paused) return;
            this.ambienceAudio.pause();
        }

        this.ambienceAudio = new Audio(url);
        this.ambienceAudio.loop = true;
        this.ambienceAudio.volume = 0; // Start at 0 for fade in

        if (this.enabled) {
            this.ambienceAudio.play().catch(e => console.log("Ambience play failed:", e));
            // Fade in
            const fadeInterval = setInterval(() => {
                if (this.ambienceAudio.volume < this.ambienceVolume) {
                    this.ambienceAudio.volume = Math.min(this.ambienceAudio.volume + 0.05, this.ambienceVolume);
                } else {
                    clearInterval(fadeInterval);
                }
            }, 200);
        }
    }

    stopAmbience() {
        if (!this.ambienceAudio) return;
        const fadeInterval = setInterval(() => {
            if (this.ambienceAudio.volume > 0.05) {
                this.ambienceAudio.volume -= 0.05;
            } else {
                this.ambienceAudio.volume = 0;
                this.ambienceAudio.pause();
                clearInterval(fadeInterval);
            }
        }, 100);
    }

    skipToNextTrack() {
        // Reset play count and move to next track
        this.trackPlayCount = 0;
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;

        // Stop current track and play next
        if (this.bgm) {
            this.bgm.pause();
            this.bgm.onended = null;
        }

        this.playNextTrack();
    }
}
