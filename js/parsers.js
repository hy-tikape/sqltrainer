class Parser {
    async tryToParse(context, lines) {
        try {
            return await this.parse(context, lines);
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

class StatementParser extends Parser {
    parse(context, lines) {
        let statements = "";
        while (true) {
            const line = lines.shift().trim();
            if (line === '}') break;
            statements += line;
        }
        const matches = statements.match(/CREATE TABLE .*? ?\(/g);
        return {sql: statements, tableNames: matches ? matches.map(match => match.split(" ")[2]) : []};
    }
}

class ResultParser extends Parser {
    parse(context, lines) {
        let plain = [];
        while (true) {
            const line = lines.shift().trim();
            if (line === '}') break;
            plain.push(line);
        }
        return Table.fromPlain(i18n.get("i18n-wanted-result"), plain);
    }
}

class LegacyParser extends Parser {
    parse(context, lines) {
        let legacyLines = [];
        while (true) {
            const line = lines.shift().trim();
            if (line === '}') break;
            legacyLines.push(line);
        }
        const legacyTask = parseTaskLegacy(legacyLines);
        const tests = [];
        for (let i = 0; i < legacyTask.tests.length; i++) {
            const test = {
                context: "",
                contextTableNames: [],
                strict: false,
                result: null
            };
            const tables = legacyTask.tables.join(" ");
            test.context = tables + legacyTask.tests[i].join(" ");
            test.result = Table.fromPlain(i18n.get("i18n-wanted-result"), legacyTask.results[i]);
            const matches = tables.match(/CREATE TABLE .*? ?\(/g);
            if (matches) test.contextTableNames.push(...matches.map(match => match.split(" ")[2]))
            tests.push(test);
        }
        return tests;
    }
}

function parseTaskLegacy(lines) {
    const Modes = {
        NOOP: 0,
        TASK: 1,
        TABLES: 2,
        TEST: 3,
        RESULT: 4
    }
    let mode = Modes.NOOP;
    const taskLegacy = {
        tables: [],
        tableNames: [],
        testCount: 0,
        tests: [],
        results: [],
        strict: false
    }
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === "TASK") {
            mode = Modes.NOOP;
        } else if (line === "TABLES") {
            mode = Modes.TABLES;
        } else if (line === "TEST") {
            mode = Modes.TEST;
            taskLegacy.tests.push([]);
            taskLegacy.results.push([]);
            taskLegacy.testCount++;
        } else if (line === "RESULT") {
            mode = Modes.RESULT;
        } else if (line === "STRICT") {
            taskLegacy.strict = true;
        } else if (line === "") {
            // Ignore empty lines
        } else {
            if (mode === Modes.TABLES) {
                taskLegacy.tables.push(line);
            } else if (mode === Modes.TEST) {
                taskLegacy.tests[taskLegacy.testCount - 1].push(line);
            } else if (mode === Modes.RESULT) {
                taskLegacy.results[taskLegacy.testCount - 1].push(line);
            }
        }
    }
    return taskLegacy;
}

class TestParser extends Parser {
    parse(context, lines) {
        const test = {
            context: "",
            contextTableNames: [],
            strict: false,
            result: null
        };
        while (true) {
            const line = lines.shift().trim();
            if (line === '}') break;
            if (line === 'TABLE {') {
                const table = PARSERS.TABLE.parse({}, lines);
                test.contextTableNames.push(table.name);
                test.context += table.asQueries().join('')
            }
            if (line === 'SQL {') {
                const parsed = PARSERS.SQL.parse({}, lines);
                test.contextTableNames.push(...parsed.tableNames);
                test.context += parsed.sql;
            }
            if (line === 'STRICT') test.strict = true;
            if (line === 'RESULT {') {
                test.result = PARSERS.RESULT.parse({}, lines);
            }
        }
        return test;
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
            query += line + " ";
        }

        const resultTables = [];
        try {
            const resultSets = await runSQL(queryContext, query)
            if (resultSets.length) {
                resultTables.push(Table.fromResultSet(i18n.get("i18n-table-result"), resultSets[0]))
            }
        } catch (e) {
            resultTables.push(Table.fromPlain("Virhe", ['' + e]))
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

class DescriptionParser extends Parser {
    parse(context, lines) {
        let descriptionHtml = ``;
        let paragraphs = {
            isIn: false,
            entry() {
                if (!this.isIn) {
                    descriptionHtml += `<p>`;
                    this.isIn = true;
                }
            },
            exit() {
                if (this.isIn) {
                    descriptionHtml += `</p>`;
                    this.isIn = false;
                }
            }
        };
        while (true) {
            const line = lines.shift().trim();
            if (line === '}') break;
            if (line === "") {
                // Double line-break begins a new paragraph
                paragraphs.exit();
            } else {
                paragraphs.entry();
                descriptionHtml += line + " ";
            }
        }
        paragraphs.exit();
        return descriptionHtml;
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

                for (let table of tables) pageHtml += `<div class="table-paper mb-3">${table.renderAsTable(true)}</div>`;
                pageHtml += `<p>${document.createTextNode(query).wholeText}</p>`;
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

class TaskParser extends Parser {
    parse(context, lines) {
        const task = {
            metadata: {},
            description: "",
            tests: []
        };
        while (true) {
            let line = lines.shift();
            if (line === undefined) break;

            line = line.trim()
            if (line === 'METADATA {') {
                task.metadata = PARSERS.METADATA.parse({}, lines);
            }
            if (line === 'DESCRIPTION {') {
                task.description = PARSERS.DESCRIPTION.parse({}, lines);
            }
            if (line === 'TEST {') {
                task.tests.push(PARSERS.TEST.parse({}, lines));
            }
            if (line === 'LEGACY {') {
                task.tests.push(...PARSERS.LEGACY.parse({}, lines));
            }
        }
        return task;
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
    QUERY: new QueryParser(),
    RESULT: new ResultParser(),
    SQL: new StatementParser(),
    LEGACY: new LegacyParser(),
    TEST: new TestParser(),
    DESCRIPTION: new DescriptionParser(),
    TASK: new TaskParser(),
}

parseBook = async lines => {
    return PARSERS.BOOK.tryToParse({}, lines);
}

parseBookFrom = async address => {
    return await parseBook(await readLines(address));
}

parseTask = async lines => {
    return PARSERS.TASK.tryToParse({}, lines);
}

parseTaskFrom = async address => {
    return await parseTask(await readLines(address));
}