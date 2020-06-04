renderExample = (query, tablesIn, tableOut) => {
    return `<div class="table-paper">${tablesIn}</div>
        <p>${query}</p>
        <div class="table-paper">${tableOut}</div>`
}

table = (tableName, fromString) => {
    const lines = fromString.split('\n');
    return QueryResult.fromPlain(tableName, lines.slice(1), lines[0].split("|")).renderAsTable(true);
}

const i18n = {
    "empty-table": "Taulu on tyhjä",
    "ok": "Selvä!",
    "close": "Sulje",
    "back": "Takaisin",
    "books-text": "Kirjat",
    "found-books-text": "Kirjat",
    "level-unlocked": 'Suoritit kaikki tehtäväsarjan tehtävät!',
    "skill-tree": 'Käytä taitopisteitä',
    "skill-point-count": 'Sinulla on <span class="skill-point-count">{}</span> taitopistettä käytettävissä',
    "skill-point-unlock-many": '+{} taitopistettä',
    "skill-point-unlock": '+1 taitopiste',
    "read": "Lue",
    "read-book": "Lue Kirja",
    "previous-page": "Edellinen sivu",
    "next-page": "Seuraava sivu",
    "unlocked": "Avattu",
    "skill-points-needed": "1 taitopiste",
    "skill-points-needed-many": "{} taitopistettä",
    "book-discover": "Avasit kirjan!",
    "book-discover-info": "Löysit Ohjekortin:",
    "item-00-name": 'Tervetulokirje',
    "item-00-hint": 'Tervetuloa opiskelemaan SQL loitsuja. Teille on jaettu säkki, joka sisältää ensimmäisen oppitunnin materiaalin. Olkaa hyvä ja tutustukaa materiaaliin.\n\nJa vielä kerran, tervetuloa.\nTerveisin, Rehtori Kyselyx',
    "item-000-name": 'Säkki',
    "item-0000-name": 'Tehtävärullat',
    "item-0000-hint": 'Säkistä löytyi myös kasa tehtävärullia.',
    "item-unlock-tasks-hint": 'Pöydällesi ilmestyi lisää tehtävärullia kuin tyhjästä',
    "book-secret-empty-page": 'Löysit piilossa olevan tekstin kirjasta. Salaviestejä käytetään kirjoissa mm. piilottamaan kustantajilta kaikenlaisia loitsuja. Tämä on ainoa salaviesti ja on olemassa vain koska kirjan sivu olisi muuten liian kapea.\n\n🤯',
    "book-001": 'Valintojen kirja',
    "book-001-name": 'Book of the Selection Spell',
    "book-001-author": 'Maestro SQLivitrius',
    "book-001-hint": '"Tämä kirja tutustuu valintojen loitsun perusteisiin. Kirja on aivan oleellinen jos haluaa ettei loitsiessa lohikäärmen sijasta taio esiin vain lohta syövää sisiliskoa."',
    "book-001-page-1": 'Valinnan tekeminen on joskus vaikeaa, mutta tällä loitsulla saa aina valittua ainakin jotain, vaikka se sitten ei olisikaan sitä mitä alunperin halusi!' +
        '\n\nLoitsu:\nSELECT {sarakkeet} FROM {Taulu};\n\nSELECT valitsee sarakkeita Taulusta, ja vain ne jotka valitset näkyvät lopullisessa tuloksessa. Seuraavilta sivuilta löytyy esimerkkejä.',
    "book-001-page-2": () => `${renderExample("SELECT nimi FROM Lohikaarmeet;", table('Lohikaarmeet', "id|nimi|kuva\n1|Jake Long|🐉\n2|Justus|🐉\n3|Tabaluca|🐉"), table("Tulos", "nimi\nJake Long\nJustus\nTabaluca"))}`,
    "book-001-page-3": () => `${renderExample("SELECT nimi, ruokavalio FROM Elaimet;", table('Elaimet', "id|nimi|ruokavalio\n1|Matti|🌭\n2|Mirri|🥒\n3|Ranttu-lisko|🐟"), table("Tulos", "nimi|ruokavalio\nMatti|🌭\nMirri|🥒\nRanttu-lisko|🐟"))}`,
    "book-001-page-4": () => `${renderExample("SELECT * FROM Elaimet;", table('Elaimet', "id|nimi|ruokavalio\n1|Matti|🌭\n2|Mirri|🥒\n3|Ranttu-lisko|🐟"), table('Tulos', "id|nimi|ruokavalio\n1|Matti|🌭\n2|Mirri|🥒\n3|Ranttu-lisko|🐟"))}`,
    "book-002": 'Etsintöjen kirja',
    "book-002-name": 'Improved Selection: Lookup Spells',
    "book-002-author": 'Maestro SQLivitrius',
    "book-002-hint": '"Vuosien ajan loitsijat taikoivat koko vaatekaappinsa sisällön laukkuunsa - Tämän kirjan ohjeilla voit ottaa mukaan vähemmän, vaikka vain 8-hihaiset paidat!"',
    "book-002-page-1": 'Olet varmaan jo huomannut että pelkkä SELECT-loitsu loitsii esiin kaikki rivit valituille sarakkeille. Tällä loitsulla riveistä voi rajata vain ne jotka haluaa esiin.\n\nLoitsu:\nSELECT {sarakkeet} FROM {Taulu} WHERE {ehdot}\n\nWHERE rajoittaa rivejä ehdon mukaan.',
    "book-002-page-2": 'Rivejä verrataan annettuihin ehtoihin. Ehdoissa voi käyttää =, <, >, <=, >= ja != merkkejä. esim. hihojen_maara<5\n\nEhtoja voi yhdistellä:\n{ehto} AND {ehto}\n {ehto} OR {ehto}\n\nNOT {ehto} kääntää ehdon\n\n Ehtojen järjestystä voi vaihtaa suluilla, esim:\nNOT ((x=0 OR y=1) AND z=2)',
    "book-002-page-3": () => `${renderExample("SELECT * FROM Lemmikit WHERE tunne = 'vihainen';", table('Lemmikit', "id|elain|tunne\n1|😻|rakastunut\n2|🦑|tyytyväinen\n3|🦎|vihainen"), table('Tulos', "id|elain|tunne\n3|🦎|vihainen"))}`,
    "book-002-page-4": () => `${renderExample("SELECT * FROM Lemmikit WHERE NOT tunne = 'rakastunut'", table('Lemmikit', "id|elain|tunne\n1|😻|rakastunut\n2|🦑|tyytyväinen\n3|🦎|vihainen"), table('Tulos', "id|elain|tunne\n2|🦑|tyytyväinen\n3|🦎|vihainen"))}`,
    "book-002-page-5": () => `${renderExample("SELECT * FROM Paidat WHERE 5 &lt; hihat \nAND hihat &lt;= 10;", table('Paidat', "id|paita|hihat\n1|Muurahaisten-tuplapaita|12\n2|Mustekkalan T-paita|8\n3|Jätesäkki|0"), table('Tulos', "id|paita|hihat\n2|Mustekkalan T-paita|8"))}`,
    "book-002-page-6": () => `${renderExample("SELECT * FROM Elokuvat WHERE vuosi &lt;= 1940 OR 1950 &lt; vuosi;", table('Elokuvat', "id|nimi|vuosi\n1|Nosql-feratu|1922\n2|Casqblanca|1942\n3|Giant|1956"), table('Tulos', "id|nimi|vuosi\n1|Nosql-feratu|1922\n3|Giant|1956"))}`,
    "book-003": 'Järjestyksen kirja',
    "book-003-name": 'Tidying up Magic with Order',
    "book-003-author": 'Shinju Fql',
    "book-003-hint": '"Jotta sisimpäsi voi olla rauhassa, tulee ympäristösi olla järjestyksessä."',
    "book-003-page-1": 'Asioiden järjestäminen onnistuu loihtien, jos tarpeelliset tiedot ovat hallussa.\n\nLoitsu:\nSELECT {sarakkeet} FROM {Taulu} ORDER BY {sarake} {(ASC)|DESC}\n\nORDER BY järjestää tulokset nousevassa tai laskevassa järjestyksessä. Tarkemman järjestyksen voi luoda pilkulla erottamalla.',
    "book-003-page-2": () => `${renderExample("SELECT kirja, nimi FROM Kirjat ORDER BY nimi;", table('Kirjat', "id|kirja|nimi\n1|📒|Banaanikärpänen\n2|📗|Kasvien maailma\n3|📙|Aurinkoinen päivä"), table('Tulos', "kirja|nimi\n📙|Aurinkoinen päivä\n📒|Banaanikärpänen\n📗|Kasvien maailma"))}`,
    "book-003-page-3": () => `${renderExample("SELECT kirja, nimi FROM Kirjat ORDER BY nimi DESC;", table('Kirjat', "id|kirja|nimi\n1|📒|Banaanikärpänen\n2|📗|Kasvien maailma\n3|📙|Aurinkoinen päivä"), table('Tulos', "kirja|nimi\n📗|Kasvien maailma\n📒|Banaanikärpänen\n📙|Aurinkoinen päivä"))}`,
    "book-003-page-4": () => `${renderExample("SELECT vuosi, nimi FROM Elokuvat ORDER BY vuosi DESC, nimi ASC;", table('Elokuvat', "id|nimi|vuosi\n1|Casqblanca|1942\n2|Bananas|1971\n3|Alibi|1942"), table('Tulos', "vuosi|nimi\n1971|Bananas\n1942|Alibi\n1942|Casqblanca"))}`,
    "book-004": 'Erottuvuuden kirja',
    "book-004-name": 'Distinction between things',
    "book-004-author": 'Mike Owl-Raven',
    "book-004-hint": '"Keräilijöiden tulee olla erittäin tarkkoja kokoelmiensa kanssa. Tässä kirjassa paljastamme Mike Owl-Ravenin Riimu-kokoelman erikoisuuden takana olevan loitsun."',
    "book-004-page-1": '"DISTINCT"\n\nMike Owl-Raven ei sanonut muuta, mutta kirja täytyi silti kirjoittaa. Niinpä selvitimme loitsun toimintaperiaatteen.\n\nLoitsu:\nSELECT DISTINCT {sarakkeet} FROM {Taulu}\n\nSELECT DISTINCT rajoittaa tulosrivejä uniikkeihin riveihin.',
    "book-004-page-2": () => `${renderExample("SELECT DISTINCT rune FROM Runes;", table('Runes', "id|rune|name\n1|ᚠ|Fe\n2|ᚦ|Thurs\n3|ᚦ|Thurs"), table('Tulos', "rune\nᚠ\nᚦ"))}`,
    "book-004-page-3": () => `${renderExample("SELECT DISTINCT rune, name FROM Runes;", table('Runes', "id|rune|name\n1|ᚦ|Thurs\n2|ᚦ|Thurs\n3|ᚦ|Thurs-Maximus"), table('Tulos', "rune|name\nᚦ|Thurs\nᚦ|Thurs-Maximus"))}`,
    "book-005": 'Tekstiloitsujen kirja',
    "book-005-name": 'Text Magic and Bananas',
    "book-005-author": 'Ms. ABC',
    "book-005-hint": '"Tekstiloitsuja on suuri määrä ja jotta osaisit analysoida mieltä, tässä kirjassa selitetään niiden toiminta juurta jaksaen, banaaneja apuna käyttäen."',
    "book-005-page-1": 'Tekstiloitsuilla voidaan lukea mieltä.\n\nLoitsut:\nLENGTH({sarake}) - kertoo tekstin pituuden\nUPPER({sarake}) - muuttaa tekstin isokirjaimiseksi\nLOWER({sarake}) - muuttaa tekstin pienikirjaimiseksi\n\n{sarake} || \'Tekstiä\' - tekstin yhdistys (concatenation)\n{sarake} LIKE \'%pa_tte%rn\' - ehto tekstin muodon tarkistamiseen\n_ yksi merkki, % nolla, yksi tai useita merkkejä',
    "book-005-page-2": () => `${renderExample("SELECT teksti, LENGTH(teksti) as pituus FROM Mind;", table('Mind', "id|teksti\n1|banaani\n2|apina"), table('Tulos', "teksti|pituus\nbanaani|7\napina|5"))}`,
    "book-005-page-3": () => `${renderExample("SELECT UPPER(teksti) as iso FROM Mind;", table('Mind', "id|teksti\n1|Banaani\n2|Apina"), table('Tulos', "iso\nBANAANI\nAPINA"))}`,
    "book-005-page-4": () => `${renderExample("SELECT LOWER(teksti) as pieni FROM Mind;", table('Mind', "id|teksti\n1|Banaani\n2|Apina"), table('Tulos', "pieni\nbanaani\napina"))}`,
    "book-005-page-5": () => `${renderExample("SELECT 'Super ' || teksti as yhdiste FROM Mind;", table('Mind', "id|teksti\n1|Banaani\n2|Apina"), table('Tulos', "yhdiste\nSuper Banaani\nSuper Apina"))}`,
    "book-005-page-6": () => `${renderExample("SELECT teksti || liite as yhdiste FROM Mind;", table('Mind', "id|teksti|liite\n1|Banaani|keitto\n2|Apina|puu"), table('Tulos', "yhdiste\nBanaanikeitto\nApinapuu"))}`,
    "book-005-page-7": () => `${renderExample("SELECT teksti FROM Mind WHERE teksti LIKE '%na%';", table('Mind', "id|teksti\n1|banaani\n2|apina\n3|jolla"), table('Tulos', "teksti\nbanaani\napina"))}`,
    "book-005-page-8": () => `${renderExample("SELECT teksti FROM Mind WHERE teksti LIKE 'a___a';", table('Mind', "id|teksti\n1|banaani\n2|apina"), table('Tulos', "teksti\napina"))}`,
    "book-006": 'Rajojen kirja',
    "book-006-name": 'Tidying up Magic with Limits',
    "book-006-author": 'Mari Fql',
    "book-006-hint": '"Jotta ympäristösi pysyy järjestyksessä, vähennä määrää."',
    "book-006-page-1": '',
    "book-006-page-2": '',
    "book-007": 'Ryhmittelyn kirja',
    "book-007-name": 'Grouping Things in Boxes',
    "book-007-author": '',
    "book-007-hint": '',
    "book-007-page-1": '',
    "book-007-page-2": '',
    "book-008": 'Matematiikanloitsujen kirja',
    "book-008-name": 'The Cool World of Mathematic Spells',
    "book-008-author": '',
    "book-008-hint": '',
    "book-008-page-1": '',
    "book-008-page-2": '',
    "book-009": 'Liittämisen kirja',
    "book-009-name": 'Fusion Magic, a Practical Guide',
    "book-009-author": 'Go-Ku Jon',
    "book-009-hint": '',
    "book-009-page-1": '',
    "book-009-page-2": '',
    "book-010": 'Vasemman liitoksen kirja',
    "book-010-name": 'Fusion Magic for Unbalanced Tables',
    "book-010-author": '',
    "book-010-hint": '',
    "book-010-page-1": '',
    "book-010-page-2": '',
    "book-011": 'Normalisaation kirja',
    "book-011-name": 'Multiple Spell-Wells Normalized',
    "book-011-author": '',
    "book-011-hint": '',
    "book-011-page-1": '',
    "book-011-page-2": '',
    "book-012": 'Yhdistelyn kirja',
    "book-012-name": 'Unification 101',
    "book-012-author": 'B0rq L.1275',
    "book-012-hint": '',
    "book-012-page-1": '',
    "book-012-page-2": '',
    "write-query-first": "Kirjoita kysely.",
    "query-placeholder": "Kirjoita SQL loitsu...",
    "query-test": "Kokeile loitsua",
    "task-complete": "Tehtävä Suoritettu",
    "group-001-name": "Valintojen-tehtävät",
    "group-002-name": "Etsintöjen-tehtävät",
    "group-003-name": "Järjestyksen-tehtävät",
    "group-004-name": "Erottuvuuden-tehtävät",
    "group-005-name": "Tekstiloitsujen-tehtävät",
    "group-006-name": "Rajojen-tehtävät",
    "group-007-name": "Ryhmittelyn-tehtävät",
    "group-008-name": "Matematiikanloitsujen-tehtävät",
    "task-001-name": "Valitse Kaikki",
    "task-001-description": "SQL-mestarin tie alkaa tästä.\n\nTehtävä: Loihdi kaikki taulun 'Runes' sisällöt esiin.",
    "task-002-name": "Tarkkuusvalintaa",
    "task-002-description": "Nyt meillä on lista kaikista riimuista, loitsi esiin ainoastaan riimujen symbolit.\n\nTehtävä: Loihdi taulun 'Runes' riimut esiin",
    "task-003-name": "Lohi-käärme",
    "task-003-description": "On aika luoda lohi-käärme. Valitse olion pää ja häntä sen luomiseksi.\n\nTehtävä: Luo lohi-käärme",
    "task-004-name": "Kadonnut lemmikki",
    "task-004-description": "Lemmikki-kissa ᛒᛖᛞ (yleinen lemmikkien nimi) karkasi kotoa. Hän on maagisella-taajuudella 75Hz eikä vastaa nimeen eikä mihinkään. Voisitko loihtia hänet tänne nimen kera että varmasti on oikea kissa.\n\nTehtävä: Kutsu kissa nimeltä ᛒᛖᛞ, löydät sen taajuudelta 75.",
    "task-005-name": "ᛒᛖᛞ-nimiset lemmikit",
    "task-005-description": "Etsiessäni kissaa tuli vahingossa taiottua muita loihtioiden ᛒᛖᛞ lemmikkejä mukaan. Onko muilla kissaani 'maagisesti parempia' lemmikkejä? Kissani voima on 300, eli sitä voimakkaammat kelpaavat.\n\nTehtävä: Etsi loitsun avulla eläimet voimineen, jotka ovat vahvempia kuin 300.",
    "task-006-name": "Padat ja Kattilat",
    "task-006-description": "Taikajuomien valmistamiseen tarvitaan erityslaatuinen pata, joka on halkaisijaltaan 20-25″.\n\nTehtävä: Etsi kaikki taikajuomien valmistamiseen sopivat padat.",
    "task-007-name": "Ostraconophobia",
    "task-007-description": "Lemmikki-katkarapu on puraissut kaveriasi, ja hän miettii että onko se vaarallista. Maagiset katkaravut ovat vaarallisia vain tietyn kokoisina, erittäin pieninä (alle 20mm) ja suurina (yli 200mm)\n\nTehtävä: Etsi kaikki vaaralliset maagiset-katkarapulajit (kuva, nimi, koko).",
    "task-008-name": "Oppilasprojekti",
    "task-008-description": "On aika liittyä oppilasprojektiin. Voit kuitenkin vain liittyä projekteihin jotka eivät ole valmiita tai yli 50% valmiita.\n\nTehtävä: Etsi kaikki sopivien projektien nimet, tila ja eteneminen. Projekti ei saa olla valmis eikä yli 50% tehty.",
    "task-009-name": "Salakirjoitusta",
    "task-009-description": "Taulu sisältää salaisen sanan, joka oli hedelmien-salaseuran tunnussana vuonna 1972. Selvitä viesti.\n\nTehtävä: Järjestä kirjaimet koodin mukaan ja selvitä salaviesti.",
    "task-010-name": "Huonekalujen järjestys",
    "task-010-description": "Huone on ihan sekaisin. Se täytyy järjestää uudelleen aakkosjärjestyksen mukaan, että on helpompi taikoa Ä:sta Ö:hön\n\nTehtävä: Järjestä huonekalut nimien mukaan aakkosjärjestyksessä.",
    "task-011-name": "Väärinpäin-päivä",
    "task-011-description": "Pian on väärinpäin-päivä, joten huone on järjestettävä Ö:sta Ä:hän\n\nTehtävä: Järjestä huonekalut nimien mukaan käänteisessä aakkosjärjestyksessä.",
    "task-012-name": "Tolkun tarkistus",
    "task-012-description": "Saamasi historiankirja ei vaikuta järkevältä, joku on sekoittanut tapahtumien järjestyksen. \n\nTehtävä: Tee asioista selvää järjestämällä tapahtumat kronologiseen järjestykseen ja samana vuonna tapahtuneet asiat aakkosjärjestykseen.",
    "task-013-name": "Kummitusloki",
    "task-013-description": "Kummituksilla on joskus tylsää ja he raapustavat nimiä vieraskirjoihin joka kerta kun kummittelevat jossain. Taikamajakan vieraskirja on ihan täynnä.\n\nTehtävä: Selvitä kaikkien taikamajakassa vierailleiden kummitusten nimet.",
    "task-014-name": "Kummitusbisnestä",
    "task-014-description": "Kummitukset lähettävät toisilleen kirjeitä, vaikka asuisivat samassa talossa, jotta saisivat joskus postia. Toimita kirjeet.\n\nTehtävä: Selvitä kaikkien kirjeitä saaneiden kummitusten nimet.",
    "task-015-name": "Mielenlukua",
    "task-015-description": "Hedelmien salaseuran jäsen on saapunut testauttamaan mielensä tyhjyyttä salaisista asioista.\n\nTehtävä: Lue mielessä olevat asiat ja niiden pituudet",
    "task-016-name": "Zombin uniongelma",
    "task-016-description": "Ovivartija ei ole viimeaikoina saanut nukuttua kunnolla.\n\nTehtävä: Selvitä mikä ovivartijaa vaivaa (yli 20 merkkiä pitkä ajatus)",
    get: function (key) {
        if (!key) return key;
        const value = this[key.substr(5)];
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