import React, { isValidElement, ReactNode } from 'react';
import isString from 'lodash/isString';
import flatMap from 'lodash/flatMap';
import { runInAction } from 'mobx';
import formatTemplate from './formatTemplate';

export function formatReactTemplate<P extends object>(
  template: ReactNode,
  map: P,
): P extends { [key: string]: infer V } ? V : string;

export function formatReactTemplate(
  template: ReactNode,
  map: { [key: string]: ReactNode },
): ReactNode {
  return runInAction(() => {
    let result: ReactNode[] = [template];
    const keys = Object.keys(map);
    const { length } = keys;
    keys.forEach((key, index) => {
      const node = map[key];
      result = flatMap<ReactNode, ReactNode>(result, (text) => {
        if (isString(text)) {
          let stringText: string = text;
          if (isValidElement(node)) {
            const placeholder = `{${key}}`;
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
          return formatTemplate(text, { [key]: node }, index < length - 1);
        }
        return text;
      });
    });
    if (result.every(isString)) {
      return result.join('');
    }
    return (
      <>
        {result}
      </>
    );
  });
}

export default formatReactTemplate;
