import React from 'react';
import ReactDOM from 'react-dom';
import { Table, Button } from 'choerodon-ui';

const data = [{
  key: '1',
  name: 'John Brown',
  age: 32,
  address: 'New York No. 1 Lake Park',
}, {
  key: '2',
  name: 'Jim Green',
  age: 42,
  address: 'London No. 1 Lake Park',
}, {
  key: '3',
  name: 'Joe Black',
  age: 32,
  address: 'Sidney No. 1 Lake Park',
}, {
  key: '4',
  name: 'Jim Red',
  age: 32,
  address: 'London No. 2 Lake Park',
}];

function findText(value, filters) {
  const found = filters.find(filter => filter.value === value);
  return found ? found.text : value;
}

class App extends React.Component {
  state = {
    filteredInfo: { name: ['1'], address: ['a'] },
    barFilters: ['No. 1'],
    sortedInfo: null,
  }

  handleChange = (pagination, filters, sorter, barFilters) => {
    console.log('Various parameters', pagination, filters, sorter, barFilters);
    this.setState({
      filteredInfo: filters,
      sortedInfo: sorter,
      barFilters,
    });
  }

  clearFilters = () => {
    this.setState({ filteredInfo: null });
  }

  clearAll = () => {
    this.setState({
      filteredInfo: null,
      sortedInfo: null,
    });
  }

  setAgeSort = () => {
    this.setState({
      sortedInfo: {
        order: 'descend',
        columnKey: 'age',
      },
    });
  }

  render() {
    let { sortedInfo, filteredInfo, barFilters } = this.state;
    sortedInfo = sortedInfo || {};
    filteredInfo = filteredInfo || {};
    barFilters = barFilters || [];
    const columns = [{
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      filters: [
        { text: 'Joe', value: '1' },
        { text: 'Jim', value: '2' },
      ],
      filteredValue: filteredInfo.name || null,
      onFilter: (value, record, filters) => record.name.includes(findText(value, filters)),
      sorter: (a, b) => a.name.length - b.name.length,
      sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
    }, {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
      sorter: (a, b) => a.age - b.age,
      sortOrder: sortedInfo.columnKey === 'age' && sortedInfo.order,
    }, {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      filters: [
        { text: 'London', value: 'a' },
        { text: 'New York', value: 'b' },
        { text: 'New York1', value: 'c' },
        { text: 'New York2', value: 'd' },
        { text: 'New York3', value: 'e' },
        { text: 'New York4', value: 'f' },
        { text: 'New York5', value: 'g' },
        { text: 'New York6', value: 'h' },
        { text: 'New York7', value: 'i' },
        { text: 'New York8', value: 'j' },
        { text: 'New York9', value: 'k' },
      ],
      filterMultiple: true,
      filteredValue: filteredInfo.address || null,
      onFilter: (value, record, filters) => record.address.includes(findText(value, filters)),
      sorter: (a, b) => a.address.length - b.address.length,
      sortOrder: sortedInfo.columnKey === 'address' && sortedInfo.order,
    }];
    return (
      <div>
        <div className="table-operations">
          <Button onClick={this.setAgeSort}>Sort age</Button>
          <Button onClick={this.clearFilters}>Clear filters</Button>
          <Button onClick={this.clearAll}>Clear filters and sorters</Button>
        </div>
        <Table columns={columns} dataSource={data} onChange={this.handleChange} filters={barFilters} />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
