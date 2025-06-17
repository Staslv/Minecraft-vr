export class Physics {
    constructor(world) {
        this.world = world;
        this.gravity = -9.81;
        this.velocity = new THREE.Vector3();
        this.jumping = false;
    }

    update(delta) {
        // Применяем гравитацию
        this.velocity.y += this.gravity * delta;

        // Проверяем коллизии
        const position = this.world.camera.position.clone();
        position.y += this.velocity.y * delta;

        const blocks = this.world.getBlocksAround(position);
        for (const block of blocks) {
            if (this.checkCollision(position, block)) {
                if (this.velocity.y < 0) {
                    this.velocity.y = 0;
                    this.jumping = false;
                }
                return;
            }
        }

        this.world.camera.position.copy(position);
    }

    jump() {
        if (!this.jumping) {
            this.velocity.y = 5;
            this.jumping = true;
        }
    }

    checkCollision(position, block) {
        // Простая проверка коллизии с блоком
        const blockBounds = new THREE.Box3().setFromObject(block.mesh);
        const playerBounds = new THREE.Box3().setFromCenterAndSize(
            position,
            new THREE.Vector3(0.6, 1.8, 0.6)
        );
        return blockBounds.intersectsBox(playerBounds);
    }
} 