window.addEventListener('error', function (e) {
    console.error(e.error);
});

Views = {
    INVENTORY: {
        id: 'inventory-view',
        open: async () => await showElement('inventory-view'),
        close: async () => await hideElement('inventory-view'),
        updateTaskGroup() {
            const viewedTasks = document.getElementById('viewed-tasks');
            if (viewedTasks) {
                const currentTaskGroup = DISPLAY_STATE.currentTaskGroup;
                viewedTasks.innerHTML = currentTaskGroup ? currentTaskGroup.renderTaskInventory() : '';
            }
        },
        async showTaskGroup(groupID) {
            const taskGroup = taskGroups[groupID];
            // Switch to new or toggle if the current was clicked.
            DISPLAY_STATE.currentTaskGroup = taskGroup !== DISPLAY_STATE.currentTaskGroup ? taskGroup : null;
            this.updateTaskGroup();
            inventory.update();
        }
    },
    TASK: {
        id: 'task-view',
        open: async () => await showElement('task-view'),
        close: async () => {
            DISPLAY_STATE.currentTask = null;
            await hideElement('task-view');
        },
        queryInputField: document.getElementById("query-input"),
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
        },
        async showModelAnswer() {
            const currentTask = DISPLAY_STATE.currentTask;
            if (!currentTask) return;

            const modelAnswerSQL = await MOOC.quizzesModel(currentTask);
            document.getElementById('model-answer').value = modelAnswerSQL;
            await showElement('model-answer');
        },
        updateNewItemIndicator() {
            if (inventory.contents.filter(itemID => getItem(itemID).newItem).length > 0) {
                showElement('task-view-new-items-highlight');
            } else {
                hideElement('task-view-new-items-highlight');
            }
        },
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
            const hideFlame = DISPLAY_STATE.endgame && task.completed;
            const flame = new Flame({id: 'task-flame', evil: DISPLAY_STATE.endgame});
            document.getElementById('task-flame-container').innerHTML = hideFlame ? '' : flame.render();
            document.getElementById("query-in-table").innerHTML = await task.renderTaskTables();
            document.getElementById("query-out-table").innerHTML = ""
            this.updateNewItemIndicator();
            this.queryInputField.value = query ? query : i18n.get("query-placeholder");
            if (MOOC.loginStatus === LoginStatus.LOGGED_IN) {
                const previousAnswer = await MOOC.quizzesAnswer(task);
                if (previousAnswer) this.queryInputField.value = previousAnswer;
            }
            await changeView(this);
        },
        async show(taskID) {
            DISPLAY_STATE.currentTask = tasks[taskID];
            try {
                await this.showWithQuery();
            } catch (e) {
                showError(e);
            }
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
        },
        setupModal() {
            const item = DISPLAY_STATE.shownItem;
            document.getElementById('display-item-header').innerHTML = i18n.get(item.discoverTitle);
            document.getElementById('display-item').innerHTML = item.renderShowItem();
            document.getElementById('display-item-text').innerText = i18n.get(item.discoverText);
        },
        async show(itemID) {
            DISPLAY_STATE.shownItem = getItem(itemID);
            this.setupModal();
            await changeSecondaryView(this);
        }
    },
    READ_BOOK: {
        id: 'display-book-modal',
        open: async () => await showModal('#display-book-modal', DISPLAY_STATE.previousSecondaryView),
        close: () => {
            $('#display-book-modal').modal('hide');
        },
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
        },
        async showTheBook() {
            this.setupModal(DISPLAY_STATE.currentBook);
            await changeSecondaryView(this);
        },
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
        },
        async nextPage() {
            DISPLAY_STATE.shownBookPage += DISPLAY_STATE.shownBookPage === 0 ? 1 : 2;
            await this.showTheBook();
        },
        async previousPage() {
            DISPLAY_STATE.shownBookPage -= DISPLAY_STATE.shownBookPage === 1 ? 1 : 2;
            await this.showTheBook();
        }
    },
    SKILL_TREE: {
        id: 'skill-tree-view',
        open: async () => await showElementImmediately('skill-tree-view'),
        close: async () => await hideElementImmediately('skill-tree-view'),
        async toggle() {
            if (document.getElementById('skill-tree-view').classList.contains('hidden')) {
                inventory.removeItem('Book-A');
                await changeSecondaryView(this);
            } else {
                await changeSecondaryView(Views.NONE);
            }
        },
        update() {
            document.getElementById('skill-tree').innerHTML = renderSkillTree();
        }
    },
    LOGIN: {
        id: 'login-view',
        open: async () => {
        },
        close: async () => {
            if (MOOC.loginStatus === LoginStatus.LOGGED_OUT) {
                document.getElementById('logout-button').innerHTML = `<i class="fa fa-fw fa-door-open"></i> ${i18n.get('login')}`
                // TODO Warning about progress not being saved
            }
            await fadeToBlack();
            await hideElementImmediately('login-view');
            await fadeFromBlack();
        }
    },
    LOADING: {
        id: 'loading-view',
        open: async () => {
            await showElementImmediately('loading-view');
            await awaitUntil(() => DISPLAY_STATE.loaded && DISPLAY_STATE.saveLoaded);
            await changeView(Views.INVENTORY);
        },
        close: async () => await hideElement('loading-view'),
    },
    FLAME_ANIMATION: {
        id: 'evil-flame-animation',
        open: async () => {
            await fadeToBlack();
            await showElementImmediately('evil-flame-animation');
            await hideElementImmediately('skill-box');
            await delay(500);
            await fadeFromBlack();
            await evilFlameAnimation();
        },
        close: async () => {
            await hideElement('evil-flame-animation');
            await showElement('skill-box');
        },
    },
    MAP_VIEW: {
        id: 'map-view',
        open: async () => {
            await showElement('map-view')
        },
        close: async () => {
            await hideElement('map-view')
        }
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
    },
    clear() {
        for (const view of Object.values(Views)) {
            delete this[view.id];
        }
    }
}

