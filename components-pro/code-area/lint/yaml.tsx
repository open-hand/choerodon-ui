/* eslint-disable global-require */
import { Annotation } from 'codemirror';
import jsyaml from 'js-yaml';

if (typeof window !== 'undefined') {
  require('codemirror/addon/lint/lint.css');
  require('codemirror/addon/lint/lint');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const CodeMirror = require('codemirror');

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
}
