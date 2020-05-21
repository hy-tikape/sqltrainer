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

setupItemModal = (book) => {
    document.getElementById('display-item-header').innerHTML = i18n.get(book.discoverTitle);
    document.getElementById('display-item').innerHTML = book.renderShowItem();
    document.getElementById('display-item-text').innerText = i18n.get(book.discoverText);
}

showItem = itemID => {
    const item = items[itemID];
    setupItemModal(item);
    return new Promise((resolve, reject) => {
        $('#bookModal').modal()
            .on('hidden.bs.modal', () => {
                try {
                    item.onShow();
                    for (let unlock of item.unlocks) {
                        inventory.push(unlock);
                    }
                    $('#bookModal').off('hidden.bs.modal');
                } catch (error) {
                    console.error(error);
                }
                resolve()
            });
    });
}

showTask = async taskID => {
    const task = tasks[taskID];
    document.getElementById("task-name").innerText = i18n.get(task.item.name);
    document.getElementById("task-description").innerText = i18n.get(task.description);
    document.getElementById("query-in-table").innerHTML = await readTask(`./tasks/${task.sql}`);
    await hideElement("mission-select");
    await showElement("mission-screen");
}

backToMissions = async () => {
    await hideElement("mission-screen");
    await showElement("mission-select");
}