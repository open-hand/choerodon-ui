import React from 'react';
import ReactDOM from 'react-dom';
import { Table, DataSet, SecretField } from 'choerodon-ui/pro';

const App = () => {
  const ds = React.useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        fields: [
          {
            name: 'secretField',
            type: 'secret',
            label: '脱敏组件查看',
            readOnly: true,
          },
          {
            name: 'secretField1',
            type: 'secret',
            label: '脱敏组件编辑',
            readOnly: false,
          },
        ],
        data: [
          {
            secretField: 't***1',
            secretField1: 't***1',
            _token: '111',
          },
          {
            secretField: 't***2',
            secretField1: 't***2',
            _token: '222',
          },
        ],
      }),
    [],
  );
  const columns = React.useMemo(
    () => [
      {
        name: 'secretField',
        editor: <SecretField />,
      },
      {
        name: 'secretField1',
        editor: <SecretField />,
      },
    ],
    [],
  );

  return <Table dataSet={ds} columns={columns} />;
};

ReactDOM.render(<App />, document.getElementById('container'));
