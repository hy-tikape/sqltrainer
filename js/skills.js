const skillTree = [
    [
        {item: 'Book-A', unlocked: true, cost: 0, requires: [], tasks: 'task-group-A'}
    ], [
        {
            item: 'Book-B',
            unlocked: false,
            cost: 1,
            requires: ['Book-A'],
            tasks: 'task-group-B'
        }
    ], [
        {
            item: 'Book-C',
            unlocked: false,
            cost: 1,
            requires: ['Book-B'],
            tasks: 'task-group-C'
        },
        {
            item: 'Book-D',
            unlocked: false,
            cost: 1,
            requires: ['Book-B'],
            tasks: 'task-group-D'
        }
    ], [
        {
            item: 'Book-E',
            unlocked: false,
            cost: 1,
            requires: ['Book-C'],
            tasks: 'task-group-E'
        },
        {
            item: 'Book-F',
            unlocked: false,
            cost: 1,
            requires: ['Book-C'],
            tasks: 'task-group-F'
        },
        {
            item: 'Book-G',
            unlocked: false,
            cost: 1,
            requires: ['Book-D'],
            tasks: 'task-group-G'
        },
        {
            item: 'Book-H',
            unlocked: false,
            cost: 1,
            requires: ['Book-D'],
            tasks: 'task-group-H'
        }
    ], [
        {
            item: 'Book-I',
            unlocked: false,
            cost: 1,
            requires: ['Book-F', 'Book-G'],
            tasks: 'task-group-I'
        }
    ], [
        {
            item: 'Book-J',
            unlocked: false,
            cost: 1,
            requires: ['Book-I'],
            tasks: 'task-group-J'
        },
        {
            item: 'Book-K',
            unlocked: false,
            cost: 1,
            requires: ['Book-I'],
            tasks: 'task-group-K'
        },
        {
            item: 'Book-L',
            unlocked: false,
            cost: 1,
            requires: ['Book-I'],
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
        for (let el of document.getElementsByClassName('i18n-skill-point-count')) {
            el.innerText = this.skillPoints === 0 ? i18n.get("i18n-skill-point-count-zero") :
                this.skillPoints === 1 ? i18n.get("i18n-skill-point-count-one") :
                    i18n.getWith("i18n-skill-point-count", [this.skillPoints]);
        }
    },
    useSkillPoints(pointsDecrease) {
        if (!pointsDecrease) return;
        this.skillPoints -= pointsDecrease;
        for (let el of document.getElementsByClassName('i18n-skill-point-count')) {
            el.innerText = this.skillPoints === 0 ? i18n.get("i18n-skill-point-count-zero") :
                this.skillPoints === 1 ? i18n.get("i18n-skill-point-count-one") :
                    i18n.getWith("i18n-skill-point-count", [this.skillPoints]);
        }
    }
}
skillPointStore.gainSkillPoints(0);

checkGoal = async () => {
    const taskGroup = DISPLAY_STATE.currentTaskGroup;
    if (taskGroup && taskGroup.getCompletedTaskCount() >= taskGroup.getTaskCount() && !taskGroup.completed) {
        await levelUp();
        taskGroup.completed = true;
    }
}

levelUp = async () => {
    const pointIncrease = 1;
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
                         <p><i class="fa fa-fw fa-bookmark col-book-${item.color}"></i> ${item.shortName}<br><button class="btn btn-success btn-sm">${i18n.get('i18n-read')}</button></p>
                    </div>`
            } else if (skill.requires.filter(item => !unlocked.includes(item)).length > 0) {
                html += `<div id="skill-${skill.item}" class="item locked">
                        ${item.renderJustItem()}
                        <p><i class="fa fa-fw fa-lock col-grey"></i> ${item.shortName}</p>
                    </div>`
            } else {
                html += `<div id="skill-${skill.item}" class="item" onclick="skillPointUnlock('${skill.item}')">
                        ${item.renderJustItem()}
                        <p><i class="fa fa-fw fa-bookmark col-book-${item.color}"></i> ${item.shortName}</p>
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