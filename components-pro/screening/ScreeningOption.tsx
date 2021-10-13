import React, { Component, Key } from 'react';
import classNames from 'classnames';
import Col, { ColProps } from 'choerodon-ui/lib/col';
import noop from 'lodash/noop';
import CheckBox from 'choerodon-ui/lib/checkbox';
import { ElementProps } from '../core/ViewComponent';
import Record from '../data-set/Record';

export interface Info {
  key: string | number | undefined;
  value: any | Record;
}

export interface ColSize {
  span?: number;
  order?: number;
  offset?: number;
  push?: number;
  pull?: number;
}

export type ScreeningOptionProps = Omit<ElementProps, "lang" | "spellCheck"> & ColProps & {
  optionkey?: Key;
  selectedKeys?: Array<string | number | undefined>;
  onSelect?: (info: Info) => void;
  onClick?: (info: Info) => void;
  onDeselect?: (info: Info) => void;
  onMouseEnter?: (info: Info) => void;
  onMouseLeave?: (info: Info) => void;
  onMouseDown?: (info: Info) => void;
  disabled?: boolean;
  children?: React.ReactElement<any> | string;
  active?: boolean;
  multiple?: boolean;
  isSelected?: boolean;
  value?: any | Record;
  optionRender: React.ReactElement<any> | string;
}

export default class ScreeningOption extends Component<ScreeningOptionProps> {

  static displayName: 'ScreeningOption';

  static defaultProps = {
    onSelect: noop,
    onMouseEnter: noop,
    onMouseLeave: noop,
    onMouseDown: noop,
    isSelected: false,
  };

  onMouseLeave = () => {
    const { optionkey, value, onMouseLeave } = this.props;
    const info: Info = {
      key: optionkey,
      value,
    };
    if (onMouseLeave) {
      onMouseLeave(info);
    }
  };

  onMouseEnter = () => {
    const { optionkey, value, onMouseEnter } = this.props;
    const info: Info = {
      key: optionkey,
      value,
    };
    if (onMouseEnter) {
      onMouseEnter(info);
    }
  };

  onClick = () => {
    const { optionkey, multiple, onClick, onSelect, onDeselect, value, isSelected } = this.props;
    const info: Info = {
      key: optionkey,
      value,
    };

    if (onSelect && onClick) {
      onClick(info);
      if (multiple) {
        if (isSelected && onDeselect) {
          onDeselect(info);
        } else {
          onSelect(info);
        }
      } else {
        onSelect(info);
      }
    }
  };

  render() {
    const {
      prefixCls,
      disabled,
      children,
      optionkey,
      active,
      style,
      multiple,
      onMouseDown,
      isSelected,
      span,
      order,
      offset,
      push,
      pull,
      xs,
      sm,
      md,
      lg,
      xl,
      xxl,
      optionRender,
    } = this.props;
    const ScreeningOptionPrefix = `${prefixCls}-option`
    const className = classNames(
      ScreeningOptionPrefix,
      {
        [`${ScreeningOptionPrefix}-disabled`]: disabled,
        [`${ScreeningOptionPrefix}-selected`]: isSelected,
        [`${ScreeningOptionPrefix}-active`]: active,
      },
    );

    const attrs = {
      optionkey,
      className,
      span,
      order,
      offset,
      push,
      pull,
      xs,
      sm,
      md,
      lg,
      xl,
      xxl,
    };
    let mouseEvent = {};
    if (!disabled) {
      mouseEvent = {
        onClick: this.onClick,
        onMouseLeave: this.onMouseLeave,
        onMouseEnter: this.onMouseEnter,
        onMouseDown,
      };
    }

    const checkbox = multiple ? <CheckBox checked={isSelected} /> : null;

    return (
      <Col
        {...attrs}
        style={style}
      >
        <div className={`${ScreeningOptionPrefix}-content`} {...mouseEvent}>
          {
            optionRender || (
              <>
                {checkbox}
                {children}
              </>
            )
          }
        </div>
      </Col>
    );
  }
}