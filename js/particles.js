function insertStar(boundNextTo) {
    const id = `star-animated-${new Date().getTime()}`;
    document.getElementById(boundNextTo)
        .insertAdjacentHTML('afterend', `<i id="${id}" class="fa fa-star col-yellow star-animation particle"></i>`);

    return document.getElementById(id);
}

async function flyStarFromTo(boundNextTo, from, to) {
    const star = insertStar(boundNextTo);
    let firstFrame = true;
    const initialVelocity = {x: -Math.random() * 4 - 2, y: -Math.random() * 4 - 4}
    await flyThingFromTo(star, from, to, initialVelocity, () => {
        if (firstFrame) {
            firstFrame = false;
            star.style.transform = "scale(2)";
        }
    });
    star.remove();
}

function insertFlame(boundNextTo) {
    const id = `flame-animated-${new Date().getTime()}`;
    document.getElementById(boundNextTo)
        .insertAdjacentHTML('afterend', `<div id="${id}" style="position: absolute" class="particle">${new Flame({
            id: 'flame-' + id,
            style: 'transform: scale(0.7);',
            evil: true
        }).render()}</div>`);

    return document.getElementById(id);
}

async function flyFlameFromTo(boundNextTo, from, to) {
    const flame = insertFlame(boundNextTo);
    const initialVelocity = {x: -6 + Math.random() * 12, y: -1}
    await flyThingFromTo(flame, from, to, initialVelocity, () => {
    });
    flame.remove();
}

function orbitFlame(boundNextTo, from, to) {
    const flame = insertFlame(boundNextTo);
    const initialVelocity = {x: Math.random() - 0.5, y: Math.random() - 0.5}
    return orbit(flame, from, to, initialVelocity, () => {
    });
}

function flyThingFromTo(thing, from, to, initialVelocity, specificsPerFrame) {
    function getPos(el) {
        const rect = el.getBoundingClientRect();
        return {x: rect.left, y: rect.top};
    }

    const startPos = from.getBoundingClientRect ? getPos(from) : from;
    const goalPos = to.getBoundingClientRect ? getPos(to) : to;
    const goalX = goalPos.x;
    const goalY = goalPos.y;

    let vy = initialVelocity.y;
    let vx = initialVelocity.x;

    return new Promise((resolve) => {
        let previous;
        (function frame(time) {
            const firstFrame = !previous;
            const elapsed = firstFrame ? 0 : time - previous;
            previous = time;

            const x = firstFrame ? startPos.x : thing.offsetLeft + vx;
            const y = firstFrame ? startPos.y : thing.offsetTop + vy;
            specificsPerFrame();
            thing.style.left = `${x}px`;
            thing.style.top = `${y}px`;
            const direction = {
                x: goalX - x,
                y: goalY - y
            }

            const framerateAdjust = firstFrame ? 1 : 16.666666666 / elapsed;

            const distance = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
            const force = {
                x: direction.x * framerateAdjust / distance,
                y: direction.y * framerateAdjust / distance
            }

            vx += force.x;
            vy += force.y;

            if (Math.abs(x - goalX) >= 25 && Math.abs(y - goalY) >= 25) {
                requestAnimationFrame(frame);
            } else {
                resolve();
            }
        }());
    });
}

function orbit(thing, from, to, initialVelocity, specificsPerFrame) {
    function getPos(el) {
        const rect = el.getBoundingClientRect();
        return {x: rect.left, y: rect.top};
    }

    const startPos = from.getBoundingClientRect ? getPos(from) : from;
    const goalPos = to.getBoundingClientRect ? getPos(to) : to;
    const goalX = goalPos.x;
    const goalY = goalPos.y;

    let vy = initialVelocity.y;
    let vx = initialVelocity.x;

    return new Promise((resolve) => {
        let previous;
        (function frame(time) {
            const firstFrame = !previous;
            const elapsed = firstFrame ? 0 : time - previous;
            previous = time;

            const x = firstFrame ? startPos.x : thing.offsetLeft + vx;
            const y = firstFrame ? startPos.y : thing.offsetTop + vy;
            specificsPerFrame();
            thing.style.left = `${x}px`;
            thing.style.top = `${y}px`;
            const direction = {
                x: goalX - x,
                y: goalY - y
            }

            const framerateAdjust = firstFrame ? 1 : 16.666666666 / elapsed;

            const distance = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
            const force = {
                x: direction.x * vx * framerateAdjust / Math.pow(distance, 2),
                y: direction.y * vy * framerateAdjust / Math.pow(distance, 2)
            }

            vx += force.x;
            vy += force.y;

            requestAnimationFrame(frame);
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
        this.dead = options.dead;
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
                    ${this.dead ? '' : `<path class="flame"
                          d="M101.011,112.926c0,0,8.973,10.519,4.556,16.543C99.37,129.735,106.752,117.406,101.011,112.926z"
                          fill="#F36E21"/>
                    <path class="flame one"
                          d="M55.592,126.854c0,0-3.819,13.29,2.699,16.945C64.038,141.48,55.907,132.263,55.592,126.854z"
                          fill="#F36E21"/>
                    <path class="flame two"
                          d="M54.918,104.595c0,0-3.959,6.109-1.24,8.949C56.93,113.256,52.228,107.329,54.918,104.595z"
                          fill="#F36E21"/>`}
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
        if (this.dead) return '<img src="img/glass-jar.png" alt="glass jar" class="captured-flame-jar">' + this.renderEvilFlame();
        return this.evil ? this.renderEvilFlame() : this.renderGoodFlame();
    }
}