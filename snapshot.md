# Project Snapshot

## Structure

```
.
├──  BScriptRunner.js
├──  Docs
├──  index.js
├──  Other
└──  SRC
    ├──  Helpers.js
    ├──  Scope.js
    ├──  types
    │   └──  Type.js
    └──  Utils.js
```

## ./BScriptRunner.js

```javascript
const Type = require('./SRC/types/Type')
const Helpers = require('./SRC/Helpers')
const Utils = require('./SRC/Utils')
const Scope = require('./SRC/Scope')
const { BScriptValidate } = require('./SRC/Utils')

module.exports = class BScriptRunner {
	static ProcessingExitCode = {
	    None:     			0,
	    Error: 				-1,
	    Next:    			1,
	    Continue:    		2,
	}

	constructor(cmdEnviroment, options) {
		this.options = {
			silent: false,
			 ...options
		}
		this.executer = null;
		this.cmdEnviroment = cmdEnviroment;
		this.mainScript = null;
		this.paths = {}
		this.scopePathId = options?.scopePathId??"root";
		this.__baseDir = process.cwd();
		this._executeHistory=null
		this.scopes = {
			root: { $val: { __baseDir: this.__baseDir } },
			...(options?.scopes??{})
		}
		this.regexExpression = {
			scriptFrame: /(?:\$\([\s\S]*?\))?(.*.)/g,
			assignmentName: /\$\(([^=$]*)\)[^=$]/,
			assignmentValue: /(?<=\$\([\s\S]*?\)=).*/,
			preRunClean: /^[\n\s\t]*/gm,
		}
		this.Type = Type;

		this.scope = options?.scope;
	}
	setArgsToScope(scopeArgs, scopePathId) {
		if(!this.scopes[scopePathId])
			this.scopes[scopePathId] = {$arg: [], $val: {}};
		this.scopes[(scopePathId??"root")].$arg = scopeArgs;
	}
	setValueToScope(scopeValName, scopeVal, scopePathId) {
		if(!this.scopes[scopePathId])
			this.scopes[scopePathId] = {$arg: [], $val: {}};
		this.scopes[(scopePathId??"root")].$val = { ...(this.scopes[(scopePathId??"root")].$val??{}), [scopeValName]: scopeVal };
		return Helpers.Assignment(scopeValName, scopeVal)
	}
    commandExist(commandName) {
    	return !!this.cmdEnviroment._commands[commandName];
    }
    getScope() {
    	return Object.values(this.scopes).reduce((acc, e)=>({$arg: [...(acc.$arg??[]), ...(e.$arg??[])], $val: {...(acc.$val??{}), ...(e.$val??{})}}))
    }
    async commandExecute({commandName, options, args}) {
    	if(!this.commandExist(commandName)) {
    		if(!options?.silent){
    			throw new Error(`Command "${commandName}" not found! Try write "help" command.`);
    		}
			return { errorCode: -1};
    	}
    	try {
    		return await this.cmdEnviroment._commands[commandName].execute.bind(this)(...args);
    	} catch(e) {
			this.cmdEnviroment.commandController.Print(e.message.replace("\n", ""));
		}
    }
	UnFormateScopes(script) {
		let scopes = this.scriptPathFinder(script, 'scope');
		if(!scopes)
			return script;
		scopes.map((scope) => {
			script = script.replace(`$(${scope.path})`, `{${scope.scopeScript}}`)
		})
		return this.UnFormateScopes(script);
	}
	Create(run, _paths) {
		const { mainScript, paths } = BScriptValidate(this.regexExpression, run);
		this.mainScript = mainScript;
		this.paths = _paths??paths;
		this.executer = async (...args) => {
			if(this._executeHistory){
				this._executeHistory+=" -> " + this.scopePathId??"root"
			}
			else{
				this._executeHistory=this.scopePathId??"rootEqual"
			}
			this.setArgsToScope(args, this.scopePathId??"root");
			let results = []
	    	let regexFrameFound;
			while((regexFrameFound = this.regexExpression.scriptFrame.exec(this.mainScript)) != null) {
				// The beginning of a new frame
				const mainScope = new Scope(regexFrameFound[0], this.paths);
				do {
					// The beginning of a new scope
					
					const ScopeFlags = Scope.ScopeFlags;
					let scopeDeclarationType = mainScope.GetActiveDeclarations();

					const result = Object.entries(ScopeFlags)
					    .filter(([name, value]) => value !== 0 && (scopeDeclarationType & value))
					    .map(([name]) => name);

					// ############	AssigmentProcessing	############
					if(
						scopeDeclarationType & ScopeFlags.AssignmentName // The scope declaration is similar to the assignment name
					){
						const { 
							processingExitCode, 
							results : processingResults
						} = await this.#AssigmentProcessing(mainScope)
						if(processingExitCode == BScriptRunner.ProcessingExitCode.Continue || processingExitCode == BScriptRunner.ProcessingExitCode.None){
							results = [...results, ...processingResults]
							continue
						}
					}
					// ############	ConditionalOperatorProcessing	############
					if(
						scopeDeclarationType & ScopeFlags.AND ||
						scopeDeclarationType & ScopeFlags.OR ||
						scopeDeclarationType & ScopeFlags.LessThan ||
						scopeDeclarationType & ScopeFlags.MoreThan ||
						scopeDeclarationType & ScopeFlags.Equal
					){
						const { 
							processingExitCode, 
							results : processingResults
						} = await this.#ConditionalOperatorProcessing(mainScope)
						if(processingExitCode == BScriptRunner.ProcessingExitCode.Continue || processingExitCode == BScriptRunner.ProcessingExitCode.None){
							results = [...results, ...processingResults]
							continue
						}
					}					
					// ############	ConditionalProcessing	############
					if(
						scopeDeclarationType & ScopeFlags.If // The scope declaration is similar to the assignment name
					){
						const { 
							processingExitCode, 
							results : processingResults
						} = await this.#ConditionalProcessing(mainScope)
						if(processingExitCode == BScriptRunner.ProcessingExitCode.Continue || processingExitCode == BScriptRunner.ProcessingExitCode.None){
							results = [...results, ...processingResults]
							continue
						}
					}
					// ################	BaseProcessing	################
					if(
						!(scopeDeclarationType & ScopeFlags.Argument) // The current scope declaration does not match the argument 
						&& 
						mainScope?.exists // Scope exists
						&& 
						!(scopeDeclarationType & ScopeFlags.Text) // Declarations do not have a text format
					) {
						const { 
							processingExitCode, 
							results : processingResults
						} = await this.#BaseProcessing(mainScope)
						if(processingExitCode == BScriptRunner.ProcessingExitCode.Continue || processingExitCode == BScriptRunner.ProcessingExitCode.None){
							results = [...results, ...processingResults]
							continue
						}
					} 
					// ###########	#CommandProcessing	############
					const { 
						processingExitCode, 
						results : processingResults
					} = await this.#CommandProcessing(mainScope)
					if(processingExitCode == BScriptRunner.ProcessingExitCode.Continue || processingExitCode == BScriptRunner.ProcessingExitCode.None){
						results = [...results, ...processingResults]
						continue
					}
				} while(mainScope.ReadNext())
			}

	    	return results.length == 0? 
	    		Type.NONE
	    	: results.every(x => x?.type == "assignment") || (results.length == 1 && results[0]?.type == "assignment")?
	    	await Helpers.AssigmentsToObject(Helpers.Array(results), this.commandExecute.bind(this))
	    	: results.length > 1 ?
	    		Helpers.Array(results)
	    	: results[0];
    	}
	}
	// Scopes processing
	async #AssigmentProcessing(mainScope) {
		const results = []
		const ScopeFlags = Scope.ScopeFlags

		const nameScope = mainScope.singleCopy();
		const valueScope = mainScope.ReadNext();

		let assignmentValue = null;
		let assignmentNameValue = null;

		let assignmentEnviroment;
		switch(valueScope.scopeType) {
			case Scope.Quote:
				assignmentValue = Helpers.Text(valueScope.content.quoteText)
				break;
			case Scope.Default:
				if(!(valueScope.GetActiveDeclarations() & ScopeFlags.Function)) {				
					assignmentEnviroment = new BScriptRunner(this.cmdEnviroment, { scopes: this.scopes, scopePathId: valueScope.path })	
					assignmentEnviroment._executeHistory=this._executeHistory
					assignmentEnviroment.Create(valueScope.content.scopeScript, this.paths);
					assignmentValue = await assignmentEnviroment.executer()
				} else {
					assignmentValue = valueScope;
				}
				break;
		}

		switch(nameScope.scopeType) {
			case Scope.Quote:
				assignmentNameValue = Helpers.Text(nameScope.content.quoteText)
				break;
			case Scope.Default:
				const assignmentNameEnviroment = new BScriptRunner(this.cmdEnviroment, { scopes: { root: { $val: { ...assignmentValue?.val??{} } } }, scopePathId: nameScope.path })
				assignmentNameEnviroment._executeHistory=this._executeHistory
				assignmentNameEnviroment.Create(nameScope.content.scopeScript, this.paths);
				assignmentNameValue = await assignmentNameEnviroment.executer();
				break;
		}

		let refPath;
		switch(assignmentNameValue?.type) {
			case Type.ObjectType:
				if(assignmentValue?.type == Type.ObjectType){
					for (const key in assignmentNameValue.val) {
						refPath = key.split(".")
						if(refPath.length > 1) {
						} else {	
							results.push(this.setValueToScope(key, assignmentNameValue.val[key], this.scopePathId??"root"));				
						}
					}
				}
				return Helpers.ProcessingContinue(results);
			case Type.RawType:
			case Type.TextType:
				let value;

				const val = valueScope.GetActiveDeclarations() & ScopeFlags.Function ? 
								Helpers.Function(assignmentNameValue, Helpers.createFunction(assignmentNameValue, this, assignmentValue, this), !!(valueScope.GetActiveDeclarations() & ScopeFlags.Async)) 
							: assignmentValue;
				refPath = assignmentNameValue.val.split(".")
				if(refPath.length > 1) {
    				if(value = await Helpers.GetVal(refPath[0], this.commandExecute.bind(this))){
						if(valueScope.GetActiveDeclarations() & ScopeFlags.Object || val?.type == "array" && val.val.every(x => x?.type == "assignment") || val?.type == "assignment") {
    						await Helpers.createRef(refPath, value, this.commandExecute.bind(this)).set(await toObject(val))
							return Helpers.ProcessingContinue(results);
						}
						else if(val?.type) {
    						await Helpers.createRef(refPath, value, this.commandExecute.bind(this)).set(val)
							return Helpers.ProcessingContinue(results);
						}	
    				} else {
    					throw new Error(`Ref "${refPath.join(".")}" not found!`)
    				}
				} else {	
					results.push(this.setValueToScope(assignmentNameValue.val, val, this.scopePathId??"root"));
				}
				return Helpers.ProcessingContinue(results);
		}
	}
	async #BaseProcessing(mainScope) {
		const results = []
		const scope = mainScope;
		const scopeDeclarationType = mainScope.GetActiveDeclarations()
		const ScopeFlags = Scope.ScopeFlags

		if(scopeDeclarationType & ScopeFlags.Function){
			if(assignmentValue && assignmentName) {    				
			const value = Helpers.createFunction(null, this, Helpers.createFunction("Function", this, scope, this), this);
				results.push(this.setValueToScope("Function", value, this.scopePathId??"root"));
				return Helpers.ProcessingContinue(results);
			}
			else if(value)
				results.push(value);
		}
		else {
			async function scopeRunnerEnviroment0(context){
				const result = await Utils.newScriptRunner.bind(context)(scope.content.scopeScript, scope.path, this)()
				return scopeDeclarationType & ScopeFlags.Object ? await toObject(result) : result;
			}
			const executer = !(scopeDeclarationType & ScopeFlags.Text) ? scopeDeclarationType & ScopeFlags.Async ? scopeRunnerEnviroment0(this): await scopeRunnerEnviroment0(this) : null
			const value = (scopeDeclarationType & ScopeFlags.Text) ? 
					scopeDeclarationType & ScopeFlags.Quoted ?
					Helpers.Text(mainQuote.content.quoteText)
				:
					Helpers.Text(mainScope.content.scopeScript)
			: 
				scopeDeclarationType & ScopeFlags.Number  
			? 
				Helpers.Number(Number(scope.content.scopeScript))
			: 
				scopeDeclarationType & ScopeFlags.Async 
			? 
				new Type({ type: Type.PromiseType, val: executer })
			: 
				executer
			results.push(value);
			if((scopeDeclarationType & ScopeFlags.Text))
				return Helpers.ProcessingContinue(results);
		}
		if(!(scopeDeclarationType & ScopeFlags.Text))
			return Helpers.ProcessingContinue(results);	
	}
	async #CommandProcessing(mainScope) {
		const results = []
		try { 				
			function argType(arg, _browser=0) {
				if(Array.isArray(arg)) {
					const val = arg.map(x=>argType(x, ++_browser))
					return Helpers.Array(val)
				}
				return arg? !arg?.type && !arg?.val? new Type(arg) : arg : null
			}

			let args = mainScope.frame.split(" ").filter(x => x != '');
			const commandName = args[0].replace(" ");
			args.shift();
			for(let i = 0; i < args.length; i++) {
				const scope = new Scope(args[i], this.paths)

				if(scope?.exists){
					switch(scope.scopeType) {
						case Scope.Quote:
    						args[i] = Helpers.Text(scope.content.quoteText);
							break
					}
					if(scope.scopeType == Scope.Quote)
						continue;
				}
				else{
					args[i] = argType(args[i])
					continue;
				}

				const arg = await Utils.newScriptRunner.bind(this)(scope.content.scopeScript, scope.path)()
				if(arg)
					args[i] = argType(arg)
			}
			let value;
			if(this.commandExist(commandName)) {	
				if(value = await this.commandExecute.bind(this)({ commandName, args, options: this.options })){
					results.push(value);
				}
			} else{
				let refPath;
				if((refPath = commandName.split("."))) {
    				if(commandName.startsWith("$")){
	    				if(value = await Helpers.GetVal(refPath[0].substring(1), this.commandExecute.bind(this))){
							if(refPath.length > 1) {
								refPath.shift();
								let get = refPath[refPath.length - 1] == "*" ? true : false;
								if(get)
									refPath.pop();
								results.push(
									await Helpers.createRef(refPath, value, this.commandExecute.bind(this)).then(ref=> get ? ref.get() : ref )
								)
							} else {
	    						results.push(value);
							}
	    				} else {
	    					throw new Error(`Variable "${commandName}" not found!`)
	    				}
						return Helpers.ProcessingContinue(results);
    				}
				}
				throw new Error(`Command by name "${commandName}" not found!`)
			}
		} catch(e) {
			return Helpers.ProcessingContinue(results);
			await this.cmdEnviroment.commandController.Print(e.message.replace("\n", ""));
		}
		return Helpers.ProcessingContinue(results);
	}
	async #ConditionalProcessing(mainScope) {
	    const results = [];

	    const executeScope = async (scope) => {
	        const env = new BScriptRunner(
	            this.cmdEnviroment,
	            {
	                scopes: this.scopes,
	                scopePathId: scope.path
	            }
	        );

	        env._executeHistory = this._executeHistory;
	        env.Create(scope.content.scopeScript, this.paths);

	        return await env.executer();
	    };

	    const ifConditionScope = mainScope.singleCopy();
	    const ifBlockScope = mainScope.ReadNext().singleCopy();

	    const ifResult = await executeScope(ifConditionScope);

	    if (ifResult?.type == Type.BooleanType && ifResult.val) {
	        results.push(await executeScope(ifBlockScope));
	    }

	    while (mainScope.ReadNext()) {
	    	if((ifResult?.type == Type.BooleanType && ifResult.val))
	    		continue;
	        const scope = mainScope.singleCopy();
	        const declarations = scope.GetActiveDeclarations();

	        if (declarations & Scope.ScopeFlags.ElseIf) {
	            const elseIfCondition = await executeScope(scope);

	            if (elseIfCondition?.type == Type.BooleanType && elseIfCondition.val) {
	                const elseIfBlock = mainScope.ReadNext();
	                results.push(await executeScope(elseIfBlock));
	            }

	            mainScope.ReadNext();
	        }
	        else if (declarations & Scope.ScopeFlags.Else) {
	            results.push(await executeScope(scope));
	            return Helpers.ProcessingContinue(results);
	        }
	        else {
	            break;
	        }
	    }

	    return Helpers.ProcessingContinue(results);
	}
	async #ConditionalOperatorProcessing(mainScope) {
		const results = [];

		let lastOperatorScope = mainScope.singleCopy();

		const firstOperatorArgEnviroment = new BScriptRunner(
		    this.cmdEnviroment,
		    { scopes: this.scopes, scopePathId: mainScope.path }
		);

		firstOperatorArgEnviroment._executeHistory = this._executeHistory;
		firstOperatorArgEnviroment.Create(mainScope.content.scopeScript, this.paths);

		let lastOperatorResult = await firstOperatorArgEnviroment.executer();

		mainScope.ReadNext();

		async function executeScope(scope) {
		    const env = new BScriptRunner(
		        this.cmdEnviroment,
		        { scopes: this.scopes, scopePathId: scope.path }
		    );

		    env._executeHistory = this._executeHistory;
		    env.Create(scope.content.scopeScript, this.paths);

		    return await env.executer();
		}

		do {
		    const declarations = lastOperatorScope.GetActiveDeclarations();

		    if (!lastOperatorResult)
		        break;

		    const operatorArgResult = await executeScope.call(this, mainScope);

		    if (declarations & Scope.ScopeFlags.AND) {
		        if (
		            operatorArgResult?.type === Type.BooleanType &&
		            lastOperatorResult?.type === Type.BooleanType
		        ) {
		            lastOperatorResult = Helpers.Boolean(
		                lastOperatorResult.val && operatorArgResult.val
		            );
		        }
		    }
		    else if (declarations & Scope.ScopeFlags.OR) {
		        if (
		            operatorArgResult?.type === Type.BooleanType &&
		            lastOperatorResult?.type === Type.BooleanType
		        ) {
		            lastOperatorResult = Helpers.Boolean(
		                lastOperatorResult.val || operatorArgResult.val
		            );
		        }
		    }
		    else if (declarations & Scope.ScopeFlags.LessThan) {
		        if (
		            operatorArgResult?.type === Type.NumberType &&
		            lastOperatorResult?.type === Type.NumberType
		        ) {
		            lastOperatorResult = Helpers.Boolean(
		                lastOperatorResult.val < operatorArgResult.val
		            );
		        }
		    }
		    else if (declarations & Scope.ScopeFlags.MoreThan) {
		        if (
		            operatorArgResult?.type === Type.NumberType &&
		            lastOperatorResult?.type === Type.NumberType
		        ) {
		            lastOperatorResult = Helpers.Boolean(
		                lastOperatorResult.val > operatorArgResult.val
		            );
		        }
		    }
		    else if (declarations & Scope.ScopeFlags.Equal) {
		        lastOperatorResult = Helpers.Boolean(
		            lastOperatorResult.val == operatorArgResult.val
		        );
		    }

		    lastOperatorScope = mainScope.singleCopy();

		} while (mainScope.ReadNext());

		results.push(lastOperatorResult);

		return Helpers.ProcessingContinue(results);
	}
}
```

