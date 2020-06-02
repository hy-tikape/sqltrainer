// One skill-point awarded when this xp is reached.
const progression = [
    {xp: 100, skillPoints: 1},
    {xp: 250, skillPoints: 1},
    {xp: 400, skillPoints: 1},
    {xp: 600, skillPoints: 1},
    {xp: 750, skillPoints: 1},
    {xp: 1000, skillPoints: 2},
]

const skillTree = [
    [
        {item: 'item-001', unlocked: true, cost: 0, name: 'i18n-book-001', requires: [], tasks: 'task-group-001'}
    ], [
        {
            item: 'item-002',
            unlocked: false,
            cost: 1,
            name: 'i18n-book-002',
            requires: ['item-001'],
            tasks: 'task-group-002'
        }
    ], [
        {
            item: 'item-003',
            unlocked: false,
            cost: 1,
            name: 'i18n-book-003',
            requires: ['item-002'],
            tasks: 'task-group-003'
        },
        {
            item: 'item-004',
            unlocked: false,
            cost: 1,
            name: 'i18n-book-004',
            requires: ['item-002'],
            tasks: 'task-group-004'
        }
    ], [
        {
            item: 'item-005',
            unlocked: false,
            cost: 2,
            name: 'i18n-book-005',
            requires: ['item-003'],
            tasks: 'task-group-005'
        },
        {
            item: 'item-006',
            unlocked: false,
            cost: 2,
            name: 'i18n-book-006',
            requires: ['item-003'],
            tasks: 'task-group-006'
        },
        {
            item: 'item-007',
            unlocked: false,
            cost: 2,
            name: 'i18n-book-007',
            requires: ['item-004'],
            tasks: 'task-group-007'
        },
        {
            item: 'item-008',
            unlocked: false,
            cost: 2,
            name: 'i18n-book-008',
            requires: ['item-004'],
            tasks: 'task-group-008'
        }
    ], [
        {
            item: 'item-009',
            unlocked: false,
            cost: 8,
            name: 'i18n-book-009',
            requires: ['item-006', 'item-007'],
            tasks: 'task-group-009'
        }
    ], [
        {
            item: 'item-010',
            unlocked: false,
            cost: 3,
            name: 'i18n-book-010',
            requires: ['item-009'],
            tasks: 'task-group-010'
        },
        {
            item: 'item-011',
            unlocked: false,
            cost: 2,
            name: 'i18n-book-011',
            requires: ['item-009'],
            tasks: 'task-group-011'
        },
        {
            item: 'item-012',
            unlocked: false,
            cost: 3,
            name: 'i18n-book-012',
            requires: ['item-009'],
            tasks: 'task-group-012'
        },
    ]
]

lookupSkillWithItem = itemID => {
    for (let bracket of skillTree) {
        for (let skill of bracket) {
            if (skill.item === itemID) return skill;
        }
    }
    return null;
}

const userProgress = {
    xp: 0,
    level: 0,
    skillPoints: 0,
    currentGoalIndex: 0,
    gainLevel() {
        this.level++;
        this.currentGoalIndex++;
        for (let el of document.getElementsByClassName('level-count')) {
            el.innerText = this.level;
        }
        document.getElementById("from-level").innerText = i18n.getWith("i18n-level", [this.level])
        document.getElementById("to-level").innerText = i18n.getWith("i18n-level", [this.level + 1])
        for (let el of document.getElementsByClassName('xp-required')) {
            el.innerText = getCurrentGoal().xp - this.xp;
        }
    },
    gainSkillPoints(pointIncrease) {
        this.skillPoints += pointIncrease;
        const text = pointIncrease > 1 ? i18n.getWith('i18n-skill-point-unlock-many', [pointIncrease])
            : i18n.get('i18n-skill-point-unlock');
        document.getElementById('level-up-skillpoints-add').innerHTML = `${text}`
        for (let el of document.getElementsByClassName('skill-point-count')) {
            el.innerText = this.skillPoints;
        }
    },
    gainXp(xpGain) {
        this.xp += xpGain;
        for (let el of document.getElementsByClassName('xp-count')) {
            el.innerText = this.xp;
        }
    },
    useSkillPoints(pointsDecrease) {
        if (!pointsDecrease) return;
        this.skillPoints -= pointsDecrease;
        for (let el of document.getElementsByClassName('skill-point-count')) {
            el.innerText = this.skillPoints;
        }
    }
}
userProgress.gainSkillPoints(0);

checkGoal = async () => {
    const goal = getCurrentGoal();
    const goalXp = goal.xp;
    if (userProgress.xp >= goalXp) {
        await levelUp(goal);
        return checkGoal();
    }
}

function getCurrentGoal() {
    const userGoal = progression[userProgress.currentGoalIndex];
    return userGoal ? userGoal : {xp: Number.MAX_SAFE_INTEGER};
}

function resetXPBar(xpOfLevel) {
    const xpBar = document.getElementById('xp-bar');
    xpBar.setAttribute('aria-valuemin', xpOfLevel);
    xpBar.setAttribute('aria-valuemax', getCurrentGoal().xp);
    xpBar.style.width = `0%`
}

