const i18n = {
    "welcome": "Tervetuloa SQL-loitsujen maagiseen maailmaan",
    "murder": "${nimi} on murhattu. Hänen rintaansa iskettiin veitsi eilen, kello 17 ja 19 välisenä aikana.\nViimeksi hänet nähtiin elossa hänen poistuessaan juhlistaan kesken kaiken tuntemattomasta syystä.\nHänet löydettiin pihalta kello 19:12 kuolleena pitelemässä laukkua. Laukku on tutkittavana.",
    "mission": "Tehtäväsi on tutkia juhlien vieraiden osallisuutta murhaan, sekä etsiä vihjeitä.\nTätä varten sinulle on annettu Kyselin, perusohjeet sen käyttöä varten, sekä juhlien vieraslista.",
    "similarity-disclaimer": "Kaikki yhtäläisyydet oikean maailman tapahtumiin ovat sattumaa. Henkilöt ja tapahtumat ovat keksittyjä.",
    "inventory": "",
    "empty-table": "Taulu on tyhjä",
    "ok": "Selvä!",
    "close": "Sulje",
    "back": "Takaisin",
    "books-text": "Kirjat",
    "found-books-text": "Kirjat",
    "suspects-text": "Epäillyt",
    "next-level-in": 'Seuraavalle tasolle: <span class="xp-count"></span>xp / <span class="xp-required"></span>xp',
    "level-unlocked": 'Saavutit tason <span class="level-count"></span>!',
    "skill-point-count": 'Sinulla on <span class="skill-point-count">{}</span> taitopistettä käytettävissä',
    "skill-point-unlock-many": '+{} tasopistettä',
    "skill-point-unlock": '+1 tasopiste',
    "book-discover": "Sait kirjan!",
    "book-discover-info": "Löysit Ohjekortin:",
    "item-00-name": 'Tervetulokirje',
    "item-00-hint": 'Tervetuloa opiskelemaan SQL loitsuja. Teille on jaettu säkki, joka sisältää ensimmäisen oppitunnin materiaalin. Olkaa hyvä ja tutustukaa materiaaliin.\n\nJa vielä kerran, tervetuloa.\nTerveisin, Rehtori Kyselyx',
    "item-000-name": 'Säkki',
    "item-0000-name": 'Tehtävärullat',
    "item-0000-hint": 'Säkistä löytyi myös kasa tehtävärullia.',
    "book-001-name": 'Book of the Selection Spell',
    "book-001-author": 'Maestro SQLivitrius',
    "book-001-text": 'Ohjeet Kyselimen peruskäyttöön\n\nSELECT column FROM Table;\nSELECT column_1, column_2 FROM Table;\nSELECT * FROM Table;',
    "book-001-hint": '"Tämä kirja tutustuu valintojen loitsun perusteisiin. Kirja on aivan oleellinen jos haluaa ettei loitsiessa lohikäärmen sijasta taio esiin vain lohta syövää sisiliskoa."',
    "book-001-page-1": 'Valinnan tekeminen on joskus vaikeaa, mutta tällä loitsulla saa aina valittua ainakin jotain, vaikka se sitten ei olisikaan sitä mitä alunperin halusi!\n\nSELECT valitsee sarakkeita Taulusta, ja vain ne jotka valitset näkyvät lopullisessa tuloksessa.',
    "book-001-page-2": 'Loitsu:\nSELECT sarake FROM Taulu;\n\nEsimerkkejä:\nSELECT nimi FROM Lohikaarmeet;\nSELECT nimi, ruokavalio FROM Elaimet;\nSELECT * FROM Elaimet;<ul><li><a href="#">Lisää SELECT-loitsusta</a></li></ul>',
    "query-placeholder": "Kirjoita SQL loitsu...",
    "query-test": "Kokeile loitsua",
    "task-001-name": "Valitse Kaikki",
    "task-001-description": "SQL-mestarin tie alkaa tästä.\n\nTehtävä: Loihdi kaikki taulun 'Runes' riimut esiin.",
    "task-002-name": "Tarkkuusvalintaa",
    "task-002-description": "Nyt meillä on lista kaikista riimuista, loitsi esiin ainoastaan riimujen symbolit taulusta.",
    "task-003-name": "Lohi-käärme",
    "task-003-description": "On aika luoda lohi-käärme. Valitse olion pää ja häntä sen luomiseksi.",
    "source-police": 'Poliisin tutkintamateriaalista',
    "source-folder": '${nimi} pitelemästä laukusta',
    "source-guests": 'Vieraslistasta',
    get: function (key) {
        if (!key) return key;
        const value = this[key.substr(5)];
        return value ? value : key;
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
                element.innerHTML = newContent.split('\n').join("<br>");
            }
        }
    }
}
replaceI18nContent();