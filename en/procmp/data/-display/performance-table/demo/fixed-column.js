import React from 'react';
import ReactDOM from 'react-dom';
import { PerformanceTable } from 'choerodon-ui/pro';

class FixedColumnTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: fakeData
    };
  }
  render() {
    const columns = [
        {
          title: 'Id',
          dataIndex: 'id',
          key: 'id',
          width: 70, 
          align: "center", 
          fixed: true,
        },
        {
          title: '姓',
          dataIndex: 'lastName',
          key: 'lastName',
          width: 130, 
          fixed: true,
        },  
        {
          title: '名',
          dataIndex: 'firstName',
          key: 'firstName',
          width: 130, 
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
          width: 300,
        },
        {
          title: '邮箱',
          dataIndex: 'email',
          key: 'email',
          width: 300,
        }, 
        {
          title: 'Action',
          dataIndex: '',
          key: 'action',
          width: 300,
          fixed: 'right',
          render: ({ rowData }) => {
              function handleAction() {
                alert(`id:${rowData.id}`);
              }
              return (
                <span>
                  <a onClick={handleAction}> Edit </a> | <a onClick={handleAction}> Remove </a>
                </span>
              );
            }
        },       
      ];
    return (
      <div>
        <PerformanceTable
          height={400}
          columns={columns}
          data={this.state.data}
          onRowClick={data => {
            console.log(data);
          }}
        />
      </div>
    );
  }
}

ReactDOM.render(<FixedColumnTable />, document.getElementById('container'));
