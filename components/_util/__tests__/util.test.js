import React from 'react';
import throttleByAnimationFrame from '../throttleByAnimationFrame';
import getInnerText from '../getInnerText';

describe('Test utils function', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('throttle function should work', () => {
    const callback = jest.fn();
    const throttled = throttleByAnimationFrame(callback);
    expect(callback).not.toBeCalled();

    throttled();
    throttled();

    jest.runAllTimers();
    expect(callback).toBeCalled();
    expect(callback.mock.calls.length).toBe(1);
  });

  it('throttle function should be canceled', () => {
    const callback = jest.fn();
    const throttled = throttleByAnimationFrame(callback);

    throttled();
    throttled.cancel();

    jest.runAllTimers();
    expect(callback).not.toBeCalled();
  });

  it('getInnerText function', () => {
    const text = getInnerText(
      [
        <div>
          Hello
          <span> World</span>
          !!
        </div>,
        '?',
      ]
    );

    expect(text).toEqual('Hello World!!?');
  });
});
