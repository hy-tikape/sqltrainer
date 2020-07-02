const i18n = {
    "username": "Mooc Käyttäjätunnus",
    "password": "Salasana",
    "welcome": "Tervetuloa SQL-loitsujen maagiseen maailmaan.",
    "login": "Kirjaudu sisään",
    "logout": "Kirjaudu ulos",
    "incorrect-password": "Väärä käyttäjänimi tai salasana.",
    "forgot-password": "Unohtuiko salasana?",
    "register": "Rekisteröidy",
    "empty-table": "Taulu on tyhjä",
    "ok": "Selvä!",
    "close": "Sulje",
    "back": "Takaisin",
    "example": "Esimerkki",
    "show-model-answer": "Näytä mallivastaus",
    "table-result": "Tulos",
    "wanted-result": "Haluttu Tulos",
    "books-text": "Kirjat",
    "tasks-text": "Kääröt",
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
    "rewatch-animation": "Katso animaatio uudelleen",
    "book-discover": "Avasit kirjan!",
    "book-discover-info": "Löysit Ohjekortin:",
    "item-00-name": 'Tervetulokirje',
    "item-00-hint":
        `Tervetuloa opiskelemaan SQL loitsuja. Teille on jaettu oppimateriaalia sekä tehtäviä. Toivottavasti viihdytte.

        Kirjat avustakoon teitä ja tehtäväin ratketkoon!

        Tervetulevin Terveisin,
        Rehtori Kyselyx`,
    "write-query-first": "Kirjoita kysely.",
    "query-no-rows": "Kysely ei vastannut yhtään riviä.",
    "query-placeholder": "Kirjoita SQL loitsu...",
    "query-test": "Kokeile loitsua",
    "test": "Testi {}",
    "correct": "Oikein",
    "incorrect": "Ei mennyt ihan oikein",
    "task-complete": "Tehtävä Suoritettu",
    "group-A-name": "Valintojen-kääröt",
    "group-B-name": "Etsintöjen-kääröt",
    "group-C-name": "Järjestyksen-kääröt",
    "group-D-name": "Erottuvuuden-kääröt",
    "group-E-name": "Tekstiloitsujen-kääröt",
    "group-F-name": "Rajojen-kääröt",
    "group-G-name": "Ryhmittelyn-kääröt",
    "group-H-name": "Matematiikanloitsujen-kääröt",
    "group-I-name": "Liittämisen-kääröt",
    "group-J-name": "Vasemman liitoksen-kääröt",
    "group-K-name": "Normalisaation-kääröt",
    "group-L-name": "Yhdistelyn-kääröt",
    "animation-speech-1": `hihihi.. hihi hi.. Ehkä olisi vihdoin aika esittäytyä. Olen Kyselyx, ja
            ansiostasi sain nyt käsiini kaiken SQL tietämyksen..`,
    "animation-speech-2": `
            INSERT INTO Flame (power) VALUES (SELECT power FROM Stars);`,
    "animation-speech-3": `\n
        Muahahaha Voimasi ovat minun!
        UPDATE Flame SET color='evil' WHERE name='Kyselyx';`,
    "animation-speech-4": `\n
        MAAILMASI ON MENNYTTÄ!
        SELECT * FROM World JOIN Flame on World.location != Flame.location;`,
    "animation-speech-5": `\n
        AHAHAHAhaahahaHAHAHAahAHAHAAHAaaa`,
    "animation-explanation-6": `Kyselyx ei olekaan rehtori vaan ilkeä virvatuli!
                    Olet maailman ainoa toivo, sinun on estettävä Kyselyxiä tuhoamasta kaikkea SQL magialla!`,
    "to-battle": "Taisteluun!",
    "end-animation-speech-1": `Luulet varmaan voittaneesi, kun vangitsit kaikki vapauttamani liekit!`,
    "end-animation-speech-2": `\n
        MUTTA MINÄ TEEN LISÄÄ! Hahahahaha!`,
    "end-animation-speech-3": `\n
        <i>Kyselyx valmistautuu taikomaan..</i>`,
    "end-animation-speech-4": `\n
        EI! Mitä te luulette tekevänne!`,
    "end-animation-speech-5": `\n
        <i>Kyselyx, et ole tarpeeksi vahva. Hän on osoittanut meille mahtinsa, jos luulet meidän tekevän likaiset hommasi, olet väärässä.</i>`,
    "end-animation-speech-6": `\n
        EIIIIIIIIIIIIIIIIiiiiiiiiiiiiiiiiiiiiiiii...........`,
    "continue": "Jatka..",
    "congratulations": "Onnittelut!",
    "ending-text-1": 'Olet selvittänyt SQL taikojen salat, voittanut Kyselyxin ja pelastanut maailman!',
    "ending-text-2": 'Olet suorittanut kaikki tehtävät, sekä kurssin! Onnittelut.',
    "return-to-game": "Takaisin peliin",
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

replaceI18nContent();