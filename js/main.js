window.addEventListener('error', function (e) {
    console.error(e.error);
});

Views = {
    INVENTORY: {
        id: 'inventory-view',
        open: async () => await showElement('inventory-view'),
        close: async () => await hideElement('inventory-view')
    },
    TASK: {
        id: 'task-view',
        open: async () => await showElement('task-view'),
        close: async () => {
            DISPLAY_STATE.currentTask = null;
            await hideElement('task-view');
        }
    },
    LEVEL_UP: {
        id: 'level-up-modal',
        open: async () => {
            await showModal('#level-up-modal', DISPLAY_STATE.previousSecondaryView);
            await unlockSkillMenu();
        },
        close: () => {
            $('#level-up-modal').modal('hide');
        }
    },
    SHOW_ITEM: {
        id: 'display-item-modal',
        open: async () => {
            DISPLAY_STATE.shownItem.onShow();
            await showModal('#display-item-modal', DISPLAY_STATE.previousSecondaryView);
        },
        close: () => {
            DISPLAY_STATE.shownItem = null;
            $('#display-item-modal').modal('hide');
        }
    },
    READ_BOOK: {
        id: 'display-book-modal',
        open: async () => await showModal('#display-book-modal', DISPLAY_STATE.previousSecondaryView),
        close: () => {
            $('#display-book-modal').modal('hide');
        }
    },
    SKILL_TREE: {
        id: 'skill-tree-view',
        open: async () => await showElement('skill-tree-view'),
        close: async () => await hideElement('skill-tree-view')
    },
    NONE: {
        open: () => {
        },
        close: () => {
        },
    }
}

const eventQueue = {
    push(view, event) {
        if (!this[view.id]) this[view.id] = [];
        this[view.id].push(event);
    }
}

DISPLAY_STATE = {
    currentView: Views.INVENTORY,
    secondaryView: Views.NONE,
    previousSecondaryView: Views.NONE,

    currentTask: null,
    currentTaskGroup: null,
    shownItem: null,
    currentBook: null,
    shownBookPage: 0,

    skillMenuUnlocked: false,
}

const queryInputField = document.getElementById("query-input");

queryInputField.onfocus = () => {
    if (queryInputField.value.includes(i18n.get("i18n-query-placeholder"))) {
        queryInputField.value = "";
    }
}
queryInputField.onblur = () => {
    if (queryInputField.value.length === 0) {
        queryInputField.value = i18n.get("i18n-query-placeholder");
    }
}

showError = error => {
    console.error(error)
    document.getElementById(`alerts`).innerHTML = `<div class="alert alert-danger alert-dismissible" role="alert">Error: ${error}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    </div>`;
}

setupItemModal = (item) => {
    document.getElementById('display-item-header').innerHTML = i18n.get(item.discoverTitle);
    document.getElementById('display-item').innerHTML = item.renderShowItem();
    document.getElementById('display-item-text').innerText = i18n.get(item.discoverText);
}

showItem = async itemID => {
    const item = items[itemID];
    setupItemModal(item);
    DISPLAY_STATE.shownItem = item;
    await changeSecondaryView(Views.SHOW_ITEM);
}

function updateTaskCompleteText() {
    const currentTask = DISPLAY_STATE.currentTask;
    document.getElementById('task-completed-text').innerHTML = currentTask && currentTask.completed
        ? `<p class="center col-yellow"><i class="fa fa-star"></i> ${i18n.get("i18n-task-complete")}</p>`
        : '';
}

showTask = async taskID => {
    try {
        const task = tasks[taskID];
        DISPLAY_STATE.currentTask = task;
        document.getElementById("task-name").innerText = i18n.get(task.item.name);
        updateTaskCompleteText();
        document.getElementById("task-description").innerText = i18n.get(task.description);
        const taskTables = await readTask(`./tasks/${task.sql}`);
        document.getElementById("query-in-table").innerHTML = taskTables.map(table => `<div class="table-paper">${table.renderAsTable(true)}</div>`).join('');
        document.getElementById("query-out-table").innerHTML = ""
        queryInputField.value = i18n.get("i18n-query-placeholder");
        await changeView(Views.TASK);
    } catch (e) {
        showError(e);
    }
}

renderTasks = taskGroup => {
    if (!taskGroup) return '';
    let html = '';
    for (let task of taskGroup.tasks) {
        html += tasks[task].render();
    }
    return html;
}

function updateTaskGroupTasks() {
    document.getElementById('viewed-tasks').innerHTML = renderTasks(DISPLAY_STATE.currentTaskGroup);
}

showTaskGroup = async groupID => {
    const taskGroup = taskGroups[groupID];
    const currentTaskGroup = DISPLAY_STATE.currentTaskGroup;
    if (taskGroup !== currentTaskGroup) {
        // document.getElementById(taskGroup.item.id).classList.add('highlighted');
        // if (currentTaskGroup) document.getElementById(currentTaskGroup.item.id).classList.remove('highlighted');
        DISPLAY_STATE.currentTaskGroup = taskGroup;
        updateTaskGroupTasks();
        inventory.update();
    } else {
        document.getElementById(currentTaskGroup.item.id).classList.remove('highlighted');
        DISPLAY_STATE.currentTaskGroup = null;
        document.getElementById('viewed-tasks').innerHTML = "";
    }
}

