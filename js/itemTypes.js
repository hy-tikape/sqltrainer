class ItemType {
    constructor(options) {
        for (let key of Object.keys(options)) {
            this[key] = options[key];
        }
    }

    render() {
        return '<p>Missing item render() function!</p>'
    }

    renderShowItem() {
        return '<p>Missing item renderShowItem() function!'
    }

    remove() {
    }

    onShow() {
    }

    async onUnlock() {
        addItem(this.id);
    }
}

class ImageItem extends ItemType {

    /**
     * @param options {id, name, url, onclick, discoverTitle, discoverText, unlocks}
     */
    constructor(options) {
        super({
            name: `i18n-${options.id}-name`,
            onclick: `showItem('${options.id}')`,
            discoverTitle: "",
            discoverText: `i18n-${options.id}-hint`,
            unlocks: [],
            ...options
        })
    }

    render() {
        console.log(this);
        return `<div class="item" id="${this.id}" onclick="${this.onclick}">
                <img class="content" alt="${i18n.get(this.name)}" src="${this.url}">
                <p>${i18n.get(this.name)}</p>
            </div>`
    }

    renderShowItem() {
        return `<img class="content" alt="${i18n.get(this.name)}" src="${this.url}">`
    }

    remove() {
        removeItem(this.id);
    }
}

class BookItem extends ItemType {

    /**
     * @param options {id, name, author, onclick, discoverTitle, discoverText, unlocks}
     */
    constructor(options) {
        super({
            name: `i18n-book-${options.id.substr(5)}-name`,
            author: `i18n-book-${options.id.substr(5)}-author`,
            onclick: `showItem('${options.id}')`,
            discoverTitle: "i18n-book-discover",
            discoverText: `i18n-book-${options.id.substr(5)}-hint`,
            unlocks: [],
            ...options
        })
    }

    async onUnlock() {
        this.remove();
        addBook(this.id);
        await showItem(this.id);
        bookMenuUnlock();
    }

    renderShowItem() {
        return `<div class="book">
                    <p class="book-title">${i18n.get(this.name)}</p>
                    <p class="book-author">${i18n.get(this.author)}</p>
                </div>`
    }

    render() {
        return `<div class="item" id="${this.id}" onclick="${this.onclick}">
                <div class="content book">
                <p class="book-title">${i18n.get(this.name)}</p>
                <p class="book-author">${i18n.get(this.author)}</p>
                </div>
                <p>${i18n.getWith("i18n-book-item-name", [this.author, this.name])}</p>
            </div>`;
    }

    remove() {
        removeItem(this.id);
    }
}

/*
table: {
        render: function (table) {
            const from = table.item.from ? `<i class="fa-fw fa-2x ${table.item.from.icon}" title="${i18n.get(table.item.from.text)}"></i> ` : "<i></i>";
            return `<div class="item" id="${table.item.id}" onclick="${table.item.onclick}">
                <div class="content table-paper">
                    ${from}<br><br><br><br><br>
                </div>
                <p>${i18n.get(table.item.name)}</p>
            </div>`;
        },
        remove: function (table) {
            removeElement(`${table.item.id}`)
        }
    },
    icon: {
        render: function (icon) {
            const from = icon.item.from ? `<i class="fa-fw ${icon.item.from.icon}" title="${i18n.get(icon.item.from.text)}"></i> ` : "";
            return `<div class="item" id="${icon.item.id}" onclick="${icon.item.onclick}">
                <i class="${icon.item.icon} fa-6x"></i>
                <p>${from}${i18n.get(icon.item.name)}</p>
            </div>`
        },
        remove: function (icon) {
            removeElement(`${icon.item.id}`)
        }
    }

    createBook = (id, book) => {
    const base = {
        item: {
            id: `book-${id}`,
            name: `i18n-book-${id}-name`,
            author: `i18n-book-${id}-author`,
            onclick: `showItem('${id}')`
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
 */