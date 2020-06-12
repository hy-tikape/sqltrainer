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

function showError(error) {
    console.error(error)
    document.getElementById(`alerts`).innerHTML = `<div class="alert alert-danger alert-dismissible" role="alert">Error: ${error}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    </div>`;
}

function setupItemModal(item) {
    document.getElementById('display-item-header').innerHTML = i18n.get(item.discoverTitle);
    document.getElementById('display-item').innerHTML = item.renderShowItem();
    document.getElementById('display-item-text').innerText = i18n.get(item.discoverText);
}

async function showItem(itemID) {
    const item = getItem(itemID);
    setupItemModal(item);
    DISPLAY_STATE.shownItem = item;
    await changeSecondaryView(Views.SHOW_ITEM);
}

function updateTaskCompleteText() {
    const currentTask = DISPLAY_STATE.currentTask;
    document.getElementById('task-completed-text').innerHTML = currentTask && currentTask.completed
        ? `<p class="center col-yellow"><i class="fa fa-star"></i> ${i18n.get("i18n-task-complete")}</p>`
        : '<p>&nbsp;</p>';
}

function updateTaskViewNewItemIndicator() {
    if (inventory.contents.filter(itemID => getItem(itemID).newItem).length > 0) {
        showElement('task-view-new-items-highlight');
    } else {
        hideElement('task-view-new-items-highlight');
    }
}

async function showTheTask(query) {
    const task = DISPLAY_STATE.currentTask;
    document.getElementById("task-name").innerText = i18n.get(task.item.name);
    updateTaskCompleteText();
    document.getElementById("task-description").innerHTML = i18n.get(task.description);
    document.getElementById("query-in-table").innerHTML = await task.renderTaskTables();
    document.getElementById("query-out-table").innerHTML = ""
    updateTaskViewNewItemIndicator();
    queryInputField.value = query ? query : i18n.get("i18n-query-placeholder");
    await changeView(Views.TASK);
}

async function showTask(taskID) {
    DISPLAY_STATE.currentTask = tasks[taskID];
    try {
        await showTheTask();
    } catch (e) {
        showError(e);
    }
}

function renderTasks(taskGroup) {
    if (!taskGroup) return '';
    let html = '';
    for (let task of taskGroup.tasks) {
        html += tasks[task] ? tasks[task].render() : `<div class="item">
                <img class="item-icon" alt="missing task ${task}" src="css/scroll.png" draggable="false">
                <i class="task-group-color fa fa-fw fa-2x fa-bookmark"></i>
                <p>${task} doesn't exist</p>
            </div>`;
    }
    return html;
}

function updateTaskGroupTasks() {
    document.getElementById('viewed-tasks').innerHTML = renderTasks(DISPLAY_STATE.currentTaskGroup);
}

