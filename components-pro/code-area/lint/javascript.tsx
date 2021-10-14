/* eslint-disable global-require */
import { Annotation } from 'codemirror';
import { JSHINT } from 'jshint';

if (typeof window !== 'undefined') {
  require('codemirror/addon/lint/lint.css');
  require('codemirror/addon/lint/lint');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const CodeMirror = require('codemirror');

  const parseErrors = function(errors, output: Annotation[]) {
    for (let i = 0; i < errors.length; i++) {
      const error = errors[i];
      if (error) {
        if (error.line <= 0) {
          if (window.console) {
            window.console.warn(`Cannot display JSHint error (invalid line ${error.line})`, error);
          }
          continue;
        }

        const start = error.character - 1;
        let end = start + 1;
        if (error.evidence) {
          const index = error.evidence.substring(start).search(/.\b/);
          if (index > -1) {
            end += index;
          }
        }

        // Convert to format expected by validation service
        const hint: Annotation = {
          message: error.reason,
          severity: error.code ? (error.code.startsWith('W') ? 'warning' : 'error') : 'error',
          from: CodeMirror.Pos(error.line - 1, start),
          to: CodeMirror.Pos(error.line - 1, end),
        };

        output.push(hint);
      }
    }
  };

  const validator = function(text, options) {
    if (!options.indent)
      // JSHint error.character actually is a column index, this fixes underlining on lines using tabs for indentation
      options.indent = 1; // JSHint default value is 4
    JSHINT(text, options, options.globals);
    const { errors } = JSHINT.data();
    const result: Annotation[] = [];
    if (errors) parseErrors(errors, result);
    return result;
  };

  CodeMirror.registerHelper('lint', 'javascript', validator);
}
