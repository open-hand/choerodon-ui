import React from 'react';
import { mount } from 'enzyme';
import AutoComplete from '..';
import DataSet from '../../data-set';

let options = null
let ds = null
let data = null

describe('AutoComplete', () => {
  beforeEach(() => {
    data = [
      {
        user: '1',
      },
    ];
    options = new DataSet({
      fields: [{
        name: 'value', type: 'string',
      }, {
        name: 'meaning', type: 'string',
      }],
      data: [{
        value: '1',
        meaning: '1',
      }, {
        value: '12',
        meaning: '12',
      }, {
        value: '123',
        meaning: '123',
      }],
    })

    ds = new DataSet({
      data,
      fields: [{ name: 'user', type: 'string', textField: 'text', label: '用户' }],
    });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('dataset set AutoComplete value', () => {
    const wrapper = mount(
      <AutoComplete dataSet={ds} options={options} name="user" />,
    );
    jest.runAllTimers();
    expect(
      wrapper
        .find('input')
        .at(0)
        .prop('value'),
    ).toBe('1');
  });


  it('AutoComplete choose value to dataSet', () => {
    const wrapper = mount(
      <AutoComplete dataSet={ds} options={options} name="user" />,
    );
    jest.runAllTimers();
    wrapper.find('.c7n-pro-auto-complete').simulate('click');
    expect(wrapper.find('MenuItem').length).toBe(3);
    wrapper.find('.c7n-pro-auto-complete').simulate('change', { target: { value: '12' } });
    expect(wrapper.find('MenuItem').length).toBe(2);
    expect(wrapper.find('MenuItem').at(0).prop('value').get('value')).toBe('12');
    expect(wrapper.find('MenuItem').at(1).prop('value').get('value')).toBe('123');
  });


  it('AutoComplete options change', () => {
    options = new DataSet({
      fields: [{
        name: 'value', type: 'string',
      }, {
        name: 'meaning', type: 'string',
      }],
    })

    const handeInput=(v)=>{
      const value=v.target.value
      const suffixList=['@qq.com','@163.com','@hand-china.com']
      if(value.indexOf('@')!==-1){
        options.loadData([])
      }else{
        options.loadData(suffixList.map(suffix=>({
          value:`${value}${suffix}`,
          meaning:`${value}${suffix}`,
        })))
      }
    }

    const wrapper = mount(
      <AutoComplete dataSet={ds} options={options} name="user" onInput={handeInput} />,
    );
    jest.runAllTimers();
    wrapper.find('.c7n-pro-auto-complete').simulate('click');
    wrapper.find('.c7n-pro-auto-complete').simulate('input', { target: { value: '12' } });
    expect(wrapper.find('MenuItem').length).toBe(3);
    expect(wrapper.find('MenuItem').at(0).prop('value').get('value')).toBe('12@qq.com');
    expect(wrapper.find('MenuItem').at(1).prop('value').get('value')).toBe('12@163.com');
  });

});
