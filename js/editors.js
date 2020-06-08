BOOK_EDITOR_STATE = {
    parsedBook: null
}
const bookEditorField = document.getElementById('book-editor-textfield');

function updateEditedBook() {
    DISPLAY_STATE.currentBook = new BookItem({
        id: BOOK_EDITOR_STATE.parsedBook.metadata.id,
        parsed: BOOK_EDITOR_STATE.parsedBook
    });
    DISPLAY_STATE.currentBook.newItem = false;
    DISPLAY_STATE.currentBook.onclick = "";
    showTheBook();

    document.getElementById('book-small-preview').innerHTML = DISPLAY_STATE.currentBook.render();
}

updateBasedOnBookEditor = async () => {
    BOOK_EDITOR_STATE.parsedBook = await parseBook(bookEditorField.value.split('\n'));
    updateEditedBook();
    document.getElementById('book-editor-error').innerText = "";
}

showBookEditor = async () => {
    await hideElement('inventory-view');
    const lines = await readLines("./Example.book");

    bookEditorField.value = lines.join('\n');
    bookEditorField.setAttribute("rows", Math.min(lines.length, 30));
    bookEditorField.onkeydown = event => {
        const value = event.target.value;
        const selectStart = event.target.selectionStart;
        const selectEnd = event.target.selectionEnd;
        const lineStart = value.substr(0, selectStart).lastIndexOf("\n") + 1;

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
    }

    BOOK_EDITOR_STATE.parsedBook = await parseBook(lines);

    DISPLAY_STATE.shownBookPage = 0;
    updateEditedBook();

    await showElement('book-editor-view');
}

saveBook = () => {
    const id = BOOK_EDITOR_STATE.parsedBook.metadata.id;
    save(`${id}.book`, bookEditorField.value);
}

/* https://stackoverflow.com/a/33542499 */
save = (filename, data) => {
    const blob = new Blob([data], {type: 'text/csv'});
    if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    } else {
        const elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
    }
}

loadSelectedBook = async () => {
    const selected = document.getElementById('book-editor-existing').value;
    const lines = await readLines(selected);
    bookEditorField.value = lines.join('\n');
    updateBasedOnBookEditor();
}

showTaskEditor = () => {

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
}
beginEditor();