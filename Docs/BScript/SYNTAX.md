# Syntax Reference

A complete reference for the BScript language syntax.

---

# Contents

1. [Language Elements](#LanguageElements)
	- [Scope Delimiters](#ScopeDelimiters)
	- [Text Delimiter](#TextDelimiter)
	- [Assignment](#Assignment)
	- [Conditional Keywords](#ConditionalKeywords)
	- [Function Keywords](#FunctionKeywords)
	- [Logical Operators](#LogicalOperators)
	- [Comparison Operators](#ComparisonOperators)
2. [Variables](#Variables)
3. [Literals](#Literals)
	- [Boolean](#Literals.Bollean)
	- [Number](#Literals.Number)
	- [Ref](#Literals.Ref)
	- [Array](#Literals.Array)
	- [Object](#Literals.Object)
4. [References](#References)
	- [Variable Reference](#VariableReference)
	- [Nested Reference](#NestedReference)
	- [Wildcard Reference](#WildcardReference)
	- [Reference Interpolation](#ReferenceInterpolation)
5. [Commands](#Commands)
6. [Functions](#Functions)
7. [Objects](#Objects)
8. [Arrays](#Arrays)
9. [Conditions](#Conditions)
	- [IF](#Conditions.IF)
	- [ELSE](#Conditions.ELSE)
	- [IF ELSE](#Conditions.IFELSE)
	- [Nested Conditions](#Conditions.NestedConditions)
10. [Interpolation](#Interpolation)
11. [Scope](#Scope)
12. [Examples](#Examples)
	- [Hello World](#Examples.HelloWorld)
	- [Variables](#Examples.Variables)
	- [Function](#Examples.Function)
	- [Object](#Examples.Object)
	- [Condition](#Examples.Condition)
	- [Destructuring Assignment](#Examples.DestructuringAssignment)

---

<a id="LanguageElements"></a>
# 1. Language Elements

<a id="ScopeDelimiters"></a>
## Scope Delimiters

`{`

Begins a new scope.

`}`

Ends the current scope.

---

<a id="TextDelimiter"></a>
## Text Delimiter

`` ` ``

Declares a text literal.

```bscript
`Hello World`
```

---

<a id="Assignment"></a>
## Assignment

```bscript
$(`Variable`)=
```

Assigns a value to a variable.

---

<a id="ConditionalKeywords"></a>
## Conditional Keywords

```text
IF
ELSE
```

---

<a id="FunctionKeywords"></a>
## Function Keywords

```text
FUNC
ASYNC-FUNC
```

---

<a id="LogicalOperators"></a>
## Logical Operators

```text
AND
OR
```

---

<a id="ComparisonOperators"></a>
## Comparison Operators

```text
=
<
>
```

<a id="SyntaxReference"></a>
# Syntax Reference
A complete BScript syntax reference.

<a id="LexicalStructure"></a>
## Lexical Structure
`{` - Opening Scope curly bracket.

`}` - Closing Scope curly bracket.

`` `Hello` `` - Text declaration.

`AND` - The logical operator "And"

`OR` -The logical operator "Or"

`=` -The logical operator "Equal"

`>` -The logical operator "More then"

`<` -The logical operator "Less then"

`IF()` - Conditional expression IF.

`IF ELSE` - Conditional expression IF ELSE.

`ELSE` - Conditional expression ELSE.

`$(``)=` - The assignment expression.

<a id="Variables"></a>
## 2. Variables
Variables are defined by the expression ``$(`VariableName`)=Value`` 

Example:
A text variable in the quotes.
```bscript
$(`VariableName`)=`Hello World!`
```
Example2:
The variable set by the Scope result.
```bscript
$(`VariableName`)={ str `Hello World!` }
```
Example3
Setting a variable using a point path.
```bscript
$(`VariableName.El1.El2`)={ str `Hello World!` }
```

To get the value of a variable, use the following expression `$VariableName` OR `$VariableName.El1.El2` OR `$VariableName.El1.El2.*`

Example:
```
$(`VariableName`)=`Hello World!`
print ${$VariableName}
```

Example2:
```
$(`VariableName`)={
	$(`EL1`)={
		$(`EL2`)=`HelloWorld!`
	}
}
print ${$VariableName.EL1.El2} # Ref `Hello World`
```

Example3:
```
$(`VariableName`)={
	$(`EL1`)={
		$(`EL2`)=`HelloWorld!`
	}
}
print ${$VariableName.EL1.El2.*} # `Hello World`
```

<a id="DestructuringAssignment"></a>
### Destructuring Assignment
Example:
```
$({
	$(`VariableName`)={$EL1.EL2.*}
})={
	$(`EL1`)={
		$(`EL2`)=`HelloWorld!`
	}
}
print ${$VariableName} # `Hello World`
```
<a id="Literals"></a>
## 3. Literals

<a id="Literals.Bollean"></a>
### Bollean
<table width="100%">
<tr>	
<td>
Declaration

```bscript
bool 0
bool 1 
```

</td>
</tr>

<tr>	
<td>
	
Result:

```bscript-cli
[TRUE]
```
```bscript-cli
[FALSE]
```

</td>
</tr>
</table>

<a id="Literals.Number"></a>
### Number
<table width="100%">
<tr>	
<td>
Declaration

```bscript
num 123456789
```

</td>
</tr>

<tr>	
<td>
	
Result:

```bscript-cli
123456789
```

</td>
</tr>
</table>

<a id="Literals.Ref"></a>
### Ref
<table width="100%">
<tr>	
<td>
Declaration

```bscript
$valName.el1.el2
```

</td>
</tr>

<tr>	
<td>
	
Result:

```bscript-cli
REF->content
```

</td>
</tr>
</table>

<a id="Literals.Array"></a>
### Array
<table width="100%">
<tr>	
<td>
Declaration

```bscript
{
	`EL1`
	`EL2`
	`EL3`
}
```

</td>
</tr>

<tr>	
<td>
	
Result:

```bscript-cli
[ARRAY(3){
 [0] = EL1
 [1] = EL2
 [2] = EL3
}]
```

</td>
</tr>
</table>

<a id="Literals.Object"></a>
### Object
<table width="100%">
<tr>	
<td>
Declaration

```bscript
{
	$(`EL1`)=`AssigmentValue`
	$(`EL2`)=`AssigmentValue1`
	$(`EL3`)={ num 123423 }
}
```

</td>
</tr>

<tr>	
<td>
	
Result:

```bscript-cli
[OBJECT{
 EL1 = AssigmentValue
 EL2 = AssigmentValue1
 EL3 = 123423
}]
```

</td>
</tr>
</table>

<a id="References"></a>
## 4. References

References allow access to variables, objects, arrays, and nested members.

<a id="VariableReference"></a>
### Variable Reference

```bscript
$PlayerName
```

Returns the value of the variable.

---

<a id="NestedReference"></a>
### Nested Reference

```bscript
$Player.Inventory.Weapon
```

Returns a nested object property.

---

<a id="WildcardReference"></a>
### Wildcard Reference

```bscript
$Player.Inventory.*
```

Returns all members of the referenced scope.

---

<a id="ReferenceInterpolation"></a>
### Reference Interpolation

```bscript
print ${$PlayerName}
```

Evaluates the reference and inserts its value into the current expression

<a id="Commands"></a>
## 5. Commands

Commands are executable instructions provided by the runtime environment.

Every command receives arguments as scopes and returns a value.

Example:

```bscript
print `Hello World!`
```

Example:

```bscript
sleep { num 1000 }
```

Example:

```bscript
str `Hello`
```

See:

- [bscript-cli](./)

<a id="Functions"></a>
## 6. Functions

Functions are reusable executable scopes.

BScript supports two function types:

Function
<table width="100%">
<tr>	
<td>
Declaration

```bscript
FUNC=>{
	print `Hello World!`
}
```
```bscript
$(`NewFunction`)=FUNC=>{
	print `Hello World!`
}
```

</td>
</tr>

<tr>	
<td>
	
Result:
```bscript-cli
[FUNC]
```
```bscript-cli
[FUNC-NewFunction]
```

</td>
</tr>
</table>

Async Function
<table width="100%">
<tr>	
<td>
Declaration

```bscript
ASYNC-FUNC=>{
	print `Hello World!`
}
```
```bscript
$(`NewFunction`)=ASYNC-FUNC=>{
	print `Hello World!`
}
```

</td>
</tr>

<tr>	
<td>
	
Result:

```bscript
[ASYNC-FUNC]
```
```bscript
[ASYNC-FUNC-NewFunction]
```
</td>
</tr>
</table>

<a id="Objects"></a>
## 7. Objects

Objects are collections of named values.

Example:

```bscript
{
    $(`Name`)=`Steve`
    $(`Health`)={ num 100 }
}
```


Accessing members:

```bscript
$Player.Name

$Player.Health
```

Nested objects are supported.

```bscript
{
    $(`Player`)={
        $(`Inventory`)={
            $(`Weapon`)=`Sword`
        }
    }
}
```


---

<a id="Arrays"></a>
## 8. Arrays

Arrays are ordered collections.

Example:

```bscript
{
    `Apple`
    `Orange`
    `Banana`
}
```

Access by index:

```bscript
$Items.0
```

Nested arrays are supported.

```bscript
{
    {
        `One`
    }

    {
        `Two`
    }
}
```

---

<a id="Conditions"></a>
## 9. Conditions

Conditional expressions control execution flow.

<a id="Conditions.IF"></a>
### IF

```bscript
IF({ bool 1 }){

    print `TRUE`

}
```

---

<a id="Conditions.ELSE"></a>
### ELSE

```bscript
IF({ bool 0 }){

    print `TRUE`

}ELSE{

    print `FALSE`

}
```

<a id="Conditions.IFELSE"></a>
### IF ELSE

```bscript
IF({ bool 0 }){

    print `TRUE`

}IF ELSE(){
	print 0
}IF ELSE(){
	print 1
}ELSE{

    print `FALSE`

}
```

---

<a id="Conditions.NestedConditions"></a>
### Nested Conditions

```bscript
IF({ bool 1 }){

    IF({ bool 1 }){

        print `Nested`

    }

}
```


---

<a id="Interpolation"></a>
## 10. Interpolation

Interpolation evaluates expressions inside text.

Example:

```bscript
print `Hello ${$Name}!`
```

Result

```text
Hello Steve!
```

Expressions may contain:

- Variables
- Commands
- Functions
- Operators

Example:

```bscript
print `Result: ${add { num 5 } { num 10 }}`
```


---

<a id="Scope"></a>
## 11. Scope

A scope is an isolated execution context.

Every scope returns a value.

Example:

```bscript
{

    str `Hello`

}
```

Scope may contain:
Ex- Variables
- Commands
- Functions
- Nested scopes

Nested scope:

```bscript
{

    {

        str `Nested`

    }

}
```

Scopes are also used as function bodies and command arguments.


---

<a id="Examples"></a>
## 12. Examples

<a id="Examples.HelloWorld"></a>
### Hello World

```bscript
print `Hello World!`
```

---

<a id="Examples.Variables"></a>
### Variables

```bscript
$(`Name`)=`Steve`

print ${$Name}
```

---

<a id="Examples.Function"></a>
### Function

```bscript
$(`SayHello`)=FUNC=>{

    print `Hello`

}
```

---

<a id="Examples.Object"></a>
### Object

```bscript
$(`Player`)={

    $(`Name`)=`Steve`

    $(`Health`)={ num 100 }

}
```

---

<a id="Examples.Condition"></a>
### Condition

```bscript
IF({ bool 1 }){

    print `Success`

}
```

---

<a id="Examples.DestructuringAssignment"></a>
### Destructuring Assignment

```bscript
$({

    $(`Name`)={$Player.Name}

    $(`Health`)={$Player.Health}

})=$Player
```