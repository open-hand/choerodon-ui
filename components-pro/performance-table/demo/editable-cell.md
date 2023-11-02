---
order: 10
title:
  zh-CN: 可编辑单元格
  en-US: Editable Table Cell
---

## zh-CN

带单元格编辑功能的表格。

## en-US

Tables with cell editing capabilities.

````jsx
import { PerformanceTable, TextField } from 'choerodon-ui/pro';
import fakeData from '../../../site/theme/mock/performance-data/fakeLargeData.json';

const { Column, HeaderCell, Cell, Row, CellGroup } = PerformanceTable;

const EditableBodyCell = (props) => {
 const {editId, rowData, editCell} = props;

  return (
    <Cell {...props}>
      {
        rowData.id === editCell.id && props.dataKey === editCell.key? 
        <TextField 
          defaultValue={props.rowData[props.dataKey]} 
          onChange={(value)=>props.handleChange(value, props.dataKey, rowData.id)} 
          autoFocus 
          required
          onBlur={props.handleBlur} 
        /> : 
       <div onClick={()=>props.handlePreEdit(rowData.id ,props.dataKey)} className="edit-border">{props.rowData[props.dataKey]}</div>
      }
    </Cell>
  );
};

class Table extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: fakeData.filter((item, index) => index < 10),
      editCell: {},
    };
  }
  
  handleChange(value, key, id) {
    const { data } = this.state;
    const findData = data.find(x=>x.id === id);
    findData[key] = value;
    this.setState({
      editCell: {},
      data,
    }); 
  }


  handleEdit=(id, key)=>{
    this.setState({
      editCell: {id, key},
    })
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
        title: '城市',
        dataIndex: 'city',
        key: 'city',
        width: 200,
      },
      {
        title: '街道',
        dataIndex: 'street',
        key: 'street',
        width: 200,
      },
      {
        title: '公司',
        dataIndex: 'companyName',
        key: 'companyName',
        width: 200,
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
            cell: <EditableBodyCell 
                  editCell={this.state.editCell}
                  handleChange={(value, key, id)=>this.handleChange(value, key, id)}
                  handlePreEdit={(id, key)=>this.handleEdit(id, key)}
                  handleBlur={()=>this.setState({editCell: {}})}
                />,
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

```css
.edit-border {
  height: 36px;
  width: 100%;
  margin-top: 2px;
}
.edit-border:hover{
    border: 1px solid #d6d6d6;
    height: 36px;
    width: 100%;
    margin-top: 2px;
}
```
