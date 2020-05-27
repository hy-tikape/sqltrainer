class Task {
    /**
     * @param options {id, item, sql}
     */
    constructor(options) {
        const withDefaults = {
            item: new ImageItem({
                id: `task-${options.id}`,
                name: `i18n-task-${options.id}-name`,
                onclick: `showTask('${options.id}')`,
                url: './css/scroll.png'
            }),
            sql: `task${options.id}.txt`,
            description: `i18n-task-${options.id}-description`,
            xp: 50,
            ...options
        }
        for (let key of Object.keys(withDefaults)) {
            this[key] = withDefaults[key];
        }
    }
}

class QueryResult {
    constructor({name, header, rows}) {
        this.name = name;
        this.header = header;
        this.rows = rows;
    }

    static fromResultSet = (name, resultSet) => {
        return new QueryResult({
            name: name,
            header: [...resultSet.columns],
            rows: resultSet.values
        });
    }

    static fromPlain = (name, lines) => {
        return new QueryResult({
            name: name,
            header: [],
            rows: lines.map(line => line.split('|'))
        })
    }

    renderAsTable(showHeaders) {
        if (this.rows.length === 0) {
            let table = "";
            table += `<i>${this.name}</i>`;
            table += `<table><tr><td>(${i18n.get('i18n-empty-table')})</td></tr></table>`;
            return table;
        }
        let table = "";
        table += `<i>${this.name}</i>`;
        table += "<table>";
        if (showHeaders) {
            table += "<thead><tr>";
            for (let column of this.header) {
                table += `<th>${column}</th>`;
            }
            table += "</tr></thead>";
        }
        table += "<tbody>";
        for (let row of this.rows) {
            table += "<tr>";
            for (let value of row) {
                table += `<td>${value}</td>`;
            }
            table += "</tr>";
        }
        table += "</tbody></table>";
        return table;
    }

    renderAsPlain() {
        const lines = [];
        for (let row of this.rows) {
            lines.push(row.join('|'));
        }
        return lines;
    }

    isEqual(queryResult) {
        if (!queryResult instanceof QueryResult) return false;
        return isArrayEqual(this.rows, queryResult.rows);
    }
}

const tasks = {
    "001": new Task({id: "001", xp: 50}),
    "002": new Task({id: "002", xp: 50}),
    "003": new Task({id: "003", xp: 50}),
    "004": new Task({id: "004"}),
    "005": new Task({id: "005"}),
};

const taskGroups = {
    "001": {
        name: 'i18n-group-001-name',
        color: 'purple',
        tasks: ['001', '002', '003']
    },
    "002": {
        name: 'i18n-group-002-name',
        color: 'green',
        tasks: ['004', '005']
    }
};

const completedTasks = [];

/* Base code from https://github.com/pllk/sqltrainer */

function runSQL(context, query) {
    config = {locateFile: filename => `dist/${filename}`};

    // Might throw an exception, user of this Promise must handle the error
    return initSqlJs(config).then(SQL => {
        const db = new SQL.Database();
        db.run(context);
        return db.exec(query);
    });
}

let strict;

function isArrayEqual(a, b) {
    if (a.length !== b.length) return false;
    const c = [...a], d = [...b];
    if (!strict) {
        c.sort();
        d.sort();
    }
    for (let i = 0; i < a.length; i++) {
        if (c[i] instanceof Array) {
            if (!isArrayEqual(c[i], d[i])) return false;
        } else if (c[i] != d[i]) { // Result set might parse integers, but text parsing uses Strings.
            return false;
        }
    }
    return true;
}

var tableNames, tables, tests, results;
function parseTask(data) {
    // TODO Rewrite to not store things in global variables
    const lines = data.split("\n");
    let mode = 0;
    tables = [];
    tableNames = [];
    tests = [];
    results = [];
    strict = false;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === "TASK") {
            mode = 1;
        } else if (line === "TABLES") {
            mode = 2;
        } else if (line === "TEST") {
            mode = 3;
            tests.push([]);
            results.push([]);
        } else if (line === "RESULT") {
            mode = 4;
        } else if (line === "STRICT") {
            strict = true;
        } else if (line === "") {
        } else {
            if (mode === 1) {
                // noop
            } else if (mode === 2) {
                tables.push(line);
            } else if (mode === 3) {
                tests[tests.length - 1].push(line);
            } else if (mode === 4) {
                results[tests.length - 1].push(line);
            }
        }
    }
}

function readTask(file) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    parseTask(xhr.responseText);
                    my_test = my_table = 0;
                    processTask().then(resolve).catch(reject);
                } else {
                    reject(`Bad response code '${xhr.status}' for file '${file}'`);
                }
            }
        }
        xhr.open("GET", file);
        xhr.send();
    })
}

var my_test, my_table;

function processTask() {
    let context = "";
    for (let line of tables) {
        context += line;
        const tableName = line.split(" ")[2];
        tableNames.push(tableName);
    }
    for (let line of tests[0]) {
        context += line;
    }

    const queries = tableNames.map(name => "SELECT * FROM " + name + ";");
    const resultSets = [];
    const promises = queries.map(query => runSQL(context, query).then(result => resultSets.push(result[0])));
    return new Promise(((resolve, reject) => Promise.allSettled(promises)
        .then(([result]) => {
            if (!result) return resolve([]);
            if (result.reason) {
                reject(result.reason);
                return;
            }
            const queryResults = [];
            for (let i = 0; i < resultSets.length; i++) {
                queryResults.push(QueryResult.fromResultSet(tableNames[i], resultSets[i]))
            }
            return resolve(queryResults);
        })));
}

function getTestCount() {
    return tests.length;
}

function runQueryTest(testIndex) {
    const query = document.getElementById('query-input').value.trim();
    const test = tests[testIndex];
    const wantedResult = results[testIndex];
    return testQuery(query, test, QueryResult.fromPlain("Haluttu tulos", wantedResult))
}

function testQuery(query, test, expected) {
    if (query.length === 0) return [];

    let context = "";
    for (let statement of tables) {
        context += statement;
    }
    for (let statement of test) {
        context += statement;
    }
    return runSQL(context, query).then(resultSet => {
        const got = QueryResult.fromResultSet("Tulos", resultSet[0]);
        return {
            correct: expected.isEqual(got),
            table: got,
            wanted: expected
        };
    });
}

runQueryTests = async () => {
    let renderedResults = "";
    let allCorrect = true;
    for (let i = 0; i < getTestCount(); i++) {
        try {
            const result = await runQueryTest(i);
            if (!result.correct) allCorrect = false;
            renderedResults += renderResult(result);
        } catch (e) {
            console.error(e);
            allCorrect = false;
            renderedResults += `<div class="table-paper"><p class="col-red">${e}</p></div>`;
        }
    }
    document.getElementById("query-out-table").innerHTML = renderedResults;
    if (allCorrect) {
        shootConfetti(200)
    }
}