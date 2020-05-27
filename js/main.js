const queryInputField = document.getElementById("query-input");

queryInputField.onfocus = () => {
    if (queryInputField.value.includes(i18n.get("i18n-query-placeholder"))) {
        queryInputField.value = "";
    }
}
queryInputField.onblur = () => {
    if (queryInputField.value.length === 0) {
        queryInputField.value = i18n.get("i18n-query-placeholder");
    }
}

showError = error => {
    console.error(error)
    document.getElementById(`alerts`).innerHTML = `<div class="alert alert-danger alert-dismissible" role="alert">Error: ${error}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    </div>`;
}

setupItemModal = (item) => {
    document.getElementById('display-item-header').innerHTML = i18n.get(item.discoverTitle);
    document.getElementById('display-item').innerHTML = item.renderShowItem();
    document.getElementById('display-item-text').innerText = i18n.get(item.discoverText);
}

showItem = itemID => {
    const item = items[itemID];
    setupItemModal(item);
    return new Promise((resolve, reject) => {
        $('#display-item-modal').modal()
            .on('hidden.bs.modal', () => {
                try {
                    item.onShow();
                    for (let unlock of item.unlocks) {
                        addItem(unlock);
                    }
                    $('#display-item-modal').off('hidden.bs.modal');
                } catch (error) {
                    console.error(error);
                }
                resolve()
            });
    });
}

showTask = async taskID => {
    try {
        const task = tasks[taskID];
        currentTask = task;
        document.getElementById("task-name").innerText = i18n.get(task.item.name);
        document.getElementById("task-description").innerText = i18n.get(task.description);
        const taskTables = await readTask(`./tasks/${task.sql}`);
        document.getElementById("query-in-table").innerHTML = taskTables.map(table => `<div class="table-paper">${table.renderAsTable(true)}</div>`).join('');
        document.getElementById("query-out-table").innerHTML = ""
        queryInputField.value = i18n.get("i18n-query-placeholder");
        await hideElement("mission-select");
        await showElement("mission-screen");
    } catch (e) {
        showError(e);
    }
}

renderTasks = taskGroup => {
    let html = '';
    for (let task of taskGroup.tasks) {
        html += tasks[task].render();
    }
    return html;
}

function updateTaskGroupTasks() {
    document.getElementById('viewed-tasks').innerHTML = renderTasks(currentTaskGroup);
}

showTaskGroup = async groupID => {
    const taskGroup = taskGroups[groupID];
    if (taskGroup !== currentTaskGroup) {
        document.getElementById(taskGroup.item.id).classList.add('highlighted');
        if (currentTaskGroup) document.getElementById(currentTaskGroup.item.id).classList.remove('highlighted');
        currentTaskGroup = taskGroup;
        updateTaskGroupTasks();
    } else {
        document.getElementById(currentTaskGroup.item.id).classList.remove('highlighted');
        currentTaskGroup = null;
        document.getElementById('viewed-tasks').innerHTML = "";
    }
}

function setupBookModal(item) {
    if (item) {
        document.getElementById("display-book-title").innerHTML = i18n.get(item.name);
        document.getElementById("display-book").innerHTML = item.renderBook();
    } else {
        document.getElementById("display-book-title").innerHTML = i18n.get("i18n-found-books-text");
        updateBookInventory()
    }
}

showBook = async itemID => {
    const item = items[itemID];
    setupBookModal(item);
    return new Promise((resolve, reject) => {
        $('#display-book-modal').modal()
            .on('hidden.bs.modal', () => {
                $('#display-book-modal').off('hidden.bs.modal');
                resolve()
            });
    });
}

openBooks = () => {
    setupBookModal()
    $('#display-book-modal').modal()
        .on('hidden.bs.modal', () => {
            $('#display-book-modal').off('hidden.bs.modal');
        });
}

renderResult = result => {
    return `<div class="row justify-content-md-center">
            <div class="table-paper">${result.table.renderAsTable()}
            ${result.correct ? '<p class="col-green">Oikein</p>' : '<p class="col-red">Väärin</p>'}
            </div>
            <div class="paper-green table-paper">${result.wanted.renderAsTable()}</div></div></div>`
}


backToMissions = async () => {
    currentTask = null;
    await hideElement("mission-screen");
    await showElement("mission-select");
}

closeSkillTree = async () => {
    await hideElement('skill-tree-view')
}

openSkillTree = async () => {
    await showElement('skill-tree-view')
}

toggleSkillTree = async () => {
    if (document.getElementById('skill-tree-view').classList.contains('hidden')) {
        await openSkillTree();
    } else {
        await closeSkillTree();
    }
}