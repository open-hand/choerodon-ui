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
      { id: 3, name: '王五', code: 'c', company: '汉得', dept: '研发', parentDept: '人事' },
      { id: 4, name: '赵六', code: 'd', company: '汉得', dept: '研发', parentDept: '人事' },
      { id: 5, name: '孙七', code: 'e', company: '甄云', dept: '人事', parentCompany: '汉得' },
      { id: 6, name: '周八', code: 'f', company: '甄云', dept: '人事', parentCompany: '汉得' },
      { id: 7, name: '吴九', code: 'g', company: '甄云', dept: '研发', parentCompany: '汉得', parentDept: '人事' },
      { id: 8, name: '郑十', code: 'h', company: '甄云', dept: '研发', parentCompany: '汉得', parentDept: '人事' },
      { id: 9, name: '老吴', code: 'i', company: '甄云', dept: '研发', parentCompany: '汉得', parentDept: '人事' },
      { id: 11, name: '张三', code: 'a1', company: '汉得', dept: '人事' },
      { id: 22, name: '李四1', code: 'b1', company: '汉得', dept: '人事' },
      { id: 33, name: '王五1', code: 'c1', company: '汉得', dept: '研发', parentDept: '人事' },
      { id: 44, name: '赵六1', code: 'd1', company: '汉得', dept: '研发', parentDept: '人事' },
      { id: 51, name: '孙七1', code: 'e1', company: '甄云', dept: '人事', parentCompany: '汉得' },
      { id: 61, name: '周八1', code: 'f1', company: '甄云', dept: '人事', parentCompany: '汉得' },
      { id: 71, name: '吴九1', code: 'g1', company: '甄云', dept: '研发', parentCompany: '汉得', parentDept: '人事' },
      { id: 81, name: '郑十1', code: 'h1', company: '甄云', dept: '研发', parentCompany: '汉得', parentDept: '人事' },
      { id: 91, name: '老吴1', code: 'i1', company: '甄云', dept: '研发', parentCompany: '汉得', parentDept: '人事' },
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

  const [companyGroup, setCompanyGroup] = React.useState('column');
  const [deptGroup, setDeptGroup] = React.useState('column');
  const [companyFirst, setCompanyFirst] = React.useState(true);
  const [aggregation, setAggregation] = React.useState(false);
  const [companyTree, setCompanyTree] = React.useState(false);
  const [deptTree, setDeptTree] = React.useState(false);

  const groups = React.useMemo(() => [
    { 
      name: 'company',
      parentField: companyTree ? 'parentCompany' : undefined,
      type: companyGroup,
      columnProps: {
        header: ({ dataSet, name, title }) => <span style={{ color: 'red' }}>{title}</span>,
        renderer: ({ text }) => <span style={{ color: 'blue' }}>{text}</span>,
      },
    },
    { 
      name: 'dept',
      parentField: deptTree ? 'parentDept' : undefined,
      type: deptGroup,
      columnProps: {
        header: ({ dataSet, name, title }) => <span style={{ color: 'red' }}>{title}</span>,
        renderer: ({ text }) => <span style={{ color: 'blue' }}>{text}</span>,
      },
    },
  ][companyFirst? 'slice':'reverse'](), [companyGroup, deptGroup, companyFirst, companyTree, deptTree]);

  const columns = React.useMemo(() => {
    const result = [
      {
        title: '人员',
        key: 'aggregation',
        aggregation: true,
        children: [
          { name: 'id' },
          { name: 'name', editor: true },
          { name: 'code' },
        ],
      },
    ];
    if (deptGroup === 'none') {
      result[0].children.unshift({ name: 'dept' })
    }
    if (companyGroup === 'none') {
      result[0].children.unshift({ name: 'company' })
    }
    console.log('result::', result);
    return result;
  },
    [companyGroup, deptGroup],
  );

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
        <Switch value={true} checked={companyTree} onChange={setCompanyTree} label="公司树形" newLine />
        <Switch value={true} checked={deptTree} onChange={setDeptTree} label="部门树形" />
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
        style={{ height: 300 }}
        virtual
      />
    </>
  );
};

ReactDOM.render(<App />, mountNode);
```
