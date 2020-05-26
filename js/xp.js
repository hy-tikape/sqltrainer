// One skill-point awarded when this xp is reached.
const progression = [
    {xp: 100},
    {xp: 250},
]

let xp = 0;
let level = 0;
let skillPoints = 0;

let currentGoalIndex = 0;

checkGoal = () => {
    const goal = progression[currentGoalIndex];
    const goalXp = goal.xp;
    if (xp >= goalXp) {
        levelUp(goal);
        return checkGoal();
    }
}

levelUp = goal => {
    const pointIncrease = goal.skillPoints ? goal.skillPoints : 1;
    level++;
    skillPoints += pointIncrease;
    currentGoalIndex++;

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
        el.innerText = progression[currentGoalIndex].xp;
    }

    $('#level-up-modal').modal('show');
    // Animation goes here
}

addXp = amount => {
    xp += amount;
    // Animation goes here
}