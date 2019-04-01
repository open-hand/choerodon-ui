import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import { DataSetSelection } from '../data-set/enum';
import Icon from '../icon';
import { ViewComponentProps } from '../core/ViewComponent';

export interface OptionProps extends ViewComponentProps {
  selection?: DataSetSelection | false;
  /**
   * 选项值
   */
  value?: any;
  level?: number;
}

export default class Option extends PureComponent<OptionProps, any> {
  static propTypes = {
    selection: PropTypes.oneOf([
      DataSetSelection.multiple,
      DataSetSelection.single,
      false,
    ]),
    /**
     * 选项值
     */
    value: PropTypes.any,
    level: PropTypes.number,
    className: PropTypes.string,
    onMouseEnter: PropTypes.func,
    onClick: PropTypes.func,
  };

  static defaultProps = {
    level: 1,
  };

  render() {
    const { children, level, selection, ...otherProps } = this.props;
    let icon;
    if (selection === DataSetSelection.multiple) {
      icon = <Icon type="check" />;
    }
    return <li {...otherProps} style={{ paddingLeft: pxToRem(level! * 12) }}>{children}{icon}</li>;
  }
}
