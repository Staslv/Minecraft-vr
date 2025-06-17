export class HandAnimations {
    constructor(controller) {
        this.controller = controller;
        this.animations = {
            idle: this.createIdleAnimation(),
            swing: this.createSwingAnimation(),
            place: this.createPlaceAnimation()
        };
        this.currentAnimation = 'idle';
    }

    createIdleAnimation() {
        return new THREE.AnimationClip('idle', 1, [
            new THREE.VectorKeyframeTrack(
                '.position',
                [0, 0.5, 1],
                [0, 0, 0, 0, 0.05, 0, 0, 0, 0]
            )
        ]);
    }

    createSwingAnimation() {
        return new THREE.AnimationClip('swing', 0.5, [
            new THREE.QuaternionKeyframeTrack(
                '.quaternion',
                [0, 0.25, 0.5],
                new THREE.Quaternion()
                    .setFromEuler(new THREE.Euler(0, 0, -Math.PI / 4))
                    .toArray()
                    .concat(
                        new THREE.Quaternion()
                            .setFromEuler(new THREE.Euler(0, 0, Math.PI / 4))
                            .toArray()
                    )
                    .concat(
                        new THREE.Quaternion()
                            .setFromEuler(new THREE.Euler(0, 0, 0))
                            .toArray()
                    )
            )
        ]);
    }

    play(animationName) {
        if (this.currentAnimation !== animationName) {
            this.currentAnimation = animationName;
            // Запускаем анимацию
            this.animations[animationName].reset().play();
        }
    }
} 