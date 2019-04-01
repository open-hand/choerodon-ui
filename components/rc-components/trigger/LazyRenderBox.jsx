import React, { Children, Component } from 'react';
import PropTypes from 'prop-types';

export default class LazyRenderBox extends Component {
  static propTypes = {
    children: PropTypes.any,
    className: PropTypes.string,
    hidden: PropTypes.bool,
    hiddenClassName: PropTypes.string,
  };

  shouldComponentUpdate(nextProps) {
    return nextProps.hiddenClassName || !nextProps.hidden;
  }

  render() {
    const { hiddenClassName, hidden, ...props } = this.props;

    if (hiddenClassName || Children.count(props.children) > 1) {
      if (hidden && hiddenClassName) {
        props.className += ` ${hiddenClassName}`;
      }
      return <div {...props} />;
    }

    return Children.only(props.children);
  }
}
