class Voltron {

    // Util
    static result (val) {
        val instanceof Function ? val() : val;
    }

    constructor (options) {
        this.init(options);
    }

    init (options) {
        this.options = Object.assign({}, this.defaults, options);
        this.el = options.el;
        this.bind();
        return this;
    }

    bind () {
        const events = this.options.events ? Voltron.result(this.options.events) : null;
        if (!events) {
            return this;
        }
        this.unbind(); // ?
        this._events = {}; // For unbind
        for (let event of events) {
            const method = events[event];
            if (!(method instanceof Function)) {
                method = this[events[event]];
            }
            if (!method) {
                continue;
            }
            const match = event.match(Voltron.delegateEventSplitter);
            const eventName = match[1];
            const selector = match[2];
            method = method.bind(this);
            if (selector.length) { // > 1 ?
                if (!this._events.eventName) {
                    this._events.eventName = [];
                }
                this._events.eventName.push(method);
                this.el.addEventListener(eventName, method, false); // (selector) ?
            } else {
                if (!this._events.eventName) {
                    this._events.eventName = [];
                }
                this._events.eventName.push(method);
                this.el.addEventListener(eventName, method, false);
            }
        }
    }

    unbind () {
        for (let event of Object.keys(this._events)) {
            for (let listener of event) {
                this.el.removeEventListener(event, listener, false);
            }
        }
        return this;
    }

    destroy () {
        this.unbind();
        this.el.remove();
    }

}

Voltron.delegateEventSplitter = /^(\S+)\s*(.*)$/;
Voltron.prototype.events = {};
Voltron.prototype.defaults = {};

class Dialog extends Voltron {

    constructor (options) {
        super(options);
    }

    render () {}

    show () {}

    hide () {}

}

Dialog.prototype.events = {};
Dialog.prototype.defaults = {};