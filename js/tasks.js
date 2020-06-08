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
            completed: false,
            color: Colors.NONE,
            ...options
        });
    }

    render() {
        return `<div class="item${this.completed ? " done" : ""}" id="${this.item.id}" onclick="${this.item.onclick}">
                ${this.item.renderShowItem()}
                <i class="task-group-color fa fa-fw fa-2x fa-bookmark ${this.color}"></i>
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
            unlocked: false,
            color: Colors.NONE,
            tasks: [],
            newItem: true,

            onUnlock: async () => inventory.addItem(`task-group-${options.id}`),
            ...options
        });
    }

    getCompletedTaskCount() {
        return this.tasks.filter(taskID => tasks[taskID].completed).length;
    }

    getTaskCount() {
        return this.tasks.length;
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

class Table {
    constructor({name, header, rows}) {
        this.name = name;
        this.header = header;
        this.rows = rows;
    }

    static fromResultSet = (name, resultSet) => {
        return new Table({
            name: name,
            header: [...resultSet.columns],
            rows: resultSet.values
        });
    }

    static fromPlain = (name, lines, headers) => {
        return new Table({
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

    asQueries() {
        const columnTypes = [];
        const firstRow = this.rows[0];
        for (let i = 0; i < firstRow.length; i++) {
            const value = firstRow[i];
            if (isNaN(value)) {
                columnTypes[i] = "TEXT";
            } else {
                columnTypes[i] = "NUMBER";
            }
        }

        let columns = [];
        for (let i = 0; i < this.header.length; i++) {
            columns.push(this.header[i] + " " + columnTypes[i]);
        }

        const queries = [];
        // example: CREATE TABLE Table (col1 TEXT, col2 NUMBER);
        queries.push(`CREATE TABLE ${this.name} (${columns.join(',')});`)
        for (let row of this.rows) {
            const valuesWithTypes = [];
            for (let i = 0; i < row.length; i++) {
                // Adds 'value' if TEXT and escapes ' if necessary, otherwise value (assuming number)
                valuesWithTypes.push(columnTypes[i] === "TEXT" ? `'${row[i].split("'").join("\\''")}'` : row[i]);
            }
            // example: INSERT INTO Table (col1, col2) VALUES ("value", 0);
            queries.push(`INSERT INTO ${this.name} (${this.header.join(',')}) VALUES (${valuesWithTypes.join(',')});`);
        }
        return queries;
    }

    isEqual(queryResult) {
        if (!queryResult instanceof Table) return false;
        return isArrayEqual(this.rows, queryResult.rows);
    }
}

const taskList = [
    new Task({id: "001", color: Colors.PURPLE}),
    new Task({id: "002", color: Colors.PURPLE}),
    new Task({id: "003", color: Colors.PURPLE}),
    new Task({id: "004", color: Colors.BLUE}),
    new Task({id: "005", color: Colors.BLUE}),
    new Task({id: "006", color: Colors.BLUE}),
    new Task({id: "007", color: Colors.BLUE}),
    new Task({id: "008", color: Colors.BLUE}),
    new Task({id: "009", color: Colors.GREEN}),
    new Task({id: "010", color: Colors.GREEN}),
    new Task({id: "011", color: Colors.GREEN}),
    new Task({id: "012", color: Colors.GREEN}),
    new Task({id: "013", color: Colors.PURPLE}),
    new Task({id: "014", color: Colors.PURPLE}),
    new Task({id: "015", color: Colors.ORANGE}),
    new Task({id: "016", color: Colors.ORANGE}),
    new Task({id: "017", color: Colors.ORANGE}),
    new Task({id: "018", color: Colors.ORANGE}),
    new Task({id: "019", color: Colors.ORANGE}),
    new Task({id: "020", color: Colors.ORANGE}),
    new Task({id: "021", color: Colors.ORANGE}),
    new Task({id: "022", color: Colors.ORANGE}),
    new Task({id: "023", color: Colors.GREEN}),
    new Task({id: "024", color: Colors.GREEN}),
    new Task({id: "025", color: Colors.GREEN}),
    new Task({id: "026", color: Colors.PURPLE}),
    new Task({id: "027", color: Colors.PURPLE}),
    new Task({id: "028", color: Colors.PURPLE}),
    new Task({id: "029", color: Colors.PURPLE}),
    new Task({id: "030", color: Colors.PURPLE}),
    new Task({id: "031", color: Colors.PURPLE}),
    new Task({id: "032", color: Colors.PURPLE}),
    new Task({id: "033", color: Colors.PURPLE}),
    new Task({id: "034", color: Colors.PURPLE}),
    new Task({id: "035", color: Colors.LIGHT_BLUE}),
    new Task({id: "036", color: Colors.LIGHT_BLUE}),
    new Task({id: "037", color: Colors.LIGHT_BLUE}),
    new Task({id: "038", color: Colors.LIGHT_BLUE}),
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
    "A": new TaskGroup({
        id: 'A',
        item: new ImageItem({
            id: `task-group-A`,
            name: `i18n-group-A-name`,
            onclick: `showTaskGroup('A')`,
            url: './css/scrolls.png',
            margins: "m-2"
        }),
        unlocked: true,
        color: Colors.PURPLE,
        tasks: ['001', '002', '003'],
    }),
    "B": new TaskGroup({
        id: 'B',
        color: Colors.BLUE,
        tasks: ['004', '005', '006', '007', '008']
    }),
    "C": new TaskGroup({
        id: 'C',
        color: Colors.GREEN,
        tasks: ['010', '011', '009', '012'],
    }),
    "D": new TaskGroup({
        id: 'D',
        color: Colors.PURPLE,
        tasks: ['013', '014'],
    }),
    "E": new TaskGroup({
        id: 'E',
        color: Colors.ORANGE,
        tasks: ['015', '016', '017', '018', '019', '020', '021', '022'],
    }),
    "F": new TaskGroup({
        id: 'F',
        color: Colors.GREEN,
        tasks: ['023', '024', '025'],
    }),
    "G": new TaskGroup({
        id: 'G',
        color: Colors.PURPLE,
        tasks: ['026', '027', '028', '029', '030', '031', '032', '033', '034'],
    }),
    "H": new TaskGroup({
        id: 'H',
        color: Colors.LIGHT_BLUE,
        tasks: ['035', '036', '037', '038'],
    }),
};

/* Based on code from https://github.com/pllk/sqltrainer */

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

function parseTask(lines) {
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

async function readTask(file) {
    const lines = await readLines(file);
    latestTask = parseTask(lines);
    return processTask();
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
                queryResults.push(Table.fromResultSet(latestTask.tableNames[i], resultSets[i]))
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
    return testQuery(query, test, Table.fromPlain(i18n.get("i18n-wanted-table-result"), wantedResult))
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
        const got = Table.fromResultSet(i18n.get("i18n-table-result"), resultSet[0]);
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
    await addToTaskCounter();
}

runQueryTests = async () => {
    let renderedResults = "";
    let allCorrect = true;
    animateFlame();
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

animateFlame = async () => {
    document.getElementById("task-descriptor-flame").style.animation = "explode 1.2s";
    await delay(1200);
    document.getElementById("task-descriptor-flame").style.animation = "";
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