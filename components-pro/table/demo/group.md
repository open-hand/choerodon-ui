---
order: 27
title:
  zh-CN: 数据分组
  en-US: Data Group
---

## zh-CN

数据分组。

## en-US

Data Group.

```jsx
import {
  useDataSet,
  Table,
  Form,
  SelectBox,
  Switch,
} from 'choerodon-ui/pro';

const { Option } = SelectBox;

const App = () => {
  const userDs = useDataSet(() => ({
    strictPageSize: false,
    data: [
      { id: 1, name: '张三', code: 'a', company: '汉得', dept: '人事' },
      { id: 2, name: '李四', code: 'b', company: '汉得', dept: '人事' },
      { id: 3, name: '王五', code: 'c', company: '汉得', dept: '研发' },
      { id: 4, name: '赵六', code: 'd', company: '汉得', dept: '研发' },
      { id: 5, name: '孙七', code: 'e', company: '甄云', dept: '人事' },
      { id: 6, name: '周八', code: 'f', company: '甄云', dept: '人事' },
      { id: 7, name: '吴九', code: 'g', company: '甄云', dept: '研发' },
      { id: 8, name: '郑十', code: 'h', company: '甄云', dept: '研发' },
      { id: 9, name: '老吴', code: 'i', company: '甄云', dept: '研发' },
    ],
    fields: [
      {
        name: 'id',
        label: '编号',
      },
      {
        name: 'name',
        label: '姓名',
      },
      {
        name: 'code',
        label: '编码',
      },
      {
        name: 'company',
        label: '公司',
      },
      {
        name: 'dept',
        label: '部门',
      },
    ],
  }), []);

  const columns = React.useMemo(() => [
    {
      title: '人员',
      key: 'aggregation',
      aggregation: true,
      children: [
        { name: 'id' },
        { name: 'name', editor: true },
        { name: 'code' },
      ]
    }
  ], []);

  const [companyGroup, setCompanyGroup] = React.useState('column');
  const [deptGroup, setDeptGroup] = React.useState('column');
  const [companyFirst, setCompanyFirst] = React.useState(true);
  const [aggregation, setAggregation] = React.useState(false);

  const groups = React.useMemo(() => [
    { 
      name: 'company',
      type: companyGroup,
      columnProps: {
        header: ({ dataSet, name, title }) => <span style={{ color: 'red' }}>{title}</span>,
        renderer: ({ text }) => <span style={{ color: 'blue' }}>{text}</span>,
      },
    },
    { 
      name: 'dept',
      type: deptGroup,
      columnProps: {
        header: ({ dataSet, name, title }) => <span style={{ color: 'red' }}>{title}</span>,
        renderer: ({ text }) => <span style={{ color: 'blue' }}>{text}</span>,
      },
    },
  ][companyFirst? 'slice':'reverse'](), [companyGroup, deptGroup, companyFirst]);

  return (
    <>
      <Form columns={4}>
        <SelectBox value={companyGroup} onChange={setCompanyGroup} label="公司分组">
          <Option value="column">column</Option>
          <Option value="row">row</Option>
          <Option value="header">header</Option>
          <Option value="none">none</Option>
        </SelectBox>
        <SelectBox value={deptGroup} onChange={setDeptGroup} label="部门分组">
          <Option value="column">column</Option>
          <Option value="row">row</Option>
          <Option value="header">header</Option>
          <Option value="none">none</Option>
        </SelectBox>
        <Switch value={true} checked={companyFirst} onChange={setCompanyFirst} label="公司优先" />
        <Switch value={true} checked={aggregation} onChange={setAggregation} label="聚合" />
      </Form>
      <Table
        customizable
        customizedCode="group"
        columnDraggable
        columnTitleEditable
        aggregation={aggregation}
        onAggregationChange={setAggregation}
        border
        dataSet={userDs}
        columns={columns}
        groups={groups}
      />
    </>
  );
};

ReactDOM.render(<App />, mountNode);
```
