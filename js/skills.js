const skillTree = [];
const skillsByID = {};

class Skill extends ItemType {
    /**
     * @param options {item, unlocked, cost, requires, requiredBy, tasks, bracket, index}
     */
    constructor(options) {
        super({
            bracket: -1,
            index: -1,
            ...options
        })
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
        return getItem(this.tasks).isCompleted() && this.unlocked
    }
}

async function checkGoal() {
    const taskGroup = DISPLAY_STATE.currentTaskGroup;
    if (taskGroup && taskGroup.isCompleted() && !taskGroup.completed) {
        await levelUp();
        taskGroup.completed = true;
    }
}

async function levelUp() {
    // TODO handle case where user exits menus very fast and currentTaskGroup is null
    for (let itemID of skillsByID[DISPLAY_STATE.currentTaskGroup.book].requiredBy) {
        skillPointUnlock(itemID);
    }

    const levelUpNotice = document.getElementById('progress-all-done');
    levelUpNotice.classList.remove('hidden');
    await delay(20);
    levelUpNotice.classList.add('active');
    unlockSkillMenu();
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
    for (let bracket of skillTree) {
        html += '<div class="col">'
        for (let skill of bracket) {
            const item = getItem(skill.item);
            if (skill.unlocked) {
                // Unlocked skill
                unlocked.push(skill.item);
                html += `<div id="skill-${skill.item}" class="item unlocked" onclick="showBook(event, '${skill.item}')">
                        <button class="btn btn-success btn-sm">${i18n.get("i18n-read")}</button>
                        ${item.renderJustItem()}
                         <p><i class="fa fa-fw fa-bookmark col-book-${item.color}"></i> ${DISPLAY_STATE.showBookIDs ? item.id : item.shortName}</p>
                    </div>`
            } else if (skill.requires.filter(item => !unlocked.includes(item)).length > 0) {
                // Locked skill with locked requirements
                html += `<div id="skill-${skill.item}" class="item locked" onclick="event.stopPropagation()">
                        ${item.renderJustItem()}
                        <p><i class="fa fa-fw fa-lock col-grey"></i> ${DISPLAY_STATE.showBookIDs ? item.id : item.shortName}</p>
                    </div>`
            } else {
                // Locked skill with unlocked requirements
                html += `<div id="skill-${skill.item}" class="item" onclick="event.stopPropagation()">
                        ${item.renderJustItem()}
                        <p><i class="fa fa-fw fa-bookmark col-book-${item.color}"></i> ${DISPLAY_STATE.showBookIDs ? item.id : item.shortName}</p>
                    </div>`
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
                // path M (move) start_x start_y Q (beizer cubed curve) x1 y1 x2 y2 T end_x end_y
                if (difference < 0.001) {
                    // Forward
                    html += `<svg height="${h}" width="${w}">
                        <path d="M 0 ${h / 2} L ${w} ${h / 2}" stroke="${color}" stroke-width="7" fill="none" />
                    </svg>`
                } else if (above && difference <= 1) {
                    // Down 1
                    const arcStart = 112 / 400 * h;
                    const arcStop = 160 / 400 * h;
                    html += `<svg height="${h}" width="${w}">
                        <path d="M 0 ${arcStart} Q ${arcCurveStart} ${arcStart} ${arcCurveStop} ${arcStop} T ${w} ${h / 2}" stroke="${color}" stroke-width="7" fill="none" />
                     </svg>`;
                } else if (difference <= 1) {
                    // Up  1
                    const arcStart = 288 / 400 * h;
                    const arcStop = 240 / 400 * h;
                    html += `<svg height="${h}" width="${w}">
                        <path d="M 0 ${arcStart} Q ${arcCurveStart} ${arcStart} ${arcCurveStop} ${arcStop} T ${w} ${h / 2}" stroke="${color}" stroke-width="7" fill="none" />
                     </svg>`;
                } else if (above && difference <= 2) {
                    // Down 2
                    const arcStart = 24 / 400 * h;
                    const arcStop = 115 / 400 * h;
                    html += `<svg height="${h}" width="${w}">
                        <path d="M 0 ${arcStart} Q ${arcCurveStart} ${arcStart} ${arcCurveStop} ${arcStop} T ${w} ${h / 2}" stroke="${color}" stroke-width="7" fill="none" />
                     </svg>`;
                } else if (difference <= 2) {
                    // Up  2
                    const arcStart = 374 / 400 * h;
                    const arcStop = 285 / 400 * h;
                    html += `<svg height="${h}" width="${w}">
                        <path d="M 0 ${arcStart} Q ${arcCurveStart} ${arcStart} ${arcCurveStop} ${arcStop} T ${w} ${h / 2}" stroke="${color}" stroke-width="7" fill="none" />
                     </svg>`;
                } else if (above && difference <= 3) {
                    // Up  3
                    const bh = 1.5 * h; // Bigger height to fit the arc
                    const arcStart = 55 / 600 * bh;
                    const arcStop = 190 / 600 * bh;
                    html += `<svg height="${bh}" width="${w}">
                        <path d="M 0 ${arcStart} Q ${arcCurveStart + 10} ${arcStart} ${arcCurveStop - 10} ${arcStop} T ${w} ${bh / 2 + 20}" stroke="${color}" stroke-width="7" fill="none" />
                     </svg>`;
                } else if (difference <= 3) {
                    // Down 3
                    const bh = 1.5 * h; // Bigger height to fit the arc
                    const arcStart = 583 / 600 * bh;
                    const arcStop = 450 / 600 * bh;
                    html += `<svg height="${bh}" width="${w}">
                        <path d="M 0 ${arcStart} Q ${arcCurveStart + 10} ${arcStart} ${arcCurveStop - 10} ${arcStop} T ${w} ${bh / 2 + 20}" stroke="${color}" stroke-width="7" fill="none" />
                     </svg>`;
                } else if (above && difference <= 4) {
                    // Up  4
                    const bh = 2 * h; // Bigger height to fit the arc
                    const arcStart = 67 / 600 * bh;
                    const arcStop = 190 / 600 * bh;
                    html += `<svg height="${bh}" width="${w}">
                        <path d="M 0 ${arcStart} Q ${arcCurveStart + 10} ${arcStart} ${arcCurveStop - 10} ${arcStop} T ${w} ${bh / 2 + 20}" stroke="${color}" stroke-width="7" fill="none" />
                     </svg>`;
                } else if (difference <= 4) {
                    // Down 4
                    const bh = 2 * h; // Bigger height to fit the arc
                    const arcStart = 593 / 600 * bh;
                    const arcStop = 450 / 600 * bh;
                    html += `<svg height="${bh}" width="${w}">
                        <path d="M 0 ${arcStart} Q ${arcCurveStart + 10} ${arcStart} ${arcCurveStop - 10} ${arcStop} T ${w} ${bh / 2 + 20}" stroke="${color}" stroke-width="7" fill="none" />
                     </svg>`;
                }
            }
        }
        html += '</div>'
    }
    return html;
}

function updateSkillTree() {
    document.getElementById('skill-tree').innerHTML = renderSkillTree();
}

async function skillPointUnlock(itemID) {
    const skill = skillsByID[itemID];
    for (let required of skill.requires) {
        const requiredSkill = skillsByID[required];
        const requiredTaskGroup = getItem(requiredSkill.tasks);
        if (!requiredSkill.unlocked || !requiredTaskGroup.isCompleted()) {
            return;
        }
    }
    skill.unlocked = true;
    updateSkillTree();
    await inventory.addItem(skill.tasks);
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