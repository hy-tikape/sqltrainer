delay = (durationMs, that) => {
    return new Promise(function (resolve) {
        setTimeout(resolve.bind(null, that), durationMs)
    });
}

hideElement = async id => {
    const element = document.getElementById(id);
    if (!element) return console.error(`Element by id ${id} not found`);
    element.classList.add("hidden-fadeout");
    await delay(200);
    element.classList.add("hidden");
    element.classList.remove("hidden-fadeout");
}

showElement = async id => {
    const element = document.getElementById(id);
    if (!element) return console.error(`Element by id ${id} not found`);
    element.classList.remove("hidden");
    await delay(10);
    element.classList.add("hidden-fadein");
    await delay(200)
    element.classList.remove("hidden-fadein");
}

removeElement = id => {
    const element = document.getElementById(id);
    if (element) element.remove();
}

showModal = (id, changeToViewAfter) => {
    return new Promise((resolve, reject) => {
        $(id).modal()
            .on('hidden.bs.modal', () => {
                $(id).off('hidden.bs.modal');
                resolve()
            });
    }).then(() => {
        return changeSecondaryView(changeToViewAfter ? changeToViewAfter : Views.NONE);
    });
}

shakeElement = async id => {
    const element = document.getElementById(id);
    await rotateRight(element);
    for (let i = 0; i < 3; i++) {
        await rotateLeft(element);
        await rotateRight(element);
    }
    element.style.transform = "";
}

shookElement = async id => {
    const element = document.getElementById(id);
    await moveRight(element);
    for (let i = 0; i < 2; i++) {
        await moveLeft(element);
        await moveRight(element);
    }
    element.style.transform = "";
}

rotateRight = async element => {
    element.style.transform = "rotate(5deg)";
    await delay(100);
}

rotateLeft = async element => {
    element.style.transform = "rotate(-5deg)";
    await delay(100);
}

moveRight = async element => {
    element.style.transform = "translate(7px)";
    await delay(100);
}

moveLeft = async element => {
    element.style.transform = "translate(-7px)";
    await delay(100);
}

shootConfetti = (durationMs, particles) => {
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