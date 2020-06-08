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
        if (event.key === 'Tab') {
            event.preventDefault();
            const v = bookEditorField.value, s = bookEditorField.selectionStart, e = bookEditorField.selectionEnd;
            if (event.shiftKey) {
                if (v.substring(s - 4, s) === '    ') {
                    bookEditorField.value = v.substring(0, s - 4) + v.substring(e);
                    bookEditorField.selectionStart = bookEditorField.selectionEnd = s - 4;
                }
            } else {
                bookEditorField.value = v.substring(0, s) + '    ' + v.substring(e);
                bookEditorField.selectionStart = bookEditorField.selectionEnd = s + 4;
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

showTaskEditor = () => {

}