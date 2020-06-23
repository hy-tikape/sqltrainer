const i18n = {
    "username": "Mooc Käyttäjätunnus",
    "password": "Salasana",
    "welcome": "Tervetuloa SQL-loitsujen maagiseen maailmaan.",
    "login": "Kirjaudu sisään",
    "logout": "Kirjaudu ulos",
    "incorrect-password": "Väärä käyttäjänimi tai salasana.",
    "forgot-password": "Unohtuiko salasana?",
    "register": "Rekisteröidy",
    "play-with-no-login": "Pelaa kirjautumatta",
    "empty-table": "Taulu on tyhjä",
    "ok": "Selvä!",
    "close": "Sulje",
    "back": "Takaisin",
    "table-result": "Tulos",
    "wanted-result": "Haluttu Tulos",
    "books-text": "Kirjat",
    "tasks-text": "Tehtävät",
    "map-text": "Kartta",
    "found-books-text": "Kirjat",
    "level-unlocked": 'Suoritit kaikki tehtäväsarjan tehtävät!',
    "skill-tree": 'Käytä kirjan luomisloitsuja',
    "skill-point-count-zero": 'Suorita tehtäviä avataksesi uusia kirjoja',
    "skill-point-count-one": 'Sinulla on 1 kirjan avausloitsu',
    "skill-point-count": 'Sinulla on {} kirjan avausloitsua',
    "skill-point-unlock-many": 'Voit avata {} uutta kirjaa!',
    "skill-point-unlock": 'Voit avata uuden kirjan!',
    "read": "Lue",
    "read-book": "Lue Kirja",
    "previous-page": "Edellinen sivu",
    "next-page": "Seuraava sivu",
    "unlock": "Avaa",
    "unlocked": "Avattu",
    "skill-points-needed": "1 taitopiste",
    "skill-points-needed-many": "{} taitopistettä",
    "book-discover": "Avasit kirjan!",
    "book-discover-info": "Löysit Ohjekortin:",
    "item-00-name": 'Tervetulokirje',
    "item-00-hint": 'Tervetuloa opiskelemaan SQL loitsuja. Teille on jaettu oppimateriaalia sekä tehtäviä. Toivottavasti viihdytte.\n\nTervetulevin Terveisin, \nRehtori Kyselyx',
    "item-000-name": 'Säkki',
    "item-0000-name": 'Tehtävärullat',
    "item-0000-hint": 'Säkistä löytyi myös kasa tehtävärullia.',
    "write-query-first": "Kirjoita kysely.",
    "query-placeholder": "Kirjoita SQL loitsu...",
    "query-test": "Kokeile loitsua",
    "correct": "Oikein",
    "incorrect": "Ei mennyt ihan oikein",
    "task-complete": "Tehtävä Suoritettu",
    "group-A-name": "Valintojen-tehtävät",
    "group-B-name": "Etsintöjen-tehtävät",
    "group-C-name": "Järjestyksen-tehtävät",
    "group-D-name": "Erottuvuuden-tehtävät",
    "group-E-name": "Tekstiloitsujen-tehtävät",
    "group-F-name": "Rajojen-tehtävät",
    "group-G-name": "Ryhmittelyn-tehtävät",
    "group-H-name": "Matematiikanloitsujen-tehtävät",
    "group-I-name": "Liittämisen-tehtävät",
    "group-J-name": "Vasemman liitoksen-tehtävät",
    "group-K-name": "Normalisaation-tehtävät",
    "group-L-name": "Yhdistelyn-tehtävät",
    get: function (key) {
        if (!key) return key;
        const value = this[key.startsWith("i18n-") ? key.substr(5) : key];
        if (value instanceof Function) return value();
        return value ? value : key;
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
replaceI18nContent();