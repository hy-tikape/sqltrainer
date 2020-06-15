/* Original code https://github.com/pllk/sqltrainer/blob/master/mooc.js */

LoginState = {
    LOGGED_OUT: 0,
    LOGGED_IN: 1,
    ERRORED: 2,
}

const MOOC = {
    loginState: LoginState.LOGGED_OUT,
    token: undefined,
    loginExisting() {
        const sessionToken = sessionStorage.getItem("mooc-token");
        if (sessionToken) {
            this.loginState = LoginState.LOGGED_IN;
            this.token = sessionToken;
        }
    },
    login(username, password) {
        return new Promise(((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (xhr.status === 200) {
                        const token = this.responseText;
                        if (token === "ERROR") {
                            MOOC.loginState = LoginState.ERRORED;
                            reject(i18n.get('incorrect-password'));
                        } else {
                            MOOC.loginState = LoginState.LOGGED_IN;
                            sessionStorage.setItem("mooc-token", token);
                            MOOC.token = token;
                            resolve();
                        }
                    } else {
                        MOOC.loginState = LoginState.ERRORED;
                        reject(`Bad response code '${xhr.status}' for login`);
                    }
                }
            }
            xhr.open("POST", "https://ahslaaks.users.cs.helsinki.fi/mooc/login.php", true);
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.send("username=" + encodeURIComponent(username) + "&" +
                "password=" + encodeURIComponent(password));
        }))
    },
    logout() {
        this.loginState = LoginState.LOGGED_OUT;
        this.token = "";
        sessionStorage.removeItem('mooc-token');
    },
    query(query) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    resolve(JSON.parse(this.responseText));
                } else {
                    reject(`Bad response code '${xhr.status}' for mooc query`);
                }
            }
            xhr.open("GET", query, true);
            xhr.setRequestHeader("Authorization", "Bearer " + this.token);
            xhr.send();
        });
    },
    quizzesStatus() {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    resolve(this.responseText.split(" "));
                } else {
                    reject(`Bad response code '${xhr.status}' for mooc query`);
                }
            }
            xhr.open("GET", "https://ahslaaks.users.cs.helsinki.fi/mooc/sql_status.php?token=" + this.token, true);
            xhr.send();
        });
    },
    quizzesSend(task, sql, result) {
        return new Promise((resolve, reject) => {
            result = result ? 1 : 0;
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    resolve();
                } else {
                    reject(`Bad response code '${xhr.status}' for quizzes send`);
                }
            }
            xhr.open("POST", "https://ahslaaks.users.cs.helsinki.fi/mooc/sql_send.php", true);
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.send("token=" + this.token + "&" +
                "task=" + task + "&" +
                "result=" + result + "&" +
                "data=" + encodeURIComponent(sql));
        });
    },
    quizzesAnswer(task) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    resolve(this.responseText);
                } else {
                    reject(`Bad response code '${xhr.status}' for quizzes answer`);
                }
            }
            xhr.open("GET", "https://ahslaaks.users.cs.helsinki.fi/mooc/sql_answer.php?token=" + this.token + "&task=" + task, true);
            xhr.send();
        });
    },
    quizzesModel(task) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    resolve(this.responseText);
                } else {
                    reject(`Bad response code '${xhr.status}' for quizzes model`);
                }
            }
            xhr.open("GET", "https://ahslaaks.users.cs.helsinki.fi/mooc/sql_model.php?token=" + this.token + "&task=" + task, true);
            xhr.send();
        });
    }
}