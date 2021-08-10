(function calculatorExampleCst() {
    "use strict";
    const createToken = chevrotain.createToken;
    const Lexer = chevrotain.Lexer;
    const CstParser = chevrotain.CstParser;

    const Plus = createToken({ name: "Plus", pattern: /plus/ });

    const NumberLiteral = createToken({ name: "NumberLiteral", pattern: Lexer.NA });
    const One = createToken({ name: "One", pattern: /one/, categories: NumberLiteral });
    const Two = createToken({ name: "Two", pattern: /two/, categories: NumberLiteral });
    const Three = createToken({ name: "Three", pattern: /three/, categories: NumberLiteral });
    const Four = createToken({ name: "Four", pattern: /four/, categories: NumberLiteral });

    const WhiteSpace = createToken({
        name: "WhiteSpace",
        pattern: /\s+/,
        group: Lexer.SKIPPED
    });

    const allTokens = [WhiteSpace, Plus, One, Two, Three, Four];
    const CalculatorLexer = new Lexer(allTokens);

    class CalculatorPure extends CstParser {
        constructor() {
            super(allTokens);
            const $ = this;

            $.RULE("expression", () => {
                $.SUBRULE($.additionExpression)
            });

            $.RULE("additionExpression", () => {
                $.SUBRULE($.numberLiteral, { LABEL: "lhs" })
                $.MANY(() => {
                    $.CONSUME(Plus)
                    $.SUBRULE1($.numberLiteral, { LABEL: "rhs" })
                })
            });

            $.RULE("numberLiteral", () => {
                $.OR([
                    { ALT: () => $.CONSUME(One) },
                    { ALT: () => $.CONSUME(Two) },
                    { ALT: () => $.CONSUME(Three) },
                    { ALT: () => $.CONSUME(Four) },
                ])
            });
            this.performSelfAnalysis();
        }
    }

    const parser = new CalculatorPure([]);

    const BaseCstVisitor = parser.getBaseCstVisitorConstructor()

    class CalculatorInterpreter extends BaseCstVisitor {

        constructor() {
            super();
            this.validateVisitor();
        }

        expression(ctx) {
            return this.visit(ctx.additionExpression);
        }

        additionExpression(ctx) {
            let result = this.visit(ctx.lhs);
            ctx.rhs.forEach(rhsOperand => {
                let rhsValue = this.visit(rhsOperand);
                result += rhsValue;
            });
            return result;
        }

        numberLiteral(ctx) {
            if (ctx.One) {
                return 1;
            }
            else if (ctx.Two) {
                return 2;
            }
            else if (ctx.Three) {
                return 3;
            }
            else if (ctx.Four) {
                return 4;
            }
        }
    }

    return {
        lexer: CalculatorLexer,
        parser: CalculatorPure,
        visitor: CalculatorInterpreter,
        defaultRule: "expression"
    };
}())