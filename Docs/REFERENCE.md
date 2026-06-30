# API Reference

Here are described all **public** modules, classes, functions, constants, and other exported declarations available for developers.

---

## Guide

<details>
<summary>Runner</summary>

## Parent
[Runner](#Runner)

### Constants
None

### Properties
- [options](#Runner.options)
- [executer](#Runner.executer)

### Methods
- [Create](#Runner.Create)

### Nested Classes
None

</details>

<details>
<summary>Type</summary>

## Parent
[Type](#Type)

### Constants
- [FuncionType](#Type.FuncionType)
- [PromiseType](#Type.PromiseType)
- [TextType](#Type.TextType)
- [NumberType](#Type.NumberType)
- [BooleanType](#Type.BooleanType)
- [ArrayType](#Type.ArrayType)
- [JSType](#Type.JSType)
- [ObjectType](#Type.ObjectType)
- [RefType](#Type.RefType)
- [RawType](#Type.RawType)
- [Assignment](#Type.Assignment)
- [NONE](#Type.NONE)

### Properties
None

### Methods
- [GetDisplayType](#Type.GetDisplayType)

### Nested Classes
None

</details>

<details>
<summary>Helpers</summary>

## Parent
[Helpers](#Helpers)

### Constants
None

### Properties
None

### Methods
- [createFunction](#Helpers.createFunction)
- [createRef](#Helpers.createRef)
- [AssigmentsToObject](#Helpers.AssigmentsToObject)
- [GetVal](#Helpers.GetVal)
- [Object](#Helpers.Object)
- [Text](#Helpers.Text)
- [Array](#Helpers.Array)
- [Boolean](#Helpers.Boolean)
- [Number](#Helpers.Number)
- [Assignment](#Helpers.Assignment)
- [Function](#Helpers.Function)
- [ProcessingContinue](#Helpers.ProcessingContinue)
- [ProcessingError](#Helpers.ProcessingError)

### Nested Classes
None

</details>

---

## Modules

<a id="Runner"></a>
## Runner

### Opportunities

- Creates and executes BScript programs
- Supports variable assignments, conditionals, function declarations, command execution, and nested scopes
- Provides a clean public interface for embedding BScript execution in JavaScript applications

### Declaration

```javascript
const { Runner } = require('bscript')
```

The main entry point for executing BScript code. It parses and runs BScript source text within a controlled scope environment.

---

## Constants

None

---

## Properties

<table>
<thead>
<tr>
<td>
<h4>About Property</h4>
</td>
<td>
<h4>Example</h4>
</td>
</tr>
</thead>

<tbody>

<a id="Runner.options"></a>

<tr>
<td width="70%">

<h5>options</h5>

```javascript
runner.options
```

Runtime configuration for the runner instance (e.g., `{ silent: false }`).

</td>
<td width="30%">
No example
</td>
</tr>

<a id="Runner.executer"></a>

<tr>
<td width="70%">

<h5>executer</h5>

```javascript
runner.executer
```

Async function that executes the compiled script and returns the final result as a `Type` instance.

</td>
<td width="30%">
No example
</td>
</tr>

</tbody>
</table>

---

## Methods

<table>
<thead>
<tr>
<td>
<h4>About Method</h4>
</td>
<td>
<h4>Example</h4>
</td>
</tr>
</thead>

<tbody>

<a id="Runner.Create"></a>

<tr>
<td width="70%">

<h5>Create</h5>

```javascript
Create(
    run,
    _paths
)
```

Compiles the provided BScript source (`run`) into an executable `executer` function. `_paths` is an internal lookup table produced during validation.

</td>
<td width="30%">
No example
</td>
</tr>

</tbody>
</table>

---

<a id="Type"></a>
## Type

### Opportunities

- Universal value wrapper that tags JavaScript values with BScript semantic types
- Enables consistent type handling, display, and introspection across the runtime
- Supports complex nested structures (arrays, objects, functions, references)

### Declaration

```javascript
const { Type } = require('bscript')
```

Central type system used for all values produced and consumed by BScript execution.

---

## Constants

<table>
<thead>
<tr>
<td>
<h4>About Constant</h4>
</td>
<td>
<h4>Example</h4>
</td>
</tr>
</thead>

<tbody>

<a id="Type.FuncionType"></a>

<tr>
<td width="70%">

<h5>FuncionType</h5>

```javascript
Type.FuncionType = "func"
```

Type tag for synchronous and asynchronous function values.

</td>
<td width="30%">
<img src="https://github.com/BEISER901/bscript-runner/Docs/Images/FuncionType.png" width="100%" alt="Example"/>
</td>
</tr>

<a id="Type.PromiseType"></a>

<tr>
<td width="70%">

<h5>PromiseType</h5>

```javascript
Type.PromiseType = "promise"
```

Type tag for deferred/async results.

</td>
<td width="30%">
<img src="https://github.com/BEISER901/bscript-runner/Docs/Images/PromiseType.png" width="100%" alt="Example"/>
</td>
</tr>

<a id="Type.TextType"></a>

<tr>
<td width="70%">

<h5>TextType</h5>

```javascript
Type.TextType = "text"
```

Type tag for string values.

</td>
<td width="30%">
<img src="https://github.com/BEISER901/bscript-runner/Docs/Images/TextType.png" width="100%" alt="Example"/>
</td>
</tr>

<a id="Type.NumberType"></a>

<tr>
<td width="70%">

<h5>NumberType</h5>

```javascript
Type.NumberType = "number"
```

Type tag for numeric values.

</td>
<td width="30%">
<img src="https://github.com/BEISER901/bscript-runner/Docs/Images/NumberType.png" width="100%" alt="Example"/>
</td>
</tr>

<a id="Type.BooleanType"></a>

<tr>
<td width="70%">

<h5>BooleanType</h5>

```javascript
Type.BooleanType = "bool"
```

Type tag for boolean values (internally stored as 0/1).

</td>
<td width="30%">
<img src="https://github.com/BEISER901/bscript-runner/Docs/Images/BooleanType.png" width="100%" alt="Example"/>
</td>
</tr>

<a id="Type.ArrayType"></a>

<tr>
<td width="70%">

<h5>ArrayType</h5>

```javascript
Type.ArrayType = "array"
```

Type tag for array values containing other `Type` instances.

</td>
<td width="30%">
No example
</td>
</tr>

<a id="Type.JSType"></a>

<tr>
<td width="70%">

<h5>JSType</h5>

```javascript
Type.JSType = "jstype"
```

Type tag for raw JavaScript values passed through without special handling.

</td>
<td width="30%">
No example
</td>
</tr>

<a id="Type.ObjectType"></a>

<tr>
<td width="70%">

<h5>ObjectType</h5>

```javascript
Type.ObjectType = "object"
```

Type tag for object values (maps of keys to `Type` instances).

</td>
<td width="30%">
<img src="https://github.com/BEISER901/bscript-runner/Docs/Images/ObjectType.png" width="100%" alt="Example"/>
</td>
</tr>

<a id="Type.RefType"></a>

<tr>
<td width="70%">

<h5>RefType</h5>

```javascript
Type.RefType = "ref"
```

Type tag for reference handles that support get/set operations.

</td>
<td width="30%">
<img src="https://github.com/BEISER901/bscript-runner/Docs/Images/RefType.png" width="100%" alt="Example"/>
</td>
</tr>

<a id="Type.RawType"></a>

<tr>
<td width="70%">

<h5>RawType</h5>

```javascript
Type.RawType = "RAW"
```

Fallback type tag for values without an explicit type.

</td>
<td width="30%">
<img src="https://github.com/BEISER901/bscript-runner/Docs/Images/RawType.png" width="100%" alt="Example"/>
</td>
</tr>

<a id="Type.Assignment"></a>

<tr>
<td width="70%">

<h5>Assignment</h5>

```javascript
Type.Assignment = "assignment"
```

Type tag for assignment operation results.

</td>
<td width="30%">
No example
</td>
</tr>

<a id="Type.NONE"></a>

<tr>
<td width="70%">

<h5>NONE</h5>

```javascript
Type.NONE
```

Singleton sentinel value returned when a script frame produces no result.

</td>
<td width="30%">
No example
</td>
</tr>

</tbody>
</table>

---

## Methods

<table>
<thead>
<tr>
<td>
<h4>About Method</h4>
</td>
<td>
<h4>Example</h4>
</td>
</tr>
</thead>

<tbody>

<a id="Type.GetDisplayType"></a>

<tr>
<td width="70%">

<h5>GetDisplayType</h5>

```javascript
GetDisplayType(
    indent
)
```

Returns a colorized, human-readable string representation of the `Type` value and its nested contents (useful for debugging and REPL output).

</td>
<td width="30%">
No example
</td>
</tr>

</tbody>
</table>

---

<a id="Helpers"></a>
## Helpers

### Opportunities

- Factory functions for creating typed values
- Utilities for working with references, assignments, and function materialization
- Shared helpers used by the runtime for processing results

### Declaration

```javascript
const { Helpers } = require('bscript')
```

Collection of utility functions for constructing and manipulating BScript `Type` values.

---

## Methods

<table>
<thead>
<tr>
<td>
<h4>About Method</h4>
</td>
<td>
<h4>Example</h4>
</td>
</tr>
</thead>

<tbody>

<a id="Helpers.createFunction"></a>

<tr>
<td width="70%">

<h5>createFunction</h5>

```javascript
createFunction(
    name,
    context,
    scope,
    runner
)
```

Creates a callable JavaScript function from a BScript function declaration.

</td>
<td width="30%">
No example
</td>
</tr>

<a id="Helpers.createRef"></a>

<tr>
<td width="70%">

<h5>createRef</h5>

```javascript
createRef(
    props,
    object,
    commandExecute,
    options
)
```

Creates a reference handle to a value or property.

</td>
<td width="30%">
No example
</td>
</tr>

<a id="Helpers.AssigmentsToObject"></a>

<tr>
<td width="70%">

<h5>AssigmentsToObject</h5>

```javascript
AssigmentsToObject(
    type,
    commandExecute,
    options
)
```

Converts an array of assignment results into a single object value.

</td>
<td width="30%">
No example
</td>
</tr>

<a id="Helpers.GetVal"></a>

<tr>
<td width="70%">

<h5>GetVal</h5>

```javascript
GetVal(
    valName,
    commandExecute,
    options
)
```

Resolves a named value from the current scope.

</td>
<td width="30%">
No example
</td>
</tr>

<a id="Helpers.Object"></a>

<tr>
<td width="70%">

<h5>Object</h5>

```javascript
Object(
    val
)
```

Wraps a value in an `ObjectType`.

</td>
<td width="30%">
No example
</td>
</tr>

<a id="Helpers.Text"></a>

<tr>
<td width="70%">

<h5>Text</h5>

```javascript
Text(
    val
)
```

Wraps a value in a `TextType`.

</td>
<td width="30%">
No example
</td>
</tr>

<a id="Helpers.Array"></a>

<tr>
<td width="70%">

<h5>Array</h5>

```javascript
Array(
    val
)
```

Wraps a value in an `ArrayType`.

</td>
<td width="30%">
No example
</td>
</tr>

<a id="Helpers.Boolean"></a>

<tr>
<td width="70%">

<h5>Boolean</h5>

```javascript
Boolean(
    val
)
```

Wraps a value in a `BooleanType`.

</td>
<td width="30%">
No example
</td>
</tr>

<a id="Helpers.Number"></a>

<tr>
<td width="70%">

<h5>Number</h5>

```javascript
Number(
    val
)
```

Wraps a value in a `NumberType`.

</td>
<td width="30%">
No example
</td>
</tr>

<a id="Helpers.Assignment"></a>

<tr>
<td width="70%">

<h5>Assignment</h5>

```javascript
Assignment(
    name,
    val
)
```

Creates an assignment result wrapper.

</td>
<td width="30%">
No example
</td>
</tr>

<a id="Helpers.Function"></a>

<tr>
<td width="70%">

<h5>Function</h5>

```javascript
Function(
    name,
    val,
    async
)
```

Creates a function value wrapper.

</td>
<td width="30%">
No example
</td>
</tr>

<a id="Helpers.ProcessingContinue"></a>

<tr>
<td width="70%">

<h5>ProcessingContinue ( Internal )</h5>

```javascript
ProcessingContinue(
    results
)
```

Returns a continue signal for internal processing stages.

</td>
<td width="30%">
No example
</td>
</tr>

<a id="Helpers.ProcessingError"></a>

<tr>
<td width="70%">

<h5>ProcessingError ( Internal )</h5>

```javascript
ProcessingError()
```

Returns an error signal for internal processing stages.

</td>
<td width="30%">
No example
</td>
</tr>

</table>
</tbody>