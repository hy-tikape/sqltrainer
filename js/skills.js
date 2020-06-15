const skillTree = []

function lookupSkillWithItem(itemID) {
    for (let bracket of skillTree) {
        for (let skill of bracket) {
            if (skill.item === itemID) return skill;
        }
    }
    return null;
}

function locate(lookingForItem) {
    for (let x = 0; x < skillTree.length; x++) {
        const bracket = skillTree[x];
        const bracketSize = bracket.length;
        for (let y = 0; y < bracketSize; y++) {
            const skill = bracket[y];
            if (skill.item === lookingForItem) {
                switch (bracketSize) {
                    case 1:
                        return {x, y: 4};
                    case 2:
                        return {x, y: 3 + y * 2};
                    case 3:
                        return {x, y: 2 + y * 2};
                    case 4:
                        return {x, y: 1 + y * 2};
                    default:
                        break;
                }
            }
        }
    }
    return {x: 0, y: 0};
}

function updateSkillMenuUnlockIndicator() {
    if (skillPointStore.skillPoints > 0) {
        showElement('book-available-indicator');
        showElement('book-available-text');
    } else {
        hideElement('book-available-indicator');
        hideElement('book-available-text');
    }
}

const skillPointStore = {
    skillPoints: 0,
    gainSkillPoints(pointIncrease) {
        this.skillPoints += pointIncrease;
        const text = pointIncrease > 1 ? i18n.getWith('i18n-skill-point-unlock-many', [pointIncrease])
            : i18n.get('i18n-skill-point-unlock');
        document.getElementById('level-up-skillpoints-add').innerHTML = `${text}`
        for (let el of document.getElementsByClassName('i18n-skill-point-count')) {
            el.innerText = this.skillPoints === 0 ? i18n.get("i18n-skill-point-count-zero") :
                this.skillPoints === 1 ? i18n.get("i18n-skill-point-count-one") :
                    i18n.getWith("i18n-skill-point-count", [this.skillPoints]);
        }
        updateSkillMenuUnlockIndicator();
        updateSkillTree();
    },
    useSkillPoints(pointsDecrease) {
        if (!pointsDecrease) return;
        this.skillPoints -= pointsDecrease;
        for (let el of document.getElementsByClassName('i18n-skill-point-count')) {
            el.innerText = this.skillPoints === 0 ? i18n.get("i18n-skill-point-count-zero") :
                this.skillPoints === 1 ? i18n.get("i18n-skill-point-count-one") :
                    i18n.getWith("i18n-skill-point-count", [this.skillPoints]);
        }
        updateSkillMenuUnlockIndicator();
        updateSkillTree();
    }
}
skillPointStore.gainSkillPoints(0);

async function checkGoal() {
    const taskGroup = DISPLAY_STATE.currentTaskGroup;
    if (taskGroup && taskGroup.getCompletedTaskCount() >= taskGroup.getTaskCount() && !taskGroup.completed) {
        await levelUp();
        taskGroup.completed = true;
    }
}

