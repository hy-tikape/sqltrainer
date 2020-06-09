EDITOR_STATE = {
    parsedBook: null,
    parsedTask: null,
}

/**
 * Handles some indentation related key events:
 *
 * - Tab, indents by 4 spaces
 * - Shift+Tab, reduces indent by 4 spaces
 * - Enter, keeps same indent as previous line
 * - Backspace, removes indent of empty line
 *
 * @param event
 * @returns {boolean}
 */
editorOnKeydown = event => {
    const value = event.target.value;
    const selectStart = event.target.selectionStart;
    const selectEnd = event.target.selectionEnd;
    const lineStart = value.substr(0, selectStart).lastIndexOf("\n") + 1;
    const lineEnd = lineStart + value.substring(lineStart).indexOf("\n");

    const startOfLine = value.substr(lineStart, 4);

    if (event.key === 'Tab') {
        event.preventDefault();
        if (event.shiftKey) {
            if (startOfLine === '    ') {
                const beforeLine = value.substr(0, lineStart);
                const newLines = value.substring(lineStart + 4, selectEnd).split("\n    ");
                const lineWithSpaceRemoved = newLines.join("\n");
                const afterSelection = value.substring(selectEnd);
                event.target.value = beforeLine + lineWithSpaceRemoved + afterSelection;
                event.target.selectionStart = selectStart - 4;
                event.target.selectionEnd = selectEnd - 4 * newLines.length;
            }
        } else {
            const beforeLine = value.substr(0, lineStart);
            const newLines = value.substring(lineStart, selectEnd).split("\n");
            const line = newLines.join("\n    ");
            const afterSelection = value.substring(selectEnd);
            event.target.value = beforeLine + '    ' + line + afterSelection;
            event.target.selectionStart = selectStart + 4;
            event.target.selectionEnd = selectEnd + 4 * newLines.length;
            return false;
        }
    }

    const line = value.substring(lineStart, lineEnd);
    let indent = 0;
    while (value.substring(lineStart + indent, lineEnd).startsWith(" ")) indent++;
    if (event.key === 'Enter') {
        event.preventDefault();

        if (line.endsWith("{")) indent += 4;
        const beforeSelection = value.substr(0, selectStart);
        const afterSelection = value.substring(selectEnd);
        event.target.value = beforeSelection + "\n" + (" ".repeat(indent)) + afterSelection;
        event.target.selectionStart = event.target.selectionEnd = selectStart + indent + 1;
    }
    if (event.key === 'Backspace') {
        if (line.trim() === '') {
            const beforeLine = value.substr(0, lineStart);
            const newLines = value.substring(lineStart + indent, selectEnd).split("\n    ");
            const lineWithSpaceRemoved = newLines.join("\n");
            const afterSelection = value.substring(selectEnd);
            event.target.value = beforeLine + lineWithSpaceRemoved + afterSelection;
            event.target.selectionStart = selectStart - indent;
            event.target.selectionEnd = selectEnd - indent * newLines.length;
        }
    }
}

const bookEditorField = document.getElementById('book-editor-textfield');
const taskEditorField = document.getElementById('task-editor-textfield');
bookEditorField.onkeydown = editorOnKeydown
taskEditorField.onkeydown = editorOnKeydown

updateEditedBook = () => {
    DISPLAY_STATE.currentBook = new BookItem({
        id: EDITOR_STATE.parsedBook.metadata.id,
        parsed: EDITOR_STATE.parsedBook
    });
    DISPLAY_STATE.currentBook.newItem = false;
    DISPLAY_STATE.currentBook.onclick = "";
    showTheBook();

    document.getElementById('book-small-preview').innerHTML = DISPLAY_STATE.currentBook.render();
};

updateBasedOnBookEditor = async () => {
    EDITOR_STATE.parsedBook = await parseBook(bookEditorField.value.split('\n'));
    updateEditedBook();
    document.getElementById('book-editor-error').innerText = "";
}

showBookEditor = async () => {
    await hideElement('inventory-view');
    const lines = await readLines("./Example.book");

    bookEditorField.value = lines.join('\n');
    bookEditorField.setAttribute("rows", Math.min(lines.length, 30));

    EDITOR_STATE.parsedBook = await parseBook(lines);

    DISPLAY_STATE.shownBookPage = 0;
    updateEditedBook();

    await showElement('book-editor-view');
}

saveBook = () => {
    const id = EDITOR_STATE.parsedBook.metadata.id;
    save(`${id}.book`, bookEditorField.value);
}

uploadBook = async () => {
    bookEditorField.value = await upload();
    DISPLAY_STATE.shownBookPage = 0;
    await updateBasedOnBookEditor();
}

loadSelectedBook = async () => {
    const selected = document.getElementById('book-editor-existing').value;
    const lines = await readLines(selected);
    bookEditorField.value = lines.join('\n');
    DISPLAY_STATE.shownBookPage = 0;
    await updateBasedOnBookEditor();
}

updateBasedOnTaskEditor = async () => {
    EDITOR_STATE.parsedTask = await parseTask(taskEditorField.value.split('\n'));
    await updateEditedTask();
    document.getElementById('task-editor-error').innerText = "";
}

updateEditedTask = async () => {
    DISPLAY_STATE.currentTask = new Task({
        id: EDITOR_STATE.parsedTask.metadata.id,
        parsed: EDITOR_STATE.parsedTask
    });
    DISPLAY_STATE.currentTask.completed = false;
    DISPLAY_STATE.currentTask.newItem = false;
    DISPLAY_STATE.currentTask.item.onclick = "";
    await showTheTask(document.getElementById('query-input').value);
    await runQueryTests();
};

document.getElementById('query-input').oninput = runQueryTests;

showTaskEditor = async () => {
    await hideElement('inventory-view');
    const lines = await readLines("./Example.task");

    taskEditorField.value = lines.join('\n');
    taskEditorField.setAttribute("rows", Math.min(lines.length, 30));

    EDITOR_STATE.parsedTask = await parseTask(lines);

    await updateEditedTask();

    await showElement('task-editor-view');
}

saveTask = () => {
    const id = EDITOR_STATE.parsedTask.metadata.id;
    save(`${id}.task`, taskEditorField.value);
}

uploadTask = async () => {
    taskEditorField.value = await upload();
    await updateBasedOnTaskEditor();
}

loadSelectedTask = async () => {
    const selected = document.getElementById('task-editor-existing').value;
    const lines = await readLines(selected);
    taskEditorField.value = lines.join('\n');
    await updateBasedOnTaskEditor();
}

beginEditor = async () => {
    await loadItems();

    let bookOptions = `<option>Example.book</option>`;
    for (let item of Object.values(items)) {
        if (item instanceof BookItem) {
            bookOptions += `<option>./books/fi/${item.id}.book</option>`
        }
    }
    document.getElementById('book-editor-existing').innerHTML = bookOptions;

    await loadTasks();
    let taskOptions = `<option>Example.task</option>`;
    for (let taskID of Object.keys(tasks)) {
        taskOptions += `<option>./tasks/fi/${taskID}.task</option>`
    }
    document.getElementById('task-editor-existing').innerHTML = taskOptions;
}
beginEditor();