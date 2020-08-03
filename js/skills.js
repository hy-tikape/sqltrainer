const skillTree = [];
const skillsByID = {
    asList() {
        return Object.values(this).filter(obj => obj instanceof Skill);
    }
};

/**
 * Skills are used for progression in the game.
 */
class Skill extends ItemType {
    /**
     * Construct a new Skill.
     *
     * item         See ItemType class, used for rendering the skill in skill-tree view
     * unlocked     boolean, has the player unlocked this skill
     * requires     Item IDs for required Skills.
     * requiredBy   Item IDs for Skills that require this skill
     * taskGroupID  TaskGroup ID for tasks that are linked to this skill
     * bracket      The x-coordinate in skill-tree view for this skill, or index for the array in skillTree
     * index        The index in the array in skillTree
     *
     * @param options {item, unlocked, requires, requiredBy, taskGroupID, bracket, index}
     */
    constructor(options) {
        super({
            bracket: -1,
            index: -1,
            ...options
        });
    }

    static getYForBracket(bracketSize, index) {
        switch (bracketSize) {
            case 1:
                return 4;
            case 2:
                return 3 + index * 2;
            case 3:
                return 2 + index * 2;
            case 4:
                return 1 + index * 2;
            default:
                return 0;
        }
    }

    getX() {
        return this.bracket;
    }

    getY() {
        const bracketSize = skillTree[this.bracket].length;
        return Skill.getYForBracket(bracketSize, this.index);
    }

    isCompleted() {
        return this.getRelatedTaskGroup().isCompleted() && this.unlocked
    }

    getRelatedTaskGroup() {
        return getItem(this.taskGroupID);
    }

    async attemptUnlock() {
        for (let required of this.requires) {
            const requiredSkill = skillsByID[required];
            const requiredTaskGroup = requiredSkill.getRelatedTaskGroup();
            if (!requiredSkill.unlocked || !requiredTaskGroup.isCompleted()) {
                return;
            }
        }
        this.unlocked = true;
        const relatedTaskGroup = this.getRelatedTaskGroup();
        relatedTaskGroup.unlocked = true;
        relatedTaskGroup.newItem = true;
        await inventory.update();
    }
}

async function checkGoal(taskGroup) {
    if (taskGroup && taskGroup.isCompleted() && !taskGroup.completed) {
        eventQueue.push(Views.INVENTORY, async () => {
            unlockBasedOn(taskGroup);
        });
        taskGroup.completed = true;
    }
}

async function unlockBasedOn(taskGroup) {

    const levelUpNotice = document.getElementById('progress-all-done');
    levelUpNotice.classList.remove('hidden');
    await delay(20);
    levelUpNotice.classList.add('active');
    unlockSkillMenu();
    await delay(750);
    for (let itemID of skillsByID[taskGroup.book].requiredBy) {
        skillsByID[itemID].attemptUnlock();
    }
    await delay(7500);
    levelUpNotice.classList.remove('active');
    await delay(300);
    levelUpNotice.classList.add('hidden');
}

async function unlockSkillMenu() {
    if (DISPLAY_STATE.skillMenuUnlocked) return;
    DISPLAY_STATE.skillMenuUnlocked = true;
    const boxIcon = document.getElementById("skill-box-icon");
    const boxText = document.getElementById("skill-box-text");
    document.getElementById("skill-box").classList.remove("hidden");
    await delay(500);
    boxIcon.style.fontSize = "5rem";
    boxText.style.fontSize = "2rem";
    await delay(1000);
    await shakeElement("skill-box")
    boxIcon.style.fontSize = "";
    boxText.style.fontSize = "";
}