const Colors = {
    PURPLE: 'col-book-purple',
    BLUE: 'col-book-blue',
    GREEN: 'col-book-green',
    ORANGE: 'col-book-orange',
    MAGENTA: 'col-book-magenta',
    LIGHT_BLUE: 'col-book-light-blue',
    NONE: 'col-book-white'
}

class Result {
    constructor(options) {
        this.table = options.table;
        this.error = options.error;
        this.wanted = options.wanted;
        this.correct = options.correct;
    }

    render() {
        if (this.error) {
            return `<div class="table-paper"><p class="col-red">${this.error}</p></div>`;
        } else if (!this.table) {
            return `<div class="row justify-content-md-start">
            <div class="table-paper"><i class="col-red">${i18n.get("i18n-write-query-first")}</i></div>
            <div class="paper-green table-paper">${this.wanted.renderAsTable()}</div>
            </div>`
        } else {
            return `<div class="row justify-content-md-center">
            <div class="table-paper">${this.table.renderAsTable()}
            ${this.correct ? `<p class="col-green">${i18n.get('correct')}</p>` : `<p class="col-red">${i18n.get('incorrect')}</p>`}
            </div>
            <div class="paper-green table-paper">${this.wanted.renderAsTable()}</div>
            </div>`
        }
    }
}

class Task extends ItemType {
    /**
     * @param options {id, item, sql}
     */
    constructor(options) {
        super({
            completed: false,
            color: Colors.NONE,
            ...options
        });
        const parsed = options.parsed;
        if (parsed) {
            this.id = parsed.metadata.id;
            this.item = new ImageItem({
                id: this.id,
                name: parsed.metadata.name,
                onclick: `showTask('${this.id}')`,
                url: './css/scroll.png'
            });
            this.color = parsed.metadata.color && parsed.metadata.color.startsWith('col-book-') ? parsed.metadata.color : `col-book-${parsed.metadata.color}`;
            this.description = parsed.description;
            this.tests = parsed.tests;
        }
    }

    render() {
        return `<div class="item${this.completed ? " done" : ""}" id="${this.item.id}" onclick="${this.item.onclick}">
                ${this.item.renderShowItem()}
                <i class="task-group-color fa fa-fw fa-2x fa-bookmark ${this.color}"></i>
                <p>${i18n.get(this.item.name)}</p>
            </div>`
    }

    async renderTaskTables() {
        let taskTables;
        if (this.tests) {
            const firstTest = this.tests[0];
            if (firstTest) {
                taskTables = await queryAllContentsOfTables(firstTest.context, firstTest.contextTableNames)
            }
        } else {
            taskTables = await readTask(`./tasks/${this.sql}`);
        }
        return taskTables ? taskTables.map(table => `<div class="table-paper">${table.renderAsTable(true)}</div>`).join('') : '';
    }

    async runTests(query) {
        const results = [];
        for (let test of this.tests) {
            if (query.length === 0 || query === i18n.get("i18n-query-placeholder")) {
                results.push(new Result({
                    correct: false, wanted: test.result
                }));
                continue;
            }
            try {
                const resultSets = await runSQL(test.context, query);
                if (resultSets.length) {
                    const result = Table.fromResultSet(i18n.get("i18n-table-result"), resultSets[0]);
                    results.push(new Result({
                        correct: result.isEqual(test.result, test.strict), table: result, wanted: test.result,
                    }));
                } else {
                    results.push(new Result({
                        correct: false, error: 'Kysely ei vastannut yhtään riviä.', wanted: test.result
                    }));
                }
            } catch (e) {
                results.push(new Result({
                    correct: false, error: e, wanted: test.result
                }));
            }
        }
        return results;
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
        this.tasks = this.tasks.map(task => `task-${task}`);
    }

    getCompletedTaskCount() {
        return this.tasks.filter(taskID => tasks[taskID] && tasks[taskID].completed).length;
    }

    getTaskCount() {
        return this.tasks.filter(taskID => tasks[taskID]).length;
    }

