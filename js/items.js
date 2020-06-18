const items = {
    asList() {
        return Object.values(this).filter(obj => obj instanceof ItemType);
    },
    getIDs() {
        return Object.keys(this).filter(key => this[key] instanceof ItemType);
    }
};

async function loadItems() {
    for (let item of [
        new ImageItem({
            id: `item-00`,
            url: "img/letter.png",
            unlocks: [],
            newItem: false,
            onShow: () => inventory.removeItem('item-00')
        }),
    ]) {
        items[item.id] = item;
    }
    for (let skillBracket of skillTree) {
        for (let skill of skillBracket) {
            try {
                const item = new BookItem({parsed: await parseBookFrom(`books/fi/${skill.item}.book`)});
                items[item.id] = item;
            } catch (e) {
                console.warn(`Book by id ${skill.item} not found: ${e}`);
            }
        }
    }
}

function getItem(itemID) {
    if (itemID.includes("item-") || itemID.includes("Book-")) {
        return items[itemID];
    } else if (itemID.includes("task-group-")) {
        return taskGroups[itemID.substr(11)];
    } else if (itemID.includes("task-")) {
        return tasks[itemID];
    }
}