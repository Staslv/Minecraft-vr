export class WorldGenerator {
    constructor(size = { width: 16, height: 16, depth: 16 }) {
        this.size = size;
        this.blockTypes = {
            grass: {
                top: 'grass_block_top',
                side: 'grass_block_side',
                bottom: 'dirt'
            },
            dirt: 'dirt',
            stone: 'stone',
            wood: {
                top: 'oak_log_top',
                side: 'oak_log'
            },
            leaves: 'oak_leaves',
            sand: 'sand',
            gravel: 'gravel',
            water: 'water_still'
        };
    }

    createBlockTexture(type) {
        const textureLoader = new THREE.TextureLoader();
        const baseUrl = 'https://raw.githubusercontent.com/minecraft-textures/textures/master/block/';
        
        if (typeof this.blockTypes[type] === 'string') {
            // Простой блок с одной текстурой
            const texture = textureLoader.load(`${baseUrl}${this.blockTypes[type]}.png`);
            texture.magFilter = THREE.NearestFilter;
            texture.minFilter = THREE.NearestFilter;
            return new THREE.MeshStandardMaterial({ 
                map: texture,
                roughness: 1
            });
        } else {
            // Сложный блок с разными текстурами для сторон
            const materials = [];
            const sides = this.blockTypes[type];
            
            // Порядок: right, left, top, bottom, front, back
            materials.push(textureLoader.load(`${baseUrl}${sides.side}.png`)); // right
            materials.push(textureLoader.load(`${baseUrl}${sides.side}.png`)); // left
            materials.push(textureLoader.load(`${baseUrl}${sides.top}.png`)); // top
            materials.push(textureLoader.load(`${baseUrl}${sides.bottom || sides.side}.png`)); // bottom
            materials.push(textureLoader.load(`${baseUrl}${sides.side}.png`)); // front
            materials.push(textureLoader.load(`${baseUrl}${sides.side}.png`)); // back

            materials.forEach(texture => {
                texture.magFilter = THREE.NearestFilter;
                texture.minFilter = THREE.NearestFilter;
            });

            return materials.map(map => new THREE.MeshStandardMaterial({ map, roughness: 1 }));
        }
    }

    generate() {
        const blocks = [];
        
        // Генерация базового ландшафта
        for(let x = -this.size.width/2; x < this.size.width/2; x++) {
            for(let z = -this.size.depth/2; z < this.size.depth/2; z++) {
                // Базовый слой
                blocks.push({ position: { x, y: -1, z }, type: 'dirt' });
                
                // Верхний слой
                const rand = Math.random();
                if(rand < 0.7) {
                    blocks.push({ position: { x, y: 0, z }, type: 'grass' });
                } else if(rand < 0.85) {
                    blocks.push({ position: { x, y: 0, z }, type: 'sand' });
                } else {
                    blocks.push({ position: { x, y: 0, z }, type: 'gravel' });
                }

                // Случайные структуры
                if(Math.random() < 0.05) {
                    this.generateTree(blocks, x, 1, z);
                }
            }
        }

        return blocks;
    }

    generateTree(blocks, x, y, z) {
        // Ствол
        for(let i = 0; i < 4; i++) {
            blocks.push({ position: { x, y: y + i, z }, type: 'wood' });
        }

        // Листва
        for(let dx = -2; dx <= 2; dx++) {
            for(let dy = 3; dy <= 5; dy++) {
                for(let dz = -2; dz <= 2; dz++) {
                    if(Math.abs(dx) + Math.abs(dy - 4) + Math.abs(dz) <= 3) {
                        blocks.push({
                            position: { x: x + dx, y: y + dy, z: z + dz },
                            type: 'leaves'
                        });
                    }
                }
            }
        }
    }
} 