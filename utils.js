function getPageOffsets (el) {
    return {
        x: window.pageXOffset + el.getBoundingClientRect().left - document.documentElement.clientLeft,
        y: window.pageYOffset + el.getBoundingClientRect().top - document.documentElement.clientTop
    };
}