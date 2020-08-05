/* Some code originally from https://github.com/pllk/sqltrainer */

const Colors = {
    PURPLE: 'col-book-purple',
    BLUE: 'col-book-blue',
    GREEN: 'col-book-green',
    ORANGE: 'col-book-orange',
    MAGENTA: 'col-book-magenta',
    LIGHT_BLUE: 'col-book-light-blue',
    NONE: 'col-book-white'
}

const tasks = {
    asList() {
        return Object.values(this).filter(obj => obj instanceof Task);
    },
    getIDs() {
        return Object.keys(this).filter(key => this[key] instanceof Task);
    }
};

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

/**
 * Results are used for notifying the user about their query.
 */
class Result {
    /**
     * Construct a new Result.
     *
     * table:   Table that was produced by the query.
     * error:   String, error message to show the user.
     * wanted:  Table that the Test wants.
     * correct: boolean, was the Result correct
     *
     * @param options {table, error, wanted, correct}
     */
    constructor(options) {
        this.source = options.source;
        this.table = options.table;
        this.error = options.error;
        this.wanted = options.wanted;
        this.correct = options.correct;
    }

    async render() {
        const sourceTables = await queryAllContentsOfTables(this.source.context, this.source.contextTableNames);
        if (this.error) {
            return `<div class="row justify-content-md-center">
                <div class="table-paper"><p class="col-red">${(this.error + "").split("Error").join(i18n.get("error"))}</p></div>
            </div>`;
        } else if (!this.table) {
            return `<div class="row justify-content-md-center">
                <div class="table-paper">
                    <p class="col-red">${i18n.get("i18n-write-query-first")}</p>
                </div>
            </div>`
        } else if (this.correct) {
            return `<div class="row justify-content-md-center">
            ${sourceTables.map(t => ` <div class="table-paper" aria-hidden="true">
                ${t.renderAsTable(true)}</div>`).join('')}
                <i class="fa fa-arrow-right col-yellow fa-fw" aria-hidden="true"></i>
                <div class="table-paper">
                    ${this.table.renderAsTable(true)}
                    <p class="col-green">${i18n.get('correct')}</p>
                </div>
            </div>`
        } else {
            return `<div class="row justify-content-md-center">
            ${sourceTables.map(t => ` <div class="table-paper" aria-hidden="true">
                ${t.renderAsTable(true)}</div>`).join('')}
                <i class="fa fa-arrow-right col-yellow fa-fw" aria-hidden="true"></i>
                <div class="table-paper">
                    ${this.table.renderAsTable(true)}
                    <p class="col-red">${i18n.get('incorrect')}</p>
                </div>
                <div class="paper-green table-paper">${this.wanted.renderAsTable(true)}</div>
            </div>`
        }
    }
}

/**
 * Represents a task a player needs to give query for.
 * @see LazyTask for a wrapper
 */
