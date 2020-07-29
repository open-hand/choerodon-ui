import React from 'react';
import ReactDOM from 'react-dom';
import { PerformanceTable } from 'choerodon-ui/pro';
import { Popover } from 'choerodon-ui';

const NameCell = ({ rowData, dataIndex }) => {
  return (
    <Popover title="Description" content={(
      <>
        <p>
          <b>Name:</b> {`${rowData.firstName} ${rowData.lastName}`}{' '}
        </p>
        <p>
          <b>Email:</b> {rowData.email}{' '}
        </p>
        <p>
          <b>Company:</b> {rowData.companyName}{' '}
        </p>
        <p>
          <b>Sentence:</b> {rowData.sentence}{' '}
        </p>
      </>
    )}>
      <a>{rowData[dataIndex].toLocaleString()}</a>
    </Popover>
  );
};

const ActionCell = ({ rowData, dataIndex }) => {
  function handleAction() {
    alert(`id:${rowData[dataIndex]}`);
    console.log(rowData, dataIndex);
  }

  return (
    <span>
      <a onClick={handleAction}> Edit </a>|<a onClick={handleAction}> Remove </a>
    </span>
  );
};

class CustomColumnTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: fakeData
    };
  }

  render() {
    const { data } = this.state;
    const columns = [
      {
        title: 'Id',
        dataIndex: 'id',
        key: 'id',
        width: 80,
        align: "center",
        fixed: true,
        render: ({rowData, dataIndex}) => NameCell({rowData, dataIndex}),
      },
      {
        title: 'firstName',
        dataIndex: 'firstName',
        key: 'firstName',
        width: 130,
        render: ({rowData, dataIndex}) => NameCell({rowData, dataIndex}),
      },
      {
        title: 'lastName',
        dataIndex: 'lastName',
        key: 'lastName',
        width: 200,
      },
      {
        title: '邮箱',
        key: 'email',
        width: 300,
        render: ({ rowData }) => <a href={`mailto:${rowData.email}`}>{rowData.email}</a>,
      },
      {
        title: 'Date',
        key: 'date',
        width: 300,
        align: "right",
        render: ({ rowData }) => <span>{rowData.date.toLocaleString()}</span>,
      },
      {
        title: 'Action',
        dataIndex: 'id',
        key: 'action',
        width: 300,
        fixed: 'right',
        render: ({rowData, dataIndex}) => ActionCell({rowData, dataIndex}),
      },
    ];
    return (
        <PerformanceTable
          height={400}
          data={data}
          columns={columns}
          headerHeight={50}
          rowHeight={rowData => {
            if (rowData.firstName === 'Janis') {
              return 30;
            }
            return 64;
          }}
        />
    );
  }
}

ReactDOM.render(<CustomColumnTable />, document.getElementById('container'));
