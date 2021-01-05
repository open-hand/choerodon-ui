import { createElement, Fragment, isValidElement, ReactNode } from 'react';
import format from 'string-template';
import isString from 'lodash/isString';
import isObject from 'lodash/isObject';
import isNil from 'lodash/isNil';
import flatMap from 'lodash/flatMap';

export default function formatReactTemplate(
  template: string,
  map: { [key: string]: ReactNode },
): ReactNode {
  let result: ReactNode[] = [template];
  Object.keys(map).forEach(key => {
    const node = map[key];
    if (!isNil(node)) {
      result = flatMap(result, text => {
        if (isString(text)) {
          let stringText = text;
          if (isValidElement(node)) {
            let placeholder = `{${key}}`;
            if (isObject(node)) {
              placeholder = '[object Object]';
            }
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
          return format(text, map);
        }
        return text;
      });
    }
  });
  if (result.every(isString)) {
    return result.join('');
  }
  return createElement(Fragment, {}, ...result);
}
