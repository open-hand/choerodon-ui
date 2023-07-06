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
} from 'choerodon-ui/pro';

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
        onCustomizedLoad={(props) => {
          // console.log('onCustomizedLoad', props);
          this.userDs.setState('ready', true);
          if (props.pageSize) {
            this.userDs.pageSize = Number(props.pageSize);
            this.userDs.currentPage = 1;
          }
          this.userDs.query(1, undefined, true);
        }}
        style={this.style}
        buttons={['query']}
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
