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
    skillMenuUnlocked: false,
    endgame: false,

    currentView: Views.LOGIN,
    secondaryView: Views.NONE,
    previousView: Views.NONE,
    previousSecondaryView: Views.NONE,
}

// Register listeners to elements
function registerListeners() {
    window.addEventListener('error', event => console.error(event.error));

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
    const currentTask = Views.TASK.currentTask;
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
            if (DISPLAY_STATE.currentView === Views.LOGIN) return await skipLogin();
            const currentTaskGroup = Views.INVENTORY.currentTaskGroup;
            if (currentTaskGroup) {
                if (!currentTaskGroup.getTaskCount() && !currentTaskGroup.completed) {
                    await unlockBasedOn(currentTaskGroup);
                    currentTaskGroup.completed = true;
                } else {
                    for (let taskID of currentTaskGroup.tasks) {
                        await tasks[taskID].completeTask();
                    }
                }
            } else {
                if (skillsByID['Book-X'].unlocked) {
                    DISPLAY_STATE.endgame = true;
                    changeView(Views.MAP);
                    inventory.removeItem('Book-X');
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
}

beginGame();