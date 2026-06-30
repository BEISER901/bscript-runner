# Getting Started

Practical step-by-step guide for installing, configuring, and using the library.

This guide focuses on real-world usage with complete examples. Detailed API information is available in **REFERENCE.md**.

---

## Contents

- [1. Installation](#1-installation)
- [2. Importing the package](#2-importing-the-package)
- [3. Initial setup](#3-initial-setup)
- [4. Core usage scenarios](#4-core-usage-scenarios)
- [5. Useful examples](#5-useful-examples)
- [6. Best practices](#6-best-practices)
- [See also](#see-also)

---

<a id="1-installation"></a>

## 1. Installation

### npm

```bash
npm install {PackageName}
```

### pnpm

```bash
pnpm add {PackageName}
```

### yarn

```bash
yarn add {PackageName}
```

<img src="./Images/install-package.png" width="100%" alt="Package installation"/>

---

<a id="2-importing-the-package"></a>

## 2. Importing the package

### CommonJS

```javascript
const Library = require("{PackageName}");
```

### ES Modules

```javascript
import Library from "{PackageName}";
```

or

```javascript
import { Example } from "{PackageName}";
```

---

<a id="3-initial-setup"></a>

## 3. Initial setup

```javascript
const Library = require("{PackageName}");

const instance = new Library({
    option1: "...",
    option2: "...",
    option3: "..."
});
```

### Description

Brief explanation of what happens during initialization.

<img src="./Images/initialization.png" width="100%" alt="Initialization"/>

---

<a id="4-core-usage-scenarios"></a>

## 4. Core usage scenarios

### 4.1 Basic usage

Describe the most common use case.

```javascript
const result = instance.method();
```

### Output

```text
Example output...
```

<img src="./Images/example1.png" width="100%" alt="Example"/>

---

### 4.2 Working with {Feature}

Describe another common scenario.

```javascript
// Example
```

---

### 4.3 Advanced usage

```javascript
// Example
```

---

<a id="5-useful-examples"></a>

## 5. Useful examples

### Example 1 — Complete workflow

```javascript
const Library = require("{PackageName}");

// Complete working example...
```

### Expected output

```text
Expected console output...
```

<img src="./Images/example-full.png" width="100%" alt="Full example"/>

---

### Example 2 — ...

```javascript
// Example
```

---

<a id="6-best-practices"></a>

## 6. Best practices

- Keep library configuration in one place.
- Avoid modifying internal APIs.
- Handle asynchronous operations using `async/await`.
- Catch and process runtime errors.
- Use the documented public API whenever possible.

---

<a id="see-also"></a>

## See also

- **[REFERENCE.md](./REFERENCE.md)** — Complete API documentation
- **[TECHNICAL.md](./TECHNICAL.md)** — Internal architecture
- **[README.md](./README.md)** — Project overview

---

<!--

=============================================
DOCUMENTATION GUIDELINES
=============================================

1. This document is intended for end users.

2. Every important scenario should contain:
   - A brief description
   - Complete runnable example
   - Expected output
   - Optional illustration

3. Store images inside:

   ./Images/

4. Focus on practical workflows rather than describing the API.
   API documentation belongs in REFERENCE.md.

5. Update the table of contents whenever a new section is added.

6. Add anchors (<a id="..."></a>) for every top-level section.

7. Examples should be executable with minimal modification.

8. Prefer both CommonJS and ES Module examples when applicable.

-->