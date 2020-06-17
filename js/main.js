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
        open: async () => await showElementImmediately('skill-tree-view'),
        close: async () => await hideElementImmediately('skill-tree-view')
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
    if (currentTask.completed && MOOC.loginStatus === LoginStatus.LOGGED_IN) {
        showElement('query-model-button');
    } else {
        hideElement('query-model-button');
    }
}

async function showModelAnswer() {
    const currentTask = DISPLAY_STATE.currentTask;
    if (!currentTask) return;

    const modelAnswerSQL = await MOOC.quizzesModel(currentTask);
    console.log(modelAnswerSQL);
    document.getElementById('model-answer').value = modelAnswerSQL;
    await showElement('model-answer');
}

function updateTaskViewNewItemIndicator() {
    if (inventory.contents.filter(itemID => getItem(itemID).newItem).length > 0) {
        showElement('task-view-new-items-highlight');
    } else {
        hideElement('task-view-new-items-highlight');
    }
}

async function showTheTask(query) {
    hideElement('model-answer');
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
    let html = getItem(taskGroup.book).render();
    for (let task of taskGroup.tasks) {
        html += tasks[task] ? tasks[task].render() : `<div class="item">
                <img class="item-icon" alt="missing task ${task}" src="img/scroll.png" draggable="false">
                <i class="task-group-color fa fa-fw fa-2x fa-bookmark"></i>
                <p>${task} doesn't exist</p>
            </div>`;
    }
    return html;
}

