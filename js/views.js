class View {
    constructor(id) {
        this.id = id;
    }

    async open() {
    }

    async close() {
    }
}

class InventoryView extends View {
    constructor() {
        super('inventory-view')
    }

    async open() {
        const taskBox = document.getElementById('task-box');
        const tasksIcon = document.getElementById('task-box-icon');
        const tasksText = document.getElementById('task-box-text');
        tasksIcon.classList.remove('fa-scroll');
        tasksIcon.classList.add('fa-map');
        tasksText.innerText = i18n.get('map-text');
        taskBox.onclick = () => changeView(Views.MAP);
        await showElement(this.id);
        updateCompletionIndicator();
    }

    async close() {
        await hideElement(this.id);
    }

    updateTaskGroup() {
        const viewedTasks = document.getElementById('viewed-tasks');
        if (viewedTasks) {
            const currentTaskGroup = DISPLAY_STATE.currentTaskGroup;
            viewedTasks.innerHTML = currentTaskGroup ? currentTaskGroup.renderTaskInventory() : '';
        }
    }

    async showTaskGroup(groupID) {
        const taskGroup = taskGroups[groupID];
        // Switch to new or toggle if the current was clicked.
        DISPLAY_STATE.currentTaskGroup = taskGroup !== DISPLAY_STATE.currentTaskGroup ? taskGroup : null;
        this.updateTaskGroup();
        inventory.update();
    }
}

class MapView extends View {
    constructor() {
        super('map-view');
        this.drawn = false;
    }

    async open() {
        if (!this.drawn) this.render();
        const taskBox = document.getElementById('task-box');
        const tasksIcon = document.getElementById('task-box-icon');
        const tasksText = document.getElementById('task-box-text');
        tasksIcon.classList.remove('fa-map');
        tasksIcon.classList.add('fa-scroll');
        tasksText.innerText = i18n.get('tasks-text');
        taskBox.onclick = () => changeView(Views.INVENTORY);
        await showElement(this.id);
        showElement('task-box');
        updateCompletionIndicator();
    }

    async close() {
        await hideElement(this.id);
    }

    render() {
        const mapView = document.getElementById(this.id);
        const flameLocations = [
            [6, 43], [7.5, 19], [8.5, 34], [11.5, 27], [15.5, 38],
            [17, 21], [18, 28], [20, 5.5], [21, 42], [23, 17],
            [25, 32], [27, 25], [29, 11], [30, 18], [31.5, 39],
            [34, 31], [36, 46], [36.5, 23], [38, 10], [40.5, 8],
            [41, 36.5], [42, 15.5], [44, 41], [44.5, 23.5], [47, 29],
            [49, 21], [49, 14], [53.5, 32], [56.5, 15.5], [56.5, 39],
            [57, 27], [62, 7], [62, 33], [65, 13], [65.5, 26],
            [69.5, 42], [70, 20], [72, 32], [77.5, 27], [79.5, 15]
        ];
        const wobble = 0.2;
        const maxFlame = flameLocations.length;
        const tasksX = getItem('task-group-X').tasks;
        for (let i = 0; i < 40; i++) {
            const task = tasks[tasksX[i]];
            const left = `calc(${flameLocations[i % maxFlame][0] - 4 + Math.random() * wobble}vw * var(--image-size))`;
            const top = `calc(${flameLocations[i % maxFlame][1] - 7 + Math.random() * wobble}vw * var(--image-size))`
            const onclick = `Views.TASK.show('${tasksX[i] ? tasksX[i] : 'task-00' + i}')`
            mapView.innerHTML += `<div class="flame-container" style="position: absolute; left: ${left}; top: ${top};" onclick="${onclick}">
                    ${new Flame({
                id: `evil-flame-${i}`,
                evil: !task || !task.completed
            }).render()}
                    <p>${task ? task.item.name : `Missing ${tasksX[i] ? tasksX[i] : '(no task id)'}`}</p>
                    </div>`
            // Vary the animation of each flame randomly
            for (const childNode of document.getElementById('evil-flame-' + i).childNodes) {
                if (childNode instanceof Element) {
                    const randomDelay = -Math.random() * 8;
                    const currentDelay = parseInt(window.getComputedStyle(childNode, null).animationDelay.match(/[0-9]*/)[0]);
                    childNode.style.animationDelay = currentDelay + randomDelay + 's'
                }
            }
        }
        this.drawn = true;
    }
}