class Task extends ItemType {
    /**
     * Construct a new Task.
     *
     * parsed.metadata.id     ID of the task in tasks variable.
     * parsed.metadata.name   Name of the task that can be shown to the user.
     * parsed.metadata.color  Color of the book related to this task.
     * parsed.description     Instructions about how the task needs to be done.
     * parsed.tests           Test objects parsed by TestParser, used to test if the query for the task was correct.
     *
     * @param options {parsed: {metadata: {id, name, color}, description, tests}}
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
                name: `${i18n.getWith('task', [Task.getNumericID(this.id)])}`,
                onclick: `Views.TASK.show('${this.id}')`,
                url: './img/scroll.png'
            });
            this.color = parsed.metadata.color && parsed.metadata.color.startsWith('col-book-') ? parsed.metadata.color : `col-book-${parsed.metadata.color}`;
            this.description = parsed.description;
            this.tests = parsed.tests;
        }
    }

    render() {
        return `<button
                    id="${this.item.id}"
                    class="item${this.completed ? " done" : ""}"
                    onclick="${this.item.onclick}"
                    aria-label="task ${this.item.name} ${this.completed ? '(completed)' : ''}"
                >
                    ${this.item.renderShowItem()}
                    <i class="task-group-color fa fa-fw fa-2x fa-bookmark ${this.color}"></i>
                    <p>${i18n.get(this.item.name)}</p>
                </button>`
    }

    async renderTaskTables() {
        let taskTables;
        let wantedResult;
        if (this.tests) {
            const firstTest = this.tests[0];
            wantedResult = firstTest.result;
            if (firstTest) {
                taskTables = await queryAllContentsOfTables(firstTest.context, firstTest.contextTableNames);
            }
        }
        const tables = taskTables ? taskTables.map(table => `<div class="table-paper">${table.renderAsTable(true)}</div>`).join('') : '';
        return `${tables}
                <i class="fa fa-arrow-right col-yellow fa-fw"></i>
                <div class="paper-green table-paper">${wantedResult.renderAsTable()}</div>`;
    }

    async runTests(query) {
        const results = [];
        for (let test of this.tests) {
            const wanted = test.result;
            if (query.length === 0 || query === i18n.get("i18n-query-placeholder")) {
                results.push(new Result({source: test, correct: false, wanted}));
                continue;
            }
            if (query.split(';').length > 2) {
                results.push(new Result({
                    source: test,
                    correct: false,
                    error: i18n.get('multi-query-not-allowed'),
                    wanted
                }));
                continue;
            }
            if (test.denySubqueries && query.toUpperCase().split("SELECT").length > 2) {
                results.push(new Result({
                    source: test,
                    correct: false,
                    error: i18n.get('sub-query-not-allowed'),
                    wanted
                }));
                continue;
            }
            try {
                const resultSets = await runSQL(test.context, query);
                if (resultSets.length) {
                    const table = Table.fromResultSet(i18n.get("i18n-table-result"), resultSets[0]);
                    const correct = table.isEqual(wanted, test.strict);
                    results.push(new Result({source: test, correct, table, wanted}));
                } else {
                    results.push(new Result({source: test, correct: false, error: i18n.get('query-no-rows'), wanted}));
                }
            } catch (error) {
                results.push(new Result({source: test, correct: false, error, wanted}));
            }
        }
        return results;
    }

    async completeTask() {
        if (this.completed) return;
        const taskGroup = taskGroups.lookupTaskGroupWithTaskId(this.id);
        this.completed = true;
        inventory.update();
        await Views.INVENTORY.updateTaskGroup();
        const from = document.getElementById('query-run-button');
        const to = document.getElementById(DISPLAY_STATE.endgame ? 'task-flame-container' : 'star-indicator');
        const particle = flyStarFromTo('task-view', from, to);

        function frame(time) {
            particle.frame(time);
            if (particle.animated) {
                requestAnimationFrame(frame);
            } else {
                particle.element.remove();
            }
        }

        requestAnimationFrame(frame);

        await awaitUntil(() => !particle.animated);
        if (Views.TASK.currentTask && Views.TASK.currentTask.id === this.id) Views.TASK.updateTaskCompleteText();
        if (DISPLAY_STATE.endgame) {
            await Views.TASK.updateFlame();
            await Views.MAP.render();
        }
        shakeElement('star-indicator');
        showElement('correct-notification');
        updateCompletionIndicator();
        shootConfetti(200, 2);
        await taskGroup.checkGoal();
        await delay(2500);
        hideElement('correct-notification');
    }

    static getNumericID(from) {
        if (from.startsWith('task-')) from = from.substring(5);
        return parseInt(from);
    }

    getNumericID() {
        return Task.getNumericID(this.id);
    }
}

/**
 * Lazy-loaded version of Task that loads the task file on first call to any function.
 */
class LazyTask extends Task {
    constructor(id) {
        super({
            parsed: {metadata: {id}}
        });
        this.loaded = false;
        this.loadedTask = null;
    }

