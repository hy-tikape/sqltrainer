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

/**
 * SQL Execution utility.
 *
 * @param context SQL to execute before the query (eg. create tables).
 * @param query SQL to execute in the context.
 * @returns Promise, sql wasm result set.
 * @throws Error if SQL query fails
 */
async function runSQL(context, query) {
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
function readLines(fromPath) {
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
        xhr.open("GET", fromPath, true);
        xhr.send();
    })
}

/**
 * Store text file as a downloaded file.
 *
 * https://stackoverflow.com/a/33542499
 *
 * @param filename Name of the file
 * @param data Text in the file.
 */
function saveFile(filename, data) {
    const blob = new Blob([data], {type: 'text/csv'});
    if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    } else {
        const elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
    }
}

/**
 * Upload text file.
 *
 * https://stackoverflow.com/a/54214913
 *
 * @returns Promise text included in the file.
 */
function uploadFile(accepts) {
    const uploader = document.createElement('input');
    uploader.type = 'file';
    if (accepts) uploader.accept = accepts;
    uploader.style.display = 'none';
    return new Promise((resolve) => {
        uploader.addEventListener('change', () => {
            const files = uploader.files;

            if (files.length) {
                const reader = new FileReader();
                reader.addEventListener('load', () => {
                    uploader.parentNode.removeChild(uploader);
                    resolve(reader.result);
                });
                reader.readAsText(files[0]);
            }
        })

        document.body.appendChild(uploader);
        uploader.click();
    })
}

function awaitUntil(predicateFunction) {
    return new Promise((resolve => {
        const handlerFunction = () => {
            if (predicateFunction.apply()) {
                resolve();
            } else {
                setTimeout(handlerFunction, 10)
            }
        };
        handlerFunction();
    }))
}

// https://en.wikipedia.org/wiki/Heap%27s_algorithm
function generateAllPermutations(A) {
    const permutations = [];
    // c is an encoding of the stack state. c[k] encodes the for-loop counter for when generate(k+1, A) is called
    const c = []; // array of int

    for (let j = 0; j < A.length; j++) {
        c.push(0);
    }

    permutations.push([...A]);

    function swap(i1, i2) {
        A[i1] = A.splice(i2, 1, A[i1])[0];
    }

    // i acts similarly to the stack pointer
    let i = 0;
    while (i < A.length) {
        if (c[i] < i) {
            if (i % 2 === 0) {
                swap(0, i);
            } else {
                swap(c[i], i);
            }
            permutations.push([...A]);
            // Swap has occurred ending the for-loop. Simulate the increment of the for-loop counter
            c[i] += 1
            // Simulate recursive call reaching the base case by bringing the pointer to the base case analog in the array
            i = 0
        } else {
            // Calling generate(i+1, A) has ended as the for-loop terminated. Reset the state and simulate popping the stack by incrementing the pointer.
            c[i] = 0
            i += 1;
        }
    }
    return permutations;
}