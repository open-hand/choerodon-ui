import { Options } from 'prettier';
import prettier from 'prettier/standalone';
import plugins from 'prettier/parser-html';

import { CodeAreaFormatter } from '../CodeAreaFormatter';
import { removeUnprintableChar } from '../utils';

export class HTMLFormatter implements CodeAreaFormatter {
  static defaultOptions: Options = { parser: 'html', plugins: [plugins] };

  getFormatted(rawText: string, options: Options = HTMLFormatter.defaultOptions): string {
    let t = rawText
    try {
      t = prettier.format(rawText, options)
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