function updateTaskGroupTasks() {
    const viewedTasks = document.getElementById('viewed-tasks');
    if (viewedTasks) viewedTasks.innerHTML = renderTasks(DISPLAY_STATE.currentTaskGroup);
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

async function showBook(event, itemID) {
    event.stopPropagation();
    DISPLAY_STATE.currentBook = items[itemID];
    DISPLAY_STATE.shownBookPage = 0;
    DISPLAY_STATE.currentBook.newItem = false;
    updateTaskGroupTasks();
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
            if (DISPLAY_STATE.currentTaskGroup) {
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
    if (MOOC.loginStatus === LoginStatus.LOGGED_OUT) {
        document.getElementById('logout-button').innerHTML = `<i class="fa fa-fw fa-door-open"></i> ${i18n.get('login')}`
        // TODO Warning about progress not being saved
    }
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
        const skill = {
            item: `Book-${level.id}`,
            unlocked: level.layer === 0,
            cost: level.layer === 0 ? 0 : 1,
            requires: level.requires.map(id => `Book-${id}`),
            requiredBy: requiredByMatrix[level.id].map(lvl => `Book-${lvl.id}`),
            tasks: `task-group-${level.id}`
        };
        skillTree[layer].push(skill);
        skillsByID[`Book-${level.id}`] = skill;
        taskGroups[level.id] = new TaskGroup({
            id: 'A',
            item: new ImageItem({
                id: `task-group-${level.id}`,
                name: `i18n-group-${level.id}-name`,
                onclick: `showTaskGroup('${level.id}')`,
                url: './img/scrolls.png',
            }),
            book: `Book-${level.id}`,
            unlocked: level.layer === 0,
            tasks: level.tasks,
        });
    }

    // Relax edges by brute-forcing all layer permutations (up to 5! (120) assumed)
    const reorderedSkillTree = [];

    function locateFromReordered(lookingForItem) {
        for (let x = 0; x < reorderedSkillTree.length; x++) {
            const bracket = reorderedSkillTree[x];
            const bracketSize = bracket.length;
            for (let y = 0; y < bracketSize; y++) {
                const skill = bracket[y];
                if (skill.item === lookingForItem) {
                    return {x, y: getSkillYLocationForBracket(bracketSize, y)};
                }
            }
        }
        return {x: 0, y: 0};
    }

    for (let layerIndx = 0; layerIndx < skillTree.length; layerIndx++) {
        const layer = skillTree[layerIndx];
        let minStress = Number.MAX_SAFE_INTEGER;
        const layerSize = layer.length;
        // Go over all permutations for the layer
        for (let permutation of heapsAlgorithmArrayPermutations(layer)) {
            let stress = 0;
            for (let i = 0; i < permutation.length; i++) {
                for (let requiredID of permutation[i].requires) {
                    const currentHeight = getSkillYLocationForBracket(layerSize, i);
                    // Add stress of edges on the left of this layer
                    stress += Math.abs(locateFromReordered(requiredID).y - currentHeight);
                    // Add stress of edges on the right of this layer
                    for (let reverseReq of requiredByMatrix[permutation[i].item.substring(5)]) {
                        stress += Math.abs(locate('Book-' + reverseReq.id).y - currentHeight);
                    }
                }
            }
            // Find the layout with minimum stress.
            if (stress < minStress) {
                minStress = stress;
                reorderedSkillTree[layerIndx] = permutation;
            }
        }
    }
    skillTree.splice(0, skillTree.length);
    skillTree.push(...reorderedSkillTree);
}

async function showLoginError(error) {
    if (!error) return await hideElement('login-error');
    document.getElementById('login-error').innerText = error;
    showElement('login-error')
}

async function login() {
    await showLoginError('')
    const username = document.getElementById('inputUser').value;
    if (!username) return showLoginError('Kirjoita käyttäjätunnus');
    const password = document.getElementById('inputPassword').value;
    if (!password) return showLoginError('Kirjoita salasana');

    try {
        await MOOC.login(username, password);
        if (MOOC.loginStatus === LoginStatus.ERRORED) {
            showLoginError("Kirjautuminen epäonnistui.")
        } else if (MOOC.loginStatus === LoginStatus.LOGGED_IN) {
            loadCompletionFromQuizzes();
            skipLogin();
        }
    } catch (e) {
        showLoginError(e);
    }
}

async function logout() {
    MOOC.logout();
    document.getElementById('inputUser').value = '';
    document.getElementById('inputPassword').value = '';
    await hideElement('inventory-view');
    window.location.href = "./";
}

async function loadCompletionFromQuizzes() {
    const taskStatus = await MOOC.quizzesStatus();
    await awaitUntil(() => tasks.loaded);
    const completedTaskIDs = [];
    for (let task of tasks.asList()) {
        if (taskStatus[task.getNumericID() - 1]) {
            completedTaskIDs.push(task.id);
        }
    }
    load(completedTaskIDs);
}

async function beginGame() {
    MOOC.loginExisting();
    if (MOOC.loginStatus === LoginStatus.LOGGED_IN) {
        loadCompletionFromQuizzes();
        skipLogin();
    }
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
    window.addEventListener('resize', updateSkillTree);

    // let frameCount = 0;
    // const body = document.getElementById('body');
    // const goodFlame = document.getElementById('good-flame');
    // const evilFlame = document.getElementById('evil-flame');
    // const speech = document.getElementById('task-animation-flame-speech');
    //
    // let translation = 15;
    // (async function frame() {
    //     frameCount++;
    //     if (frameCount > 300 && frameCount < 312) {
    //         goodFlame.style.opacity = (parseInt(goodFlame.style.opacity) + 1) % 2;
    //         evilFlame.style.opacity = (parseInt(evilFlame.style.opacity) + 1) % 2;
    //         speech.classList.toggle('task-description');
    //         speech.classList.toggle('evil-task-description');
    //     }
    //     if (frameCount % 3 === 0 && frameCount < 297) {
    //         translation *= -1;
    //         body.style.transform = `translate(0, ${translation}px)`;
    //     } else if (frameCount % 3 === 0 && frameCount < 312) {
    //         translation *= -1;
    //         body.style.transform = `translate(0, ${translation*2}px)`;
    //     } else {
    //         body.style.transform = '';
    //     }
    //     requestAnimationFrame(frame);
    // }())
    const mapView = document.getElementById('map-view');
    for (let i = 0; i < 40; i++) {
        mapView.innerHTML += ` <svg enable-background="new 0 0 125 189.864" height="189.864px" id="evil-flame"
             style="filter: hue-rotate(-120deg); transform: scale(0.3); position: absolute; left: ${Math.random() * 90}%; top: calc(${Math.random() * 75}vh - 4rem);"
             version="1.1" viewBox="0 0 125 189.864"
             width="125px" x="0px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg"
             y="0px">
<path class="flame-main" d="M76.553,186.09c0,0-10.178-2.976-15.325-8.226s-9.278-16.82-9.278-16.82s-0.241-6.647-4.136-18.465
\tc0,0,3.357,4.969,5.103,9.938c0,0-5.305-21.086,1.712-30.418c7.017-9.333,0.571-35.654-2.25-37.534c0,0,13.07,5.64,19.875,47.54
\tc6.806,41.899,16.831,45.301,6.088,53.985" fill="#F36E21"/>
            <path class="flame-main one" d="M61.693,122.257c4.117-15.4,12.097-14.487-11.589-60.872c0,0,32.016,10.223,52.601,63.123
\tc20.585,52.899-19.848,61.045-19.643,61.582c0.206,0.537-19.401-0.269-14.835-18.532S57.576,137.656,61.693,122.257z"
                  fill="#F6891F"/>
            <path class="flame-main two" d="M81.657,79.192c0,0,11.549,24.845,3.626,40.02c-7.924,15.175-21.126,41.899-0.425,64.998
\tC84.858,184.21,125.705,150.905,81.657,79.192z" fill="#FFD04A"/>
            <path class="flame-main three" d="M99.92,101.754c0,0-23.208,47.027-12.043,80.072c0,0,32.741-16.073,20.108-45.79
\tC95.354,106.319,99.92,114.108,99.92,101.754z" fill="#FDBA16"/>
            <path class="flame-main four" d="M103.143,105.917c0,0,8.927,30.753-1.043,46.868c-9.969,16.115-14.799,29.041-14.799,29.041
\tS134.387,164.603,103.143,105.917z" fill="#F36E21"/>
            <path class="flame-main five"
                  d="M62.049,104.171c0,0-15.645,67.588,10.529,77.655C98.753,191.894,69.033,130.761,62.049,104.171z"
                  fill="#FDBA16"/>
            <path class="flame"
                  d="M101.011,112.926c0,0,8.973,10.519,4.556,16.543C99.37,129.735,106.752,117.406,101.011,112.926z"
                  fill="#F36E21"/>
            <path class="flame one"
                  d="M55.592,126.854c0,0-3.819,13.29,2.699,16.945C64.038,141.48,55.907,132.263,55.592,126.854z"
                  fill="#F36E21"/>
            <path class="flame two"
                  d="M54.918,104.595c0,0-3.959,6.109-1.24,8.949C56.93,113.256,52.228,107.329,54.918,104.595z"
                  fill="#F36E21"/>
</svg>`
    }
}

beginGame();