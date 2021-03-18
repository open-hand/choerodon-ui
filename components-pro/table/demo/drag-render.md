---
order: 21
title:
  zh-CN: 拖拽渲染示例
  en-US: Drag Render
---

## zh-CN

可以通过rowDragRender里面方法进行对于整体的拖拽空控制，比如droppableProps，droppableProps 控制是否可以拖动和放入等，可以查看react-beautiful-dnd。这里是控制renderClone	拖拽起来的时候会在body下面新增加一个table 会在这个table注入元素	比如下面的示例可以实现在类名为c7n-pro-table-drag-container 的 table里面渲染对应的元素，这里你可以增加样式覆盖完成你想要的拖拽样式，由于拖拽使用的Fixed定位所以会导致table的长度变化，你可以根据业务修改合适的colums的宽度来让表现更加自然。renderIcon 来渲染 拖拽的自定义ICON。


## en-US

You can use the rowDragRender method to control the overall drag and drop, such as droppableProps, droppableProps control whether you can drag and drop, etc., you can check react-beautiful-dnd. Here is to control renderClone to add a new table below the body when it is dragged and inject elements into this table. For example, the following example can be implemented to render the corresponding elements in the table with the class name c7n-pro-table-drag-container. Here you can add style coverage to complete the drag-and-drop style you want. Due to the fixed positioning used by drag-and-drop, the length of the table will change. You can modify the width of the appropriate colums according to your business to make the performance more natural. renderIcon to render the drag-and-drop custom ICON.

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
} from 'choerodon-ui/pro';

const { Column } = Table;

const {TableRow} = Table;

class EditButton extends React.Component {
  handleClick = e => {
    const { record, onClick } = this.props;
    onClick(record, e);
  };

  render() {
    return <Button funcType="flat" icon="mode_edit" onClick={this.handleClick} size="small" />;
  }
}



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
    autoQuery: true,
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
        required: true,
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


  renderDragRow = (props) =>  {
     delete props.dragColumnAlign;
     return <TableRow {...props}/>
  }


  render() {
    const buttons = ['save', 'delete', 'reset'];
    return (
      <Table rowDragRender={{renderClone:this.renderDragRow}} dragColumnAlign="left" rowDraggable  key="user" buttons={buttons} dataSet={this.userDs} pristine>
        <Column name="userid" />
        <Column name="age" />
        <Column name="enable" />
        <Column name="name" />
        <Column header="操作" align="center" renderer={this.renderEdit} lock="right" />
      </Table>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
