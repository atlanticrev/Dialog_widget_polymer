/**
 * Utils
 */
const browsers = {
    chrome: {
        fixed: 22
    }
};

const browser = (() => {
    const name = navigator.appName;
    const userAgent = navigator.userAgent;
    let tem;
    let match = userAgent.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
    if (match && (tem = userAgent.match(/version\/([\.\d]+)/i)) != null) {
        match[2] = tem[1];
    }
    match = match ? [match[1], match[2]] : [name, navigator.appVersion, '-?'];

    return {
        name: match[0].toLowerCase(),
        version: match[1]
    }
})();

const isFixedStackingCtx = (() => {
    return browsers[browser.name].fixed >= parseInt(browser.version, 10);
})();

function isPosAndHasZindex (el) {
    // return el.style.position !== 'static' && el.style.zIndex !== 'auto';
    const styles = getComputedStyle(el);
    return styles.position !== 'static' && styles.zIndex !== 'auto'; 
}

function doesStyleCreateStackingCtx (el) {
    // const styles = el.style;
    const styles = getComputedStyle(el);
    if (styles.opacity < 1) {
        return true;
    }
    if (styles.transform !== 'none') {
        return true;
    }
    if (styles.transformStyle === 'preserve-3d') {
        return true;
    }
    if (styles.perspective !== 'none') {
        return true;
    }
    if (styles.flowFrom !== 'none' && styles.content !== 'normal') {
        return true;
    }
    if (styles.position === 'fixed' && isFixedStackingCtx) {
        return true;
    }
    return false;
}

/**
 * Main
 */
const layerManager = ((global) => {
    'use strict';
    
    return {
        isStackingCtx: (el) => {
            return el.tagName === 'HTML' || (isPosAndHasZindex(el) && doesStyleCreateStackingCtx(el));
        },
        getStackingCtx: (el) => {
            let parentNode = el.parentNode;
            while (!layerManager.isStackingCtx(parentNode)) {
                parentNode = parentNode.parentNode;
            }
            return parentNode;
        },
        bringToFront: (el, createStackingCtx, root) => {
            moveUpDown(el, createStackingCtx, root, true);
        },
        sendToBack: (el, createStackingCtx, root) => {
            moveUpDown(el, createStackingCtx, root, false);
        },
    };
})(this);

function moveUpDown(el, createStackingCtx, root, increment) {
    const stackingCtxEl = layerManager.getStackingCtx(el);
    if (createStackingCtx && stackingCtxEl !== el.parentNode) {
        if (createStackingCtx instanceof Function) {
            createStackingCtx(el.parentNode);
        } else {
            el.parentNode.style.position = 'relative';
            el.parentNode.style.zIndex = 0;
        }
    }
    modifyZindex(el, increment);
    if (root && (root !== stackingCtxEl && stackingCtxEl.tagName !== 'HTML')) {
        moveUpDown(stackingCtxEl, createStackingCtx, root, increment);
    }
}

function modifyZindex(el, increment) {
    var stackingCtxEl = layerManager.getStackingCtx(el);
    var siblings = stackingCtxEl.childNodes;
    var siblingsMaxMinZindex = increment ? 0 : -1;
    var siblingZindex;
    // loop through element's siblings
    for (var i = 0; i < siblings.length; i++) {
        // if current element has a z-index and is not el...
        if (siblings[i].nodeType === 1 && isPosAndHasZindex(siblings[i]) && siblings[i] !== el) {
            // check if sibling has a z-index value
            siblingZindex = parseInt(siblings[i].style.zIndex, 10);
            if (isNaN(siblingZindex)) {
                continue;
            }
            if (increment) {
                // update max z-index value for siblings
                siblingsMaxMinZindex = siblingZindex > siblingsMaxMinZindex ? siblingZindex : siblingsMaxMinZindex;
            } else {
                // update min z-index value for siblings
                siblingsMaxMinZindex = siblingsMaxMinZindex < 0 ||
                siblingZindex < siblingsMaxMinZindex ? siblingZindex : siblingsMaxMinZindex;
            }
        }
    }
    // if adjusted z-index is 0 and we're sending to the back, bump
    // all other elements up by 1
    if (!siblingsMaxMinZindex && !increment) {
        for (i = 0; i < siblings.length; i++) {
            if (siblings[i].nodeType === 1 && siblings[i] !== el) {
                siblingZindex = parseInt(siblings[i].style.zIndex, 10);
                if (isNaN(siblingZindex)) {
                    continue;
                }
                siblings[i].style.zIndex = ++siblingZindex;
            }
        }
    }
    // adjust element's z-index
    el.style.zIndex = increment ? siblingsMaxMinZindex + 1 : (siblingsMaxMinZindex ? siblingsMaxMinZindex - 1 : 0);
}

