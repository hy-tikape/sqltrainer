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
    bookMenuUnlocked: false,
    endgame: false,
    gameCompleted: false,

    currentView: Views.LOGIN,
    secondaryView: Views.NONE,
    previousView: Views.NONE,
    previousSecondaryView: Views.NONE,
}

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
    queryInputField.addEventListener('keyup', () => {
        if (Views.TASK.selectedPreviousAnswer) {
            Views.TASK.unsetPreviousAnswerSelection();
        }
    });

    document.body.addEventListener('keyup', async function (e) {
        if (e.key === 'Tab') {
            document.getElementById('body').classList.remove('no-focus-outline');
        }
        if (DISPLAY_STATE.currentView === Views.TASK && e.key === 'Escape') {
            await changeView(DISPLAY_STATE.previousView);
        }
    });
}

registerListeners();

function showError(error) {
    console.error(error);
    document.getElementById(`alerts`).innerHTML = `<div class="alert alert-danger alert-dismissible" role="alert">Error: ${error}
        <button type="button" class="close" data-dismiss="alert" aria-label="${i18n.get('close')}">
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

// TODO Remove this function along with the dev button
async function autoFillQuery() {
    if (DISPLAY_STATE.currentView === Views.LOGIN) return await skipLogin();
    if (DISPLAY_STATE.currentView === Views.FLAME_ANIMATION) return await changeView(Views.MAP);
    if (DISPLAY_STATE.currentView === Views.MAP) {
        for (let taskID of taskGroups['X'].tasks) {
            tasks[taskID].completed = true;
        }
        updateCompletionIndicator();
        await Views.MAP.render();
        DISPLAY_STATE.gameCompleted = true;
        return await changeView(Views.END_ANIMATION);
    }
    if (DISPLAY_STATE.currentView === Views.END_ANIMATION) return await changeView(Views.END_TEXT);
    const currentTaskGroup = Views.INVENTORY.currentTaskGroup;
    if (currentTaskGroup) {
        if (!currentTaskGroup.getTaskCount() && !currentTaskGroup.completed) {
            await currentTaskGroup.performUnlock();
            currentTaskGroup.completed = true;
        } else {
            for (let taskID of currentTaskGroup.tasks) {
                await tasks[taskID].completeTask();
            }
        }
    } else {
        if (DISPLAY_STATE.endgame) {
            changeView(Views.MAP);
        } else {
            await inventory.removeAll();
            await inventory.addItems(taskGroups.asList().map(taskGroup => taskGroup.item.id));
            await inventory.unlockMany(inventory.contents);
            await inventory.setAsViewedMany(inventory.contents);
            await inventory.removeItem('task-group-X');
            await inventory.addItem('item-999');
            await inventory.unlock('item-999');
            await BookMenuButton.unlock();
        }
    }
}

let progression;

async function loadGameElements(linesOfProgressionJs) {
    eval(linesOfProgressionJs.join(''));
    if (!progression) {
        throw new Error("'progression' is undefined after eval.");
    }

    function lookup(id) {
        for (let level of progression) {
            if (level.id === id) return level;
        }
        return undefined;
    }

    function preventLevelIdDuplicates() {
        for (let level of progression) {
            if (level !== lookup(level.id)) throw new Error(`Duplicate ID '${level.id}', Same thing can not be in the graph twice.`)
        }
    }

    function calculateRequiredByMatrix() {
        const requiredByMatrix = {};
        for (let level of Object.values(progression)) {
            for (let req of level.requires) {
                if (!requiredByMatrix[level.id]) requiredByMatrix[level.id] = [];
                if (!requiredByMatrix[req]) requiredByMatrix[req] = [];
                if (req) requiredByMatrix[req].push(level);
            }
        }
        return requiredByMatrix;
    }

    // Find cycles and layer numbers with BFS
    function preventCyclesAndTaskDuplicates(requiredByMatrix) {
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
    }

    function initializeGameDictionaries(requiredByMatrix) {
        for (let level of Object.values(progression)) {
            const layer = level.layer;
            if (layer === undefined) continue;

            taskGroups[level.id] = new TaskGroup({
                id: level.id,
                unlocked: level.layer === 0,
                newItem: level.layer === 0,
                tasks: level.tasks,
                requires: level.requires,
                requiredBy: requiredByMatrix[level.id].map(level => level.id),
            });

            for (let taskID of level.tasks) {
                tasks['task-' + taskID] = new LazyTask('task-' + taskID);
            }
        }
        inventory.addItems(taskGroups.asList().map(taskGroup => taskGroup.item.id));
        inventory.removeItem('task-group-X');
        inventory.addItem('item-999');
    }

    preventLevelIdDuplicates();
    const requiredByMatrix = calculateRequiredByMatrix();
    preventCyclesAndTaskDuplicates(requiredByMatrix);
    initializeGameDictionaries(requiredByMatrix);
}

async function showLoginError(error) {
    if (!error) return await hideElement('login-error');
    document.getElementById('login-error').innerText = error;
    showElement('login-error');
}

// TODO Remove this function along with dev button
async function skipLogin() {
    DISPLAY_STATE.saveLoaded = true;
    changeView(Views.LOADING);
}

async function login() {
    await showLoginError();
    const username = document.getElementById('inputUser').value;
    if (!username) return showLoginError(i18n.get('login-error-no-user'));
    const password = document.getElementById('inputPassword').value;
    if (!password) return showLoginError(i18n.get('login-error-no-password'));

    const loginButton = document.getElementById('login-button');
    loginButton.innerHTML = `<span id="logging-in-animation">
            <i class="fa fa-star logging-in-animation"></i>
            <i class="far fa-star logging-in-animation offset"></i>
        </span>` + loginButton.innerHTML;
    loginButton.setAttribute('disabled', 'true');
    loginButton.setAttribute('aria-disabled', 'true');
    try {
        await MOOC.login(username, password);
        if (MOOC.loginStatus === LoginStatus.ERRORED) {
            await showLoginError("Kirjautuminen epäonnistui.");
        } else if (MOOC.loginStatus === LoginStatus.LOGGED_IN) {
            loadCompletionFromQuizzes();
            changeView(Views.LOADING);
        }
    } catch (e) {
        showLoginError(e);
    }
    document.getElementById('logging-in-animation').remove();
    loginButton.removeAttribute('disabled');
    loginButton.setAttribute('aria-disabled', 'false');
}

async function logout() {
    MOOC.logout();
    document.getElementById('inputUser').value = '';
    document.getElementById('inputPassword').value = '';
    await changeView(Views.NONE);
    window.location.href = "./"; // Reloads the page
}

async function loadCompletionFromQuizzes() {
    const taskStatus = await MOOC.quizzesStatus();
    const completedTaskIDs = [];
    for (let task of tasks.asList()) {
        if (taskStatus[task.getNumericID() - 1]) {
            completedTaskIDs.push(task.id);
        }
    }
    await load(completedTaskIDs);
}

async function beginGame() {
    try {
        MOOC.loginExisting();
        if (MOOC.loginStatus === LoginStatus.LOGGED_IN) {
            loadCompletionFromQuizzes();
            changeView(Views.LOADING);
        }
        try {
            await loadGameElements(await readLines("tasks/progression.js"));
        } catch (e) {
            return showError(`Could not load tasks/progression.js: ${e}`)
        }
        await loadLanguage(currentLang);
        await awaitUntil(() => items.loaded);
        await inventory.update();
        updateCompletionIndicator();
        DISPLAY_STATE.loaded = true;
    } catch (error) {
        console.error(error);
        showError(`Could not load game: ${error}`);
    }
}

beginGame().catch(showError);