import React from 'react';
import { mount } from 'enzyme';
import Form from '..';
import DataSet from '../../data-set';
import TextField from '../../text-field';
import NumberField from '../../number-field';
import Password from '../../password';
import Button from '../../button';
import EmailField from '../../email-field';

const { FormVirtualGroup } = Form;
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

  render () {
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


class GroupForm extends React.Component {

  state = {
    showGroup: true,
    showGroup2: true,
  };

  toggleShow = () => {
    this.setState((prevState) => ({
      showGroup: !prevState.showGroup,
    }));
  };

  toggleShow2 = () => {
    this.setState((prevState) => ({
      showGroup2: !prevState.showGroup2,
    }));
  };

  render () {
    const { showGroup, showGroup2 } = this.state;
    return (
      <Form id="basic" style={{ width: '4rem' }}>
        <TextField
          label="手机号"
          labelWidth={150}
          pattern="1[3-9]\d{9}"
          name="phone"
          required
          clearButton
          addonBefore="+86"
          addonAfter="中国大陆"
        />
        {
          showGroup && (
            <FormVirtualGroup className="virtual-group">
              <TextField
                label="姓名1"
              />
              <TextField
                label="姓名2"
              />
              {
                showGroup2 && (
                  <FormVirtualGroup className="virtual-group2">
                    <TextField
                      label="姓名3"
                    />
                    <TextField
                      label="姓名4"
                    />
                    <TextField
                      label="姓名5"
                    />
                  </FormVirtualGroup>
                )
              }
            </FormVirtualGroup>
          )
        }
        <div>
          <Button type="button" onClick={this.toggleShow}>切换</Button>
          <Button type="button" onClick={this.toggleShow2}>切换2</Button>
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

  // 测试嵌套写法
  it('use nested', () => {
    const wrapper = mount(<GroupForm />);
    jest.runAllTimers();
    expect(wrapper.find('input').length).toBe(6);
    expect(wrapper.find('.c7n-pro-input-wrapper.virtual-group').length).toBe(2);
    expect(wrapper.find('.c7n-pro-input-wrapper.virtual-group2').length).toBe(3);
    expect(wrapper.find('button').length).toBe(2);
    const b1 = wrapper.find('button').at(0);
    const b2 = wrapper.find('button').at(1);

    // 消除
    b1.simulate('click');
    expect(wrapper.find('input').length).toBe(1);
    expect(wrapper.find('.c7n-pro-input-wrapper.virtual-group').length).toBe(0);
    expect(wrapper.find('.c7n-pro-input-wrapper.virtual-group2').length).toBe(0);
    b1.simulate('click');
    b2.simulate('click');
    expect(wrapper.find('input').length).toBe(3);
    expect(wrapper.find('.c7n-pro-input-wrapper.virtual-group').length).toBe(2);
    expect(wrapper.find('.c7n-pro-input-wrapper.virtual-group2').length).toBe(0);
    b2.simulate('click');
    expect(wrapper.find('input').length).toBe(6);
    expect(wrapper.find('.c7n-pro-input-wrapper.virtual-group').length).toBe(2);
    expect(wrapper.find('.c7n-pro-input-wrapper.virtual-group2').length).toBe(3);
  });
});
