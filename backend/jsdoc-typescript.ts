// jsdoc-typescript.js
exports.handlers = {
    beforeParse: function(e) {
      if (/\.ts$/.test(e.filename)) {
        // Use the TypeScript compiler to strip out TypeScript-specific syntax
        const ts = require('typescript');
        const result = ts.transpileModule(e.source, {
          compilerOptions: {
            target: ts.ScriptTarget.ES2015,
            module: ts.ModuleKind.CommonJS
          }
        });
        e.source = result.outputText;
      }
    }
  };