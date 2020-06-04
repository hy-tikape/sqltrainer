const items = {};

for (let item of [
    new ImageItem({
        id: `item-00`,
        url: "css/letter.png",
        unlocks: [],
        margins: 'my-2',
        newItem: false,
        onShow: () => inventory.removeItem('item-00')
    }),
    new ImageItem({
        id: `item-000`,
        url: "css/bag.png",
        onclick: "openBag('item-000')",
        newItem: false,
        unlocks: ['item-001', 'task-group-A']
    }),
    new ImageItem({
        id: `item-0000`,
        url: "css/scrolls.png",
        onUnlock: async () => await showItem('item-0000'),
        onShow: () => inventory.addItem('task-group-A')
    }),
    new ImageItem({
        id: `item-unlock-tasks`,
        url: "css/scrolls.png",
        onUnlock: async () => await showItem('item-unlock-tasks'),
    }),
    new BookItem({
        id: 'item-001',
        newItem: false,
        pages: 4,
        onclick: "openFirstBook('item-001')",
        onUnlock: async () => {
            await showItem('item-001')
            inventory.addItem('item-001')
        }
    }),
    new BookItem({id: 'item-002', pages: 6, color: 'blue'}),
    new BookItem({id: 'item-003', pages: 4, color: 'green'}),
    new BookItem({id: 'item-004', pages: 3}),
    new BookItem({id: 'item-005', pages: 8, color: 'orange'}),
    new BookItem({id: 'item-006', color: 'green'}),
    new BookItem({id: 'item-007', color: 'magenta'}),
    new BookItem({id: 'item-008', color: 'light-blue'}),
    new BookItem({id: 'item-009', color: 'light-green'}),
    new BookItem({id: 'item-010', color: 'light-green'}),
    new BookItem({id: 'item-011', color: 'light-green'}),
    new BookItem({id: 'item-012'}),
]) {
    items[item.id] = item;
}

getItem = itemID => {
    if (itemID.includes("item-")) {
        return items[itemID];
    } else if (itemID.includes("task-group-")) {
        return taskGroups[itemID.substr(11)];
    } else if (itemID.includes("task-")) {
        return tasks[itemID.substr(5)];
    }
}

openBag = async itemID => {
    const bag = items[itemID];
    await inventory.addItems(bag.unlocks);
    bag.remove();
}

openFirstBook = async itemID => {
    await showBook(itemID);
    inventory.removeItem(itemID);
    if (!DISPLAY_STATE.skillMenuUnlocked) {
        await unlockSkillMenu();
    }
}