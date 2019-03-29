import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createPortal, unstable_renderSubtreeIntoContainer } from 'react-dom';

const IS_REACT_16 = !!createPortal;

export default class SuggestionWrapper extends Component {
  static propTypes = {
    children: PropTypes.any,
    renderReady: PropTypes.func,
    container: PropTypes.any,
  };

  componentDidMount() {
    this.renderOrReady();
  }

  componentDidUpdate() {
    this.renderOrReady();
  }

  renderOrReady() {
    if (IS_REACT_16) {
      this.props.renderReady();
    } else {
      this.renderComponent();
    }
  }

  renderComponent() {
    const { children, container, renderReady } = this.props;
    unstable_renderSubtreeIntoContainer(
      this,
      children,
      container,
      function callback() {
        if (renderReady) {
          renderReady.call(this);
        }
      });
  }

  render() {
    if (IS_REACT_16) {
      const { children, container } = this.props;
      return createPortal(children, container);
    }
    return null;
  }
}
