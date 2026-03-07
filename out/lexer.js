"use strict";
// ─── Lexer / Tokenizer for .algo pseudocode ───
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lexer = exports.TokenType = void 0;
var TokenType;
(function (TokenType) {
    // Literals
    TokenType[TokenType["NUMBER"] = 0] = "NUMBER";
    TokenType[TokenType["STRING"] = 1] = "STRING";
    TokenType[TokenType["BOOLEAN"] = 2] = "BOOLEAN";
    // Identifier
    TokenType[TokenType["IDENTIFIER"] = 3] = "IDENTIFIER";
    // Keywords
    TokenType[TokenType["ALGORITHME"] = 4] = "ALGORITHME";
    TokenType[TokenType["DEBUT"] = 5] = "DEBUT";
    TokenType[TokenType["FIN"] = 6] = "FIN";
    TokenType[TokenType["SI"] = 7] = "SI";
    TokenType[TokenType["ALORS"] = 8] = "ALORS";
    TokenType[TokenType["SINON"] = 9] = "SINON";
    TokenType[TokenType["FIN_SI"] = 10] = "FIN_SI";
    TokenType[TokenType["POUR"] = 11] = "POUR";
    TokenType[TokenType["DE"] = 12] = "DE";
    TokenType[TokenType["A"] = 13] = "A";
    TokenType[TokenType["FAIRE"] = 14] = "FAIRE";
    TokenType[TokenType["FIN_POUR"] = 15] = "FIN_POUR";
    TokenType[TokenType["PAS"] = 16] = "PAS";
    TokenType[TokenType["TANT_QUE"] = 17] = "TANT_QUE";
    TokenType[TokenType["FIN_TANT_QUE"] = 18] = "FIN_TANT_QUE";
    TokenType[TokenType["REPETER"] = 19] = "REPETER";
    TokenType[TokenType["JUSQUA"] = 20] = "JUSQUA";
    TokenType[TokenType["SELON"] = 21] = "SELON";
    TokenType[TokenType["FIN_SELON"] = 22] = "FIN_SELON";
    TokenType[TokenType["FONCTION"] = 23] = "FONCTION";
    TokenType[TokenType["PROCEDURE"] = 24] = "PROCEDURE";
    TokenType[TokenType["RETOURNER"] = 25] = "RETOURNER";
    TokenType[TokenType["LIRE"] = 26] = "LIRE";
    TokenType[TokenType["ECRIRE"] = 27] = "ECRIRE";
    TokenType[TokenType["ECRIRE_NL"] = 28] = "ECRIRE_NL";
    // Types
    TokenType[TokenType["ENTIER"] = 29] = "ENTIER";
    TokenType[TokenType["REEL"] = 30] = "REEL";
    TokenType[TokenType["BOOLEEN"] = 31] = "BOOLEEN";
    TokenType[TokenType["CARACTERE"] = 32] = "CARACTERE";
    TokenType[TokenType["CHAINE"] = 33] = "CHAINE";
    TokenType[TokenType["TABLEAU"] = 34] = "TABLEAU";
    TokenType[TokenType["ENREGISTREMENT"] = 35] = "ENREGISTREMENT";
    TokenType[TokenType["FICHIER"] = 36] = "FICHIER";
    TokenType[TokenType["TEXTE"] = 37] = "TEXTE";
    // Operators
    TokenType[TokenType["ASSIGN"] = 38] = "ASSIGN";
    TokenType[TokenType["PLUS"] = 39] = "PLUS";
    TokenType[TokenType["MINUS"] = 40] = "MINUS";
    TokenType[TokenType["STAR"] = 41] = "STAR";
    TokenType[TokenType["SLASH"] = 42] = "SLASH";
    TokenType[TokenType["DIV"] = 43] = "DIV";
    TokenType[TokenType["MOD"] = 44] = "MOD";
    TokenType[TokenType["EQ"] = 45] = "EQ";
    TokenType[TokenType["NEQ"] = 46] = "NEQ";
    TokenType[TokenType["LT"] = 47] = "LT";
    TokenType[TokenType["GT"] = 48] = "GT";
    TokenType[TokenType["LTE"] = 49] = "LTE";
    TokenType[TokenType["GTE"] = 50] = "GTE";
    TokenType[TokenType["ET"] = 51] = "ET";
    TokenType[TokenType["OU"] = 52] = "OU";
    TokenType[TokenType["NON"] = 53] = "NON";
    TokenType[TokenType["OUEX"] = 54] = "OUEX";
    TokenType[TokenType["DOTDOT"] = 55] = "DOTDOT";
    // Punctuation
    TokenType[TokenType["LPAREN"] = 56] = "LPAREN";
    TokenType[TokenType["RPAREN"] = 57] = "RPAREN";
    TokenType[TokenType["LBRACKET"] = 58] = "LBRACKET";
    TokenType[TokenType["RBRACKET"] = 59] = "RBRACKET";
    TokenType[TokenType["COMMA"] = 60] = "COMMA";
    TokenType[TokenType["COLON"] = 61] = "COLON";
    TokenType[TokenType["SEMICOLON"] = 62] = "SEMICOLON";
    TokenType[TokenType["DOT"] = 63] = "DOT";
    TokenType[TokenType["AT"] = 64] = "AT";
    // Special
    TokenType[TokenType["EOF"] = 65] = "EOF";
    TokenType[TokenType["NEWLINE"] = 66] = "NEWLINE";
})(TokenType || (exports.TokenType = TokenType = {}));
// Keywords map (case-insensitive)
const KEYWORDS = {
    'algorithme': TokenType.ALGORITHME,
    'début': TokenType.DEBUT,
    'debut': TokenType.DEBUT,
    'fin': TokenType.FIN,
    'si': TokenType.SI,
    'alors': TokenType.ALORS,
    'sinon': TokenType.SINON,
    'fin_si': TokenType.FIN_SI,
    'finsi': TokenType.FIN_SI,
    'pour': TokenType.POUR,
    'de': TokenType.DE,
    'à': TokenType.A,
    'faire': TokenType.FAIRE,
    'fin_pour': TokenType.FIN_POUR,
    'finpour': TokenType.FIN_POUR,
    'pas': TokenType.PAS,
    'tant': TokenType.TANT_QUE, // handled specially as "tant que"
    'fin_tant_que': TokenType.FIN_TANT_QUE,
    'fintantque': TokenType.FIN_TANT_QUE,
    'répéter': TokenType.REPETER,
    'repeter': TokenType.REPETER,
    "jusqu'à": TokenType.JUSQUA,
    "jusqu'a": TokenType.JUSQUA,
    'jusqua': TokenType.JUSQUA,
    'selon': TokenType.SELON,
    'fin_selon': TokenType.FIN_SELON,
    'finselon': TokenType.FIN_SELON,
    'fonction': TokenType.FONCTION,
    'procédure': TokenType.PROCEDURE,
    'procedure': TokenType.PROCEDURE,
    'retourner': TokenType.RETOURNER,
    'lire': TokenType.LIRE,
    'écrire': TokenType.ECRIRE,
    'ecrire': TokenType.ECRIRE,
    'écrire_nl': TokenType.ECRIRE_NL,
    'ecrire_nl': TokenType.ECRIRE_NL,
    'entier': TokenType.ENTIER,
    'réel': TokenType.REEL,
    'reel': TokenType.REEL,
    'booléen': TokenType.BOOLEEN,
    'booleen': TokenType.BOOLEEN,
    'caractère': TokenType.CARACTERE,
    'caractere': TokenType.CARACTERE,
    'chaîne': TokenType.CHAINE,
    'chaine': TokenType.CHAINE,
    'tableau': TokenType.TABLEAU,
    'enregistrement': TokenType.ENREGISTREMENT,
    'fichier': TokenType.FICHIER,
    'texte': TokenType.TEXTE,
    'div': TokenType.DIV,
    'mod': TokenType.MOD,
    'et': TokenType.ET,
    'ou': TokenType.OU,
    'non': TokenType.NON,
    'ouex': TokenType.OUEX,
    'vrai': TokenType.BOOLEAN,
    'faux': TokenType.BOOLEAN,
};
// Characters that are part of the TDO/TDNT table drawings — skip them
const TABLE_CHARS = new Set('┌─┐├┤└┘┬┴┼│');
class Lexer {
    constructor(source) {
        this.pos = 0;
        this.line = 1;
        this.column = 1;
        this.tokens = [];
        // Normalize line endings
        this.source = source.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    }
    tokenize() {
        while (this.pos < this.source.length) {
            this.skipWhitespaceAndComments();
            if (this.pos >= this.source.length)
                break;
            const ch = this.source[this.pos];
            // Skip newlines (treat as whitespace for our purposes)
            if (ch === '\n') {
                this.line++;
                this.column = 1;
                this.pos++;
                continue;
            }
            // Skip TDO/TDNT table drawing lines
            if (TABLE_CHARS.has(ch)) {
                this.skipTableLine();
                continue;
            }
            // Skip lines that look like TDO headers: "Objet", "Nature / Type", "Nouveaux Types"
            // These are inside table drawings, we already skip table chars, but just in case
            // String literal
            if (ch === '"') {
                this.readString();
                continue;
            }
            // Number
            if (this.isDigit(ch)) {
                this.readNumber();
                continue;
            }
            // Assignment <-- or comparison operators
            if (ch === '<') {
                if (this.peek(1) === '-' && this.peek(2) === '-') {
                    this.tokens.push({ type: TokenType.ASSIGN, value: '<--', line: this.line, column: this.column });
                    this.advance(3);
                    continue;
                }
                this.tokens.push({ type: TokenType.LT, value: '<', line: this.line, column: this.column });
                this.advance(1);
                continue;
            }
            if (ch === '>') {
                this.tokens.push({ type: TokenType.GT, value: '>', line: this.line, column: this.column });
                this.advance(1);
                continue;
            }
            // Unicode operators
            if (ch === '≤') {
                this.tokens.push({ type: TokenType.LTE, value: '≤', line: this.line, column: this.column });
                this.advance(1);
                continue;
            }
            if (ch === '≥') {
                this.tokens.push({ type: TokenType.GTE, value: '≥', line: this.line, column: this.column });
                this.advance(1);
                continue;
            }
            if (ch === '≠') {
                this.tokens.push({ type: TokenType.NEQ, value: '≠', line: this.line, column: this.column });
                this.advance(1);
                continue;
            }
            // Dot or ..
            if (ch === '.') {
                if (this.peek(1) === '.') {
                    this.tokens.push({ type: TokenType.DOTDOT, value: '..', line: this.line, column: this.column });
                    this.advance(2);
                    continue;
                }
                this.tokens.push({ type: TokenType.DOT, value: '.', line: this.line, column: this.column });
                this.advance(1);
                continue;
            }
            // Simple single-char tokens
            const singleCharTokens = {
                '(': TokenType.LPAREN,
                ')': TokenType.RPAREN,
                '[': TokenType.LBRACKET,
                ']': TokenType.RBRACKET,
                ',': TokenType.COMMA,
                ':': TokenType.COLON,
                ';': TokenType.SEMICOLON,
                '@': TokenType.AT,
                '+': TokenType.PLUS,
                '-': TokenType.MINUS,
                '*': TokenType.STAR,
                '/': TokenType.SLASH,
                '=': TokenType.EQ,
            };
            if (singleCharTokens[ch] !== undefined) {
                this.tokens.push({ type: singleCharTokens[ch], value: ch, line: this.line, column: this.column });
                this.advance(1);
                continue;
            }
            // Identifier or keyword
            if (this.isIdentStart(ch)) {
                this.readIdentifier();
                continue;
            }
            // Skip backtick blocks (embedded code blocks)
            if (ch === '`') {
                this.skipCodeBlock();
                continue;
            }
            // Unknown character — skip it
            this.advance(1);
        }
        this.tokens.push({ type: TokenType.EOF, value: '', line: this.line, column: this.column });
        return this.tokens;
    }
    skipWhitespaceAndComments() {
        while (this.pos < this.source.length) {
            const ch = this.source[this.pos];
            // Regular whitespace (not newline)
            if (ch === ' ' || ch === '\t') {
                this.advance(1);
                continue;
            }
            // Single-line comment
            if (ch === '/' && this.peek(1) === '/') {
                while (this.pos < this.source.length && this.source[this.pos] !== '\n') {
                    this.pos++;
                }
                continue;
            }
            // Block comment
            if (ch === '/' && this.peek(1) === '*') {
                this.pos += 2;
                this.column += 2;
                while (this.pos < this.source.length) {
                    if (this.source[this.pos] === '*' && this.peek(1) === '/') {
                        this.pos += 2;
                        this.column += 2;
                        break;
                    }
                    if (this.source[this.pos] === '\n') {
                        this.line++;
                        this.column = 1;
                    }
                    else {
                        this.column++;
                    }
                    this.pos++;
                }
                continue;
            }
            break;
        }
    }
    skipTableLine() {
        // Skip entire line containing table drawing characters
        while (this.pos < this.source.length && this.source[this.pos] !== '\n') {
            this.pos++;
        }
    }
    skipCodeBlock() {
        // Skip ``` ... ``` blocks
        if (this.source.substring(this.pos, this.pos + 3) === '```') {
            this.pos += 3;
            // Skip to the end of line (language name)
            while (this.pos < this.source.length && this.source[this.pos] !== '\n') {
                this.pos++;
            }
            // Skip until closing ```
            while (this.pos < this.source.length) {
                if (this.source[this.pos] === '\n') {
                    this.line++;
                    this.column = 1;
                }
                if (this.source.substring(this.pos, this.pos + 3) === '```') {
                    this.pos += 3;
                    // Skip rest of line
                    while (this.pos < this.source.length && this.source[this.pos] !== '\n') {
                        this.pos++;
                    }
                    break;
                }
                this.pos++;
            }
        }
        else {
            this.advance(1);
        }
    }
    readString() {
        const startCol = this.column;
        const startLine = this.line;
        this.pos++; // skip opening "
        this.column++;
        let value = '';
        while (this.pos < this.source.length && this.source[this.pos] !== '"') {
            if (this.source[this.pos] === '\\') {
                this.pos++;
                this.column++;
                const esc = this.source[this.pos];
                if (esc === 'n')
                    value += '\n';
                else if (esc === 't')
                    value += '\t';
                else if (esc === '"')
                    value += '"';
                else if (esc === '\\')
                    value += '\\';
                else
                    value += esc;
            }
            else {
                if (this.source[this.pos] === '\n') {
                    this.line++;
                    this.column = 0;
                }
                value += this.source[this.pos];
            }
            this.pos++;
            this.column++;
        }
        if (this.pos < this.source.length) {
            this.pos++; // skip closing "
            this.column++;
        }
        this.tokens.push({ type: TokenType.STRING, value, line: startLine, column: startCol });
    }
    readNumber() {
        const startCol = this.column;
        let numStr = '';
        while (this.pos < this.source.length && this.isDigit(this.source[this.pos])) {
            numStr += this.source[this.pos];
            this.advance(1);
        }
        if (this.pos < this.source.length && this.source[this.pos] === '.' && this.peek(1) !== '.') {
            numStr += '.';
            this.advance(1);
            while (this.pos < this.source.length && this.isDigit(this.source[this.pos])) {
                numStr += this.source[this.pos];
                this.advance(1);
            }
        }
        this.tokens.push({ type: TokenType.NUMBER, value: numStr, line: this.line, column: startCol });
    }
    readIdentifier() {
        const startCol = this.column;
        let name = '';
        while (this.pos < this.source.length && this.isIdentPart(this.source[this.pos])) {
            name += this.source[this.pos];
            this.advance(1);
        }
        const lower = name.toLowerCase();
        // Special: "tant que" is two words
        if (lower === 'tant') {
            const savedPos = this.pos;
            const savedCol = this.column;
            const savedLine = this.line;
            this.skipWhitespaceAndComments();
            // Check next word
            if (this.pos < this.source.length && this.isIdentStart(this.source[this.pos])) {
                let nextWord = '';
                const nextStart = this.pos;
                while (this.pos < this.source.length && this.isIdentPart(this.source[this.pos])) {
                    nextWord += this.source[this.pos];
                    this.advance(1);
                }
                if (nextWord.toLowerCase() === 'que') {
                    this.tokens.push({ type: TokenType.TANT_QUE, value: 'tant que', line: savedLine, column: startCol });
                    return;
                }
                // Not "que" — backtrack
                this.pos = nextStart;
                this.column = savedCol;
                this.line = savedLine;
            }
            else {
                this.pos = savedPos;
                this.column = savedCol;
                this.line = savedLine;
            }
        }
        // Special: "jusqu'à" might be split
        if (lower === "jusqu" && this.pos < this.source.length && this.source[this.pos] === "'") {
            name += "'";
            this.advance(1);
            while (this.pos < this.source.length && this.isIdentPart(this.source[this.pos])) {
                name += this.source[this.pos];
                this.advance(1);
            }
            const fullLower = name.toLowerCase();
            if (fullLower === "jusqu'à" || fullLower === "jusqu'a") {
                this.tokens.push({ type: TokenType.JUSQUA, value: name, line: this.line, column: startCol });
                return;
            }
        }
        // Check keywords
        const kwType = KEYWORDS[lower];
        if (kwType !== undefined) {
            if (kwType === TokenType.BOOLEAN) {
                this.tokens.push({ type: TokenType.BOOLEAN, value: lower === 'vrai' ? 'true' : 'false', line: this.line, column: startCol });
            }
            else {
                this.tokens.push({ type: kwType, value: name, line: this.line, column: startCol });
            }
        }
        else {
            this.tokens.push({ type: TokenType.IDENTIFIER, value: name, line: this.line, column: startCol });
        }
    }
    peek(offset) {
        const idx = this.pos + offset;
        if (idx >= this.source.length)
            return '\0';
        return this.source[idx];
    }
    advance(count) {
        for (let i = 0; i < count; i++) {
            if (this.source[this.pos] === '\n') {
                this.line++;
                this.column = 1;
            }
            else {
                this.column++;
            }
            this.pos++;
        }
    }
    isDigit(ch) {
        return ch >= '0' && ch <= '9';
    }
    isIdentStart(ch) {
        return /[a-zA-ZÀ-ÖÙ-öù-üéèêëàâäîïôùûüçÉÈÊËÀÂÄÎÏÔÙÛÜÇ_]/.test(ch);
    }
    isIdentPart(ch) {
        return /[a-zA-ZÀ-ÖÙ-öù-üéèêëàâäîïôùûüçÉÈÊËÀÂÄÎÏÔÙÛÜÇ_0-9]/.test(ch);
    }
}
exports.Lexer = Lexer;
//# sourceMappingURL=lexer.js.map