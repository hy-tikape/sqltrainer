async function load(completedTaskIDs) {
    function resetViews() {
        inventory.removeAll();
        for (let task of tasks.asList()) {
            task.completed = false;
        }
        Views.INVENTORY.currentTaskGroup = null;
        DISPLAY_STATE.bookMenuUnlocked = true;
        document.getElementById('skill-box').classList.remove('hidden');
    }

    function determineUnlockedTaskGroups(completedTaskIDs) {
        const unlockedTaskGroups = [];
        for (let taskID of completedTaskIDs) {
            const group = taskGroups.lookupTaskGroupWithTaskId(taskID);
            group.newItem = false;
            group.unlocked = true;
            getItem(group.book).newItem = false;
            const groupID = group.item.id;
            if (!unlockedTaskGroups.includes(groupID)) unlockedTaskGroups.push(groupID);

            const task = tasks[taskID];
            task.completed = true;
            if (group.isCompleted()) {
                group.completed = true;
            }
        }
        return unlockedTaskGroups;
    }

    function loadInventory(unlockedTaskGroups) {
        if (!unlockedTaskGroups.includes('task-group-A')) {
            inventory.addItems(['item-00', 'task-group-A'])
        }
        inventory.addItems(taskGroups.asList().map(taskGroup => taskGroup.item.id));
        inventory.removeItem('task-group-X');
        if (unlockedTaskGroups.includes('task-group-X')) {
            getItem('item-999').unlocked = true;
        }
        inventory.addItem('item-999');
    }

    function loadGameState() {
        if (!unlockedTaskGroups.includes('task-group-A')) {
            DISPLAY_STATE.bookMenuUnlocked = false;
            document.getElementById('skill-box').classList.add('hidden');
        }
        if (unlockedTaskGroups.includes('task-group-X')) {
            inventory.removeItem('task-group-X');
            DISPLAY_STATE.endgame = true;
        }
        if (taskGroups.getCompletedTaskCount() >= taskGroups.getTaskCount()) {
            DISPLAY_STATE.gameCompleted = true;
        }
    }

    async function updateViews() {
        if (unlockedTaskGroups.length > 0) {
            // Open the latest unlocked task group.
            const lastTaskGroup = unlockedTaskGroups[unlockedTaskGroups.length - 1].substr(11);
            await Views.INVENTORY.showTaskGroup(lastTaskGroup);
        } else {
            await inventory.update();
            await Views.INVENTORY.updateTaskGroup();
        }
        updateCompletionIndicator();
    }

    resetViews();
    await awaitUntil(() => DISPLAY_STATE.loaded && items.loaded);
    const unlockedTaskGroups = determineUnlockedTaskGroups(completedTaskIDs);
    loadInventory(unlockedTaskGroups);
    loadGameState();
    await updateViews();
    DISPLAY_STATE.saveLoaded = true;
}