async function levelUp() {
    const pointIncrease = 1;
    skillPointStore.gainSkillPoints(pointIncrease);

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
                         <p><i class="fa fa-fw fa-bookmark col-book-${item.color}"></i> ${item.shortName}</p>
                    </div>`
            } else if (skill.requires.filter(item => !unlocked.includes(item)).length > 0) {
                // Locked skill with locked requirements
                html += `<div id="skill-${skill.item}" class="item locked" onclick="event.stopPropagation()">
                        ${item.renderJustItem()}
                        <p><i class="fa fa-fw fa-lock col-grey"></i> ${item.shortName}</p>
                    </div>`
            } else {
                // Locked skill with unlocked requirements
                html += `<div id="skill-${skill.item}" class="item" onclick="skillPointUnlock(event, '${skill.item}')">
                        ${skillPointStore.skillPoints >= skill.cost ? `<button class="btn btn-success btn-sm">${i18n.get("i18n-unlock")}</button>` : ''}
                        ${item.renderJustItem()}
                        <p><i class="fa fa-fw fa-bookmark col-book-${item.color}"></i> ${item.shortName}</p>
                    </div>`
            }

            const location = locate(skill.item);
            const requireLocations = skill.requires.map(item => locate(item));

            const h = 400; // Height (Calculated 120px -> 400px)

            for (let rLocation of requireLocations) {
                const difference = Math.abs(location.y - rLocation.y);
                const layerDiff = Math.abs(location.x - rLocation.x);
                const w = skillTreeWidth / bracketCount * layerDiff; // Width
                const arcCurveStart = 70 / 210 * w;
                const arcCurveStop = 95 / 210 * w;

                const above = location.y > rLocation.y;
                // path M (move) start_x start_y Q (beizer cubed curve) x1 y1 x2 y2 T end_x end_y
                if (difference < 0.001) {
                    // Forward
                    html += `<svg height="${h}" width="${w}">
                        <path d="M 0 ${h / 2} L ${w} ${h / 2}" stroke="grey" stroke-width="7" fill="none" />
                    </svg>`
                } else if (above && difference <= 1) {
                    // Down 1
                    const arcStart = 112 / 400 * h;
                    const arcStop = 160 / 400 * h;
                    html += `<svg height="${h}" width="${w}">
                        <path d="M 0 ${arcStart} Q ${arcCurveStart} ${arcStart} ${arcCurveStop} ${arcStop} T ${w} ${h / 2}" stroke="grey" stroke-width="7" fill="none" />
                     </svg>`;
                } else if (difference <= 1) {
                    // Up  1
                    const arcStart = 288 / 400 * h;
                    const arcStop = 240 / 400 * h;
                    html += `<svg height="${h}" width="${w}">
                        <path d="M 0 ${arcStart} Q ${arcCurveStart} ${arcStart} ${arcCurveStop} ${arcStop} T ${w} ${h / 2}" stroke="grey" stroke-width="7" fill="none" />
                     </svg>`;
                } else if (above && difference <= 2) {
                    // Down 2
                    const arcStart = 24 / 400 * h;
                    const arcStop = 115 / 400 * h;
                    html += `<svg height="${h}" width="${w}">
                        <path d="M 0 ${arcStart} Q ${arcCurveStart} ${arcStart} ${arcCurveStop} ${arcStop} T ${w} ${h / 2}" stroke="grey" stroke-width="7" fill="none" />
                     </svg>`;
                } else if (difference <= 2) {
                    // Up  2
                    const arcStart = 374 / 400 * h;
                    const arcStop = 285 / 400 * h;
                    html += `<svg height="${h}" width="${w}">
                        <path d="M 0 ${arcStart} Q ${arcCurveStart} ${arcStart} ${arcCurveStop} ${arcStop} T ${w} ${h / 2}" stroke="grey" stroke-width="7" fill="none" />
                     </svg>`;
                } else if (above && difference <= 3) {
                    // Up  3
                    const bh = 1.5 * h; // Bigger height to fit the arc
                    const arcStart = 55 / 600 * bh;
                    const arcStop = 190 / 600 * bh;
                    html += `<svg height="${bh}" width="${w}">
                        <path d="M 0 ${arcStart} Q ${arcCurveStart + 10} ${arcStart} ${arcCurveStop - 10} ${arcStop} T ${w} ${bh / 2 + 20}" stroke="grey" stroke-width="7" fill="none" />
                     </svg>`;
                } else if (difference <= 3) {
                    // Down 3
                    const bh = 1.5 * h; // Bigger height to fit the arc
                    const arcStart = 583 / 600 * bh;
                    const arcStop = 450 / 600 * bh;
                    html += `<svg height="${bh}" width="${w}">
                        <path d="M 0 ${arcStart} Q ${arcCurveStart + 10} ${arcStart} ${arcCurveStop - 10} ${arcStop} T ${w} ${bh / 2 + 20}" stroke="grey" stroke-width="7" fill="none" />
                     </svg>`;
                } else if (above && difference <= 4) {
                    // Up  4
                    const bh = 2 * h; // Bigger height to fit the arc
                    const arcStart = 67 / 600 * bh;
                    const arcStop = 190 / 600 * bh;
                    html += `<svg height="${bh}" width="${w}">
                        <path d="M 0 ${arcStart} Q ${arcCurveStart + 10} ${arcStart} ${arcCurveStop - 10} ${arcStop} T ${w} ${bh / 2 + 20}" stroke="grey" stroke-width="7" fill="none" />
                     </svg>`;
                } else if (difference <= 4) {
                    // Down 4
                    const bh = 2 * h; // Bigger height to fit the arc
                    const arcStart = 593 / 600 * bh;
                    const arcStop = 450 / 600 * bh;
                    html += `<svg height="${bh}" width="${w}">
                        <path d="M 0 ${arcStart} Q ${arcCurveStart + 10} ${arcStart} ${arcCurveStop - 10} ${arcStop} T ${w} ${bh / 2 + 20}" stroke="grey" stroke-width="7" fill="none" />
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

async function skillPointUnlock(event, itemID) {
    event.stopPropagation();
    const skill = lookupSkillWithItem(itemID);
    if (skillPointStore.skillPoints < skill.cost) {
        return shookElement('skill-points')
    }
    for (let required of skill.requires) {
        if (!lookupSkillWithItem(required).unlocked) {
            return shookElement(`skill-${required}`)
        }
    }
    skillPointStore.useSkillPoints(skill.cost);
    skill.unlocked = true;
    updateSkillTree();
    await delay(300);
    await showBook(event, skill.item);
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