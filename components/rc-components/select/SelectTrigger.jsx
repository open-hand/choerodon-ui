import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import Trigger from '../trigger';
import DropdownMenu from './DropdownMenu';
import { isSingleMode, saveRef } from './util';
import Spin from '../../spin';

Trigger.displayName = 'Trigger';

const BUILT_IN_PLACEMENTS = {
  bottomLeft: {
    points: ['tl', 'bl'],
    offset: [0, 4],
    overflow: {
      adjustX: 0,
      adjustY: 1,
    },
  },
  topLeft: {
    points: ['bl', 'tl'],
    offset: [0, -4],
    overflow: {
      adjustX: 0,
      adjustY: 1,
    },
  },
  bottomRight: {
    points: ['tr', 'br'],
    offset: [0, 4],
    overflow: {
      adjustX: 0,
      adjustY: 1,
    },
  },
};

export default class SelectTrigger extends Component {
  static defaultProps = {
    popupPlacement: 'bottomLeft',
    loading: false,
  };

  state = {
    dropdownWidth: null,
  };

  componentDidMount() {
    this.setDropdownWidth();
  }

  componentDidUpdate() {
    this.setDropdownWidth();
  }

  setDropdownWidth = () => {
    const width = ReactDOM.findDOMNode(this).offsetWidth;
    if (width !== this.state.dropdownWidth) {
      this.setState({ dropdownWidth: width });
    }
  };

  getInnerMenu = () => {
    return this.dropdownMenuRef && this.dropdownMenuRef.menuRef;
  };

  getFilterInput = () => {
    return this.dropdownMenuRef && this.dropdownMenuRef.filterRef;
  }

  getPopupDOMNode = () => {
    return this.triggerRef.getPopupDomNode();
  };

  getDropdownElement = newProps => {
    const props = this.props;
    let loading = props.loading;
    if (typeof loading === 'boolean') {
      loading = {
        spinning: loading,
      };
    }
    return (
      <Spin {...loading}>
        <DropdownMenu
          ref={saveRef(this, 'dropdownMenuRef')}
          {...newProps}
          prefixCls={this.getDropdownPrefixCls()}
          onMenuSelect={props.onMenuSelect}
          onMenuDeselect={props.onMenuDeselect}
          onPopupScroll={props.onPopupScroll}
          onKeyDown={props.onKeyDown}
          value={props.value}
          placeholder={props.filterPlaceholder}
          checkAll={props.checkAll}
          backfillValue={props.backfillValue}
          firstActiveValue={props.firstActiveValue}
          defaultActiveFirstOption={props.defaultActiveFirstOption}
          dropdownMenuStyle={props.dropdownMenuStyle}
          onFilterChange={props.onFilterChange}
          footer={props.footer}
          onMouseDown={props.onDropdownMouseDown}
      />
      </Spin>

    );
  };

  getDropdownTransitionName = () => {
    const props = this.props;
    let transitionName = props.transitionName;
    if (!transitionName && props.animation) {
      transitionName = `${this.getDropdownPrefixCls()}-${props.animation}`;
    }
    return transitionName;
  };

  getDropdownPrefixCls = () => {
    return `${this.props.prefixCls}-dropdown`;
  };

  render() {
    const { onPopupFocus, ...props } = this.props;
    const {
      multiple,
      visible,
      inputValue,
      dropdownAlign,
      disabled,
      showSearch,
      dropdownClassName,
      dropdownStyle,
      dropdownMatchSelectWidth,
      filter,
      filterValue,
    } = props;
    const dropdownPrefixCls = this.getDropdownPrefixCls();
    const popupClassName = {
      [dropdownClassName]: !!dropdownClassName,
      [`${dropdownPrefixCls}--${multiple ? 'multiple' : 'single'}`]: 1,
    };
    const popupElement = this.getDropdownElement({
      menuItems: props.options,
      onPopupFocus,
      multiple,
      inputValue,
      visible,
      filter,
      filterValue,
    });

    const popupStyle = { ...dropdownStyle };
    const widthProp = dropdownMatchSelectWidth ? 'width' : 'minWidth';
    if (this.state.dropdownWidth && !popupStyle[widthProp]) {
      popupStyle[widthProp] = `${this.state.dropdownWidth}px`;
    }

    return (
      <Trigger
        {...props}
        action={disabled ? [] : ['click']}
        ref={saveRef(this, 'triggerRef')}
        popupPlacement={props.popupPlacement}
        builtinPlacements={props.builtinPlacements || BUILT_IN_PLACEMENTS}
        prefixCls={dropdownPrefixCls}
        popupTransitionName={this.getDropdownTransitionName()}
        onPopupVisibleChange={props.onDropdownVisibleChange}
        popup={popupElement}
        popupAlign={dropdownAlign}
        popupVisible={visible}
        getPopupContainer={props.getPopupContainer}
        popupClassName={classnames(popupClassName)}
        popupStyle={popupStyle}
      >
        {props.children}
      </Trigger>
    );
  }
}

SelectTrigger.displayName = 'SelectTrigger';
