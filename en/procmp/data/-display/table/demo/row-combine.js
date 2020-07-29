/* eslint-disable no-plusplus */
import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, Table } from 'choerodon-ui/pro';

let needLoadFlag = true;
const rowCombineArr = [];

const transformData = (ds) => {
  const data = ds.toData();
  let currentName = null;
  let repeatNum = 0;
  let repeatStart = 0;

  for (let i = 0; i < data.length; i++) {
    const record = data[i];
    // 根据name进行合并
    const { name } = record;
    if (currentName === null) {
      currentName = name;
      repeatNum = 1;
      repeatStart = i;
      rowCombineArr[repeatStart] = 1;
    } else if (currentName === name) {
      rowCombineArr[i] = 0;
      repeatNum++;
    } else {
      currentName = null;
      rowCombineArr[repeatStart] = repeatNum;
      repeatNum = 0;
      i--;
    }
    if (i === data.length - 1) {
      rowCombineArr[repeatStart] = repeatNum;
    }
  }
  ds.loadData(data);
};

const newDataSet = {
  fields: [
    {
      name: 'name',
      type: 'string',
      label: 'name',
    },
    {
      name: 'task',
      type: 'string',
      label: 'task',
    },
  ],
  events: {
    load: ({ dataSet }) => {
      if (dataSet.records.length === 0) return;
      if (needLoadFlag) {
        needLoadFlag = false;
        transformData(dataSet);
      } else {
        needLoadFlag = true;
      }
    },
  },
};

const ds = new DataSet(newDataSet);

const columns = [
  {
    label: '姓名',
    name: 'name',
    onCell({ record }) {
      const { index } = record;
      const rowSpan = rowCombineArr[index];
      return {
        rowSpan,
        hidden: rowSpan === 0,
      };
    },
  },
  {
    label: '任务',
    name: 'task',
  },
];

class App extends React.Component {
  componentDidMount() {
    ds.loadData([
      {
        name: '彭霞',
        task: '任务1',
      },
      {
        name: '彭霞',
        task: '任务2',
      },
      {
        name: '彭霞',
        task: '任务3',
      },
      {
        name: '彩霞',
        task: '任务3',
      },
      {
        name: '彩霞',
        task: '任务4',
      },
      {
        name: '彩霞',
        task: '任务5',
      },
    ]);
  }

  render() {
    return (
      <div className="App">
        <Table dataSet={ds} columns={columns} />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
