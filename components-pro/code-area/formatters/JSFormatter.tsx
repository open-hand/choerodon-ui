import { Options } from 'prettier';
import prettier from 'prettier/standalone';
import plugins from 'prettier/parser-babylon';
import { CodeAreaFormatter } from '../CodeAreaFormatter';
import { removeUnprintableChar } from '../utils';

export class JSFormatter implements CodeAreaFormatter {
  static defaultOptions: Options = { parser: 'babel', plugins: [plugins] };

  getFormatted(rawText: string, options = JSFormatter.defaultOptions): string {
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

export default new JSFormatter();
