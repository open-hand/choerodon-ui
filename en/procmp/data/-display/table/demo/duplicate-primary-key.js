import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, Table } from 'choerodon-ui/pro';

const { Column } = Table;

const dataSet = new DataSet({
  primaryKey: 'id',
  paging: false,
  data: [
    {
      id: 'duplicate-id',
      name: 'Current page record A',
      source: 'current-page-a',
    },
    {
      id: 'duplicate-id',
      name: 'Current page record B',
      source: 'current-page-b',
    },
    {
      id: 'unique-id',
      name: 'Current page record C',
      source: 'current-page-c',
    },
  ],
  fields: [
    { name: 'id', type: 'string', label: 'ID' },
    { name: 'name', type: 'string', label: 'Name' },
    { name: 'source', type: 'string', label: 'Source' },
  ],
});

function App() {
  return (
    <Table
      duplicateKey={{ disable: true, showWarning: true }}
      dataSet={dataSet}
    >
      <Column name="id" />
      <Column name="name" />
      <Column name="source" />
    </Table>
  );
}

ReactDOM.render(<App />, document.getElementById('container'));
