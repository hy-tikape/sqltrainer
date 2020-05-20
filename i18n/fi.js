const i18n = {
    "welcome": "Ratkaise ${nimi} murhan arvoitus SQL-kielellä",
    "murder": "${nimi} on murhattu. Hänen rintaansa iskettiin veitsi eilen, kello 17 ja 19 välisenä aikana.\nViimeksi hänet nähtiin elossa hänen poistuessaan juhlistaan kesken kaiken tuntemattomasta syystä.\nHänet löydettiin pihalta kello 19:12 kuolleena pitelemässä laukkua. Laukku on tutkittavana.",
    "mission": "Tehtäväsi on tutkia juhlien vieraiden osallisuutta murhaan, sekä etsiä vihjeitä.\nTätä varten sinulle on annettu Kyselin, perusohjeet sen käyttöä varten, sekä juhlien vieraslista.",
    "similarity-disclaimer": "Kaikki yhtäläisyydet oikean maailman tapahtumiin ovat sattumaa. Henkilöt ja tapahtumat ovat keksittyjä.",
    "inventory": "Tutkintamateriaali",
    "ok": "Selvä!",
    "clues-text": "Vihjeet",
    "found-clues-text": "Löytämäsi vihjeet",
    "suspects-text": "Epäillyt",
    "clue-discover": "Löysit vihjeen!",
    "clue-discover-info": "Löysit Ohjekortin:",
    "clue-001-name": 'Kyselin-ohjekortti (Valinta)',
    "clue-001-text": 'Ohjeet Kyselimen peruskäyttöön:\nSELECT * FROM Table; -- Hakee kaikki sarakkeet\nSELECT column FROM Table;\nSELECT column_1, column_2 FROM Table;',
    "clue-001-hint": 'Näin taulusta valitaan sarakkeita.',
    "clue-002-name": 'Kengänjäljet pihalla',
    "clue-002-text": 'Jäljen tehneen kengän koko on selvästi 37.',
    "clue-002-hint": 'Pihalla on useita kengänjälkiä samoista kengistä.',
    "clue-003-name": 'Loki Silminnäkijän haastattelusta',
    "clue-003-text": 'Poliisi: "Eli siis näitte kaksi tummaa hahmoa liikkumassa pihalla vähän ennen juhlia, osaisitteko kertoa tuntomerkkejä?"\n\nSilminnäkijä: "Toinen oli pitkä, ehkä 180-190cm ja toinen paljon lyhyempi, ehkä 155-165cm. Jompi kumpi tupakoi, näin tupakan kytevän maassa. Muuta en osaa sanoa."',
    "clue-003-hint": 'Lokista löytyi tuntomerkkejä epäilyttävistä hahmoista..',
    "clue-004-name": 'Kyselin-ohjekortti (Rajaus)',
    "clue-004-text": "Ohjeet Kyselimen peruskäyttöön:\nSELECT x FROM Table WHERE x=42;\nSELECT nimi FROM Table WHERE nimi='Esimerkki';\n=, <, >, <=, >=, !=",
    "clue-004-hint": 'Näin valinnasta rajataan rivejä',
    "task-001-name": "Sähköinen vieraslista",
    "task-001-description": "Emme ole ehtineet tallentaa kaikkea tietoa vieraskirjasta. Voisitko tulostaa meille kaikki vieraslistassa olevat tiedot Kyselimen avulla.",
    "task-002-name": "Kerrotut vieraiden kenkien koot",
    "task-002-description": "Vieraslistasta löytyy osa kenkien koosta, voisitko antaa meille listan nimistä ja kenkien koosta niin voimme käydä tutkimassa lisää.",
    "task-003-name": "Mitatut vieraiden kenkien koot",
    "task-003-description": "Löydetyn kengän jäljen koko oli 37. Mittaamaan puuttuvien vieraiden kenkien koot. Rajaa ne vieraat joiden kengät ovat sopivan kokoiset niin jututamme heitä lisää.",
    "task-004-name": "Vieraiden pituudet",
    "task-004-description": "Tarvitsemme listan vieraista, jotka sopivat tuntomerkkeihin. Valitse 180-190cm sekä 155-165cm pitkien vieraiden nimet ja pituudet.",
    "task-005-name": "Tupakoivat vieraat",
    "task-005-description": "Silminnäkijän mainitsemaa tupakantumppia ei ole vielä löytynyt. Tarvitsemme listan tupakoivien vieraiden nimistä.",
    "source-police": 'Poliisin tutkintamateriaalista',
    "source-folder": '${nimi} pitelemästä laukusta',
    "source-guests": 'Vieraslistasta',
    get: function (key) {
        return this[key.substr(5)];
    },
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