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
                url: './img/scroll.png'
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

    async completeTask() {
        if (this.completed) return;
        this.completed = true;
        if (DISPLAY_STATE.currentTask === this) updateTaskCompleteText();
        inventory.update();
        updateTaskGroupTasks();
        document.getElementById('task-view').insertAdjacentHTML('afterend', '<i id="star-animated" class="fa fa-star col-yellow star-animation hidden"></i>');
        const animatedStar = document.getElementById('star-animated');
        await moveStarPath('star-animated');
        animatedStar.remove();
        updateCompletionIndicator();
        shakeElement('star-indicator')
        shootConfetti(200, 2);
        await checkGoal();
    }

    getNumericID() {
        let taskID = this.id;
        if (taskID.startsWith('task-')) taskID = taskID.substring(5);
        return parseInt(taskID);
    }
}

class TaskGroup extends ItemType {
    constructor(options) {
        super({
            item: new ImageItem({
                id: `task-group-${options.id}`,
                name: `i18n-group-${options.id}-name`,
                onclick: `showTaskGroup('${options.id}')`,
                url: './img/scrolls.png',
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

const tasks = {
    loaded: false,
    asList() {
        return Object.values(this).filter(obj => obj instanceof Task);
    },
    getIDs() {
        return Object.keys(this).filter(key => this[key] instanceof Task);
    }
};

async function loadTasks() {
    for (let level of progression) {
        for (let taskID of level.tasks) {
            try {
                const task = new Task({parsed: await parseTaskFrom(`tasks/fi/task-${taskID}.task`)});
                tasks[task.id] = task;
            } catch (e) {
                console.warn(`Task by id ${taskID} not found: ${e}`);
            }
        }
    }
    tasks.loaded = true;
}

const taskGroups = {
    asList() {
        return Object.values(this).filter(obj => obj instanceof TaskGroup);
    },
    lookupTaskGroupWithTaskId(taskID) {
        for (let taskGroup of this.asList()) {
            if (taskGroup.tasks.includes(taskID)) return taskGroup;
        }
        return null;
    },
    getCompletedTaskCount() {
        return this.asList()
            .map(taskGroup => taskGroup.getCompletedTaskCount())
            .reduce((total, num) => total + num, 0)
    },
    getTaskCount() {
        return this.asList()
            .map(taskGroup => taskGroup.getTaskCount())
            .reduce((total, num) => total + num, 0)
    }
};

/* Based on code from https://github.com/pllk/sqltrainer */

async function queryAllContentsOfTables(context, tableNames) {
    const queries = tableNames.map(name => "SELECT * FROM " + name + ";").join('');
    const resultSets = await runSQL(context, queries)
    if (!resultSets.length) return [];
    const queryResults = [];
    for (let i = 0; i < resultSets.length; i++) {
        queryResults.push(Table.fromResultSet(tableNames[i], resultSets[i]))
    }
    return queryResults;
}

function updateCompletionIndicator() {
    const indicator = document.getElementById('star-indicator');
    if (indicator) {
        const stars = taskGroups.getCompletedTaskCount();
        const outOf = taskGroups.getTaskCount();
        indicator.innerHTML = `<i class="fa fa-star col-yellow"></i> ${stars} / ${outOf}`
    }
}

async function runQueryTests() {
    const query = document.getElementById('query-input').value.trim();
    animateFlame();
    const results = await DISPLAY_STATE.currentTask.runTests(query);

    let renderedResults = "";
    let allCorrect = true;

    for (let result of results) {
        if (!result.correct) allCorrect = false;
        renderedResults += result.render();
    }

    let attempt = 1;
    // TODO Not called yet, original course in progress.
    tryToSaveQuizAnswer = async () => {
        if (MOOC.loginStatus === LoginStatus.LOGGED_IN) {
            try {
                await MOOC.quizzesSend(DISPLAY_STATE.currentTask, query, allCorrect)
            } catch (e) {
                attempt++;
                if (attempt <= 3) {
                    await tryToSaveQuizAnswer();
                } else {
                    showError("Failed to send answer to server, " + e)
                }
            }
        }
    }

    document.getElementById("query-out-table").innerHTML = renderedResults;
    if (allCorrect && DISPLAY_STATE.currentTask) {
        await DISPLAY_STATE.currentTask.completeTask();
    }
}