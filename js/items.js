const items = {};

for (let item of [
    new ImageItem({
        id: `item-00`,
        url: "css/letter.png",
        unlocks: [],
        margins: 'my-2',
        onShow: () => inventory.removeItem('item-00')
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
        onShow: () => inventory.addItem('task-group-001')
    }),
    new ImageItem({
        id: `item-unlock-tasks`,
        url: "css/scrolls.png",
        onUnlock: async () => await showItem('item-unlock-tasks'),
    }),
    new BookItem({
        id: 'item-001',
        onclick: "openFirstBook('item-001')",
        onUnlock: async () => {
            await showItem('item-001')
            inventory.addItem('item-001')
        }
    }),
    new BookItem({id: 'item-002', color: 'blue'}),
    new BookItem({id: 'item-003', color: 'green'}),
    new BookItem({id: 'item-004'}),
    new BookItem({id: 'item-005', color: 'orange'}),
    new BookItem({id: 'item-006', color: 'green'}),
    new BookItem({id: 'item-007', color: 'magenta'}),
    new BookItem({id: 'item-008', color: 'light-blue'}),
    new BookItem({id: 'item-009'}),
    new BookItem({id: 'item-010'}),
    new BookItem({id: 'item-011'}),
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
    await discoverMany(bag.unlocks);
    bag.remove();
}

openFirstBook = async itemID => {
    await showBook(itemID);
    inventory.removeItem(itemID);
    if (!DISPLAY_STATE.skillMenuUnlocked) {
        await unlockSkillMenu();
    }
}