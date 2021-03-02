---
order: 11
title:
  zh-CN: 选项异步加载
  en-US: Asynchronous lazy loading Options
---

## zh-CN

数据源选项。

## en-US

DataSet Options

```jsx
import { DataSet, TreeSelect, Row, Col } from 'choerodon-ui/pro';
import axios from 'axios';

// 这里面可以控制node结点的判断来实现是否展示为叶结点
function nodeCover({record}){
  const nodeProps = {
    title: record.get('text'),
  }
  if (record.get('text') === '岗位管理') {
    nodeProps.isLeaf = true;
  }
  return nodeProps
}


function handleDataSetChange({ record, name, value, oldValue }) {
  console.log(
    '[dataset newValue]',
    value,
    '[oldValue]',
    oldValue,
    `[record.get('${name}')]`,
    record.get(name),
  );
}

class App extends React.Component {
  optionDs = new DataSet({
    selection: 'single',
    transport: {
      read({ data: { parentId } }) {
        return {
          url: `/tree-async${parentId ? `-${parentId}` : ''}.mock`,
        }
      }
    },
    autoQuery: true,
    idField: 'id',
    parentField: 'parentId',
  });

  ds = new DataSet({
    data: [{
      functionId: 63,
      functionName: '系统配置',
    }],
    fields: [
      {
        name: 'function',
        type: 'object',
        textField: 'text',
        valueField: 'id',
        label: '用户',
        options: this.optionDs,
        ignore: 'always',
      },
      {
        name: 'functionId',
        bind: 'function.id',
      },
      {
        name: 'functionName',
        bind: 'function.text',
      }
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  handleLoadData = ({ key, children }) => {
    return new Promise(resolve => {
      if (!children) {
        axios.get(`/tree-async-${key}.mock`).then((res)=> {
          this.optionDs.appendData(res.data.rows)
          resolve();
        }).catch((err) => {
          resolve();
          return;
        });
      } else {
        resolve();
      }
    });
  };

  render() {
    return (
      <Row>
        <Col span={12}>
          <TreeSelect
            dataSet={this.ds}
            name="function"
            onOption={nodeCover}
            async
          />
        </Col>
        <Col span={12}>
          <TreeSelect
            dataSet={this.ds}
            name="function"
            onOption={nodeCover}
            loadData={this.handleLoadData}
          />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
