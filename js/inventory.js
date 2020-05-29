class Inventory {
    constructor(id, defaultContents) {
        this.id = id;
        this.contents = defaultContents ? defaultContents : [];
    }

    addItem(itemID) {
        if (this.contents.includes(itemID)) return;
        this.contents.push(itemID);
        this.update();
    }

    addItems(itemIDs) {
        for (let itemID of itemIDs) {
            if (this.contents.includes(itemID)) return;
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
        document.getElementById(this.id).innerHTML = this.render();
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

const inventory = new Inventory('inventory', ['item-00', 'item-000']);
const bookInventory = [];

inventory.update();

addBook = id => {
    if (bookInventory.includes(id)) return;
    bookInventory.push(id);
    bookInventory.sort();
    updateBookInventory();
}

discover = async id => {
    const item = getItem(id);
    await item.onUnlock();
}

discoverMany = async ids => {
    for (let id of ids) {
        await discover(id);
    }
}

unlockBookMenu = async () => {
    const bookBoxIcon = document.getElementById("book-box-icon");
    const bookBoxText = document.getElementById("book-box-text");
    if (bookInventory.length <= 1) document.getElementById("book-box").classList.remove("hidden");
    await delay(500);
    bookBoxIcon.style.fontSize = "5rem";
    bookBoxText.style.fontSize = "2rem";
    await delay(1000);
    await shakeElement("book-box")
    bookBoxIcon.style.fontSize = "";
    bookBoxText.style.fontSize = "";
}

function renderInventory(inventory) {
    let render = '';
    for (let id of inventory) {
        let item = getItem(id);
        render += item.render();
    }
    return render;
}

function renderBookInventory() {
    const colWidth = bookInventory.length === 1 ? 12 : (bookInventory.length === 2 ? 6 : 4);
    return `<div class="clickable-items row justify-content-between">
        ${renderInventory(bookInventory).split('class="item"').join(`class="item col-md-${colWidth}"`)}
    </div>`;
}

function updateBookInventory() {
    document.getElementById('display-book').innerHTML = renderBookInventory();
}