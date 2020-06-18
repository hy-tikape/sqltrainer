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

async function fadeToBlack() {
    const fade = document.getElementById('fade-to-black');
    fade.style.display = "";
    await delay(50);
    fade.style.opacity = "1";
    await delay(400);
}

async function fadeFromBlack() {
    const fade = document.getElementById('fade-to-black');
    fade.style.opacity = "0";
    await delay(400);
    fade.style.display = "none";
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

function flyStar(boundToContainer) {
    return flyStarFromTo(boundToContainer,
        document.getElementById('query-run-button'),
        document.getElementById('star-indicator'));
}

function flyStarFromTo(boundNextTo, from, to) {
    const id = `star-animated-${new Date().getUTCDate()}`;
    document.getElementById(boundNextTo)
        .insertAdjacentHTML('afterend', `<i id="${id}" class="fa fa-star col-yellow star-animation hidden"></i>`);

    function getPos(el) {
        const rect = el.getBoundingClientRect();
        return {x: rect.left, y: rect.top};
    }

    const star = document.getElementById(id);

    const startPos = getPos(from);
    const width = window.innerWidth;
    const height = window.innerHeight;
    const goalPos = getPos(to);
    const goalX = goalPos.x;
    const goalY = goalPos.y;

    let vy = -Math.random() * 4 - 2;
    let vx = -Math.random() * 4 - 4;

    let firstFrame = true;
    return new Promise((resolve) => {
        (function frame() {
            const x = firstFrame ? startPos.x : star.offsetLeft + vx;
            const y = firstFrame ? startPos.y : star.offsetTop + vy;
            if (firstFrame) {
                star.classList.remove('hidden');
            } else {
                star.style.transform = "scale(2)";
            }
            star.style.left = `${x}px`;
            star.style.top = `${y}px`;
            const direction = {
                x: goalX - x,
                y: goalY - y
            }
            const distance = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
            const force = {
                x: direction.x / distance,
                y: direction.y / distance
            }

            vx += force.x;
            vy += force.y;
            firstFrame = false;

            if (Math.abs(x - goalX) >= 25 && Math.abs(y - goalY) >= 25) {
                requestAnimationFrame(frame);
            } else {
                star.remove();
                resolve();
            }
        }());
    });
}