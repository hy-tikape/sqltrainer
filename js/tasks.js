class Task extends ItemType {
    /**
     * @param options {id, item, sql}
     */
    constructor(options) {
        super({
            item: new ImageItem({
                id: `task-${options.id}`,
                name: `i18n-task-${options.id}-name`,
                onclick: `showTask('${options.id}')`,
                url: './css/scroll.png'
            }),
            sql: `task${options.id}.txt`,
            description: `i18n-task-${options.id}-description`,
            xp: 50,
            completed: false,
            ...options
        });
    }

    render() {
        return `<div class="item${this.completed ? " done" : ""}" id="${this.item.id}" onclick="${this.item.onclick}">
                ${this.item.renderShowItem()}
                <p>${i18n.get(this.item.name)}</p>
            </div>`
    }
}

class TaskGroup extends ItemType {
    constructor(options) {
        super({
            item: new ImageItem({
                id: `task-group-${options.id}`,
                name: `i18n-group-${options.id}-name`,
                onclick: `showTaskGroup('${options.id}')`,
                url: './css/scrolls.png',
                margins: "m-2",
            }),
            requiredForUnlock: 0,
            unlocked: false,
            color: 'purple',
            tasks: [],
            onUnlock: async () => {
                inventory.addItem(`task-group-${options.id}`)
                if (options.showItemOnUnlock) await showItem(`item-unlock-tasks`);
            },
            ...options
        });
    }

    render() {
        const completed = this.tasks.filter(taskID => tasks[taskID] && tasks[taskID].completed).length;
        const outOf = this.tasks.length;
        const completedIcon = outOf <= completed ? "<i class='fa fa-fw fa-star col-yellow'></i>" : '';
        const selected = DISPLAY_STATE.currentTaskGroup && DISPLAY_STATE.currentTaskGroup.item.id === this.item.id;
        return `<div class="item${selected ? " highlighted" : ""}" id="${this.item.id}" onclick="${this.item.onclick}">
                ${this.item.renderShowItem()}
                <p>${i18n.get(this.item.name)}<br>${completedIcon} ${completed} / ${outOf}</p>
            </div>`
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

const taskList = [
    new Task({id: "001"}),
    new Task({id: "002"}),
    new Task({id: "003"}),
    new Task({id: "004"}),
    new Task({id: "005"}),
    new Task({id: "006", xp: 75}),
    new Task({id: "007", xp: 75}),
    new Task({id: "008", xp: 100}),
    new Task({id: "009", xp: 100}),
    new Task({id: "010", xp: 100}),
    new Task({id: "011", xp: 100}),
    new Task({id: "012", xp: 100}),
    new Task({id: "013", xp: 100}),
];
const tasks = {};

for (let task of taskList) {
    tasks[task.id] = task;
}

const taskGroups = {
    "001": new TaskGroup({
        id: '001',
        item: new ImageItem({
            id: `task-group-001`,
            name: `i18n-group-001-name`,
            onclick: `showTaskGroup('001')`,
            url: './css/scrolls.png',
            margins: "m-2"
        }),
        requiredForUnlock: 0,
        showItemOnUnlock: false,
        unlocked: true,
        color: 'purple',
        tasks: ['001', '002', '003']
    }),
    "002": new TaskGroup({
        id: '002',
        requiredForUnlock: 3,
        showItemOnUnlock: true,
        unlocked: false,
        color: 'blue',
        tasks: ['004', '005', '006', '007', '008']
    }),
    "003": new TaskGroup({
        id: '003',
        requiredForUnlock: 7,
        showItemOnUnlock: true,
        unlocked: false,
        color: 'green',
        tasks: ['009', '010', '011']
    }),
    "004": new TaskGroup({
        id: '004',
        requiredForUnlock: 7,
        showItemOnUnlock: false,
        unlocked: false,
        color: 'pink',
        tasks: ['012', '013']
    })
};

/* Based on code from https://github.com/pllk/sqltrainer */

function runSQL(context, query) {
    const config = {locateFile: filename => `dist/${filename}`};
    // Might throw an exception, user of this Promise must handle the error
    return initSqlJs(config).then(SQL => {
        const db = new SQL.Database();
        try {
            db.run(context);
            return db.exec(query);
        } finally {
            db.close();
        }
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
    if (query.length === 0 || query === i18n.get("i18n-query-placeholder")) return {
        correct: false,
        table: undefined,
        wanted: expected
    };

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

completeTask = async (task) => {
    if (task.completed) return;
    task.completed = true;
    updateTaskCompleteText();
    inventory.update(); // TODO make items have parent that is updated
    updateTaskGroupTasks();
    shootConfetti(200, 2)
    await delay(500);
    await addXp(task.xp ? task.xp : 0);
    await checkUnlock();
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
    if (allCorrect && !DISPLAY_STATE.currentTask.completed) {
        await completeTask(DISPLAY_STATE.currentTask);
    }
}

renderResult = result => {
    if (!result.table) {
        return `<div class="row justify-content-md-center">
            <div class="table-paper"><i class="col-red">${i18n.get("i18n-write-query-first")}</i></div>
            <div class="paper-green table-paper">${result.wanted.renderAsTable()}</div></div></div>`
    } else {
        return `<div class="row justify-content-md-center">
            <div class="table-paper">${result.table.renderAsTable()}
            ${result.correct ? '<p class="col-green">Oikein</p>' : '<p class="col-red">Väärin</p>'}
            </div>
            <div class="paper-green table-paper">${result.wanted.renderAsTable()}</div></div></div>`
    }
}

checkUnlock = async () => {
    const completed = Object.values(tasks).filter(task => task.completed).length;
    for (let taskGroup of Object.values(taskGroups)) {
        if (!taskGroup.unlocked && taskGroup.requiredForUnlock && taskGroup.requiredForUnlock <= completed) {
            await discover(taskGroup.item.id);
            taskGroup.unlocked = true;
        }
    }
}