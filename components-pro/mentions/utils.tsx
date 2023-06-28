import React from 'react';
import { isFragment } from 'react-is';
import { MentionsProps } from './Mentions';
import { OptionProps } from './Option';

type OmitFunc = <T extends object, K extends [...(keyof T)[]]>(
  obj: T,
  ...keys: K
) => { [K2 in Exclude<keyof T, K[number]>]: T[K2] };

export const omit: OmitFunc = (obj, ...keys) => {
  const clone = {
    ...obj,
  };
  keys.forEach(key => {
    delete clone[key];
  });

  return clone;
};

/**
 * Cut input selection into 2 part and return text before selection start
 */
export function getBeforeSelectionText(input: HTMLTextAreaElement) {
  const { selectionStart } = input;
  return input.value.slice(0, selectionStart);
}

interface MeasureIndex {
  location: number;
  mentionsKey: string;
}
/**
 * Find the last match mentionsKey index
 */
export function getLastMeasureIndex(text: string, mentionsKey: string | string[] = ''): MeasureIndex {
  const prefixList: string[] = Array.isArray(mentionsKey) ? mentionsKey : [mentionsKey];
  return prefixList.reduce(
    (lastMatch: MeasureIndex, prefixStr): MeasureIndex => {
      const lastIndex = text.lastIndexOf(prefixStr);
      if (lastIndex > lastMatch.location) {
        return {
          location: lastIndex,
          mentionsKey: prefixStr,
        };
      }
      return lastMatch;
    },
    { location: -1, mentionsKey: '' },
  );
}

interface MeasureConfig {
  measureLocation: number;
  mentionsKey: string;
  targetText: string;
  selectionStart: number;
  split: string;
}

function lower(char: string | undefined): string {
  return (char || '').toLowerCase();
}

function reduceText(text: string, targetText: string, split: string) {
  const firstChar = text[0];
  if (!firstChar || firstChar === split) {
    return text;
  }

  // Reuse rest text as it can
  let restText = text;
  const targetTextLen = targetText.length;
  for (let i = 0; i < targetTextLen; i += 1) {
    if (lower(restText[i]) !== lower(targetText[i])) {
      restText = restText.slice(i);
      break;
    } else if (i === targetTextLen - 1) {
      restText = restText.slice(targetTextLen);
    }
  }

  return restText;
}

/**
 * Paint targetText into current text:
 *  text: little@litest
 *  targetText: light
 *  => little @light test
 */
export function replaceWithMeasure(text: string, measureConfig: MeasureConfig) {
  const { measureLocation, mentionsKey, targetText, selectionStart, split } = measureConfig;

  // Before text will append one space if have other text
  let beforeMeasureText = text.slice(0, measureLocation);
  if (beforeMeasureText.substring(beforeMeasureText.length - split.length) === split) {
    beforeMeasureText = beforeMeasureText.slice(0, beforeMeasureText.length - split.length);
  }
  if (beforeMeasureText) {
    beforeMeasureText = `${beforeMeasureText}${split}`;
  }

  // Cut duplicate string with current targetText
  let restText = reduceText(
    text.slice(selectionStart),
    targetText.slice(selectionStart - measureLocation - mentionsKey.length),
    split,
  );
  if (restText.slice(0, split.length) === split) {
    restText = restText.slice(split.length);
  }

  const connectedStartText = `${beforeMeasureText}${mentionsKey}${targetText}${split}`;

  return {
    text: `${connectedStartText}${restText}`,
    selectionLocation: connectedStartText.length,
  };
}

export function setInputSelection(input: HTMLTextAreaElement, location: number) {
  input.setSelectionRange(location, location);

  /**
   * Reset caret into view.
   * Since this function always called by user control, it's safe to focus element.
   */
  // input.blur();
  input.focus();
}

export function validateSearch(text: string, props: MentionsProps) {
  const { split } = props;
  return !split || text.indexOf(split) === -1;
}

export function filterOption(input: string, { value = '' }: OptionProps): boolean {
  const lowerCase = input.toLowerCase();
  return value.toLowerCase().indexOf(lowerCase) !== -1;
}

export interface Option {
  keepEmpty?: boolean;
}

export function toArray(
  children: React.ReactNode,
  option: Option = {},
): React.ReactElement[] {
  let ret: React.ReactElement[] = [];

  React.Children.forEach(children, (child: any) => {
    if ((child === undefined || child === null) && !option.keepEmpty) {
      return;
    }

    if (Array.isArray(child)) {
      ret = ret.concat(toArray(child));
    } else if (isFragment(child) && child.props) {
      ret = ret.concat(toArray(child.props.children, option));
    } else {
      ret.push(child);
    }
  });

  return ret;
}
