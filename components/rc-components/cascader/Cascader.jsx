import React, { cloneElement, Component } from 'react';
import arrayTreeFilter from 'array-tree-filter';
import isEqual from 'shallowequal';
import Trigger from '../trigger';
import Icon from '../../icon';
import Menus from './Menus';
import MenusSingle from './MenusSingle';
import KeyCode from '../../_util/KeyCode';
import Locale from './locale/en_US';

export const defaultFieldNames = { label: 'label', value: 'value', children: 'children' };

const BUILT_IN_PLACEMENTS = {
  bottomLeft: {
    points: ['tl', 'bl'],
    offset: [0, 4],
    overflow: {
      adjustX: 1,
      adjustY: 1,
    },
  },
  topLeft: {
    points: ['bl', 'tl'],
    offset: [0, -4],
    overflow: {
      adjustX: 1,
      adjustY: 1,
    },
  },
  bottomRight: {
    points: ['tr', 'br'],
    offset: [0, 4],
    overflow: {
      adjustX: 1,
      adjustY: 1,
    },
  },
  topRight: {
    points: ['br', 'tr'],
    offset: [0, -4],
    overflow: {
      adjustX: 1,
      adjustY: 1,
    },
  },
};

export default class Cascader extends Component {
  static defaultProps = {
    options: [],
    onChange() {
    },
    onPopupVisibleChange() {
    },
    disabled: false,
    transitionName: '',
    prefixCls: 'rc-cascader',
    popupClassName: '',
    popupPlacement: 'bottomLeft',
    builtinPlacements: BUILT_IN_PLACEMENTS,
    expandTrigger: 'click',
    fieldNames: defaultFieldNames,
    expandIcon: <Icon type="navigate_next" />,
    menuMode: 'multiple',
    locale: Locale,
  };

  constructor(props) {
    super(props);
    let initialValue = [];
    if ('value' in props) {
      initialValue = props.value || [];
    } else if ('defaultValue' in props) {
      initialValue = props.defaultValue || [];
    }

    this.state = {
      popupVisible: props.popupVisible,
      activeValue: initialValue,
      value: initialValue,
      isTabSelected: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps && !isEqual(this.props.value, nextProps.value)) {
      const newValues = {
        value: nextProps.value || [],
        activeValue: nextProps.value || [],
      };
      // allow activeValue diff from value
      if ('loadData' in nextProps) {
        delete newValues.activeValue;
      }
      this.setState(newValues);
    }
    if ('popupVisible' in nextProps) {
      this.setState({
        popupVisible: nextProps.popupVisible,
      });
    }
  }

  getPopupDOMNode() {
    return this.trigger.getPopupDomNode();
  }

  getFieldName(name) {
    const { fieldNames, filedNames } = this.props;
    if ('filedNames' in this.props) {
      return filedNames[name] || defaultFieldNames[name]; // For old compatibility
    }
    return fieldNames[name] || defaultFieldNames[name];
  }

  getFieldNames() {
    const { fieldNames, filedNames } = this.props;
    if ('filedNames' in this.props) {
      return filedNames; // For old compatibility
    }
    return fieldNames;
  }

  getCurrentLevelOptions() {
    const { options } = this.props;
    const { activeValue = [] } = this.state;
    const valueField = this.getFieldName('value');
    const childrenField = this.getFieldName('children');
    const result = arrayTreeFilter(options,
      (o, level) => o[valueField] === activeValue[level],
      { childrenKeyName: childrenField });
    if (result[result.length - 2]) {
      return result[result.length - 2][childrenField];
    }
    return [...options].filter(o => !o.disabled);
  }

  getActiveOptions(activeValue) {
    const valueField = this.getFieldName('value');
    const childrenField = this.getFieldName('children');
    return arrayTreeFilter(this.props.options,
      (o, level) => o[valueField] === activeValue[level],
      { childrenKeyName: childrenField });
  }

