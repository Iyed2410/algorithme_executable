"use strict";
// ─── Built-in functions for the .algo interpreter ───
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
exports.openFiles = void 0;
exports.getBuiltins = getBuiltins;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const environment_1 = require("./environment");
exports.openFiles = new Map();
function getBuiltins() {
    return {
        // ─── String functions ───
        'long': (args, line) => {
            expectArgCount('long', args, 1, line);
            return String(args[0]).length;
        },
        'pos': (args, line) => {
            expectArgCount('pos', args, 2, line);
            const idx = String(args[1]).indexOf(String(args[0]));
            return idx; // returns -1 if not found
        },
        'sous_chaîne': (args, line) => {
            expectArgCount('sous_chaîne', args, 3, line);
            const ch = String(args[0]);
            const d = Number(args[1]);
            const f = Number(args[2]);
            return ch.substring(d, f);
        },
        'sous_chaine': (args, line) => {
            expectArgCount('sous_chaine', args, 3, line);
            const ch = String(args[0]);
            const d = Number(args[1]);
            const f = Number(args[2]);
            return ch.substring(d, f);
        },
        'effacer': (args, line) => {
            expectArgCount('effacer', args, 3, line);
            const ch = String(args[0]);
            const d = Number(args[1]);
            const f = Number(args[2]);
            return ch.substring(0, d) + ch.substring(f);
        },
        'majus': (args, line) => {
            expectArgCount('majus', args, 1, line);
            return String(args[0]).toUpperCase();
        },
        'convch': (args, line) => {
            expectArgCount('convch', args, 1, line);
            return String(args[0]);
        },
        'valeur': (args, line) => {
            expectArgCount('valeur', args, 1, line);
            const s = String(args[0]);
            const n = Number(s);
            if (isNaN(n))
                throw new environment_1.AlgoRuntimeError(`Impossible de convertir '${s}' en nombre`, line);
            return n;
        },
        'estnum': (args, line) => {
            expectArgCount('estnum', args, 1, line);
            const s = String(args[0]);
            // Match isdecimal() behavior: only digits
            return /^\d+$/.test(s);
        },
        // ─── Character functions ───
        'ord': (args, line) => {
            expectArgCount('ord', args, 1, line);
            return String(args[0]).charCodeAt(0);
        },
        'chr': (args, line) => {
            expectArgCount('chr', args, 1, line);
            return String.fromCharCode(Number(args[0]));
        },
        // ─── Numeric functions ───
        'arrondi': (args, line) => {
            expectArgCount('arrondi', args, 1, line);
            return Math.round(Number(args[0]));
        },
        'ent': (args, line) => {
            expectArgCount('ent', args, 1, line);
            return Math.floor(Number(args[0]));
        },
        'abs': (args, line) => {
            expectArgCount('abs', args, 1, line);
            return Math.abs(Number(args[0]));
        },
        'racine_carrée': (args, line) => {
            expectArgCount('racine_carrée', args, 1, line);
            const x = Number(args[0]);
            if (x < 0)
                throw new environment_1.AlgoRuntimeError('racine_carrée: nombre négatif', line);
            return Math.sqrt(x);
        },
        'racine_carree': (args, line) => {
            expectArgCount('racine_carree', args, 1, line);
            const x = Number(args[0]);
            if (x < 0)
                throw new environment_1.AlgoRuntimeError('racine_carree: nombre négatif', line);
            return Math.sqrt(x);
        },
        'aléa': (args, line) => {
            expectArgCount('aléa', args, 2, line);
            const vi = Math.ceil(Number(args[0]));
            const vf = Math.floor(Number(args[1]));
            return Math.floor(Math.random() * (vf - vi + 1)) + vi;
        },
        'alea': (args, line) => {
            expectArgCount('alea', args, 2, line);
            const vi = Math.ceil(Number(args[0]));
            const vf = Math.floor(Number(args[1]));
            return Math.floor(Math.random() * (vf - vi + 1)) + vi;
        },
        // ─── File functions ───
        'ouvrir': (args, line, workDir) => {
            expectArgCount('ouvrir', args, 3, line);
            const filePath = String(args[0]);
            const logicalName = String(args[1]).toLowerCase();
            const mode = String(args[2]);
            const fullPath = path.isAbsolute(filePath) ? filePath : path.join(workDir, filePath);
            let isBinary = mode.includes('b');
            const handle = {
                fd: 0,
                path: fullPath,
                mode,
                buffer: [],
                bufferPos: 0,
                isBinary,
                content: [],
                contentPos: 0,
            };
            if (mode === 'r' || mode === 'rb') {
                if (!fs.existsSync(fullPath)) {
                    throw new environment_1.AlgoRuntimeError(`Fichier non trouvé: '${fullPath}'`, line);
                }
                if (isBinary) {
                    // Read all data (we'll simulate with JSON serialization)
                    try {
                        const raw = fs.readFileSync(fullPath, 'utf-8');
                        handle.content = JSON.parse(raw);
                        handle.contentPos = 0;
                    }
                    catch {
                        handle.content = [];
                        handle.contentPos = 0;
                    }
                }
                else {
                    let raw = fs.readFileSync(fullPath, 'utf-8');
                    // Strip trailing newline so we don't end up with a blank last line
                    if (raw.endsWith('\n')) {
                        raw = raw.slice(0, -1);
                    }
                    if (raw.endsWith('\r')) {
                        raw = raw.slice(0, -1);
                    }
                    let lines = raw ? raw.split(/\r?\n/) : [];
                    // Some editors add multiple trailing newlines, be robust
                    while (lines.length > 0 && lines[lines.length - 1] === '') {
                        lines.pop();
                    }
                    handle.buffer = lines;
                    handle.bufferPos = 0;
                }
            }
            else if (mode === 'w' || mode === 'wb') {
                // Create/truncate
                fs.writeFileSync(fullPath, '', 'utf-8');
                if (isBinary) {
                    handle.content = [];
                    handle.contentPos = 0;
                }
            }
            else if (mode === 'a' || mode === 'ab') {
                // Append
                if (isBinary) {
                    try {
                        const raw = fs.readFileSync(fullPath, 'utf-8');
                        handle.content = JSON.parse(raw);
                    }
                    catch {
                        handle.content = [];
                    }
                    handle.contentPos = handle.content.length;
                }
            }
            exports.openFiles.set(logicalName, handle);
            return null;
        },
        'fermer': (args, line) => {
            expectArgCount('fermer', args, 1, line);
            const logicalName = String(args[0]).toLowerCase();
            const handle = exports.openFiles.get(logicalName);
            if (!handle)
                throw new environment_1.AlgoRuntimeError(`Fichier non ouvert: '${logicalName}'`, line);
            // Write binary data if mode was write/append
            if (handle.isBinary && (handle.mode === 'wb' || handle.mode === 'ab')) {
                fs.writeFileSync(handle.path, JSON.stringify(handle.content), 'utf-8');
            }
            exports.openFiles.delete(logicalName);
            return null;
        },
        'fin_fichier': (args, line) => {
            expectArgCount('fin_fichier', args, 1, line);
            const logicalName = String(args[0]).toLowerCase();
            const handle = exports.openFiles.get(logicalName);
            if (!handle)
                throw new environment_1.AlgoRuntimeError(`Fichier non ouvert: '${logicalName}'`, line);
            if (handle.isBinary) {
                return handle.contentPos >= handle.content.length;
            }
            return handle.bufferPos >= handle.buffer.length;
        },
        'taille_fichier': (args, line) => {
            expectArgCount('taille_fichier', args, 1, line);
            const logicalName = String(args[0]).toLowerCase();
            const handle = exports.openFiles.get(logicalName);
            if (!handle)
                throw new environment_1.AlgoRuntimeError(`Fichier non ouvert: '${logicalName}'`, line);
            if (handle.isBinary)
                return handle.content.length;
            return handle.buffer.length;
        },
        'pointer': (args, line) => {
            expectArgCount('pointer', args, 2, line);
            const logicalName = String(args[0]).toLowerCase();
            const pos = Number(args[1]);
            const handle = exports.openFiles.get(logicalName);
            if (!handle)
                throw new environment_1.AlgoRuntimeError(`Fichier non ouvert: '${logicalName}'`, line);
            if (handle.isBinary) {
                handle.contentPos = pos;
            }
            else {
                handle.bufferPos = pos;
            }
            return null;
        },
    };
}
function expectArgCount(name, args, expected, line) {
    if (args.length !== expected) {
        throw new environment_1.AlgoRuntimeError(`${name}: attendu ${expected} argument(s), reçu ${args.length}`, line);
    }
}
//# sourceMappingURL=builtins.js.map