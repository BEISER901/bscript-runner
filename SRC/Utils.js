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