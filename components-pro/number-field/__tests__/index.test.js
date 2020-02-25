import React from 'react';
import { mount } from 'enzyme';
import NumberField from '..';
import NumberFieldTest from './numberField';
import DataSet from '../../data-set';

describe('NumberField', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders NumberField correctly', () => {
    const wrapper = mount(<NumberField />);
    expect(wrapper).toMatchSnapshot();
  });

  it('step renders correctly', () => {
    const wrapper = mount(<NumberField />);
    expect(wrapper.find('.c7n-pro-input-number-inner-button')).toHaveLength(0);
    wrapper.setProps({ step: 1 });
    wrapper.update();
    expect(wrapper.find('.c7n-pro-input-number-inner-button')).toHaveLength(1);
  });

  // it('the value should render when the icon click or mousedown', () => {
  //   const wrapper = mount(<NumberField step={1} />);
  //   wrapper.find('.icon-keyboard_arrow_up').simulate('mousedown');
  //   // jest.runAllTimers();
  //   // jest.runOnlyPendingTimers()
  //   jest.advanceTimersByTime();
  //   wrapper.update();
  //   expect(
  //     wrapper
  //     .find('input')
  //     .at(0)
  //     .prop('value'),
  //   ).toBe('1');
  // });

  it('the range value should render correctly', () => {
    const wrapper = mount(<NumberFieldTest />);
    expect(wrapper).toMatchSnapshot();
    expect(
      wrapper
        .find('.c7n-pro-input-number-range-start')
        .at(0)
        .prop('value'),
    ).toBe('0');
    expect(
      wrapper
        .find('.c7n-pro-input-number-range-end')
        .at(0)
        .prop('value'),
    ).toBe('4');
  });

  // it('the dataset value should render correctly', () => {
  //   const handleDataSetChange = jest.fn();
  //   const rangeValidator = jest.fn();
  //   const ds = new DataSet({
  //     autoCreate: true,
  //     fields: [
  //       {
  //         name: 'number',
  //         type: 'number',
  //         range: ['start', 'end'],
  //         defaultValue: { start: 1, end: 5 },
  //         required: true,
  //         min: 1,
  //         max: 10,
  //         step: 1,
  //         validator: rangeValidator,
  //       },
  //     ],
  //     events: {
  //       update: handleDataSetChange,
  //     },
  //   });
  //   const wrapper = mount(
  //     <NumberField
  //       dataSet={ds}
  //       name="number"
  //       placeholder={['Range Start', 'Range End']}
  //     />);
  //   expect(wrapper).toMatchSnapshot();
  //   expect(wrapper.find('NumberField').props().name).toEqual('number');
  //   wrapper.setProps({ value: [2, 9] });
  //   jest.runAllTimers();
  //   wrapper.update();
  //   expect(handleDataSetChange).toHaveBeenCalled();
  //   expect(rangeValidator).toHaveBeenCalled();
  // });
});
