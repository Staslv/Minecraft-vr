export class Player {
    constructor(id, name, position) {
        this.id = id;
        this.name = name;
        this.position = position;
        this.rotation = new THREE.Euler();
        this.mesh = this.createPlayerMesh();
        this.health = 20;
        this.inventory = [];
    }

    createPlayerMesh() {
        // Создаем тело игрока
        const bodyGeometry = new THREE.BoxGeometry(0.6, 1.2, 0.3);
        const headGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
        const armGeometry = new THREE.BoxGeometry(0.2, 0.6, 0.2);
        const legGeometry = new THREE.BoxGeometry(0.2, 0.6, 0.2);

        // Материалы для разных частей тела
        const skinMaterial = new THREE.MeshPhongMaterial({ color: 0xffcc99 });
        const clothesMaterial = new THREE.MeshPhongMaterial({ color: 0x3366cc });

        // Создаем части тела
        const body = new THREE.Mesh(bodyGeometry, clothesMaterial);
        const head = new THREE.Mesh(headGeometry, skinMaterial);
        const leftArm = new THREE.Mesh(armGeometry, skinMaterial);
        const rightArm = new THREE.Mesh(armGeometry, skinMaterial);
        const leftLeg = new THREE.Mesh(legGeometry, clothesMaterial);
        const rightLeg = new THREE.Mesh(legGeometry, clothesMaterial);

        // Позиционируем части тела
        head.position.y = 0.8;
        leftArm.position.set(-0.4, 0.3, 0);
        rightArm.position.set(0.4, 0.3, 0);
        leftLeg.position.set(-0.2, -0.6, 0);
        rightLeg.position.set(0.2, -0.6, 0);

        // Собираем модель
        const player = new THREE.Group();
        player.add(body);
        player.add(head);
        player.add(leftArm);
        player.add(rightArm);
        player.add(leftLeg);
        player.add(rightLeg);

        // Добавляем имя над головой
        const nameTag = this.createNameTag();
        nameTag.position.y = 1.5;
        player.add(nameTag);

        return player;
    }

    createNameTag() {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;
        context.font = 'Bold 32px Minecraft';
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.fillText(this.name, 128, 40);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(2, 0.5, 1);

        return sprite;
    }

    update(position, rotation) {
        this.position.copy(position);
        this.rotation.copy(rotation);
        this.mesh.position.copy(position);
        this.mesh.rotation.copy(rotation);

        // Анимация ходьбы
        const time = Date.now() * 0.003;
        const leftLeg = this.mesh.children[4];
        const rightLeg = this.mesh.children[5];
        leftLeg.rotation.x = Math.sin(time) * 0.5;
        rightLeg.rotation.x = -Math.sin(time) * 0.5;
    }
} 