## ./index.js

```javascript
const BScriptRunner = require("./BScriptRunner")
const Type = require("./SRC/types/Type")
const Helpers = require("./SRC/Helpers.js")

module.exports={
	Runner: BScriptRunner,
	Type,
	Helpers
}
```

## ./SRC/Helpers.js

```javascript
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
```

## ./SRC/Scope.js

```javascript
module.exports = class Scope {
	static ScopeFlags = {
	    None:     			0,
	    Async:    			1 << 0,
	    Function: 			1 << 1,
	    Object:   			1 << 2,
	    Argument: 			1 << 3,
	    Text:     			1 << 4,
	    Num:      			1 << 5,
	    If:       			1 << 6,
	    Else:       		1 << 7,
	    ElseIf:       		1 << 8,
	    AssignmentName:     1 << 9,
	    AssignmentValue:    1 << 10,
	    Quoted:      		1 << 11,
	    AND:      			1 << 12,
	    LessThan:      		1 << 13,
	    MoreThan:      		1 << 14,
	    OR:      			1 << 15,
	    Equal:      		1 << 16,
	}
	static Quote = "quote"
	static Default = "scope"
	
	#scopes = [];
	#pathsContentRefs = {};
	#regex = {
		pathFullDeclaration: new RegExp(`\\$\\(((${Scope.Quote}|${Scope.Default}):path:([0-9]+):([0-9]+))\\)`, 'g'),
		assignmentName: /\$\(([^=$]*)\)[^=$]/,
		assigningValue: /(?<=\$\([\s\S]*?\)=).*/,
	}
	exists = false;
	scopeType = Scope.Default;
	meta = {

	}

	get content() {
	    return this.#pathsContentRefs[this.path];
	}

	static createPath(type, enclosure, index) {
		return `${type}:path:${enclosure}:${index}`
	}

	getScopeIndex(i) {
		return this.#scopes[i]
	}

	getCount() {
		return this.#scopes.length
	}
	getLast() {
		return this.#scopes[this.#scopes.length - 1]
	}
	getChildScopeByPath(childPath) {
		const pathRegex = /^([^:]+):path:(\d+):(\d+)$/;
		
		const match = childPath.match(pathRegex);
		childPath = {
			raw: match[0],
			type: match[1],
			enclosure: Number(match[2]),
			index: Number(match[3])
		}
		return new Scope(this.#pathsContentRefs[childPath.raw]?.scopeScript, this.#pathsContentRefs, childPath.type);
	}
	GetActiveDeclarations() {
		let activeFlags = Scope.ScopeFlags.None

		if(this.exists)
		{
			switch(this.scopeType) {
				case Scope.Default:
					if (this.beforePath.endsWith("FUNC=>"))
					    activeFlags |= Scope.ScopeFlags.Function;

					if (this.beforePath.endsWith("OBJECT"))
					    activeFlags |= Scope.ScopeFlags.Object;

					if (this.beforePath.endsWith("ASYNC-FUNC=>"))
					    activeFlags |= Scope.ScopeFlags.Async;

					if (this.beforePath.endsWith("$"))
					    activeFlags |= Scope.ScopeFlags.Argument;

					if (this.beforePath.endsWith("TEXT"))
					    activeFlags |= Scope.ScopeFlags.Text;

					if (this.beforePath.endsWith("NUM"))
					    activeFlags |= Scope.ScopeFlags.Num;
					if (this.beforePath.endsWith("IF(") && this.afterPath.endsWith(")"))
					    activeFlags |= Scope.ScopeFlags.If;
					if (this.beforePath.endsWith("ELSE"))
					    activeFlags |= Scope.ScopeFlags.Else;
					if (this.beforePath.endsWith("ELSE IF(") && this.afterPath.endsWith(")"))
					    activeFlags |= Scope.ScopeFlags.ElseIf;
					if (this.afterPath.startsWith(" AND"))
					    activeFlags |= Scope.ScopeFlags.AND;
					if (this.afterPath.startsWith(" OR"))
					    activeFlags |= Scope.ScopeFlags.OR;
					if (this.afterPath.startsWith(" <"))
					    activeFlags |= Scope.ScopeFlags.LessThan;
					if (this.afterPath.startsWith(" >"))
					    activeFlags |= Scope.ScopeFlags.MoreThan;
					if (this.afterPath.startsWith(" ="))
					    activeFlags |= Scope.ScopeFlags.Equal;
					break;
				case Scope.Quote:
				    activeFlags |= Scope.ScopeFlags.Quoted;
					activeFlags |= Scope.ScopeFlags.Text;
					break;
			}
			if(this.beforePath.endsWith("$(") && this.afterPath.startsWith(")=")){
			    activeFlags |= Scope.ScopeFlags.AssignmentName;
			}
			else if(this.beforePath.match(this.#regex.assignmentName)? this.beforePath.match(this.#regex.assignmentName)[0] : null){
				activeFlags |= Scope.ScopeFlags.AssignmentValue
			}
		}

		return activeFlags
	}
	constructor(bscriptPathInterpretation, pathsContentRefs = {}) {
    	const findPathRegex = this.#regex.pathFullDeclaration;
    	let regexPathFound;
    	this.#pathsContentRefs = pathsContentRefs;
    	this.frame = bscriptPathInterpretation;

    	while ((regexPathFound = findPathRegex.exec(bscriptPathInterpretation)) !== null) {
    		const scope = { 
    			scopeType: regexPathFound[2],
    			beforePath: bscriptPathInterpretation.slice(0, regexPathFound.index), 
    			afterPath: bscriptPathInterpretation.slice(regexPathFound.index+regexPathFound[0].length, bscriptPathInterpretation.length), 
    			path: regexPathFound[1],
    			scopeIteractionIndex: Number(regexPathFound[3]), 
    			childsCount: Number(regexPathFound[4]), 
    		}

    		if(!this.exists) {
    			Object.assign(this, scope);
    			this.exists = true;
    		}
    		else {
    			this.#scopes.push(scope);
    		}
    	}
	}
	copy() {
	    return new this.constructor(this.frame, this.#pathsContentRefs);
	}
	singleCopy() {
		const scopeCopy = new this.constructor("$(" + this.path + ")", this.#pathsContentRefs);
		scopeCopy.beforePath = this.beforePath;
		scopeCopy.afterPath = this.afterPath;
		return scopeCopy;
	}
	ReadNext() {
	    const next = this.#scopes.shift();

	    if (!next) return null;

	    Object.assign(this, next);
	    return this;
	}

}
```

