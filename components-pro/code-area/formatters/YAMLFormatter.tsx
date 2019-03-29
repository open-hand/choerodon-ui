// import YAML from 'yaml';
import { Options } from 'prettier';
import prettier from 'prettier/standalone';
import plugins from 'prettier/parser-yaml';

import { CodeAreaFormatter } from '../CodeAreaFormatter';

export class YAMLFormatter implements CodeAreaFormatter {
  static defaultOptions: Options = { parser: 'yaml', plugins: [plugins] };

  getFormatted(rawText: string, options: Options = YAMLFormatter.defaultOptions): string {
    return prettier.format(rawText, options);
  }

  getRaw(formattedText: string): string {
    return formattedText; // do nothing
  }
}

export default new YAMLFormatter();
