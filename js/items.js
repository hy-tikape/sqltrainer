const items = {};

loadItems = async () => {
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
            unlocks: ['item-A', 'task-group-A']
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
        new BookItem({parsed: await parseBook(await readLines(`books/fi/Book-A.book`))}),
        new BookItem({parsed: await parseBook(await readLines(`books/fi/Book-B.book`))}),
        new BookItem({parsed: await parseBook(await readLines(`books/fi/Book-C.book`))}),
        new BookItem({parsed: await parseBook(await readLines(`books/fi/Book-D.book`))}),
        new BookItem({parsed: await parseBook(await readLines(`books/fi/Book-E.book`))}),
        new BookItem({parsed: await parseBook(await readLines(`books/fi/Book-F.book`))}),
        new BookItem({parsed: await parseBook(await readLines(`books/fi/Book-G.book`))}),
        new BookItem({parsed: await parseBook(await readLines(`books/fi/Book-H.book`))}),
        new BookItem({parsed: await parseBook(await readLines(`books/fi/Book-I.book`))}),
        new BookItem({parsed: await parseBook(await readLines(`books/fi/Book-J.book`))}),
        new BookItem({parsed: await parseBook(await readLines(`books/fi/Book-K.book`))}),
        new BookItem({parsed: await parseBook(await readLines(`books/fi/Book-L.book`))}),
    ]) {
        items[item.id] = item;
    }
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