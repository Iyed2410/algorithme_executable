#!/usr/bin/env node
"use strict";
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
// Standalone test runner — runs .algo files from the command line
// Usage: node out/test-runner.js path/to/file.algo
const lexer_1 = require("./lexer");
const parser_1 = require("./parser");
const interpreter_1 = require("./interpreter");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const readline = __importStar(require("readline"));
const filePath = process.argv[2];
if (!filePath) {
    console.error('Usage: node out/test-runner.js <file.algo>');
    process.exit(1);
}
const fullPath = path.resolve(filePath);
if (!fs.existsSync(fullPath)) {
    console.error(`Fichier non trouvé: ${fullPath}`);
    process.exit(1);
}
const source = fs.readFileSync(fullPath, 'utf-8');
const workDir = path.dirname(fullPath);
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
const io = {
    write(text) {
        process.stdout.write(text);
    },
    async readInput(prompt) {
        return new Promise((resolve) => {
            rl.question(`📥 ${prompt}`, (answer) => {
                resolve(answer);
            });
        });
    },
};
async function main() {
    try {
        const lexer = new lexer_1.Lexer(source);
        const tokens = lexer.tokenize();
        const parser = new parser_1.Parser(tokens);
        const program = parser.parse();
        const interpreter = new interpreter_1.Interpreter(io, workDir);
        await interpreter.run(program);
    }
    catch (error) {
        console.error(`\n❌ ${error.message}`);
        process.exit(1);
    }
    finally {
        rl.close();
    }
}
main();
//# sourceMappingURL=test-runner.js.map