import React, { Component, CSSProperties, FocusEvent, FocusEventHandler } from 'react';
import classNames from 'classnames';
import shallowequal from 'lodash/isEqual';
import Icon from '../icon';
import RcMention, {
  getMentions,
  Nav,
  toEditorState,
  toString,
} from '../rc-components/editor-mention';
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
    const { props } = this;
    if (!shallowequal(suggestions, props.suggestions)) {
      this.setState({
        suggestions,
      });
    }
  }

  onSearchChange = (value: string, prefix: string) => {
    const { onSearchChange } = this.props;
    if (onSearchChange) {
      return onSearchChange(value, prefix);
    }
    return this.defaultSearchChange(value);
  };

  defaultSearchChange(value: String): void {
    const searchValue = value.toLowerCase();
    const { suggestions } = this.props;
    const filteredSuggestions = (suggestions || []).filter(suggestion => {
      if (suggestion.type && suggestion.type === Nav) {
        return suggestion.props.value
          ? suggestion.props.value.toLowerCase().indexOf(searchValue) !== -1
          : true;
      }
      return suggestion.toLowerCase().indexOf(searchValue) !== -1;
    });
    this.setState({
      suggestions: filteredSuggestions,
    });
  }

  onFocus = (ev: FocusEvent<HTMLElement>) => {
    this.setState({
      focus: true,
    });
    const { onFocus } = this.props;
    if (onFocus) {
      onFocus(ev);
    }
  };

  onBlur = (ev: FocusEvent<HTMLElement>) => {
    this.setState({
      focus: false,
    });
    const { onBlur } = this.props;
    if (onBlur) {
      onBlur(ev);
    }
  };

  focus = () => {
    this.mentionEle._editor.focusEditor();
  };

  mentionRef = (ele: any) => {
    this.mentionEle = ele;
  };

  render() {
    const {
      className = '',
      prefixCls: customizePrefixCls,
      loading,
      placement,
      notFoundContent,
      onChange,
    } = this.props;
    const prefixCls = getPrefixCls('mention', customizePrefixCls);
    const { suggestions, focus } = this.state;
    const cls = classNames(className, {
      [`${prefixCls}-active`]: focus,
      [`${prefixCls}-placement-top`]: placement === 'top',
    });

    const notFound = loading ? <Icon type="loading" /> : notFoundContent;

    return (
      <RcMention
        {...this.props}
        prefixCls={prefixCls}
        className={cls}
        ref={this.mentionRef}
        onSearchChange={this.onSearchChange}
        onChange={onChange}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
        suggestions={suggestions}
        notFoundContent={notFound}
      />
    );
  }
}
