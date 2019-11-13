import 'codemirror/addon/lint/lint.css';
import 'codemirror/addon/lint/lint';
import jsonlintMod from 'jsonlint-mod';
import CodeMirror, { Annotation } from 'codemirror';

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
  } catch (e) {
    console.error(e);
  }
  return found;
});
