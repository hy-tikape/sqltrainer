/**
 * Represents a view with nothing in it.
 *
 * a Main view, use changeView-method with this view.
 * a Secondary view, use changeSecondaryView-method with this view.
 */
class View {
    constructor(id) {
        this.id = id;
    }

    async open() {
    }

    async close() {
    }
}

/**
 * Represents the view with items.
 *
 * a Main view, use changeView-method with this view.
 */
class InventoryView extends View {
    constructor() {
        super('inventory-view');
        this.currentTaskGroup = null;
        this.previousTaskGroup = null;
    }

    async open() {
        const taskBox = document.getElementById('task-box');
        const tasksIcon = document.getElementById('task-box-icon');
        const tasksText = document.getElementById('task-box-text');
        tasksIcon.classList.replace('fa-scroll', 'fa-map');
        tasksText.innerHTML = i18n.get('map-text');
        taskBox.onclick = () => changeView(Views.MAP);
        await showElement(this.id);
        document.getElementById(this.id).focus();
        updateCompletionIndicator();
    }

    async close() {
        await hideElement(this.id);
    }

    async updateTaskGroup() {
        const viewedTasks = document.getElementById('viewed-tasks');
        if (viewedTasks) {
            const currentTaskGroup = this.currentTaskGroup;
            viewedTasks.innerHTML = currentTaskGroup ? await currentTaskGroup.renderTaskInventory() : '';
        }
    }

    async showTaskGroup(groupID) {
        const taskGroup = taskGroups[groupID];
        // Switch to new or toggle if the current was clicked.
        this.previousTaskGroup = this.currentTaskGroup;
        this.currentTaskGroup = taskGroup !== this.currentTaskGroup ? taskGroup : null;
        inventory.update();
        await this.updateTaskGroup();
        if (DISPLAY_STATE.endgame) {
            Views.MAP.render();
        }
    }
}

/**
 * Represents the view with a map and small flames.
 *
 * a Main view, use changeView-method with this view.
 */
class MapView extends View {
    constructor() {
        super('map-view');
        this.drawn = false;
    }

    async open() {
        DISPLAY_STATE.endgame = true;
        if (!this.drawn) {
            this.render();
        }
        const taskBox = document.getElementById('task-box');
        const tasksIcon = document.getElementById('task-box-icon');
        const tasksText = document.getElementById('task-box-text');
        tasksIcon.classList.replace('fa-map', 'fa-scroll');
        tasksText.innerHTML = i18n.get('tasks-text');
        taskBox.onclick = () => changeView(Views.INVENTORY);
        showElement(this.id);
        showElement('task-box');
        updateCompletionIndicator();
        if (DISPLAY_STATE.previousView === Views.FLAME_ANIMATION || DISPLAY_STATE.previousView === Views.END_ANIMATION) {
            clearParticles();
            await fadeFromBlack();
            clearParticles();
        }
        document.getElementById(this.id).focus();
        const tasksForMap = getItem('task-group-X');
        if (tasksForMap.getCompletedTaskCount() >= tasksForMap.getTaskCount() && !DISPLAY_STATE.gameCompleted) {
            DISPLAY_STATE.gameCompleted = true;
            changeView(Views.END_ANIMATION);
        }
    }

    async close() {
        await hideElement(this.id);
    }

