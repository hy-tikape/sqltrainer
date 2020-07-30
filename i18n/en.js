for (let entry of Object.entries({
    "error": "Error",
    "username": "Mooc Username",
    "password": "Password",
    "welcome": "Welcome to the magical world of SQL-spells.",
    "login": "Login",
    "login-error-no-user": "Write a username",
    "login-error-no-password": "Write a password",
    "logout": "Logout",
    "incorrect-password": "Incorrect username or password",
    "forgot-password": "Forgot password?",
    "register": "Register",
    "empty-table": "The table is empty",
    "ok": "Alright!",
    "close": "Close",
    "skip": "Skip",
    "back": "Back",
    "example": "Example",
    "loading": "Loading..",
    "show-model-answer": "Display model answer",
    "previous-answers": "Sent answers",
    "table-result": "Result",
    "wanted-result": "Wanted result",
    "books-text": "Books",
    "tasks-text": "Scrolls",
    "map-text": "Map",
    "found-books-text": "Books",
    "level-unlocked": 'You have completed all tasks in a task group!',
    "skill-point-count-zero": 'Complete tasks to unlock more books',
    "read": "Read",
    "read-book": "Read the book",
    "previous-page": "Previous page",
    "next-page": "Next page",
    "unlock": "Unlock",
    "unlocked": "Unlocked",
    "rewatch-animation": "Rewatch animation",
    "book-discover": "You unlocked a book!",
    "item-00-name": 'Welcome letter',
    "item-00-hint":
        `Welcome. You have been given some study material and tasks. Hopefully you find it pleasant to study here.

        May the books assist ye and your tasks be solvable!

        Great regards,
        Principal Queryx`,
    "item-999-name": "???",
    "write-query-first": "Write a query.",
    "multi-query-not-allowed": "Result has to be reached with a single query. Do not write multiple queries.",
    "sub-query-not-allowed": "Result has to be reached without subqueries. Do not use subqueries.",
    "query-no-rows": "Query did not match any rows.",
    "query-placeholder": "Write an SQL spell...",
    "query-test": "Test the spell",
    "test": "Test {}",
    "correct": "Correct",
    "incorrect": "That wasn't quite correct",
    "task-complete": "Tasks completed",
    "group-A-name": "Scrolls of selection",
    "group-B-name": "Scrolls of search",
    "group-C-name": "Scrolls of order",
    "group-D-name": "Scrolls of distinction",
    "group-E-name": "Scrolls of text magic",
    "group-F-name": "Scrolls of limits",
    "group-G-name": "Scrolls of grouping",
    "group-H-name": "Scrolls of mathematical spells",
    "group-I-name": "Scrolls of joining",
    "group-J-name": "Scrolls of left joining",
    "group-K-name": "Scrolls of normalization",
    "group-L-name": "Scrolls of union",
    "animation-speech-1": `hahaha.. haha ha.. Maybe it is time to introduce myself.. I am Queryx, and I have now 
        obtained knowledge of all SQL - All thanks to you!`,
    "animation-speech-2": `
            INSERT INTO Flame (power) VALUES (SELECT power FROM Stars);`,
    "animation-speech-3": `\n
        Ehahaha! All your powers are mine!
        UPDATE Flame SET color='evil' WHERE name='Kyselyx';`,
    "animation-speech-4": `\n
        YOUR WORLD SHALL FALL IN RUIN!
        SELECT * FROM World JOIN Flame on World.location != Flame.location;`,
    "animation-speech-5": `\n
        AHAHAHAhaahahaHAHAHAahAHAHAAHAaaa`,
    "animation-explanation-6": `Queryx is apparently not a principal, but an evil flame!
                    You are the world's only hope, you must stop Queryx from destroying everything with SQL magic!`,
    "to-battle": "To battle!",
    "end-animation-speech-1": `You probably think you have won by capturing my kin..`,
    "end-animation-speech-2": `\n
        BUT I'LL MAKE MORE! Hahahahaha!`,
    "end-animation-speech-3": `\n
        <i>Queryx is preparing to cast a spell..</i>`,
    "end-animation-speech-4": `\n
        NO! What do you think you're doing!`,
    "end-animation-speech-5": `\n
        <i>Queryx, you are not strong enough. He has proven his might to us, and if you think we will do your dirty work for you, you're gravely mistaken.</i>`,
    "end-animation-speech-6": `\n
        NOOOOOOOOOOOOOOooooooooooooooo...........`,
    "continue": "Continue..",
    "congratulations": "Congratulations!",
    "ending-text-1": 'You have solved the mysteries of SQL magic, won against Queryx and saved the world!',
    "ending-text-2": 'You have completed all tasks, and the course! Congratulations.',
    "return-to-game": "Back to the game",
    // Screen reader only
    "task-groups": "Task groups",
    "tasks": "Tasks",
    "task-description": "Task description",
    "task-area": "Task area",
    "task-tests": "Tests for the task",
    "indicators": "Tasks completed",
    "stars": "Stars collected",
    "flames": "Flames captured",
    "right-sidebar": "Right sidebar - additional navigation",
    "describe-letter": "Welcome letter",
    "describe-questionmark": "Mysterious symbol",
})) {
    i18n[entry[0]] = entry[1];
}

replaceI18nContent();