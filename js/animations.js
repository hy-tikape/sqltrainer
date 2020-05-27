const transitionDurationMs = 200;

delay = (t, v) => {
    return new Promise(function (resolve) {
        setTimeout(resolve.bind(null, v), t)
    });
}

hideElement = id => {
    const element = document.getElementById(id);
    element.classList.add("hidden-fadeout");
    return delay(transitionDurationMs).then(() => {
        element.classList.add("hidden");
        element.classList.remove("hidden-fadeout");
    });
}

showElement = id => {
    const element = document.getElementById(id);
    element.classList.remove("hidden");
    element.classList.add("hidden-fadein");
    return delay(transitionDurationMs).then(() => {
        element.classList.remove("hidden-fadein");
    });
}

removeElement = id => {
    const element = document.getElementById(id);
    if (element) element.remove();
}

shakeElement = id => {
    const element = document.getElementById(id);
    return rotateRight(element)
        .then(() => rotateLeft(element))
        .then(() => rotateRight(element))
        .then(() => rotateLeft(element))
        .then(() => rotateRight(element))
        .then(() => rotateLeft(element))
        .then(() => rotateRight(element))
        .then(() => {
            element.style.transform = "";
        })
}

shookElement = id => {
    const element = document.getElementById(id);
    return moveRight(element)
        .then(() => moveLeft(element))
        .then(() => moveRight(element))
        .then(() => moveLeft(element))
        .then(() => moveRight(element))
        .then(() => {
            element.style.transform = "";
        })
}

rotateRight = element => {
    element.style.transform = "rotate(5deg)";
    return delay(100);
}

rotateLeft = element => {
    element.style.transform = "rotate(-5deg)";
    return delay(100);
}

moveRight = element => {
    element.style.transform = "translate(7px)";
    return delay(100);
}

moveLeft = element => {
    element.style.transform = "translate(-7px)";
    return delay(100);
}

shootConfetti = (durationMs, particles) => {
    const end = Date.now() + durationMs;
    (function frame() {
        confetti({
            particleCount: particles ? particles : 5,
            angle: 60,
            spread: 55,
            origin: {x: 0, y: 0.8}
        });
        confetti({
            particleCount: particles ? particles : 5,
            angle: 120,
            spread: 55,
            origin: {x: 1, y: 0.8}
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}