  setPopupVisible = popupVisible => {
    if (!('popupVisible' in this.props)) {
      this.setState({ popupVisible });
    }
    // sync activeValue with value when panel open
    if (popupVisible && !this.state.popupVisible) {
      this.setState({
        activeValue: this.state.value,
      });
    }
    this.props.onPopupVisibleChange(popupVisible);
  };
  handleChange = (options, setProps, e) => {
    if (e.type !== 'keydown' || e.keyCode === KeyCode.ENTER) {
      const valueField = this.getFieldName('value');
      this.props.onChange(options.map(o => o[valueField]), options);
      this.setPopupVisible(setProps.visible);
    }
  };
  handlePopupVisibleChange = popupVisible => {
    this.setPopupVisible(popupVisible);
  };
  handleMenuSelect = (targetOption, menuIndex, isTabSelected = false, e) => {
    // Keep focused state for keyboard support
    const triggerNode = this.trigger.getRootDomNode();
    if (triggerNode && triggerNode.focus) {
      triggerNode.focus();
    }
    const { changeOnSelect, loadData, expandTrigger } = this.props;
    if (!targetOption || targetOption.disabled) {
      return;
    }
    let { activeValue } = this.state;
    const valueField = this.getFieldName('value');
    const childrenField = this.getFieldName('children');
    activeValue = activeValue.slice(0, menuIndex + 1);
    activeValue[menuIndex] = targetOption[valueField];
    const activeOptions = this.getActiveOptions(activeValue);
    if (targetOption.isLeaf === false && !targetOption[childrenField] && loadData) {
      if (changeOnSelect) {
        this.handleChange(activeOptions, { visible: true }, e);
      }
      this.setState({ activeValue, isTabSelected });
      loadData(activeOptions);
      return;
    }
    const newState = {};
    if (!targetOption[childrenField] || !targetOption[childrenField].length) {
      this.handleChange(activeOptions, { visible: false }, e);
      // set value to activeValue when select leaf option
      newState.value = activeValue;
      // add e.type judgement to prevent `onChange` being triggered by mouseEnter
    } else if (changeOnSelect && (e.type === 'click' || e.type === 'keydown')) {
      if (expandTrigger === 'hover') {
        this.handleChange(activeOptions, { visible: false }, e);
      } else {
        this.handleChange(activeOptions, { visible: true }, e);
      }
      // set value to activeValue on every select
      newState.value = activeValue;
    }
    newState.activeValue = activeValue;
    //  not change the value by keyboard
    if ('value' in this.props || (e.type === 'keydown' && e.keyCode !== KeyCode.ENTER)) {
      delete newState.value;
    }
    newState.isTabSelected = isTabSelected;
    this.setState(newState);
  };
  handleKeyDown = e => {
    const { children } = this.props;
    // Don't bind keyboard support when children specify the onKeyDown
    if (children && children.props.onKeyDown) {
      children.props.onKeyDown(e);
      return;
    }
    const activeValue = [...this.state.activeValue];
    const currentLevel = activeValue.length - 1 < 0 ? 0 : activeValue.length - 1;
    const currentOptions = this.getCurrentLevelOptions();
    if (
      e.keyCode !== KeyCode.DOWN &&
      e.keyCode !== KeyCode.UP &&
      e.keyCode !== KeyCode.LEFT &&
      e.keyCode !== KeyCode.RIGHT &&
      e.keyCode !== KeyCode.ENTER &&
      e.keyCode !== KeyCode.BACKSPACE &&
      e.keyCode !== KeyCode.ESC
    ) {
      return;
    }
    // Press any keys above to reopen menu
    if (
      !this.state.popupVisible &&
      e.keyCode !== KeyCode.BACKSPACE &&
      e.keyCode !== KeyCode.LEFT &&
      e.keyCode !== KeyCode.RIGHT &&
      e.keyCode !== KeyCode.ESC
    ) {
      this.setPopupVisible(true);
      return;
    }
    const valueField = this.getFieldName('value');
    const childrenField = this.getFieldName('children');
    const currentIndex = currentOptions.map(o => o[valueField]).indexOf(activeValue[currentLevel]);
    if (e.keyCode === KeyCode.DOWN || e.keyCode === KeyCode.UP) {
      let nextIndex = currentIndex;
      if (nextIndex !== -1) {
        if (e.keyCode === KeyCode.DOWN) {
          nextIndex += 1;
          nextIndex = nextIndex >= currentOptions.length ? 0 : nextIndex;
        } else {
          nextIndex -= 1;
          nextIndex = nextIndex < 0 ? currentOptions.length - 1 : nextIndex;
        }
      } else {
        nextIndex = 0;
      }
      activeValue[currentLevel] = currentOptions[nextIndex][valueField];
    } else if (e.keyCode === KeyCode.LEFT || e.keyCode === KeyCode.BACKSPACE) {
      activeValue.splice(activeValue.length - 1, 1);
    } else if (e.keyCode === KeyCode.RIGHT) {
      if (currentOptions[currentIndex] && currentOptions[currentIndex][childrenField]) {
        activeValue.push(currentOptions[currentIndex][childrenField][0][valueField]);
      }
    } else if (e.keyCode === KeyCode.ESC) {
      this.setPopupVisible(false);
      return;
    }
    if (!activeValue || activeValue.length === 0) {
      this.setPopupVisible(false);
    }
    const activeOptions = this.getActiveOptions(activeValue);
    const targetOption = activeOptions[activeOptions.length - 1];
    this.handleMenuSelect(targetOption, activeOptions.length - 1, false, e);

    if (this.props.onKeyDown) {
      this.props.onKeyDown(e);
    }
  };

