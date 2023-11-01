---
order: 11
title:
  zh-CN: 可编辑行
  en-US: Editable Table Row
---

## zh-CN

带行编辑功能的表格。

## en-US

Tables with row editing.

````jsx

import { PerformanceTable, TextField } from 'choerodon-ui/pro';
import fakeData from '../../../site/theme/mock/performance-data/fakeLargeData.json';

const { Column, HeaderCell, Cell, Row, CellGroup } = PerformanceTable;

const EditableBodyCell = (props) => {
  const {editId, rowData} = props;

  return (
    <Cell {...props}>
      {rowData.id === editId ? <TextField defaultValue={props.rowData[props.dataKey]} onChange={(value)=>props.handleChange(value, props.dataKey, rowData.id)} /> : props.rowData[props.dataKey]}
    </Cell>
  );
  
};

const ActionCell = ({ rowData, onClick }) => {
  return (
    <a
      disabled={rowData.status === 'SAVED'}
      onClick={() => {
        onClick && onClick(rowData.id);
      }}
    >
      {rowData.status === 'EDIT' ? 'Save' : 'Edit'}
    </a>
  );
};

class Table extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: fakeData.filter((item, index) => index < 10),
      editId: null,
      editRecord: {},
    };
    // this.handleChange = this.handleChange.bind(this);
    this.handleEditState = this.handleEditState.bind(this);
  }
  
  handleChange(value, key, id) {
    const { data } = this.state;
    const activeItem = data.find((item) => item.id === id);
    activeItem[key] = value;
    const editRecord = activeItem;
    this.setState({
      editRecord,
    })
  }

  handleEditState(id) {
    const { data,editRecord } = this.state;
    // 可使用 _.clone
    const nextData = [...data];
    const activeItem = nextData.find((item) => item.id === id);
    // 
    if( activeItem.status === 'EDIT'){
      // 保存
      activeItem.status = '';
      const newData = nextData.map(x=>{
        if(x.id === editRecord.id){
          return editRecord
        }
        return {...x, status: ''}
      })
      this.setState({
        editId: null,
        data: newData,
      }); 
    } else {
      activeItem.status = 'EDIT';
      const newData = nextData.map(x=>{
        if(x.id === activeItem.id){
          return activeItem
        }
        return {...x, status: 'SAVED'}
      })
      this.setState({
        editId: id,
        data: newData,
      }); 
    }
  }

  render() {
    const { data } = this.state;
    const columns = [
      {
        title: '姓',
        dataIndex: 'lastName',
        key: 'lastName',
        width: 200,
        fixed: true,
      },
      {
        title: '名',
        dataIndex: 'firstName',
        key: 'firstName',
        width: 300,
      },
      {
        title: '邮箱',
        dataIndex: 'email',
        key: 'email',
        width: 200,
      },
      {
        title: 'Action',
        dataIndex: 'Action',
        key: 'Action',
        flexGrow: 1,
        render: ({ rowData }) =>
          ActionCell({ rowData, onClick: this.handleEditState }),
      },
    ];

    return (
      <PerformanceTable 
        height={400} 
        data={data} 
        columns={columns} 
        rowHeight={40}
        components={{
          body: {
            cell: <EditableBodyCell editId={this.state.editId} handleChange={(value, key, id)=>this.handleChange(value, key, id)} />,
          }
        }}
      />
    );
  }
}


ReactDOM.render(<Table />,
  mountNode
);
````