## ./SRC/types/Type.js

```javascript
module.exports = class Type {
	static FuncionType = "func"
	static PromiseType = "promise"
	static TextType = "text"
	static NumberType = "number"
	static BooleanType = "bool"
	static ArrayType = "array"
	static JSType = "jstype"
	static ObjectType = "object"
	static RefType = "ref"
	static RawType = "RAW"
	static Assignment = "assignment"
	static NONE = new Type('NONE')


	constructor(options) {
		if(!options?.type) {
			options = { 
				type: Type.RawType,
				val: options
			}
		}
		Object.keys(options).map(key => {
			this[key] = options[key];options
		})
	}
	GetDisplayType(indent = 0) {
		const Color = {
			Reset:   "\x1b[0m",

			Object:  "\x1b[96m",
			Key:     "\x1b[94m",

			String:  "\x1b[92m",
			Number:  "\x1b[93m",
			Boolean: "\x1b[95m",

			Ref:     "\x1b[36m",
			Func:    "\x1b[91m",
			Promise: "\x1b[35m",

			Index:   "\x1b[90m",
			Null:    "\x1b[90m",
			Bracket: "\x1b[37m",
		};
	    const nextIndent = indent + 1;
	    const pad = " ".repeat(nextIndent);

		switch(this?.type){
			case Type.FuncionType: return `${Color.Func}[FUNC${this?.name ? "-"+this.name : ""}]${Color.Reset}`
			case Type.PromiseType: return `${Color.Bracket}{${Color.Promise}PROMISE${Color.Bracket}[${Color.Reset}...${Color.Bracket}]}${Color.Reset}`
			case Type.TextType: return `${Color.String}${this.val}${Color.Reset}`
			case Type.NumberType: return `${Color.Number}${this.val}${Color.Reset}`
			case Type.BooleanType: return `${Color.Boolean}[${this.val == 1? "TRUE": "FALSE"}]${Color.Reset}`
			case Type.ArrayType: {
			    const lines = [];

			    lines.push(
			        `${Color.Object}[ARRAY(${Color.Reset}${this.val.length}${Color.Object}){${Color.Reset}`
			    );

			    for (let i = 0; i < this.val.length; i++) {
			        lines.push(
			            `${pad}${Color.Index}[${i}]${Color.Reset} = ${
			                this.val[i]
			                    .GetDisplayType(nextIndent)
			                    .replaceAll("\n", "\n" + pad)
			            }`
			        );
			    }

			    lines.push(
			        `${" ".repeat(indent)}${Color.Object}}]${Color.Reset}`
			    );

			    return lines.join("\n");
			}
			case Type.JSType: return this.val
			case Type.ObjectType:
				const lines = [];

				lines.push(`${Color.Object}[OBJECT{${Color.Reset}`);

				for (const key of Object.keys(this.val)) {
				    lines.push(
				        `${Color.Key}${pad}${key}${Color.Reset} = ${
				            this.val[key]
				                .GetDisplayType(nextIndent)
				                .replaceAll("\n", "\n" + pad)
				        }`
				    );
				}

				lines.push(`${" ".repeat(indent)}${Color.Object}}]${Color.Reset}`);

				return lines.join("\n");
			case Type.RefType: {
			    const lines = [];

			    lines.push(
			        `${Color.Ref}REF->${Color.Reset}`
			    );

			    lines.push(
			        this.get()
			            .GetDisplayType(nextIndent)
			    );

			    lines.push(
			        `${" ".repeat(indent)}`
			    );

			    return lines.join("");
			}
			case Type.RawType: return `[NOTYPE ${this.val}]`
			default: return `[RAW ${this}]`
		}
	}
}
```

