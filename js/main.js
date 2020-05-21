const queryInputField = document.getElementById("query-input");

queryInputField.onfocus = () => {
    if (queryInputField.value.includes("Kirjoita kysely...")) {
        queryInputField.value = "";
    }
}
queryInputField.onblur = () => {
    if (queryInputField.value.length === 0) {
        queryInputField.value = "Kirjoita kysely...";
    }
}

const inventory = ['item-001'];
const bookInventory = [];

startGame = async () => {
    await hideElement("mission-info");
    showInventory();
}

getItem = id => {
    if (id.includes("item-")) {
        return items[id.substr(5)];
    } else if (id.includes("task-")) {
        return tasks[id.substr(5)];
    }
}

function renderInventory() {
    let render = '';
    for (let id of inventory) {
        let item = getItem(id);
        console.log(item)
        render += item.item.type.render(item);
    }
    return render;
}

function renderInventoryIconLables() {
    let render = '';
    const sources = {};
    for (let id of inventory) {
        let from = getItem(id).item.from;
        if (from) sources[from.icon] = i18n.get(from.text);
    }
    for (let key of Object.keys(sources)) {
        render += `<p class="col-white"><i class="${key}"></i> ${sources[key]}</p>`
    }
    return render;
}

showInventory = () => {
    showElement("mission-select");
    document.getElementById('inventory').innerHTML = renderInventory();
    document.getElementById('inventory-labels').innerHTML = renderInventoryIconLables();
}

const itemSources = {
    police: {
        icon: 'fa fa-balance-scale',
        text: 'i18n-source-police'
    },
    folder: {
        icon: 'fa fa-folder',
        text: 'i18n-source-folder'
    },
    guests: {
        icon: 'fa fa-address-book',
        text: 'i18n-source-guests'
    }
}

const itemTypes = {
    image: {
        render: function (image) {
            return `<div class="item" id="${image.item.id}" onclick="${image.item.onclick}">
                <img class="content" alt="${i18n.get(image.item.name)}" src="${image.item.url}">
                <p>${i18n.get(image.item.name)}</p>
            </div>`
        }
    },
    book: {
        render: function (book) {
            const from = book.item.from ? `<i class="fa-fw ${book.item.from.icon}" title="${i18n.get(book.item.from.text)}"></i> ` : "";
            return `<div class="item" id="${book.item.id}" onclick="${book.item.onclick}">
                <div class="content book">
                <p class="book-title">${i18n.get(book.item.name)}</p>
                <p class="book-author">${i18n.get(book.item.author)}</p>
                </div>
                <p>${from}${i18n.getWith("i18n-book-item-name", [book.item.author, book.item.name])}</p>
            </div>`;
        }
    },
    table: {
        render: function (table) {
            const from = table.item.from ? `<i class="fa-fw fa-2x ${table.item.from.icon}" title="${i18n.get(table.item.from.text)}"></i> ` : "<i></i>";
            return `<div class="item" id="${table.item.id}" onclick="${table.item.onclick}">
                <div class="content table-paper">
                    ${from}<br><br><br><br><br>
                </div>
                <p>${i18n.get(table.item.name)}</p>
            </div>`;
        }
    },
    icon: {
        render: function (icon) {
            const from = icon.item.from ? `<i class="fa-fw ${icon.item.from.icon}" title="${i18n.get(icon.item.from.text)}"></i> ` : "";
            return `<div class="item" id="${icon.item.id}" onclick="${icon.item.onclick}">
                <i class="${icon.item.icon} fa-6x"></i>
                <p>${from}${i18n.get(icon.item.name)}</p>
            </div>`
        }
    }
}

function overwriteProperties(from, to) {
    for (let key of Object.keys(from)) {
        if (to[key] instanceof Array) {
            to[key].push(...from[key]);
        } else if (to[key] instanceof Object) {
            to[key] = {...to[key], ...from[key]};
        } else {
            to[key] = from[key];
        }
    }
}

createBook = (id, book) => {
    const base = {
        item: {
            id: `book-${id}`,
            name: `i18n-book-${id}-name`,
            author: `i18n-book-${id}-author`,
            onclick: `item('${id}')`
        },
        header: "i18n-book-discover",
        text: `i18n-book-${id}-text`,
        hint: `i18n-book-${id}-hint`,
        unlocks: []
    };
    overwriteProperties(book, base);
    return base
}

createTask = (id, task) => {
    const base = {
        item: {
            id: `task-${id}`,
            name: `i18n-task-${id}-name`,
            onclick: `task('${id}')`
        },
        sql: `task${id}.txt`,
        description: `i18n-task-${id}-description`,
        unlocks: []
    };
    overwriteProperties(task, base);
    return base
}

const items = {
    '000': {
        item: {
            id: `item-000`,
            type: itemTypes.image,
            name: `i18n-item-000-name`,
            onclick: `item('000')`,
            url: 'css/bag.png',
        },
        header: "i18n-book-discover",
        text: `i18n-item-000-text`,
        hint: `i18n-item-000-hint`,
        unlocks: ['item-001']
    },
    '001': createBook('001', {item: {type: itemTypes.book, from: undefined}})
}

const tasks = {}

function renderFoundBooks() {
    let render = '';
    for (let bookID of bookInventory) {
        const item = items[bookID];
        render += `<div class="book"><p>${i18n.get(item.text).split('\n').join("<br>")}</p></div>`
    }
    return render;
}

discoverBook = bookID => {
    bookInventory.push(bookID);
    document.getElementById('book-list').innerHTML = renderFoundBooks();
}

bookAnimation = async bookID => {
    const bookBox = document.getElementById("book-box");
    if (!bookInventory.length) bookBox.classList.remove("hidden");
    let elementId = "book-" + bookID;
    removeElement(elementId);
    discoverBook(bookID);
    await delay(500);
    bookBox.style.fontSize = "2rem";
    await delay(1000);
    await shakeElement("book-box")
    bookBox.style.fontSize = "";
}

setupBookModal = (book) => {
    document.getElementById('spell-header').innerHTML = i18n.get(book.header);
    document.getElementById('book-name').innerHTML = i18n.get(book.item.name);
    document.getElementById('book-hint').innerText = i18n.get(book.hint);
}

item = itemID => {
    const item = items[itemID];
    setupBookModal(item);
    $('#bookModal').modal()
        .on('hidden.bs.modal', () => {
            bookAnimation(itemID);
            for (let unlock of item.unlocks) {
                inventory.push(unlock);
            }
            $('#bookModal').off('hidden.bs.modal')
        });
}

task = async taskID => {
    const task = tasks[taskID];
    document.getElementById("task-name").innerText = i18n.get(task.item.name);
    document.getElementById("task-description").innerText = i18n.get(task.description);
    document.getElementById("query-in-table").innerHTML = await readTask(`./tasks/${task.sql}`);
    await hideElement("mission-select");
    showElement("mission-screen");
}

backToMissions = async () => {
    await hideElement("mission-screen");
    showElement("mission-select");
}