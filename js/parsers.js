class Parser {
    async tryToParse(context, lines) {
        try {
            return this.parse(context, lines);
        } catch (e) {
            console.error(`Malformatted file, line ${lines[0]
                ? `'${lines[0]}' could not be parsed.`
                : "missing (Try '}' at the end of the file?)"}`, e);
        }
    }

    async parse(context, lines) {
        return {}
    }
}

class MetaDataParser extends Parser {
    parse(context, lines) {
        const metadata = {};
        while (true) {
            const line = lines.shift().trim();
            if (line === '}') break;
            if (line.match(/id: .*/)) metadata.id = line.substr(4);
            if (line.match(/name: .*/)) metadata.name = line.substr(6);
            if (line.match(/title: .*/)) metadata.title = line.substr(7);
            if (line.match(/author: .*/)) metadata.author = line.substr(8);
            if (line.match(/color: .*/)) metadata.color = line.substr(7);
        }
        return metadata;
    }
}

class CoverParser extends Parser {
    parse(context, lines) {
        let coverText = "";
        while (true) {
            const line = lines.shift().trim();
            if (line === '}') break;
            coverText += " " + line
        }
        // Removes preceding space
        return coverText.substr(1);
    }
}

class TableParser extends Parser {
    parse(context, lines) {
        const tableName = lines.shift().trim();
        const columnNames = lines.shift().trim();
        const rows = [];
        while (true) {
            const line = lines.shift().trim();
            if (line === '}') break;
            rows.push(line);
        }
        return Table.fromPlain(tableName, rows, columnNames.split("|"));
    }
}

class QueryParser extends Parser {
    async parse(context, lines) {
        const tables = context.tables;
        let queryContext = "";
        for (let table of tables) {
            for (let query of table.asQueries()) {
                queryContext += query;
            }
        }
        let query = "";
        while (true) {
            const line = lines.shift().trim();
            if (line === '}') break;
            query += line
        }

        const resultTables = [];
        try {
            const resultSets = await runSQL(queryContext, query)
            if (resultSets.length) {
                resultTables.push(Table.fromResultSet(i18n.get("i18n-table-result"), resultSets[0]))
            }
        } catch (e) {
            console.error(e);
        }

        return {query, resultTables};
    }
}

class ExampleParser extends Parser {
    async parse(context, lines) {
        const result = {
            tables: [],
            query: "",
            resultTables: []
        };
        while (true) {
            const line = lines.shift().trim();
            if (line === '}') break;
            if (line === 'TABLE {') {
                result.tables.push(PARSERS.TABLE.parse({}, lines));
            }
            if (line === 'QUERY {') {
                const parsed = await PARSERS.QUERY.parse({tables: result.tables}, lines);
                result.query = parsed.query;
                result.resultTables.push(...parsed.resultTables);
            }
        }
        return result;
    }
}

class PageParser extends Parser {
    async parse(context, lines) {
        let pageHtml = ``;
        let paragraphs = {
            isIn: false,
            entry() {
                if (!this.isIn) {
                    pageHtml += `<p>`;
                    this.isIn = true;
                }
            },
            exit() {
                if (this.isIn) {
                    pageHtml += `</p>`;
                    this.isIn = false;
                }
            }
        };
        while (true) {
            const line = lines.shift().trim();
            if (line === '}') break;
            if (line === 'EXAMPLE {') {
                paragraphs.exit(); // Exit paragraph if in one before table element.

                const parsed = await PARSERS.EXAMPLE.parse({}, lines);
                const tables = parsed.tables;
                const query = parsed.query;
                const resultTables = parsed.resultTables;

                for (let table of tables) pageHtml += `<div class="table-paper">${table.renderAsTable(true)}</div>`;
                pageHtml += `<p>${query}</p>`;
                for (let table of resultTables) pageHtml += `<div class="table-paper">${table.renderAsTable(true)}</div>`;
            } else if (line === "") {
                // Double line-break begins a new paragraph
                paragraphs.exit();
            } else {
                paragraphs.entry();
                pageHtml += line + " ";
            }
        }
        paragraphs.exit();
        return pageHtml;
    }
}

class BookParser extends Parser {
    async parse(context, lines) {
        const book = {
            metadata: {},
            cover: "",
            pages: []
        };
        while (true) {
            let line = lines.shift();
            if (line === undefined) break;

            line = line.trim()
            if (line === 'METADATA {') {
                book.metadata = await PARSERS.METADATA.parse({}, lines);
            }
            if (line === 'COVER {') {
                book.cover = await PARSERS.COVER.parse({}, lines);
            }
            if (line === 'PAGE {') {
                book.pages.push(await PARSERS.PAGE.parse({}, lines));
            }
        }
        return book;
    }
}


const PARSERS = {
    BOOK: new BookParser(),
    METADATA: new MetaDataParser(),
    COVER: new CoverParser(),
    PAGE: new PageParser(),
    EXAMPLE: new ExampleParser(),
    TABLE: new TableParser(),
    QUERY: new QueryParser()
}

parseBook = lines => {
    return PARSERS.BOOK.tryToParse({}, lines);
}