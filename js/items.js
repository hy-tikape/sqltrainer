const items = {};

let bookOneShown = false;

for (let item of [
    new ImageItem({
        id: `item-00`,
        url: "css/letter.png",
        unlocks: [],
        margins: 'my-2',
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
        unlocks: ['task-group-001']
    }),
    new BookItem({
        id: 'item-001',
        onclick: "openFirstBook('item-001')",
        onUnlock: async () => {
            await showItem('item-001')
            addItem('item-001')
        }
    }),
    new BookItem({id: 'item-002'}),
    new BookItem({id: 'item-003'}),
    new BookItem({id: 'item-004'}),
    new BookItem({id: 'item-005'}),
    new BookItem({id: 'item-006'}),
    new BookItem({id: 'item-007'}),
    new BookItem({id: 'item-008'}),
    new BookItem({id: 'item-009'}),
    new BookItem({id: 'item-010'}),
    new BookItem({id: 'item-011'}),
    new BookItem({id: 'item-012'}),
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