const inventory = ['item-00', 'item-000'];
const bookInventory = [];

getItem = id => {
    if (id.includes("item-")) {
        return items[id];
    } else if (id.includes("task-group-")) {
        return taskGroups[id.substr(11)].item;
    } else if (id.includes("task-")) {
        return tasks[id.substr(5)];
    }
}

addItem = id => {
    inventory.push(id);
    updateInventory();
}

removeItem = id => {
    console.log("remove", id);
    let index = inventory.indexOf(id);
    if (index === -1) return;
    inventory.splice(index, 1);
    updateInventory();
}

addBook = id => {
    bookInventory.push(id);
    bookInventory.sort();
    updateBookInventory();
}

unlock = async id => {
    const item = getItem(id);
    await item.onUnlock();
    updateInventory();
}

unlockMany = async ids => {
    for (let id of ids) {
        await unlock(id);
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

function updateInventory() {
    document.getElementById('inventory').innerHTML = renderInventory(inventory);
    if (currentTaskGroup) document.getElementById(currentTaskGroup.item.id).classList.add('highlighted');
}

updateInventory();

function updateBookInventory() {
    document.getElementById('display-book').innerHTML = `<div class="clickable-items">${renderInventory(bookInventory)}</div>`;
}