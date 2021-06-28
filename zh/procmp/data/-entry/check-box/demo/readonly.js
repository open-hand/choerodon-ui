import React from 'react';
import ReactDOM from 'react-dom';
import { CheckBox, DataSet, Tooltip } from 'choerodon-ui/pro';

const data = [{ rd: 'C' }];

class App extends React.Component {
  ds = new DataSet({
    fields: [{ name: 'rd', readOnly: true }],
    data,
  });

  render() {
    return (
      <div>
        <Tooltip title="disabled">
          <CheckBox name="rd" disabled>
            A
          </CheckBox>
        </Tooltip>
        <CheckBox name="rd" readOnly>
          B
        </CheckBox>
        <CheckBox dataSet={this.ds} name="rd" value="C">
          C
        </CheckBox>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
