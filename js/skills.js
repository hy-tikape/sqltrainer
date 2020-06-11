const skillTree = []

function lookupSkillWithItem(itemID) {
    for (let bracket of skillTree) {
        for (let skill of bracket) {
            if (skill.item === itemID) return skill;
        }
    }
    return null;
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
    for (let bracket of skillTree) {
        html += '<div class="col">'
        for (let skill of bracket) {
            const item = getItem(skill.item);
            if (skill.unlocked) {
                // Unlocked skill
                unlocked.push(skill.item);
                html += `<div id="skill-${skill.item}" class="item unlocked" onclick="showBook('${skill.item}')">
                        ${item.renderJustItem()}
                         <p><i class="fa fa-fw fa-bookmark col-book-${item.color}"></i> ${item.shortName}
                         <br><button class="btn btn-success btn-sm">${i18n.get('i18n-read')}</button></p>
                    </div>`
            } else if (skill.requires.filter(item => !unlocked.includes(item)).length > 0) {
                // Locked skill with locked requirements
                html += `<div id="skill-${skill.item}" class="item locked">
                        ${item.renderJustItem()}
                        <p><i class="fa fa-fw fa-lock col-grey"></i> ${item.shortName}</p>
                    </div>`
            } else {
                // Locked skill with unlocked requirements
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

function updateSkillTree() {
    document.getElementById('skill-tree').innerHTML = renderSkillTree();
}

async function skillPointUnlock(itemID) {
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
    await delay(50);
    await showBook(skill.item);
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