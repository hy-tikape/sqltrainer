const inventory = ['item-00', 'item-000'];
const bookInventory = [];

getItem = id => {
    if (id.includes("item-")) {
        return items[id];
    } else if (id.includes("task-")) {
        return tasks[id.substr(5)].item;
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

bookMenuUnlock = async () => {
    const bookBox = document.getElementById("book-box");
    if (bookInventory.length <= 1) bookBox.classList.remove("hidden");
    await delay(500);
    bookBox.style.fontSize = "2rem";
    await delay(1000);
    await shakeElement("book-box")
    bookBox.style.fontSize = "";
}

function updateInventory() {
    document.getElementById('inventory').innerHTML = renderInventory();
}

function renderInventory() {
    let render = '';
    for (let id of inventory) {
        let item = getItem(id);
        render += item.render();
    }
    return render;
}

updateInventory();