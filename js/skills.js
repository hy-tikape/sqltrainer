const skillTree = [
    [
        {item: 'item-A', unlocked: true, cost: 0, name: 'i18n-book-A', requires: [], tasks: 'task-group-A'}
    ], [
        {
            item: 'item-B',
            unlocked: false,
            cost: 1,
            name: 'i18n-book-B',
            requires: ['item-A'],
            tasks: 'task-group-B'
        }
    ], [
        {
            item: 'item-C',
            unlocked: false,
            cost: 1,
            name: 'i18n-book-C',
            requires: ['item-B'],
            tasks: 'task-group-C'
        },
        {
            item: 'item-D',
            unlocked: false,
            cost: 1,
            name: 'i18n-book-D',
            requires: ['item-B'],
            tasks: 'task-group-D'
        }
    ], [
        {
            item: 'item-E',
            unlocked: false,
            cost: 2,
            name: 'i18n-book-E',
            requires: ['item-C'],
            tasks: 'task-group-E'
        },
        {
            item: 'item-F',
            unlocked: false,
            cost: 2,
            name: 'i18n-book-F',
            requires: ['item-C'],
            tasks: 'task-group-F'
        },
        {
            item: 'item-G',
            unlocked: false,
            cost: 2,
            name: 'i18n-book-G',
            requires: ['item-D'],
            tasks: 'task-group-G'
        },
        {
            item: 'item-H',
            unlocked: false,
            cost: 2,
            name: 'i18n-book-H',
            requires: ['item-D'],
            tasks: 'task-group-H'
        }
    ], [
        {
            item: 'item-I',
            unlocked: false,
            cost: 8,
            name: 'i18n-book-I',
            requires: ['item-F', 'item-G'],
            tasks: 'task-group-I'
        }
    ], [
        {
            item: 'item-J',
            unlocked: false,
            cost: 3,
            name: 'i18n-book-J',
            requires: ['item-I'],
            tasks: 'task-group-J'
        },
        {
            item: 'item-K',
            unlocked: false,
            cost: 2,
            name: 'i18n-book-K',
            requires: ['item-I'],
            tasks: 'task-group-K'
        },
        {
            item: 'item-L',
            unlocked: false,
            cost: 3,
            name: 'i18n-book-L',
            requires: ['item-I'],
            tasks: 'task-group-L'
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

const skillPointStore = {
    skillPoints: 0,
    gainSkillPoints(pointIncrease) {
        this.skillPoints += pointIncrease;
        const text = pointIncrease > 1 ? i18n.getWith('i18n-skill-point-unlock-many', [pointIncrease])
            : i18n.get('i18n-skill-point-unlock');
        document.getElementById('level-up-skillpoints-add').innerHTML = `${text}`
        for (let el of document.getElementsByClassName('skill-point-count')) {
            el.innerText = this.skillPoints;
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
skillPointStore.gainSkillPoints(0);

checkGoal = async () => {
    const taskGroup = DISPLAY_STATE.currentTaskGroup;
    if (taskGroup && taskGroup.getCompletedTaskCount() >= taskGroup.getTaskCount() && !taskGroup.completed) {
        await levelUp(taskGroup);
        taskGroup.completed = true;
    }
}

levelUp = async taskGroup => {
    const pointIncrease = taskGroup.rewardSPOnCompletion ? taskGroup.rewardSPOnCompletion : 1;
    skillPointStore.gainSkillPoints(pointIncrease);

    shootConfetti(1000)
    await changeSecondaryView(Views.LEVEL_UP);
}

animateTaskCounterIncrease = async (taskCounter, toPoints) => {
    const max = taskCounter.getAttribute('aria-valuemax');
    let current = Number(taskCounter.getAttribute('aria-valuenow'));
    const difference = toPoints - current;
    let diffStep = Math.floor(difference / 33);
    if (diffStep < 1) diffStep = 1;
    const leftOver = difference % diffStep;
    const delayMs = 1000 / (difference / diffStep);
    taskCounter.style.transition = `width ${delayMs}ms`
    while (true) {
        taskCounter.style.width = `calc(${current}/${max} * 100%)`
        taskCounter.innerHTML = `<span>${current} / ${max}</span>`
        taskCounter.setAttribute('aria-valuenow', current);
        if (current >= toPoints) break;
        if (current + diffStep > toPoints) {
            current += leftOver;
        } else {
            current += diffStep;
        }
    }
}

activateTaskCounter = async taskCounter => {
    const container = taskCounter.parentElement.parentElement;
    container.classList.add('active');
    await delay(300);
}

deactivateTaskCounter = async (taskCounter, delayMs) => {
    await delay(delayMs);
    const container = taskCounter.parentElement.parentElement;
    container.classList.remove('active');
}

addToTaskCounter = async () => {
    const taskCounter = document.getElementById('task-counter');
    await activateTaskCounter(taskCounter);
    const currentTaskGroup = DISPLAY_STATE.currentTaskGroup;
    await animateTaskCounterIncrease(taskCounter, currentTaskGroup.getCompletedTaskCount());
    deactivateTaskCounter(taskCounter, 2000);
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
    await delay(500);
    await showBook(skill.item);
    await inventory.addItem(skill.tasks);
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

updateTaskCounter = async () => {
    await showElement('task-counter-container');
    const taskCounter = document.getElementById('task-counter');
    const completed = DISPLAY_STATE.currentTaskGroup ? DISPLAY_STATE.currentTaskGroup.getCompletedTaskCount() : 0;
    taskCounter.setAttribute('aria-valuenow', completed);
    taskCounter.setAttribute("aria-valuemin", "0");
    const outOf = DISPLAY_STATE.currentTaskGroup ? DISPLAY_STATE.currentTaskGroup.getTaskCount() : 1;
    taskCounter.setAttribute("aria-valuemax", outOf);
    taskCounter.style.width = `calc(${completed}/${outOf}*100%)`
    taskCounter.innerHTML = `<span>${completed} / ${outOf}</span>`
}