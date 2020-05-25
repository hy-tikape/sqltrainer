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
    level++;
    skillPoints += goal.skillPoints ? goal.skillPoints : 1;
    currentGoalIndex++;
    // Animation goes here
}

addXp = amount => {
    xp += amount;
    // Animation goes here
}