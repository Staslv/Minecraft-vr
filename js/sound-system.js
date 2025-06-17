export class SoundSystem {
    constructor() {
        this.listener = new THREE.AudioListener();
        this.sounds = new Map();
        this.loadSounds();
    }

    async loadSounds() {
        const audioLoader = new THREE.AudioLoader();
        
        const soundFiles = {
            break: 'sounds/break.mp3',
            place: 'sounds/place.mp3',
            walk: 'sounds/walk.mp3',
            jump: 'sounds/jump.mp3'
        };

        for (const [name, file] of Object.entries(soundFiles)) {
            const buffer = await audioLoader.loadAsync(file);
            const sound = new THREE.Audio(this.listener);
            sound.setBuffer(buffer);
            this.sounds.set(name, sound);
        }
    }

    play(soundName) {
        const sound = this.sounds.get(soundName);
        if (sound && !sound.isPlaying) {
            sound.play();
        }
    }
} 