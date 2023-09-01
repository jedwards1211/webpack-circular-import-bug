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
