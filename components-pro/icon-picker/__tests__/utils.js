export const simulateCode = (wrapper, keycode) => {
  wrapper.find('input').simulate('keydown', { keyCode: keycode });
  jest.runAllTimers();
};
