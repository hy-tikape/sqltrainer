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
        Views.SKILL_TREE.update();
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

function renderSkillTree() {
    let html = '';
    const unlocked = [];
    const bracketCount = skillTree.length;
    const windowWidth = window.innerWidth;
    const skillTreeWidth = windowWidth <= 768 ? window.innerHeight * 0.95 :
        windowWidth <= 1200 ? windowWidth - 2 * 10 :
            windowWidth / 3 * 2

    function renderUnlockedSkill(skill, item) {
        return `<div id="skill-${skill.item}" class="item unlocked" onclick="Views.READ_BOOK.show(event, '${skill.item}')" tabindex="0">
                        <button class="btn btn-success btn-sm">${i18n.get("i18n-read")}</button>
                        ${item.renderShowItem()}
                         <p><i class="fa fa-fw fa-bookmark col-book-${item.color}"></i> ${DISPLAY_STATE.showBookIDs ? item.id : item.shortName}</p>
                    </div>`;
    }

    function renderLockedSkillWithUnlockedRequirements(skill, item) {
        return `<div id="skill-${skill.item}" class="item" onclick="event.stopPropagation()" tabindex="0">
                        ${item.renderShowItem()}
                        <p><i class="fa fa-fw fa-bookmark col-book-${item.color}"></i> ${DISPLAY_STATE.showBookIDs ? item.id : item.shortName}</p>
                    </div>`;
    }

    function renderLockedSkill(skill, item) {
        return `<div id="skill-${skill.item}" class="item locked" onclick="event.stopPropagation()" tabindex="0">
                        ${item.renderShowItem()}
                        <p><i class="fa fa-fw fa-lock col-grey"></i> ${DISPLAY_STATE.showBookIDs ? item.id : item.shortName}</p>
                    </div>`;
    }

    function renderTreeCurve(difference, h, w, color, above, arcCurveStart, arcCurveStop) {
        // path M (move) start_x start_y Q (beizer cubed curve) x1 y1 x2 y2 T end_x end_y
        if (difference < 0.001) {
            // Forward
            return `<svg height="${h}" width="${w}">
                        <path d="M 0 ${h / 2} L ${w} ${h / 2}" stroke="${color}" stroke-width="7" fill="none" />
                    </svg>`
        } else if (above && difference <= 1) {
            // Down 1
            const arcStart = 112 / 400 * h;
            const arcStop = 160 / 400 * h;
            return `<svg height="${h}" width="${w}">
                        <path d="M 0 ${arcStart} Q ${arcCurveStart} ${arcStart} ${arcCurveStop} ${arcStop} T ${w} ${h / 2}" stroke="${color}" stroke-width="7" fill="none" />
                     </svg>`;
        } else if (difference <= 1) {
            // Up  1
            const arcStart = 288 / 400 * h;
            const arcStop = 240 / 400 * h;
            return `<svg height="${h}" width="${w}">
                        <path d="M 0 ${arcStart} Q ${arcCurveStart} ${arcStart} ${arcCurveStop} ${arcStop} T ${w} ${h / 2}" stroke="${color}" stroke-width="7" fill="none" />
                     </svg>`;
        } else if (above && difference <= 2) {
            // Down 2
            const arcStart = 24 / 400 * h;
            const arcStop = 115 / 400 * h;
            return `<svg height="${h}" width="${w}">
                        <path d="M 0 ${arcStart} Q ${arcCurveStart} ${arcStart} ${arcCurveStop} ${arcStop} T ${w} ${h / 2}" stroke="${color}" stroke-width="7" fill="none" />
                     </svg>`;
        } else if (difference <= 2) {
            // Up  2
            const arcStart = 374 / 400 * h;
            const arcStop = 285 / 400 * h;
            return `<svg height="${h}" width="${w}">
                        <path d="M 0 ${arcStart} Q ${arcCurveStart} ${arcStart} ${arcCurveStop} ${arcStop} T ${w} ${h / 2}" stroke="${color}" stroke-width="7" fill="none" />
                     </svg>`;
        } else if (above && difference <= 3) {
            // Up  3
            const bh = 1.5 * h; // Bigger height to fit the arc
            const arcStart = 55 / 600 * bh;
            const arcStop = 190 / 600 * bh;
            return `<svg height="${bh}" width="${w}">
                        <path d="M 0 ${arcStart} Q ${arcCurveStart + 10} ${arcStart} ${arcCurveStop - 10} ${arcStop} T ${w} ${bh / 2 + 20}" stroke="${color}" stroke-width="7" fill="none" />
                     </svg>`;
        } else if (difference <= 3) {
            // Down 3
            const bh = 1.5 * h; // Bigger height to fit the arc
            const arcStart = 583 / 600 * bh;
            const arcStop = 450 / 600 * bh;
            return `<svg height="${bh}" width="${w}">
                        <path d="M 0 ${arcStart} Q ${arcCurveStart + 10} ${arcStart} ${arcCurveStop - 10} ${arcStop} T ${w} ${bh / 2 + 20}" stroke="${color}" stroke-width="7" fill="none" />
                     </svg>`;
        } else if (above && difference <= 4) {
            // Up  4
            const bh = 2 * h; // Bigger height to fit the arc
            const arcStart = 67 / 600 * bh;
            const arcStop = 190 / 600 * bh;
            return `<svg height="${bh}" width="${w}">
                        <path d="M 0 ${arcStart} Q ${arcCurveStart + 10} ${arcStart} ${arcCurveStop - 10} ${arcStop} T ${w} ${bh / 2 + 20}" stroke="${color}" stroke-width="7" fill="none" />
                     </svg>`;
        } else if (difference <= 4) {
            // Down 4
            const bh = 2 * h; // Bigger height to fit the arc
            const arcStart = 593 / 600 * bh;
            const arcStop = 450 / 600 * bh;
            return `<svg height="${bh}" width="${w}">
                        <path d="M 0 ${arcStart} Q ${arcCurveStart + 10} ${arcStart} ${arcCurveStop - 10} ${arcStop} T ${w} ${bh / 2 + 20}" stroke="${color}" stroke-width="7" fill="none" />
                     </svg>`;
        }
    }

    for (let bracket of skillTree) {
        html += '<div class="col">'
        for (let skill of bracket) {
            const item = getItem(skill.item);
            if (skill.unlocked) {
                unlocked.push(skill.item);
                html += renderUnlockedSkill(skill, item)
            } else if (skill.requires.filter(item => !unlocked.includes(item)).length > 0) {
                html += renderLockedSkill(skill, item)
            } else {
                html += renderLockedSkillWithUnlockedRequirements(skill, item)
            }

            const requiredSkills = skill.requires.map(itemID => skillsByID[itemID]);
            const h = 400; // Height (Calculated 120px -> 400px)

            for (let requiredSkill of requiredSkills) {
                const difference = Math.abs(skill.getY() - requiredSkill.getY());
                const layerDiff = Math.abs(skill.getX() - requiredSkill.getX());
                const w = skillTreeWidth / bracketCount * layerDiff; // Width
                const arcCurveStart = 70 / 210 * w;
                const arcCurveStop = 95 / 210 * w;
                const color = requiredSkill.isCompleted() ? "#84BCDA" : "grey";

                const above = skill.getY() > requiredSkill.getY();
                html += renderTreeCurve(difference, h, w, color, above, arcCurveStart, arcCurveStop);
            }
        }
        html += '</div>'
    }
    return html;
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