import React, { Component } from 'react';
import getOffset from '../utils/getOffset';

export default class SuggestionPortal extends Component {
  componentWillMount() {
    this.matchDecorates(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.decoratedText !== this.props.decoratedText) {
      this.matchDecorates(nextProps);
    }
    this.updatePortalPosition(nextProps);
  }

  matchDecorates = (props) => {
    const { callbacks, suggestionRegex, decoratedText } = props;
    const matches = suggestionRegex.exec(decoratedText);
    this.trigger = matches[2];
    this.updatePortalPosition(this.props);
    callbacks.setEditorState(callbacks.getEditorState());
  };

  componentWillUnmount() {
    const { offsetKey, mentionStore } = this.props;
    mentionStore.inActiveSuggestion({ offsetKey });
  }

  updatePortalPosition(props) {
    const { offsetKey, mentionStore } = props;
    mentionStore.updateSuggestion({
      offsetKey,
      trigger: this.trigger,
      position: () => {
        const element = this.searchPortal;
        const rect = getOffset(element);
        return {
          left: rect.left,
          top: rect.top,
          width: element.offsetWidth,
          height: element.offsetHeight,
        };
      },
    });
  }

  render() {
    return (
      <span ref={(node) => {
        this.searchPortal = node;
      }} style={this.props.style}>
        {this.props.children}
      </span>
    );
  }
}
