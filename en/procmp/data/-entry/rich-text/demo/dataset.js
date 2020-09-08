import React from 'react';
import ReactDOM from 'react-dom';
import { RichText, DataSet, Button } from 'choerodon-ui/pro';

const style = { height: 200 };

const defaultValue = [{ 'insert': 'defaultValue' }];

class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      { name: 'content', type: 'object', defaultValue, required: true },
    ],
  });

  toData = () => {
    console.log('toData', this.ds.toData());
  };

  toJSONData = () => {
    console.log('toJSONData', this.ds.toJSONData());
  };

  getRecord = () => {
    console.log('getRecord toData', this.ds.current.get('content'));
  };

  setRecord = () => {
    this.ds.current.set('content', [{ 'insert': 'set value' }]);
    // set string 类型值会被转为 Delta 对象，并出现 type 类型转换 warning
    // this.ds.current.set('content',"set string value");
  };

  handleChange = (value, oldValue) => {
    console.log('handleChange', value, oldValue);
  };

  render() {
    return <>
      <div style={{ marginBottom: 10 }}>
        <Button style={{ marginRight: 10 }} onClick={this.toJSONData} key="toJSONData">
          toJSONData
        </Button>
        <Button style={{ marginRight: 10 }} onClick={this.toData} key="toData">
          toData
        </Button>
        <Button style={{ marginRight: 10 }} onClick={this.setRecord} key="setRecord">
          setRecord
        </Button>
        <Button style={{ marginRight: 10 }} onClick={this.getRecord} key="getRecord">
          getRecord
        </Button>
      </div>
      <RichText onChange={this.handleChange} dataSet={this.ds} name="content" style={style} />
    </>;
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
