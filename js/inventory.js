class Inventory {
    constructor(id, defaultContents) {
        this.id = id;
        this.contents = defaultContents ? defaultContents : [];
    }

    addItem(itemID) {
        if (this.contents.includes(itemID) || !getItem(itemID)) return console.warn(`${itemID} add failed`);
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

    update() {
        const inventoryElement = document.getElementById(this.id);
        if (!inventoryElement) return;
        inventoryElement.innerHTML = this.render();
        updateTaskViewNewItemIndicator();
    }

    render() {
        let render = '';
        for (let itemID of this.contents) {
            let item = getItem(itemID);
            render += item.render();
        }
        return render;
    }
}

const inventory = new Inventory('inventory', ['item-00', 'task-group-A']);