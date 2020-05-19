const queryInputField = document.getElementById("query-input");

queryInputField.onfocus = () => {
    if (queryInputField.value.includes("Kirjoita kysely...")) {
        queryInputField.value = "";
    }
}
queryInputField.onblur = () => {
    if (queryInputField.value.length === 0) {
        queryInputField.value = "Kirjoita kysely...";
    }
}

startGame = async () => {
    await hideElement("mission-info");
    showElement("mission-select");
}

const itemSources = {
    police: {
        icon: 'fa fa-balance',
        text: 'i18n-source-police'
    },
    folder: {
        icon: 'fa fa-folder',
        text: 'i18n-source-folder'
    }
}

const smallItems = {
    clue: {
        render: function (clue) {
        }
    },
    table: {
        render: function (table) {
        }
    },
    icon: {
        render: function (icon) {
        }
    }
}

const clues = {
    "001": {
        text: "SELECT column FROM table;",
        hint: "i18n-clue-001-hint"
    }
}
const discoveredClues = [];

const tasks = {
    "001": {
        name: 'Vieraslista',
        from: itemSources.police,
        sql: 'task001.txt',
        description: 'i18n-task-001'
    }
}

clueAnimation = clueID => {
    const clueBox = document.getElementById("clue-box");
    if (!discoveredClues.length) {
        clueBox.classList.remove("hidden");
    }
    let elementId = "clue-" + clueID;
    let element = document.getElementById(elementId);
    element.style.zIndex = '500'
    element.style.position = 'absolute';
    element.style.transition = "transform 0.5s";
    element.style.transform = "scale(0, 0)";
    delay(500).then(() => {
        clueBox.style.fontSize = "3rem";
        return delay(1000).then(() => {
            removeElement(elementId)
            discoveredClues.push(clueID);
            return shakeElement("clue-box")
                .then(() => {
                    clueBox.style.fontSize = "";
                });
        })
    })
}

setupClueModal = (clue) => {
    document.getElementById('clue-text').innerText = clue.text;
    document.getElementById('clue-hint').innerText = i18n[clue.hint.substr(5)];
}

clue = clueID => {
    const clue = clues[clueID];
    setupClueModal(clue);
    $('#clueModal').modal()
        .on('hidden.bs.modal', () => {
            clueAnimation(clueID);
        });
}

task = async taskID => {
    await hideElement("mission-select");
    showElement("mission-screen");
}

backToMissions = async () => {
    await hideElement("mission-screen");
    showElement("mission-select");
}