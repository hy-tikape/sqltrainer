class Parser {
    async parse(context, lines) {
        return {result: {}, leftover: lines}
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
        }
        return {result: metadata, leftover: lines};
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
        return {result: coverText.substr(1), leftover: lines};
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
        return {result: Table.fromPlain(tableName, rows, columnNames.split("|")), leftover: lines};
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

        return {result: {query, resultTables}, leftover: lines};
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
                const parsed = PARSERS.TABLE.parse({}, lines);
                result.tables.push(parsed.result);
                lines = parsed.leftover;
            }
            if (line === 'QUERY {') {
                const parsed = await PARSERS.QUERY.parse({tables: result.tables}, lines);
                result.query = parsed.result.query;
                result.resultTables.push(...parsed.result.resultTables);
                lines = parsed.leftover;
            }
        }
        return {result, leftover: lines};
    }
}

class PageParser extends Parser {
    async parse(context, lines) {
        let pageHtml = ``;
        let inParagraph = false;
        while (true) {
            const line = lines.shift().trim();
            if (line === '}') break;
            if (line === 'EXAMPLE {') {
                const parsed = await PARSERS.EXAMPLE.parse({}, lines);
                const tables = parsed.result.tables;
                const query = parsed.result.query;
                const resultTables = parsed.result.resultTables;
                if (inParagraph) {
                    pageHtml += `</p>`;
                    inParagraph = false;
                }
                for (let table of tables) pageHtml += table.renderAsTable(true);
                pageHtml += `<p>${query}</p>`;
                for (let table of resultTables) pageHtml += table.renderAsTable(true);
            } else if (line === "" && inParagraph) {
                pageHtml += `</p>`;
            } else {
                if (!inParagraph) pageHtml += `<p>`;
                pageHtml += line;
            }
        }
        return {result: pageHtml + (inParagraph ? `</p>` : ''), leftover: lines};
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
            const line = lines.shift()?.trim();
            if (line === undefined) break;
            if (line === 'METADATA {') {
                const parsed = await PARSERS.METADATA.parse({}, lines);
                book.metadata = parsed.result;
                lines = parsed.leftover;
            }
            if (line === 'COVER {') {
                const parsed = await PARSERS.COVER.parse({}, lines);
                book.cover = parsed.result;
                lines = parsed.leftover;
            }
            if (line === 'PAGE {') {
                const parsed = await PARSERS.PAGE.parse({}, lines);
                book.pages.push(parsed.result);
                lines = parsed.leftover;
            }
        }
        return {result: book, leftover: lines};
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
    return PARSERS.BOOK.parse({}, lines);
}