export class SaveSystem {
    constructor(world) {
        this.world = world;
    }

    save() {
        const worldData = {
            blocks: Array.from(this.world.blocks.entries()).map(([key, block]) => ({
                position: key,
                type: block.type
            })),
            playerPosition: this.world.camera.position.toArray(),
            inventory: this.world.inventory.items
        };

        localStorage.setItem('minecraft-vr-save', JSON.stringify(worldData));
    }

    load() {
        const savedData = localStorage.getItem('minecraft-vr-save');
        if (savedData) {
            const worldData = JSON.parse(savedData);
            
            // Очищаем текущий мир
            this.world.clearWorld();
            
            // Загружаем блоки
            worldData.blocks.forEach(block => {
                const [x, y, z] = block.position.split(',').map(Number);
                this.world.createBlock(x, y, z, block.type);
            });
            
            // Загружаем позицию игрока
            this.world.camera.position.fromArray(worldData.playerPosition);
            
            // Загружаем инвентарь
            this.world.inventory.items = worldData.inventory;
        }
    }
} 