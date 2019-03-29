import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import shallowequal from 'lodash/isEqual';
import Icon from '../icon';
import { ElementProps } from '../core/ViewComponent';

export interface ExpandIconProps extends ElementProps {
  expandable?: boolean;
  expanded?: boolean;
  onChange: (e) => void;
}

export default class ExpandIcon extends Component<ExpandIconProps> {
  static propTypes = {
    expandable: PropTypes.bool,
    expanded: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
  };

  shouldComponentUpdate(nextProps) {
    return !shallowequal(nextProps, this.props);
  }

  handleClick = (e) => {
    e.stopPropagation();
    this.props.onChange(e);
  };

  render() {
    const { prefixCls, expanded, expandable } = this.props;
    const iconPrefixCls = `${prefixCls}-expand-icon`;
    const classString = classNames(iconPrefixCls, {
      [`${iconPrefixCls}-expanded`]: expanded,
      [`${iconPrefixCls}-spaced`]: !expandable,
    });
    return (
      <Icon
        type="baseline-arrow_right"
        className={classString}
        onClick={expandable ? this.handleClick : void 0}
        tabIndex={expandable ? 0 : -1}
      />
    );
  }
}
