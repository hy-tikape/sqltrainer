const items = {};

let bookOneShown = false;

for (let item of [
    new ImageItem({
        id: `item-00`,
        url: "css/scroll.png",
        unlocks: [],
        onShow: () => removeItem('item-00')
    }),
    new ImageItem({
        id: `item-000`,
        url: "css/bag.png",
        onclick: "openBag('item-000')",
        unlocks: ['item-001', 'item-0000']
    }),
    new ImageItem({
        id: `item-0000`,
        url: "css/scrolls.png",
        onUnlock: async () => await showItem('item-0000'),
        unlocks: ['task-001', 'task-002', 'task-003']
    }),
    new BookItem({
        id: 'item-001',
        onclick: "openFirstBook('item-001')",
        onUnlock: async () => {
            await showItem('item-001')
            addItem('item-001')
        }
    })
]) {
    items[item.id] = item;
}

openBag = async itemID => {
    const bag = items[itemID];
    for (let got of bag.unlocks) {
        await unlock(got);
    }
    bag.remove();
}

let firstBook = true;
openFirstBook = async itemID => {
    await showBook(itemID);
    if (firstBook) {
        removeItem(itemID);
        addBook(itemID);
        await unlockBookMenu();
        firstBook = false;
    }
}