/* eslint-disable import/prefer-default-export */
export const selectDate = (wrapper, date, index) => {
  let calendar = wrapper;
  if (index !== undefined) {
    calendar = wrapper.find('.c7n-pro-calendar-range-text').at(index);
  }
  calendar.find({ title: date.format() }).simulate('click');
};

export const hasSelected = (wrapper, date) => {
  return wrapper.find({ title: date.format() }).hasClass('c7n-pro-calendar-selected');
};

export const openPanel = wrapper => {
  wrapper
    .find('.c7n-pro-calendar-picker')
    .hostNodes()
    .simulate('click');
};

export const clearInput = wrapper => {
  wrapper
    .find('.c7n-pro-calendar-picker-clear-button')
    .hostNodes()
    .find('i')
    .simulate('click');
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
