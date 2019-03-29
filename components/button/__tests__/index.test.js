import React from 'react';
import { render, mount } from 'enzyme';
import Button from '..';
import Icon from '../../icon';

describe('Button', () => {
  it('renders correctly', () => {
    const wrapper = render(
      <Button>Follow</Button>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders Chinese characters correctly', () => {
    const wrapper = render(
      <Button>按钮</Button>
    );
    expect(wrapper).toMatchSnapshot();
    // should not insert space when there is icon
    const wrapper1 = render(
      <Button icon="search">按钮</Button>
    );
    expect(wrapper1).toMatchSnapshot();
    // should not insert space when there is icon
    const wrapper2 = render(
      <Button><Icon type="search" />按钮</Button>
    );
    expect(wrapper2).toMatchSnapshot();
  });

  it('have static perperty for type detecting', () => {
    const wrapper = mount(
      <Button>Button Text</Button>
    );
    // eslint-disable-next-line
    expect(wrapper.type().__ANT_BUTTON).toBe(true);
  });

  it('should support link button', () => {
    const wrapper = mount(
      <Button target="_blank" href="https://choerodon.github.io/choerodon-ui/">link button</Button>
    );
    expect(wrapper.render()).toMatchSnapshot();
  });

  it('fixbug renders {0} , 0 and {false}', () => {
    const wrapper = render(
      <Button>{0}</Button>
    );
    expect(wrapper).toMatchSnapshot();
    const wrapper1 = render(
      <Button>0</Button>
    );
    expect(wrapper1).toMatchSnapshot();
    const wrapper2 = render(
      <Button>{false}</Button>
    );
    expect(wrapper2).toMatchSnapshot();
  });
});
