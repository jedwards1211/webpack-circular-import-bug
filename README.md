This reproduces a [Webpack bug](https://github.com/webpack/webpack/issues/10870) where certain ESM
circular imports that work in Node throw an undefined reference TypeError at runtime.

# Code

### `src/index.ts`

```ts
export { Chat } from "./chat.js";
export { ChatCompletion, Completions } from "./completions.js";
```

### `src/chat.ts`

```ts
import { Completions } from "./completions.js";
import * as API from "./index.js";

// With ESM semantics, API.Completions is defined at this point.
// But in a Webpack bundle, it throws a TypeError.

// This is because Webpacked index.ts doesn't get a module object
// for completions.ts until after evaluating chat.ts
console.log("API.Completions", API.Completions);

export class Chat {
  completions: Completions = new Completions();
}

export namespace Chat {
  export import Completions = API.Completions;
  export import ChatCompletion = API.ChatCompletion;
}
```

### `src/completions.ts`

```ts
import * as API from "./index.js";

export class Completions {
  // simplified for repro
}

export interface ChatCompletion {
  // simplified for repro
}

export namespace Completions {
  export import ChatCompletion = API.ChatCompletion;
}
```

# Output

```
$ npm run node-run

> webpack-circular-import-bug@1.0.0 node-run
> tsc && node dist/index.js

API.Completions [class Completions]
```

```
$ npm run webpack-run

> webpack-circular-import-bug@1.0.0 webpack-run
> webpack && node dist/main.js

asset main.js 5.91 KiB [emitted] (name: main)
runtime modules 670 bytes 3 modules
cacheable modules 721 bytes
  ./src/index.ts 82 bytes [built] [code generated]
  ./src/chat.ts 545 bytes [built] [code generated]
  ./src/completions.ts 94 bytes [built] [code generated]
webpack 5.88.2 compiled successfully in 547 ms
webpack://webpack-circular-import-bug/./src/index.ts?:4
/* harmony export */   Completions: () => (/* reexport safe */ _completions_js__WEBPACK_IMPORTED_MODULE_1__.Completions)
                                                                                                            ^

TypeError: Cannot read properties of undefined (reading 'Completions')
    at Module.Completions (webpack://webpack-circular-import-bug/./src/index.ts?:4:109)
    at eval (webpack://webpack-circular-import-bug/./src/chat.ts?:13:71)
    at ./src/chat.ts (file:///Users/andy/gh/webpack-circular-import-bug/dist/main.js:19:1)
    at __webpack_require__ (file:///Users/andy/gh/webpack-circular-import-bug/dist/main.js:63:41)
    at eval (webpack://webpack-circular-import-bug/./src/index.ts?:6:66)
    at ./src/index.ts (file:///Users/andy/gh/webpack-circular-import-bug/dist/main.js:39:1)
    at __webpack_require__ (file:///Users/andy/gh/webpack-circular-import-bug/dist/main.js:63:41)
    at file:///Users/andy/gh/webpack-circular-import-bug/dist/main.js:103:37
    at file:///Users/andy/gh/webpack-circular-import-bug/dist/main.js:105:12
    at ModuleJob.run (node:internal/modules/esm/module_job:192:25)
```