    render() {
        const completed = this.getCompletedTaskCount();
        const outOf = this.getTaskCount();
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

    isEqual(queryResult, strict) {
        if (!queryResult instanceof Table) return false;
        return isArrayEqual(this.rows, queryResult.rows, strict);
    }
}

const tasks = {};

loadTasks = async () => {
    const taskList = [
        new Task({parsed: await parseTaskFrom(`tasks/fi/task-001.task`)}),
        new Task({parsed: await parseTaskFrom(`tasks/fi/task-002.task`)}),
        new Task({parsed: await parseTaskFrom(`tasks/fi/task-003.task`)}),
        new Task({parsed: await parseTaskFrom(`tasks/fi/task-004.task`)}),
        new Task({parsed: await parseTaskFrom(`tasks/fi/task-005.task`)}),
        new Task({parsed: await parseTaskFrom(`tasks/fi/task-006.task`)}),
        new Task({parsed: await parseTaskFrom(`tasks/fi/task-007.task`)}),
        new Task({parsed: await parseTaskFrom(`tasks/fi/task-008.task`)}),
        new Task({parsed: await parseTaskFrom(`tasks/fi/task-009.task`)}),
        new Task({parsed: await parseTaskFrom(`tasks/fi/task-010.task`)}),
        new Task({parsed: await parseTaskFrom(`tasks/fi/task-011.task`)}),
        new Task({parsed: await parseTaskFrom(`tasks/fi/task-012.task`)}),
        new Task({parsed: await parseTaskFrom(`tasks/fi/task-013.task`)}),
        new Task({parsed: await parseTaskFrom(`tasks/fi/task-014.task`)}),
        new Task({parsed: await parseTaskFrom(`tasks/fi/task-015.task`)}),
        new Task({parsed: await parseTaskFrom(`tasks/fi/task-016.task`)})
    ];

    for (let task of taskList) {
        tasks[task.id] = task;
    }
}
const taskGroups = {
    lookupTaskGroupWithTaskId(taskID) {
        for (let taskGroup of Object.values(this)) {
            if (taskGroup instanceof TaskGroup && taskGroup.tasks.includes(taskID)) return taskGroup;
        }
        return null;
    },
    getCompletedTaskCount() {
        return Object.values(this)
            .filter(obj => obj instanceof TaskGroup)
            .map(taskGroup => taskGroup.getCompletedTaskCount())
            .reduce((total, num) => total + num, 0)
    },
    getTaskCount() {
        return Object.values(this)
            .filter(obj => obj instanceof TaskGroup)
            .map(taskGroup => taskGroup.getTaskCount())
            .reduce((total, num) => total + num, 0)
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

function isArrayEqual(a, b, strict) {
    if (a.length !== b.length) return false;
    const c = [...a], d = [...b];
    if (!strict) {
        c.sort();
        d.sort();
    }
    for (let i = 0; i < a.length; i++) {
        if (c[i] instanceof Array) {
            if (!isArrayEqual(c[i], d[i], strict)) return false;
            // Result set might parse integers, but text parsing uses Strings, intentional type coercion.
        } else if (c[i] != d[i]) {
            return false;
        }
    }
    return true;
}

// TODO Remove need for this global variable
let latestTask = null;

async function readTask(file) {
    const lines = await readLines(file);
    latestTask = parseTaskLegacy(lines);
    return processTask();
}

queryAllContentsOfTables = async (context, tableNames) => {
    const queries = tableNames.map(name => "SELECT * FROM " + name + ";").join('');
    const resultSets = await runSQL(context, queries)
    if (!resultSets.length) return [];
    const queryResults = [];
    for (let i = 0; i < resultSets.length; i++) {
        queryResults.push(Table.fromResultSet(tableNames[i], resultSets[i]))
    }
    return queryResults;
};

processTask = async () => {
    let context = "";
    for (let line of latestTask.tables) {
        context += line;
        const tableName = line.split(" ")[2];
        latestTask.tableNames.push(tableName);
    }
    for (let line of latestTask.tests[0]) {
        context += line;
    }

    return await queryAllContentsOfTables(context, latestTask.tableNames);
};

updateCompletionIndicator = () => {
    const indicator = document.getElementById('star-indicator');
    if (indicator) {
        const stars = taskGroups.getCompletedTaskCount();
        const outOf = taskGroups.getTaskCount();
        indicator.innerHTML = `<i class="fa fa-star col-yellow"></i> ${stars} / ${outOf}`
    }
}

completeTask = async (task) => {
    if (task.completed) return;
    task.completed = true;
    updateTaskCompleteText();
    updateCompletionIndicator();
    inventory.update(); // TODO make items have parent that is updated
    updateTaskGroupTasks();
    shootConfetti(200, 2);
    await checkGoal();
}

runQueryTests = async () => {
    const query = document.getElementById('query-input').value.trim();
    animateFlame();
    const results = await DISPLAY_STATE.currentTask.runTests(query);

    let renderedResults = "";
    let allCorrect = true;

    for (let result of results) {
        if (!result.correct) allCorrect = false;
        renderedResults += result.render();
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