import React from 'react';
import ReactDOM from 'react-dom';
import { Card } from 'choerodon-ui';

class App extends React.Component {
  state = {
    selected: true,
  };

  handleSelect = (val) => {
    this.setState({
      selected: val,
    });
  };

  render() {
    const { selected } = this.state;
    return (
      <Card
        title="Title"
        style={{ width: 300 }}
        selected={selected}
        onSelectChange={this.handleSelect}
      >
        <p>Card content</p>
        <p>Card content</p>
        <p>Card content</p>
      </Card>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
