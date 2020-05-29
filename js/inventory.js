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

class BookInventory extends Inventory {
    constructor(id, defaultContents) {
        super(id, defaultContents);
    }

    render() {
        const colWidth = this.contents.length === 1 ? 12 : (this.contents.length === 2 ? 6 : 4);
        let render = '<div class="clickable-items row justify-content-between">';
        for (let itemID of this.contents) {
            let item = getItem(itemID);
            render += `<div class="item col-md-${colWidth}" id="${item.id}" onclick="${item.onclick}">
                ${item.renderJustItem()}
                <p>${i18n.get(item.name)}</p>
            </div>`
        }
        return render + '</div>';
    }
}

const inventory = new Inventory('inventory', ['item-00', 'item-000']);
const bookInventory = new BookInventory('display-book');

inventory.update();
bookInventory.update();

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
    DISPLAY_STATE.bookMenuUnlocked = true;
    const bookBoxIcon = document.getElementById("book-box-icon");
    const bookBoxText = document.getElementById("book-box-text");
    document.getElementById("book-box").classList.remove("hidden");
    await delay(500);
    bookBoxIcon.style.fontSize = "5rem";
    bookBoxText.style.fontSize = "2rem";
    await delay(1000);
    await shakeElement("book-box")
    bookBoxIcon.style.fontSize = "";
    bookBoxText.style.fontSize = "";
}