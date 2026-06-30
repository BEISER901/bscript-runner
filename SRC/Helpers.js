const Type = require("./types/Type.js")
const Utils = require("./Utils.js")

module.exports = {
	createFunction: (name, context, scope, runner) => {
		async function newFunction(args) {
			const result = await Utils.newScriptRunner.bind(context)(scope.content.scopeScript, scope.path, runner)(args)
			return result
		}
		Object.defineProperty(newFunction, "name", {
		    value: name
		});
		return newFunction;
	},
	createRef:  (props, object, commandExecute, options) => commandExecute({ commandName: "ref", args: [object, ...props.map(x=>new Type(x))], options }),
	AssigmentsToObject: (type, commandExecute, options) => commandExecute({ commandName: "object", args: [type], options }),
	GetVal: (valName, commandExecute, options) => commandExecute({ commandName: "$val", args: [new Type(valName)], options }),
	Object: (val) => new Type({ type: Type.ObjectType, val }),
	Text: (val) => {
		return new Type({ type: Type.TextType, val })
	},
	Array: (val) => new Type({ type: Type.ArrayType, val }),
	Boolean: (val) => new Type({ type: Type.BooleanType, val: Number(val) }),
	Number: (val) => new Type({ type: Type.NumberType, val }),
	Assignment: (name, val) => new Type({ type: Type.Assignment, name, val }),
	Function:  (name, val, async) => new Type({ type: Type.FuncionType, name, isAsync: async, val }),

	ProcessingContinue: (results) => ({ processingExitCode: require("./../BScriptRunner.js").ProcessingExitCode.Continue, results }),
	ProcessingError: () => ({ processingExitCode: require("./../BScriptRunner.js").ProcessingExitCode.Error }), 
}