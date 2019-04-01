import { Component } from 'react';

export default class SuggestionWrapper extends Component {
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
