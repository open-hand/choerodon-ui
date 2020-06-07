import React from 'react';
import { mount } from 'enzyme';
import Select from '..';
import DataSet from '../../data-set';

const { Option } = Select;

describe('Select', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('dataset set Select value', () => {
    const handleDataSetChange = jest.fn();
    const lessTreeMock =  [
      {
        expand: false,
        functionCode: 'EMPLOYEE_REACT',
        icon: 'record_test',
        id: 7,
        ischecked: true,
        score: 10,
        shortcutId: null,
        text: '员工管理(react)',
        url: 'hap-core/hr/employee',
        symbol: '1',
        parentId: 2,
      },
      {
        expand: false,
        functionCode: 'HR_UNIT',
        icon: 'fa fa-cube',
        id: 73,
        ischecked: true,
        score: 10,
        shortcutId: null,
        text: '组织管理',
        url: 'hr/org_unit.html',
        symbol: '0',
        parentId: 2,
      },
      {
        expand: false,
        functionCode: 'COMPANY_REACT',
        icon: 'mail_set',
        id: 12,
        ischecked: true,
        score: 10,
        shortcutId: null,
        text: '公司管理(react)',
        url: 'hap-core/hr/company',
        symbol: '1',
        parentId: 2,
      },
      {
        expand: false,
        functionCode: 'ORGUNIT_REACT',
        icon: 'authority',
        id: 5,
        ischecked: true,
        score: 10,
        shortcutId: null,
        text: '组织管理(react)',
        url: 'hap-core/hr/orgunit',
        symbol: '1',
        parentId: 2,
      },
      {
        expand: false,
        functionCode: 'POSITION_REACT',
        icon: 'agile_subtask',
        id: 6,
        ischecked: true,
        score: 10,
        shortcutId: null,
        text: '岗位管理(react)',
        url: 'hap-core/hr/position',
        symbol: '1',
        parentId: 2,
      },
      {
        expand: false,
        functionCode: 'HR_POSITION',
        icon: 'fa fa-user-secret',
        id: 75,
        ischecked: true,
        score: 20,
        shortcutId: null,
        text: '岗位管理',
        url: 'hr/position.html',
        symbol: '0',
        parentId: 2,
      },
      {
        expand: false,
        functionCode: 'HR_EMPLOYEE',
        icon: 'fa fa-user',
        id: 74,
        ischecked: true,
        score: 30,
        shortcutId: null,
        text: '员工管理',
        url: 'hr/employee.html',
        symbol: '0',
        parentId: 2,
      },
      {
        expand: true,
        functionCode: 'FND_COMPANY',
        icon: 'fa fa-cube',
        id: 76,
        ischecked: null,
        score: 40,
        shortcutId: null,
        text: '公司管理',
        url: 'fnd/company.html',
        symbol: '0',
        parentId: 2,
      },
      {
        expand: true,
        functionCode: 'HR',
        icon: 'fa fa-cubes',
        id: 2,
        ischecked: null,
        score: 10,
        shortcutId: null,
        text: '组织架构',
        url: null,
        symbol: '0',
      },
      {
        expand: true,
        functionCode: 'SYS_REPORT_LIST',
        icon: 'fa fa-user',
        id: 25,
        ischecked: true,
        score: 10,
        shortcutId: null,
        text: '报表定义',
        url: 'rpt/report.html',
        symbol: '0',
        parentId: 24,
      },
      {
        expand: true,
        functionCode: 'SYS_REPORT_DESIGN',
        icon: 'fa fa-user',
        id: 26,
        ischecked: true,
        score: 10,
        shortcutId: null,
        text: '报表设计',
        url: 'ureport/designer',
        symbol: '0',
        parentId: 24,
      },
    ]
    const optionDs = new DataSet({
      data:lessTreeMock,
      autoQuery: true,
      selection: 'mutiple',
      parentField: 'parentId',
      idField: 'id',
      fields: [
        { name: 'id', type: 'string' },
        { name: 'expand', type: 'boolean' },
        { name: 'parentId', type: 'string' },
      ],
    });
  
    const ds = new DataSet({
      autoCreate:true,
      fields: [
        {
          name: 'id',
          type: 'string',
          textField: 'text',
          defaultValue:["2", "7"],
          valueField: 'id',
          label: '部门',
          options: optionDs,
        },
      ],
      events: {
        update: handleDataSetChange,
      },
    });
    const wrapper = mount(
      <Select dataSet={ds} name="user">
        <Option value="jack">Jack</Option>
        <Option value="lucy">Lucy</Option>
        <Option value="wu">Wu</Option>
      </Select>,
    );
    jest.runAllTimers();
    expect(
      wrapper
        .find('input')
        .at(0)
        .prop('value'),
    ).toBe('');
  });
  it('dataset set value render right number item', () => {
    const handleDataSetChange = jest.fn();
    const data = [
      {
        user: 'wu',
      },
    ];
    const ds = new DataSet({
      data,
      fields: [{ name: 'user', type: 'string', textField: 'text', label: '用户' }],
      events: {
        update: handleDataSetChange,
      },
    });
    const wrapper = mount(
      <Select dataSet={ds} name="user">
        <Option value="jack">Jack</Option>
        <Option value="lucy">Lucy</Option>
        <Option value="wu">Wu</Option>
      </Select>,
    );
    wrapper.find('.c7n-pro-select').simulate('click');
    jest.runAllTimers();
    expect(wrapper.find('MenuItem').length).toBe(3);
  });
});
