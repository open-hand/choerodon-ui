import React from 'react';
import { mount } from 'enzyme';
import Form from '..';
import DataSet from '../../data-set';
import TextField from '../../text-field';
import NumberField from '../../number-field';
import Password from '../../password';
import Button from '../../button';
import EmailField from '../../email-field';

class FormTest extends React.Component {
  ds = new DataSet({
    data: [
      {
        phone: 1800000000,
        age: 18,
        sex: 'F',
        email: 'xxx@choerodon.io',
        homepage: 'https://choerodon.io',
      },
    ],
    fields: [
      {
        name: 'phone',
        type: 'string',
        label: '手机号',
        labelWidth: 150,
        required: true,
        pattern: '^1[3-9]\\d{9}$',
      }, // /^1[3-9]\d{9}$/
      {
        name: 'password',
        type: 'string',
        label: '密码',
        required: true,
      },
      {
        name: 'age',
        type: 'number',
        label: '年龄',
        required: true,
        min: 18,
        step: 1,
        help: '我们需要确定你的年龄',
      },
      { name: 'email', type: 'email', label: '邮箱', required: true },
    ],
  });

  changeField = () => {
    this.ds.current.getField('code').set('textField', 'description');
  };

  render() {
    return (
      <Form dataSet={this.ds} style={{ width: '4.5rem' }} {...this.props}>
        <TextField name="phone" />
        <Password name="password" />
        <NumberField name="age" addonAfter="周岁" showHelp="tooltip" />
        <EmailField name="email" />
        <div>
          <Button type="submit">注册</Button>
          <Button type="reset" style={{ marginLeft: 8 }}>
            重置
          </Button>
          <Button onClick={this.changeField} style={{ marginLeft: 8 }}>
            设置代码描述的textField
          </Button>
        </div>
      </Form>
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

  it('the form reder right', () => {
    const wrapper = mount(<FormTest />);
    jest.runAllTimers();
    expect(wrapper.find('input').length).toBe(5);
  });
  it('dataset data form test', () => {
    const wrapper = mount(<FormTest disabled />);
    expect(
      wrapper
        .find('input')
        .at(0)
        .prop('value'),
    ).toBe('1800000000');
    expect(
      wrapper
        .find('input')
        .at(1)
        .prop('value'),
    ).toBe(undefined);
    expect(
      wrapper
        .find('input')
        .at(2)
        .prop('value'),
    ).toBe('');
    expect(
      wrapper
        .find('input')
        .at(3)
        .prop('value'),
    ).toBe('18');
    expect(
      wrapper
        .find('input')
        .at(4)
        .prop('value'),
    ).toBe('xxx@choerodon.io');
  });
  it('disable test', () => {
    const wrapper = mount(<FormTest disabled />);
    jest.runAllTimers();
    expect(wrapper).toMatchSnapshot();
  });

  it('useColon test', () => {
    const wrapper = mount(<FormTest useColon />);
    jest.runAllTimers();
    expect(wrapper.find('.c7n-pro-field-label-useColon')).toHaveLength(4);
  });
});