  saveTrigger = node => {
    this.trigger = node;
  };

  render() {
    const {
      prefixCls,
      transitionName,
      popupClassName,
      options,
      disabled,
      builtinPlacements,
      popupPlacement,
      children,
      locale,
      menuMode,
      singleMenuStyle,
      singleMenuItemStyle,
      ...restProps
    } = this.props;
    // Did not show popup when there is no options
    let menus = <div />;
    let emptyMenuClassName = '';
    if (options && options.length > 0) {
      if (menuMode === 'multiple') {
        menus = (
          <Menus
            {...this.props}
            fieldNames={this.getFieldNames()}
            defaultFieldNames={defaultFieldNames}
            value={this.state.value}
            activeValue={this.state.activeValue}
            onSelect={this.handleMenuSelect}
            visible={this.state.popupVisible}
          />);
      } else if (menuMode === 'single') {
        menus = (
          <MenusSingle
            {...this.props}
            fieldNames={this.getFieldNames()}
            defaultFieldNames={defaultFieldNames}
            isTabSelected={this.state.isTabSelected}
            value={this.state.value}
            activeValue={this.state.activeValue}
            onSelect={this.handleMenuSelect}
            visible={this.state.popupVisible}
            locale={locale}
            singleMenuStyle={singleMenuStyle}
            singleMenuItemStyle={singleMenuItemStyle}
          />);

      } else {
        throw new Error('please use correct mode for menu ex "single" and "multiple"');
      }
    } else {
      emptyMenuClassName = ` ${prefixCls}-menus-empty`;
    }
    return (
      <Trigger
        ref={this.saveTrigger}
        {...restProps}
        options={options}
        disabled={disabled}
        popupPlacement={popupPlacement}
        builtinPlacements={builtinPlacements}
        popupTransitionName={transitionName}
        action={disabled ? [] : ['click']}
        popupVisible={disabled ? false : this.state.popupVisible}
        onPopupVisibleChange={this.handlePopupVisibleChange}
        prefixCls={`${prefixCls}-menus`}
        popupClassName={popupClassName + emptyMenuClassName}
        popup={menus}
      >
        {cloneElement(children, {
          onKeyDown: this.handleKeyDown,
          tabIndex: disabled ? undefined : 0,
        })}
      </Trigger>
    );
  }
}
