import { Audio } from 'expo-av';

export class AudioSystem {
    constructor() {
        this.enabled = true;
        this.bgm = null;
        this.ambienceAudio = null;
        this.musicVolume = 0.3;
        this.sfxVolume = 0.1;
        this.ambienceVolume = 0.3;

        // In RN, assets must be required or use URIs. 
        // For local assets in 'assets' folder, we might need to Map them.
        // Assuming paths like '/assets/music_lofi.mp3' won't work directly with require in dynamic strings.
        // We will need a mapping.
        this.playlist = [
            require('../../../assets/music_lofi.mp3'),
            require('../../../assets/synthesis.mp3'),
            require('../../../assets/funkylofi.mp3')
        ]; // Adjusted for mobile/src/logic relative path to root assets
        // Wait, root assets are in /Users/durf/.../src/assets/ or /public/assets/?
        // The web app used '/assets/...' which serves from public.
        // RN needs them imported.

        this.currentTrackIndex = 0;
        this.trackPlayCount = 0;
    }

    async init() {
        // Expo AV needs permission? Usually for recording. Playback is fine.
        await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
        });
    }

    toggle() {
        this.enabled = !this.enabled;
        if (this.enabled) {
            this.playMusic();
            if (this.ambienceAudio) this.ambienceAudio.playAsync();
        } else {
            this.stopMusic();
            if (this.ambienceAudio) this.ambienceAudio.pauseAsync();
        }
        return this.enabled;
    }

    setMusicVolume(val) {
        this.musicVolume = val / 100;
        if (this.bgm) this.bgm.setVolumeAsync(this.musicVolume);
    }

    setSFXVolume(val) {
        this.sfxVolume = val / 100;
    }

    setAmbienceVolume(val) {
        this.ambienceVolume = val / 100;
        if (this.ambienceAudio) this.ambienceAudio.setVolumeAsync(this.ambienceVolume);
    }

    // --- SFX STUBS (Oscillators not supported natively in Expo AV) ---
    playTone(freq, type, duration) {
        // console.log("SFX (Tone) not supported in RN without assets:", type);
    }

    playAction() { this.playTone(300, 'sine', 0.1); }
    playSuccess() { console.log("SFX: Success"); /* Needs asset */ }
    playError() { console.log("SFX: Error"); }
    playChime() { console.log("SFX: Chime"); }
    playGrind() { console.log("SFX: Grind"); }
    playPour() { console.log("SFX: Pour"); }

    // --- MUSIC ---
    async playMusic() {
        if (!this.enabled) return;

        if (!this.bgm) {
            await this.playNextTrack();
        } else {
            // Check status
            const status = await this.bgm.getStatusAsync();
            if (!status.isPlaying) {
                await this.bgm.playAsync();
                // Fade in logic?
                this.bgm.setVolumeAsync(this.musicVolume);
            }
        }
    }

    async playNextTrack() {
        if (this.bgm) {
            await this.bgm.unloadAsync();
            this.bgm = null;
        }

        try {
            const trackSource = this.playlist[this.currentTrackIndex];
            const { sound } = await Audio.Sound.createAsync(
                trackSource,
                { shouldPlay: this.enabled, volume: this.musicVolume } // Start playing
            );
            this.bgm = sound;

            this.bgm.setOnPlaybackStatusUpdate((status) => {
                if (status.didJustFinish) {
                    this.trackPlayCount++;
                    if (this.trackPlayCount < 3) {
                        this.bgm.replayAsync();
                    } else {
                        this.trackPlayCount = 0;
                        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
                        this.playNextTrack();
                    }
                }
            });
        } catch (e) {
            console.error("Failed to load music", e);
        }
    }

    async stopMusic() {
        if (this.bgm) {
            // fade out?
            await this.bgm.stopAsync();
        }
    }

    async skipToNextTrack() {
        this.trackPlayCount = 0;
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
        await this.playNextTrack();
    }

    // --- AMBIENCE ---
    async playAmbience(pathOrName) {
        // We need mapped assets here too
        // For logic simplicity, let's hardcode one ambience or use a map
        // path passed from web was '/assets/ambience_shop.mp3'

        // Mapping hack for now:
        const assetMap = {
            '/assets/ambience_shop.mp3': require('../../../assets/synthesis.mp3'), // Placeholder: reuse music as ambience for now or fail gracefully if file missing
            // Note: User's file list didn't show 'ambience_shop.mp3'. It showed 'synthesis', 'funkylofi', 'music_lofi'.
            // So web app might have been failing on ambience too? 
            // HUD.jsx used 'ambience_shop.mp3'.
            // Let's check listing again.
        };
        // LISTING SHOWS: funkylofi.mp3, music_lofi.mp3, synthesis.mp3. NO ambience_shop.mp3!
        // So I'll comment out ambience or use one of the others.

        console.log("Ambience requested:", pathOrName);
        // if (assetMap[pathOrName]) ...
    }

    stopAmbience() {
        if (this.ambienceAudio) this.ambienceAudio.stopAsync();
    }
}
