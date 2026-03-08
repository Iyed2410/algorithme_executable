"use strict";
// ─── Tree-walking Interpreter for .algo pseudocode ───
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Interpreter = void 0;
const environment_1 = require("./environment");
const builtins_1 = require("./builtins");
const fs = __importStar(require("fs"));
/** Signal thrown when a function executes `retourner`. */
class ReturnSignal {
    constructor(value) {
        this.value = value;
    }
}
class Interpreter {
    constructor(io, workDir) {
        this.functions = new Map();
        this.procedures = new Map();
        this.globalEnv = new environment_1.Environment();
        this.builtins = (0, builtins_1.getBuiltins)();
        this.io = io;
        this.workDir = workDir;
    }
    async run(program) {
        // Register user-defined functions and procedures
        for (const fn of program.functions) {
            this.functions.set(fn.name.toLowerCase(), fn);
        }
        for (const proc of program.procedures) {
            this.procedures.set(proc.name.toLowerCase(), proc);
        }
        // Execute the main algorithm
        await this.executeBlock(program.algorithm.body, this.globalEnv);
    }
    // ─── Statement execution ───
    async executeBlock(statements, env) {
        for (const stmt of statements) {
            await this.executeStatement(stmt, env);
        }
    }
    async executeStatement(node, env) {
        switch (node.type) {
            case 'AssignmentStmt':
                await this.execAssignment(node, env);
                break;
            case 'IfStmt':
                await this.execIf(node, env);
                break;
            case 'ForLoop':
                await this.execFor(node, env);
                break;
            case 'WhileLoop':
                await this.execWhile(node, env);
                break;
            case 'RepeatUntil':
                await this.execRepeat(node, env);
                break;
            case 'SwitchStmt':
                await this.execSwitch(node, env);
                break;
            case 'ReturnStmt':
                throw new ReturnSignal(await this.evaluate(node.value, env));
            case 'CallStmt':
                await this.execCall(node, env);
                break;
            case 'ReadStmt':
                await this.execRead(node, env);
                break;
            case 'WriteStmt':
                await this.execWrite(node, env);
                break;
            default:
                // Expression statements or unrecognized — evaluate and discard
                await this.evaluate(node, env);
        }
    }
    async execAssignment(node, env) {
        const value = await this.evaluate(node.value, env);
        await this.assignTarget(node.target, value, env);
    }
    async assignTarget(target, value, env) {
        if (target.type === 'Identifier') {
            if (env.hasLocal(target.name)) {
                env.set(target.name, value);
            }
            else {
                env.define(target.name, value);
            }
        }
        else if (target.type === 'ArrayAccess') {
            let arr = await this.evaluate(target.array, env);
            // Auto-create array if it doesn't exist or isn't an array
            if (!Array.isArray(arr) && typeof arr !== 'string') {
                if (target.array.type === 'Identifier') {
                    const arrName = target.array.name;
                    arr = [];
                    if (env.hasLocal(arrName)) {
                        env.set(arrName, arr);
                    }
                    else {
                        env.define(arrName, arr);
                    }
                }
            }
            if (target.indices.length === 1) {
                const idx = await this.evaluate(target.indices[0], env);
                if (typeof arr === 'string') {
                    // String character assignment — rebuild string
                    const arrNode = target.array;
                    const str = String(arr);
                    const i = Number(idx);
                    const newStr = str.substring(0, i) + String(value) + str.substring(i + 1);
                    if (arrNode.type === 'Identifier') {
                        env.set(arrNode.name, newStr);
                    }
                }
                else if (Array.isArray(arr)) {
                    arr[Number(idx)] = value;
                }
            }
            else if (target.indices.length === 2) {
                const i = Number(await this.evaluate(target.indices[0], env));
                const j = Number(await this.evaluate(target.indices[1], env));
                if (Array.isArray(arr)) {
                    if (!Array.isArray(arr[i])) {
                        arr[i] = [];
                    }
                    arr[i][j] = value;
                }
            }
        }
        else if (target.type === 'FieldAccess') {
            let obj = await this.evaluate(target.object, env);
            // Auto-create object if it doesn't exist
            if (obj === null || obj === undefined || typeof obj !== 'object') {
                if (target.object.type === 'Identifier') {
                    const name = target.object.name;
                    obj = {};
                    if (env.hasLocal(name)) {
                        env.set(name, obj);
                    }
                    else {
                        env.define(name, obj);
                    }
                }
                else if (target.object.type === 'ArrayAccess' || target.object.type === 'FieldAccess') {
                    await this.assignTarget(target.object, {}, env);
                    obj = await this.evaluate(target.object, env);
                }
            }
            if (obj && typeof obj === 'object') {
                const fieldName = target.field.toLowerCase();
                obj[fieldName] = value;
            }
        }
    }
    async execIf(node, env) {
        const cond = await this.evaluate(node.condition, env);
        if (this.isTruthy(cond)) {
            await this.executeBlock(node.thenBranch, env);
        }
        else if (node.elseBranch) {
            await this.executeBlock(node.elseBranch, env);
        }
    }
    async execFor(node, env) {
        const start = Number(await this.evaluate(node.start, env));
        const end = Number(await this.evaluate(node.end, env));
        const step = node.step ? Number(await this.evaluate(node.step, env)) : 1;
        if (!env.has(node.counter)) {
            env.define(node.counter, start);
        }
        else {
            env.set(node.counter, start);
        }
        if (step > 0) {
            for (let i = start; i <= end; i += step) {
                env.set(node.counter, i);
                await this.executeBlock(node.body, env);
            }
        }
        else if (step < 0) {
            for (let i = start; i >= end; i += step) {
                env.set(node.counter, i);
                await this.executeBlock(node.body, env);
            }
        }
    }
    async execWhile(node, env) {
        while (this.isTruthy(await this.evaluate(node.condition, env))) {
            await this.executeBlock(node.body, env);
        }
    }
    async execRepeat(node, env) {
        do {
            await this.executeBlock(node.body, env);
        } while (!this.isTruthy(await this.evaluate(node.condition, env)));
    }
    async execSwitch(node, env) {
        const selector = await this.evaluate(node.selector, env);
        let matched = false;
        for (const c of node.cases) {
            for (const v of c.values) {
                if (v.type === 'RangeValue') {
                    const rangeStart = await this.evaluate(v.start, env);
                    const rangeEnd = await this.evaluate(v.end, env);
                    if (selector >= rangeStart && selector <= rangeEnd) {
                        matched = true;
                    }
                }
                else {
                    const val = await this.evaluate(v, env);
                    if (selector === val) {
                        matched = true;
                    }
                }
            }
            if (matched) {
                await this.executeBlock(c.body, env);
                return;
            }
        }
        if (node.defaultCase) {
            await this.executeBlock(node.defaultCase, env);
        }
    }
    async execCall(node, env) {
        const name = node.name.toLowerCase();
        // Check built-in functions used as procedures
        if (name === 'ouvrir') {
            const args = [];
            if (node.args.length > 0)
                args.push(await this.evaluate(node.args[0], env));
            if (node.args.length > 1) {
                if (node.args[1].type === 'Identifier') {
                    args.push(node.args[1].name);
                }
                else {
                    args.push(await this.evaluate(node.args[1], env));
                }
            }
            if (node.args.length > 2)
                args.push(await this.evaluate(node.args[2], env));
            this.builtins[name](args, node.line, this.workDir);
            return;
        }
        if (name === 'fermer' || name === 'pointer') {
            const args = [];
            if (node.args.length > 0) {
                if (node.args[0].type === 'Identifier') {
                    args.push(node.args[0].name);
                }
                else {
                    args.push(await this.evaluate(node.args[0], env));
                }
            }
            if (node.args.length > 1)
                args.push(await this.evaluate(node.args[1], env));
            this.builtins[name](args, node.line, this.workDir);
            return;
        }
        if (name === 'lire_ligne') {
            if (node.args.length >= 2) {
                const firstArg = node.args[0];
                if (firstArg.type === 'Identifier') {
                    const fName = firstArg.name.toLowerCase();
                    if (builtins_1.openFiles.has(fName)) {
                        const handle = builtins_1.openFiles.get(fName);
                        let readValue;
                        if (handle.bufferPos < handle.buffer.length) {
                            readValue = handle.buffer[handle.bufferPos];
                            handle.bufferPos++;
                        }
                        else {
                            readValue = '';
                        }
                        const target = node.args[1];
                        await this.assignTarget(target, readValue, env);
                        return;
                    }
                }
            }
            throw new environment_1.AlgoRuntimeError("lire_ligne nécessite un handle de fichier valide", node.line);
        }
        // User-defined procedure
        const proc = this.procedures.get(name);
        if (proc) {
            await this.callProcedure(proc, node.args, env, node.line);
            return;
        }
        // Maybe it's a user-defined function called as procedure (discard result)
        const fn = this.functions.get(name);
        if (fn) {
            await this.callFunction(fn, node.args, env, node.line);
            return;
        }
        // Built-in used as procedure
        if (this.builtins[name]) {
            const args = [];
            for (const a of node.args) {
                args.push(await this.evaluate(a, env));
            }
            this.builtins[name](args, node.line, this.workDir);
            return;
        }
        throw new environment_1.AlgoRuntimeError(`Procédure non définie: '${node.name}'`, node.line);
    }
    async execRead(node, env) {
        // If first arg is a file handle, read from file
        if (node.args.length >= 2) {
            const firstArg = node.args[0];
            if (firstArg.type === 'Identifier') {
                const fName = firstArg.name.toLowerCase();
                if (builtins_1.openFiles.has(fName)) {
                    const handle = builtins_1.openFiles.get(fName);
                    let readValue;
                    if (!handle.isBinary) {
                        if (handle.bufferPos < handle.buffer.length) {
                            readValue = handle.buffer[handle.bufferPos];
                            handle.bufferPos++;
                        }
                        else {
                            readValue = '';
                        }
                    }
                    else {
                        if (handle.contentPos < handle.content.length) {
                            readValue = handle.content[handle.contentPos];
                            handle.contentPos++;
                        }
                        else {
                            throw new environment_1.AlgoRuntimeError('Fin du fichier atteinte', node.line);
                        }
                    }
                    // Assign the read value to the second argument
                    const target = node.args[1];
                    await this.assignTarget(target, readValue, env);
                    return;
                }
            }
        }
        for (const arg of node.args) {
            const prompt = arg.type === 'Identifier' ? `${arg.name} = ` : '? ';
            const input = await this.io.readInput(prompt);
            // Try to parse as number
            let value = input;
            const num = Number(input);
            if (!isNaN(num) && input.trim() !== '') {
                value = num;
            }
            await this.assignTarget(arg, value, env);
        }
    }
    async execWrite(node, env) {
        // If first arg is a file handle reference, write to file
        if (node.args.length >= 2) {
            const firstArg = node.args[0];
            if (firstArg.type === 'Identifier') {
                const fName = firstArg.name.toLowerCase();
                if (builtins_1.openFiles.has(fName)) {
                    const handle = builtins_1.openFiles.get(fName);
                    const value = await this.evaluate(node.args[1], env);
                    if (handle.isBinary) {
                        handle.content.push(value);
                    }
                    else {
                        const nl = node.newline ? '\n' : '';
                        fs.appendFileSync(handle.path, String(value) + nl, 'utf-8');
                    }
                    return;
                }
            }
        }
        const parts = [];
        for (const arg of node.args) {
            const val = await this.evaluate(arg, env);
            parts.push(this.formatValue(val));
        }
        const output = parts.join('');
        this.io.write(output + '\n');
    }
    formatValue(val) {
        if (val === null || val === undefined)
            return '';
        if (typeof val === 'boolean')
            return val ? 'Vrai' : 'Faux';
        if (Array.isArray(val))
            return '[' + val.map(v => this.formatValue(v)).join(', ') + ']';
        if (typeof val === 'object')
            return JSON.stringify(val);
        return String(val);
    }
    // ─── Expression evaluation ───
    async evaluate(node, env) {
        switch (node.type) {
            case 'Literal':
                return node.value;
            case 'Identifier': {
                const id = node;
                if (env.has(id.name)) {
                    return env.get(id.name);
                }
                // It could be a file handle name — return the name itself
                if (builtins_1.openFiles.has(id.name.toLowerCase())) {
                    return id.name.toLowerCase();
                }
                // Auto-initialize to default
                return 0;
            }
            case 'BinaryExpr':
                return this.evalBinary(node, env);
            case 'UnaryExpr':
                return this.evalUnary(node, env);
            case 'ArrayAccess': {
                const aa = node;
                const arr = await this.evaluate(aa.array, env);
                if (aa.indices.length === 1) {
                    const idx = Number(await this.evaluate(aa.indices[0], env));
                    if (typeof arr === 'string')
                        return arr.charAt(idx) || '';
                    if (Array.isArray(arr))
                        return arr[idx];
                    return undefined;
                }
                if (aa.indices.length === 2) {
                    const i = Number(await this.evaluate(aa.indices[0], env));
                    const j = Number(await this.evaluate(aa.indices[1], env));
                    if (Array.isArray(arr) && Array.isArray(arr[i]))
                        return arr[i][j];
                    return undefined;
                }
                return undefined;
            }
            case 'FieldAccess':
                return this.evalFieldAccess(node, env);
            case 'FunctionCallExpr':
                return this.evalFunctionCall(node, env);
            default:
                return undefined;
        }
    }
    async evalBinary(node, env) {
        const left = await this.evaluate(node.left, env);
        const right = await this.evaluate(node.right, env);
        const op = node.op.toLowerCase();
        switch (op) {
            case '+':
                if (typeof left === 'string' || typeof right === 'string') {
                    return String(left) + String(right);
                }
                return Number(left) + Number(right);
            case '-': return Number(left) - Number(right);
            case '*': return Number(left) * Number(right);
            case '/': {
                const r = Number(right);
                if (r === 0)
                    throw new environment_1.AlgoRuntimeError('Division par zéro', node.line);
                return Number(left) / r;
            }
            case 'div': {
                const r = Number(right);
                if (r === 0)
                    throw new environment_1.AlgoRuntimeError('Division par zéro', node.line);
                return Math.trunc(Number(left) / r);
            }
            case 'mod': {
                const r = Number(right);
                if (r === 0)
                    throw new environment_1.AlgoRuntimeError('Division par zéro', node.line);
                return Number(left) % r;
            }
            case '=': return left === right || (Number(left) === Number(right) && !isNaN(Number(left)));
            case '≠': return left !== right && !(Number(left) === Number(right) && !isNaN(Number(left)));
            case '<': return left < right;
            case '>': return left > right;
            case '≤': return left <= right;
            case '≥': return left >= right;
            case 'et': return this.isTruthy(left) && this.isTruthy(right);
            case 'ou': return this.isTruthy(left) || this.isTruthy(right);
            case 'ouex': return this.isTruthy(left) !== this.isTruthy(right);
            default:
                throw new environment_1.AlgoRuntimeError(`Opérateur inconnu: '${op}'`, node.line);
        }
    }
    async evalFieldAccess(node, env) {
        const obj = await this.evaluate(node.object, env);
        if (!obj || typeof obj !== 'object') {
            return undefined;
        }
        const fieldName = node.field.toLowerCase();
        return obj[fieldName];
    }
    async evalUnary(node, env) {
        const val = await this.evaluate(node.operand, env);
        switch (node.op) {
            case '-': return -Number(val);
            case 'non': return !this.isTruthy(val);
            default:
                throw new environment_1.AlgoRuntimeError(`Opérateur unaire inconnu: '${node.op}'`, node.line);
        }
    }
    async evalFunctionCall(node, env) {
        const name = node.name.toLowerCase();
        if (name === 'fin_fichier' || name === 'taille_fichier') {
            const args = [];
            if (node.args.length > 0) {
                if (node.args[0].type === 'Identifier') {
                    args.push(node.args[0].name);
                }
                else {
                    args.push(await this.evaluate(node.args[0], env));
                }
            }
            return this.builtins[name](args, node.line, this.workDir);
        }
        // Built-in functions
        if (this.builtins[name]) {
            const args = [];
            for (const a of node.args) {
                args.push(await this.evaluate(a, env));
            }
            return this.builtins[name](args, node.line, this.workDir);
        }
        // User-defined function
        const fn = this.functions.get(name);
        if (fn) {
            return this.callFunction(fn, node.args, env, node.line);
        }
        // User-defined procedure (shouldn't be called as expression, but handle it)
        const proc = this.procedures.get(name);
        if (proc) {
            await this.callProcedure(proc, node.args, env, node.line);
            return null;
        }
        throw new environment_1.AlgoRuntimeError(`Fonction non définie: '${node.name}'`, node.line);
    }
    // ─── Function / Procedure calls ───
    async callFunction(fn, argNodes, callerEnv, callLine) {
        const localEnv = new environment_1.Environment(this.globalEnv);
        await this.bindParams(fn.params, argNodes, callerEnv, localEnv, callLine);
        try {
            await this.executeBlock(fn.body, localEnv);
        }
        catch (e) {
            if (e instanceof ReturnSignal) {
                return e.value;
            }
            throw e;
        }
        return null;
    }
    async callProcedure(proc, argNodes, callerEnv, callLine) {
        const localEnv = new environment_1.Environment(this.globalEnv);
        await this.bindParams(proc.params, argNodes, callerEnv, localEnv, callLine);
        try {
            await this.executeBlock(proc.body, localEnv);
        }
        catch (e) {
            if (e instanceof ReturnSignal) {
                return; // Procedures can return without value
            }
            throw e;
        }
    }
    async bindParams(params, argNodes, callerEnv, localEnv, callLine) {
        for (let i = 0; i < params.length; i++) {
            const param = params[i];
            if (i >= argNodes.length) {
                // Missing argument — initialize with default
                localEnv.define(param.name, this.defaultForType(param.paramType));
                continue;
            }
            if (param.byRef) {
                // Pass by reference — share the Ref object
                const argNode = argNodes[i];
                if (argNode.type === 'Identifier') {
                    const argName = argNode.name;
                    if (!callerEnv.has(argName)) {
                        callerEnv.define(argName, this.defaultForType(param.paramType));
                    }
                    const ref = callerEnv.getRef(argName);
                    localEnv.defineRef(param.name, ref);
                }
                else if (argNode.type === 'ArrayAccess') {
                    // For array element pass-by-ref, we need a special wrapper
                    const val = await this.evaluate(argNode, callerEnv);
                    localEnv.define(param.name, val);
                    // TODO: true by-ref for array elements would need more complex refs
                }
                else {
                    const val = await this.evaluate(argNode, callerEnv);
                    localEnv.define(param.name, val);
                }
            }
            else {
                // Pass by value
                const val = await this.evaluate(argNodes[i], callerEnv);
                localEnv.define(param.name, val);
            }
        }
    }
    defaultForType(typeName) {
        const lower = typeName.toLowerCase();
        if (lower.includes('entier'))
            return 0;
        if (lower.includes('réel') || lower.includes('reel'))
            return 0.0;
        if (lower.includes('booléen') || lower.includes('booleen'))
            return false;
        if (lower.includes('caractère') || lower.includes('caractere'))
            return '';
        if (lower.includes('chaîne') || lower.includes('chaine'))
            return '';
        if (lower.includes('tableau') || lower.includes('tab')) {
            // Parse size if possible: "tableau de N type"
            const match = lower.match(/tableau de (\d+)/);
            if (match) {
                const size = parseInt(match[1]);
                return new Array(size).fill(0);
            }
            return [];
        }
        if (lower.includes('enregistrement'))
            return {};
        // Unknown types — likely user-defined array types, default to array
        if (!['entier', 'réel', 'reel', 'booléen', 'booleen', 'caractère', 'caractere', 'chaîne', 'chaine'].includes(lower)) {
            return [];
        }
        return 0;
    }
    isTruthy(val) {
        if (typeof val === 'boolean')
            return val;
        if (typeof val === 'number')
            return val !== 0;
        if (typeof val === 'string')
            return val.length > 0;
        if (val === null || val === undefined)
            return false;
        return true;
    }
}
exports.Interpreter = Interpreter;
//# sourceMappingURL=interpreter.js.map