## ./SRC/Utils.js

```javascript
const Type = require('./types/Type')

module.exports = {
	newScriptRunner: function(script, scopeid){
		const Runner = require("./../BScriptRunner.js")
		const mainScope = new Runner(this.cmdEnviroment, { scopes: this.scopes, scopePathId: scopeid })	
		mainScope._executeHistory=this._executeHistory
		mainScope.Create(script, this.paths);
		return mainScope.executer
	},
	baseInterpolation: (text) => {
	return eval('`' + text + '`')
	},
	findQuotedText: (text) => {
		const regex = /(?<!\\)(["'])([\s\S]*?)(?<!\\)\1/g;
		const results = []
		while ((array = regex.exec(text)) !== null) {
		    results.push({
		        text: array[2],
		        indexStart: array.index,
		        indexEnd: array.index + array[0].length
		    });
		}
	    return results;
	},
	commandSplitter: (text) => {
		const quotedText = findQuotedText(text);
		let a = 0;
		_text = quotedText.reduce((text, x, index) => {
			const newText = x ? text.slice(0, x.indexStart-a) + "{quoted}" + text.slice(x.indexEnd + a, text.length) : text;
			a += text.length - newText.length;
			return newText;
		}, text)
		const args = text ? _text
			.split("{quoted}")
			.filter(x=>x != "")
			.reduce(
				(arr, el, i) => 
					[
						...arr, 
						...el.split(" ").filter(x=>x != ""), 
						baseInterpolation(quotedText[i]?.text??"")], []): []
		const commandName = args[0];
		args.shift();

		return (
			{ 
				command: commandName, 
				args:  args
			}
		)
	},
	BScriptValidate: (regexExpression, rawScript) => {
    	const _quoteCombine = (script, mirrorOffsetFrame = -1, _rawFrameInfo = []) => {
			if(mirrorOffsetFrame == -1){
				const x = _quoteCombine(script, 0);
				const paths = x.rawFrameInfo.map((x, index, array) => array[(array.length-1)-index]).reduce((acc, e) => ({...acc, [e.path]: e}), {});
				return { mainScript: x.clearScript, paths };
			}


			const regexQuoteFrame = /([`])([\S\s]*?)(\1)/g;
			let regexQuoteFrameFound;

			if(!script.match(regexQuoteFrame))
				return { rawFrameInfo: _rawFrameInfo, clearScript: script };
		
	    	const rawFrameInfo = []

			let newScriptUnparsed = script;
			let offsetFoundIndex = 0;
			let currentFrameScopeIndex = 0;
			let quoteToPush = null;
			while ((regexQuoteFrameFound = regexQuoteFrame.exec(script)) !== null) {
				quoteToPush = { quoteText: regexQuoteFrameFound[2], mirrorOffsetFrame, path: `quote:path:${mirrorOffsetFrame}:${currentFrameScopeIndex}`}

			    rawFrameInfo.push(quoteToPush)
				newScriptUnparsed = newScriptUnparsed.slice(0, regexQuoteFrameFound.index - offsetFoundIndex) + `$(quote:path:${mirrorOffsetFrame}:${currentFrameScopeIndex})` + newScriptUnparsed.slice(regexQuoteFrameFound.index + regexQuoteFrameFound[0].length - offsetFoundIndex, newScriptUnparsed.length);
			    offsetFoundIndex = script.length - newScriptUnparsed.length;
			    currentFrameScopeIndex++;
			}
			return _quoteCombine(newScriptUnparsed, ++mirrorOffsetFrame, [..._rawFrameInfo, ...rawFrameInfo]);
    	}

    	const _scopeCombine = (script, mirrorOffsetFrame = -1, _rawFrameInfo = []) => {		
			if(mirrorOffsetFrame == -1){
				const x = _scopeCombine(script, 0);
				const paths = x.rawFrameInfo.map((x, index, array) => array[(array.length-1)-index]).reduce((acc, e) => ({...acc, [e.path]: e}), {});
				return { mainScript: x.clearScript, paths };
			}

			const regexScopeFrame = /(?=(\{([^\{\}]*(?:\{[^\{\}]*\}[^\{\}]*)*)\})){([^\{\}]*)}/g;
			let regexScopeFrameFound;

			if(!script.match(regexScopeFrame))
				return { rawFrameInfo: _rawFrameInfo, clearScript: script };
		
	    	const rawFrameInfo = []

			let newScriptUnparsed = script;
			let offsetFoundIndex = 0;
			let currentFrameScopeIndex = 0;
			let scopeToPush = null;
			while ((regexScopeFrameFound = regexScopeFrame.exec(script)) !== null) {
				scopeToPush = { scopeScript: regexScopeFrameFound[2], mirrorOffsetFrame, path: `scope:path:${mirrorOffsetFrame}:${currentFrameScopeIndex}`}

			    rawFrameInfo.push(scopeToPush)
				newScriptUnparsed = newScriptUnparsed.slice(0, regexScopeFrameFound.index - offsetFoundIndex) + `$(scope:path:${mirrorOffsetFrame}:${currentFrameScopeIndex})` + newScriptUnparsed.slice(regexScopeFrameFound.index + regexScopeFrameFound[0].length - offsetFoundIndex, newScriptUnparsed.length);
			    offsetFoundIndex = script.length - newScriptUnparsed.length;
			    currentFrameScopeIndex++;
			}
			return _scopeCombine(newScriptUnparsed, ++mirrorOffsetFrame, [..._rawFrameInfo, ...rawFrameInfo]);
    	}
    	
    	const quoteCombined = _quoteCombine(rawScript);
    	rawScript = quoteCombined.mainScript;
    	rawScript = rawScript.replace(regexExpression.preRunClean, "");
    	const scopeCombined = _scopeCombine(rawScript);


    	return { paths: { ...scopeCombined.paths, ...quoteCombined.paths }, mainScript: scopeCombined.mainScript }
	}
}
```

