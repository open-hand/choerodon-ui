import React from 'react';
import ReactDOM from 'react-dom';
import { Tag } from 'choerodon-ui';

const { CheckableTag } = Tag;

class MyTag extends React.Component {
  state = { checked: true };

  handleChange = checked => {
    this.setState({ checked });
  };

  render() {
    return (
      <CheckableTag {...this.props} checked={this.state.checked} onChange={this.handleChange} />
    );
  }
}

ReactDOM.render(
  <div>
    <MyTag>Tag1</MyTag>
    <MyTag>Tag2</MyTag>
    <MyTag>Tag3</MyTag>
  </div>,
  document.getElementById('container'),
);
