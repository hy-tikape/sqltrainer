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
            sql: `Task${options.id}.txt`,
            description: `i18n-task-${options.id}-description`,
            xp: 50,
            ...options
        }
        for (let key of Object.keys(withDefaults)) {
            this[key] = withDefaults[key];
        }
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

function renderTables(resultSets) {
    let html = "";
    for (let i = 0; i < resultSets.length; i++) {
        html += "<div class='table-paper'>" + renderTable(resultSets[i], tableNames[i]) + "</div>";
    }
    return html;
}

function renderTable(resultSet, name) {
    if (resultSet.length === 0) {
        let table = "";
        table += `<i>${name}</i>`;
        table += `<table><tr><td>(${i18n.get('i18n-empty-table')})</td></tr></table>`;
        return table;
    }
    let table = "";
    table += `<i>${name}</i>`;
    table += "<table>";
    table += "<tr>";
    for (let column of resultSet.columns) {
        table += `<th>${column}</th>`;
    }
    table += "</tr>";
    for (let row of resultSet.values) {
        table += "<tr>";
        for (let value of row) {
            table += `<td>${value}</td>`;
        }
        table += "</tr>";
    }
    table += "</table>";
    return table;
}

function renderPlain(data) {
    if (data.length === 0) return "";
    data = data[0];
    const lines = [];
    for (let i = 0; i < data.values.length; i++) {
        let line = "";
        for (let j = 0; j < data.values[i].length; j++) {
            if (j !== 0) line += "|";
            line += data.values[i][j];
        }
        lines.push(line);
    }
    return lines;
}

const showHeaders = true;

function renderResult(data, title, header) {
    let html = "";
    html += "<fieldset><legend><b>" + title + "</b></legend>";
    html += "<table>";
    if (!header && showHeaders) {
        html += "<tr>";
        for (var i = 0; i < header.length; i++) {
            html += "<th>" + header[i] + "</th>";
        }
        html += "</tr>";
    }
    for (var i = 0; i < data.length; i++) {
        html += "<tr>";
        const parts = data[i].split("|");
        for (let j = 0; j < parts.length; j++) {
            html += "<td>" + parts[j] + "</td>";
        }
        html += "</tr>";
    }
    html += "</table>";
    html += "</fieldset>";
    return html;
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
        if (c[i] !== d[i]) return false;
    }
    return true;
}

var tableNames;
let all_correct;

var tables, tests, results;

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
            if (result.reason) reject(result.reason);
            return resolve(renderTables(resultSets));
        })));
}

function checkTest() {
    let context = "";
    for (let statement of tables) {
        context += statement;
    }
    for (let statement of tests[my_test]) {
        context += statement;
    }
    const query = document.getElementById("query").value;
    if (query.trim() === "") return;
    runSQL(context, query).then(result => {
        console.log(result)
        console.log(renderTables(result));
    }).catch(error => {
        console.error(error);
    });
}

function check() {
    document.getElementById("verdict").innerHTML = "";
    document.getElementById("message").innerHTML = "";
    my_test = 0;
    all_correct = true;
    checkTest();
}

var my_task = 0;

