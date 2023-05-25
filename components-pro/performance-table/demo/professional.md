---
order: 5
title:
  zh-CN: ProfessionalBar
  en-US: ProfessionalBar
---

## zh-CN

ProfessionalBar

## en-US

ProfessionalBar example.

````jsx
import '../../../components-pro/performance-table/style/index.less';
import fakeLargeData from '../../../site/theme/mock/performance-data/fakeLargeData.json';
import { Button, PerformanceTable, DataSet } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';

const { Column, HeaderCell, Cell } = PerformanceTable;

const optionData = [
  { text: '男', value: 'M' },
  { text: '女', value: 'F' },
];

class EmptyDataTable extends React.Component {
  optionDs = new DataSet({
    data: optionData,
    selection: 'single',
  });
  
  ds = new DataSet({
    queryFields: [
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'enable', type: 'boolean', label: '是否开启' },
      { name: 'age', type: 'number', label: '年龄' },
      {
        name: 'sex.text',
        type: 'string',
        label: '性别',
        textField: 'text',
        valueField: 'value',
        options: this.optionDs, // 下拉框组件的菜单数据集
        defaultValue: 'F',
      },
      { name: 'date.startDate', type: 'date', label: '开始日期' },
      {
        name: 'sexMultiple',
        type: 'string',
        label: '性别（多值）',
        lookupCode: 'HR.EMPLOYEE_GENDER',
        multiple: true,
      },
    ],
  });
  
  handleQuery = (props) => {
    console.log('handleQuery', props);
  }
  
  handleReset = (collapsed) => {
    console.log('handleReset', collapsed);
  }
  
  handleCollapse = () => {
    console.log('handleCollapse', props);
  }
  
  render() {
    const tableRef = React.createRef();
    return (
    <div>
      <PerformanceTable
        rowKey='id'
        virtualized
        height={400}
        toolbar={{
          header: '表格标题',
          buttons: [
            <Button
             onClick={() => {
               tableRef.current.scrollTop(0);
             }}
            >
              Scroll top
            </Button>,
            <Button
             onClick={() => {
               console.log('测试');
             }}
            >
              测试
            </Button>
          ],
          settings: [
            {icon: <Icon type='done' />, tooltip: 'ces', onClick: ()=> console.log('123'), key: 'key'},
            'columnFilter'
          ]
        }}
        queryBar={{
          type: 'professionalBar',
          defaultExpanded: true, 
          dataSet: this.ds, 
          onQuery: this.handleQuery, 
          onReset: this.handleReset,
        }}
        data={fakeLargeData.slice(0, 800)}
        ref={tableRef}
        onRowClick={data => {
          console.log(data);
        }}
      >
        <Column width={70} align="center" fixed>
          <HeaderCell>Id</HeaderCell>
          <Cell dataKey="id" />
        </Column>

        <Column sortable resizable width={130}>
          <HeaderCell>First Name</HeaderCell>
          <Cell dataKey="firstName" />
        </Column>

        <Column sortable resizable width={130}>
          <HeaderCell>Last Name</HeaderCell>
          <Cell dataKey="lastName" />
        </Column>

        <Column sortable width={200} hideable={false}>
          <HeaderCell>City</HeaderCell>
          <Cell dataKey="city" />
        </Column>

        <Column width={200} hidden>
          <HeaderCell>Street</HeaderCell>
          <Cell dataKey="street" />
        </Column>

        <Column minWidth={200} flexGrow={1}>
          <HeaderCell>Company Name</HeaderCell>
          <Cell dataKey="companyName" />
        </Column>
      </PerformanceTable>
    </div>
    );
  }
}
ReactDOM.render(
  <EmptyDataTable />,
  mountNode
);
````
