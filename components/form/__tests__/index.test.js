import React from 'react';
import { shallow, mount } from 'enzyme';
import Form from '..';

describe('Form', () => {
  it('hideRequiredMark', () => {
    const wrapper = shallow(<Form hideRequiredMark />);
    expect(wrapper.hasClass('c7n-form-hide-required-mark')).toBe(true);
  });

  describe('wrappedComponentRef', () => {
    it('warns on functional component', () => {
      if (process.env.REACT === '15') {
        return;
      }
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const TestForm = () => <Form />;
      const Wrapped = Form.create()(TestForm);
      mount(<Wrapped wrappedComponentRef={() => {}} />);
      expect(spy).toHaveBeenCalled();
      spy.mockReset();
      spy.mockRestore();
    });

    it('get component ref', () => {
      // eslint-disable-next-line
      class TestForm extends React.Component {
        render() {
          return <Form />;
        }
      }
      const Wrapped = Form.create()(TestForm);
      let form;
      mount(<Wrapped wrappedComponentRef={node => (form = node)} />);
      expect(form).toBeInstanceOf(TestForm);
    });
  });
});
