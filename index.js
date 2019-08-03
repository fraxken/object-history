// CONSTANTS
const HISTORY = new WeakMap();

function pushHistoryRow(target, propertyKey, value, type = "add") {
    const row = { propertyKey, type, value };
    
    if (HISTORY.has(target)) {
        HISTORY.get(target).push(row);
    }
    else {
        HISTORY.set(target, [row]);
    }
}

function redoHistory(target, count = 1) {
    /** @type {Array<any>} */
    const historyForCurrentTarget = HISTORY.get(target) || [];
    if (historyForCurrentTarget.length === 0) {
        return;
    }
    let incr = count === Infinity || count > historyForCurrentTarget.length ? historyForCurrentTarget.length : count;

    while (historyForCurrentTarget.length > 0 && incr--) {
        const { type, propertyKey, value = null } = historyForCurrentTarget.pop();
        switch (type) {
            case "add":
                delete target[propertyKey];
                break;
            case "remove":
                Object.defineProperty(target, propertyKey, value);
                break;
        }
    }
}

function createHistoryObject(value) {
    if (typeof value !== "object" || value === null) {
        throw new TypeError("value must be a Javascript Object");
    }

    return new Proxy(value, {
        get(target, propertyKey) {
            switch(propertyKey) {
                case "_undo":
                    return (count) => redoHistory(target, count)
                default: 
                    return Reflect.get(target, propertyKey);
            }
        },
        set(target, propertyKey, value) {
            if (!Reflect.has(target, propertyKey)) {
                pushHistoryRow(target, propertyKey, value);
            }

            return Reflect.set(target, propertyKey, value);
        },
        deleteProperty(target, propertyKey) {
            if (!Reflect.has(target, propertyKey)) {
                return false;
            }

            const descriptor = Reflect.getOwnPropertyDescriptor(target, propertyKey);
            const isDeleted = Reflect.deleteProperty(target, propertyKey);
            if (isDeleted) {
                pushHistoryRow(target, propertyKey, descriptor, "remove");
            }

            return isDeleted;
        }
    });
}

module.exports = createHistoryObject;