DISPLAY_STATE = {
    loaded: false,
    saveLoaded: false,

    currentView: Views.LOGIN,
    secondaryView: Views.NONE,
    previousView: Views.NONE,
    previousSecondaryView: Views.NONE,

    // TODO Move to View objects.
    currentTask: null,
    currentTaskGroup: null,
    shownItem: null,
    currentBook: null,
    shownBookPage: 0,
    //

    skillMenuUnlocked: false,
    endgame: false,
}

// Register listeners to elements
function registerListeners() {
    const queryInputField = Views.TASK.queryInputField;
    queryInputField.onfocus = () => {
        if (queryInputField.value.includes(i18n.get("query-placeholder"))) {
            queryInputField.value = "";
        }
    }
    queryInputField.onblur = () => {
        if (queryInputField.value.length === 0) {
            queryInputField.value = i18n.get("query-placeholder");
        }
    }
}

registerListeners();

function showError(error) {
    console.error(error)
    document.getElementById(`alerts`).innerHTML = `<div class="alert alert-danger alert-dismissible" role="alert">Error: ${error}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    </div>`;
}

async function changeView(toView) {
    if (DISPLAY_STATE.currentView === toView) return;
    DISPLAY_STATE.previousView = DISPLAY_STATE.currentView;
    await DISPLAY_STATE.currentView.close();
    DISPLAY_STATE.currentView = toView;
    const eventsToFire = eventQueue[toView.id];
    if (eventsToFire && eventsToFire.length) {
        for (let event of eventsToFire) {
            await event();
        }
        eventQueue[toView.id] = [];
    }
    await DISPLAY_STATE.currentView.open();
}

async function changeSecondaryView(toView) {
    if (DISPLAY_STATE.secondaryView === toView) return;
    DISPLAY_STATE.previousSecondaryView = DISPLAY_STATE.secondaryView;
    await DISPLAY_STATE.secondaryView.close();
    DISPLAY_STATE.secondaryView = toView;
    const eventsToFire = eventQueue[toView.id];
    if (eventsToFire && eventsToFire.length) {
        for (let event of eventsToFire) {
            await event();
        }
        eventQueue[toView.id] = [];
    }
    await DISPLAY_STATE.secondaryView.open();
}

