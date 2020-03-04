import React from 'react';
import { mount } from 'enzyme';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import ObserverFormField from '..';

@observer
class TestFiledForm extends ObserverFormField {
  renderWrapper() {
    return (
      <div>
        <input />
      </div>
    );
  }
}

describe('Select', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('observer component reder right', () => {
    const wrapper = mount(<TestFiledForm />);
    jest.runAllTimers();
    expect(wrapper.exists('input')).toMatchSnapshot();
  });
  it('onclick should tobe call', () => {
    const mockFn = jest.fn();
    @observer
    class TestFiledForm1 extends ObserverFormField {
      static propTypes = {
        onClick: PropTypes.func,
      };

      renderWrapper() {
        return (
          <div onClick={this.props.onClick}>
            <input />
          </div>
        );
      }
    }
    const wrapper = mount(<TestFiledForm1 onClick={mockFn} />);
    wrapper.simulate('click');
    jest.runAllTimers();
    expect(mockFn).toHaveBeenCalled();
  });
});
