const queryInputField = document.getElementById("query-input");

queryInputField.onclick = () => {
    if (queryInputField.innerText.includes("Kirjoita kysely...")) {
        queryInputField.innerText = "";
    }
}
queryInputField.onblur = () => {
    if (queryInputField.innerText.length === 0) {
        queryInputField.innerText = "Kirjoita kysely...";
    }
}