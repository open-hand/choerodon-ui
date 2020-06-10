import React from 'react';
import { mount } from 'enzyme';
import Rate from '..';

describe('focus and blur', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  let container;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('focus() and onFocus', () => {
    const handleFocus = jest.fn();
    const wrapper = mount(<Rate onFocus={handleFocus} />, { attachTo: container });
    wrapper.instance().focus();
    jest.runAllTimers();
    expect(handleFocus).toHaveBeenCalled();
  });

  it('autoFocus', () => {
    const handleFocus = jest.fn();
    mount(<Rate autoFocus onFocus={handleFocus} />, { attachTo: container });
    jest.runAllTimers();
    expect(handleFocus).toHaveBeenCalled();
  });
});