const inStore = sessionStorage.getItem('currentLang');
let currentLang = inStore ? inStore : "fi";
let i18n = {
    get: function (key) {
        if (!key) return key;
        const value = this[key.startsWith("i18n-") ? key.substr(5) : key];
        if (value instanceof Function) return value();
        return value ? value.split('\n').join('<br>') : key;
    },
    getWith: function (key, replacements) {
        let returnValue = this.get(key);
        for (let replacement of replacements) {
            if (replacement || replacement === 0) {
                returnValue = returnValue.replace('{}', ('' + replacement).includes("i18n-") ? this.get(replacement) : replacement);
            }
        }
        return returnValue;
    }
}


function replaceI18nContent() {
    for (let entry of Object.entries(i18n)) {
        const newContent = entry[1];
        if (!(newContent instanceof Function)) {
            for (let element of document.getElementsByClassName("i18n-" + entry[0])) {
                if (element instanceof HTMLInputElement) {
                    element.placeholder = newContent.split('\n').join("<br>");
                } else {
                    element.innerHTML = newContent.split('\n').join("<br>");
                }
            }
        }
    }
}

async function loadLanguage(langCode) {
    const lines = await readLines(`i18n/${langCode}.js`);
    try {
        eval(lines.join(''));
        currentLang = langCode;
        sessionStorage.setItem('currentLang', langCode);
        await loadItems();
    } catch (e) {
        console.error(`Failed to parse lang ${langCode}`, e, lines.join(''));
    }
}

const selector = document.getElementById('language-selector');
if (selector) selector.oninput = async event => {
    const langCode = event.target.value.split(" / ")[1].toLowerCase();
    await loadLanguage(langCode);
}