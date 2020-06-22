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
    const flameStyle = document.getElementById("task-flame-container").style;
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

class Flame {
    constructor(options) {
        this.id = options.id ? options.id : '';
        this.classes = options.classes ? options.classes : '';
        this.onclick = options.onclick ? options.onclick : '';
        this.style = options.style ? options.style : '';

        this.evil = options.evil;
    }

    renderEvilFlame() {
        return `<svg enable-background="new 0 0 125 189.864" height="189.864px" id="${this.id}"
                     style="${this.style} filter: hue-rotate(-125deg) brightness(0.9);" class="${this.classes}" onclick="${this.onclick}"
                     version="1.1" viewBox="0 0 125 189.864"
                     width="125px" x="0px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg"
                     y="0px">
<path class="flame-main" d="M76.553,186.09c0,0-10.178-2.976-15.325-8.226s-9.278-16.82-9.278-16.82s-0.241-6.647-4.136-18.465
\tc0,0,3.357,4.969,5.103,9.938c0,0-5.305-21.086,1.712-30.418c7.017-9.333,0.571-35.654-2.25-37.534c0,0,13.07,5.64,19.875,47.54
\tc6.806,41.899,16.831,45.301,6.088,53.985" fill="#F36E21"/>
                    <path class="flame-main one" d="M61.693,122.257c4.117-15.4,12.097-14.487-11.589-60.872c0,0,32.016,10.223,52.601,63.123
\tc20.585,52.899-19.848,61.045-19.643,61.582c0.206,0.537-19.401-0.269-14.835-18.532S57.576,137.656,61.693,122.257z"
                          fill="#F6891F"/>
                    <path class="flame-main two" d="M81.657,79.192c0,0,11.549,24.845,3.626,40.02c-7.924,15.175-21.126,41.899-0.425,64.998
\tC84.858,184.21,125.705,150.905,81.657,79.192z" fill="#FFD04A"/>
                    <path class="flame-main three" d="M99.92,101.754c0,0-23.208,47.027-12.043,80.072c0,0,32.741-16.073,20.108-45.79
\tC95.354,106.319,99.92,114.108,99.92,101.754z" fill="#FDBA16"/>
                    <path class="flame-main four" d="M103.143,105.917c0,0,8.927,30.753-1.043,46.868c-9.969,16.115-14.799,29.041-14.799,29.041
\tS134.387,164.603,103.143,105.917z" fill="#F36E21"/>
                    <path class="flame-main five"
                          d="M62.049,104.171c0,0-15.645,67.588,10.529,77.655C98.753,191.894,69.033,130.761,62.049,104.171z"
                          fill="#FDBA16"/>
                    <path class="flame"
                          d="M101.011,112.926c0,0,8.973,10.519,4.556,16.543C99.37,129.735,106.752,117.406,101.011,112.926z"
                          fill="#F36E21"/>
                    <path class="flame one"
                          d="M55.592,126.854c0,0-3.819,13.29,2.699,16.945C64.038,141.48,55.907,132.263,55.592,126.854z"
                          fill="#F36E21"/>
                    <path class="flame two"
                          d="M54.918,104.595c0,0-3.959,6.109-1.24,8.949C56.93,113.256,52.228,107.329,54.918,104.595z"
                          fill="#F36E21"/>
</svg>`
    }

    renderGoodFlame() {
        return `<svg enable-background="new 0 0 125 189.864" height="189.864px" id="${this.id}"
                         version="1.1" viewBox="0 0 125 189.864" class="${this.classes}" onclick="${this.onclick}"
                         width="125px" x="0px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg"
                         y="0px">
<path class="flame-main" d="M76.553,186.09c0,0-10.178-2.976-15.325-8.226s-9.278-16.82-9.278-16.82s-0.241-6.647-4.136-18.465
\tc0,0,3.357,4.969,5.103,9.938c0,0-5.305-21.086,1.712-30.418c7.017-9.333,0.571-35.654-2.25-37.534c0,0,13.07,5.64,19.875,47.54
\tc6.806,41.899,16.831,45.301,6.088,53.985" fill="#16AAFD"/>
                        <path class="flame-main one" d="M61.693,122.257c4.117-15.4,12.097-14.487-11.589-60.872c0,0,32.016,10.223,52.601,63.123
\tc20.585,52.899-19.848,61.045-19.643,61.582c0.206,0.537-19.401-0.269-14.835-18.532S57.576,137.656,61.693,122.257z"
                              fill="#4AB8FF"/>
                        <path class="flame-main two" d="M81.657,79.192c0,0,11.549,24.845,3.626,40.02c-7.924,15.175-21.126,41.899-0.425,64.998
\tC84.858,184.21,125.705,150.905,81.657,79.192z" fill="#1FD7F6"/>
                        <path class="flame-main three" d="M99.92,101.754c0,0-23.208,47.027-12.043,80.072c0,0,32.741-16.073,20.108-45.79
\tC95.354,106.319,99.92,114.108,99.92,101.754z" fill="#21F0F3"/>
                        <path class="flame-main four" d="M103.143,105.917c0,0,8.927,30.753-1.043,46.868c-9.969,16.115-14.799,29.041-14.799,29.041
\tS134.387,164.603,103.143,105.917z" fill="#16AAFD"/>
                        <path class="flame-main five"
                              d="M62.049,104.171c0,0-15.645,67.588,10.529,77.655C98.753,191.894,69.033,130.761,62.049,104.171z"
                              fill="#21F0F3"/>
                        <path class="flame"
                              d="M101.011,112.926c0,0,8.973,10.519,4.556,16.543C99.37,129.735,106.752,117.406,101.011,112.926z"
                              fill="#16AAFD"/>
                        <path class="flame one"
                              d="M55.592,126.854c0,0-3.819,13.29,2.699,16.945C64.038,141.48,55.907,132.263,55.592,126.854z"
                              fill="#16AAFD"/>
                        <path class="flame two"
                              d="M54.918,104.595c0,0-3.959,6.109-1.24,8.949C56.93,113.256,52.228,107.329,54.918,104.595z"
                              fill="#16AAFD"/>
</svg>`
    }

    render() {
        return this.evil ? this.renderEvilFlame() : this.renderGoodFlame();
    }
}