import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Icon from '../icon';

export interface IconItemProps {
  prefixCls?: string;
  type: string;
  active: boolean;
  onSelect: (type: string) => void;
  customFontName?: string;
}

export default class IconItem extends PureComponent<IconItemProps> {
  static displayName = 'IconItem';

  static propTypes = {
    prefixCls: PropTypes.string,
    active: PropTypes.bool.isRequired,
    type: PropTypes.string.isRequired,
    onSelect: PropTypes.func.isRequired,
    customFontName: PropTypes.string,
  };

  handleClick = () => {
    const { onSelect, type } = this.props;
    onSelect(type);
  };

  render() {
    const { prefixCls, type, active, customFontName } = this.props;
    return (
      <li className={classNames({ [`${prefixCls}-item-selected`]: active })}>
        <div onClick={this.handleClick}>
          <Icon customFontName={customFontName} type={type} />
          <p>{type}</p>
        </div>
      </li>
    );
  }
}