    async render() {
        document.querySelectorAll('.flame-container').forEach(element => element.remove());

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

        if (DISPLAY_STATE.gameCompleted) {
            mapView.innerHTML += `<button class="flame-container" style="position: absolute; 
                    left: calc(${35 + Math.random() * wobble}vw * var(--image-size));
                    top: calc(${20 + Math.random() * wobble}vw * var(--image-size));"
                    onclick="changeView(Views.END_ANIMATION)">
                    ${new Flame({
                id: `evil-flame-x`,
                evil: true,
                dead: true
            }).render()}
                    <p class="center">${i18n.get('rewatch-animation')}</p>
                    </button>`
        }

        const maxFlame = flameLocations.length;
        const tasksX = getItem('task-group-X').tasks;
        for (let i = 0; i < 40; i++) {
            const task = tasks[tasksX[i]];
            const left = `calc(${flameLocations[i % maxFlame][0] - 4 + Math.random() * wobble}vw * var(--image-size))`;
            const top = `calc(${flameLocations[i % maxFlame][1] - 7 + Math.random() * wobble}vw * var(--image-size))`
            const onclick = `Views.TASK.show('${tasksX[i] ? tasksX[i] : 'task-00' + i}')`
            document.getElementById('map-tasks').innerHTML += `<button class="flame-container" style="position: absolute; left: ${left}; top: ${top};" onclick="${onclick}" role="button">
                    ${new Flame({
                id: `evil-flame-${i}`,
                evil: true,
                dead: task && task.completed
            }).render()}
                    <p class="center">#${Task.getNumericID(tasksX[i])}</p>
                    </button>`
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

/**
 * Represents the view with task description and query stuff.
 *
 * a Main view, use changeView-method with this view.
 */
class TaskView extends View {
    constructor() {
        super('task-view');
        this.queryInputField = document.getElementById("query-input");
        this.currentTask = null;
    }

    async open() {
        await showElement(this.id);
        document.getElementById(this.id).focus();
    }

    async close() {
        this.currentTask = null;
        await hideElement(this.id);
    }

    updateTaskCompleteText() {
        const currentTask = this.currentTask;
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
        const currentTask = this.currentTask;
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
        const task = this.currentTask;
        if (task instanceof LazyTask && !task.loaded) await task.loadTask();
        document.getElementById("task-name").innerText = i18n.get(task.item.name);
        this.updateTaskCompleteText();
        const taskDescription = document.getElementById("task-description");
        taskDescription.innerHTML = i18n.get(task.description);
        if (DISPLAY_STATE.endgame) {
            document.getElementById('task-view').classList.add('evil')
            taskDescription.classList.remove('task-description');
            taskDescription.classList.add('evil-task-description');
        }
        this.updateFlame();
        document.getElementById("query-in-table").innerHTML = await task.renderTaskTables();
        document.getElementById("query-out-table").innerHTML = "";
        document.getElementById("query-out-tables-nav").innerHTML = "";
        this.updateNewItemIndicator();
        this.queryInputField.value = query ? query : i18n.get("query-placeholder");
        if (MOOC.loginStatus === LoginStatus.LOGGED_IN) {
            const previousAnswer = await MOOC.quizzesAnswer(task);
            if (previousAnswer) {
                await this.setQuery(previousAnswer);
            }
            await this.updatePreviousAnswers(task);
        }
        await changeView(this);
    }

    async updatePreviousAnswers(task) {
        const previousAnswers = await MOOC.quizzesPastAnswers(task);
        const dropdown = document.getElementById('previous-answers-dropdown');
        if (dropdown && previousAnswers.length) {
            let render = '';
            for (let answer of previousAnswers) {
                render += `<a class="dropdown-item" role="listitem" href="javascript:void(0)" data-query="${answer.query}" onclick="Views.TASK.setQuery(event.target.dataset.query)">
                    ${answer.correct ? `<i class="fa fa-fw fa-check col-green" aria-label="${i18n.get('correct')}"></i>` : `<i class="fa fa-fw fa-times col-red" aria-label="${i18n.get('incorrect')}"></i>`} ${answer.date}
                </a>`
            }
            dropdown.innerHTML = render;
            await showElementImmediately('previous-answers');
        } else {
            await hideElementImmediately('previous-answers');
        }
    }

    updateFlame() {
        const flame = new Flame({
            id: 'task-flame',
            evil: DISPLAY_STATE.endgame,
            dead: DISPLAY_STATE.endgame && this.currentTask && this.currentTask.completed && this.currentTask.getNumericID() > 60
        });
        document.getElementById('task-flame-container').innerHTML = flame.render();
    }

    async show(taskID) {
        this.currentTask = tasks[taskID];
        try {
            await this.showWithQuery();
        } catch (e) {
            showError(e);
        }
    }

    async setQuery(query) {
        this.queryInputField.value = query;
        await runQueryTests(false);
    }
}

/**
 * View where letters are read.
 *
 * a Secondary view, use changeSecondaryView-method with this view.
 */
class ShowItemView extends View {
    constructor() {
        super('display-letter-modal');
        this.shownItem = null;
    }

    async open() {
        this.shownItem.onShow();
        document.getElementById(this.id).focus();
        await showModal('#' + this.id, DISPLAY_STATE.previousSecondaryView);
    }

    async close() {
        this.shownItem = null;
        $('#' + this.id).modal('hide');
    }

    setupModal() {
        const item = this.shownItem;
        document.getElementById('display-letter-text').innerHTML = i18n.get(item.discoverText);
    }

    async show(itemID) {
        this.shownItem = getItem(itemID);
        this.setupModal();
        await changeSecondaryView(this);
    }
}

/**
 * View where books are read.
 *
 * a Secondary view, use changeSecondaryView-method with this view.
 */
class ReadBookView extends View {
    constructor() {
        super('display-book-modal');
        this.currentBook = null;
        this.shownBookPage = 0;
    }

    async open() {
        document.getElementById(this.id).focus();
        await showModal('#' + this.id, DISPLAY_STATE.previousSecondaryView);
    }

    async close() {
        $('#' + this.id).modal('hide');
        this.currentBook = null;
    }

    setupModal(item) {
        if (item) {
            const currentPage = this.shownBookPage;
            document.getElementById("display-book-title").innerHTML = i18n.get(item.shortName);
            document.getElementById("display-book").innerHTML = item.renderBook(this.shownBookPage);
            const prev = document.getElementById("display-prev-page");
            const next = document.getElementById("display-next-page");
            if (currentPage === 0) {
                prev.setAttribute("disabled", "true");
                prev.style.opacity = "0";
            } else {
                prev.removeAttribute("disabled");
                prev.style.opacity = "1";
            }

            if (currentPage + 2 >= item.pages) {
                next.setAttribute("disabled", "true");
                next.style.opacity = "0";
            } else {
                next.removeAttribute("disabled");
                next.style.opacity = "1";
            }
        } else {
            const contents = skillsByID.asList().filter(skill => skill.unlocked).map(skill => skill.item)
            const colWidth = contents.length === 1 ? 12 : (contents.length === 2 ? 6 : 4);
            let render = '<div class="clickable-items row justify-content-between">';
            for (let itemID of contents) {
                if (itemID === 'Book-X') continue;
                let item = getItem(itemID);
                render += `<div class="item col-md-${colWidth}" id="${item.id}" onclick="${item.onclick}" tabindex="0">
                    ${item.renderShowItem()}
                    <p>${i18n.get(item.shortName)}</p>
                </div>`
            }
            render += '</div>'
            document.getElementById("display-book-title").innerHTML = i18n.get("books-text");
            document.getElementById("display-book").innerHTML = render;
        }
    }

    async showTheBook() {
        this.setupModal(this.currentBook);
        await changeSecondaryView(this);
        document.getElementById(this.id).focus();
    }

    async show(event, itemID) {
        event.stopPropagation();
        if (itemID) {
            this.currentBook = items[itemID];
            this.shownBookPage = 0;
            this.currentBook.newItem = false;
            await Views.INVENTORY.updateTaskGroup(); // New item indicator changed
        }
        await this.showTheBook();
        inventory.removeItem(itemID);
        if (!DISPLAY_STATE.skillMenuUnlocked) {
            await unlockSkillMenu();
        }
    }

    async nextPage() {
        this.shownBookPage += 2;
        await this.showTheBook();
    }

    async previousPage() {
        this.shownBookPage -= 2;
        await this.showTheBook();
    }
}

/**
 * View where books and the progression through them are.
 *
 * a Secondary view, use changeSecondaryView-method with this view.
 */
class SkillTreeView extends View {
    constructor() {
        super('skill-tree-view');
    }

    async open() {
        await showElementImmediately(this.id);
        document.getElementById(this.id).focus();
    }

    async close() {
        await hideElementImmediately(this.id);
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

/**
 * View where people login
 *
 * a Main view, use changeView-method with this view.
 */
class LoginView extends View {
    constructor() {
        super('login-view');
    }

    async close() {
        if (MOOC.loginStatus === LoginStatus.LOGGED_OUT) {
            document.querySelectorAll('.logout-button').forEach(el => el.innerHTML = `<i class="fa fa-fw fa-door-open"></i> ${i18n.get('login')}`);
        }
        await fadeToBlack();
        await hideElementImmediately(this.id);
        await showElementImmediately('loading-view');
        await showElementImmediately('star-indicator');
        await fadeFromBlack();
    }
}

/**
 * Transition view from login to the game while the necessary files are loaded.
 *
 * Automatically transitions to MAP or INVENTORY view afterwards.
 *
 * a Main view, use changeView-method with this view.
 */
class LoadingView extends View {
    constructor() {
        super('loading-view');
    }

    async open() {
        await showElementImmediately(this.id);
        document.getElementById(this.id).focus();
        await awaitUntil(() => DISPLAY_STATE.loaded && DISPLAY_STATE.saveLoaded);
        await changeView(DISPLAY_STATE.endgame ? Views.MAP : Views.INVENTORY);
    }

    async close() {
        await hideElement(this.id);
    }
}

/**
 * View for the flame turning animation
 *
 * a Main view, use changeView-method with this view.
 */
class FlameAnimationView extends View {
    constructor() {
        super('evil-flame-animation');
    }

    async open() {
        await fadeToBlack();
        document.getElementById('body').style.overflow = 'hidden';
        await showElementImmediately(this.id);
        document.getElementById(this.id).focus();
        await hideElementImmediately('skill-box');
        await hideElementImmediately('task-box');
        await delay(500);
        await fadeFromBlack();
        if (DISPLAY_STATE.endgame) await resetFlameAnimation();
        await evilFlameAnimation();
    }

    async close() {
        await fadeToBlack();
        await hideElementImmediately(this.id);
        await showElementImmediately('skill-box');
        document.getElementById('body').style.overflow = '';
    }

    async startEndGame() {
        eventQueue.clear();
        await changeSecondaryView(Views.NONE);
        await changeView(Views.FLAME_ANIMATION);
        Views.SKILL_TREE.update();
        getItem('item-999').newItem = false;
        await inventory.update();
    }
}

/**
 * View for the end animation
 *
 * a Main view, use changeView-method with this view.
 */
class EndAnimationView extends View {
    constructor() {
        super('end-animation');
    }

    async open() {
        await fadeToBlack();
        document.getElementById('body').style.overflow = 'hidden';
        await showElementImmediately(this.id);
        document.getElementById(this.id).focus();
        await hideElementImmediately('skill-box');
        await hideElementImmediately('task-box');
        await delay(500);
        await fadeFromBlack();
        await endAnimation();
    }

    async close() {
        await fadeToBlack();
        await hideElementImmediately(this.id);
        await showElementImmediately('skill-box');
        document.getElementById('body').style.overflow = '';
    }
}

/**
 * View for the end text
 *
 * a Main view, use changeView-method with this view.
 */
class EndTextView extends View {
    constructor() {
        super('end-view');
    }

    async open() {
        clearParticles();
        await showElementImmediately(this.id);
        document.getElementById(this.id).focus();
        await fadeFromBlack();
        endScreenAnimation();
    }

    async close() {
        await hideElement(this.id);
        await showElementImmediately('skill-box');
        await showElementImmediately('task-box');
    }
}

Views = {
    INVENTORY: new InventoryView(),
    MAP: new MapView(),
    TASK: new TaskView(),
    SHOW_ITEM: new ShowItemView(),
    READ_BOOK: new ReadBookView(),
    SKILL_TREE: new SkillTreeView(),
    LOGIN: new LoginView(),
    LOADING: new LoadingView(),
    FLAME_ANIMATION: new FlameAnimationView(),
    END_ANIMATION: new EndAnimationView(),
    END_TEXT: new EndTextView(),
    NONE: new View(),
}
