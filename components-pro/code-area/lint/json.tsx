/* eslint-disable global-require */
import { Annotation } from 'codemirror';
import jsonlintMod from 'jsonlint-mod';

if (typeof window !== 'undefined') {
  require('codemirror/addon/lint/lint.css');
  require('codemirror/addon/lint/lint');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const CodeMirror = require('codemirror');

  CodeMirror.registerHelper('lint', 'json', function(text) {
    const found: Annotation[] = [];
    const jsonlint = jsonlintMod.parser || jsonlintMod;
    jsonlint.parseError = function(str, { loc }) {
      found.push({
        from: CodeMirror.Pos(loc.first_line - 1, loc.first_column),
        to: CodeMirror.Pos(loc.last_line - 1, loc.last_column),
        message: str,
      });
    };
    try {
      jsonlint.parse(text);
      // eslint-disable-next-line no-empty
    } catch (e) {}
    return found;
  });
}
