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
        inventory.addItem(this.id);
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
            margins: '',
            ...options
        })
    }

    render() {
        return `<div class="item" id="${this.id}" onclick="${this.onclick}">
                <img class="item-icon ${this.margins}" alt="${i18n.get(this.name)}" src="${this.url}">
                <p>${i18n.get(this.name)}</p>
            </div>`
    }

    renderShowItem() {
        return `<img class="item-icon ${this.margins}" alt="${i18n.get(this.name)}" src="${this.url}">`
    }

    remove() {
        inventory.removeItem(this.id);
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
            color: 'purple',
            onclick: `showBook('${options.id}')`,
            discoverTitle: "i18n-book-discover",
            discoverText: `i18n-book-${options.id.substr(5)}-hint`,
            page1: `i18n-book-${options.id.substr(5)}-page-1`,
            page2: `i18n-book-${options.id.substr(5)}-page-2`,
            unlocks: [],
            ...options
        })
    }

    async onUnlock() {
        this.remove();
        await showItem(this.id);
        await unlockSkillMenu();
    }

    renderShowItem() {
        return `<div class="book ${this.color}-book">
                    <p class="book-title">${i18n.get(this.name)}</p>
                    <p class="book-author">${i18n.get(this.author)}</p>
                </div>`
    }

    render() {
        return `<div class="item" id="${this.id}" onclick="${this.onclick}">
                <div class="item-icon book ${this.color}-book">
                <p class="book-title">${i18n.get(this.name)}</p>
                <p class="book-author">${i18n.get(this.author)}</p>
                </div>
                <p>${i18n.get(this.name)}</p>
            </div>`;
    }

    renderJustItem() {
        return `<div class="book ${this.color}-book">
                <p class="book-title">${i18n.get(this.name)}</p>
                <p class="book-author">${i18n.get(this.author)}</p>
                </div>`;
    }

    renderBook() {
        return `<div class="book-open left ${this.color}-book">
                    <div class="row">
                        <div class="col page">
                            <p>${i18n.get(this.page1).split('\n').join('<br>')}</p>
                        </div>
                        <div class="col page">
                            <p>${i18n.get(this.page2).split('\n').join('<br>')}</p>
                        </div>
                    </div>
                </div>`
    }

    remove() {
        inventory.removeItem(this.id);
    }
}