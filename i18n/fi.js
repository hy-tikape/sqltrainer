for (let entry of Object.entries({
    "error": "Virhe",
    "username": "mooc.fi-tunnus",
    "password": "salasana",
    "welcome": "Oletko valmis lähtemään matkalle SQL-kielen maagiseen maailmaan?",
    "login": "Kirjaudu sisään",
    "login-error-no-user": "Kirjoita käyttäjätunnus",
    "login-error-no-password": "Kirjoita salasana",
    "logout": "Kirjaudu ulos",
    "incorrect-password": "Väärä käyttäjänimi tai salasana",
    "forgot-password": "Unohtuiko salasana?",
    "register": "Rekisteröidy",
    "empty-table": "Taulu on tyhjä",
    "loading": "Ladataan...",
    "ok": "Selvä!",
    "close": "Sulje",
    "skip": "Ohita",
    "back": "Takaisin",
    "example": "Esimerkki",
    "show-model-answer": "Näytä mallivastaus",
    "previous-answers": "Lähetetyt vastaukset",
    "table-result": "Tulos",
    "wanted-result": "Haluttu tulos",
    "books-text": "Kirjat",
    "tasks-text": "Kääröt",
    "map-text": "Kartta",
    "found-books-text": "Kirjat",
    "level-unlocked": 'Suoritit kaikki tehtäväsarjan tehtävät!',
    "skill-point-count-zero": 'Suorita tehtäviä avataksesi uusia kirjoja',
    "read": "Lue",
    "read-book": "Lue kirja",
    "previous-page": "Edellinen sivu",
    "next-page": "Seuraava sivu",
    "unlock": "Avaa",
    "unlocked": "Avattu",
    "rewatch-animation": "Katso animaatio uudelleen",
    "book-discover": "Avasit kirjan!",
    "item-00-name": 'Tervetulokirje',
    "item-00-hint":
        `Tervetuloa oppimaan SQL-kielen saloja!
        
        Olet saanut jo ensimmäisen käärön, jossa on kirja ja tehtäviä.
        Kirjasta voit oppia kyselyjen teoriaa, ja kun saat ratkottua kaikki käärön tehtävät, niin pääset seuraavalle tasolle.
        
        Opintietäsi valaisee Sininen Liekki, johon tulet tutustumaan paremmin myöhemmin.
        
        Terveisin
        Rehtori Codd`,
    "item-999-name": "???",
    "write-query-first": "Kirjoita kysely",
    "multi-query-not-allowed": "Tulos täytyy saada yhdellä kyselyllä, älä tee useita kyselyitä.",
    "sub-query-not-allowed": "Tulos täytyy saada ilman alikyselyitä, älä käytä alikyselyitä.",
    "query-no-rows": "Kysely ei vastannut yhtään riviä",
    "query-placeholder": "Kirjoita kysely...",
    "query-test": "Kokeile kyselyä",
    "test": "Testi {}",
    "correct": "Oikein",
    "incorrect": "Ei mennyt ihan oikein",
    "task-complete": "Tehtävä suoritettu",
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
    /* Screen reader only */
    "task-groups": "Pelin päänäkymä, tehtäväsarjat ja esineet",
    "tasks": "Avoimeen tehtäväsarjaan liittyvät esineet",
    "task-description": "Tehtävänanto",
    "task-area": "Tehtävä",
    "task-tests": "Tehtävän testit",
    "map-view": "Kartta, jossa on tehtäviä",
    "indicators": "Tehtävien suoritusmäärä",
    "stars": "Tähtiä kerätty",
    "flames": "Liekkejä napattu",
    "right-sidebar": "Oikea sivupalkki - lisänavigaatio",
    "transformation-animation": "Animaatio, avustava liekki muuttuu pahaksi ja vapauttaa ilkeitä liekkejä maailmaan. Ohitettavissa napilla. Kesto: noin 45 sekuntia",
    "end-animation": "Animaatio, nappaamasi liekit kääntyvät isäntäänsä vastaan ja tuhoavat pahan liekin. Ohitettavissa napilla. Kesto: noin 45 sekuntia",
    "describe-letter": "Tervetulokirje",
    "describe-questionmark": "Mysteerinen symboli",
    "group-A-name": "Valintojen-kääröt",
    "group-B-name": "Yhteenvedon-kääröt",
    "group-C-name": "Ryhmittelyn-kääröt",
    "group-D-name": "Liittämisen-kääröt",
    "group-E-name": "?-kääröt",
    "group-F-name": "Vasemman liitoksen-kääröt",
    "group-G-name": "Tyyppien-kääröt",
    "group-H-name": "Rajojen-kääröt",
    "group-I-name": "Alikyselyiden-kääröt",
    "group-J-name": "Ikkunoiden-kääröt"
})) {
    i18n[entry[0]] = entry[1];
}

replaceI18nContent();