class TaskView extends View {
    constructor() {
        super('task-view');
        this.queryInputField = document.getElementById("query-input");
    }

    async open() {
        await showElement(this.id)
    }

    async close() {
        DISPLAY_STATE.currentTask = null;
        await hideElement(this.id);
    }

    updateTaskCompleteText() {
        const currentTask = DISPLAY_STATE.currentTask;
        document.getElementById('task-completed-text').innerHTML = currentTask && currentTask.completed
            ? `<p class="center col-yellow"><i class="fa fa-star"></i> ${i18n.get("task-complete")}</p>`
            : '<p>&nbsp;</p>';
        if (currentTask.completed && MOOC.loginStatus === LoginStatus.LOGGED_IN) {
            showElement('query-model-button');
        } else {
            hideElement('query-model-button');
        }
    }

    async showModelAnswer() {
        const currentTask = DISPLAY_STATE.currentTask;
        if (!currentTask) return;

        const modelAnswerSQL = await MOOC.quizzesModel(currentTask);
        document.getElementById('model-answer').value = modelAnswerSQL;
        await showElement('model-answer');
    }

    updateNewItemIndicator() {
        if (inventory.contents.filter(itemID => getItem(itemID).newItem).length > 0) {
            showElement('task-view-new-items-highlight');
        } else {
            hideElement('task-view-new-items-highlight');
        }
    }

    async showWithQuery(query) {
        hideElement('model-answer');
        const task = DISPLAY_STATE.currentTask;
        document.getElementById("task-name").innerText = i18n.get(task.item.name);
        this.updateTaskCompleteText();
        const taskDescription = document.getElementById("task-description");
        taskDescription.innerHTML = i18n.get(task.description);
        if (DISPLAY_STATE.endgame) {
            taskDescription.classList.remove('task-description');
            taskDescription.classList.add('evil-task-description');
        }
        const flame = new Flame({
            id: 'task-flame',
            evil: DISPLAY_STATE.endgame,
            dead: DISPLAY_STATE.endgame && task.completed
        });
        document.getElementById('task-flame-container').innerHTML = flame.render();
        document.getElementById("query-in-table").innerHTML = await task.renderTaskTables();
        document.getElementById("query-out-table").innerHTML = ""
        this.updateNewItemIndicator();
        this.queryInputField.value = query ? query : i18n.get("query-placeholder");
        if (MOOC.loginStatus === LoginStatus.LOGGED_IN) {
            const previousAnswer = await MOOC.quizzesAnswer(task);
            if (previousAnswer) this.queryInputField.value = previousAnswer;
        }
        await changeView(this);
    }

    async show(taskID) {
        DISPLAY_STATE.currentTask = tasks[taskID];
        try {
            await this.showWithQuery();
        } catch (e) {
            showError(e);
        }
    }
}

class ShowItemView extends View {
    constructor() {
        super('display-item-modal');
    }

    async open() {
        DISPLAY_STATE.shownItem.onShow();
        await showModal('#' + this.id, DISPLAY_STATE.previousSecondaryView);
    }

    async close() {
        DISPLAY_STATE.shownItem = null;
        $('#' + this.id).modal('hide');
    }

    setupModal() {
        const item = DISPLAY_STATE.shownItem;
        document.getElementById('display-item-header').innerHTML = i18n.get(item.discoverTitle);
        document.getElementById('display-item').innerHTML = item.renderShowItem();
        document.getElementById('display-item-text').innerText = i18n.get(item.discoverText);
    }

    async show(itemID) {
        DISPLAY_STATE.shownItem = getItem(itemID);
        this.setupModal();
        await changeSecondaryView(this);
    }
}

class ReadBookView extends View {
    constructor() {
        super('display-book-modal');
    }

    async open() {
        await showModal('#' + this.id, DISPLAY_STATE.previousSecondaryView);
    }

    async close() {
        $('#' + this.id).modal('hide');
    }

