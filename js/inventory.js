class Inventory {
    constructor(id, defaultContents) {
        this.id = id;
        this.contents = defaultContents ? defaultContents : [];
    }

    addItem(itemID) {
        if (this.contents.includes(itemID)) return console.warn(`${itemID} add failed, already in inventory`);
        if (!getItem(itemID)) return console.warn(`${itemID} add failed, no such item`);
        this.contents.push(itemID);
        this.update();
    }

    addItems(itemIDs) {
        for (let itemID of itemIDs) {
            if (this.contents.includes(itemID)) continue;
            this.contents.push(itemID);
        }
        this.update();
    }

    removeItem(itemID) {
        let index = this.contents.indexOf(itemID);
        if (index === -1) return;
        this.contents.splice(index, 1);
        this.update();
    }

    removeAll() {
        this.contents.splice(0, 100);
        this.update();
    }

    async update() {
        const inventoryElement = document.getElementById(this.id);
        if (!inventoryElement) return;
        inventoryElement.innerHTML = await this.render();
        Views.TASK.updateNewItemIndicator();
    }

    async render() {
        let render = '';
        for (let itemID of this.contents) {
            let item = getItem(itemID);
            if (item) {
                render += await item.render();
            }
        }
        return render;
    }
}

const inventory = new Inventory('inventory', ['item-00', 'task-group-A']);