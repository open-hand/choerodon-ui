import React, { Component, CSSProperties, FocusEvent, FocusEventHandler } from 'react';
import classNames from 'classnames';
import shallowequal from 'lodash/isEqual';
import Icon from '../icon';
import RcMention, { getMentions, Nav, toEditorState, toString } from '../rc-components/editor-mention';
import { getPrefixCls } from '../configure';

export type MentionPlacement = 'top' | 'bottom';

export interface MentionProps {
  prefixCls?: string;
  suggestionStyle?: CSSProperties;
  suggestions?: Array<any>;
  onSearchChange?: Function;
  onChange?: Function;
  notFoundContent?: any;
  loading?: Boolean;
  style?: CSSProperties;
  defaultValue?: any;
  value?: any;
  className?: string;
  multiLines?: Boolean;
  prefix?: string;
  placeholder?: string;
  getSuggestionContainer?: (triggerNode: Element) => HTMLElement;
  onFocus?: FocusEventHandler<HTMLElement>;
  onBlur?: FocusEventHandler<HTMLElement>;
  readOnly?: boolean;
  disabled?: boolean;
  placement?: MentionPlacement;
}

export interface MentionState {
  suggestions?: Array<any>;
  focus?: Boolean;
}

export default class Mention extends Component<MentionProps, MentionState> {
  static displayName = 'Mention';
  static getMentions = getMentions;
  static defaultProps = {
    notFoundContent: '无匹配结果，轻敲空格完成输入',
    loading: false,
    multiLines: false,
    placement: 'bottom',
  };
  static Nav = Nav;
  static toString = toString;
  static toContentState = toEditorState;
  private mentionEle: any;

  constructor(props: MentionProps) {
    super(props);
    this.state = {
      suggestions: props.suggestions,
      focus: false,
    };
  }

  componentWillReceiveProps(nextProps: MentionProps) {
    const { suggestions } = nextProps;
    if (!shallowequal(suggestions, this.props.suggestions)) {
      this.setState({
        suggestions,
      });
    }
  }

  onSearchChange = (value: string, prefix: string) => {
    if (this.props.onSearchChange) {
      return this.props.onSearchChange(value, prefix);
    }
    return this.defaultSearchChange(value);
  };

  onChange = (editorState: any) => {
    if (this.props.onChange) {
      this.props.onChange(editorState);
    }
  };

  defaultSearchChange(value: String): void {
    const searchValue = value.toLowerCase();
    const filteredSuggestions = (this.props.suggestions || []).filter(
      suggestion => {
        if (suggestion.type && suggestion.type === Nav) {
          return suggestion.props.value ?
            suggestion.props.value.toLowerCase().indexOf(searchValue) !== -1
            : true;
        }
        return suggestion.toLowerCase().indexOf(searchValue) !== -1;
      },
    );
    this.setState({
      suggestions: filteredSuggestions,
    });
  }

  onFocus = (ev: FocusEvent<HTMLElement>) => {
    this.setState({
      focus: true,
    });
    if (this.props.onFocus) {
      this.props.onFocus(ev);
    }
  };
  onBlur = (ev: FocusEvent<HTMLElement>) => {
    this.setState({
      focus: false,
    });
    if (this.props.onBlur) {
      this.props.onBlur(ev);
    }
  };
  focus = () => {
    this.mentionEle._editor.focusEditor();
  };
  mentionRef = (ele: any) => {
    this.mentionEle = ele;
  };

  render() {
    const { className = '', prefixCls: customizePrefixCls, loading, placement } = this.props;
    const prefixCls = getPrefixCls('mention', customizePrefixCls);
    const { suggestions, focus } = this.state;
    const cls = classNames(className, {
      [`${prefixCls}-active`]: focus,
      [`${prefixCls}-placement-top`]: placement === 'top',
    });

    const notFoundContent = loading
      ? <Icon type="loading" />
      : this.props.notFoundContent;

    return (
      <RcMention
        {...this.props}
        prefixCls={prefixCls}
        className={cls}
        ref={this.mentionRef}
        onSearchChange={this.onSearchChange}
        onChange={this.onChange}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
        suggestions={suggestions}
        notFoundContent={notFoundContent}
      />
    );
  }
}
