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
import { configure, Icon } from 'choerodon-ui';
import {
  DataSet,
  Table,
  TextField,
  NumberField,
  TextArea,
  DateTimePicker,
  Select,
  SelectBox,
  Modal,
  Button,
  AutoComplete,
} from 'choerodon-ui/pro';
import { action } from 'mobx';
import moment from 'moment';

// 导出配置
configure({
  xlsx: () => import('xlsx'),
});

const { Column } = Table;
const { Option } = Select;

function sexIdRenderer({ dataSet, record }) {
  // 获取性别codeValueId
  const value = record.get('sex') || [];
  const field = dataSet.getField('sex');
  return value.map(v => field.getLookupData(v, record).codeValueId).join(',');
}

const sexColumnTagRenderer = ({value, text, key, disabled, className}) => {
  const style = {};
  if (!disabled) {
    if (value === 'F') {
      style.backgroundColor = 'hotpink';
    } else {
      style.backgroundColor = 'skyblue';
    }
  }
  return <li className={className} key={key} style={style}>{text}</li>;
}

const sexEditorTagRenderer = ({value, text, key, disabled, readOnly, onClose, className}) => {
  const style = {};
  const closeBtn = <Icon type="close" onClick={onClose} />;
  const showClose = !(readOnly || disabled || key === "maxTagPlaceholder");
  if (!disabled) {
    if (value === 'F') {
      style.backgroundColor = 'green';
    } else {
      style.backgroundColor = 'blue';
    }
  }
  return <li className={className} key={key} style={style}>{text}{showClose ? closeBtn : null}</li>;
}

function renderPhoneEditor(record) {
  const region = (
    <Select record={record} name="phone-region" style={{ height: '.2rem' }}>
      <Option value="+81">+81</Option>
      <Option value="+00">+00</Option>
    </Select>
  );
  return <TextField addonBefore={region} addonBeforeStyle={{ border: 'none', padding: 0, maxWidth: '60px', width: '35%' }} />
}

function renderPhone({ record, text }) {
  return [record.get('phone-region'), text].filter(Boolean).join('-');
}

function renderColumnFooter({ dataSet, name }) {
  const max = Math.max(
    0,
    ...dataSet.map(record => record.get(name)).filter(value => !isNaN(value)),
  );
  return `最大年龄：${NumberField.format(max)}`;
}

function renderColumnHeader({ dataSet, name }) {
  const field = dataSet.getField(name);
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
    return record && record.get('sex') === 'M';
  },
  label() {
    return '姓名';
  },
};

const codeCodeDynamicProps = {
  // 代码code_code值绑定 为 字段code 的 值列表的值字段为code.codevalue
  bind({ record }) {
    if (record) {
      const field = record.get('name');
      if (field) {
        return 'codeMultiple.code';
      }
    }
  },
};

