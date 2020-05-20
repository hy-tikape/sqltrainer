/* Base code from https://github.com/pllk/sqltrainer */

function get(id) {
    return document.getElementById(id);
}

function runSQL(context, query, what) {
    config = {locateFile: filename => `dist/${filename}`};

    initSqlJs(config).then(SQL => {
        const db = new SQL.Database();
        try {
            db.run(context);
        } catch (error) {
            alert("Virhe tehtävän määrittelyssä");
        }
        try {
            const result = db.exec(query);
            sqlResult(result, what);
        } catch (error) {
            sqlError(error, what);
        }
    });
}

function renderTable(data, name) {
    let i;
    let table;
    if (data.length === 0) {
        table = "";
        table += "<i>" + name + "</i>";
        table += "<table><tr><td>(taulu on tyhjä)</td></tr></table>";
        return table;
    }
    data = data[0];
    table = "";
    table += "<i>" + name + "</i>";
    table += "<table>";
    table += "<tr>";
    for (let column of data.columns) {
        table += "<th>" + column + "</th>";
    }
    table += "</tr>";
    for (let row of data.values) {
        table += "<tr>";
        for (let value of row) {
            table += "<td>" + value + "</td>";
        }
        table += "</tr>";
    }
    table += "</table>";
    return table;
}

function renderTables(data) {
    let html = "";
    html += "<fieldset><legend><b>Taulut</b></legend>";
    html += "<table><tr>";
    for (let i = 0; i < data.length; i++) {
        if (i !== 0) html += "<td></td>";
        html += "<td>" + renderTable(data[i], table_names[i]) + "</td>";
    }
    html += "</tr></table>";
    html += "</fieldset>";
    return html;
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

const showHeaders = false;

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

var table_names;
let table_data;
let all_correct;

function sqlResult(result, what) {
    if (what[0] === "example") {
        table_data[my_test].push(result);
        my_table++;
        if (my_table < tables.length) {
            processTask();
        } else {
            if (my_test === 0) {
                let html = "";
                html += renderTables(table_data[0]);
                html += "<br>";
                html += renderResult(results[0], "Haluttu tulos");
                console.log(html);
            }
            my_table = 0;
            my_test++;
            if (my_test < tests.length) {
                processTask();
            } else {
                // get("submit").disabled = false;
            }
        }
    }
    if (what[0] === "test") {
        const verdict = get("verdict");
        const plain = renderPlain(result);
        const correct = isArrayEqual(results[what[1]], plain);
        if (!correct) all_correct = false;
        var message = correct ? '<span style="color: green;">oikein</span>' : '<span style="color: red;">väärin</span>';
        verdict.innerHTML += "<h2>Testi " + (what[1] + 1) + " (" + message + ")</h2>";
        verdict.innerHTML += renderTables(table_data[what[1]]);
        verdict.innerHTML += renderResult(results[what[1]], "Haluttu tulos");
        const columns = result[0] === undefined ? undefined : result[0].columns;
        verdict.innerHTML += renderResult(plain, "Kyselysi tulos", columns);
        my_test++;
        if (my_test < tests.length) {
            checkTest();
        } else {
            var message = all_correct ? '<span style="color: green; ">Kyselysi toimii oikein</span>' : '<span style="color: red; ">Kyselysi toimii väärin</span>';
            console.log(message);
            if (mooc_status === 1) {
                quizzes_send(my_task, get("query").value, all_correct, processResult);
            }
        }
    }
}

function sqlError(error, what) {
    console.error(error, what);
    get("message").innerHTML = '<span style="color: red; ">Kyselysi on virheellinen</span>';
    get("verdict").innerHTML = "<br>" + error;
}

var tables, tests, results;

function parseTask(data) {
    const lines = data.split("\n");
    let mode = 0;
    const task = get("task");
    // task.innerHTML = "";
    tables = [];
    table_names = [];
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
                task.innerHTML += line + " ";
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
    // get("submit").disabled = true;
    const x = new XMLHttpRequest();
    x.onreadystatechange = function () {
        if (x.readyState === 4 && x.status === 200) {
            parseTask(x.responseText);
            my_test = my_table = 0;
            processTask();
        }
    }
    x.open("GET", file + "?" + (new Date().getTime()));
    x.send();
}

var my_test, my_table;

function processTask() {
    if (my_test === 0 && my_table === 0) table_data = [];
    if (my_table === 0) table_data.push([]);
    let context = "";
    for (var i = 0; i < tables.length; i++) {
        context += tables[i];
    }
    for (var i = 0; i < tests[my_test].length; i++) {
        context += tests[my_test][i];
    }
    const parts = tables[my_table].split(" ");
    const table = parts[2];
    table_names.push(table);
    runSQL(context, "SELECT * FROM " + table + ";", ["example", my_table]);
}

function checkTest() {
    let context = "";
    for (var i = 0; i < tables.length; i++) {
        context += tables[i];
    }
    for (var i = 0; i < tests[my_test].length; i++) {
        context += tests[my_test][i];
    }
    const query = get("query").value;
    if (query.trim() === "") return;
    runSQL(context, query, ["test", my_test]);
}

function check() {
    get("verdict").innerHTML = "";
    get("message").innerHTML = "";
    my_test = 0;
    all_correct = true;
    checkTest();
}

var my_task = 0;

