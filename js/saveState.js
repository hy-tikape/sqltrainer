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
        function setTaskGroupAsUnlocked(groupID) {
            const group = taskGroups[groupID];
            group.newItem = false;
            group.unlocked = true;
            getItem(group.book).newItem = group.getCompletedTaskCount() === 0;
        }

        const unlockedTaskGroups = [];
        for (let taskID of completedTaskIDs) {
            const task = tasks[taskID];
            task.completed = true;

            const group = taskGroups.lookupTaskGroupWithTaskId(taskID);
            const groupID = group.id;
            setTaskGroupAsUnlocked(groupID);
            if (!unlockedTaskGroups.includes(groupID)) {
                unlockedTaskGroups.push(groupID);
            }
            if (group.isCompleted()) {
                group.completed = true;
                group.requiredBy.forEach(groupID => {
                    if (!unlockedTaskGroups.includes(groupID)) {
                        unlockedTaskGroups.push(groupID);
                        setTaskGroupAsUnlocked(groupID);
                    }
                });
            }
        }
        return unlockedTaskGroups;
    }

    function loadInventory(unlockedTaskGroups) {
        if (!unlockedTaskGroups.includes('A')) {
            inventory.addItems(['item-00', 'task-group-A'])
        }
        inventory.addItems(taskGroups.asList().map(taskGroup => taskGroup.item.id));
        inventory.removeItem('task-group-X');
        if (unlockedTaskGroups.includes('X')) {
            getItem('item-999').unlocked = true;
        }
        inventory.addItem('item-999');
    }

    function loadGameState(unlockedTaskGroups) {
        if (!unlockedTaskGroups.includes('A')) {
            DISPLAY_STATE.bookMenuUnlocked = false;
            document.getElementById('skill-box').classList.add('hidden');
        }
        if (unlockedTaskGroups.includes('X')) {
            DISPLAY_STATE.endgame = true;
        }
        if (taskGroups.getCompletedTaskCount() >= taskGroups.getTaskCount()) {
            DISPLAY_STATE.gameCompleted = true;
        }
    }

    async function updateViews(unlockedTaskGroups) {
        if (unlockedTaskGroups.length > 0) {
            // Open the latest unlocked task group.
            const lastTaskGroupID = unlockedTaskGroups[unlockedTaskGroups.length - 1];
            await Views.INVENTORY.showTaskGroup(lastTaskGroupID);
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
    loadGameState(unlockedTaskGroups);
    await updateViews(unlockedTaskGroups);
    DISPLAY_STATE.saveLoaded = true;
}