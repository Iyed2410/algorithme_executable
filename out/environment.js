"use strict";
// ─── Environment: variable scoping for the .algo interpreter ───
Object.defineProperty(exports, "__esModule", { value: true });
exports.Environment = exports.AlgoRuntimeError = void 0;
class AlgoRuntimeError extends Error {
    constructor(message, line) {
        super(`Erreur d'exécution à la ligne ${line}: ${message}`);
        this.line = line;
        this.name = 'AlgoRuntimeError';
    }
}
exports.AlgoRuntimeError = AlgoRuntimeError;
class Environment {
    constructor(parent = null) {
        this.vars = new Map();
        this.parent = parent;
    }
    /** Define a new variable in this scope. */
    define(name, value) {
        const lower = name.toLowerCase();
        this.vars.set(lower, { value });
    }
    /** Define using an existing Ref (for pass-by-reference). */
    defineRef(name, ref) {
        const lower = name.toLowerCase();
        this.vars.set(lower, ref);
    }
    /** Get the Ref object for a variable (walks scope chain). */
    getRef(name) {
        const lower = name.toLowerCase();
        const ref = this.vars.get(lower);
        if (ref !== undefined)
            return ref;
        if (this.parent)
            return this.parent.getRef(name);
        throw new Error(`Variable non définie: '${name}'`);
    }
    /** Get the value of a variable. */
    get(name) {
        return this.getRef(name).value;
    }
    /** Set the value of an existing variable (walks scope chain). */
    set(name, value) {
        const ref = this.getRef(name);
        ref.value = value;
    }
    /** Check if variable is defined (in any scope). */
    has(name) {
        const lower = name.toLowerCase();
        if (this.vars.has(lower))
            return true;
        if (this.parent)
            return this.parent.has(name);
        return false;
    }
    /** Check if variable is defined in THIS scope only (not parents). */
    hasLocal(name) {
        return this.vars.has(name.toLowerCase());
    }
}
exports.Environment = Environment;
//# sourceMappingURL=environment.js.map