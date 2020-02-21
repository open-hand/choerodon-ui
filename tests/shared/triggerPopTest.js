import React from 'react';
import { mount } from 'enzyme';

export default function triggerPopTest(Component) {
  describe('Trigger Pop Test', () => {
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

    it('the Popup change event will trigger when {click, mousedown,mousemove,mouseenter,contextmenu }', () => {
      const handlePopupChange = jest.fn();
      const wrapper = mount(<Component onPopupHiddenChange={handlePopupChange} />);
      expect(handlePopupChange).not.toHaveBeenCalled();

      wrapper.find('input').simulate('click');
      jest.runAllTimers();
      expect(handlePopupChange).toHaveBeenCalled();

      wrapper.find('input').simulate('mousedown');
      jest.runAllTimers();
      expect(handlePopupChange).toHaveBeenCalled();

      wrapper.find('input').simulate('mouseenter');
      jest.runAllTimers();
      expect(handlePopupChange).toHaveBeenCalled();

      wrapper.find('input').simulate('mousemove');
      jest.runAllTimers();
      expect(handlePopupChange).toHaveBeenCalled();

      wrapper.find('input').simulate('contextmenu');
      jest.runAllTimers();
      expect(handlePopupChange).toHaveBeenCalled();
    });

    it('the Popup change can not trigger when the property readonly is true', () => {
      const handlePopupChange = jest.fn();
      const wrapper = mount(<Component onPopupHiddenChange={handlePopupChange} />);

      wrapper.setProps({ readOnly: true });
      wrapper.find('input').simulate('click');
      jest.runAllTimers();
      expect(handlePopupChange).not.toHaveBeenCalled();
    });
  });
}
