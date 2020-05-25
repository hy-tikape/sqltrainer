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
    document.getElementById(`alerts`).innerHTML = `<div class="alert alert-danger alert-dismissible" role="alert">Error: ${error}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    </div>`;
}

setupItemModal = (book) => {
    document.getElementById('display-item-header').innerHTML = i18n.get(book.discoverTitle);
    document.getElementById('display-item').innerHTML = book.renderShowItem();
    document.getElementById('display-item-text').innerText = i18n.get(book.discoverText);
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
        document.getElementById("task-name").innerText = i18n.get(task.item.name);
        document.getElementById("task-description").innerText = i18n.get(task.description);
        const taskTables = await readTask(`./tasks/${task.sql}`);
        document.getElementById("query-in-table").innerHTML = taskTables.map(table => table.renderAsTable(true).join(''));
        await hideElement("mission-select");
        await showElement("mission-screen");
    } catch (e) {
        showError(e);
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

showBooks = () => {
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

runQueryTests = async () => {
    let renderedResults = "";
    let allCorrect = true;
    for (let i = 0; i < getTestCount(); i++) {
        try {
            const result = await runQueryTest(i);
            if (!result.correct) allCorrect = false;
            renderedResults += renderResult(result);
        } catch (e) {
            console.error(e);
            allCorrect = false;
            renderedResults += `<div class="table-paper"><p class="col-red">${e}</p></div>`;
        }
    }
    document.getElementById("query-out-table").innerHTML = renderedResults;
    if (allCorrect) {
        // Animation
    } else {
        // No animation
    }
}

backToMissions = async () => {
    await hideElement("mission-screen");
    await showElement("mission-select");
}