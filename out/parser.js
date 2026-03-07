"use strict";
// ─── Recursive-descent Parser for .algo pseudocode ───
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = exports.ParseError = void 0;
const lexer_1 = require("./lexer");
class ParseError extends Error {
    constructor(message, line, column) {
        super(`Erreur de syntaxe à la ligne ${line}: ${message}`);
        this.line = line;
        this.column = column;
        this.name = 'ParseError';
    }
}
exports.ParseError = ParseError;
class Parser {
    constructor(tokens) {
        this.pos = 0;
        this.tokens = tokens;
    }
    parse() {
        const functions = [];
        const procedures = [];
        let algorithm = null;
        while (!this.isAtEnd()) {
            if (this.check(lexer_1.TokenType.FONCTION)) {
                functions.push(this.parseFunctionDecl());
            }
            else if (this.check(lexer_1.TokenType.PROCEDURE)) {
                procedures.push(this.parseProcedureDecl());
            }
            else if (this.check(lexer_1.TokenType.ALGORITHME)) {
                algorithm = this.parseAlgorithm();
            }
            else {
                // Skip tokens we don't recognize at top level (TDO labels etc.)
                this.advance();
            }
        }
        if (!algorithm) {
            // If no ALGORITHME block found, see if there's a DEBUT/FIN at top level
            throw new ParseError("Aucun bloc 'ALGORITHME ... DEBUT ... FIN' trouvé", 1, 1);
        }
        return {
            type: 'Program',
            functions,
            procedures,
            algorithm,
        };
    }
    // ─── Top-level declarations ───
    parseAlgorithm() {
        const line = this.current().line;
        this.expect(lexer_1.TokenType.ALGORITHME);
        const name = this.expect(lexer_1.TokenType.IDENTIFIER).value;
        this.expect(lexer_1.TokenType.DEBUT);
        const body = this.parseStatements([lexer_1.TokenType.FIN]);
        this.expect(lexer_1.TokenType.FIN);
        return { type: 'AlgorithmDecl', name, body, line };
    }
    parseFunctionDecl() {
        const line = this.current().line;
        this.expect(lexer_1.TokenType.FONCTION);
        const name = this.expect(lexer_1.TokenType.IDENTIFIER).value;
        this.expect(lexer_1.TokenType.LPAREN);
        const params = this.parseParams();
        this.expect(lexer_1.TokenType.RPAREN);
        // optional : returnType
        let returnType = 'entier';
        if (this.match(lexer_1.TokenType.COLON)) {
            returnType = this.advance().value;
        }
        this.expect(lexer_1.TokenType.DEBUT);
        const body = this.parseStatements([lexer_1.TokenType.FIN]);
        this.expect(lexer_1.TokenType.FIN);
        return { type: 'FunctionDecl', name, params, returnType, body, line };
    }
    parseProcedureDecl() {
        const line = this.current().line;
        this.expect(lexer_1.TokenType.PROCEDURE);
        const name = this.expect(lexer_1.TokenType.IDENTIFIER).value;
        this.expect(lexer_1.TokenType.LPAREN);
        const params = this.parseParams();
        this.expect(lexer_1.TokenType.RPAREN);
        this.expect(lexer_1.TokenType.DEBUT);
        const body = this.parseStatements([lexer_1.TokenType.FIN]);
        this.expect(lexer_1.TokenType.FIN);
        return { type: 'ProcedureDecl', name, params, body, line };
    }
    parseParams() {
        const params = [];
        if (this.check(lexer_1.TokenType.RPAREN))
            return params;
        do {
            const byRef = this.match(lexer_1.TokenType.AT);
            const name = this.expect(lexer_1.TokenType.IDENTIFIER).value;
            let paramType = 'entier';
            if (this.match(lexer_1.TokenType.COLON)) {
                paramType = this.parseTypeName();
            }
            params.push({ name, paramType, byRef });
        } while (this.match(lexer_1.TokenType.COMMA) || this.match(lexer_1.TokenType.SEMICOLON));
        return params;
    }
    parseTypeName() {
        const tok = this.advance();
        let typeName = tok.value;
        // Handle compound types like "tableau de 10 entier"
        if (tok.type === lexer_1.TokenType.TABLEAU) {
            if (this.match(lexer_1.TokenType.DE)) {
                typeName += ' de';
                if (this.check(lexer_1.TokenType.NUMBER)) {
                    typeName += ' ' + this.advance().value;
                }
                if (this.check(lexer_1.TokenType.IDENTIFIER) || this.isTypeToken(this.current().type)) {
                    typeName += ' ' + this.advance().value;
                }
            }
        }
        if (tok.type === lexer_1.TokenType.FICHIER) {
            if (this.match(lexer_1.TokenType.TEXTE)) {
                typeName += ' texte';
            }
            else if (this.match(lexer_1.TokenType.DE)) {
                typeName += ' de ' + this.advance().value;
            }
        }
        return typeName;
    }
    isTypeToken(type) {
        return [
            lexer_1.TokenType.ENTIER, lexer_1.TokenType.REEL, lexer_1.TokenType.BOOLEEN,
            lexer_1.TokenType.CARACTERE, lexer_1.TokenType.CHAINE, lexer_1.TokenType.TABLEAU,
            lexer_1.TokenType.ENREGISTREMENT, lexer_1.TokenType.FICHIER, lexer_1.TokenType.TEXTE,
        ].includes(type);
    }
    // ─── Statement parsing ───
    parseStatements(terminators) {
        const statements = [];
        while (!this.isAtEnd() && !terminators.some(t => this.check(t))) {
            const stmt = this.parseStatement();
            if (stmt)
                statements.push(stmt);
        }
        return statements;
    }
    parseStatement() {
        // Skip type declarations and TDO labels that appear inside algorithm body
        if (this.isTypeToken(this.current().type) && !this.isExpressionContext()) {
            this.skipDeclarationLine();
            return null;
        }
        // Skip "Objet", "Nature", "Type" labels (from TDO tables left in code)
        if (this.check(lexer_1.TokenType.IDENTIFIER)) {
            const val = this.current().value.toLowerCase();
            if (val === 'objet' || val === 'nature' || val === 'nouveaux' || val === 'types') {
                this.skipDeclarationLine();
                return null;
            }
        }
        if (this.check(lexer_1.TokenType.SI))
            return this.parseIf();
        if (this.check(lexer_1.TokenType.POUR))
            return this.parseFor();
        if (this.check(lexer_1.TokenType.TANT_QUE))
            return this.parseWhile();
        if (this.check(lexer_1.TokenType.REPETER))
            return this.parseRepeat();
        if (this.check(lexer_1.TokenType.SELON))
            return this.parseSwitch();
        if (this.check(lexer_1.TokenType.RETOURNER))
            return this.parseReturn();
        if (this.check(lexer_1.TokenType.LIRE))
            return this.parseRead();
        if (this.check(lexer_1.TokenType.ECRIRE) || this.check(lexer_1.TokenType.ECRIRE_NL))
            return this.parseWrite();
        // Assignment or procedure call
        return this.parseAssignmentOrCall();
    }
    isExpressionContext() {
        // If we see a type keyword but it's used as part of a TDO, skip it
        // A type at statement level that is NOT preceded by assignment is a declaration
        return false;
    }
    skipDeclarationLine() {
        // Skip tokens until we consume what looks like a declaration
        // This handles TDO content that may appear within algorithm body
        while (!this.isAtEnd()) {
            const t = this.current().type;
            // Stop at things that start real statements
            if (t === lexer_1.TokenType.SI || t === lexer_1.TokenType.POUR || t === lexer_1.TokenType.TANT_QUE ||
                t === lexer_1.TokenType.REPETER || t === lexer_1.TokenType.SELON || t === lexer_1.TokenType.RETOURNER ||
                t === lexer_1.TokenType.LIRE || t === lexer_1.TokenType.ECRIRE || t === lexer_1.TokenType.ECRIRE_NL ||
                t === lexer_1.TokenType.FIN || t === lexer_1.TokenType.FIN_SI || t === lexer_1.TokenType.FIN_POUR ||
                t === lexer_1.TokenType.FIN_TANT_QUE || t === lexer_1.TokenType.JUSQUA || t === lexer_1.TokenType.FIN_SELON ||
                t === lexer_1.TokenType.ALGORITHME || t === lexer_1.TokenType.FONCTION || t === lexer_1.TokenType.PROCEDURE ||
                t === lexer_1.TokenType.DEBUT || t === lexer_1.TokenType.SINON || t === lexer_1.TokenType.EOF) {
                break;
            }
            // Look ahead: if current is identifier and next is <--, that's an assignment
            if (t === lexer_1.TokenType.IDENTIFIER) {
                const nextType = this.peekNext()?.type;
                if (nextType === lexer_1.TokenType.ASSIGN || nextType === lexer_1.TokenType.LPAREN ||
                    nextType === lexer_1.TokenType.LBRACKET || nextType === lexer_1.TokenType.DOT) {
                    break;
                }
            }
            this.advance();
        }
    }
    // ─── Control flow ───
    parseIf() {
        const line = this.current().line;
        this.expect(lexer_1.TokenType.SI);
        const condition = this.parseExpression();
        this.expect(lexer_1.TokenType.ALORS);
        const thenBranch = this.parseStatements([lexer_1.TokenType.SINON, lexer_1.TokenType.FIN_SI]);
        let elseBranch = null;
        if (this.match(lexer_1.TokenType.SINON)) {
            // Check for "sinon si" (else if)
            if (this.check(lexer_1.TokenType.SI)) {
                elseBranch = [this.parseIf()];
                // Don't consume fin_si here, the inner if will handle it or the chain terminates
                return { type: 'IfStmt', condition, thenBranch, elseBranch, line };
            }
            elseBranch = this.parseStatements([lexer_1.TokenType.FIN_SI]);
        }
        this.expect(lexer_1.TokenType.FIN_SI);
        return { type: 'IfStmt', condition, thenBranch, elseBranch, line };
    }
    parseFor() {
        const line = this.current().line;
        this.expect(lexer_1.TokenType.POUR);
        const counter = this.expect(lexer_1.TokenType.IDENTIFIER).value;
        this.expect(lexer_1.TokenType.DE);
        const start = this.parseExpression();
        this.expect(lexer_1.TokenType.A);
        const end = this.parseExpression();
        let step = null;
        // Optional: pas = value or (pas = value)
        if (this.check(lexer_1.TokenType.PAS)) {
            this.advance(); // skip "pas"
            this.match(lexer_1.TokenType.EQ); // optional =
            step = this.parseExpression();
        }
        else if (this.check(lexer_1.TokenType.LPAREN)) {
            // (pas = value)
            const savedPos = this.pos;
            this.advance(); // (
            if (this.check(lexer_1.TokenType.PAS)) {
                this.advance(); // pas
                this.match(lexer_1.TokenType.EQ); // =
                step = this.parseExpression();
                this.expect(lexer_1.TokenType.RPAREN);
            }
            else {
                this.pos = savedPos;
            }
        }
        this.expect(lexer_1.TokenType.FAIRE);
        const body = this.parseStatements([lexer_1.TokenType.FIN_POUR]);
        this.expect(lexer_1.TokenType.FIN_POUR);
        return { type: 'ForLoop', counter, start, end, step, body, line };
    }
    parseWhile() {
        const line = this.current().line;
        this.expect(lexer_1.TokenType.TANT_QUE);
        const condition = this.parseExpression();
        this.expect(lexer_1.TokenType.FAIRE);
        const body = this.parseStatements([lexer_1.TokenType.FIN_TANT_QUE]);
        this.expect(lexer_1.TokenType.FIN_TANT_QUE);
        return { type: 'WhileLoop', condition, body, line };
    }
    parseRepeat() {
        const line = this.current().line;
        this.expect(lexer_1.TokenType.REPETER);
        const body = this.parseStatements([lexer_1.TokenType.JUSQUA]);
        this.expect(lexer_1.TokenType.JUSQUA);
        const condition = this.parseExpression();
        return { type: 'RepeatUntil', body, condition, line };
    }
    parseSwitch() {
        const line = this.current().line;
        this.expect(lexer_1.TokenType.SELON);
        const selector = this.parseExpression();
        const cases = [];
        let defaultCase = null;
        while (!this.isAtEnd() && !this.check(lexer_1.TokenType.FIN_SELON) && !this.check(lexer_1.TokenType.SINON)) {
            const values = [];
            // Parse case values separated by commas or ranges (..)
            do {
                const val = this.parseExpression();
                if (this.match(lexer_1.TokenType.DOTDOT)) {
                    const endVal = this.parseExpression();
                    values.push({ type: 'RangeValue', start: val, end: endVal, line: this.current().line });
                }
                else {
                    values.push(val);
                }
            } while (this.match(lexer_1.TokenType.COMMA));
            this.expect(lexer_1.TokenType.COLON);
            const body = this.parseStatements([lexer_1.TokenType.FIN_SELON, lexer_1.TokenType.SINON, lexer_1.TokenType.NUMBER, lexer_1.TokenType.STRING, lexer_1.TokenType.IDENTIFIER]);
            cases.push({ values, body });
        }
        if (this.match(lexer_1.TokenType.SINON)) {
            defaultCase = this.parseStatements([lexer_1.TokenType.FIN_SELON]);
        }
        this.expect(lexer_1.TokenType.FIN_SELON);
        return { type: 'SwitchStmt', selector, cases, defaultCase, line };
    }
    parseReturn() {
        const line = this.current().line;
        this.expect(lexer_1.TokenType.RETOURNER);
        const value = this.parseExpression();
        return { type: 'ReturnStmt', value, line };
    }
    // ─── I/O ───
    parseRead() {
        const line = this.current().line;
        this.expect(lexer_1.TokenType.LIRE);
        this.expect(lexer_1.TokenType.LPAREN);
        const args = [];
        do {
            args.push(this.parseExpression());
        } while (this.match(lexer_1.TokenType.COMMA));
        this.expect(lexer_1.TokenType.RPAREN);
        return { type: 'ReadStmt', args, line };
    }
    parseWrite() {
        const line = this.current().line;
        const newline = this.current().type === lexer_1.TokenType.ECRIRE_NL;
        this.advance(); // skip écrire or écrire_nl
        this.expect(lexer_1.TokenType.LPAREN);
        const args = [];
        if (!this.check(lexer_1.TokenType.RPAREN)) {
            do {
                args.push(this.parseExpression());
            } while (this.match(lexer_1.TokenType.COMMA));
        }
        this.expect(lexer_1.TokenType.RPAREN);
        // As per curriculum, both écrire and écrire_nl add a newline to the console (like Python's print)
        return { type: 'WriteStmt', args, newline: true, line };
    }
    // ─── Assignment or procedure call ───
    parseAssignmentOrCall() {
        if (!this.check(lexer_1.TokenType.IDENTIFIER)) {
            // Something unexpected — skip
            this.advance();
            return null;
        }
        const identToken = this.current();
        let target = { type: 'Identifier', name: identToken.value, line: identToken.line };
        this.advance();
        // Function/procedure call without assignment
        if (this.check(lexer_1.TokenType.LPAREN)) {
            this.advance(); // (
            const args = [];
            if (!this.check(lexer_1.TokenType.RPAREN)) {
                do {
                    args.push(this.parseExpression());
                } while (this.match(lexer_1.TokenType.COMMA));
            }
            this.expect(lexer_1.TokenType.RPAREN);
            return { type: 'CallStmt', name: identToken.value, args, line: identToken.line };
        }
        // Array access: T[i] or T[i, j]
        while (this.check(lexer_1.TokenType.LBRACKET)) {
            this.advance();
            const indices = [];
            do {
                indices.push(this.parseExpression());
            } while (this.match(lexer_1.TokenType.COMMA));
            this.expect(lexer_1.TokenType.RBRACKET);
            target = { type: 'ArrayAccess', array: target, indices, line: identToken.line };
        }
        // Field access: E.champ
        while (this.match(lexer_1.TokenType.DOT)) {
            const field = this.expect(lexer_1.TokenType.IDENTIFIER).value;
            target = { type: 'FieldAccess', object: target, field, line: identToken.line };
        }
        // More array access after field access
        while (this.check(lexer_1.TokenType.LBRACKET)) {
            this.advance();
            const indices = [];
            do {
                indices.push(this.parseExpression());
            } while (this.match(lexer_1.TokenType.COMMA));
            this.expect(lexer_1.TokenType.RBRACKET);
            target = { type: 'ArrayAccess', array: target, indices, line: identToken.line };
        }
        // Assignment
        if (this.match(lexer_1.TokenType.ASSIGN)) {
            const value = this.parseExpression();
            return {
                type: 'AssignmentStmt',
                target: target,
                value,
                line: identToken.line,
            };
        }
        // If nothing matched, treat it as a procedure call without parentheses or skip
        return null;
    }
    // ─── Expression parsing (precedence climbing) ───
    parseExpression() {
        return this.parseOr();
    }
    parseOr() {
        let left = this.parseAnd();
        while (this.check(lexer_1.TokenType.OU) || this.check(lexer_1.TokenType.OUEX)) {
            const op = this.advance().value.toLowerCase();
            const right = this.parseAnd();
            left = { type: 'BinaryExpr', op, left, right, line: this.current().line };
        }
        return left;
    }
    parseAnd() {
        let left = this.parseNot();
        while (this.check(lexer_1.TokenType.ET)) {
            this.advance();
            const right = this.parseNot();
            left = { type: 'BinaryExpr', op: 'et', left, right, line: this.current().line };
        }
        return left;
    }
    parseNot() {
        if (this.check(lexer_1.TokenType.NON)) {
            const line = this.current().line;
            this.advance();
            const operand = this.parseNot();
            return { type: 'UnaryExpr', op: 'non', operand, line };
        }
        return this.parseComparison();
    }
    parseComparison() {
        let left = this.parseAdditive();
        while (this.check(lexer_1.TokenType.EQ) || this.check(lexer_1.TokenType.NEQ) ||
            this.check(lexer_1.TokenType.LT) || this.check(lexer_1.TokenType.GT) ||
            this.check(lexer_1.TokenType.LTE) || this.check(lexer_1.TokenType.GTE)) {
            const op = this.advance().value;
            const right = this.parseAdditive();
            left = { type: 'BinaryExpr', op, left, right, line: this.current().line };
        }
        return left;
    }
    parseAdditive() {
        let left = this.parseMultiplicative();
        while (this.check(lexer_1.TokenType.PLUS) || this.check(lexer_1.TokenType.MINUS)) {
            const op = this.advance().value;
            const right = this.parseMultiplicative();
            left = { type: 'BinaryExpr', op, left, right, line: this.current().line };
        }
        return left;
    }
    parseMultiplicative() {
        let left = this.parseUnary();
        while (this.check(lexer_1.TokenType.STAR) || this.check(lexer_1.TokenType.SLASH) ||
            this.check(lexer_1.TokenType.DIV) || this.check(lexer_1.TokenType.MOD)) {
            const op = this.advance().value.toLowerCase();
            const right = this.parseUnary();
            left = { type: 'BinaryExpr', op, left, right, line: this.current().line };
        }
        return left;
    }
    parseUnary() {
        if (this.check(lexer_1.TokenType.MINUS)) {
            const line = this.current().line;
            this.advance();
            const operand = this.parseUnary();
            return { type: 'UnaryExpr', op: '-', operand, line };
        }
        if (this.check(lexer_1.TokenType.PLUS)) {
            this.advance();
            return this.parseUnary();
        }
        return this.parsePrimary();
    }
    parsePrimary() {
        // Number literal
        if (this.check(lexer_1.TokenType.NUMBER)) {
            const tok = this.advance();
            const value = tok.value.includes('.') ? parseFloat(tok.value) : parseInt(tok.value, 10);
            return { type: 'Literal', value, line: tok.line };
        }
        // String literal
        if (this.check(lexer_1.TokenType.STRING)) {
            const tok = this.advance();
            return { type: 'Literal', value: tok.value, line: tok.line };
        }
        // Boolean literal
        if (this.check(lexer_1.TokenType.BOOLEAN)) {
            const tok = this.advance();
            return { type: 'Literal', value: tok.value === 'true', line: tok.line };
        }
        // Parenthesized expression
        if (this.match(lexer_1.TokenType.LPAREN)) {
            const expr = this.parseExpression();
            this.expect(lexer_1.TokenType.RPAREN);
            return expr;
        }
        // Identifier, function call, array access, field access
        if (this.check(lexer_1.TokenType.IDENTIFIER)) {
            const tok = this.advance();
            let node = { type: 'Identifier', name: tok.value, line: tok.line };
            // Function call
            if (this.check(lexer_1.TokenType.LPAREN)) {
                this.advance();
                const args = [];
                if (!this.check(lexer_1.TokenType.RPAREN)) {
                    do {
                        args.push(this.parseExpression());
                    } while (this.match(lexer_1.TokenType.COMMA));
                }
                this.expect(lexer_1.TokenType.RPAREN);
                node = { type: 'FunctionCallExpr', name: tok.value, args, line: tok.line };
            }
            // Array access
            while (this.check(lexer_1.TokenType.LBRACKET)) {
                this.advance();
                const indices = [];
                do {
                    indices.push(this.parseExpression());
                } while (this.match(lexer_1.TokenType.COMMA));
                this.expect(lexer_1.TokenType.RBRACKET);
                node = { type: 'ArrayAccess', array: node, indices, line: tok.line };
            }
            // Field access
            while (this.match(lexer_1.TokenType.DOT)) {
                const field = this.expect(lexer_1.TokenType.IDENTIFIER).value;
                node = { type: 'FieldAccess', object: node, field, line: tok.line };
                // Maybe more array access after field
                while (this.check(lexer_1.TokenType.LBRACKET)) {
                    this.advance();
                    const indices = [];
                    do {
                        indices.push(this.parseExpression());
                    } while (this.match(lexer_1.TokenType.COMMA));
                    this.expect(lexer_1.TokenType.RBRACKET);
                    node = { type: 'ArrayAccess', array: node, indices, line: tok.line };
                }
            }
            return node;
        }
        // Built-in function calls that are keywords (lire, écrire, etc. can appear in expressions — rare, but handle)
        if (this.isBuiltinFunctionKeyword(this.current().type)) {
            const tok = this.advance();
            const name = tok.value.toLowerCase();
            if (this.match(lexer_1.TokenType.LPAREN)) {
                const args = [];
                if (!this.check(lexer_1.TokenType.RPAREN)) {
                    do {
                        args.push(this.parseExpression());
                    } while (this.match(lexer_1.TokenType.COMMA));
                }
                this.expect(lexer_1.TokenType.RPAREN);
                return { type: 'FunctionCallExpr', name, args, line: tok.line };
            }
            return { type: 'Identifier', name, line: tok.line };
        }
        throw new ParseError(`Expression inattendue: '${this.current().value}'`, this.current().line, this.current().column);
    }
    isBuiltinFunctionKeyword(type) {
        // Some built-in functions are tokenized as keywords
        return [lexer_1.TokenType.LIRE, lexer_1.TokenType.ECRIRE, lexer_1.TokenType.ECRIRE_NL].includes(type);
    }
    // ─── Helpers ───
    current() {
        return this.tokens[this.pos] || { type: lexer_1.TokenType.EOF, value: '', line: 0, column: 0 };
    }
    peekNext() {
        return this.tokens[this.pos + 1];
    }
    check(type) {
        return this.current().type === type;
    }
    match(type) {
        if (this.check(type)) {
            this.advance();
            return true;
        }
        return false;
    }
    expect(type) {
        if (this.check(type)) {
            return this.advance();
        }
        const cur = this.current();
        throw new ParseError(`Attendu '${lexer_1.TokenType[type]}', trouvé '${cur.value}' (${lexer_1.TokenType[cur.type]})`, cur.line, cur.column);
    }
    advance() {
        const tok = this.current();
        if (!this.isAtEnd())
            this.pos++;
        return tok;
    }
    isAtEnd() {
        return this.current().type === lexer_1.TokenType.EOF;
    }
}
exports.Parser = Parser;
//# sourceMappingURL=parser.js.map