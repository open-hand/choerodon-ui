import React from 'react';
import ReactDOM from 'react-dom';
import { Tabs, Select } from 'choerodon-ui';

const { TabPane } = Tabs;
const { Option } = Select;

function callback(key) {
  console.log(key);
}

const App = () => {
  const [mode, setMode] = React.useState('top');

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        Tab position：
        <Select
          value={mode}
          onChange={setMode}
          dropdownMatchSelectWidth={false}
        >
          <Option value="top">top</Option>
          <Option value="bottom">bottom</Option>
          <Option value="left">left</Option>
          <Option value="right">right</Option>
        </Select>
      </div>
      <Tabs
        defaultActiveKey="1"
        onChange={callback}
        flex
        tabPosition={mode}
        style={{ height: 300 }}
      >
        <TabPane tab="Tab 1" key="1">
          <div style={{ height: 400 }}>Content of Tab Pane 1</div>
        </TabPane>
        <TabPane tab="Tab 2" key="2">
          Content of Tab Pane 2
        </TabPane>
        <TabPane tab="Tab 3" key="3">
          Content of Tab Pane 3
        </TabPane>
      </Tabs>
    </div>
  );
};
ReactDOM.render(<App />, document.getElementById('container'));
