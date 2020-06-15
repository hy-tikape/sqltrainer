function delay(durationMs, that) {
    return new Promise(function (resolve) {
        setTimeout(resolve.bind(null, that), durationMs)
    });
}

async function hideElement(id) {
    const element = document.getElementById(id);
    if (!element) return console.error(`Element by id ${id} not found`);
    element.classList.add("hidden-fadeout");
    await delay(200);
    element.classList.add("hidden");
    element.classList.remove("hidden-fadeout");
}

async function hideElementImmediately(id) {
    const element = document.getElementById(id);
    if (!element) return console.error(`Element by id ${id} not found`);
    element.classList.add("hidden");
}

async function showElement(id) {
    const element = document.getElementById(id);
    if (!element) return console.error(`Element by id ${id} not found`);
    element.classList.remove("hidden");
    await delay(10);
    element.classList.add("hidden-fadein");
    await delay(200)
    element.classList.remove("hidden-fadein");
}

async function showElementImmediately(id) {
    const element = document.getElementById(id);
    if (!element) return console.error(`Element by id ${id} not found`);
    element.classList.remove("hidden");
}

function showModal(id, changeToViewAfter) {
    return new Promise((resolve) => {
        $(id).modal()
            .on('hidden.bs.modal', () => {
                $(id).off('hidden.bs.modal');
                resolve()
            });
    }).then(() => {
        return changeSecondaryView(changeToViewAfter ? changeToViewAfter : Views.NONE);
    });
}

async function shakeElement(id) {
    async function rotateRight(element) {
        element.style.transform = "rotate(5deg)";
        await delay(100);
    }

    async function rotateLeft(element) {
        element.style.transform = "rotate(-5deg)";
        await delay(100);
    }

    const element = document.getElementById(id);
    await rotateRight(element);
    for (let i = 0; i < 3; i++) {
        await rotateLeft(element);
        await rotateRight(element);
    }
    element.style.transform = "";
}

async function shookElement(id) {
    async function moveRight(element) {
        element.style.transform = "translate(7px)";
        await delay(100);
    }

    async function moveLeft(element) {
        element.style.transform = "translate(-7px)";
        await delay(100);
    }

    const element = document.getElementById(id);
    await moveRight(element);
    for (let i = 0; i < 2; i++) {
        await moveLeft(element);
        await moveRight(element);
    }
    element.style.transform = "";
}

function shootConfetti(durationMs, particles) {
    const end = Date.now() + durationMs;
    (function frame() {
        confetti({
            particleCount: particles ? particles : 5,
            colors: particles === 2 ? ['#21F0F3', '#4AB8FF'] : undefined,
            angle: 60,
            spread: 55,
            origin: {x: 0, y: 0.8}
        });
        confetti({
            particleCount: particles ? particles : 5,
            colors: particles === 2 ? ['#21F0F3', '#4AB8FF'] : undefined,
            angle: 120,
            spread: 55,
            origin: {x: 1, y: 0.8}
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}

async function animateFlame() {
    const flameStyle = document.getElementById("task-descriptor-flame").style;
    flameStyle.animation = "explode 1.2s";
    await delay(1200);
    flameStyle.animation = "";
}

function moveStarPath(id) {
    const star = document.getElementById(id);
    const goal = document.getElementById('star-indicator');

    // TODO take width and height into account in the speed
    const width = window.innerWidth;
    const height = window.innerHeight;
    const goalX = goal.offsetLeft;
    const goalY = goal.offsetTop;

    let vy = 3;
    let vx = -8;

    return new Promise((resolve) => {
        (function frame() {
            // TODO move starting position to mouse
            const x = star.offsetLeft + vx;
            const y = star.offsetTop + vy;
            star.style.left = `${x}px`;
            star.style.top = `${y}px`;
            vx += (goalX - x) / goalX;
            vy += (goalY - y) / goalY * 0.26;

            if (x < goalX && y < goalY) {
                requestAnimationFrame(frame);
            } else {
                resolve();
            }
        }());
    });
}