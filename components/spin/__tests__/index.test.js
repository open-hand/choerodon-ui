import React from 'react';
import { shallow, render } from 'enzyme';
import Spin from '..';

describe('Spin', () => {
  it('should only affect the spin element when set style to a nested <Spin>xx</Spin>', () => {
    const wrapper = shallow(
      <Spin style={{ background: 'red' }}>
        <div>content</div>
      </Spin>
    );
    expect(wrapper.find('.c7n-spin-nested-loading').at(0).prop('style')).toBe(undefined);
    expect(wrapper.find('.c7n-spin').at(0).prop('style').background).toBe('red');
  });

  it('should render custom indicator when it\'s set', () => {
    const customIndicator = <div className="custom-indicator" />;
    const wrapper = render(
      <Spin indicator={customIndicator} />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