    async loadTask() {
        try {
            const loaded = new Task({parsed: await parseTaskFrom(`tasks/${currentLang}/${this.id}.task`)});
            loaded.completed = this.completed;
            this.loadedTask = loaded;
            this.loaded = true;

            this.color = loaded.color;
            this.description = loaded.description;
            this.tests = loaded.tests;
        } catch (e) {
            throw e;
        }
    }


    async render() {
        if (!this.loaded) await this.loadTask();
        return await this.loadedTask.render();
    }

    async renderTaskTables() {
        if (!this.loaded) await this.loadTask();
        return await this.loadedTask.renderTaskTables();
    }

    async runTests(query) {
        if (!this.loaded) await this.loadTask();
        return await this.loadedTask.runTests(query);
    }

    async completeTask() {
        this.completed = true;
        if (!this.loaded) await this.loadTask();
        return await this.loadedTask.completeTask();
    }
}

/**
 * Represents a group of tasks the player needs to complete.
 */
class TaskGroup extends ItemType {
    /**
     * Construct a new TaskGroup.
     *
     * id          ID in taskGroups variable
     * tasks       List of Task IDs, without 'task-' in front eg 000, 001 etc
     * unlocked    boolean, has this task group been unlocked
     * newItem     boolean, is this item new to the player
     * book        Book ID that is related to this TaskGroup
     * requires    Array of task group IDs that this task group requires for unlock
     * requiredBy  Array of task group IDs that this task group is required for
     *
     * @param options {id, tasks, unlocked, newItem, book, requires, requiredBy}
     */
    constructor(options) {
        super({
            item: new ImageItem({
                id: `task-group-${options.id}`,
                name: `i18n-group-${options.id}-name`,
                onclick: `Views.INVENTORY.showTaskGroup('${options.id}')`,
                url: './img/scrolls.png',
                alt: "task group ${options.id}"
            }),
            unlocked: false,
            tasks: [],
            newItem: true,
            book: `Book-${options.id}`,

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

    isCompleted() {
        return this.getCompletedTaskCount() >= this.getTaskCount();
    }

    async render() {
        const completed = this.getCompletedTaskCount();
        const outOf = this.getTaskCount();
        const completedIcon = outOf <= completed ? "<i class='fa fa-fw fa-star col-yellow' aria-hidden='true' '></i>" : '';
        const selected = Views.INVENTORY.currentTaskGroup && Views.INVENTORY.currentTaskGroup.item.id === this.item.id;
        if (selected) this.newItem = false;
        return `<button 
                    id="${this.item.id}"
                    class="item${selected ? " highlighted" : ""} ${this.unlocked ? '' : ' locked'}" 
                    onclick="${this.item.onclick}" 
                    type="button" ${this.unlocked ? '' : 'disabled'}
                    aria-expanded="${!!selected}"
                    aria-disabled="${!this.unlocked}"
                    aria-controls="viewed-tasks"
                    aria-labelledby="${this.item.id}"
                >
                    ${this.item.renderShowItem()}
                    ${this.newItem && this.unlocked ? `<div class="new-item-highlight"><div class="burst-12"> </div></div>` : ''}
                    <p id="task-group-${this.id}-label">${completedIcon} ${completed} / ${outOf}</p>
                </button>`;
    }

    async renderTaskInventory() {
        let html = getItem(this.book).render();

        const rendered = {};
        let loaded = 0;
        let started = 0;
        const toLoad = this.tasks.length;

        async function renderTask(taskID) {
            try {
                const needsBreak = (toLoad > 6 && started !== 0 && started % 4 === 0) // 7-8 tasks
                    || (toLoad >= 5 && toLoad < 6 && started !== 0 && (started + 1) % 3 === 0); // 5-6 tasks
                started++;
                rendered[taskID] = await tasks[taskID].render();
                if (needsBreak) {
                    rendered[taskID] = (needsBreak ? `<div class="break"></div>` : '') + rendered[taskID]
                }
            } catch (e) {
                rendered[taskID] = `<button class="item${tasks[taskID].completed ? " done" : ""}">
                    <img class="item-icon" alt="missing task ${taskID}" src="img/scroll.png" draggable="false">
                    <i class="task-group-color fa fa-fw fa-2x fa-bookmark"></i>
                    <p>${taskID} doesn't exist</p>     
                </button>`
            }
            loaded++;
        }

        for (let taskID of this.tasks) {
            renderTask(taskID);
        }

        await awaitUntil(() => loaded >= toLoad);

        for (let taskID of this.tasks) {
            html += rendered[taskID];
        }

        return html;
    }

    async attemptUnlock() {
        for (let required of this.requires) {
            const requiredTaskGroup = taskGroups[required];
            if (!requiredTaskGroup.isCompleted()) {
                return;
            }
        }
        this.unlocked = true;
        this.newItem = true;
        await inventory.update();
        return this;
    }


    async checkGoal() {
        if (this.isCompleted() && !this.completed) {
            eventQueue.push(Views.INVENTORY, async () => {
                this.performUnlock();
            });
            this.completed = true;
        }
    }

    async performUnlock() {
        const levelUpNotice = document.getElementById('progress-all-done');
        levelUpNotice.classList.remove('hidden');
        await delay(20);
        levelUpNotice.classList.add('active');
        unlockBookMenu();
        const relatedTaskGroups = [];
        for (let taskGroupID of this.requiredBy) {
            const unlocked = await taskGroups[taskGroupID].attemptUnlock();
            if (unlocked) relatedTaskGroups.push(unlocked);
        }
        const isLastTaskGroup = relatedTaskGroups.filter(group => group.id === 'X').length !== 0;
        if (isLastTaskGroup) {
            const questionmark = getItem('item-999');
            questionmark.unlocked = true;
            questionmark.newItem = true;
            inventory.update();
        }
        await delay(3000);
        await Views.INVENTORY.showTaskGroup(isLastTaskGroup ? undefined : relatedTaskGroups[0].id);
        await delay(5500);
        levelUpNotice.classList.remove('active');
        await delay(300);
        levelUpNotice.classList.add('hidden');
    }

}

/**
 * Represents a table from a query or a database.
 */
class Table {
    /**
     * Construct a new Table. It is recommended to use the static functions instead.
     * @param name    Name of the table
     * @param header  Column names of the table
     * @param rows    Rows in the table
     *
     * It is assumed that rows and header have same length.
     */
    constructor({name, header, rows}) {
        this.name = name;
        this.header = header;
        this.rows = rows;
    }

    /**
     * Create a new Table from ResultSet given by sql.js
     * @param name       Name of the table
     * @param resultSet  ResultSet given by sql.js
     * @returns {Table}  a new Table
     */
    static fromResultSet(name, resultSet) {
        return new Table({
            name: name,
            header: [...resultSet.columns],
            rows: resultSet.values
        });
    }

    /**
     * Create a new Table from markdown format for a table.
     * @param name       Name of the table
     * @param lines      Rows in the table, values separated by |, eg first|second
     * @param headers    Column names of the table, array.
     * @returns {Table}  a new Table
     *
     * It is assumed that rows and header have same length.
     */
    static fromPlain(name, lines, headers) {
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

    isEqual(table, strict) {
        if (!table instanceof Table) return false;
        return isArrayEqual(this.rows, table.rows, strict);
    }
}

async function queryAllContentsOfTables(context, tableNames) {
    const queries = tableNames.map(table => `SELECT * FROM ${table};`).join('');
    const resultSets = await runSQL(context, queries)
    const queryResults = [];
    for (let i = 0; i < resultSets.length; i++) {
        queryResults.push(Table.fromResultSet(tableNames[i], resultSets[i]))
    }
    return queryResults;
}

function updateCompletionIndicator(override) {
    if (DISPLAY_STATE.endgame) {
        // Update flame indicator
        showElementImmediately('flame-indicator');
        hideElementImmediately('star-indicator');
        const counter = document.getElementById('flame-indicator-text');
        const taskGroupX = getItem('task-group-X');
        const flames = override !== undefined ? override : taskGroupX.getCompletedTaskCount();
        const outOf = taskGroupX.getTaskCount();
        counter.innerHTML = `${flames} / ${outOf}`
    } else {
        // Update star indicator
        showElementImmediately('star-indicator');
        hideElementImmediately('flame-indicator')
        const indicator = document.getElementById('star-indicator');
        if (indicator) {
            const stars = override !== undefined ? override : taskGroups.getCompletedTaskCount();
            const outOf = taskGroups.getTaskCount();
            indicator.innerHTML = `<i class="fa fa-star col-yellow" aria-label="star count"></i> ${stars} / ${outOf}`
        }
    }
}

async function runQueryTests(allowCompletionAndStore) {
    document.getElementById('query-out-tables-nav').innerHTML = '';
    document.getElementById("query-out-table").innerHTML = '';
    const query = document.getElementById('query-input').value.trim();
    animateFlame();
    const results = await Views.TASK.currentTask.runTests(query);

    let renderedResults = "";
    let renderedNav = "";
    let allCorrect = true;

    let displayIndex = undefined;

    const firstError = String(results[0].error);
    const allErrored = results[0].error && results.filter(result => result.error && String(result.error) !== firstError).length === 0;

    if (allErrored) {
        allCorrect = false;
        renderedResults += `<div id="test-0" data-parent="#query-out-table">`
        renderedResults += await results[0].render();
        renderedResults += `</div>`
    } else {
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            if (!result.correct) {
                allCorrect = false;
                if (displayIndex === undefined) displayIndex = i;
            }
            const icon = result.correct ? `<i class="fa fa-check col-green" aria-label="${i18n.get('correct')}"></i>` : `<i class="fa fa-times col-light-red" aria-label="${i18n.get('incorrect')}"></i>`;

            renderedResults += `<div id="test-${i + 1}" class="collapse" aria-labelledby="test-nav-${i + 1}" data-parent="#query-out-table">`
            renderedResults += await result.render();
            renderedResults += `</div>`

            renderedNav += `<li class="nav-item">
                        <button id="test-nav-${i + 1}" class="nav-link mr-1 collapsed" aria-expanded="false" data-toggle="collapse" data-target="#test-${i + 1}" aria-controls="test-${i + 1}">
                        ${icon} ${i18n.getWith('test', [i + 1])}
                        </button>
                    </li>`
        }
        if (displayIndex === undefined) displayIndex = 0; // Make sure something is shown
        renderedResults = renderedResults
            .split(`id="test-${displayIndex + 1}" class="collapse`, 2)
            .join(`id="test-${displayIndex + 1}" class="collapse show`);
        renderedNav = renderedNav
            .split(`id="test-nav-${displayIndex + 1}" class="nav-link mr-1 collapsed" aria-expanded="false"`, 2)
            .join(`id=test-nav-${displayIndex + 1}" class="nav-link mr-1" aria-expanded="true"`);
    }
    if (MOOC.loginStatus === LoginStatus.LOGGED_IN && allowCompletionAndStore) {
        await MOOC.quizzesSendRetryOnFail(Views.TASK.currentTask, query, allCorrect, 1);
        await Views.TASK.updatePreviousAnswers(Views.TASK.currentTask);
    }

    document.getElementById('query-out-tables-nav').innerHTML = renderedNav;
    document.getElementById("query-out-table").innerHTML = renderedResults;

    if (allCorrect && allowCompletionAndStore && Views.TASK.currentTask) {
        await Views.TASK.currentTask.completeTask();
    }
}