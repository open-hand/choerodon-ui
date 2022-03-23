import React from 'react';
import ReactDOM from 'react-dom';
import { Rate } from 'choerodon-ui/pro';

class Rater extends React.Component {
  state = {
    value: 3,
  };

  handleChange = (value) => {
    this.setState({ value });
  };

  render() {
    const { value } = this.state;
    return (
      <span>
        <Rate onChange={this.handleChange} value={value} />
        {value && <span className="c7n-rate-text">{value} stars</span>}
      </span>
    );
  }
}

ReactDOM.render(<Rater />, document.getElementById('container'));
