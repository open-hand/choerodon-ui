import React from 'react';
import ReactDOM from 'react-dom';
import { RichText, Switch } from 'choerodon-ui/pro';

const style = { height: 200 };

class App extends React.Component {
  state = { readOnly: true };

  handleChange = (value) => {
    this.setState({ readOnly: value });
  };


  render() {
    const { readOnly } = this.state;
    return (
      <>
        <RichText readOnly={readOnly} style={style} defaultValue={[{"insert":"readOnly"}]} />
        <Switch style={{ paddingTop: 10 }} onChange={this.handleChange} checked={readOnly}>readOnly</Switch>
      </>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));

