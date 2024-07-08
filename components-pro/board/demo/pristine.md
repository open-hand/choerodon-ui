---
order: 2
title:
  zh-CN: 看板
  en-US: Board
---

## zh-CN

看板。

## en-US

Board.

```jsx
import {
  DataSet,
  Table,
  Form,
  TextField,
  NumberField,
  CheckBox,
  SelectBox,
  Modal,
  Button,
  Board
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react';


const { Column } = Table;

const codeCodeDynamicProps = {
  // 代码code_code值绑定 为 字段code 的 值列表的值字段为code.codevalue
  bind({ record }) {
    if (record) {
      const field = record.getField('code');
      if (field) {
        const valueField = field.get('valueField');
        return `code.${valueField}`;
      }
    }
  },
};

const codeDescriptionDynamicProps = {
  bind({ record }) {
    if (record) {
      const field = record.getField('code');
      if (field) {
        const textField = field.get('textField');
        return `code.${textField}`;
      }
    }
  },
};

class EditButton extends React.Component {
  handleClick = e => {
    const { record, onClick } = this.props;
    onClick(record, e);
  };

  render() {
    return <Button funcType="flat" icon="mode_edit" onClick={this.handleClick} size="small" />;
  }
}

@observer
class App extends React.Component {
    optionDs = new DataSet({
    selection: 'single',
    data: [{value: 0, meaning: '关'},{value: 1, meaning: '开'}],
    autoQuery: true,
  });

  userDs = new DataSet({
    primaryKey: 'userid',
    // transport: {
    //   read({ params: { page, pagesize } }) {
    //     return {
    //       url: `/dataset/user/page/${pagesize}/${page}`,
    //     };
    //   },
    // },
    name: 'user',
    autoQuery: true,
    combineSort: true,
    cacheSelection: true,
    pageSize: 5,
    paging: false,
    queryFields: [
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'age', type: 'number', label: '年龄' },
      { name: 'code', type: 'object', label: '代码描述', lovCode: 'LOV_CODE' },
      {
        name: 'email',
        type: 'email',
        label: '邮箱',
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
        name: 'code_code',
        type: 'string',
        label: '代码',
        maxLength: 20,
        // required: true,
        computedProps: codeCodeDynamicProps,
      },
      {
        name: 'code_description',
        computedProps: codeDescriptionDynamicProps,
        type: 'string',
        label: '代码描述',
      },
      {
        name: 'code_select',
        type: 'string',
        label: '代码描述(下拉)',
        lovCode: 'LOV_CODE',
        // required: true,
      },
      {
        name: 'codeMultiple',
        type: 'object',
        label: '代码描述（多值）',
        lovCode: 'LOV_CODE',
        multiple: true,
        // required: true,
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
        name: 'sex.text',
        type: 'string',
        label: '添加筛选',
        textField: 'text',
        valueField: 'value',
        lookupCode: 'HR.EMPLOYEE_GENDER',
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
    fields: [
      {
        name: 'userid',
        type: 'string',
        label: '编号',
        required: true,
      },
      {
        name: 'name',
        type: 'intl',
        label: '姓名',
      },
      {
        name: 'age',
        type: 'number',
        label: '年龄',
        order: 'asc',
      },
      {
        name: 'sex',
        type: 'string',
        label: '性别',
        lookupCode: 'HR.EMPLOYEE_GENDER',
        required: true,
      },
      {
        name: 'kaiguan',
        type: 'boolean',
        label: '开关',
        options: this.optionDs,
        trueValue: 1,
        falseValue: 0, 
        required: true,
      },
      {
        name: 'group',
        type: 'string',
        label: '分组',
        lookupCode: 'SYS.USER_STATUS',
      },
      { name: 'enable', type: 'boolean', label: '是否开启' },
    ],
    events: {
      submit: ({ data }) => console.log('submit data', data),
    },
  });

  openModal = (record, isNew) => {
    let isCancel = false;
    Modal.open({
      drawer: true,
      width: 600,
      children: (
        <Form record={record}>
          <TextField name="userid" />
          <TextField name="name" />
          <NumberField name="age" />
          <SelectBox name="sex" />
          <CheckBox name="enable" />
        </Form>
      ),
      onOk: () => this.userDs.submit(),
      onCancel: () => (isCancel = true),
      afterClose: () => isCancel && isNew && this.userDs.remove(record),
    });
  };

  editUser = record => {
    this.openModal(record);
  };

  renderEdit = ({ record }) => {
    return <EditButton onClick={this.editUser} record={record} />;
  };

  createUser = () => {
    this.openModal(this.userDs.create({}), true);
    // this.userDs.setState('viewVisible', false);
  };

  createButton = (
    <Button icon="playlist_add" onClick={this.createUser} key="add222">
      新增1
    </Button>
  );

  commands = ({ record, dataSet }) => {
    // record.setState('ceshi', '测试0')
    console.log('record', record);
    // record.setState('ceshi', '测试0')
    return [
    'edit',
    <Button icon="playlist_add" onClick={() => console.log('playlist_add zzzzzzzzzz')
} key="add123">
      新增
    </Button>,
    ['delete', { color: 'red' }],
  ]
  };

  // get columns() {
  //   return [
  //     { name: 'userid' },
  //     { name: 'name', editor: true },
  //     { name: 'age', sortable: true, editor: true },
  //     { name: 'sex', editor: true },
  //     { name: 'group', editor: true },
  //     { name: 'enable', editor: true },
  //     {
  //       header: "操作",
  //       width: 250,
  //       command: this.commands,
  //       lock: "right"
  //     }
  //   ];
  // }

  get columnsChilds() {
    return (
      [
        <Column name="userid" />,
        <Column name="name" sortable editor />,
        <Column name="age" sortable editor />,
        <Column name="sex" sortable editor />,
        <Column name="group" editor />,
        <Column header="操作" command={this.commands} lock="right" />,
      ]
    );
  }

  render() {
    window.ds = this.userDs;
    const buttons = [this.createButton, 'save', 'delete', 'reset', 'add'];
    return (
      <Board
        dataSet={this.userDs}
        customizable
        autoQuery
        viewVisible={this.userDs.getState('viewVisible')}
        customizedCode="board"
        onChange={(props) => {
          console.log('onChange', props, props.currentViewDS.name, props.currentViewDS.$mobx, props.record.get('viewType'))
        }}
        onConfigChange={(props) => {
          console.log('onConfigChange', props)
        }}
        renderCommand={({ command, viewMode, record, dataSet }) => {
          // console.log('viewMode', viewMode, command);
          if (viewMode === 'card') {
            // return ['delete', this.createButton];
            return command;
          }
          // return command;
        }}
        // renderButtons={({ buttons, viewMode, dataSet }) => {
        //   console.log('viewMode renderButtons', viewMode, buttons);
        //   if (viewMode === 'card') {
        //     // return ['delete', this.createButton];
        //     return buttons.slice(0, 2);
        //   }
        //   return buttons;
        // }}
        cardProps={{
          // contentRenderer: () => 123,
          cardWidth: 4,
          onClick: (e, record) => {
            console.log('crad click', e, record.toData())
          },
        }}
        tableProps={{
          searchCode: 'xxx',
          showSelectionTips: true,
          buttons,
          buttonsLimit: 3,
          // columns: this.columns,
          // children: this.columnsChilds,
          children: [
            <Column header="组合">
              <Column name="name" onCell={() => ({ style: { backgroundColor: 'red'} })}sortable editor />
              <Column name="userid" />
            </Column>,
              //             <Column name="name" onCell={() => ({ style: { backgroundColor: 'red'} })}sortable editor />,
              // <Column name="userid" />,
            <Column name="age" renderer={({text}) => text > 65 ? <span style={{ color: 'red' }}>{text}texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext</span> : text} sortable editor />,
            <Column name="sex" sortable editor />,
            <Column name="group" editor />,
            <Column header="操作" command={this.commands} lock="right" />,
          ],
          queryBar: 'filterBar',
          key: "board",
          columnDraggable: true,
          queryBarProps: {
          // fuzzyQuery: false,
          // autoQuery: false,
          // onRefresh: () => {
          //   console.log('props onRefresh');
          //   return false;
          // },
          //
          dynamicFilterBar: {
            // suffixes: [<Button icon="close" />],
            // tableFilterAdapter: 后端保存筛选项时，过滤条请求适配器，支持全局配置;  使用该功能前通常在全局配置中配置相关通用 API 适配器，开发者无需单独配置。
            tableFilterAdapter: (props) => {
              const {
                config,
                config: { data },
                type,
                searchCode,
                queryDataSet,
                tableFilterTransport,
              } = props;
              console.log('defaultTableFilterAdapter config', config);
              const userId = 1;
              const tenantId = 0;
              switch (type) {
                case 'read':
                  return {
                    // url: `read api`,
                    url:
                      'https://hzero-test.open.hand-china.com/mock/filterlist',
                    method: 'get',
                  };
                case 'create':
                  return {
                    // url: `create api`,
                    method: 'put',
                    data: data[0],
                  };
                case 'update':
                  return {
                    // url: `update api`,
                    method: 'put',
                    data: data[0],
                  };
                case 'destroy':
                  return {
                    // url: `destroy api`,
                    url:
                      'https://hzero-test.open.hand-china.com/mock/listDel',
                    data: data[0],
                    method: 'delete',
                  };
              }
            },
          },
        }
        }}
        kanbanProps={{
          cardWidth: 12,
          isDragDropDisabled: false,
          dragDropContext: (props) => {
            console.log('dragDropContext', props);
            // window.csDS = props;
            return {
              onDragStart: (props1) => console.log('dragDropContext, s', props, props1),
            };
          },
          // droppableProps: (props) => {
          //   console.log('restDroppableProps', props);
          //   return {
          //     isDropDisabled: false,
          //   };
          // },
          // draggableProps: (props) => {
          //   console.log('resdraggableProps', props);
          //   return {
          //     isDragDisabled: false,
          //   };
          // },
          allDsProps: {
            name: 'zzz',
            transport: {
              read({ params, data }) {
                const { page, pagesize } = params;
                console.log('allDsProps', params, data)
                return {
                  url: `https://hzero-test.open.hand-china.com/mock/kanbanall`,
                  method: 'get',
                };
              },
            },
          },
          columnDsProps: {
            transport: {
              read({ params, data }) {
                const { page, pagesize } = params;
                console.log('columnDsProps', params, data)
                return {
                  url: `https://hzero-test.open.hand-china.com/mock/querymore`,
                  method: 'get',
                };
              },
            },
          }
        }}
      />
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