    setupModal(item) {
        if (item) {
            const currentPage = DISPLAY_STATE.shownBookPage;
            document.getElementById("display-book-title").innerHTML = i18n.get(item.shortName);
            document.getElementById("display-book").innerHTML = item.renderBook(DISPLAY_STATE.shownBookPage);
            const prev = document.getElementById("display-prev-page");
            const next = document.getElementById("display-next-page");
            if (currentPage === 0) {
                prev.setAttribute("disabled", "true");
                prev.style.opacity = "0";
            } else {
                prev.removeAttribute("disabled");
                prev.style.opacity = "1";
            }
            if ((currentPage === 0 && currentPage + 1 > item.pages) || (currentPage > 0 && currentPage + 2 > item.pages)) {
                next.setAttribute("disabled", "true");
                next.style.opacity = "0";
            } else {
                next.removeAttribute("disabled");
                next.style.opacity = "1";
            }
        }
    }

    async showTheBook() {
        this.setupModal(DISPLAY_STATE.currentBook);
        await changeSecondaryView(this);
    }

    async show(event, itemID) {
        event.stopPropagation();
        DISPLAY_STATE.currentBook = items[itemID];
        DISPLAY_STATE.shownBookPage = 0;
        DISPLAY_STATE.currentBook.newItem = false;
        Views.INVENTORY.updateTaskGroup(); // New item indicator changed
        if (itemID === 'Book-X') {
            const startEndgame = async () => {
                eventQueue.clear();
                await changeSecondaryView(Views.NONE);
                await changeView(Views.FLAME_ANIMATION);
                const book = getItem('Book-X');
                book.shortName = "Palanut kirja";
                book.onclick = "";
                skillsByID['Book-X'].unlocked = false;
                Views.SKILL_TREE.update();
            };
            eventQueue.push(Views.SKILL_TREE, startEndgame);
            eventQueue.push(Views.NONE, startEndgame);
        }
        await this.showTheBook();
        inventory.removeItem(itemID);
        if (!DISPLAY_STATE.skillMenuUnlocked) {
            await unlockSkillMenu();
        }
    }

    async nextPage() {
        DISPLAY_STATE.shownBookPage += DISPLAY_STATE.shownBookPage === 0 ? 1 : 2;
        await this.showTheBook();
    }

    async previousPage() {
        DISPLAY_STATE.shownBookPage -= DISPLAY_STATE.shownBookPage === 1 ? 1 : 2;
        await this.showTheBook();
    }
}

class SkillTreeView extends View {
    constructor() {
        super('skill-tree-view');
    }

    async open() {
        await showElementImmediately(this.id)
    }

    async close() {
        await hideElementImmediately(this.id)
    }

    async toggle() {
        if (document.getElementById(this.id).classList.contains('hidden')) {
            inventory.removeItem('Book-A');
            await changeSecondaryView(this);
        } else {
            await changeSecondaryView(Views.NONE);
        }
    }

    update() {
        document.getElementById('skill-tree').innerHTML = renderSkillTree();
    }
}

class LoginView extends View {
    constructor() {
        super('login-view');
    }

    async close() {
        if (MOOC.loginStatus === LoginStatus.LOGGED_OUT) {
            document.querySelectorAll('.logout-button').innerHTML = `<i class="fa fa-fw fa-door-open"></i> ${i18n.get('login')}`
            // TODO Warning about progress not being saved
        }
        await fadeToBlack();
        await hideElementImmediately(this.id);
        await fadeFromBlack();
    }
}

class LoadingView extends View {
    constructor() {
        super('loading-view');
    }

    async open() {
        await showElementImmediately(this.id);
        await awaitUntil(() => DISPLAY_STATE.loaded && DISPLAY_STATE.saveLoaded);
        await changeView(DISPLAY_STATE.endgame ? Views.MAP : Views.INVENTORY);
    }

    async close() {
        await hideElement(this.id);
    }
}

class FlameAnimationView extends View {
    constructor() {
        super('evil-flame-animation');
    }

    async open() {
        await fadeToBlack();
        await showElementImmediately('evil-flame-animation');
        await hideElementImmediately('skill-box');
        await delay(500);
        await fadeFromBlack();
        await evilFlameAnimation();
    }

    async close() {
        await hideElement('evil-flame-animation');
        await showElement('skill-box');
    }
}

Views = {
    INVENTORY: new InventoryView(),
    TASK: new TaskView(),
    SHOW_ITEM: new ShowItemView(),
    READ_BOOK: new ReadBookView(),
    SKILL_TREE: new SkillTreeView(),
    LOGIN: new LoginView(),
    LOADING: new LoadingView(),
    FLAME_ANIMATION: new FlameAnimationView(),
    MAP: new MapView(),
    NONE: new View()
}