function setupBookModal(item) {
    if (item) {
        const currentPage = DISPLAY_STATE.shownBookPage;
        document.getElementById("display-book-title").innerHTML = i18n.get(item.name);
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
        if (currentPage + 2 > item.pages) {
            next.setAttribute("disabled", "true");
            next.style.opacity = "0";
        } else {
            next.removeAttribute("disabled");
            next.style.opacity = "1";
        }
    }
}

showBook = async itemID => {
    DISPLAY_STATE.currentBook = items[itemID];
    DISPLAY_STATE.shownBookPage = 0;
    await showTheBook();
}

showTheBook = async () => {
    setupBookModal(DISPLAY_STATE.currentBook);
    await changeSecondaryView(Views.READ_BOOK);
}

nextPage = async () => {
    DISPLAY_STATE.shownBookPage += DISPLAY_STATE.shownBookPage === 0 ? 1 : 2;
    await showTheBook();
}

previousPage = async () => {
    DISPLAY_STATE.shownBookPage -= DISPLAY_STATE.shownBookPage === 1 ? 1 : 2;
    await showTheBook();
}

changeView = async toView => {
    if (DISPLAY_STATE.currentView === toView) return;
    await DISPLAY_STATE.currentView.close();
    DISPLAY_STATE.currentView = toView;
    await DISPLAY_STATE.currentView.open();
    const eventsToFire = eventQueue[toView.id];
    if (eventsToFire && eventsToFire.length) {
        for (let event of eventsToFire) {
            await event();
        }
        eventQueue[toView.id] = [];
    }
}

changeSecondaryView = async toView => {
    console.log("Secondary: ", DISPLAY_STATE.secondaryView, '->', toView)
    if (DISPLAY_STATE.secondaryView === toView) return;
    DISPLAY_STATE.previousSecondaryView = DISPLAY_STATE.secondaryView;
    await DISPLAY_STATE.secondaryView.close();
    DISPLAY_STATE.secondaryView = toView;
    await DISPLAY_STATE.secondaryView.open();
    const eventsToFire = eventQueue[toView.id];
    if (eventsToFire && eventsToFire.length) {
        for (let event of eventsToFire) {
            await event();
        }
        eventQueue[toView.id] = [];
    }
}

backToMissions = async () => {
    await changeView(Views.INVENTORY);
}

closeSkillTree = async () => {
    await changeSecondaryView(Views.NONE);
}

openSkillTree = async () => {
    await changeSecondaryView(Views.SKILL_TREE);
}

toggleSkillTree = async () => {
    if (document.getElementById('skill-tree-view').classList.contains('hidden')) {
        await openSkillTree();
    } else {
        await closeSkillTree();
    }
}

autoFillQuery = async () => {
    const currentTask = DISPLAY_STATE.currentTask;
    switch (currentTask ? currentTask.id : null) {
        case '001':
            queryInputField.value = 'SELECT * FROM Runes;';
            break;
        case '002':
            queryInputField.value = 'SELECT rune FROM Runes;';
            break;
        case '003':
            queryInputField.value = 'SELECT head,tail FROM Parts;';
            break;
        case '004':
            queryInputField.value = 'SELECT animal,name FROM Pets WHERE frequency=75;';
            break;
        case '005':
            queryInputField.value = 'SELECT animal, magic_power FROM Pets WHERE magic_power > 300;';
            break;
        case '006':
            queryInputField.value = 'SELECT manufacturer, diameter FROM Cauldrons WHERE diameter>=20 AND diameter<=25;';
            break;
        case '007':
            queryInputField.value = 'SELECT animal, species, size FROM Shrimps WHERE size<20 OR 200<size';
            break;
        case '008':
            queryInputField.value = 'SELECT name, status, progress FROM Projects WHERE NOT (status=\'done\' OR progress>0.5);';
            break;
        case '009':
            queryInputField.value = 'SELECT letter FROM Secret ORDER BY code;';
            break;
        case '010':
            queryInputField.value = 'SELECT furniture, name FROM Room ORDER BY name;';
            break;
        case '011':
            queryInputField.value = 'SELECT furniture, name FROM Room ORDER BY name DESC;';
            break;
        case '012':
            queryInputField.value = 'SELECT year, event FROM History ORDER BY year, event;';
            break;
        case '013':
            queryInputField.value = 'SELECT DISTINCT name FROM GuestbooOOok;';
            break;
        case '014':
            queryInputField.value = 'SELECT DISTINCT name,surname FROM Mailto';
            break;
        default:
            if (DISPLAY_STATE.secondaryView === Views.SKILL_TREE) {
                userProgress.gainSkillPoints(20);
            } else if (DISPLAY_STATE.currentTaskGroup) {
                for (let taskID of DISPLAY_STATE.currentTaskGroup.tasks) {
                    await completeTask(tasks[taskID]);
                }
            } else {
                inventory.removeAll();
                inventory.addItems(['task-group-001', 'task-group-002', 'task-group-003', 'task-group-004']);
                unlockSkillMenu();
            }
            break;
    }
}