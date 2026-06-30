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