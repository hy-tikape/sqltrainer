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
            alt: 'i18n-describe-letter',
            unlocks: [],
            newItem: true,
            accessByTab: true,
            onShow: () => inventory.removeItem('item-00')
        }),
    ]) {
        items[item.id] = item;
    }

    let loaded = 0;

    async function loadBookFor(skill) {
        try {
            const item = new BookItem({
                accessByTab: true,
                parsed: await parseBookFrom(`books/${currentLang}/${skill.item}.book`)
            });
            items[item.id] = item;
        } catch (e) {
            console.warn(`Book by id ${skill.item} not found: ${e}`);
        }
        loaded++;
    }

    let toLoad = 0;

    for (let skillBracket of skillTree) {
        for (let skill of skillBracket) {
            toLoad++;
            loadBookFor(skill);
        }
    }

    await awaitUntil(() => loaded >= toLoad);
}


function getItem(itemID) {
    function getSomeItem(itemID) {
        if (itemID.includes("item-") || itemID.includes("Book-")) {
            return items[itemID];
        } else if (itemID.includes("task-group-")) {
            return taskGroups[itemID.substr(11)];
        } else if (itemID.includes("task-")) {
            return tasks[itemID];
        }
    }

    const some = getSomeItem(itemID);
    return some ? some : new ImageItem({
        id: itemID,
        name: "Missing " + itemID + " see console.",
        url: "img/glass-jar.png",
        onclick: ""
    });
}