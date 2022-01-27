import React, { Component } from 'react';
import { createPortal } from 'react-dom';

export default class SuggestionWrapper extends Component {
  componentDidMount() {
    this.renderOrReady();
  }

  componentDidUpdate() {
    this.renderOrReady();
  }

  renderOrReady() {
    this.props.renderReady();
  }

  render() {
    const { children, container } = this.props;
    return createPortal(children, container);
  }
}