levelUp = async goal => {
    const xpOfLevel = goal.xp;
    const pointIncrease = goal.skillPoints ? goal.skillPoints : 1;
    userProgress.gainLevel();
    userProgress.gainSkillPoints(pointIncrease);

    shootConfetti(1000)
    resetXPBar(xpOfLevel);
    await changeSecondaryView(Views.LEVEL_UP);
}

animateXpIncrease = async (xpBar, toXp) => {
    const min = xpBar.getAttribute('aria-valuemin');
    const max = xpBar.getAttribute('aria-valuemax');
    let current = Number(xpBar.getAttribute('aria-valuenow'));
    const difference = toXp - current;
    let diffStep = Math.floor(difference / 33);
    if (diffStep < 1) diffStep = 1;
    const leftOver = difference % diffStep;
    const delayMs = 1500 / (difference / diffStep);
    xpBar.style.transition = `width ${delayMs}ms`
    while (true) {
        xpBar.style.width = `calc(${current - min}/${max - min} * 100%)`
        xpBar.innerText = `${current} / ${max}xp`
        xpBar.setAttribute('aria-valuenow', current);
        if (current >= toXp) break;
        await delay(delayMs);
        if (current + diffStep > toXp) {
            current += leftOver;
        } else {
            current += diffStep;
        }
    }
}

activateXpBar = xpBar => {
    const container = xpBar.parentElement.parentElement;
    container.classList.add('active');
}

deactivateXpBar = async (xpBar, delayMs) => {
    await delay(delayMs);
    const container = xpBar.parentElement.parentElement;
    container.classList.remove('active');
}

addXp = async amount => {
    if (userProgress.xp === 0) unlockXpBar();
    const xpBar = document.getElementById('xp-bar');
    activateXpBar(xpBar);
    userProgress.gainXp(amount);
    let goal = getCurrentGoal();
    while (userProgress.xp > goal.xp) {
        await animateXpIncrease(xpBar, goal.xp);
        await checkGoal();
        goal = getCurrentGoal();
    }
    await animateXpIncrease(xpBar, userProgress.xp);
    deactivateXpBar(xpBar, 1000);
    await checkGoal();
}

function renderSkillTree() {
    let html = '';
    const unlocked = [];
    for (let bracket of skillTree) {
        html += '<div class="col">'
        for (let skill of bracket) {
            const item = getItem(skill.item);
            if (skill.unlocked) {
                unlocked.push(skill.item);
                html += `<div id="skill-${skill.item}" class="item unlocked" onclick="showBook('${skill.item}')">
                        ${item.renderJustItem()}
                         <p><i class="fa fa-fw fa-bookmark col-book-${item.color}"></i> ${i18n.get(skill.name)}<br><button class="btn btn-success btn-sm">${i18n.get('i18n-read')}</button></p>
                    </div>`
            } else if (skill.requires.filter(item => !unlocked.includes(item)).length > 0) {
                const requiredPoints = skill.cost !== 1 ? i18n.getWith("i18n-skill-points-needed-many", [skill.cost])
                    : i18n.get("i18n-skill-points-needed");
                html += `<div id="skill-${skill.item}" class="item locked">
                        ${item.renderJustItem()}
                        <p><i class="fa fa-fw fa-lock col-grey"></i> ${i18n.get(skill.name)}<br><span class="col-yellow">${requiredPoints}</span></p>
                    </div>`
            } else {
                const requiredPoints = skill.cost > 1 ? i18n.getWith("i18n-skill-points-needed-many", [skill.cost])
                    : i18n.get("i18n-skill-points-needed");
                html += `<div id="skill-${skill.item}" class="item" onclick="skillPointUnlock('${skill.item}')">
                        ${item.renderJustItem()}
                        <p><i class="fa fa-fw fa-bookmark col-book-${item.color}"></i> ${i18n.get(skill.name)}<br><span class="col-yellow">${requiredPoints}</span></p>
                    </div>`
            }
        }
        html += '</div>'
    }
    return html;
}

updateSkillTree = () => {
    document.getElementById('skill-tree').innerHTML = renderSkillTree();
}
updateSkillTree();

skillPointUnlock = async itemID => {
    const skill = lookupSkillWithItem(itemID);
    if (userProgress.skillPoints < skill.cost) {
        return shookElement('skill-points')
    }
    for (let required of skill.requires) {
        if (!lookupSkillWithItem(required).unlocked) {
            return shookElement(`skill-${required}`)
        }
    }
    userProgress.useSkillPoints(skill.cost);
    skill.unlocked = true;
    updateSkillTree();
    await delay(500);
    await showBook(skill.item);
    getItem(skill.tasks).newItem = false;
    await inventory.addItem(skill.tasks);
    eventQueue.push(Views.NONE, () => {
        getItem(skill.tasks).newItem = true;
        inventory.update();
    });
}

unlockSkillMenu = async () => {
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

unlockXpBar = async () => {
    await showElement('xp-bar-container');
}