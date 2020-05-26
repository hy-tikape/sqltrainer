// One skill-point awarded when this xp is reached.
const progression = [
    {xp: 100},
    {xp: 250},
    {xp: 400},
    {xp: 600},
    {xp: 750},
    {xp: 1000},
]

const skillTree = [
    [
        {item: 'item-001', unlocked: true, cost: 0, name: 'i18n-book-001', requires: []}
    ], [
        {item: 'item-002', unlocked: false, cost: 1, name: 'i18n-book-002', requires: ['item-001']}
    ], [
        {item: 'item-003', unlocked: false, cost: 2, name: 'i18n-book-003', requires: ['item-002']},
        {item: 'item-004', unlocked: false, cost: 1, name: 'i18n-book-004', requires: ['item-002']}
    ], [
        {item: 'item-005', unlocked: false, cost: 2, name: 'i18n-book-005', requires: ['item-003']},
        {item: 'item-006', unlocked: false, cost: 1, name: 'i18n-book-006', requires: ['item-003']},
        {item: 'item-007', unlocked: false, cost: 2, name: 'i18n-book-007', requires: ['item-004']},
        {item: 'item-008', unlocked: false, cost: 2, name: 'i18n-book-008', requires: ['item-004']}
    ], [
        {item: 'item-009', unlocked: false, cost: 8, name: 'i18n-book-009', requires: ['item-006', 'item-007']}
    ], [
        {item: 'item-010', unlocked: false, cost: 3, name: 'i18n-book-010', requires: ['item-009']},
        {item: 'item-011', unlocked: false, cost: 2, name: 'i18n-book-011', requires: ['item-009']},
        {item: 'item-012', unlocked: false, cost: 3, name: 'i18n-book-012', requires: ['item-009']},
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

let xp = 0;
let level = 0;
let skillPoints = 0;

let currentGoalIndex = 0;

checkGoal = async () => {
    const goal = getCurrentGoal();
    const goalXp = goal.xp;
    if (xp >= goalXp) {
        await levelUp(goal);
        return checkGoal();
    }
}

function getCurrentGoal() {
    return progression[currentGoalIndex] ? progression[currentGoalIndex] : {xp: 0};
}

function updateAllLevelTexts(pointIncrease) {
    const text = pointIncrease > 1 ? i18n.getWith('i18n-skill-point-unlock-many', [pointIncrease])
        : i18n.get('i18n-skill-point-unlock');
    document.getElementById('level-up-skillpoints-add').innerHTML = `${text}`
    for (let el of document.getElementsByClassName('skill-point-count')) {
        el.innerText = skillPoints;
    }
    for (let el of document.getElementsByClassName('level-count')) {
        el.innerText = level;
    }
    for (let el of document.getElementsByClassName('xp-count')) {
        el.innerText = xp;
    }
    for (let el of document.getElementsByClassName('xp-required')) {
        el.innerText = getCurrentGoal().xp;
    }
    document.getElementById("from-level").innerText = i18n.getWith("i18n-level", [level])
    document.getElementById("to-level").innerText = i18n.getWith("i18n-level", [level + 1])
}

updateAllLevelTexts(0);

levelUp = goal => {
    const xpOfLevel = goal.xp;
    const pointIncrease = goal.skillPoints ? goal.skillPoints : 1;
    level++;
    skillPoints += pointIncrease;
    currentGoalIndex++;

    updateAllLevelTexts(pointIncrease);

    $('#level-up-modal').modal('show');

    const end = Date.now() + (1000);
    (function frame() {
        confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: {x: 0, y: 0.8}
        });
        confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: {x: 1, y: 0.8}
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());

    const xpBar = document.getElementById('xp-bar');
    xpBar.setAttribute('aria-valuemin', xpOfLevel);
    xpBar.setAttribute('aria-valuemax', getCurrentGoal().xp);
    xpBar.style.width = `0%`
}

animateXpIncrease = async (xpBar, toXp) => {
    const min = xpBar.getAttribute('aria-valuemin');
    const max = xpBar.getAttribute('aria-valuemax');
    let current = Number(xpBar.getAttribute('aria-valuenow'));
    const difference = toXp - current;
    const diffStep = 3;
    const leftOver = difference % diffStep;
    const delayMs = 750 / (difference / diffStep);
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

addXp = async amount => {
    document.getElementById('test-button').setAttribute('disabled', true)

    xp += amount;
    const xpBar = document.getElementById('xp-bar');
    const container = xpBar.parentElement.parentElement;
    container.classList.add('active');
    let goal = getCurrentGoal();
    while (xp > goal.xp) {
        await animateXpIncrease(xpBar, goal.xp);
        await checkGoal();
        goal = getCurrentGoal();
    }
    await animateXpIncrease(xpBar, xp);
    await checkGoal();
    // Animation goes here

    await delay(1000);
    container.classList.remove('active');
    document.getElementById('test-button').removeAttribute('disabled', false)
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
                html += `<div class="item unlocked">
                        ${item.renderJustItem()}
                         <p>${i18n.get(skill.name)}<br><span class="col-green">${i18n.get('i18n-unlocked')}</span></p>
                    </div>`
            } else if (skill.requires.filter(item => !unlocked.includes(item)).length > 0) {
                const requiredPoints = skill.cost > 1 ? i18n.getWith("i18n-skill-points-needed-many", [skill.cost])
                    : i18n.get("i18n-skill-points-needed");
                html += `<div class="item locked">
                        ${item.renderJustItem()}
                        <p>${i18n.get(skill.name)}<br><span class="col-yellow">${requiredPoints}</span></p>
                    </div>`
            } else {
                const requiredPoints = skill.cost > 1 ? i18n.getWith("i18n-skill-points-needed-many", [skill.cost])
                    : i18n.get("i18n-skill-points-needed");
                html += `<div class="item" onclick="skillPointUnlock('${skill.item}')">
                        ${item.renderJustItem()}
                        <p>${i18n.get(skill.name)}<br><span class="col-yellow">${requiredPoints}</span></p>
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
    if (skillPoints < skill.cost) {
        return shookElement('skill-points')
    }
    for (let required of skill.requires) {
        if (!lookupSkillWithItem(required).unlocked) {
            return shookElement(`skill-${itemID}`)
        }
    }
    skillPoints -= skill.cost;
    updateAllLevelTexts(0);
    skill.unlocked = true;
    updateSkillTree();
    await unlock(itemID);
}