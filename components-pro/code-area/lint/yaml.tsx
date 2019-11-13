import 'codemirror/addon/lint/lint.css';
import 'codemirror/addon/lint/lint';
import jsyaml from 'js-yaml';
import CodeMirror, { Annotation } from 'codemirror';

CodeMirror.registerHelper('lint', 'yaml', function(text) {
  const found: Annotation[] = [];
  try {
    jsyaml.loadAll(text);
  } catch (e) {
    const { mark: loc, message } = e;
    // js-yaml YAMLException doesn't always provide an accurate lineno
    // e.g., when there are multiple yaml docs
    // ---
    // ---
    // foo:bar
    const from = loc ? CodeMirror.Pos(loc.line, loc.column) : CodeMirror.Pos(0, 0);
    const to = from;
    found.push({
      from,
      to,
      message,
    });
  }
  return found;
});
