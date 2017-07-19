import * as Ast from "../../src/ast";
import * as Interpreter from "../../src/interpreter";
import { MockRandomProvider } from "../helpers/mock-random-provider";

describe("DiceInterpreter", () => {
    describe("evaluate", () => {
        it("evaluates a simple dice expression (2d6).", () => {
            const dice = Ast.Factory.create(Ast.NodeType.Dice);
            dice.addChild(Ast.Factory.create(Ast.NodeType.Integer).setAttribute("value", 2));
            dice.addChild(Ast.Factory.create(Ast.NodeType.DiceSides).setAttribute("value", 6));

            const interpreter = new Interpreter.DiceInterpreter(null, new MockRandomProvider(4));
            expect(interpreter.evaluate(dice)).toBe(8);
        });
        it("evaluates a hidden simple dice expression (2d6 + 4).", () => {
            const add = Ast.Factory.create(Ast.NodeType.Add);

            const dice = Ast.Factory.create(Ast.NodeType.Dice);
            dice.addChild(Ast.Factory.create(Ast.NodeType.Integer).setAttribute("value", 2));
            dice.addChild(Ast.Factory.create(Ast.NodeType.DiceSides).setAttribute("value", 6));

            add.addChild(dice);
            add.addChild(Ast.Factory.create(Ast.NodeType.Integer).setAttribute("value", 4));

            const interpreter = new Interpreter.DiceInterpreter(null, new MockRandomProvider(3));
            expect(interpreter.evaluate(add)).toBe(10);
        });
        it("evaluates a complex dice expression ((1 + 2)d6).", () => {
            const dice = Ast.Factory.create(Ast.NodeType.Dice);

            const add = Ast.Factory.create(Ast.NodeType.Add);
            add.addChild(Ast.Factory.create(Ast.NodeType.Integer).setAttribute("value", 1));
            add.addChild(Ast.Factory.create(Ast.NodeType.Integer).setAttribute("value", 2));

            dice.addChild(add);
            dice.addChild(Ast.Factory.create(Ast.NodeType.DiceSides).setAttribute("value", 6));

            const interpreter = new Interpreter.DiceInterpreter(null, new MockRandomProvider(2));

            expect(interpreter.evaluate(dice)).toBe(6);
        });
        it("reduces a simple dice expression (2d6).", () => {
            const dice = Ast.Factory.create(Ast.NodeType.Dice);
            dice.addChild(Ast.Factory.create(Ast.NodeType.Integer).setAttribute("value", 2));
            dice.addChild(Ast.Factory.create(Ast.NodeType.DiceSides).setAttribute("value", 6));

            const interpreter = new Interpreter.DiceInterpreter();
            interpreter.evaluate(dice);

            expect(dice.getChildCount()).toBe(2);
            expect(dice.getChild(0).type).toBe(Ast.NodeType.DiceRoll);
            expect(dice.getChild(0).getAttribute("value")).toBeGreaterThanOrEqual(1);
            expect(dice.getChild(0).getAttribute("value")).toBeLessThanOrEqual(6);

            expect(dice.getChild(1).type).toBe(Ast.NodeType.DiceRoll);
            expect(dice.getChild(1).getAttribute("value")).toBeGreaterThanOrEqual(1);
            expect(dice.getChild(1).getAttribute("value")).toBeLessThanOrEqual(6);
        });
        it("reduces a simple fate dice expression (2dF).", () => {
            const dice = Ast.Factory.create(Ast.NodeType.Dice);
            dice.addChild(Ast.Factory.create(Ast.NodeType.Integer).setAttribute("value", 2));
            dice.addChild(Ast.Factory.create(Ast.NodeType.DiceSides).setAttribute("value", "fate"));

            const interpreter = new Interpreter.DiceInterpreter();
            interpreter.evaluate(dice);

            expect(dice.getChildCount()).toBe(2);
            expect(dice.getChild(0).type).toBe(Ast.NodeType.DiceRoll);
            expect(dice.getChild(0).getAttribute("value")).toBeGreaterThanOrEqual(-1);
            expect(dice.getChild(0).getAttribute("value")).toBeLessThanOrEqual(1);

            expect(dice.getChild(1).type).toBe(Ast.NodeType.DiceRoll);
            expect(dice.getChild(1).getAttribute("value")).toBeGreaterThanOrEqual(-1);
            expect(dice.getChild(1).getAttribute("value")).toBeLessThanOrEqual(1);
        });
        it("reduces a hidden simple dice expression (2d6 + 4).", () => {
            const add = Ast.Factory.create(Ast.NodeType.Add);

            const dice = Ast.Factory.create(Ast.NodeType.Dice);
            dice.addChild(Ast.Factory.create(Ast.NodeType.Integer).setAttribute("value", 2));
            dice.addChild(Ast.Factory.create(Ast.NodeType.DiceSides).setAttribute("value", 6));

            add.addChild(dice);
            add.addChild(Ast.Factory.create(Ast.NodeType.Integer).setAttribute("value", 4));

            const interpreter = new Interpreter.DiceInterpreter();
            interpreter.evaluate(add);

            expect(add.getChildCount()).toBe(2);
            expect(add.getChild(0).type).toBe(Ast.NodeType.Dice);
            expect(add.getChild(0).getChildCount()).toBe(2);
            expect(add.getChild(0).getChild(0).type).toBe(Ast.NodeType.DiceRoll);
            expect(add.getChild(0).getChild(0).getAttribute("value")).toBeLessThanOrEqual(6);
            expect(add.getChild(0).getChild(0).getAttribute("value")).toBeGreaterThanOrEqual(1);
            expect(add.getChild(0).getChild(1).type).toBe(Ast.NodeType.DiceRoll);
            expect(add.getChild(0).getChild(1).getAttribute("value")).toBeLessThanOrEqual(6);
            expect(add.getChild(0).getChild(1).getAttribute("value")).toBeGreaterThanOrEqual(1);

            expect(add.getChild(1).type).toBe(Ast.NodeType.Integer);
            expect(add.getChild(1).getAttribute("value")).toBe(4);
        });
        it("reduces a complex dice expression ((1 + 2)d6).", () => {
            const dice = Ast.Factory.create(Ast.NodeType.Dice);

            const add = Ast.Factory.create(Ast.NodeType.Add);
            add.addChild(Ast.Factory.create(Ast.NodeType.Integer).setAttribute("value", 1));
            add.addChild(Ast.Factory.create(Ast.NodeType.Integer).setAttribute("value", 2));

            dice.addChild(add);
            dice.addChild(Ast.Factory.create(Ast.NodeType.DiceSides).setAttribute("value", 6));

            const interpreter = new Interpreter.DiceInterpreter();

            interpreter.evaluate(dice);

            expect(dice.getChildCount()).toBe(3);
            expect(dice.getChild(0).type).toBe(Ast.NodeType.DiceRoll);
            expect(dice.getChild(0).getAttribute("value")).toBeGreaterThanOrEqual(1);
            expect(dice.getChild(0).getAttribute("value")).toBeLessThanOrEqual(6);

            expect(dice.getChild(1).type).toBe(Ast.NodeType.DiceRoll);
            expect(dice.getChild(1).getAttribute("value")).toBeGreaterThanOrEqual(1);
            expect(dice.getChild(1).getAttribute("value")).toBeLessThanOrEqual(6);

            expect(dice.getChild(2).type).toBe(Ast.NodeType.DiceRoll);
            expect(dice.getChild(2).getAttribute("value")).toBeGreaterThanOrEqual(1);
            expect(dice.getChild(2).getAttribute("value")).toBeLessThanOrEqual(6);
        });
        it("evaluates fractional dice rolls >=.5 ((5 / 2)d6).", () => {
            const dice = Ast.Factory.create(Ast.NodeType.Dice);

            const divide = Ast.Factory.create(Ast.NodeType.Divide);
            divide.addChild(Ast.Factory.create(Ast.NodeType.Integer).setAttribute("value", 5));
            divide.addChild(Ast.Factory.create(Ast.NodeType.Integer).setAttribute("value", 2));

            dice.addChild(divide);
            dice.addChild(Ast.Factory.create(Ast.NodeType.DiceSides).setAttribute("value", 6));

            const interpreter = new Interpreter.DiceInterpreter(null, new MockRandomProvider(2));

            // 5 / 2 = 2.5, which is rounded to 3.
            expect(interpreter.evaluate(dice)).toBe(6);
        });
        it("evaluates fractional dice rolls <.5 ((7 / 5)d6).", () => {
            const dice = Ast.Factory.create(Ast.NodeType.Dice);

            const divide = Ast.Factory.create(Ast.NodeType.Divide);
            divide.addChild(Ast.Factory.create(Ast.NodeType.Integer).setAttribute("value", 7));
            divide.addChild(Ast.Factory.create(Ast.NodeType.Integer).setAttribute("value", 5));

            dice.addChild(divide);
            dice.addChild(Ast.Factory.create(Ast.NodeType.DiceSides).setAttribute("value", 6));

            const interpreter = new Interpreter.DiceInterpreter(null, new MockRandomProvider(2));

            // 7 / 5 = 1.4, which is rounded to 1.
            expect(interpreter.evaluate(dice)).toBe(2);
        });
        it("evaluates negative dice rolls at 0. ((-5)d6).", () => {
            const dice = Ast.Factory.create(Ast.NodeType.Dice);

            const negate = Ast.Factory.create(Ast.NodeType.Negate);
            negate.addChild(Ast.Factory.create(Ast.NodeType.Integer).setAttribute("value", 5));

            dice.addChild(negate);
            dice.addChild(Ast.Factory.create(Ast.NodeType.DiceSides).setAttribute("value", 6));

            const interpreter = new Interpreter.DiceInterpreter(null, new MockRandomProvider(2));

            // -5d6 will be interpreted as 0.
            expect(interpreter.evaluate(dice)).toBe(0);
        });
    });
});