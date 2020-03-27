---
order: 1
title:
  zh-CN: 复杂的组合
  en-US: Complex combination
---

## zh-CN

更复杂的组合。

## en-US

Complex combination with avatar and multiple paragraphs.

```jsx
import { TextArea,Button, DataSet,Skeleton } from 'choerodon-ui/pro';
import {Avatar,Row, Col} from 'choerodon-ui'

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
  ds = new DataSet({
    autoQuery: true,
    queryUrl: '/tree.mock',
    fields: [
      {
        name: 'text',
        type: 'string',
        defaultValue: 'textarea',
      },
    ],
    events: {
      update: handleDataSetChange,
    },

  });

  render() {
    return (
      <div className="article">
      <Skeleton dataSet={this.ds} active avatar paragraph={{ rows: 4 }}>
            <Avatar style={{verticalAlign: 'top'}}    src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
            <TextArea cols={60} rows={6}  dataSet={this.ds} name="text" resize="both" />
      </Skeleton> 
      <Row>
        <Col span={24}>
        <Button onClick={() => this.ds.query() } >Show Skeleton </Button>
        </Col>
      </Row>
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
```
