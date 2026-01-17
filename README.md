# solderdemon-bom

## Requirements
- **Node.js**
- **npm**

---

## Installation

Install dependencies:

```bash
npm install
```

---

## Generate BOM

Run the generator:

```bash
node main.js
```

Use the arrow keys to pick which BOM to generate (Rosco 6502 or Rosco m68k), then press Enter.

**This will:**
1. Load the template files.
2. Process the BOM data.
3. Render the final PDF/HTML output into the project directory.

---

## Output

After running the script, you should see generated files such as:

```text
bom.pdf
```

