import React from 'react';
import { mount } from 'enzyme';
import ModalProvider from '..';

describe('ModalProvider', () => {
  it('renders ModalProvider correctly', () => {
    const wrapper = mount(<ModalProvider />);
    // expect(wrapper).toMatchSnapshot();
  });
});
