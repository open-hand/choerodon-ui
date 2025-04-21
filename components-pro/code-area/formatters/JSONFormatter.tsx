import { Options } from 'prettier';
import prettier from 'prettier/standalone';
import plugins from 'prettier/parser-babylon';
import { CodeAreaFormatter } from '../CodeAreaFormatter';
import { removeUnprintableChar } from '../utils';

export class JSONFormatter implements CodeAreaFormatter {
  static defaultOptions: Options = { parser: 'json', plugins: [plugins], printWidth: 1 };

  getFormatted(rawText: string, options?: Options): string {
    let t = rawText
    try {
      const mergeOptions = { ...JSONFormatter.defaultOptions, ...options };
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

export default new JSONFormatter();
