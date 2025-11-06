---
order: 20
title:
  zh-CN: 用户个性化
  en-US: Customized
---

## zh-CN

用户个性化。

## en-US

Customized.

```jsx
import React, { useMemo } from 'react';
import {
  DataSet,
  Table,
  Form,
  TextField,
  NumberField,
  SelectBox,
  Modal,
  Button,
  Icon,
  Select,
} from 'choerodon-ui/pro';
import { configure } from 'choerodon-ui';
import moment from 'moment';

configure({
  customizedRenderer: customizedRenderer,
  customizedSave: defaultCustomizedSave,
  customizedLoad: defaultCustomizedLoad,
});

function getComponentKey(component) {
  switch (component) {
    case 'Tabs':
      return 'tabs';
    case 'Modal':
      return 'modal';
    default:
      return 'table';
  }
}
function defaultCustomizedSave(code, customized, component, otherInfo) {
  console.log('全局个性化保存:', code, customized, component, otherInfo);
  if (component !== 'Table') {
    localStorage.setItem(`${getComponentKey(component)}.customized.${code}`, JSON.stringify(customized));
    return;
  }
  const {
    columnDataSet,
    params,
  } = otherInfo;
  const oldCustomized = localStorage.getItem(`${getComponentKey(component)}.customized.${code}`) || 'null';
  let newCustomized = JSON.parse(oldCustomized);
  // 自定义异步保存个性化信息, id 可能为后端生成
  if (!newCustomized || !Array.isArray(newCustomized) || newCustomized.length === 0) {
    newCustomized = [{
      ...customized,
      current: true,
      id: moment().format('yyyyMMDD-HHmmss'),
    }];
    if (params?.viewName) {
      newCustomized[0].viewName = params?.viewName;
    }
  } else if (params?.status === 'add') {
    newCustomized.forEach(item => {
      item.current = null;
    });
    newCustomized.push({
      ...customized,
      current: true,
      id: moment().format('yyyyMMDD-HHmmss'),
      viewName: params?.viewName,
    });
  } else {
    newCustomized.forEach(item => {
      item.current = null;
    });
    const index = newCustomized.findIndex(item => item.id === customized.id);
    if (index !== -1) {
      const tempCustomized = {
        ...customized,
        current: true,
      };
      if (params?.viewName) {
        tempCustomized.viewName = params?.viewName;
      }
      newCustomized.splice(index, 1, tempCustomized);
    }
  }
  localStorage.setItem(`${getComponentKey(component)}.customized.${code}`, JSON.stringify(newCustomized));
  return Promise.resolve();
}
function defaultCustomizedLoad(code, component) {
  console.log('全局个性化加载:', code, component, localStorage.getItem(`${getComponentKey(component)}.customized.${code}`));
  if (component !== 'Table') {
    return Promise.resolve(JSON.parse(localStorage.getItem(`${getComponentKey(component)}.customized.${code}`) || 'null'));
  }
  // 加载默认
  const customizedObj = JSON.parse(localStorage.getItem(`${getComponentKey(component)}.customized.${code}`) || 'null');
  let customizedTmp;
  if (Array.isArray(customizedObj)) {
    customizedTmp = customizedObj.find(item => item.current) || customizedObj[0];
  } else {
    customizedTmp = customizedObj;
  }
  return Promise.resolve(customizedTmp);
}



const saveNewTemplate = async (modal, handleOkProp) => {
  if (typeof handleOkProp === 'function') {
    // 此处自定义实现获取模板名称、是否默认等信息(可用弹窗等方式)
    // params 为自定义参数, 传递数据状态: 是否为新增、是否默认、模板名称等, 会传到 CustomizedSave 的 otherInfo.params 中
    await handleOkProp({ params: { status: 'add', viewName: moment().format('yyyyMMDD-HHmmss') } });
    // 保存后关闭弹窗
    modal.close();
  }
};

const onCustomizedSaveBefore = async (tempCustomized) => {
  console.log('onCustomizedSaveBefore: 保存前', tempCustomized);
  // 此处自定义实现获取模板名称、是否默认等信息(可用弹窗等方式)
  // params 为自定义参数, 传递数据状态: 是否为新增、是否默认、模板名称等, 会传到 CustomizedSave 的 otherInfo.params 中; 返回 false 不保存
  const viewName = moment().format('yyyyMMDD-HHmmss');
  if (!tempCustomized.viewName) {
    return Promise.resolve({ params: { viewName } });
  }
}

const onCancelBefore = () => {
  // 还原个性化信息等操作
  console.log('onCancelBefore: 取消修改前');
}

const TemplateSelect = ({ code, customized, component, otherInfo }) => {
  const {
    loadCustomized,
    getTempCustomized,
    modal,
    handleOk: handleOkProp,
    handleCancel: handleCancelProps,
  } = otherInfo;
  
  const customizedTemplateArray = useMemo(() => {
    // 自定义查询模板列表, 可能为异步
    const customizedObj = JSON.parse(localStorage.getItem(`${getComponentKey(component)}.customized.${code}`) || 'null');
    if (Array.isArray(customizedObj)) {
      return customizedObj;
    } else if (customizedObj) {
      return [customizedObj];
    }
    return [];
  }, [component, code, customized, otherInfo]);  

  const templateChange = (id) => {
    const tempCustomized = customizedTemplateArray.find(item => item.id === id);
    console.log('templateChange:', code, id, tempCustomized);
    // 切换当前个性化模板信息, 加载个性化到表格中
    if (typeof loadCustomized === 'function') {
      loadCustomized(tempCustomized);
    }
  }

  const deleteTemplate = (e, id) => {
    e.stopPropagation();
    console.log('deleteTemplate:', code, id);
    // TODO: 自定义删除模板

    // 如删除当前个性化, 需要重新加载个性化信息
    if (typeof loadCustomized === 'function') {
      // 参数为空时, 会走 customizedLoad 查询个性化
      loadCustomized();
    }
  }

  return (
    <Form labelWidth={90}>
      <Select label='个性化模板' onChange={templateChange} value={customized.id}>
        {customizedTemplateArray.map(item => (
          <Select.Option key={item.id} value={item.id || '默认'}>
            {item.viewName || '默认'}
            <Icon type="delete_black-o" onClick={(e) => deleteTemplate(e, item.id)} />
          </Select.Option>
        ))}
      </Select>
    </Form>
  );
}

function customizedRenderer(code, customized, component, otherInfo) {
  if (component === 'Table') {
    const {
      loadCustomized,
      getTempCustomized,
      modal,
      handleOk: handleOkProp,
      handleCancel: handleCancelProp,
    } = otherInfo;

    // 通过modal实例的update, 添加自定义按钮
    if (modal) {
      console.log('modal:', modal, customized, otherInfo);
      modal.update({
        footer: (okBtn, cancelBtn) => (
          <div>
            {okBtn}
            <Button color='primary' onClick={() => saveNewTemplate(modal, handleOkProp)}>另存为</Button>
            {cancelBtn}
          </div>
        ),
      });
    }
    // 返回个性化保存前钩子, 取消保存前钩子, 自定义渲染 Node
    return {
      onCustomizedSaveBefore,
      onCancelBefore,
      customRenderNode: (<TemplateSelect code={code} customized={customized} component={component} otherInfo={otherInfo} />)
    };
  }
}

const { Column } = Table;

const EditButton = (props) => {
  const handleClick = e => {
    const { record, onClick } = props;
    onClick(record, e);
  };

  return <Button funcType="flat" icon="mode_edit" onClick={handleClick} size="small" />;
};

class App extends React.Component {
  userDs = new DataSet({
    primaryKey: 'userid',
    transport: {
      read({ params: { page, pagesize } }) {
        return {
          url: `/dataset/user/page/${pagesize}/${page}`,
        };
      },
    },
    autoQuery: false,
    pageSize: 5,
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
        dynamicProps: { required: () => false }
      },
      {
        name: 'age',
        type: 'number',
        label: '年龄',
        max: 100,
        step: 1,
      },
      {
        name: 'sex',
        type: 'string',
        label: '性别',
        lookupCode: 'HR.EMPLOYEE_GENDER',
      },
      { name: 'enable', type: 'boolean', label: '是否开启' },
    ],
    events: {
      submit: ({ data }) => console.log('submit data', data),
      // query: ({dataSet, params, data}) => {
      //   console.log('query------------', params, data, !!dataSet.getState('ready'));
      //            return !!dataSet.getState('ready');
      //   },
    },
  });

  columnsDragRender = { renderIcon: () => <Icon type="open_with" /> };

  editUser = record => {
    this.openModal(record);
  };

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
        </Form>
      ),
      onOk: () => this.userDs.submit(),
      onCancel: () => {
        isCancel = true;
      },
      afterClose: () => isCancel && isNew && this.userDs.remove(record),
    });
  };

  renderEdit = ({ record }) => {
    return <EditButton onClick={this.editUser} record={record} />;
  };

  renderName = ({ text }) => {
    return new Array(3).fill(text).join(' ');
  };

  state = { customizedCode: 'customized' };

  style = { height: 'calc(100vh - 100px)' };

  handleChangeCustomized = () => {
    const { customizedCode } = this.state;
    this.setState({ customizedCode: customizedCode === 'customized' ? 'other' : 'customized' });
  };

  render() {
    const { customizedCode } = this.state;
    return (
      <>
      <Button onClick={this.handleChangeCustomized}>当前customizedCode： {customizedCode}</Button>
      <Table
        // onCustomizedLoad={(props) => {
        //   this.userDs.setState('ready', true);
        //   if (props.pageSize) {
        //     this.userDs.pageSize = Number(props.pageSize);
        //     this.userDs.currentPage = 1;
        //   }
        //   this.userDs.query(1, undefined, true);
        // }}
        customizable
        border={false}
        customizedCode={customizedCode}
        rowHeight={40}
        key="user"
        dataSet={this.userDs}
        rowDraggable
        columnDraggable
        pageSizeChangeable
        columnTitleEditable
        dragColumnAlign="left"
        columnsDragRender={this.columnsDragRender}
        style={this.style}
        buttons={['query']}
        customizedColumnProps={{ headerStyle: { background: 'gray' } }}
      >
        <Column header="组合">
          <Column header="子组合">
            <Column name="userid" title="ID" header={({ ds, name, title }) => <i>{title}</i>} tooltip="always" />
            <Column name="name" tooltip="overflow" renderer={this.renderName} />
            <Column name="sex" />
          </Column>
        </Column>
        <Column header="操作" align="center" renderer={this.renderEdit} footer="---" />
        <Column header="组合" titleEditable={false}>
          <Column name="age" help="help" sortable tooltip="always" />
          <Column name="enable" tooltip="overflow" hideable={false} />
        </Column>
      </Table>
      </>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
