export class Inventory {
    constructor() {
        this.items = [
            { type: 'grass', count: 64 },
            { type: 'dirt', count: 64 },
            { type: 'stone', count: 64 },
            { type: 'wood', count: 64 },
            { type: 'leaves', count: 64 }
        ];
        this.selectedSlot = 0;
    }

    getSelectedItem() {
        return this.items[this.selectedSlot];
    }

    addItem(type, count = 1) {
        const existingItem = this.items.find(item => item.type === type);
        if (existingItem) {
            existingItem.count += count;
        } else {
            this.items.push({ type, count });
        }
    }

    removeItem(type, count = 1) {
        const item = this.items.find(item => item.type === type);
        if (item) {
            item.count -= count;
            if (item.count <= 0) {
                this.items = this.items.filter(i => i !== item);
            }
        }
    }
} 