import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js';
import { VRButton } from 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/webxr/XRControllerModelFactory.js';
import { Inventory } from './inventory.js';
import { Physics } from './physics.js';
import { HandAnimations } from './animations.js';
import { SaveSystem } from './save-system.js';
import { SoundSystem } from './sound-system.js';
import { WorldGenerator } from './world-generator.js';
import { Player } from './player.js';

class VRMinecraft {
    constructor(worldSize = { width: 20, height: 128, depth: 20 }) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
            xrCompatible: true
        });
        
        this.blocks = new Map(); // Хранение блоков
        this.BLOCK_SIZE = 1; // Размер блока
        this.controllers = []; // VR контроллеры
        
        this.inventory = new Inventory();
        this.physics = new Physics(this);
        this.saveSystem = new SaveSystem(this);
        this.soundSystem = new SoundSystem();
        
        this.worldSize = worldSize;
        this.players = new Map();
        this.worldGenerator = new WorldGenerator(worldSize);
        
        this.isInitialized = false;
        this.isVRActive = false;
        
        this.demoPlayers = [
            new Player(1, "Steve", new THREE.Vector3(3, 1, 3)),
            new Player(2, "Alex", new THREE.Vector3(-3, 1, -3)),
            new Player(3, "Herobrine", new THREE.Vector3(-3, 1, 3))
        ];
        
        this.init();
    }

    async init() {
        if (this.isInitialized) return;

        try {
            // Настройка рендерера
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.xr.enabled = true;
            this.renderer.setPixelRatio(window.devicePixelRatio);
            document.body.appendChild(this.renderer.domElement);

            // Проверяем поддержку WebXR
            if ('xr' in navigator) {
                const isSupported = await navigator.xr.isSessionSupported('immersive-vr');
                if (isSupported) {
                    const button = VRButton.createButton(this.renderer, {
                        requiredFeatures: ['local-floor', 'bounded-floor', 'hand-tracking'],
                        optionalFeatures: ['dom-overlay', 'hit-test']
                    });
                    document.body.appendChild(button);
                } else {
                    console.warn('WebXR не поддерживается на этом устройстве');
                }
            }

            // Настройка сцены
            this.scene.background = new THREE.Color(0x87CEEB);
            this.camera.position.set(0, 1.6, 3);

            // Улучшенное освещение для VR
            const light = new THREE.DirectionalLight(0xffffff, 1.0);
            light.position.set(1, 1, 1);
            light.castShadow = true;
            light.shadow.mapSize.width = 2048;
            light.shadow.mapSize.height = 2048;
            this.scene.add(light);
            this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));

            // Создаем простое солнце
            const sun = new THREE.Mesh(
                new THREE.SphereGeometry(5, 32, 32),
                new THREE.MeshBasicMaterial({ color: 0xffff00 })
            );
            sun.position.set(50, 100, 50);
            this.scene.add(sun);

            // Создание мира
            await this.generateWorld();
            
            // Настройка VR контроллеров
            this.setupVRControllers();

            // Загружаем сохраненный мир
            this.saveSystem.load();
            
            // Добавляем автосохранение
            setInterval(() => this.saveSystem.save(), 60000);

            // Запуск рендеринга
            this.renderer.setAnimationLoop(this.render.bind(this));

            this.demoPlayers.forEach(player => {
                this.scene.add(player.mesh);
            });

            this.isInitialized = true;
        } catch (error) {
            console.error('Ошибка инициализации:', error);
            throw error;
        }
    }

    async enterVR() {
        try {
            const session = await navigator.xr.requestSession('immersive-vr', {
                requiredFeatures: ['local-floor', 'bounded-floor', 'hand-tracking'],
                optionalFeatures: ['dom-overlay', 'hit-test']
            });
            
            this.renderer.xr.setSession(session);
            this.isVRActive = true;
            
            // Настройка контроллеров после входа в VR
            this.setupVRControllers();
            
            session.addEventListener('end', () => {
                this.renderer.xr.setSession(null);
                this.isVRActive = false;
            });
        } catch (error) {
            console.error('Ошибка при входе в VR:', error);
            throw error;
        }
    }

    async generateWorld() {
        // Очищаем существующий мир
        this.clearWorld();

        // Генерируем новый мир
        const blocks = await this.worldGenerator.generate();
        blocks.forEach(block => {
            this.createBlock(
                block.position.x,
                block.position.y,
                block.position.z,
                block.type
            );
        });
    }

    createBlock(x, y, z, type) {
        const geometry = new THREE.BoxGeometry(this.BLOCK_SIZE, this.BLOCK_SIZE, this.BLOCK_SIZE);
        let color;

        // Простые базовые цвета для каждого типа блока
        switch (type) {
            case 'grass':
                // Зеленый для травы
                color = 0x00FF00;
                break;
            case 'dirt':
                // Коричневый для земли
                color = 0x8B4513;
                break;
            case 'stone':
                // Серый для камня
                color = 0x808080;
                break;
            case 'wood':
                // Коричневый для дерева
                color = 0x663300;
                break;
            case 'leaves':
                // Темно-зеленый для листвы
                color = 0x006400;
                break;
            default:
                // Белый по умолчанию
                color = 0xFFFFFF;
        }

        const material = new THREE.MeshBasicMaterial({ color: color });
        const block = new THREE.Mesh(geometry, material);
        block.position.set(x * this.BLOCK_SIZE, y * this.BLOCK_SIZE, z * this.BLOCK_SIZE);
        
        this.scene.add(block);
        this.blocks.set(`${x},${y},${z}`, { mesh: block, type });
        return block;
    }

    createTree(x, y, z) {
        // Ствол
        for (let i = 0; i < 4; i++) {
            this.createBlock(x, y + i, z, 'wood');
        }

        // Листва
        for (let dx = -1; dx <= 1; dx++) {
            for (let dz = -1; dz <= 1; dz++) {
                for (let dy = 4; dy <= 5; dy++) {
                    this.createBlock(x + dx, y + dy, z + dz, 'leaves');
                }
            }
        }
    }

    setupVRControllers() {
        const controllerModelFactory = new XRControllerModelFactory();

        // Настройка левого контроллера
        const controllerLeft = this.renderer.xr.getController(0);
        controllerLeft.addEventListener('selectstart', this.onSelectStart.bind(this));
        controllerLeft.addEventListener('selectend', this.onSelectEnd.bind(this));
        controllerLeft.addEventListener('squeezestart', this.onSqueezeStart.bind(this));
        controllerLeft.addEventListener('squeezeend', this.onSqueezeEnd.bind(this));
        this.scene.add(controllerLeft);
        this.controllers.push(controllerLeft);

        // Добавляем модель контроллера
        const controllerGripLeft = this.renderer.xr.getControllerGrip(0);
        controllerGripLeft.add(controllerModelFactory.createControllerModel(controllerGripLeft));
        this.scene.add(controllerGripLeft);

        // Настройка правого контроллера
        const controllerRight = this.renderer.xr.getController(1);
        controllerRight.addEventListener('selectstart', this.onSelectStart.bind(this));
        controllerRight.addEventListener('selectend', this.onSelectEnd.bind(this));
        controllerRight.addEventListener('squeezestart', this.onSqueezeStart.bind(this));
        controllerRight.addEventListener('squeezeend', this.onSqueezeEnd.bind(this));
        this.scene.add(controllerRight);
        this.controllers.push(controllerRight);

        // Добавляем модель контроллера
        const controllerGripRight = this.renderer.xr.getControllerGrip(1);
        controllerGripRight.add(controllerModelFactory.createControllerModel(controllerGripRight));
        this.scene.add(controllerGripRight);

        // Добавляем луч для взаимодействия
        const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, -1)
        ]);

        const line = new THREE.Line(geometry);
        line.name = 'line';
        line.scale.z = 5;

        controllerLeft.add(line.clone());
        controllerRight.add(line.clone());
    }

    onSelectStart(event) {
        const controller = event.target;
        const intersection = this.getControllerIntersection(controller);
        
        if (intersection) {
            // Разрушение блока
            this.removeBlock(intersection.point);
            this.soundSystem.play('break');
            this.handAnimations[this.controllers.indexOf(controller)].play('swing');
        } else {
            // Размещение блока
            const selectedItem = this.inventory.getSelectedItem();
            if (selectedItem && selectedItem.count > 0) {
                const position = this.getPlacementPosition(controller);
                if (position) {
                    this.createBlock(
                        position.x,
                        position.y,
                        position.z,
                        selectedItem.type
                    );
                    this.inventory.removeItem(selectedItem.type);
                    this.soundSystem.play('place');
                    this.handAnimations[this.controllers.indexOf(controller)].play('place');
                }
            }
        }
    }

    onSelectEnd(event) {
        // Логика для завершения действия
    }

    onSqueezeStart(event) {
        const controller = event.target;
        const selectedItem = this.inventory.getSelectedItem();
        if (selectedItem) {
            // Логика для использования предмета
            this.soundSystem.play('use');
            this.handAnimations[this.controllers.indexOf(controller)].play('use');
        }
    }

    onSqueezeEnd(event) {
        // Логика для завершения использования предмета
    }

    getControllerIntersection(controller) {
        const raycaster = new THREE.Raycaster();
        const tempMatrix = new THREE.Matrix4();
        
        tempMatrix.identity().extractRotation(controller.matrixWorld);
        raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
        raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

        return raycaster.intersectObjects(Array.from(this.blocks.values()).map(b => b.mesh))[0];
    }

    getPlacementPosition(controller) {
        // Логика определения позиции для размещения блока
        const raycaster = new THREE.Raycaster();
        const tempMatrix = new THREE.Matrix4();
        
        tempMatrix.identity().extractRotation(controller.matrixWorld);
        raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
        raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

        const intersection = raycaster.intersectObjects(
            Array.from(this.blocks.values()).map(b => b.mesh)
        )[0];

        if (intersection) {
            const normal = intersection.face.normal;
            const point = intersection.point.add(normal.multiplyScalar(0.5));
            return {
                x: Math.floor(point.x),
                y: Math.floor(point.y),
                z: Math.floor(point.z)
            };
        }
        return null;
    }

    removeBlock(point) {
        const x = Math.floor(point.x / this.BLOCK_SIZE);
        const y = Math.floor(point.y / this.BLOCK_SIZE);
        const z = Math.floor(point.z / this.BLOCK_SIZE);
        
        const key = `${x},${y},${z}`;
        const block = this.blocks.get(key);
        
        if (block) {
            this.scene.remove(block.mesh);
            this.blocks.delete(key);
        }
    }

    render() {
        if (this.isVRActive) {
            // VR режим
            this.renderer.render(this.scene, this.camera);
        } else {
            // Обычный режим
            this.renderer.setScissor(0, 0, window.innerWidth/2, window.innerHeight);
            this.renderer.setViewport(0, 0, window.innerWidth/2, window.innerHeight);
            this.renderer.render(this.scene, this.camera);

            this.renderer.setScissor(window.innerWidth/2, 0, window.innerWidth/2, window.innerHeight);
            this.renderer.setViewport(window.innerWidth/2, 0, window.innerWidth/2, window.innerHeight);
            this.renderer.render(this.scene, this.camera);
        }

        // Обновляем анимации и физику
        this.update();
    }

    clearWorld() {
        // Удаляем все блоки
        for (const block of this.blocks.values()) {
            this.scene.remove(block.mesh);
        }
        this.blocks.clear();
    }

    resizeWorld(newSize) {
        this.worldSize = newSize;
        this.worldGenerator = new WorldGenerator(newSize);
        this.generateWorld();
    }

    update() {
        if (!this.isInitialized) return;

        // Обновляем физику
        this.physics.update();

        // Обновляем анимации рук
        if (this.handAnimations) {
            this.handAnimations.forEach(anim => anim.update());
        }

        // Обновляем позиции тестовых игроков
        this.updateTestPlayers();
    }

    updateTestPlayers() {
        for (const player of this.players.values()) {
            // Добавляем небольшое случайное движение
            const time = Date.now() * 0.001;
            const newPosition = player.position.clone();
            newPosition.x += Math.sin(time + player.id) * 0.02;
            newPosition.z += Math.cos(time + player.id) * 0.02;
            player.update(newPosition, player.rotation);
        }
    }
}

// Вместо этого экспортируем класс
export { VRMinecraft }; 