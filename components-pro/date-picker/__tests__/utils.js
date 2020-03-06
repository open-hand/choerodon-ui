export const openPanel = wrapper => {
  wrapper
    .find('.c7n-pro-calendar-picker')
    .hostNodes()
    .simulate('click');
};

export const clearInput = wrapper => {
  wrapper.find('.icon-close').simulate('click');
};

export const nextYear = wrapper => {
  wrapper.find('.c7n-pro-calendar-next-year').simulate('click');
};

export const nextMonth = wrapper => {
  wrapper.find('.c7n-pro-calendar-next-month').simulate('click');
};

export const disableWrapper = wrapper => {
  wrapper.setProps({ disabled: true });
  wrapper.update();
  expect(
    wrapper
      .find('.c7n-pro-calendar-picker-wrapper')
      .at(0)
      .hasClass('c7n-pro-calendar-picker-disabled'),
  ).toBe(true);
};

export const simulateCode = (wrapper, keycode) => {
  wrapper.find('input').simulate('keydown', { keyCode: keycode });
  jest.runAllTimers();
};
