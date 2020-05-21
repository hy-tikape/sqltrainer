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
    element.classList.add("hidden-fadein");
    element.classList.remove("hidden");
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

rotateRight = element => {
    element.style.transform = "rotate(5deg)";
    return delay(100);
}

rotateLeft = element => {
    element.style.transform = "rotate(-5deg)";
    return delay(100);
}