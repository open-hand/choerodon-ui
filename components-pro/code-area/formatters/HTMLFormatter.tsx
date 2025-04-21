import { Options } from 'prettier';
import prettier from 'prettier/standalone';
import plugins from 'prettier/parser-html';

import { CodeAreaFormatter } from '../CodeAreaFormatter';
import { removeUnprintableChar } from '../utils';

export class HTMLFormatter implements CodeAreaFormatter {
  static defaultOptions: Options = { parser: 'html', plugins: [plugins] };

  getFormatted(rawText: string, options?: Options): string {
    let t = rawText
    try {
      const mergeOptions = { ...HTMLFormatter.defaultOptions, ...options };
      t = prettier.format(rawText, mergeOptions);
    } catch (error) {
      // 
    }
    return t
  }

  getRaw(formattedText: string): string {
    return removeUnprintableChar(formattedText);
  }
}

export default new HTMLFormatter();
