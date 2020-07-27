function load(completedTaskIDs) {
    function resetViews() {
        inventory.removeAll();
        for (let bracket of skillTree) {
            for (let skill of bracket) {
                skill.unlocked = false;
            }
        }
        for (let task of tasks.asList()) {
            task.completed = false;
        }
        Views.INVENTORY.currentTaskGroup = null;
        DISPLAY_STATE.skillMenuUnlocked = true;
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
        inventory.addItems(skillsByID.asList().map(skill => skill.taskGroupID));
    }

    function loadSkillTree(unlockedTaskGroups) {
        for (let bracket of skillTree) {
            for (let skill of bracket) {
                if (unlockedTaskGroups.includes(skill.taskGroupID)) {
                    skill.unlocked = true;
                    skill.requiredBy.forEach(itemID => skillsByID[itemID].attemptUnlock());
                }
            }
        }
        skillTree[0][0].unlocked = true; // Unlocks first book.
    }

    function loadGameState() {
        if (!unlockedTaskGroups.includes('task-group-A')) {
            DISPLAY_STATE.skillMenuUnlocked = false;
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

    function updateViews() {
        inventory.update();
        Views.INVENTORY.updateTaskGroup();
        Views.SKILL_TREE.update();
        updateCompletionIndicator();
    }

    resetViews();
    const unlockedTaskGroups = determineUnlockedTaskGroups(completedTaskIDs);
    loadInventory(unlockedTaskGroups);
    loadSkillTree(unlockedTaskGroups);
    loadGameState();
    updateViews();
    DISPLAY_STATE.saveLoaded = true;
}