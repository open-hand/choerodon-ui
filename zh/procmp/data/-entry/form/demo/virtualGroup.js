import React from 'react';
import ReactDOM from 'react-dom';
import { Form, TextField, Button } from 'choerodon-ui/pro';

const { FormVirtualGroup } = Form;

class App extends React.Component {
  state = {
    showGroup: true,
    showGroup2: true,
  };

  toggleShow = () => {
    this.setState((prevState) => ({
      showGroup: !prevState.showGroup,
    }));
  };

  toggleShow2 = () => {
    this.setState((prevState) => ({
      showGroup2: !prevState.showGroup2,
    }));
  };

  render() {
    const { showGroup, showGroup2 } = this.state;
    return (
      <Form id="basic" style={{ width: '4rem' }}>
        <TextField
          label="手机号"
          labelWidth={150}
          pattern="1[3-9]\d{9}"
          name="phone"
          required
          clearButton
          addonBefore="+86"
          addonAfter="中国大陆"
        />
        {showGroup && (
          <FormVirtualGroup className="virtual-group">
            <TextField label="姓名1" />
            <TextField label="姓名2" />
            {showGroup2 && (
              <FormVirtualGroup className="virtual-group2">
                <TextField label="姓名3" />
                <TextField label="姓名4" />
                <TextField label="姓名5" />
              </FormVirtualGroup>
            )}
          </FormVirtualGroup>
        )}
        <div>
          <Button type="button" onClick={this.toggleShow}>
            切换
          </Button>
          <Button type="button" onClick={this.toggleShow2}>
            切换2
          </Button>
        </div>
      </Form>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
