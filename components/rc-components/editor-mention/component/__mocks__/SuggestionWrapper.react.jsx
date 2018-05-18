import React from 'react';

export default class SuggestionWrapper extends React.Component {
  componentDidMount() {
    this.props.renderReady();
  }

  componentDidUpdate() {
    this.props.renderReady();
  }

  render() {
    return this.props.children;
  }
}
