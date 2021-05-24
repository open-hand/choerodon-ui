---
order: 26
title:
  zh-CN: 聚合视图
  en-US: Aggregation View
---

## zh-CN

聚合视图。

## en-US

Aggregation View.

```jsx
import {
  DataSet,
  Table,
  NumberField,
  TextArea,
  DateTimePicker,
  SelectBox,
  AutoComplete,
} from 'choerodon-ui/pro';
import moment from 'moment';

const { Column } = Table;

function sexIdRenderer({ record }) {
  // 获取性别codeValueId
  return record.getField('sex').getLookupData().codeValueId;
}

function handleUserDSLoad({ dataSet }) {
  const first = dataSet.get(0);
  if (first) {
    first.selectable = false;
  }
}

function renderColumnFooter(dataset, name) {
  const max = Math.max(
    0,
    ...dataset.data.map(record => record.get(name)).filter(value => !isNaN(value)),
  );
  return `最大年龄：${NumberField.format(max)}`;
}

function renderColumnHeader(dataset, name) {
  const field = dataset.getField(name);
  return (
    <span>
      <i>-=</i>
      {field ? field.get('label') : ''}
      <i>=-</i>
    </span>
  );
}

const codeDynamicProps = {
  lovCode({ record }) {
    if (record) {
      return 'LOV_CODE';
    }
  },
};

const nameDynamicProps = {
  // 当Sex为M(男)的时候 该属性为必须输入字段 即为 field 中 require = true
  required({ record }) {
    return record.get('sex') === 'M';
  },
};

const codeCodeDynamicProps = {
  // 代码code_code值绑定 为 字段code 的 值列表的值字段为code.codevalue
  bind({ record }) {
    const field = record.get('name');
    if (field) {
      return 'codeMultiple.code';
    }
  },
};

const codeDescriptionDynamicProps = {
  bind({ record }) {
    const field = record.get('name');
    if (field) {
      return 'codeMultiple.description';
    }
  },
};

class App extends React.Component {
  state = {
    aggregation: true,
  };

  options = new DataSet({
    fields: [{
      name: 'value', type: 'string',
    }, {
      name: 'meaning', type: 'string',
    }],
  })

  userDs = new DataSet({
    primaryKey: 'userid',
    autoQuery: true,
    exportMode:'client',
    pageSize: 5,
    cacheSelection: true,
    transport: {
      read({ params: { page, pagesize } }) {
        return {
          url: `/dataset/user/page/${pagesize}/${page}`,
        };
      },
      create: {
        url: '/dataset/user/mutations',
        method: 'put',
      },
      update: ({ data: [first] }) =>
        first
          ? {
            url: `/dataset/user/mutations/${first.userid}`,
            data: first,
            transformResponse() {
              return [first];
            }
          }
          : null,
      destroy: {
        url: '/dataset/user/mutations',
        method: 'delete',
      },
      exports:{
        url:'http://gitee.com/xurime/excelize/raw/master/test/SharedStrings.xlsx',
        method:'get',
      },
      tls({ name }) {
        // 多语言数据请求的 axios 配置或 url 字符串。UI 接收的接口返回值格式为：[{ name: { zh_CN: '简体中文', en_US: '美式英语', ... }}]
        console.log('fieldName', name);
        return {
          url: '/dataset/user/languages',
        };
      },
    },
    feedback: {
      loadSuccess(resp) {
        //  DataSet 查询成功的反馈 可以return 一个resp 来修改响应结果
        console.log('loadSuccess')
      },
    },
    queryFields: [
      { name: 'enable', type: 'boolean', label: '是否开启' },
      { name: 'name', type: 'string', label: '姓名', defaultValue: 'Hugh' },
      { name: 'age', type: 'number', label: '年龄' },
      { name: 'code', type: 'object', label: '代码描述', lovCode: 'LOV_CODE' },
      { name: 'sex', type: 'string', label: '性别', lookupCode: 'HR.EMPLOYEE_GENDER' },
    ],
    fields: [
      {
        name: 'userid',
        type: 'string',
        label: '编号',
        required: true,
        unique: true, // 唯一索引或联合唯一索引组名 设置可编辑只有新增才能编辑,确保该字段或字段组唯一性
        help: '主键，区分用户',
      },
      {
        name: 'name1',
        ignore: 'always',
      },
      {
        name: 'name',
        type: 'intl',
        label: '姓名',
        computedProps: nameDynamicProps,
        bind: 'name1',
        ignore: 'clean',
      },
      {
        name: 'description',
        label: '描述',
      },
      {
        name: 'age',
        type: 'number',
        label: '年龄',
        unique: 'uniqueGroup',
        max: 100,
        step: 1,
        help: '用户年龄，可以排序',
      },
      {
        name: 'email',
        type: 'string',
        label: '邮箱',
        help: '用户邮箱，可以自动补全',
      },
      {
        name: 'numberMultiple',
        type: 'number',
        label: '数值多值',
        multiple: true,
        min: 10,
        max: 100,
        step: 0.5,
        defaultValue: [10, 100],
      },
      {
        name: 'code',
        type: 'object',
        label: '代码描述',
        computedProps: codeDynamicProps,
        transformResponse(value, data) { 
          return data
        },
        transformRequest(value) {
          // 在发送请求之前对数据进行处理
          return { v: 2 };
        },
        defaultValue: {
          code: 'HR.EMPLOYEE_STATUS',
        },
      },
      {
        name: 'code.v',
        type: 'number',
        computedProps: codeDynamicProps,
        transformRequest(value) {
          return 5;
        },
      },
      {
        name: 'code.d.v',
        type: 'number',
        computedProps: codeDynamicProps,
        transformRequest(value) {
          return 5;
        },
      },
      {
        name: 'code_code',
        type: 'string',
        label: '代码',
        maxLength: 20,
        required: true,
        bind: 'code.code',
      },
      {
        name: 'code_description',
        type: 'string',
        label: '代码描述',
        defaultValue: '员工状态2',
        bind: 'code.description',
      },
      {
        name: 'code_select',
        type: 'string',
        label: '代码描述(下拉)',
        lovCode: 'LOV_CODE',
        required: true,
      },
      {
        name: 'codeMultiple',
        type: 'object',
        label: '代码描述（多值）',
        lovCode: 'LOV_CODE',
        multiple: true,
        required: true,
      },
      {
        name: 'codeMultiple_code',
        computedProps: codeCodeDynamicProps,
        type: 'string',
        label: '代码（多值）',
        multiple: true,
        defaultValue: ['x', 'y'],
      },
      {
        name: 'codeMultiple_description',
        computedProps: codeDescriptionDynamicProps,
        type: 'string',
        label: '代码描述',
        multiple: ',',
        defaultValue: 'a,b',
      },
      {
        name: 'sex',
        type: 'string',
        label: '性别',
        lookupCode: 'HR.EMPLOYEE_GENDER',
        required: true,
      },
      {
        name: 'sexMultiple',
        type: 'string',
        label: '性别（多值）',
        lookupCode: 'HR.EMPLOYEE_GENDER',
        multiple: true,
      },
      {
        name: 'accountMultiple',
        type: 'string',
        bind: 'account.multiple',
        label: '多值拼接',
        lookupCode: 'HR.EMPLOYEE_GENDER',
        multiple: ',',
      },
      { name: 'account', type: 'object', ignore: 'always' },
      { name: 'enable', type: 'boolean', label: '是否开启', unique: 'uniqueGroup' },
      { name: 'frozen', type: 'boolean', label: '是否冻结', trueValue: 'Y', falseValue: 'N' },
      { name: 'date.startDate', type: 'date', label: '开始日期', defaultValue: new Date() },
      { name: 'date.endDate', type: 'time', range: true, label: '结束日期', computedProps: { defaultValue: () => [moment(), moment()] } },
    ],
    events: {
      selectAll: ({ dataSet }) => console.log('select all', dataSet.selected),
      indexchange: ({ record }) => console.log('current user', record),
      submit: ({ data }) => console.log('submit data', data),
      load: handleUserDSLoad,
      query: ({ params, data }) => console.log('user query parameter', params, data),
      export: ({ params, data }) => console.log('user export parameter', params, data),
      remove: ({ records }) => console.log('removed records', records),
    },
  });

  handeValueChange = (v) => {
    const value = v.target.value
    const suffixList = ['@qq.com', '@163.com', '@hand-china.com']
    if (value.indexOf('@') !== -1) {
      this.options.loadData([])
    } else {
      this.options.loadData(suffixList.map(suffix => ({
        value: `${value}${suffix}`,
        meaning: `${value}${suffix}`,
      })))
    }
  }

  handleAggregationChange(aggregation) {
    console.log('aggregation', aggregation);
  }

  render() {
    return (
      <Table
        customizable
        customizedCode="aggregation"
        key="user"
        dataSet={this.userDs}
        columnDraggable={false}
        columnTitleEditable={false}
        style={{ height: 'calc(100vh - 100px)' }}
        aggregation
        onAggregationChange={this.handleAggregationChange}
      >
        <Column
          name="userid"
          header={renderColumnHeader}
          style={{ color: 'red' }}
          tooltip="overflow"
          editor
          width={200}
          minWidth={150}
          lock
          sortable
        />
        <Column header="基本组" aggregation>
          <Column name="age" editor width={150} sortable footer={renderColumnFooter} />
          <Column name="email" lock editor={<AutoComplete onFocus={this.handeValueChange} onInput={this.handeValueChange} options={this.options} />} />
          <Column name="enable" editor width={50} minWidth={50} lock tooltip="overflow" />
          <Column name="name" editor width={150} sortable tooltip="always" />
          <Column name="description" editor={<TextArea />} width={150} sortable />
        </Column>
        <Column header="代码组" aggregation>
          <Column name="code" editor width={150} sortable />
          <Column name="code_code" editor width={150} tooltip="overflow" />
          <Column name="code_select" editor width={150} />
          <Column name="codeMultiple" editor width={150} />
          <Column name="codeMultiple_code" width={150} />
        </Column>
        <Column header="性别组" aggregation>
          <Column name="sex" editor={<SelectBox />} width={150} />
          <Column header="性别id" renderer={sexIdRenderer} />
          <Column name="sexMultiple" editor width={150} />
        </Column>
        <Column header="日期组" aggregation>
          <Column name="accountMultiple" editor width={150} />
          <Column name="date.startDate" editor width={150} />
          <Column name="date.endDate" editor width={150} />
          <Column header="时间" name="time" editor={<DateTimePicker />} width={150} />
        </Column>
        <Column name="numberMultiple" editor width={150} minWidth={50} />
        <Column name="frozen" editor width={50} minWidth={50} lock="right" />
      </Table>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
