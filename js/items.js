const items = {};

for (let item of [
    new ImageItem({
        id: `item-00`,
        url: "css/scroll.png",
        unlocks: ['item-001'],
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
    new BookItem({id: 'item-001'})
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
