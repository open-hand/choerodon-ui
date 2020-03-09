import React from 'react';
import { mount } from 'enzyme';
import Lov from '..';
import DataSet from '../../data-set';

describe('Lov-pro', () => {
  it('render correctly', () => {
    const wrapper = mount(<Lov />);
    expect(wrapper.render()).toMatchSnapshot();
  });

  const ds = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'code',
        textField: 'code',
        type: 'object',
        lovCode: 'LOV_CODE',
        lovPara: { code: '111' },
        required: true,
      },
      { name: 'code_code', type: 'string', bind: 'code.code' },
      { name: 'code_description', type: 'string', bind: 'code.description' },
    ],
  });

  it('render mode button', () => {
    const wrapper = mount(<Lov dataSet={ds} name="code" mode="button" />);
    expect(wrapper.find('button').length).toBe(2);
    expect(wrapper).toMatchSnapshot();
  });
});
