import React from 'react';
import { mount } from 'enzyme';
import IntlList from '../IntlList';
import mountTest from '../../../tests/shared/mountTest';

mountTest(IntlList);

describe('IntlList-pro', () => {
  it('renders IntlField correctly', () => {
    const wrapper = mount(<IntlList />);
    expect(wrapper).toMatchSnapshot();
  });
});
