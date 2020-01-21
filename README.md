## Warcraft 3 Typescript Definitions

### Usage:

1. Run `npm install`
2. Run `npm run build`
2. Definitions will be written `to ./dist/wc3.d.ts`

### Features:

* Enums for constants
* Includes blizzards original comments and additional handwritten documentation

### TODO

* File paths (to common.j and Blizzard.j and "outPath") are currently hardcoded
* Publish to npm
* TypeDoc website generated form declarations hosted on org github page
* Optimization and cleanup
* (low priority) use a grammer instead of the giant regexes