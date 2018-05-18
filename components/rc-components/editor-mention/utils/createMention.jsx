import React from 'react';
import Suggestions from '../component/Suggestions.react';
import SuggestionPortal from '../component/SuggestionPortal.react';
import MentionContent from '../component/MentionContent.react';
import mentionStore from '../model/mentionStore';
import exportContent from './exportContent';
import getRegExp from '../utils/getRegExp';

function findWithRegex(regex, contentBlock, callback) {
  // Get the text from the contentBlock
  const text = contentBlock.getText();
  let matchArr;
  let start; // eslint-disable-line
  // Go through all matches in the text and return the indizes to the callback
  while ((matchArr = regex.exec(text)) !== null) { // eslint-disable-line
    start = matchArr.index;
    callback(start, start + matchArr[0].length);
  }
}

function mentionContentStrategy(contentBlock, callback, contentState) {
  contentBlock.findEntityRanges((character) => {
    const entityKey = character.getEntity();
    return entityKey && contentState.getEntity(entityKey).getType() === 'mention';
  }, callback);
}

function noop() {}

const MentionContentComponent = (props) => {
  const { entityKey, tag, callbacks } = props;
  const contentState = callbacks.getEditorState().getCurrentContent();
  const data = contentState.getEntity(entityKey).getData();
  return React.createElement(tag, { ...props, data });
};

export default function createMention(config = {}) {
  const callbacks = {
    onChange: noop,
    onUpArrow: noop,
    onDownArrow: noop,
    getEditorState: noop,
    setEditorState: noop,
    handleReturn: noop,
    onBlur: noop,
  };
  const componentProps = {
    callbacks,
    mentionStore,
  };
  const suggestionRegex = getRegExp(config.prefix);

  const tag = config.tag || MentionContent;
  const decorators = [{
    strategy: (contentBlock, callback) => {
      findWithRegex(suggestionRegex, contentBlock, callback);
    },
    component: props => (<SuggestionPortal
      {...props}
      {...componentProps}
      style={config.mentionStyle}
      suggestionRegex={getRegExp(config.prefix)}
    />),
  }];
  if (config.mode !== 'immutable') {
    decorators.unshift({
      strategy: mentionContentStrategy,
      component: props => <MentionContentComponent tag={tag} {...props} callbacks={callbacks} />,
    });
  }

  return {
    name: 'mention',
    Suggestions: props => (<Suggestions {...props}
      {...componentProps}
      store={mentionStore}
    />),
    decorators,
    onChange: (editorState) => {
      return callbacks.onChange ? callbacks.onChange(editorState) : editorState;
    },
    callbacks,
    export: exportContent,
  };
}
