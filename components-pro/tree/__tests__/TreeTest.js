import React from 'react';
import Tree from '..';
import DataSet from '../../data-set';
import NumberField from '../../number-field';

function nodeRenderer({ record }) {
  return record.get('text');
}
const dataSet = [
  {
    expand: false,
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
];

export default class TreeTest extends React.Component {
  state = {
    count: 0,
  };
  ds = new DataSet({
    primaryKey: 'id',
    data: dataSet,
    parentField: 'parentId',
    expandField: 'expand',
    idField: 'id',
    fields: [
      { name: 'id', type: 'number' },
      { name: 'expand', type: 'boolean' },
      { name: 'parentId', type: 'number' },
    ],
    events: {
      select: ({ record, dataSet }) => {
        this.setCount(dataSet);
      },
      unSelect: ({ record, dataSet }) => {
        this.setCount(dataSet);
      },
    },
  });
  setCount(dataSet) {
    this.setState({ count: dataSet.selected.length });
  }

  render() {
    return (
      <>
        <NumberField value={this.state.count} />
        <Tree dataSet={this.ds} checkable renderer={nodeRenderer} />
      </>
    );
  }
}
