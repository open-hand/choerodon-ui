import React, { isValidElement, ReactNode } from 'react';
import format from 'string-template';
import isString from 'lodash/isString';
import isNil from 'lodash/isNil';
import flatMap from 'lodash/flatMap';

export function formatReactTemplate<P extends object>(
  template: ReactNode,
  map: P,
): P extends { [key: string]: infer V } ? V : string;

export function formatReactTemplate(
  template: ReactNode,
  map: { [key: string]: ReactNode },
): ReactNode {
  let result: ReactNode[] = [template];
  Object.keys(map).forEach(key => {
    const node = map[key];
    if (!isNil(node)) {
      result = flatMap<ReactNode, ReactNode>(result, (text) => {
        if (isString(text)) {
          let stringText: string = text;
          if (isValidElement(node)) {
            const placeholder: string = `{${key}}`;
            const { length } = placeholder;
            const textArr: ReactNode[] = [];
            let index = stringText.indexOf(placeholder);
            while (index > -1) {
              if (index > 0) {
                textArr.push(stringText.slice(0, index));
              }
              textArr.push(node);
              stringText = stringText.slice(index + length);
              index = stringText.indexOf(placeholder);
            }
            if (stringText) {
              textArr.push(stringText);
            }
            return textArr;
          }
          return format(text, { [key]: node });
        }
        return text;
      });
    }
  });
  if (result.every(isString)) {
    return result.join('');
  }
  return (
    <>
      {result}
    </>
  );
}

export default formatReactTemplate;
