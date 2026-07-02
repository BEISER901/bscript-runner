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
			case Type.FuncionType: return `${Color.Func}[${this?.isAsync? "ASYNC-": ""}FUNC${this?.name ? "-"+this.name.val : ""}]${Color.Reset}`
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