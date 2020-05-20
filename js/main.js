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

const inventory = ['clue-001', 'task-001', 'clue-002', 'task-002', 'clue-003', 'clue-004', 'task-003', 'task-004', 'task-005'];
const clueInventory = [];

startGame = async () => {
    await hideElement("mission-info");
    showInventory();
}

getItem = id => {
    console.log(id)
    if (id.includes("clue-")) {
        return clues[id.substr(5)];
    } else if (id.includes("task-")) {
        return tasks[id.substr(5)];
    }
}

function renderInventory() {
    let render = '';
    for (let id of inventory) {
        let item = getItem(id);
        render += item.item.type.render(item);
    }
    return render;
}

function renderInventoryIconLables() {
    let render = '';
    const sources = {};
    for (let id of inventory) {
        let from = getItem(id).item.from;
        if (from) sources[from.icon] = i18n.get(from.text);
    }
    for (let key of Object.keys(sources)) {
        render += `<p class="col-white"><i class="${key}"></i> ${sources[key]}</p>`
    }
    return render;
}

showInventory = () => {
    showElement("mission-select");
    document.getElementById('inventory').innerHTML = renderInventory();
    document.getElementById('inventory-labels').innerHTML = renderInventoryIconLables();
}

const itemSources = {
    police: {
        icon: 'fa fa-balance-scale',
        text: 'i18n-source-police'
    },
    folder: {
        icon: 'fa fa-folder',
        text: 'i18n-source-folder'
    },
    guests: {
        icon: 'fa fa-address-book',
        text: 'i18n-source-guests'
    }
}

const smallItems = {
    clue: {
        render: function (clue) {
            const from = clue.item.from ? `<i class="fa-fw ${clue.item.from.icon}" title="${i18n.get(clue.item.from.text)}"></i> ` : "";
            return `<div class="item" id="${clue.item.id}" onclick="${clue.item.onclick}">
                <div class="content clue">
                    <p><br><br></p>
                </div>
                <p>${from}${i18n.get(clue.item.name)}</p>
            </div>`;
        }
    },
    table: {
        render: function (table) {
            const from = table.item.from ? `<i class="fa-fw fa-2x ${table.item.from.icon}" title="${i18n.get(table.item.from.text)}"></i> ` : "<i></i>";
            return `<div class="item" id="${table.item.id}" onclick="${table.item.onclick}">
                <div class="content table-paper">
                    ${from}<br><br><br><br><br>
                </div>
                <p>${i18n.get(table.item.name)}</p>
            </div>`;
        }
    },
    icon: {
        render: function (icon) {
            const from = icon.item.from ? `<i class="fa-fw ${icon.item.from.icon}" title="${i18n.get(icon.item.from.text)}"></i> ` : "";
            console.log(from)
            return `<div class="item" id="${icon.item.id}" onclick="${icon.item.onclick}">
                <i class="${icon.item.icon} fa-6x"></i>
                <p>${from}${i18n.get(icon.item.name)}</p>
            </div>`
        }
    }
}

function overwriteProperties(from, to) {
    for (let key of Object.keys(from)) {
        if (to[key] instanceof Array) {
            to[key].push(...from[key]);
        } else if (to[key] instanceof Object) {
            to[key] = {...to[key], ...from[key]};
        } else {
            to[key] = from[key];
        }
    }
}

createClue = (id, clue) => {
    const base = {
        item: {
            id: `clue-${id}`,
            name: `i18n-clue-${id}-name`,
            onclick: `clue('${id}')`
        },
        header: "i18n-clue-discover",
        text: `i18n-clue-${id}-text`,
        hint: `i18n-clue-${id}-hint`,
        unlocks: []
    };
    overwriteProperties(clue, base);
    return base
}

createTask = (id, task) => {
    const base = {
        item: {
            id: `task-${id}`,
            name: `i18n-task-${id}-name`,
            onclick: `task('${id}')`
        },
        sql: `task${id}.txt`,
        description: `i18n-task-${id}-description`,
        unlocks: []
    };
    overwriteProperties(task, base);
    return base
}

const clues = {
    "001": createClue('001', {
        item: {type: smallItems.clue, from: itemSources.police},
        header: "i18n-clue-discover-info"
    }),
    "002": createClue('002', {
        item: {
            type: smallItems.icon,
            icon: 'fa fa-shoe-prints',
            from: itemSources.police,
        },
        unlocks: ['task-002']
    }),
    "003": createClue('003', {
        item: {
            type: smallItems.icon,
            icon: 'col-white fa fa-microphone-alt',
            from: itemSources.police,
        },
        unlocks: ['clue-004', 'task-003', 'task-004', 'task-005']
    }),
    "004": createClue('004', {
        item: {
            type: smallItems.clue,
            from: itemSources.police,
        },
        header: "i18n-clue-discover-info"
    })
}

const tasks = {
    "001": createTask('001', {
        item: {
            type: smallItems.icon,
            icon: 'col-white fa fa-address-book',
            from: itemSources.police,
        },
        unlocks: ['clue-002']
    }),
    "002": createTask('002', {
        item: {
            type: smallItems.table,
            from: itemSources.police,
        },
        unlocks: ['clue-003']
    }),
    "003": createTask('003', {
        item: {
            type: smallItems.table,
            from: itemSources.police,
        }
    }),
    "004": createTask('004', {
        item: {
            type: smallItems.table,
            from: itemSources.police,
        }
    }),
    "005": createTask('005', {
        item: {
            type: smallItems.table,
            from: itemSources.police,
        }
    })
}

function renderFoundClues() {
    let render = '';
    for (let clueID of clueInventory) {
        const clue = clues[clueID];
        render += `<div class="clue"><p>${i18n.get(clue.text).split('\n').join("<br>")}</p></div>`
    }
    return render;
}

discoverClue = clueID => {
    clueInventory.push(clueID);
    document.getElementById('clue-list').innerHTML = renderFoundClues();
}

clueAnimation = clueID => {
    const clueBox = document.getElementById("clue-box");
    if (!clueInventory.length) clueBox.classList.remove("hidden");
    let elementId = "clue-" + clueID;
    removeElement(elementId);
    discoverClue(clueID);
    return delay(500).then(() => {
        clueBox.style.fontSize = "2rem";
        return delay(1000).then(() => {
            return shakeElement("clue-box")
                .then(() => {
                    clueBox.style.fontSize = "";
                });
        })
    })
}

setupClueModal = (clue) => {
    document.getElementById('clue-header').innerHTML = i18n.get(clue.header);
    document.getElementById('clue-text').innerHTML = i18n.get(clue.text).split('\n').join('<br>');
    document.getElementById('clue-hint').innerText = i18n.get(clue.hint);
}

clue = clueID => {
    const clue = clues[clueID];
    setupClueModal(clue);
    $('#clueModal').modal()
        .on('hidden.bs.modal', () => {
            clueAnimation(clueID);
            for (let unlock of clue.unlocks) {
                inventory.push(unlock);
            }
            $('#clueModal').off('hidden.bs.modal')
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