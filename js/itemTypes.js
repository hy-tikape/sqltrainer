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
            onclick: `Views.SHOW_ITEM.show('${options.id}')`,
            discoverTitle: "",
            discoverText: `i18n-${options.id}-hint`,
            alt: "unset image description",
            unlocks: [],
            newItem: true,
            ...options
        })
    }

    render() {
        return `<div class="item" id="${this.id}" onclick="${this.onclick}">
                <img class="item-icon" alt="${i18n.get(this.alt)}" src="${this.url}" draggable="false">
                ${this.newItem ? `<div class="new-item-highlight"><div class="burst-12"> </div></div>` : ''}
                <p>${i18n.get(this.name)}</p>
            </div>`
    }

    renderShowItem() {
        return `<img class="item-icon" alt="${i18n.get(this.name)}" src="${this.url}" draggable="false">`
    }

    remove() {
        inventory.removeItem(this.id);
    }
}

class BookItem extends ItemType {

    /**
     * @param options {parsed}
     */
    constructor(options) {
        super({
            newItem: true,
            ...options
        });
        const parsed = options.parsed;
        if (parsed) {
            this.id = parsed.metadata.id;
            this.onclick = `Views.READ_BOOK.show(event, '${this.id}')`;
            this.shortName = parsed.metadata.name;
            this.name = parsed.metadata.title;
            this.author = parsed.metadata.author;
            this.color = parsed.metadata.color;
            this.pages = parsed.pages.length;
            this.discoverText = parsed.cover;
        }
    }

    async onUnlock() {
        this.remove();
        await Views.SHOW_ITEM.show(this.id);
        await unlockSkillMenu();
    }

    renderShowItem() {
        return `<div class="book ${this.color}-book">
                    <p class="book-title">${i18n.get(this.name)}</p>
                    <p class="book-author">${i18n.get(this.author)}</p>
                </div>`
    }

    render() {
        return `<div class="item" id="${this.id}" onclick="${this.onclick}"
                tabindex="0" aria-label="book ${this.shortName}">
                <div class="item-icon book ${this.color}-book">
                <p class="book-title">${i18n.get(this.name)}</p>
                <p class="book-author">${i18n.get(this.author)}</p>
                </div>
                ${this.newItem ? `<div class="new-item-highlight"><div class="burst-12"> </div></div>` : ''}
                <p><i class="fa fa-fw fa-bookmark col-book-${this.color}"></i> ${i18n.get(this.shortName)}</p>
            </div>`;
    }

    renderBook(pageNumber) {
        const firstPage = pageNumber === 0;
        const lastPage = pageNumber + 2 >= this.pages;
        const prev = ` <button class="btn col-white mr-2" id="display-prev-page"
                                onclick="Views.READ_BOOK.previousPage()"
                                type="button" ${firstPage ? 'disabled' : ''} style="opacity:${firstPage ? 0 : 1}" tabindex="0">
                            <i class="fa fa-reply"></i> ${i18n.get('i18n-previous-page')}
                        </button>`;
        const next = `<button class="btn col-white ml-2" id="display-next-page" onclick="Views.READ_BOOK.nextPage()"
                                type="button" ${lastPage ? 'disabled' : ''} style="opacity:${lastPage ? 0 : 1}" tabindex="0">
                            ${i18n.get('i18n-next-page')} <i class="fa fa-share"></i>
                        </button>`;
        const close = `<div class="row justify-content-center">
                        <button id="display-close-button" class="btn" data-dismiss="modal" type="button" tabindex="0">${i18n.get('i18n-close')} &times;</button>
                    </div>`
        const leftPage = this.parsed.pages[pageNumber];
        const rightPage = this.parsed.pages[pageNumber + 1];
        return `<div class="book-open left ${this.color}-book">
                <div class="row">
                    <div class="col page"><p tabindex="0">${leftPage ? leftPage : ''}</p>${prev}</div>
                    <div class="col page">${close}<p tabindex="0">${rightPage ? rightPage : ' '}</p>${next}</div>
                </div>
            </div>`
    }

    remove() {
        inventory.removeItem(this.id);
    }
}