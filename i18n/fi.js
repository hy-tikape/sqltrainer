const i18n = {
    "welcome": "Tervetuloa SQL-loitsujen maagiseen maailmaan",
    "murder": "${nimi} on murhattu. Hänen rintaansa iskettiin veitsi eilen, kello 17 ja 19 välisenä aikana.\nViimeksi hänet nähtiin elossa hänen poistuessaan juhlistaan kesken kaiken tuntemattomasta syystä.\nHänet löydettiin pihalta kello 19:12 kuolleena pitelemässä laukkua. Laukku on tutkittavana.",
    "mission": "Tehtäväsi on tutkia juhlien vieraiden osallisuutta murhaan, sekä etsiä vihjeitä.\nTätä varten sinulle on annettu Kyselin, perusohjeet sen käyttöä varten, sekä juhlien vieraslista.",
    "similarity-disclaimer": "Kaikki yhtäläisyydet oikean maailman tapahtumiin ovat sattumaa. Henkilöt ja tapahtumat ovat keksittyjä.",
    "inventory": "",
    "ok": "Selvä!",
    "books-text": "Kirjat",
    "found-books-text": "Kirjat",
    "suspects-text": "Epäillyt",
    "book-discover": "",
    "book-discover-info": "Löysit Ohjekortin:",
    "book-item-name": "{}: {}",
    "item-000-name": 'Säkki',
    "book-001-name": 'Book of Selection Spells',
    "book-001-author": 'Maestro SQLivitrius',
    "book-001-text": 'Ohjeet Kyselimen peruskäyttöön\n\nSELECT column FROM Table;\nSELECT column_1, column_2 FROM Table;\nSELECT * FROM Table;',
    "book-001-hint": '"Tämä kirja tutustuu valintojen loitsujen perusteisiin. Kirjan on aivan oleellinen jos haluaa ettei loitsiessa lohikäärmen sijasta taio esiin vain ja ainoastaan lohta syövää sisiliskoa."',
    "task-001-name": "Sähköinen vieraslista",
    "task-001-description": "Emme ole ehtineet tallentaa kaikkea tietoa vieraskirjasta. Voisitko tulostaa meille kaikki vieraslistassa olevat tiedot Kyselimen avulla.",
    "source-police": 'Poliisin tutkintamateriaalista',
    "source-folder": '${nimi} pitelemästä laukusta',
    "source-guests": 'Vieraslistasta',
    get: function (key) {
        if (!key) return key;
        return this[key.substr(5)];
    },
    getWith: function (key, replacements) {
        let returnValue = this.get(key);
        for (let replacement of replacements) {
            if (replacement) {
                returnValue = returnValue.replace('{}', replacement.includes("i18n-") ? this.get(replacement) : replacement);
            }
        }
        return returnValue;
    }
}

replaceI18nContent = () => {
    for (let key of Object.keys(i18n)) {
        const newContent = i18n[key];
        if (!(newContent instanceof Function)) {
            for (let element of document.getElementsByClassName("i18n-" + key)) {
                element.innerText = newContent;
            }
        }
    }
}
replaceI18nContent();