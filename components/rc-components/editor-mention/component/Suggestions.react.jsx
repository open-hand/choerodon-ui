import React, { Children, cloneElement, Component, isValidElement } from 'react';
import ReactDOM from 'react-dom';
import { decode } from 'draft-js/lib/DraftOffsetKey';
import cx from 'classnames';
import scrollIntoView from 'dom-scroll-into-view';
import Animate from '../../../animate';
import Nav from './Nav.react';
import SuggetionWrapper from './SuggestionWrapper.react';
import insertMention from '../utils/insertMention';
import clearMention from '../utils/clearMention';
import getOffset from '../utils/getOffset';
import getMentions from '../utils/getMentions';
import getSearchWord from '../utils/getSearchWord';

const isNotFalse = i => i !== false;

export default class Suggestions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isActive: false,
      focusedIndex: 0,
      container: false,
    };
  }

  componentDidMount() {
    this.props.callbacks.onChange = this.onEditorStateChange;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.suggestions.length !== this.props.suggestions.length) {
      this.setState({
        focusedIndex: 0,
      });
    }
  }

  onEditorStateChange = (editorState) => {
    const offset = this.props.store.getOffset();
    if (offset.size === 0) {
      this.closeDropDown();
      return editorState;
    }
    const selection = editorState.getSelection();

    // 修复: 焦点移出再移入时, dropdown 会闪动一下
    // 原因: https://github.com/facebook/draft-js/blob/67c5e69499e3b0c149ce83b004872afdf4180463/src/component/handlers/edit/editOnFocus.js#L33
    // 此处强制 update 了一下,因此 onEditorStateChange 会 call 两次
    if (!this.props.callbacks.getEditorState().getSelection().getHasFocus()
      && selection.getHasFocus()) {
      return editorState;
    }

    const { word } = getSearchWord(editorState, selection);
    if (!word) {
      this.closeDropDown();
      return editorState;
    }
    const selectionInsideMention = offset.map(({ offsetKey }) => {
      const { blockKey, decoratorKey, leafKey } = decode(offsetKey);
      if (blockKey !== selection.anchorKey) {
        return false;
      }
      const leaf = editorState.getBlockTree(blockKey).getIn([decoratorKey, 'leaves', leafKey]);
      if (!leaf) {
        return false;
      }
      const startKey = leaf.get('start');
      const endKey = leaf.get('end');
      // 处理只有一个 `@` 符号时的情况
      if (!word) {
        return false;
      }
      if (startKey === endKey - 1) {
        return selection.anchorOffset >= startKey + 1 && selection.anchorOffset <= endKey
          ? offsetKey
          : false;
      }
      return selection.anchorOffset > startKey + 1 && selection.anchorOffset <= endKey
        ? offsetKey
        : false;
    });

    const selectionInText = selectionInsideMention.some(isNotFalse);
    this.activeOffsetKey = selectionInsideMention.find(isNotFalse);
    const trigger = this.props.store.getTrigger(this.activeOffsetKey);

    if (!selectionInText || !selection.getHasFocus()) {
      this.closeDropDown();
      return editorState;
    }
    const searchValue = word.substring(trigger.length, word.length);
    if (this.lastSearchValue !== searchValue || this.lastTrigger !== trigger) {
      this.lastSearchValue = searchValue;
      this.lastTrigger = trigger;
      this.props.onSearchChange(searchValue, trigger);
    }
    if (!this.state.active) {
      // 暂时没有更优雅的方法
      if (!trigger || word.indexOf(trigger) !== -1) {
        this.openDropDown();
      }
    }
    return editorState;
  };

  onMentionSelect(mention, data) {
    const editorState = this.props.callbacks.getEditorState();
    const { store, onSelect } = this.props;
    const trigger = store.getTrigger(this.activeOffsetKey);
    if (onSelect) {
      onSelect(mention, data || mention);
    }
    if (this.props.noRedup) {
      const mentions = getMentions(editorState.getCurrentContent(), trigger);
      if (mentions.indexOf(`${trigger}${mention}`) !== -1) {
        // eslint-disable-next-line
        console.warn('you have specified `noRedup` props but have duplicated mentions.');
        this.closeDropDown();
        this.props.callbacks.setEditorState(
          clearMention(editorState),
        );
        return;
      }
    }
    this.props.callbacks.setEditorState(
      insertMention(editorState, `${trigger}${mention}`, data, this.props.mode)
      , true);
    this.closeDropDown();
  }

  onUpArrow = (ev) => {
    ev.preventDefault();
    if (this.props.suggestions.length > 0) {
      const newIndex = this.state.focusedIndex - 1;
      this.setState({
        focusedIndex: Math.max(newIndex, 0),
      });
    }
  };
  onBlur = (ev) => {
    ev.preventDefault();
    this.closeDropDown();
  };
  onDownArrow = (ev) => {
    ev.preventDefault();
    const newIndex = this.state.focusedIndex + 1;
    this.setState({
      focusedIndex: newIndex >= this.props.suggestions.length ? 0 : newIndex,
    });
  };

  getPositionStyle(isActive, position) {
    if (this.props.getSuggestionStyle) {
      return this.props.getSuggestionStyle(isActive, position);
    }
    const container = this.props.getSuggestionContainer ? this.state.container : document.body;
    const offset = getOffset(container);
    return position ? {
      position: 'absolute',
      left: `${position.left - offset.left}px`,
      top: `${position.top - offset.top}px`,
      ...this.props.style,
    } : {};
  }

  getContainer = () => {
    const popupContainer = document.createElement('div');
    let mountNode;
    if (this.props.getSuggestionContainer) {
      mountNode = this.props.getSuggestionContainer();
      popupContainer.style.position = 'relative';
    } else {
      mountNode = document.body;
    }
    mountNode.appendChild(popupContainer);
    return popupContainer;
  };
  handleKeyBinding = (command) => {
    return command === 'split-block';
  };
  handleReturn = (ev) => {
    ev.preventDefault();
    const selectedSuggestion = this.props.suggestions[this.state.focusedIndex];
    if (selectedSuggestion) {
      if (isValidElement(selectedSuggestion)) {
        this.onMentionSelect(selectedSuggestion.props.value, selectedSuggestion.props.data);
      } else {
        this.onMentionSelect(selectedSuggestion);
      }
      this.lastSearchValue = null;
      this.lastTrigger = null;
      return true;
    }
    return false;
  };

  openDropDown() {
    this.props.callbacks.onUpArrow = this.onUpArrow;
    this.props.callbacks.handleReturn = this.handleReturn;
    this.props.callbacks.handleKeyBinding = this.handleKeyBinding;
    this.props.callbacks.onDownArrow = this.onDownArrow;
    this.props.callbacks.onBlur = this.onBlur;
    this.setState({
      active: true,
      container: this.state.container || this.getContainer(),
    });
  }

  closeDropDown() {
    this.props.callbacks.onUpArrow = null;
    this.props.callbacks.handleReturn = null;
    this.props.callbacks.handleKeyBinding = null;
    this.props.callbacks.onDownArrow = null;
    this.props.callbacks.onBlur = null;
    this.setState({
      active: false,
    });
  }

  renderReady = () => {
    const container = this.dropdownContainer;
    if (!container) {
      return;
    }
    const { active } = this.state;
    const { activeOffsetKey } = this;
    const offset = this.props.store.getOffset();
    const dropDownPosition = offset.get(activeOffsetKey);

    if (active && dropDownPosition) {
      const placement = this.props.placement;
      const dropDownStyle = this.getPositionStyle(true, dropDownPosition.position());

      // Check if the above space is crowded
      const isTopCrowded = parseFloat(dropDownStyle.top) - window.scrollY - container.offsetHeight < 0;
      // Check if the under space is crowded
      const isBottomCrowded = (window.innerHeight || document.documentElement.clientHeight) - (parseFloat(dropDownStyle.top) - window.scrollY) - container.offsetHeight < 0;

      if (placement === 'top' && !isTopCrowded) {
        // The above space isn't crowded
        dropDownStyle.top = `${parseFloat(dropDownStyle.top) - container.offsetHeight || 0}px`;
      }

      if (placement === 'bottom' && isBottomCrowded && !isTopCrowded) {
        // The above space isn't crowded and the under space is crowded.
        dropDownStyle.top = `${parseFloat(dropDownStyle.top) - container.offsetHeight || 0}px`;
      }

      Object.keys(dropDownStyle).forEach((key) => {
        container.style[key] = dropDownStyle[key];
      });
    }

    if (!this.focusItem) {
      return;
    }
    scrollIntoView(
      ReactDOM.findDOMNode(this.focusItem),
      container, {
        onlyScrollIfNeeded: true,
      },
    );
  };
  getNavigations = () => {
    const { prefixCls, suggestions } = this.props;
    const { focusedIndex } = this.state;
    return suggestions.length ? Children.map(suggestions, (element, index) => {
      const focusItem = index === focusedIndex;
      const ref = focusItem ? (node) => {
        this.focusItem = node;
      } : null;
      const mentionClass = cx(`${prefixCls}-dropdown-item`, {
        focus: focusItem,
      });
      if (isValidElement(element)) {
        return cloneElement(element, {
          className: mentionClass,
          onMouseDown: () => this.onMentionSelect(element.props.value, element.props.data),
          ref,
        });
      }
      return (
        <Nav
          ref={ref}
          className={mentionClass}
          onMouseDown={() => this.onMentionSelect(element)}
        >
          {element}
        </Nav>
      );
    }, this) : (
      <div className={`${prefixCls}-dropdown-notfound ${prefixCls}-dropdown-item`}>
        {this.props.notFoundContent}
      </div>
    );
  };

  render() {
    const { prefixCls, className, placement } = this.props;
    const { container, active } = this.state;
    const cls = cx({
      [`${prefixCls}-dropdown`]: true,
      [`${prefixCls}-dropdown-placement-${placement}`]: true,
      ...className,
    });
    const transitionName = placement === 'top' ? 'slide-down' : 'slide-up';

    const navigations = this.getNavigations();

    return container ? (
      <SuggetionWrapper renderReady={this.renderReady} container={container}>
        <Animate transitionName={transitionName}>
          {active ? (
            <div className={cls} ref={(node) => {
              this.dropdownContainer = node;
            }}>
              {navigations}
            </div>
          ) : null}
        </Animate>
      </SuggetionWrapper>
    ) : null;
  }
}