async function autoFillQuery() {
    const currentTask = DISPLAY_STATE.currentTask;
    const queryInputField = Views.TASK.queryInputField;
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
                inventory.addItems(skillsByID.asList().map(skill => skill.tasks));
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
                Views.SKILL_TREE.update();
            }
            break;
    }
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

    // Initialize skill tree based on layers and task groups based on levels defined in progression
    skillTree.splice(0, skillTree.length)
    for (let level of Object.values(progression)) {
        const layer = level.layer;
        if (layer === undefined) continue;
        while (!skillTree[layer]) skillTree.push([]);
        const skill = new Skill({
            item: `Book-${level.id}`,
            unlocked: level.layer === 0,
            cost: level.layer === 0 ? 0 : 1,
            requires: level.requires.map(id => `Book-${id}`),
            requiredBy: requiredByMatrix[level.id].map(lvl => `Book-${lvl.id}`),
            tasks: `task-group-${level.id}`,
            bracket: level.layer,
            index: skillTree[layer].length
        });
        skillTree[layer].push(skill);
        skillsByID[`Book-${level.id}`] = skill;

        taskGroups[level.id] = new TaskGroup({
            id: level.id,
            unlocked: level.layer === 0,
            tasks: level.tasks,
        });
    }

    skillsByID['Book-X'].tasks = 'Book-X';

    // Relax edges by brute-forcing all layer permutations (up to 5! (120) assumed)
    const reorderedSkillTree = [];

    function locateFromReordered(lookingForItem) {
        for (let x = 0; x < reorderedSkillTree.length; x++) {
            const bracket = reorderedSkillTree[x];
            const bracketSize = bracket.length;
            for (let y = 0; y < bracketSize; y++) {
                const skill = bracket[y];
                if (skill.item === lookingForItem) {
                    skill.index = y;
                    return {y: skill.getY()};
                }
            }
        }
        return {y: 0};
    }

    for (let layerIndx = 0; layerIndx < skillTree.length; layerIndx++) {
        const layer = skillTree[layerIndx];
        let minStress = Number.MAX_SAFE_INTEGER;
        const layerSize = layer.length;

        /* Brute-force find lowest "stress" for the layout of this layer.
           Stress is calculated from the length of the arcs to the previous (already decided) layer
           And arcs to the currently in use next (undecided) layer.
           This produces good enough results. */
        for (let permutation of generateAllPermutations(layer)) {
            let stress = 0;
            for (let i = 0; i < permutation.length; i++) {
                for (let requiredID of permutation[i].requires) {
                    const currentHeight = Skill.getYForBracket(layerSize, i);
                    // Add stress of edges on the left of this layer
                    stress += Math.abs(locateFromReordered(requiredID).y - currentHeight);
                    // Add stress of edges on the right of this layer
                    for (let reverseReq of requiredByMatrix[permutation[i].item.substring(5)]) {
                        stress += Math.abs(skillsByID['Book-' + reverseReq.id].getY() - currentHeight);
                    }
                }
            }
            // Find the layout with minimum stress.
            if (stress < minStress) {
                minStress = stress;
                for (let index = 0; index < permutation.length; index++) {
                    permutation[index].index = index; // Set the skill index for proper y calculations later.
                }
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

async function skipLogin() {
    DISPLAY_STATE.saveLoaded = true;
    changeView(Views.LOADING);
}

async function login() {
    await showLoginError('')
    const username = document.getElementById('inputUser').value;
    if (!username) return showLoginError('Kirjoita käyttäjätunnus');
    const password = document.getElementById('inputPassword').value;
    if (!password) return showLoginError('Kirjoita salasana');

    const loginButton = document.getElementById('login-button');
    loginButton.innerHTML = `<span id="logging-in-animation">
            <i class="fa fa-star logging-in-animation"></i>
            <i class="far fa-star logging-in-animation offset"></i>
        </span>` + loginButton.innerHTML;
    try {
        await MOOC.login(username, password);
        if (MOOC.loginStatus === LoginStatus.ERRORED) {
            showLoginError("Kirjautuminen epäonnistui.")
        } else if (MOOC.loginStatus === LoginStatus.LOGGED_IN) {
            loadCompletionFromQuizzes();
            changeView(Views.LOADING);
        }
    } catch (e) {
        showLoginError(e);
    }
    document.getElementById('logging-in-animation').remove();
}

async function logout() {
    MOOC.logout();
    document.getElementById('inputUser').value = '';
    document.getElementById('inputPassword').value = '';
    await changeView(Views.NONE);
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

function renderMap() {
    const mapView = document.getElementById('map-view');
    const flameLocations = [
        [6, 43],
        [7.5, 19],
        [8.5, 34],
        [11.5, 27],
        [15.5, 38],

        [17, 21],
        [18, 28],
        [20, 5.5],
        [21, 42],
        [23, 17],

        [25, 32],
        [27, 25],
        [29, 11],
        [30, 18],
        [31.5, 39],

        [34, 31],
        [36, 46],
        [36.5, 23],
        [38, 10],
        [40.5, 8],

        [41, 36.5],
        [42, 15.5],
        [44, 41],
        [44.5, 23.5],
        [47, 29],

        [49, 21],
        [49, 14],
        [53.5, 32],
        [56.5, 15.5],
        [56.5, 39],

        [57, 27],
        [62, 7],
        [62, 33],
        [65, 13],
        [65.5, 26],

        [69.5, 42],
        [70, 20],
        [72, 32],
        [77.5, 27],
        [79.5, 15]
    ];
    const percMultiplier = 1;
    for (const loc of flameLocations) {
        loc[0] = loc[0] * percMultiplier;
        loc[1] = loc[1] * percMultiplier;
    }
    const wobble = 0.2;
    const maxFlame = flameLocations.length;
    for (let i = 0; i < 40; i++) {
        mapView.innerHTML += `<div class="evil-flame-container" style="position: absolute; left: calc(${flameLocations[i % maxFlame][0] - 4 + Math.random() * wobble}vw * var(--image-size)); top: calc(${flameLocations[i % maxFlame][1] - 7 + Math.random() * wobble}vw * var(--image-size));">
<svg enable-background="new 0 0 125 189.864" height="189.864px" id="evil-flame-${i}"
             version="1.1" viewBox="0 0 125 189.864" class="evil" onclick="Views.TASK.show('task-00${i}')"
             width="125px" x="0px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg"
             y="0px">
<path class="flame-main" d="M76.553,186.09c0,0-10.178-2.976-15.325-8.226s-9.278-16.82-9.278-16.82s-0.241-6.647-4.136-18.465
c0,0,3.357,4.969,5.103,9.938c0,0-5.305-21.086,1.712-30.418c7.017-9.333,0.571-35.654-2.25-37.534c0,0,13.07,5.64,19.875,47.54
c6.806,41.899,16.831,45.301,6.088,53.985" fill="#F36E21"/>
            <path class="flame-main one" d="M61.693,122.257c4.117-15.4,12.097-14.487-11.589-60.872c0,0,32.016,10.223,52.601,63.123
c20.585,52.899-19.848,61.045-19.643,61.582c0.206,0.537-19.401-0.269-14.835-18.532S57.576,137.656,61.693,122.257z"
                  fill="#F6891F"/>
            <path class="flame-main two" d="M81.657,79.192c0,0,11.549,24.845,3.626,40.02c-7.924,15.175-21.126,41.899-0.425,64.998
C84.858,184.21,125.705,150.905,81.657,79.192z" fill="#FFD04A"/>
            <path class="flame-main three" d="M99.92,101.754c0,0-23.208,47.027-12.043,80.072c0,0,32.741-16.073,20.108-45.79
C95.354,106.319,99.92,114.108,99.92,101.754z" fill="#FDBA16"/>
            <path class="flame-main four" d="M103.143,105.917c0,0,8.927,30.753-1.043,46.868c-9.969,16.115-14.799,29.041-14.799,29.041
S134.387,164.603,103.143,105.917z" fill="#F36E21"/>
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
</svg>
<p>Evil flame #${i}</p>
</div>`
        for (const childNode of document.getElementById('evil-flame-' + i).childNodes) {
            if (childNode instanceof Element) {
                const randomDelay = -Math.random() * 8;
                childNode.style.animationDelay = parseInt(window.getComputedStyle(childNode, null).animationDelay.match(/[0-9]*/)) + randomDelay + 's'
            }
        }
    }
}

async function beginGame() {
    MOOC.loginExisting();
    if (MOOC.loginStatus === LoginStatus.LOGGED_IN) {
        loadCompletionFromQuizzes();
        changeView(Views.LOADING);
    }
    try {
        await loadProgression(await readLines("tasks/progression.js"));
    } catch (e) {
        return showError(`Could not load tasks/progression.js: ${e}`)
    }
    await loadItems();
    await loadTasks();
    inventory.update();
    Views.SKILL_TREE.update();
    updateCompletionIndicator();
    window.addEventListener('resize', Views.SKILL_TREE.update);
    DISPLAY_STATE.loaded = true;
    // await awaitUntil(() => DISPLAY_STATE.currentView === Views.INVENTORY);
    // changeView(Views.MAP_VIEW);
    // renderMap();
    // DISPLAY_STATE.endgame = true;
}

beginGame();