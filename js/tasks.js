const Colors = {
    PURPLE: 'col-book-purple',
    BLUE: 'col-book-blue',
    GREEN: 'col-book-green',
    ORANGE: 'col-book-orange',
    MAGENTA: 'col-book-magenta',
    LIGHT_BLUE: 'col-book-light-blue',
    NONE: 'col-book-white'
}

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
            color: Colors.NONE,
            ...options
        });
    }

    render() {
        return `<div class="item${this.completed ? " done" : ""}" id="${this.item.id}" onclick="${this.item.onclick}">
                ${this.item.renderShowItem()}
                <i class="task-group-color fa fa-fw fa-2x fa-bookmark ${this.color}"></i>
                <p>${i18n.get(this.item.name)} ${!this.completed ? `<span class="col-light-green small">${this.xp}xp</span>` : ''}</p>
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
            color: Colors.NONE,
            tasks: [],
            newItem: true,
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
        if (selected) this.newItem = false;
        return `<div class="item${selected ? " highlighted" : ""}" id="${this.item.id}" onclick="${this.item.onclick}">
                ${this.item.renderShowItem()}
                ${this.newItem ? `<div class="new-item-highlight"><div class="burst-12"> </div></div>` : ''}
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

    static fromPlain = (name, lines, headers) => {
        return new QueryResult({
            name: name,
            header: headers ? headers : [],
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
    new Task({id: "001", color: Colors.PURPLE, xp: 25}),
    new Task({id: "002", color: Colors.PURPLE, xp: 25}),
    new Task({id: "003", color: Colors.PURPLE, xp: 50}),
    new Task({id: "004", color: Colors.BLUE, xp: 75}),
    new Task({id: "005", color: Colors.BLUE, xp: 75}),
    new Task({id: "006", color: Colors.BLUE, xp: 75}),
    new Task({id: "007", color: Colors.BLUE, xp: 75}),
    new Task({id: "008", color: Colors.BLUE, xp: 100}),
    new Task({id: "009", color: Colors.GREEN, xp: 75}),
    new Task({id: "010", color: Colors.GREEN, xp: 75}),
    new Task({id: "011", color: Colors.GREEN, xp: 75}),
    new Task({id: "012", color: Colors.GREEN, xp: 100}),
    new Task({id: "013", color: Colors.PURPLE, xp: 100}),
    new Task({id: "014", color: Colors.PURPLE, xp: 100}),
];
const tasks = {};

for (let task of taskList) {
    tasks[task.id] = task;
}

const taskGroups = {
    lookupTaskGroupWithTaskId(taskID) {
        for (let taskGroup of Object.values(this)) {
            if (taskGroup instanceof TaskGroup && taskGroup.tasks.includes(taskID)) return taskGroup;
        }
        return null;
    },
    "001": new TaskGroup({
        id: '001',
        item: new ImageItem({
            id: `task-group-001`,
            name: `i18n-group-001-name`,
            onclick: `showTaskGroup('001')`,
            url: './css/scrolls.png',
            margins: "m-2"
        }),
        showItemOnUnlock: false,
        unlocked: true,
        color: Colors.PURPLE,
        tasks: ['001', '002', '003'],
        newItem: false
    }),
    "002": new TaskGroup({
        id: '002',
        showItemOnUnlock: true,
        unlocked: false,
        color: Colors.BLUE,
        tasks: ['004', '005', '006', '007', '008']
    }),
    "003": new TaskGroup({
        id: '003',
        showItemOnUnlock: true,
        unlocked: false,
        color: Colors.GREEN,
        tasks: ['010', '011', '009', '012']
    }),
    "004": new TaskGroup({
        id: '004',
        showItemOnUnlock: false,
        unlocked: false,
        color: Colors.PURPLE,
        tasks: ['013', '014']
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

function isArrayEqual(a, b) {
    if (a.length !== b.length) return false;
    const c = [...a], d = [...b];
    if (!latestTask.strict) {
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

function parseTask(data) {
    const lines = data.split("\n");
    const Modes = {
        NOOP: 0,
        TASK: 1,
        TABLES: 2,
        TEST: 3,
        RESULT: 4
    }
    let mode = Modes.NOOP;
    const rawTask = {
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
            rawTask.tests.push([]);
            rawTask.results.push([]);
            rawTask.testCount++;
        } else if (line === "RESULT") {
            mode = Modes.RESULT;
        } else if (line === "STRICT") {
            rawTask.strict = true;
        } else if (line === "") {
            // Ignore empty lines
        } else {
            if (mode === Modes.TABLES) {
                rawTask.tables.push(line);
            } else if (mode === Modes.TEST) {
                rawTask.tests[rawTask.testCount - 1].push(line);
            } else if (mode === Modes.RESULT) {
                rawTask.results[rawTask.testCount - 1].push(line);
            }
        }
    }
    return rawTask;
}

// TODO Remove need for this global variable
let latestTask = null;

function readTask(file) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    latestTask = parseTask(xhr.responseText);
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
    for (let line of latestTask.tables) {
        context += line;
        const tableName = line.split(" ")[2];
        latestTask.tableNames.push(tableName);
    }
    for (let line of latestTask.tests[0]) {
        context += line;
    }

    const queries = latestTask.tableNames.map(name => "SELECT * FROM " + name + ";").join('');
    return runSQL(context, queries)
        .then(resultSets => {
            if (!resultSets.length) return [];
            const queryResults = [];
            for (let i = 0; i < resultSets.length; i++) {
                queryResults.push(QueryResult.fromResultSet(latestTask.tableNames[i], resultSets[i]))
            }
            return queryResults;
        });
}

function getTestCount() {
    return latestTask.tests.length;
}

function runQueryTest(testIndex) {
    const query = document.getElementById('query-input').value.trim();
    const test = latestTask.tests[testIndex];
    const wantedResult = latestTask.results[testIndex];
    return testQuery(query, test, QueryResult.fromPlain("Haluttu tulos", wantedResult))
}

function testQuery(query, test, expected) {
    if (query.length === 0 || query === i18n.get("i18n-query-placeholder")) return {
        correct: false,
        table: undefined,
        wanted: expected
    };

    let context = "";
    for (let statement of latestTask.tables) {
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