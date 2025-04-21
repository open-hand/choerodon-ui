import { Options } from 'prettier';
import prettier from 'prettier/standalone';
import plugins from 'prettier/parser-babylon';
import { CodeAreaFormatter } from '../CodeAreaFormatter';
import { removeUnprintableChar } from '../utils';

export class JSFormatter implements CodeAreaFormatter {
  static defaultOptions: Options = { parser: 'babel', plugins: [plugins] };

  getFormatted(rawText: string, options?: Options): string {
    let t = rawText
    try {
      const mergeOptions = { ...JSFormatter.defaultOptions, ...options };
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

export default new JSFormatter();
