function load(completedTaskIDs) {
    // Reset everything
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

    // Load inventory & progress based on unlocked task groups
    const unlockedTaskGroups = [];
    for (let taskID of completedTaskIDs) {
        const group = taskGroups.lookupTaskGroupWithTaskId(taskID);
        group.newItem = false;
        getItem(group.book).newItem = false;
        const groupID = group.item.id;
        if (!unlockedTaskGroups.includes(groupID)) unlockedTaskGroups.push(groupID);

        const task = tasks[taskID];
        task.completed = true;
        if (group.isCompleted()) {
            group.completed = true;
        }
    }

    if (!unlockedTaskGroups.includes('task-group-A')) {
        inventory.addItems(['item-00', 'item-000'])
    }
    inventory.addItems(unlockedTaskGroups);
    if (unlockedTaskGroups.includes('task-group-X')) {
        inventory.removeItem('task-group-X');
        DISPLAY_STATE.endgame = true;
        const book = getItem('Book-X');
        book.shortName = "Palanut kirja";
        book.onclick = "";
        skillsByID['Book-X'].unlocked = false;
    }

    // Load skill tree based on unlocked task groups
    for (let bracket of skillTree) {
        for (let skill of bracket) {
            if (unlockedTaskGroups.includes(skill.tasks)) {
                skill.unlocked = true;
                skill.requiredBy.forEach(itemID => skillsByID[itemID].attemptUnlock());
            }
        }
    }
    skillTree[0][0].unlocked = true; // Unlocks first book.

    inventory.update();
    Views.INVENTORY.updateTaskGroup();
    Views.SKILL_TREE.update();
    updateCompletionIndicator();
    DISPLAY_STATE.saveLoaded = true;
}