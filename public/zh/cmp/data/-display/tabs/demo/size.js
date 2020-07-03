import React from 'react';
import ReactDOM from 'react-dom';
import { Tabs, Radio } from 'choerodon-ui';

const { TabPane } = Tabs;

class Demo extends React.Component {
  state = { size: 'small' };

  onChange = e => {
    this.setState({ size: e.target.value });
  };

  render() {
    const { size } = this.state;
    return (
      <div>
        <Radio.Group value={size} onChange={this.onChange} style={{ marginBottom: 16 }}>
          <Radio.Button value="small">Small</Radio.Button>
          <Radio.Button value="default">Default</Radio.Button>
          <Radio.Button value="large">Large</Radio.Button>
        </Radio.Group>
        <Tabs defaultActiveKey="1" size={size}>
          <TabPane tab="Tab 1" key="1">
            Content of tab 1
          </TabPane>
          <TabPane tab="Tab 2" key="2">
            Content of tab 2
          </TabPane>
          <TabPane tab="Tab 3" key="3">
            Content of tab 3
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

ReactDOM.render(<Demo />, document.getElementById('container'));
