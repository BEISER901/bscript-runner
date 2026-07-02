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


					// ############	QuoteProcessing	############
					if(
						scopeDeclarationType & ScopeFlags.Quoted && // In quotation marks
						scopeDeclarationType & ScopeFlags.Text && // And text-based
						mainScope.beforePath.replace("\t", "").replace(" ", "") == "" && mainScope.afterPath.replace("\t", "").replace(" ", "") == "" // There is nothing before and after the buckets
					){
						results.push(Helpers.Text(mainScope.content.quoteText))
						continue
					}
					// ############	FunctionProcessing	############
					if(
						scopeDeclarationType & ScopeFlags.Function
					){
						const value = Helpers.createFunction(null, this, Helpers.createFunction(null, this, mainScope, this), this);
						results.push(Helpers.Function(null, value, !!(mainScope.GetActiveDeclarations() & ScopeFlags.Async)));
						continue
					}
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

		async function scopeRunnerEnviroment0(context){
			const result = await Utils.newScriptRunner.bind(context)(scope.content.scopeScript, scope.path, this)()
			return scopeDeclarationType & ScopeFlags.Object ? await toObject(result) : result;
		}
		const executer = !(scopeDeclarationType & ScopeFlags.Text) ? scopeDeclarationType & ScopeFlags.Async ? scopeRunnerEnviroment0(this): await scopeRunnerEnviroment0(this) : null

		const value = (scopeDeclarationType & ScopeFlags.Text) ? 
				scopeDeclarationType & ScopeFlags.Quoted ?
				Helpers.Text(mainScope.content.quoteText)
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

			let args = mainScope.frame.replace("\t", "").split(" ").filter(x => x != '');

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