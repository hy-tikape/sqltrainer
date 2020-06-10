function load(storageObject) {
    if (!storageObject) return;
    // Reset everything
    inventory.removeAll();
    for (let bracket of skillTree) {
        for (let skill of bracket) {
            skill.unlocked = false;
        }
    }
    for (let task of Object.values(tasks)) {
        task.completed = false;
    }
    DISPLAY_STATE.currentTaskGroup = null;
    DISPLAY_STATE.skillMenuUnlocked = true;
    document.getElementById('skill-box').classList.remove('hidden');
    skillPointStore.skillPoints = 0;

    const completedTasks = storageObject.completedTasks;

    // Load inventory & progress based on unlocked task groups
    const unlockedTaskGroups = [];
    for (let taskID of completedTasks) {
        const group = taskGroups.lookupTaskGroupWithTaskId(taskID);
        const groupID = group.item.id;
        if (!unlockedTaskGroups.includes(groupID)) unlockedTaskGroups.push(groupID);

        const task = tasks[taskID];
        task.completed = true;
        if (group.getTaskCount() <= group.getCompletedTaskCount()) {
            group.completed = true;
            skillPointStore.gainSkillPoints(1)
        }
    }

    if (!unlockedTaskGroups.includes('task-group-A')) {
        inventory.addItems(['item-00', 'item-000'])
    }
    inventory.addItems(unlockedTaskGroups);

    // Load skill tree based on unlocked task groups
    for (let bracket of skillTree) {
        for (let skill of bracket) {
            if (unlockedTaskGroups.includes(skill.tasks)) {
                skill.unlocked = true;
                skillPointStore.useSkillPoints(skill.cost);
            }
        }
    }
    skillTree[0][0].unlocked = true; // Unlocks first book.

    inventory.update();
    updateTaskGroupTasks();
    updateSkillTree();
}

function save() {
    const completedTasks = [];
    for (let task of Object.values(tasks)) {
        if (task.completed) completedTasks.push(task.id);
    }

    return {
        completedTasks
    };
}

const s0 = save();
let s1;

function saveS1() {
    s1 = save();
}

function loadS1() {
    load(s1);
}