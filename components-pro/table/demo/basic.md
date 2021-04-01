---
order: 0
title:
  zh-CN: 基本
  en-US: Basic
---

## zh-CN

最简单的用法。

## en-US

The most basic usage.

```jsx
import {
  DataSet,
  Table,
  NumberField,
  TextArea,
  DateTimePicker,
  SelectBox,
  Modal,
  Button,
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
    const field = record.getField('code');
    if (field) {
      const valueField = field.get('valueField');
      return `code.${valueField}`;
    }
  },
};

const codeDescriptionDynamicProps = {
  bind({ record }) {
    const field = record.getField('code');
    if (field) {
      const textField = field.get('textField');
      return `code.${textField}`;
    }
  },
};

class App extends React.Component {
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
      update: ({ data }) =>
        data.length
          ? {
            url: `/dataset/user/mutations/${data[0].userid}`,
            data: data[0],
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
        name: 'name',
        type: 'intl',
        label: '姓名',
        dynamicProps: nameDynamicProps,
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
      },
      {
        name: 'code',
        type: 'object',
        label: '代码描述',
        dynamicProps: codeDynamicProps,
        transformRequest(value) {
          // 在发送请求之前对数据进行处理
          return { v: 2 };
        },
      },
      {
        name: 'code.v',
        type: 'number',
        dynamicProps: codeDynamicProps,
        transformRequest(value) {
          return 5;
        },
      },
      {
        name: 'code.d.v',
        type: 'number',
        dynamicProps: codeDynamicProps,
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
        dynamicProps: codeCodeDynamicProps,
      },
      {
        name: 'code_description',
        dynamicProps: codeDescriptionDynamicProps,
        type: 'string',
        label: '代码描述',
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
        bind: 'codeMultiple.code',
        type: 'string',
        label: '代码（多值）',
        multiple: true,
      },
      {
        name: 'codeMultiple_description',
        bind: 'codeMultiple.description',
        type: 'string',
        label: '代码描述',
        multiple: ',',
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
      { name: 'date.endDate', type: 'time', range: true, label: '结束日期', dynamicProps: { defaultValue: () => [moment(), moment()] } },
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

  copy = () => {
    const { userDs } = this;
    const { selected } = userDs;
    if (selected.length > 0) {
      userDs.unshift(...selected.map(record => record.clone()));
    } else {
      Modal.warning('请选择记录');
    }
  };

  insert = () => {
    const { userDs } = this;
    const { selected } = userDs;
    if (selected.length > 0) {
      userDs.splice(0, 1, ...selected);
    } else {
      Modal.warning('请选择记录');
    }
  };

  importData = () => {
    const { userDs } = this;
    console.log(userDs.toJSONData());
    console.log(userDs.toJSONData(true));
    console.log(userDs.toJSONData(false, true));
    userDs.create({ other: { enemy: [{}, {}] } });
  };

  removeAllData = () => {
    this.userDs.removeAll();
  };

  deleteAllData = () => {
    this.userDs.deleteAll();
  };

  copyButton = (
    <Button icon="baseline-file_copy" onClick={this.copy} key="copy">
      复制
    </Button>
  );

  insertButton = (
    <Button icon="merge_type" onClick={this.insert} key="insert">
      插入
    </Button>
  );

  importButton = (
    <Button icon="get_app" onClick={this.importData} key="import">
      导入
    </Button>
  );

  removeAllButton = (
    <Button icon="remove_circle" onClick={this.removeAllData} key="removeAll">
      全部移除
    </Button>
  );

  deleteAllButton = (
    <Button icon="delete" onClick={this.deleteAllData} key="deleteAll">
      全部删除
    </Button>
  );

  save = () => {
    console.log('submit result', 'after click');
  };

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

  render() {
    const buttons = [
      'add',
      ['save', { afterClick: this.save }],
      ['delete', { color: 'red' }],
      'remove',
      'reset',
      'export',
      this.importButton,
      this.copyButton,
      this.insertButton,
      this.removeAllButton,
      this.deleteAllButton,
    ];
    return (
      <Table
        key="user"
        buttons={buttons}
        dataSet={this.userDs}
        autoMaxWidth
        header="User"
        style={{ height: 200 }}
        rowNumber
        parityRow
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
        <Column name="age" editor width={150} sortable footer={renderColumnFooter} />
        <Column name="email" lock editor={<AutoComplete onFocus={this.handeValueChange} onInput={this.handeValueChange} options={this.options} />} />
        <Column name="enable" editor width={50} minWidth={50} lock />
        <Column name="name" editor width={150} sortable tooltip="always" />
        <Column name="description" editor={<TextArea />} width={150} sortable />
        <Column name="code" editor width={150} sortable />
        <Column name="code_code" editor width={150} tooltip="overflow" />
        <Column name="code_select" editor width={150} />
        <Column name="codeMultiple" editor width={150} />
        <Column name="codeMultiple_code" width={150} />
        <Column name="sex" editor={<SelectBox />} width={150} />
        <Column header="性别id" renderer={sexIdRenderer} />
        <Column name="sexMultiple" editor width={150} />
        <Column name="accountMultiple" editor width={150} />
        <Column name="date.startDate" editor width={150} />
        <Column name="date.endDate" editor width={150} />
        <Column header="时间" name="time" editor={<DateTimePicker />} width={150} />
        <Column name="numberMultiple" editor width={150} minWidth={50} />
        <Column name="frozen" editor width={50} minWidth={50} lock="right" />
      </Table>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
