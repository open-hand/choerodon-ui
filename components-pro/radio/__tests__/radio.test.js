import React from 'react';
import { render } from 'enzyme';
import Radio from '..';
import focusTest from '../../../tests/shared/focusTest';

describe('Radio-pro', () => {
  focusTest(Radio);

  it('should render correctly', () => {
    const wrapper = render(<Radio>Test</Radio>);
    expect(wrapper).toMatchSnapshot();
  });
});
