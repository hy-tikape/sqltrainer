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
        id: 'item-A',
        newItem: false,
        pages: 4,
        onclick: "openFirstBook('item-A')",
        onUnlock: async () => {
            await showItem('item-A')
            inventory.addItem('item-A')
        }
    }),
    new BookItem({id: 'item-B', pages: 6, color: 'blue'}),
    new BookItem({id: 'item-C', pages: 4, color: 'green'}),
    new BookItem({id: 'item-D', pages: 3}),
    new BookItem({id: 'item-E', pages: 8, color: 'orange'}),
    new BookItem({id: 'item-F', color: 'green'}),
    new BookItem({id: 'item-G', color: 'magenta'}),
    new BookItem({id: 'item-H', color: 'light-blue'}),
    new BookItem({id: 'item-I', color: 'light-green'}),
    new BookItem({id: 'item-J', color: 'light-green'}),
    new BookItem({id: 'item-K', color: 'light-green'}),
    new BookItem({id: 'item-L'}),
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