const codeDescriptionDynamicProps = {
  bind({ record }) {
    if (record) {
      const field = record.get('name');
      if (field) {
        return 'codeMultiple.description';
      }
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
    cacheModified: true,
    validationRules: [
      {
        name: "minLength",
        value: 7,
        message: 'Maintain at least 7 pieces of data',
      },
      {
        name: "maxLength",
        value: 10,
        message: 'A maximum of 10 pieces of data can be maintained',
      }
    ],
    transport: {
      read({ params: { page, pagesize } }) {
        if (pagesize > 20) {
          return {
            url: '/dataset/large-user/queries',
          };
        }
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
            },
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
        label: '姓名1',
        required: true,
        bind:'name',
      },
      {
        name: 'name',
        type: 'intl',
        computedProps: nameDynamicProps,
        ignore: 'clean',
        transformResponse(value) { return value && `${value}!`},
        transformRequest(value) { return value && value.replace(/!$/, '')},
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
        computedProps: {
          highlight({ record }) {
            return record.index === 0 ? { title: '提示', content: '邮箱高亮' } : false;
          },
        },
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
        multiple: ',',
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
      { name: 'phone', type: 'string', label: '手机' },
      { name: 'account', type: 'object', ignore: 'always' },
      { name: 'enable', type: 'boolean', label: '是否开启', unique: 'uniqueGroup' },
      { name: 'frozen', type: 'boolean', label: '是否冻结', trueValue: 'Y', falseValue: 'N' },
      { name: 'date.startDate', type: 'date', label: '开始日期', defaultValue: new Date() },
      { name: 'date.endDate', type: 'time', range: true, label: '结束日期', computedProps: { defaultValue: () => [moment(), moment()] } },
      { name: 'bigNumberDemo', type: 'bigNumber', step: 2, max: '12345678901234567890', min: '-12345678901234567890', label: '大数据' },
    ],
    record: {
      dynamicProps: {
        selectable: (record) => record.get('userid') !== '0',
        defaultSelected: (record) => record.get('userid') === '0',
        disabled: (record) => record.get('userid') === '0',
      },
    },
    events: {
      selectAll: ({ dataSet }) => console.log('select all', dataSet.selected),
      indexchange: ({ record }) => console.log('current user', record),
      submit: ({ data }) => console.log('submit data', data),
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
    return new Promise((resolve) => {
      setTimeout(() => {
        const { userDs } = this;
        userDs.current.set('userid', Math.random())
        console.log(userDs.toJSONData());
        console.log(userDs.toJSONData(true));
        console.log(userDs.toJSONData(false, true));
        userDs.create({ other: { enemy: [{}, {}] }, code_code: '1', code_description: 'xxx', name: 'Hugh' });
        resolve();
      }, 2000);
    });
  };

  removeAllData = () => {
    this.userDs.removeAll();
  };

  deleteAllData = () => {
    this.userDs.deleteAll();
  };

  addColumn = action(() => {
    const { userDs } = this;
    userDs.addField('code_code', {
      type: 'string',
      label: '代码',
      maxLength: 20,
      required: true,
      bind: 'code.code',
    });
    userDs.addField('code_description', {
      type: 'string',
      label: '代码描述',
      defaultValue: '员工状态2',
      bind: 'code.description',
    });
  })

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

  addColumnButton = (
    <Button icon="add" onClick={this.addColumn} key="addColumn">
      添加字段
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
      this.addColumnButton,
    ];
    return (
      <Table
        key="user"
        buttons={buttons}
        dataSet={this.userDs}
        header="User"
        style={{ maxHeight: 'calc(100vh - 400px)' }}
        showAllPageSelectionButton
        showSelectionTips
        parityRow
        summary="BASIC DEMO"
        virtual
        virtualCell
        pagination={{
          pageSizeEditable: true,
          showQuickJumper: true,
          pageSizeOptions: ['10', '20', '100', '200', '500', '1000'],
        }}
        onColumnResize={({ column, width, index }) => console.log(column, width, index)}
      >
        <Column
          name="userid"
          header={renderColumnHeader}
          style={{ color: 'red' }}
          tooltip="overflow"
          editor
          defaultWidth={200}
          minWidth={150}
          lock
          sortable
        />
        <Column name="bigNumberDemo" editor width={170} />
        <Column name="age" editor width={150} sortable footer={renderColumnFooter} />
        <Column name="email" lock editor={<AutoComplete onFocus={this.handeValueChange} onInput={this.handeValueChange} options={this.options} />} />
        <Column name="phone" lock editor={renderPhoneEditor} width={150} renderer={renderPhone} />
        <Column name="enable" editor width={50} minWidth={50} lock tooltip="overflow" />
        <Column name="name1" editor width={150} />
        <Column name="name" editor width={150} sortable tooltip="always" />
        <Column name="description" editor={<TextArea />} width={150} sortable />
        <Column name="code" editor width={150} sortable />
        <Column name="code_code" editor width={150} tooltip="overflow" />
        <Column name="code_select" editor width={150} />
        <Column name="codeMultiple" editor width={150} />
        <Column name="codeMultiple_code" width={150} />
        <>
          <Column name="sex" editor={<SelectBox />} width={150} />
          <Column header="性别id" renderer={sexIdRenderer} />
          <Column
            name="sexMultiple"
            editor={(record, name) => {
              return <Select record={record} name={name} tagRenderer={sexEditorTagRenderer} />
            }}
            width={150}
            tagRenderer={sexColumnTagRenderer}
          />
          <Column name="accountMultiple" editor width={150} />
          <Column name="date.startDate" editor width={150} />
        </>
        <fragment>
          <Column name="date.endDate" editor width={150} />
          <Column header="时间" name="time" editor={<DateTimePicker />} width={150} />
          <Column name="numberMultiple" editor width={150} minWidth={50} />
          <Column name="frozen" editor width={50} minWidth={50} lock="right" />
        </fragment>
      </Table>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
