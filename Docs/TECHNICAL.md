# Technical Documentation

This document describes the complete internal architecture of the library, including public and internal modules, classes, functions, constants, and helper utilities.

Public declarations are also documented in **REFERENCE.md**, while this document contains implementation details intended primarily for contributors and maintainers.

---

## Guide

<details>
<summary>BScriptRunner</summary>

## Parent
[BScriptRunner.BScriptRunner](#BScriptRunner.BScriptRunner)

### Constants
- [ProcessingExitCode](#BScriptRunner.BScriptRunner.ProcessingExitCode)

### Properties
- [options](#BScriptRunner.BScriptRunner.options)
- [executer](#BScriptRunner.BScriptRunner.executer)
- [cmdEnviroment](#BScriptRunner.BScriptRunner.cmdEnviroment)
- [mainScript](#BScriptRunner.BScriptRunner.mainScript)
- [paths](#BScriptRunner.BScriptRunner.paths)
- [scopePathId](#BScriptRunner.BScriptRunner.scopePathId)
- [scopes](#BScriptRunner.BScriptRunner.scopes)
- [regexExpression](#BScriptRunner.BScriptRunner.regexExpression)
- [Type](#BScriptRunner.BScriptRunner.Type)
- [scope](#BScriptRunner.BScriptRunner.scope)

### Methods
- [setArgsToScope](#BScriptRunner.BScriptRunner.setArgsToScope)
- [setValueToScope](#BScriptRunner.BScriptRunner.setValueToScope)
- [commandExist](#BScriptRunner.BScriptRunner.commandExist)
- [getScope](#BScriptRunner.BScriptRunner.getScope)
- [commandExecute](#BScriptRunner.BScriptRunner.commandExecute)
- [UnFormateScopes](#BScriptRunner.BScriptRunner.UnFormateScopes)
- [Create](#BScriptRunner.BScriptRunner.Create)
- [#AssigmentProcessing](#BScriptRunner.BScriptRunner.AssigmentProcessing)
- [#BaseProcessing](#BScriptRunner.BScriptRunner.BaseProcessing)
- [#CommandProcessing](#BScriptRunner.BScriptRunner.CommandProcessing)
- [#ConditionalProcessing](#BScriptRunner.BScriptRunner.ConditionalProcessing)
- [#ConditionalOperatorProcessing](#BScriptRunner.BScriptRunner.ConditionalOperatorProcessing)

### Nested Classes
None

</details>

<details>
<summary>index</summary>

## Parent
[index.exports](#index.exports)

### Constants
None

### Properties
- [Runner](#index.exports.Runner)
- [Type](#index.exports.Type)
- [Helpers](#index.exports.Helpers)

### Methods
None

### Nested Classes
None

</details>

<details>
<summary>Helpers</summary>

## Parent
[Helpers.exports](#Helpers.exports)

### Constants
None

### Properties
None

### Methods
- [createFunction](#Helpers.exports.createFunction)
- [createRef](#Helpers.exports.createRef)
- [AssigmentsToObject](#Helpers.exports.AssigmentsToObject)
- [GetVal](#Helpers.exports.GetVal)
- [Object](#Helpers.exports.Object)
- [Text](#Helpers.exports.Text)
- [Array](#Helpers.exports.Array)
- [Boolean](#Helpers.exports.Boolean)
- [Number](#Helpers.exports.Number)
- [Assignment](#Helpers.exports.Assignment)
- [Function](#Helpers.exports.Function)
- [ProcessingContinue](#Helpers.exports.ProcessingContinue)
- [ProcessingError](#Helpers.exports.ProcessingError)

### Nested Classes
None

</details>

<details>
<summary>Scope</summary>

## Parent
[Scope.Scope](#Scope.Scope)

### Constants
- [ScopeFlags](#Scope.Scope.ScopeFlags)
- [Quote](#Scope.Scope.Quote)
- [Default](#Scope.Scope.Default)

### Properties
- [content](#Scope.Scope.content)
- [exists](#Scope.Scope.exists)
- [scopeType](#Scope.Scope.scopeType)
- [meta](#Scope.Scope.meta)
- [frame](#Scope.Scope.frame)
- [beforePath](#Scope.Scope.beforePath)
- [afterPath](#Scope.Scope.afterPath)
- [path](#Scope.Scope.path)
- [scopeIteractionIndex](#Scope.Scope.scopeIteractionIndex)
- [childsCount](#Scope.Scope.childsCount)

### Methods
- [createPath](#Scope.Scope.createPath)
- [getScopeIndex](#Scope.Scope.getScopeIndex)
- [getCount](#Scope.Scope.getCount)
- [getLast](#Scope.Scope.getLast)
- [getChildScopeByPath](#Scope.Scope.getChildScopeByPath)
- [GetActiveDeclarations](#Scope.Scope.GetActiveDeclarations)
- [copy](#Scope.Scope.copy)
- [singleCopy](#Scope.Scope.singleCopy)
- [ReadNext](#Scope.Scope.ReadNext)

### Nested Classes
None

</details>

<details>
<summary>Utils</summary>

## Parent
[Utils.exports](#Utils.exports)

### Constants
None

### Properties
None

### Methods
- [newScriptRunner](#Utils.exports.newScriptRunner)
- [baseInterpolation](#Utils.exports.baseInterpolation)
- [findQuotedText](#Utils.exports.findQuotedText)
- [commandSplitter](#Utils.exports.commandSplitter)
- [BScriptValidate](#Utils.exports.BScriptValidate)

### Nested Classes
None

</details>

<details>
<summary>Type</summary>

## Parent
[Type.Type](#Type.Type)

### Constants
- [FuncionType](#Type.Type.FuncionType)
- [PromiseType](#Type.Type.PromiseType)
- [TextType](#Type.Type.TextType)
- [NumberType](#Type.Type.NumberType)
- [BooleanType](#Type.Type.BooleanType)
- [ArrayType](#Type.Type.ArrayType)
- [JSType](#Type.Type.JSType)
- [ObjectType](#Type.Type.ObjectType)
- [RefType](#Type.Type.RefType)
- [RawType](#Type.Type.RawType)
- [Assignment](#Type.Type.Assignment)
- [NONE](#Type.Type.NONE)

### Properties
None

### Methods
- [GetDisplayType](#Type.Type.GetDisplayType)

### Nested Classes
None

</details>

---

<a id="BScriptRunner.BScriptRunner"></a>

## BScriptRunner.BScriptRunner

[REFERENCE.md](./REFERENCE.md#Runner)

### Opportunities

- Parses and executes BScript source text via a regex-driven scope/frame walker
- Maintains a layered scope/variable table (`scopes`) keyed by `scopePathId`
- Supports assignments, references (`$val`/`ref`), conditionals (`IF`/`ELSE IF`/`ELSE`), logical/comparison operators (`AND`/`OR`/`<`/`>`/`=`), function declarations (sync and async), and arbitrary command dispatch
- Spawns nested `BScriptRunner` instances to evaluate sub-scopes, preserving an `_executeHistory` trail for diagnostics

### Declaration

```javascript
class BScriptRunner
```

The default export of `./BScriptRunner.js`. Represents a single script execution context: it validates raw script text, builds an internal scope tree, and exposes an `executer` function that walks that tree, dispatching to internal processing stages (assignment, conditional, conditional-operator, base, command) until a final `Type` result (or array/object of results) is produced.

---

## Constants

<table>

<tr>
<th>Constant</th>
<th>Declaration</th>
<th>Description</th>
</tr>

<tr>

<a id="BScriptRunner.BScriptRunner.ProcessingExitCode"></a>

<td>

<code>ProcessingExitCode</code>

</td>

<td>

```javascript
static ProcessingExitCode = {
    None: 0,
    Error: -1,
    Next: 1,
    Continue: 2,
}
```

</td>

<td>

Enum-like map of exit codes returned by each internal `#...Processing` stage. `Continue` (or `None`) tells the main execution loop to merge `results` and proceed to the next scope iteration.

</td>

</tr>

</table>

---

## Properties

<table>

<tr>
<th>Property</th>
<th>Declaration</th>
<th>Description</th>
</tr>

<tr>

<a id="BScriptRunner.BScriptRunner.options"></a>

<td>

<code>options</code>

</td>

<td>

```javascript
runner.options
```

</td>

<td>

Runtime options for this runner instance, defaulting to `{ silent: false }` and merged with any `options` passed to the constructor.

</td>

</tr>

<tr>

<a id="BScriptRunner.BScriptRunner.executer"></a>

<td>

<code>executer</code>

</td>

<td>

```javascript
runner.executer
```

</td>

<td>

The async function produced by `Create()` that, when invoked, walks `mainScript` and returns the final `Type` (or `Type.NONE`, array, or object) result. `null` until `Create()` is called.

</td>

</tr>

<tr>

<a id="BScriptRunner.BScriptRunner.cmdEnviroment"></a>

<td>

<code>cmdEnviroment</code>

</td>

<td>

```javascript
runner.cmdEnviroment
```

</td>

<td>

The host command environment supplied to the constructor. Expected to expose `_commands` (a map of registered commands) and `commandController.Print`.

</td>

</tr>

<tr>

<a id="BScriptRunner.BScriptRunner.mainScript"></a>

<td>

<code>mainScript</code>

</td>

<td>

```javascript
runner.mainScript
```

</td>

<td>

The validated/normalized script text produced by `Utils.BScriptValidate`, set by `Create()`.

</td>

</tr>

<tr>

<a id="BScriptRunner.BScriptRunner.paths"></a>

<td>

<code>paths</code>

</td>

<td>

```javascript
runner.paths
```

</td>

<td>

Map of path identifiers (e.g. `scope:path:0:0`, `quote:path:1:0`) to their extracted raw frame info, used to resolve `Scope` content during execution.

</td>

</tr>

<tr>

<a id="BScriptRunner.BScriptRunner.scopePathId"></a>

<td>

<code>scopePathId</code>

</td>

<td>

```javascript
runner.scopePathId
```

</td>

<td>

Identifier of the variable scope this runner instance writes into/reads from within the shared `scopes` table. Defaults to `"root"`.

</td>

</tr>

<tr>

<a id="BScriptRunner.BScriptRunner.scopes"></a>

<td>

<code>scopes</code>

</td>

<td>

```javascript
runner.scopes
```

</td>

<td>

The shared variable-scope table (`{ [scopePathId]: { $arg, $val } }`), seeded with a `root` scope containing `__baseDir`, merged with any `options.scopes` passed in.

</td>

</tr>

<tr>

<a id="BScriptRunner.BScriptRunner.regexExpression"></a>

<td>

<code>regexExpression</code>

</td>

<td>

```javascript
runner.regexExpression
```

</td>

<td>

Set of regular expressions used during parsing/execution: `scriptFrame` (splits the script into frames), `assignmentName`, `assignmentValue`, and `preRunClean` (strips leading whitespace per line).

</td>

</tr>

<tr>

<a id="BScriptRunner.BScriptRunner.Type"></a>

<td>

<code>Type</code>

</td>

<td>

```javascript
runner.Type
```

</td>

<td>

Reference to the `Type` class/module, attached to the instance for convenience.

</td>

</tr>

<tr>

<a id="BScriptRunner.BScriptRunner.scope"></a>

<td>

<code>scope</code>

</td>

<td>

```javascript
runner.scope
```

</td>

<td>

Optional `scope` value forwarded from constructor `options`.

</td>

</tr>

</table>

---

## Methods

<table>

<tr>
<th>Method</th>
<th>Declaration</th>
<th>Description</th>
</tr>

<tr>

<a id="BScriptRunner.BScriptRunner.setArgsToScope"></a>

<td>

<code>setArgsToScope</code>

</td>

<td>

```javascript
setArgsToScope(
    scopeArgs,
    scopePathId
)
```

</td>

<td>

Initializes the target scope entry (if missing) and assigns `scopeArgs` to its `$arg` array.

</td>

</tr>

<tr>

<a id="BScriptRunner.BScriptRunner.setValueToScope"></a>

<td>

<code>setValueToScope</code>

</td>

<td>

```javascript
setValueToScope(
    scopeValName,
    scopeVal,
    scopePathId
)
```

</td>

<td>

Initializes the target scope entry (if missing), merges `scopeValName: scopeVal` into its `$val` map, and returns an `assignment`-typed `Type` describing the write via `Helpers.Assignment`.

</td>

</tr>

<tr>

<a id="BScriptRunner.BScriptRunner.commandExist"></a>

<td>

<code>commandExist</code>

</td>

<td>

```javascript
commandExist(
    commandName
)
```

</td>

<td>

Returns `true` if `commandName` is registered on `cmdEnviroment._commands`.

</td>

</tr>

<tr>

<a id="BScriptRunner.BScriptRunner.getScope"></a>

<td>

<code>getScope</code>

</td>

<td>

```javascript
getScope()
```

</td>

<td>

Reduces every entry of `scopes` into a single merged `{ $arg, $val }` object.

</td>

</tr>

<tr>

<a id="BScriptRunner.BScriptRunner.commandExecute"></a>

<td>

<code>commandExecute</code>

</td>

<td>

```javascript
commandExecute({
    commandName,
    options,
    args
})
```

</td>

<td>

Looks up `commandName` on `cmdEnviroment._commands` and invokes its `execute` method bound to this runner with `args`. Throws (unless `options.silent`) if the command is missing, returning `{ errorCode: -1 }` in silent mode. Catches execution errors and prints them via `cmdEnviroment.commandController.Print`.

</td>

</tr>

<tr>

<a id="BScriptRunner.BScriptRunner.UnFormateScopes"></a>

<td>

<code>UnFormateScopes</code>

</td>

<td>

```javascript
UnFormateScopes(
    script
)
```

</td>

<td>

Recursively replaces every `$(path)` placeholder of type `scope` found via `scriptPathFinder` back into its literal `{scopeScript}` form, returning the fully expanded script text.

</td>

</tr>

<tr>

<a id="BScriptRunner.BScriptRunner.Create"></a>

<td>

<code>Create</code>

</td>

<td>

```javascript
Create(
    run,
    _paths
)
```

</td>

<td>

Validates `run` via `Utils.BScriptValidate`, storing the normalized `mainScript` and `paths`, then builds the `executer` async function described in <a href="#BScriptRunner.BScriptRunner.executer">executer</a>.

</td>

</tr>

<tr>

<a id="BScriptRunner.BScriptRunner.AssigmentProcessing"></a>

<td>

<code>#AssigmentProcessing</code>

</td>

<td>

```javascript
async #AssigmentProcessing(
    mainScope
)
```

</td>

<td>

Private. Handles `$(name)=value` assignment scopes: evaluates the name and value sub-scopes (quoted text, nested script, or function declaration), resolves dotted ref paths via `Helpers.createRef`/`Helpers.GetVal`, or writes a plain value into the current scope via `setValueToScope`.

</td>

</tr>

<tr>

<a id="BScriptRunner.BScriptRunner.BaseProcessing"></a>

<td>

<code>#BaseProcessing</code>

</td>

<td>

```javascript
async #BaseProcessing(
    mainScope
)
```

</td>

<td>

Private. Handles generic (non-assignment, non-conditional) scopes: function declarations, nested object/async scopes (spawning a child runner via `Utils.newScriptRunner`), quoted/plain text, and numeric literals, producing the appropriate `Type` value.

</td>

</tr>

<tr>

<a id="BScriptRunner.BScriptRunner.CommandProcessing"></a>

<td>

<code>#CommandProcessing</code>

</td>

<td>

```javascript
async #CommandProcessing(
    mainScope
)
```

</td>

<td>

Private. Splits the current frame into a command name and arguments, resolves each argument (quoted text, nested scope, or raw value), then either executes a registered command via `commandExecute`, resolves a `$`-prefixed variable/ref lookup, or throws if the command name cannot be resolved.

</td>

</tr>

<tr>

<a id="BScriptRunner.BScriptRunner.ConditionalProcessing"></a>

<td>

<code>#ConditionalProcessing</code>

</td>

<td>

```javascript
async #ConditionalProcessing(
    mainScope
)
```

</td>

<td>

Private. Evaluates `IF` / `ELSE IF` / `ELSE` chains by spawning a child runner for each condition/branch scope and executing whichever branch's condition evaluates to a truthy boolean `Type`.

</td>

</tr>

<tr>

<a id="BScriptRunner.BScriptRunner.ConditionalOperatorProcessing"></a>

<td>

<code>#ConditionalOperatorProcessing</code>

</td>

<td>

```javascript
async #ConditionalOperatorProcessing(
    mainScope
)
```

</td>

<td>

Private. Evaluates chained logical/comparison operators (`AND`, `OR`, `<`, `>`, `=`) across successive scopes, folding the result into a single boolean `Type` via `Helpers.Boolean`.

</td>

</tr>

</table>

---

## Nested Classes

None

---

<a id="index.exports"></a>

## index.exports

<!-- Internal module: package entry point, not part of the documented declaration namespace itself, but its exported members form the public surface documented in REFERENCE.md -->

### Opportunities

- Re-exports the package's public surface: the `Runner` class, the `Type` class, and the `Helpers` utility object

### Declaration

```javascript
const ObjectName = module.exports
```

The default export of `./index.js`. A plain object aggregating the library's public entry points.

---

## Properties

<table>

<tr>
<th>Property</th>
<th>Declaration</th>
<th>Description</th>
</tr>

<tr>

<a id="index.exports.Runner"></a>

<td>

<code>Runner</code>

</td>

<td>

```javascript
const { Runner } = require('bscript')
```

</td>

<td>

Alias for the `BScriptRunner` class exported from `./BScriptRunner.js`.

</td>

</tr>

<tr>

<a id="index.exports.Type"></a>

<td>

<code>Type</code>

</td>

<td>

```javascript
const { Type } = require('bscript')
```

</td>

<td>

Alias for the `Type` class exported from `./SRC/types/Type.js`.

</td>

</tr>

<tr>

<a id="index.exports.Helpers"></a>

<td>

<code>Helpers</code>

</td>

<td>

```javascript
const { Helpers } = require('bscript')
```

</td>

<td>

Alias for the `Helpers` utility object exported from `./SRC/Helpers.js`.

</td>

</tr>

</table>

---

## Constants

None

## Methods

None

## Nested Classes

None

---

<a id="Helpers.exports"></a>

## Helpers.exports

[REFERENCE.md](./REFERENCE.md#Helpers)

### Opportunities

- Factory functions for every `Type`-wrapped value (`Text`, `Number`, `Boolean`, `Array`, `Object`, `Assignment`, `Function`)
- Bridges to command-based behaviors: `createRef`, `AssigmentsToObject`, `GetVal` (all implemented by dispatching to the `ref`, `object`, and `$val` commands respectively)
- Function-value construction (`createFunction`) used to materialize BScript `FUNC=>`/`ASYNC-FUNC=>` declarations as callable JS functions
- Processing-stage result helpers (`ProcessingContinue`, `ProcessingError`) shared by every `#...Processing` stage in `BScriptRunner`

### Declaration

```javascript
const ObjectName = { }
```

The default export of `./SRC/Helpers.js`. A stateless collection of constructor/utility functions used throughout `BScriptRunner` and `Scope` to build `Type` instances and processing results.

---

## Constants

None

## Properties

None

## Methods

<table>

<tr>
<th>Method</th>
<th>Declaration</th>
<th>Description</th>
</tr>

<tr>

<a id="Helpers.exports.createFunction"></a>

<td>

<code>createFunction</code>

</td>

<td>

```javascript
createFunction(
    name,
    context,
    scope,
    runner
)
```

</td>

<td>

Returns a named JS async function which, when called with `args`, spins up a new script runner over `scope.content.scopeScript` (via `Utils.newScriptRunner`) and returns its result. Used to materialize BScript function declarations.

</td>

</tr>

<tr>

<a id="Helpers.exports.createRef"></a>

<td>

<code>createRef</code>

</td>

<td>

```javascript
createRef(
    props,
    object,
    commandExecute,
    options
)
```

</td>

<td>

Invokes the `ref` command with `object` and `props` (each wrapped in `Type`) to obtain a settable/gettable reference handle.

</td>

</tr>

<tr>

<a id="Helpers.exports.AssigmentsToObject"></a>

<td>

<code>AssigmentsToObject</code>

</td>

<td>

```javascript
AssigmentsToObject(
    type,
    commandExecute,
    options
)
```

</td>

<td>

Invokes the `object` command to fold an array of `assignment`-typed results into a single `ObjectType` value.

</td>

</tr>

<tr>

<a id="Helpers.exports.GetVal"></a>

<td>

<code>GetVal</code>

</td>

<td>

```javascript
GetVal(
    valName,
    commandExecute,
    options
)
```

</td>

<td>

Invokes the `$val` command to resolve a named value from the current scope chain.

</td>

</tr>

<tr>

<a id="Helpers.exports.Object"></a>

<td>

<code>Object</code>

</td>

<td>

```javascript
Object(
    val
)
```

</td>

<td>

Wraps `val` in a `Type` of `Type.ObjectType`.

</td>

</tr>

<tr>

<a id="Helpers.exports.Text"></a>

<td>

<code>Text</code>

</td>

<td>

```javascript
Text(
    val
)
```

</td>

<td>

Wraps `val` in a `Type` of `Type.TextType`.

</td>

</tr>

<tr>

<a id="Helpers.exports.Array"></a>

<td>

<code>Array</code>

</td>

<td>

```javascript
Array(
    val
)
```

</td>

<td>

Wraps `val` in a `Type` of `Type.ArrayType`.

</td>

</tr>

<tr>

<a id="Helpers.exports.Boolean"></a>

<td>

<code>Boolean</code>

</td>

<td>

```javascript
Boolean(
    val
)
```

</td>

<td>

Wraps `Number(val)` in a `Type` of `Type.BooleanType`.

</td>

</tr>

<tr>

<a id="Helpers.exports.Number"></a>

<td>

<code>Number</code>

</td>

<td>

```javascript
Number(
    val
)
```

</td>

<td>

Wraps `val` in a `Type` of `Type.NumberType`.

</td>

</tr>

<tr>

<a id="Helpers.exports.Assignment"></a>

<td>

<code>Assignment</code>

</td>

<td>

```javascript
Assignment(
    name,
    val
)
```

</td>

<td>

Wraps `{ name, val }` in a `Type` of `Type.Assignment`, representing the outcome of a scope write.

</td>

</tr>

<tr>

<a id="Helpers.exports.Function"></a>

<td>

<code>Function</code>

</td>

<td>

```javascript
Function(
    name,
    val,
    async
)
```

</td>

<td>

Wraps `{ name, isAsync: async, val }` in a `Type` of `Type.FuncionType`.

</td>

</tr>

<tr>

<a id="Helpers.exports.ProcessingContinue"></a>

<td>

<code>ProcessingContinue</code>

</td>

<td>

```javascript
ProcessingContinue(
    results
)
```

</td>

<td>

Returns `{ processingExitCode: BScriptRunner.ProcessingExitCode.Continue, results }`, the standard "keep going" return shape used by every `#...Processing` stage.

</td>

</tr>

<tr>

<a id="Helpers.exports.ProcessingError"></a>

<td>

<code>ProcessingError</code>

</td>

<td>

```javascript
ProcessingError()
```

</td>

<td>

Returns `{ processingExitCode: BScriptRunner.ProcessingExitCode.Error }`.

</td>

</tr>

</table>

---

## Nested Classes

None

---

<a id="Scope.Scope"></a>

## Scope.Scope

<!-- Internal-only: not exported via index.js -->

### Opportunities

- Parses a "frame" of script text (already pre-processed by `Utils.BScriptValidate`'s quote/scope combination passes) into a navigable chain of sub-scope placeholders
- Inspects surrounding text (`beforePath`/`afterPath`) to classify the current placeholder via bitmask `ScopeFlags` (assignment, function, conditional, operator, text, number, argument, etc.)
- Provides sequential traversal (`ReadNext`) over sibling placeholders within a frame, plus path-based lookup of arbitrary descendant scopes

### Declaration

```javascript
class Scope
```

The default export of `./SRC/Scope.js`. Internal helper used exclusively by `BScriptRunner` to interpret `$(type:path:enclosure:index)` placeholders produced during script validation.

---

## Constants

<table>

<tr>
<th>Constant</th>
<th>Declaration</th>
<th>Description</th>
</tr>

<tr>

<a id="Scope.Scope.ScopeFlags"></a>

<td>

<code>ScopeFlags</code>

</td>

<td>

```javascript
static ScopeFlags = {
    None: 0,
    Async: 1 << 0,
    Function: 1 << 1,
    Object: 1 << 2,
    Argument: 1 << 3,
    Text: 1 << 4,
    Num: 1 << 5,
    If: 1 << 6,
    Else: 1 << 7,
    ElseIf: 1 << 8,
    AssignmentName: 1 << 9,
    AssignmentValue: 1 << 10,
    Quoted: 1 << 11,
    AND: 1 << 12,
    LessThan: 1 << 13,
    MoreThan: 1 << 14,
    OR: 1 << 15,
    Equal: 1 << 16,
}
```

</td>

<td>

Bitmask flags describing the syntactic role of the current scope placeholder, as detected by `GetActiveDeclarations()`.

</td>

</tr>

<tr>

<a id="Scope.Scope.Quote"></a>

<td>

<code>Quote</code>

</td>

<td>

```javascript
static Quote = "quote"
```

</td>

<td>

Scope-type discriminator for placeholders originating from backtick-quoted text.

</td>

</tr>

<tr>

<a id="Scope.Scope.Default"></a>

<td>

<code>Default</code>

</td>

<td>

```javascript
static Default = "scope"
```

</td>

<td>

Scope-type discriminator for placeholders originating from `{...}` brace scopes.

</td>

</tr>

</table>

---

## Properties

<table>

<tr>
<th>Property</th>
<th>Declaration</th>
<th>Description</th>
</tr>

<tr>

<a id="Scope.Scope.content"></a>

<td>

<code>content</code>

</td>

<td>

```javascript
scope.content
```

</td>

<td>

Getter returning the raw frame info object (`scopeScript`/`quoteText`, etc.) registered for `this.path` in the shared `pathsContentRefs` map.

</td>

</tr>

<tr>

<a id="Scope.Scope.exists"></a>

<td>

<code>exists</code>

</td>

<td>

```javascript
scope.exists
```

</td>

<td>

`true` once a placeholder match has been found for the supplied interpretation text; `false` if the constructor input contained no `$(...)` placeholder.

</td>

</tr>

<tr>

<a id="Scope.Scope.scopeType"></a>

<td>

<code>scopeType</code>

</td>

<td>

```javascript
scope.scopeType
```

</td>

<td>

Either `Scope.Quote` or `Scope.Default`, identifying the placeholder's origin.

</td>

</tr>

<tr>

<a id="Scope.Scope.meta"></a>

<td>

<code>meta</code>

</td>

<td>

```javascript
scope.meta
```

</td>

<td>

Reserved metadata object, currently unused/empty.

</td>

</tr>

<tr>

<a id="Scope.Scope.frame"></a>

<td>

<code>frame</code>

</td>

<td>

```javascript
scope.frame
```

</td>

<td>

The raw text passed into the constructor that this `Scope` instance was parsed from.

</td>

</tr>

<tr>

<a id="Scope.Scope.beforePath"></a>

<td>

<code>beforePath</code>

</td>

<td>

```javascript
scope.beforePath
```

</td>

<td>

Text in `frame` preceding the current placeholder match; inspected by `GetActiveDeclarations()` to detect leading keywords (`FUNC=>`, `IF(`, `$`, etc.).

</td>

</tr>

<tr>

<a id="Scope.Scope.afterPath"></a>

<td>

<code>afterPath</code>

</td>

<td>

```javascript
scope.afterPath
```

</td>

<td>

Text in `frame` following the current placeholder match; inspected by `GetActiveDeclarations()` to detect trailing operators (`AND`, `OR`, `<`, `>`, `=`, `)=`).

</td>

</tr>

<tr>

<a id="Scope.Scope.path"></a>

<td>

<code>path</code>

</td>

<td>

```javascript
scope.path
```

</td>

<td>

The full placeholder path string, e.g. `scope:path:0:1`, used as the lookup key into `pathsContentRefs`.

</td>

</tr>

<tr>

<a id="Scope.Scope.scopeIteractionIndex"></a>

<td>

<code>scopeIteractionIndex</code>

</td>

<td>

```javascript
scope.scopeIteractionIndex
```

</td>

<td>

The "enclosure" component parsed from the placeholder path.

</td>

</tr>

<tr>

<a id="Scope.Scope.childsCount"></a>

<td>

<code>childsCount</code>

</td>

<td>

```javascript
scope.childsCount
```

</td>

<td>

The "index" component parsed from the placeholder path.

</td>

</tr>

</table>

---

## Methods

<table>

<tr>
<th>Method</th>
<th>Declaration</th>
<th>Description</th>
</tr>

<tr>

<a id="Scope.Scope.createPath"></a>

<td>

<code>createPath</code>

</td>

<td>

```javascript
static createPath(
    type,
    enclosure,
    index
)
```

</td>

<td>

Builds a canonical path string in the form `${type}:path:${enclosure}:${index}`.

</td>

</tr>

<tr>

<a id="Scope.Scope.getScopeIndex"></a>

<td>

<code>getScopeIndex</code>

</td>

<td>

```javascript
getScopeIndex(
    i
)
```

</td>

<td>

Returns the `i`-th remaining sibling scope from the internal queue.

</td>

</tr>

<tr>

<a id="Scope.Scope.getCount"></a>

<td>

<code>getCount</code>

</td>

<td>

```javascript
getCount()
```

</td>

<td>

Returns the number of remaining sibling scopes in the internal queue.

</td>

</tr>

<tr>

<a id="Scope.Scope.getLast"></a>

<td>

<code>getLast</code>

</td>

<td>

```javascript
getLast()
```

</td>

<td>

Returns the last remaining sibling scope in the internal queue.

</td>

</tr>

<tr>

<a id="Scope.Scope.getChildScopeByPath"></a>

<td>

<code>getChildScopeByPath</code>

</td>

<td>

```javascript
getChildScopeByPath(
    childPath
)
```

</td>

<td>

Parses `childPath` and constructs a new `Scope` over the corresponding registered `scopeScript`.

</td>

</tr>

<tr>

<a id="Scope.Scope.GetActiveDeclarations"></a>

<td>

<code>GetActiveDeclarations</code>

</td>

<td>

```javascript
GetActiveDeclarations()
```

</td>

<td>

Inspects `beforePath`/`afterPath` (and `scopeType`) to compute the bitmask of active `ScopeFlags` for the current placeholder (assignment name/value, function, async, object, argument, text, number, if/else/else-if, logical/comparison operators, quoted).

</td>

</tr>

<tr>

<a id="Scope.Scope.copy"></a>

<td>

<code>copy</code>

</td>

<td>

```javascript
copy()
```

</td>

<td>

Returns a new `Scope` reconstructed from `this.frame` and the shared `pathsContentRefs`.

</td>

</tr>

<tr>

<a id="Scope.Scope.singleCopy"></a>

<td>

<code>singleCopy</code>

</td>

<td>

```javascript
singleCopy()
```

</td>

<td>

Returns a new `Scope` constructed from just `$(this.path)`, preserving the current `beforePath`/`afterPath` context — used to isolate a single placeholder for independent evaluation.

</td>

</tr>

<tr>

<a id="Scope.Scope.ReadNext"></a>

<td>

<code>ReadNext</code>

</td>

<td>

```javascript
ReadNext()
```

</td>

<td>

Dequeues the next sibling scope (if any), merges its fields onto `this`, and returns `this`; returns `null` when no siblings remain.

</td>

</tr>

</table>

---

## Nested Classes

None

---

<a id="Utils.exports"></a>

## Utils.exports

<!-- Internal-only: not exported via index.js -->

### Opportunities

- Spawns nested `BScriptRunner` instances bound to a sub-scope (`newScriptRunner`)
- Performs string interpolation of backtick-quoted text via `eval` (`baseInterpolation`)
- Extracts quoted substrings from raw text (`findQuotedText`)
- Splits a raw command line into a command name and argument list, substituting quoted spans (`commandSplitter`)
- Pre-processes raw BScript source into a flat, placeholder-substituted form and a `paths` lookup table, recursively unwrapping nested backtick-quotes and brace-scopes (`BScriptValidate`)

### Declaration

```javascript
const ObjectName = { }
```

The default export of `./SRC/Utils.js`. Internal parsing/execution utilities consumed by `BScriptRunner`.

---

## Constants

None

## Properties

None

## Methods

<table>

<tr>
<th>Method</th>
<th>Declaration</th>
<th>Description</th>
</tr>

<tr>

<a id="Utils.exports.newScriptRunner"></a>

<td>

<code>newScriptRunner</code>

</td>

<td>

```javascript
newScriptRunner(
    script,
    scopeid
)
```

</td>

<td>

Bound to a `BScriptRunner` instance (`this`); constructs a new `BScriptRunner` sharing `this.scopes`/`this.cmdEnviroment`/`this.paths`/`this._executeHistory`, calls `Create(script, this.paths)` on it, and returns its `executer` function.

</td>

</tr>

<tr>

<a id="Utils.exports.baseInterpolation"></a>

<td>

<code>baseInterpolation</code>

</td>

<td>

```javascript
baseInterpolation(
    text
)
```

</td>

<td>

Evaluates `text` as a JS template literal (via `eval`) to perform string interpolation.

</td>

</tr>

<tr>

<a id="Utils.exports.findQuotedText"></a>

<td>

<code>findQuotedText</code>

</td>

<td>

```javascript
findQuotedText(
    text
)
```

</td>

<td>

Scans `text` for single/double-quoted spans (respecting backslash-escaping) and returns an array of `{ text, indexStart, indexEnd }` matches.

</td>

</tr>

<tr>

<a id="Utils.exports.commandSplitter"></a>

<td>

<code>commandSplitter</code>

</td>

<td>

```javascript
commandSplitter(
    text
)
```

</td>

<td>

Replaces quoted spans in `text` with a `{quoted}` placeholder, splits the remainder on whitespace, re-interpolates each quoted span, and returns `{ command, args }`.

</td>

</tr>

<tr>

<a id="Utils.exports.BScriptValidate"></a>

<td>

<code>BScriptValidate</code>

</td>

<td>

```javascript
BScriptValidate(
    regexExpression,
    rawScript
)
```

</td>

<td>

Recursively extracts backtick-quoted spans and brace `{...}` scopes (innermost first) from `rawScript`, replacing each with a `$(quote:path:...)`/`$(scope:path:...)` placeholder, applies `regexExpression.preRunClean`, and returns `{ mainScript, paths }` — the flattened script and a lookup table from placeholder path to original content, consumed by `BScriptRunner.Create`.

</td>

</tr>

</table>

---

## Nested Classes

None

---

<a id="Type.Type"></a>

## Type.Type

[REFERENCE.md](./REFERENCE.md#Type)

### Opportunities

- Universal value wrapper used throughout the runtime to tag a JS value with a BScript-level type (`text`, `number`, `bool`, `array`, `object`, `func`, `promise`, `ref`, `assignment`, raw)
- Provides a colorized, human-readable `GetDisplayType` representation for debugging/REPL output

### Declaration

```javascript
class Type
```

The default export of `./SRC/types/Type.js`. Every value produced or consumed by `BScriptRunner`/`Helpers` is an instance of `Type`.

---

## Constants

<table>

<tr>
<th>Constant</th>
<th>Declaration</th>
<th>Description</th>
</tr>

<tr>

<a id="Type.Type.FuncionType"></a>

<td>

<code>FuncionType</code>

</td>

<td>

```javascript
static FuncionType = "func"
```

</td>

<td>

Type tag for function values.

</td>

</tr>

<tr>

<a id="Type.Type.PromiseType"></a>

<td>

<code>PromiseType</code>

</td>

<td>

```javascript
static PromiseType = "promise"
```

</td>

<td>

Type tag for deferred/async values (used for `ASYNC-FUNC=>` results).

</td>

</tr>

<tr>

<a id="Type.Type.TextType"></a>

<td>

<code>TextType</code>

</td>

<td>

```javascript
static TextType = "text"
```

</td>

<td>

Type tag for string values.

</td>

</tr>

<tr>

<a id="Type.Type.NumberType"></a>

<td>

<code>NumberType</code>

</td>

<td>

```javascript
static NumberType = "number"
```

</td>

<td>

Type tag for numeric values.

</td>

</tr>

<tr>

<a id="Type.Type.BooleanType"></a>

<td>

<code>BooleanType</code>

</td>

<td>

```javascript
static BooleanType = "bool"
```

</td>

<td>

Type tag for boolean values (stored internally as `0`/`1`).

</td>

</tr>

<tr>

<a id="Type.Type.ArrayType"></a>

<td>

<code>ArrayType</code>

</td>

<td>

```javascript
static ArrayType = "array"
```

</td>

<td>

Type tag for array values, where `val` is an array of `Type` instances.

</td>

</tr>

<tr>

<a id="Type.Type.JSType"></a>

<td>

<code>JSType</code>

</td>

<td>

```javascript
static JSType = "jstype"
```

</td>

<td>

Type tag for opaque/raw JavaScript values passed through unwrapped by `GetDisplayType`.

</td>

</tr>

<tr>

<a id="Type.Type.ObjectType"></a>

<td>

<code>ObjectType</code>

</td>

<td>

```javascript
static ObjectType = "object"
```

</td>

<td>

Type tag for object values, where `val` is a map of keys to `Type` instances.

</td>

</tr>

<tr>

<a id="Type.Type.RefType"></a>

<td>

<code>RefType</code>

</td>

<td>

```javascript
static RefType = "ref"
```

</td>

<td>

Type tag for reference handles produced by the `ref` command (expected to expose a `get()` accessor).

</td>

</tr>

<tr>

<a id="Type.Type.RawType"></a>

<td>

<code>RawType</code>

</td>

<td>

```javascript
static RawType = "RAW"
```

</td>

<td>

Fallback type tag applied by the constructor when no `type` is supplied.

</td>

</tr>

<tr>

<a id="Type.Type.Assignment"></a>

<td>

<code>Assignment</code>

</td>

<td>

```javascript
static Assignment = "assignment"
```

</td>

<td>

Type tag for the result of a scope-variable write (`{ name, val }`).

</td>

</tr>

<tr>

<a id="Type.Type.NONE"></a>

<td>

<code>NONE</code>

</td>

<td>

```javascript
static NONE = new Type('NONE')
```

</td>

<td>

Singleton sentinel `Type` instance returned by `BScriptRunner.executer` when a frame produces no results.

</td>

</tr>

</table>

---

## Properties

None

## Methods

<table>

<tr>
<th>Method</th>
<th>Declaration</th>
<th>Description</th>
</tr>

<tr>

<a id="Type.Type.GetDisplayType"></a>

<td>

<code>GetDisplayType</code>

</td>

<td>

```javascript
GetDisplayType(
    indent
)
```

</td>

<td>

Recursively renders this `Type` value (and, for arrays/objects/refs, its nested `Type` values) as an ANSI-colorized, indented string suitable for terminal/REPL output.

</td>

</tr>

</table>

---

## Nested Classes

None
