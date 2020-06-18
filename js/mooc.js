/* Original code https://github.com/pllk/sqltrainer/blob/master/mooc.js */

LoginStatus = {
    LOGGED_OUT: 0,
    LOGGED_IN: 1,
    ERRORED: 2,
}

const MOOC = {
    ADDRESS: 'https://ahslaaks.users.cs.helsinki.fi/mooc',
    loginStatus: LoginStatus.LOGGED_OUT,
    token: undefined,
    loginExisting() {
        const sessionToken = sessionStorage.getItem("mooc-token");
        if (sessionToken) {
            this.loginStatus = LoginStatus.LOGGED_IN;
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
                            MOOC.loginStatus = LoginStatus.ERRORED;
                            reject(i18n.get('incorrect-password'));
                        } else {
                            MOOC.loginStatus = LoginStatus.LOGGED_IN;
                            sessionStorage.setItem("mooc-token", token);
                            MOOC.token = token;
                            resolve();
                        }
                    } else {
                        MOOC.loginStatus = LoginStatus.ERRORED;
                        reject(`Bad response code '${xhr.status}' for login`);
                    }
                }
            }
            xhr.timeout = 30000;
            xhr.open("POST", `${this.ADDRESS}/login.php`, true);
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.send(`username=${encodeURIComponent(username)}
                     &password=${encodeURIComponent(password)}`);
        }))
    },
    logout() {
        this.loginStatus = LoginStatus.LOGGED_OUT;
        this.token = "";
        sessionStorage.removeItem('mooc-token');
    },
    quizzesStatus() {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        resolve(this.responseText.split(" ")
                            .map(result => parseInt(result) === 1));
                    } else {
                        reject(`Bad response code '${xhr.status}' for mooc query`);
                    }
                }
            }
            xhr.timeout = 30000;
            xhr.open("GET", `${this.ADDRESS}/sql_status.php?token=${this.token}`, true);
            xhr.send();
        });
    },
    quizzesSend(task, sql, result) {
        const taskID = task.getNumericID();
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        resolve();
                    } else {
                        reject(`Bad response code '${xhr.status}' for quizzes send`);
                    }
                }
            }
            xhr.timeout = 30000;
            xhr.open("POST", `${this.ADDRESS}/sql_send.php`, true);
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.send(
                `token=${this.token}
                &task=${taskID}
                &result=${result ? 1 : 0}
                &data=${encodeURIComponent(sql)}`
            );
        });
    },
    quizzesAnswer(task) {
        const taskID = task.getNumericID();
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        resolve(this.responseText);
                    } else {
                        reject(`Bad response code '${xhr.status}' for quizzes answer`);
                    }
                }
            }
            xhr.timeout = 30000;
            xhr.open("GET", `${this.ADDRESS}/sql_answer.php?token=${this.token}&task=${taskID}`, true);
            xhr.send();
        });
    },
    quizzesModel(task) {
        const taskID = task.getNumericID();
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        resolve(this.responseText);
                    } else {
                        reject(`Bad response code '${xhr.status}' for quizzes model`);
                    }
                }
            }
            xhr.timeout = 30000;
            xhr.open("GET", `${this.ADDRESS}/sql_model.php?token=${this.token}&task=${taskID}`, true);
            xhr.send();
        });
    }
}