async function showTaskGroup(groupID) {
    const taskGroup = taskGroups[groupID];
    const currentTaskGroup = DISPLAY_STATE.currentTaskGroup;
    if (taskGroup !== currentTaskGroup) {
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

async function showBook(itemID) {
    DISPLAY_STATE.currentBook = items[itemID];
    DISPLAY_STATE.shownBookPage = 0;
    await showTheBook();
    inventory.removeItem(itemID);
    if (!DISPLAY_STATE.skillMenuUnlocked) {
        await unlockSkillMenu();
    }
}

async function showTheBook() {
    setupBookModal(DISPLAY_STATE.currentBook);
    await changeSecondaryView(Views.READ_BOOK);
}

async function nextPage() {
    DISPLAY_STATE.shownBookPage += DISPLAY_STATE.shownBookPage === 0 ? 1 : 2;
    await showTheBook();
}

async function previousPage() {
    DISPLAY_STATE.shownBookPage -= DISPLAY_STATE.shownBookPage === 1 ? 1 : 2;
    await showTheBook();
}

async function changeView(toView) {
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

async function changeSecondaryView(toView) {
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

async function backToMissions() {
    await changeView(Views.INVENTORY);
}

async function closeSkillTree() {
    await changeSecondaryView(Views.NONE);
}

async function openSkillTree() {
    inventory.removeItem('Book-A');
    await changeSecondaryView(Views.SKILL_TREE);
}

async function toggleSkillTree() {
    if (document.getElementById('skill-tree-view').classList.contains('hidden')) {
        await openSkillTree();
    } else {
        await closeSkillTree();
    }
}

async function autoFillQuery() {
    const currentTask = DISPLAY_STATE.currentTask;
    switch (currentTask ? currentTask.id.substring(5) : null) {
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
            queryInputField.value = 'SELECT DISTINCT name,surname FROM Mailto;';
            break;
        case '015':
            queryInputField.value = 'SELECT thing, LENGTH(thing) FROM Mind;';
            break;
        case '016':
            queryInputField.value = 'SELECT thing FROM Mind WHERE LENGTH(thing) >20;';
            break;
        default:
            if (DISPLAY_STATE.secondaryView === Views.SKILL_TREE) {
                skillPointStore.gainSkillPoints(20);
            } else if (DISPLAY_STATE.currentTaskGroup) {
                if (!DISPLAY_STATE.currentTaskGroup.getTaskCount() && !DISPLAY_STATE.currentTaskGroup.completed) {
                    await levelUp();
                    DISPLAY_STATE.currentTaskGroup.completed = true;
                } else {
                    for (let taskID of DISPLAY_STATE.currentTaskGroup.tasks) {
                        await tasks[taskID].completeTask();
                    }
                }
            } else {
                inventory.removeAll();
                inventory.addItems(taskGroups.asList().map(group => group.item.id));
                for (let itemID of inventory.contents) {
                    getItem(itemID).newItem = false;
                }
                inventory.update();
                unlockSkillMenu();
                for (let skillBracket of skillTree) {
                    for (let skill of skillBracket) {
                        skill.unlocked = true;
                    }
                }
                updateSkillTree();
            }
            break;
    }
}

async function skipLogin() {
    const fade = document.getElementById('fade-to-black');
    fade.style.display = "";
    await delay(50);
    fade.style.opacity = "1";
    await delay(400);
    await hideElement('login-view');
    await showElement('inventory-view');
    fade.style.opacity = "0";
    await delay(400);
    fade.style.display = "none";
}

let progression;

async function loadProgression(lines) {
    eval(lines.join(''));
    if (!progression) {
        throw new Error("'progression' is undefined after eval.");
    }

    const requiredByMatrix = {};
    for (let level of Object.values(progression)) {
        for (let req of level.requires) {
            if (!requiredByMatrix[level.id]) requiredByMatrix[level.id] = [];
            if (!requiredByMatrix[req]) requiredByMatrix[req] = [];
            if (req) requiredByMatrix[req].push(level);
        }
    }

    function lookup(id) {
        for (let level of progression) {
            if (level.id === id) return level;
        }
        return undefined;
    }

    for (let level of progression) {
        if (level !== lookup(level.id)) throw new Error(`Duplicate ID '${level.id}', Same thing can not be in the graph twice.`)
    }

    // Find cycles and layer numbers with BFS
    const root = "A";
    lookup(root).layer = 0;

    const que = [root];
    let covered = 0;
    let previousLayer = 0;
    const visitedTaskIDs = {}
    while (que.length > 0) {
        const id = que.shift();
        const currentLevel = lookup(id);

        if (covered > 100) {
            throw new Error(`Cycle detected in the progression graph, triggered BFS step limit threshold (${100})`);
        }
        covered++;

        const requiredLevels = requiredByMatrix[id];
        previousLayer = currentLevel.layer + 1;
        requiredLevels.forEach(level => level.layer = currentLevel.layer + 1);

        for (let taskID of currentLevel.tasks) {
            if (visitedTaskIDs[taskID] && visitedTaskIDs[taskID] !== id) throw new Error(`Duplicate task id '${taskID}' on level ${id} (was already defined for level ${visitedTaskIDs[taskID]})`);
            visitedTaskIDs[taskID] = id;
        }

        que.push(...requiredLevels.map(level => level.id));
    }

    // Initialize skill tree based on layers and task groups based on levels
    skillTree.splice(0, skillTree.length)
    for (let level of Object.values(progression)) {
        const layer = level.layer;
        if (layer === undefined) continue;
        while (!skillTree[layer]) skillTree.push([]);
        skillTree[layer].push({
            item: `Book-${level.id}`,
            unlocked: level.layer === 0,
            cost: level.layer === 0 ? 0 : 1,
            requires: level.requires.map(id => `Book-${id}`),
            tasks: `task-group-${level.id}`
        })
        taskGroups[level.id] = new TaskGroup({
            id: 'A',
            item: new ImageItem({
                id: `task-group-${level.id}`,
                name: `i18n-group-${level.id}-name`,
                onclick: `showTaskGroup('${level.id}')`,
                url: './css/scrolls.png',
                margins: "m-2"
            }),
            unlocked: level.layer === 0,
            tasks: level.tasks,
        });
    }
}

async function beginGame() {
    try {
        await loadProgression(await readLines("tasks/progression.js"));
    } catch (e) {
        return showError(`Could not load tasks/progression.js: ${e}`)
    }
    await loadItems();
    await loadTasks();
    inventory.update();
    updateSkillTree();
    updateCompletionIndicator();
}

beginGame();