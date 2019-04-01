/**
 * 为CodeArea写一个针对某种语言（在CodeMirror中称为mode）的格式化扩展，
 * 需要写一个此接口的实现类
 * @export
 * @interface CodeAreaFormatter
 */
import { Options } from 'prettier';

export interface CodeAreaFormatter {
  getFormatted(rawText: string, options?: Options): string;

  getRaw(formattedText: string): string;
}
