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
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
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
        <Card
          title="Title"
          style={{ width: 300, marginLeft: 10 }}
          selected={selected}
          onSelectChange={this.handleSelect}
          cornerPlacement="topRight"
        >
          <p>Card content</p>
          <p>Card content</p>
          <p>Card content</p>
        </Card>
        <Card
          style={{ height: 50, marginLeft: 10 }}
          selected={selected}
          onSelectChange={this.handleSelect}
          cornerPlacement="bottomLeft"
        >
          <p>small card</p>
        </Card>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
