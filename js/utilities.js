/**
 * SQL Execution utility.
 *
 * @param context SQL to execute before the query (eg. create tables).
 * @param query SQL to execute in the context.
 * @returns Promise, sql wasm result set. Can throw error on invalid sql.
 */
runSQL = async (context, query) => {
    const config = {locateFile: filename => `dist/${filename}`};
    const SQL = await initSqlJs(config);
    const db = new SQL.Database();
    try {
        db.run(context);
        return db.exec(query);
    } finally {
        db.close();
    }
}

/**
 * XMLHttpRequest utility for reading text files.
 *
 * @param fromPath URI path to read a file from.
 * @returns Promise, array of lines. Can throw error on non-200 response code.
 */
readLines = fromPath => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(xhr.responseText.split("\n"));
                } else {
                    reject(`Bad response code '${xhr.status}' for file '${fromPath}'`);
                }
            }
        }
        xhr.open("GET", fromPath);
        xhr.send();
    })
}