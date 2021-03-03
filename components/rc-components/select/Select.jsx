/* eslint func-names: 1 */
import Set from 'core-js/library/fn/set';
import React, { Children, cloneElement, Component } from 'react';
import { unmountComponentAtNode } from 'react-dom';
import classnames from 'classnames';
import classes from 'component-classes';
import warning from '../../_util/warning';
import noop from 'lodash/noop';
import KeyCode from '../../_util/KeyCode';
import childrenToArray from '../util/Children/toArray';
import { Item as MenuItem, ItemGroup as MenuItemGroup } from '../menu';
import Option from './Option';
import Button from '../../button';
import Ripple from '../../ripple';

import {
  defaultFilterFn,
  findFirstMenuItem,
  findIndexInValueBySingleValue,
  getLabelFromPropsValue,
  getMapKey,
  getPropValue,
  getValuePropValue,
  includesSeparators,
  isCombobox,
  isMultiple,
  isMultipleOrTags,
  isMultipleOrTagsOrCombobox,
  isSingleMode,
  isTags,
  preventDefaultEvent,
  saveRef,
  splitBySeparators,
  toArray,
  UNSELECTABLE_ATTRIBUTE,
  UNSELECTABLE_STYLE,
  validateOptionValue,
} from './util';
import SelectTrigger from './SelectTrigger';
import { SelectPropTypes } from './PropTypes';

function chaining(...fns) {
  return function (...args) { // eslint-disable-line
    // eslint-disable-line
    for (let i = 0; i < fns.length; i++) {
      if (fns[i] && typeof fns[i] === 'function') {
        fns[i].apply(this, args);
      }
    }
  };
}

const BUILT_IN_PLACEMENTS = {
  bottomLeft: {
    points: ['tl', 'tl'],
    offset: [0, 4],
    overflow: {
      adjustX: 0,
      adjustY: 1,
    },
  },
  topLeft: {
    points: ['bl', 'bl'],
    offset: [0, -4],
    overflow: {
      adjustX: 0,
      adjustY: 1,
    },
  },
  bottomRight: {
    points: ['tr', 'tr'],
    offset: [0, 4],
    overflow: {
      adjustX: 0,
      adjustY: 1,
    },
  },
};

const BUILT_IN_PLACEMENTS_LABEL = {
  bottomLeft: {
    points: ['tl', 'tl'],
    offset: [0, 19],
    overflow: {
      adjustX: 0,
      adjustY: 1,
    },
  },
  topLeft: {
    points: ['bl', 'bl'],
    offset: [0, -4],
    overflow: {
      adjustX: 0,
      adjustY: 1,
    },
  },
  bottomRight: {
    points: ['tr', 'tr'],
    offset: [0, 19],
    overflow: {
      adjustX: 0,
      adjustY: 1,
    },
  },
};

export default class Select extends Component {
  static propTypes = SelectPropTypes;

  static defaultProps = {
    blurChange: true,
    prefixCls: 'rc-select',
    defaultOpen: false,
    labelInValue: false,
    defaultActiveFirstOption: true,
    showSearch: true,
    allowClear: false,
    onInput: noop,
    onChange: noop,
    onFocus: noop,
    onBlur: noop,
    onSelect: noop,
    onSearch: noop,
    onDeselect: noop,
    onInputKeyDown: noop,
    onChoiceItemClick: noop,
    onClear: noop,
    showArrow: true,
    dropdownMatchSelectWidth: true,
    dropdownStyle: {},
    dropdownMenuStyle: {},
    optionFilterProp: 'value',
    optionLabelProp: 'value',
    notFoundContent: 'Not Found',
    backfill: false,
    tokenSeparators: [],
    showNotFindInputItem: true,
    showNotFindSelectedItem: true,
    placeholder: '',
    label: '',
    filterPlaceholder: 'Input for filter',
    showCheckAll: true,
    loading: false,
    border: true,
  };

  needExpand = true;

  constructor(props) {
    super(props);
    const value = this.getValueFromProps(props);
    const optionsInfo = this.getOptionsInfoFromProps(props);
    let inputValue = '';
    if (props.combobox) {
      inputValue = value.length
        ? this.getLabelBySingleValue(value[0], optionsInfo)
        : '';
    }
    let open = props.open;
    if (open === undefined) {
      open = props.defaultOpen;
    }
    const filterValue = props.filterValue || '';
    this.state = {
      value,
      inputValue,
      open,
      optionsInfo,
      filterValue,
    };
    this.adjustOpenState();
  }

  componentDidMount() {
    if (this.props.autoFocus) {
      this.focus();
    }
  }

  componentWillReceiveProps = nextProps => {
    const optionsInfo = this.getOptionsInfoFromProps(nextProps);
    this.setState({
      optionsInfo,
    });
    if ('value' in nextProps) {
      const value = this.getValueFromProps(nextProps);
      this.setState({
        value,
      });
      if (nextProps.combobox) {
        this.setState({
          inputValue: value.length
            ? this.getLabelBySingleValue(value[0], optionsInfo)
            : '',
        });
      }
    }
    if ('filterValue' in nextProps) {
      this.setState({
        filterValue: nextProps.filterValue,
      });
    }
  };

  componentWillUpdate(nextProps, nextState) {
    this.props = nextProps;
    this.state = nextState;
    this.adjustOpenState();
  }

  componentDidUpdate() {
    if (isMultipleOrTags(this.props)) {
      const inputNode = this.getInputDOMNode();
      const mirrorNode = this.getInputMirrorDOMNode();
      if (inputNode.value) {
        inputNode.style.width = '';
        inputNode.style.width = `${mirrorNode.clientWidth}px`;
      } else {
        inputNode.style.width = '';
      }
      this.onChoiceAnimationLeave();
    }
  }

  componentWillUnmount() {
    this.clearFocusTime();
    this.clearBlurTime();
    this.clearAdjustTimer();
    if (this.dropdownContainer) {
      unmountComponentAtNode(this.dropdownContainer);
      document.body.removeChild(this.dropdownContainer);
      this.dropdownContainer = null;
    }
  }

  onFilterChange = (val = '') => {
    const { onFilterChange } = this.props;
    this.onInputValueChange(val);
    this.setState({
      filterValue: val,
    });
    if (onFilterChange) {
      onFilterChange(val);
    }
  };

  onInputValueChange = (val) => {
    const { tokenSeparators, onInput } = this.props;
    onInput(val);
    if (
      isMultipleOrTags(this.props) &&
      tokenSeparators.length &&
      includesSeparators(val, tokenSeparators)
    ) {
      const nextValue = this.getValueByInput(val);
      if (nextValue !== undefined) {
        this.fireChange(nextValue);
      }
      this.setOpenState(false, true);
      this.setInputValue('', false);
      return;
    }
    this.setInputValue(val);
    this.setState({
      open: true,
    });
    if (isCombobox(this.props)) {
      this.fireChange([val]);
    }
  };

  onInputChange = (event) => {
    const val = event.target.value;
    this.onInputValueChange(val);
  };

  onDropdownVisibleChange = open => {
    const { filter } = this.props;
    if (this.needExpand) {
      if (open && !this._focused) {
        this.clearBlurTime();
        this.timeoutFocus();
        this._focused = true;
        this.updateFocusClassName();
      }
      if (filter) {
        this.onFilterChange('');
      }
      if (open && filter) {
        setTimeout(() => {
          const filterInput = this.selectTriggerRef.getFilterInput();
          filterInput && filterInput.focus();
        }, 20);
      }
      this.setOpenState(open);
    }
  };

  // combobox ignore
  onKeyDown = event => {
    const props = this.props;
    if (props.disabled) {
      return;
    }
    const keyCode = event.keyCode;
    if (this.state.open && !this.getInputDOMNode()) {
      this.onInputKeyDown(event);
    } else if (keyCode === KeyCode.ENTER || keyCode === KeyCode.DOWN) {
      this.setOpenState(true);
      event.preventDefault();
    }
  };

  onInputKeyDown = event => {
    const props = this.props;
    if (props.disabled) {
      return;
    }
    const state = this.state;
    const keyCode = event.keyCode;
    if (
      isMultipleOrTags(props) &&
      !event.target.value &&
      keyCode === KeyCode.BACKSPACE
    ) {
      event.preventDefault();
      const { value } = state;
      if (value.length) {
        this.removeSelected(value[value.length - 1], value.length - 1);
      }
      return;
    }
    if (keyCode === KeyCode.DOWN) {
      if (!state.open) {
        this.openIfHasChildren();
        event.preventDefault();
        event.stopPropagation();
        return;
      }
    } else if (keyCode === KeyCode.ESC) {
      if (state.open) {
        this.setOpenState(false);
        event.preventDefault();
        event.stopPropagation();
      }
      return;
    }

    if (state.open) {
      const menu = this.selectTriggerRef.getInnerMenu();
      if (menu && menu.onKeyDown(event, this.handleBackfill)) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
  };

  onMenuSelect = ({ item }) => {
    let value = this.state.value;
    const props = this.props;
    const selectedValue = getValuePropValue(item);
    const lastValue = value[value.length - 1];
    if (this.fireSelect(selectedValue) === false) {
      return;
    }
    if (isMultipleOrTags(props)) {
      if (findIndexInValueBySingleValue(value, selectedValue) !== -1) {
        return;
      }
      value = value.concat([selectedValue]);
    } else {
      if (isCombobox(props)) {
        this.skipAdjustOpen = true;
        this.clearAdjustTimer();
        this.skipAdjustOpenTimer = setTimeout(() => {
          this.skipAdjustOpen = false;
        }, 0);
      }
      if (lastValue && lastValue === selectedValue && selectedValue !== this.state.backfillValue) {
        this.setOpenState(false, true);
        return;
      }
      value = [selectedValue];
      this.setOpenState(false, true);
    }
    this.fireChange(value);
    let inputValue;
    if (isCombobox(props)) {
      inputValue = getPropValue(item, props.optionLabelProp);
    } else {
      inputValue = '';
    }
    if (!this.props.filter) {
      this.setInputValue(inputValue, true);
    }
  };

  onMenuDeselect = ({ item, domEvent }) => {
    if (domEvent.type === 'keydown' && domEvent.keyCode === KeyCode.ENTER) {
      this.removeSelected(getValuePropValue(item), null);
      return;
    }
    if (domEvent.type === 'click') {
      this.removeSelected(getValuePropValue(item), null);
    }
    const { props } = this;
    if (props.autoClearSearchValue) {
      this.setInputValue('', false);
    }
  };

  onArrowClick = e => {
    e.stopPropagation();
    e.preventDefault();
    if (!this.props.disabled) {
      this.onDropdownVisibleChange(!this.state.open);
    }
  };

  onOuterFocus = (e) => {
    if (this.props.disabled) {
      e.preventDefault();
      return;
    }
    this.clearBlurTime();
    if (
      !isMultipleOrTagsOrCombobox(this.props) &&
      e.target === this.getInputDOMNode()
    ) {
      return;
    }
    if (this._focused) {
      return;
    }
    this._focused = true;
    this.updateFocusClassName();
    // only effect multiple or tag mode
    if (!isMultipleOrTags(this.props) || !this._mouseDown) {
      this.timeoutFocus();
    }
  };

  onPopupFocus = () => {
    // fix ie scrollbar, focus element again
    this.maybeFocus(true, true);
  };

  onOuterBlur = (e) => {
    if (this.props.disabled) {
      e.preventDefault();
      return;
    }
    this.blurTimer = setTimeout(() => {
      this._focused = false;
      this.updateFocusClassName();
      const props = this.props;
      let { value } = this.state;
      const { inputValue } = this.state;
      if (
        isSingleMode(props) &&
        props.showSearch &&
        inputValue &&
        props.defaultActiveFirstOption
      ) {
        const options = this._options || [];
        if (options.length) {
          const firstOption = findFirstMenuItem(options);
          if (firstOption) {
            value = [firstOption.key];
            this.fireChange(value);
          }
        }
      } else if (isMultipleOrTags(props) && inputValue) {
        if (this.props.blurChange) {
          // why not use setState?
          this.state.inputValue = this.getInputDOMNode().value = '';
        }

        value = this.getValueByInput(inputValue);
        if (value !== undefined && this.props.blurChange) {
          this.fireChange(value);
        }
      }
      props.onBlur(this.getVLForOnChange(value));

    }, 10);
  };

  onClearSelection = event => {
    const props = this.props;
    const state = this.state;
    if (props.disabled) {
      return;
    }
    const { inputValue, value } = state;
    event.stopPropagation();
    if (inputValue || value.length) {
      props.onClear();
      if (value.length) {
        this.fireChange([]);
      }
      this.setOpenState(false, true);
      if (inputValue) {
        this.setInputValue('');
      }
    }
  };

  onChoiceAnimationLeave = () => {
    this.selectTriggerRef.triggerRef.forcePopupAlign();
  };

  getValueFromProps = props => {
    let value = [];
    if ('value' in props) {
      value = toArray(props.value);
    } else {
      value = toArray(props.defaultValue);
    }
    if (props.labelInValue) {
      value = value.map((v) => {
        return v.key;
      });
    }
    if (isMultiple(props)) {
      value = value.filter((v) => {
        return !!v;
      });
    }
    return value;
  };

  getOptionsInfoFromProps = props => {
    const options = this.getOptionsFromChildren(props.children);
    const oldOptionsInfo = this.state ? this.state.optionsInfo : {};
    const value = this.state ? this.state.value : [];
    const optionsInfo = {};
    options.forEach((option) => {
      const singleValue = getValuePropValue(option);
      optionsInfo[getMapKey(singleValue)] = {
        option,
        value: singleValue,
        label: this.getLabelFromOption(option),
        title: option.props.title,
      };
    });
    value.forEach(v => {
      const key = getMapKey(v);
      if (!optionsInfo[key]) {
        optionsInfo[key] = oldOptionsInfo[key];
      }
    });
    return optionsInfo;
  };

  getOptionInfoBySingleValue = (value, optionsInfo) => {
    let info;
    optionsInfo = optionsInfo || this.state.optionsInfo;
    if (optionsInfo[getMapKey(value)]) {
      info = optionsInfo[getMapKey(value)];
    }
    if (info) {
      return info;
    }
    let defaultLabel = value;
    if (this.props.labelInValue) {
      const label = getLabelFromPropsValue(this.props.value, value);
      if (label !== undefined) {
        defaultLabel = label;
      }
    }
    const defaultInfo = {
      option: <Option value={value} key={value}>{value}</Option>,
      value,
      label: defaultLabel,
    };
    return defaultInfo;
  };

  getOptionBySingleValue = value => {
    const { option } = this.getOptionInfoBySingleValue(value);
    return option;
  };

  getOptionsBySingleValue = values => {
    return values.map(value => {
      return this.getOptionBySingleValue(value);
    });
  };

  getOptionsFromChildren = (children, options = []) => {
    Children.forEach(children, child => {
      if (!child) {
        return;
      }
      if (child.type.isSelectOptGroup) {
        this.getOptionsFromChildren(child.props.children, options);
      } else {
        options.push(child);
      }
    });
    return options;
  };

  getValueByLabel = (label) => {
    if (label === undefined) {
      return null;
    }
    let value = null;
    Object.keys(this.state.optionsInfo).forEach(key => {
      const info = this.state.optionsInfo[key];
      if (toArray(info.label).join('') === label) {
        value = info.value;
      }
    });
    return value;
  };

  getLabelFromOption = option => {
    return getPropValue(option, this.props.optionLabelProp);
  };

  getVLBySingleValue = value => {
    if (this.props.labelInValue) {
      return {
        key: value,
        label: this.getLabelBySingleValue(value),
      };
    }
    return value;
  };

  getVLForOnChange = vls_ => {
    let vls = vls_;
    if (vls !== undefined) {
      if (!this.props.labelInValue) {
        vls = vls.map(v => v);
      } else {
        vls = vls.map(vl => ({
          key: vl,
          label: this.getLabelBySingleValue(vl),
        }));
      }
      return isMultipleOrTags(this.props) ? vls : vls[0];
    }
    return vls;
  };

  getLabelBySingleValue = (value, optionsInfo) => {
    const { label } = this.getOptionInfoBySingleValue(value, optionsInfo);
    return label;
  };

  getDropdownContainer = () => {
    if (!this.dropdownContainer) {
      this.dropdownContainer = document.createElement('div');
      document.body.appendChild(this.dropdownContainer);
    }
    return this.dropdownContainer;
  };

  getPlaceholderElement = () => {
    const { placeholder, prefixCls, border } = this.props;
    if (!border && placeholder) {
      return (
        <div className={`${prefixCls}-selection__placeholder`}>
          {placeholder}
        </div>
      );
    }
    return null;
  };

  getInputElement = () => {
    const props = this.props;
    const inputElement = props.getInputElement
      ? props.getInputElement()
      : <input id={props.id} autoComplete="off" />;
    const inputCls = classnames(inputElement.props.className, {
      [`${props.prefixCls}-search__field`]: true,
    });
    // Add space to the end of the inputValue as the width measurement tolerance
    return (
      <div className={`${props.prefixCls}-search__field__wrap`}>
        {cloneElement(inputElement, {
          ref: saveRef(this, 'inputRef'),
          onChange: this.onInputChange,
          onKeyDown: chaining(
            this.onInputKeyDown,
            inputElement.props.onKeyDown,
            this.props.onInputKeyDown,
          ),
          value: this.state.inputValue,
          disabled: props.disabled,
          className: inputCls,
        })}
        <span
          ref={saveRef(this, 'inputMirrorRef')}
          className={`${props.prefixCls}-search__field__mirror`}
        >
          {this.state.inputValue}&nbsp;
        </span>
      </div>
    );
  };

  getInputDOMNode = () => {
    return this.topCtrlRef
      ? this.topCtrlRef.querySelector('input,textarea,div[contentEditable]')
      : this.inputRef;
  };

  getInputMirrorDOMNode = () => {
    return this.inputMirrorRef;
  };

  getPopupDOMNode = () => {
    return this.selectTriggerRef.getPopupDOMNode();
  };

  getPopupMenuComponent = () => {
    return this.selectTriggerRef.getInnerMenu();
  };

  setOpenState = (open, needFocus) => {
    const { props, state } = this;
    if (state.open === open) {
      this.maybeFocus(open, needFocus);
      return;
    }
    const nextState = {
      open,
      backfillValue: undefined,
    };
    // clear search input value when open is false in singleMode.
    if (!open && isSingleMode(props) && props.showSearch) {
      this.setInputValue('');
    }
    if (!open) {
      this.maybeFocus(open, needFocus);
    }
    this.setState(nextState, () => {
      if (open) {
        this.maybeFocus(open, needFocus);
      }
    });
  };

  setInputValue = (inputValue, fireSearch = true) => {
    if (inputValue !== this.state.inputValue) {
      this.setState({
        inputValue,
      });
      if (fireSearch) {
        this.props.onSearch(inputValue);
      }
    }
  };

  getValueByInput = string => {
    const { multiple, tokenSeparators } = this.props;
    let nextValue = this.state.value;
    let hasNewValue = false;
    splitBySeparators(string, tokenSeparators).forEach(label => {
      const selectedValue = [label];
      if (multiple) {
        const value = this.getValueByLabel(label);
        if (value && findIndexInValueBySingleValue(nextValue, value) === -1) {
          nextValue = nextValue.concat(value);
          hasNewValue = true;
          this.fireSelect(value);
        }
      } else {
        // tag
        if (findIndexInValueBySingleValue(nextValue, label) === -1) {
          nextValue = nextValue.concat(selectedValue);
          hasNewValue = true;
          this.fireSelect(label);
        }
      }
    });
    return hasNewValue ? nextValue : undefined;
  };

  getRealOpenState = (state) => {
    const { open: _open } = this.props;
    if (typeof _open === 'boolean') {
      return _open;
    }
    let open = (state || this.state).open;
    const options = this._options || [];
    if (isMultipleOrTagsOrCombobox(this.props) || !this.props.showSearch) {
      if (open && !options.length) {
        open = false;
      }
    }
    return open;
  };

  focus = () => {
    if (isSingleMode(this.props)) {
      this.selectionRef.focus();
    } else {
      this.getInputDOMNode().focus();
    }
  };

  blur = () => {
    if (isSingleMode(this.props)) {
      this.selectionRef.blur();
    } else {
      this.getInputDOMNode().blur();
    }
  };

  handleBackfill = (item) => {
    if (!this.props.backfill || !(isSingleMode(this.props) || isCombobox(this.props))) {
      return;
    }

    const key = getValuePropValue(item);

    if (isCombobox(this.props)) {
      this.setInputValue(key, false);
    }

    this.setState({
      value: [key],
      backfillValue: key,
    });
  };

  filterOption = (input, child, defaultFilter = defaultFilterFn) => {
    const { value } = this.state;
    const lastValue = value[value.length - 1];
    if (!input || (lastValue && lastValue === this.state.backfillValue)) {
      return true;
    }
    let filterFn = this.props.filterOption;
    if ('filterOption' in this.props) {
      if (this.props.filterOption === true) {
        filterFn = defaultFilter;
      }
    } else {
      filterFn = defaultFilter;
    }

    if (!filterFn) {
      return true;
    } else if (typeof filterFn === 'function') {
      return filterFn.call(this, input, child);
    } else if (child.props.disabled) {
      return false;
    }
    return true;
  };

  timeoutFocus = () => {
    if (this.focusTimer) {
      this.clearFocusTime();
    }
    this.focusTimer = setTimeout(() => {
      this.props.onFocus();
    }, 10);
  };

  clearFocusTime = () => {
    if (this.focusTimer) {
      clearTimeout(this.focusTimer);
      this.focusTimer = null;
    }
  };

  clearBlurTime = () => {
    if (this.blurTimer) {
      clearTimeout(this.blurTimer);
      this.blurTimer = null;
    }
  };

  clearAdjustTimer = () => {
    if (this.skipAdjustOpenTimer) {
      clearTimeout(this.skipAdjustOpenTimer);
      this.skipAdjustOpenTimer = null;
    }
  };

  updateFocusClassName = () => {
    const { rootRef, props } = this;
    // avoid setState and its side effect
    if (this._focused) {
      classes(rootRef).add(`${props.prefixCls}-focused`);
    } else {
      classes(rootRef).remove(`${props.prefixCls}-focused`);
    }
  };

  maybeFocus = (open, needFocus) => {
    if (needFocus || open) {
      const input = this.getInputDOMNode();
      const { activeElement } = document;
      if (input && (open || isMultipleOrTagsOrCombobox(this.props))) {
        if (activeElement !== input) {
          input.focus();
          this._focused = true;
        }
      } else {
        if (activeElement !== this.selectionRef) {
          this.selectionRef.focus();
          this._focused = true;
        }
      }
    }
  };

  handleChoiceItemClick = (selectedKey, e) => {
    const props = this.props;
    if (props.disabled || this.isChildDisabled(selectedKey)) {
      return;
    }
    if (!e.isDefaultPrevented()) {
      props.onChoiceItemClick(this.getVLBySingleValue(selectedKey), this.getOptionBySingleValue(selectedKey));
    }
  };

  removeSelected = (selectedKey, index, e) => {
    this.needExpand = false;
    setTimeout(() => {
      this.needExpand = true;
    }, 100);
    if (e) {
      e.preventDefault();
    }
    const props = this.props;
    if (props.disabled || this.isChildDisabled(selectedKey)) {
      return;
    }
    const value = this.state.value.filter((singleValue, i) => {
      return singleValue !== selectedKey || (index !== null && i !== index);
    });
    const canMultiple = isMultipleOrTags(props);

    if (canMultiple) {
      let event = selectedKey;
      if (props.labelInValue) {
        event = {
          key: selectedKey,
          label: this.getLabelBySingleValue(selectedKey),
        };
      }
      props.onDeselect(event, this.getOptionBySingleValue(selectedKey), index);
      if (typeof props.onChoiceRemove === 'function') {
        props.onChoiceRemove(selectedKey);
      }
    }
    this.fireChange(value);
  };

  openIfHasChildren = () => {
    const props = this.props;
    if (Children.count(props.children) || isSingleMode(props)) {
      this.setOpenState(true);
    }
  };

  fireSelect = value => {
    return this.props.onSelect(this.getVLBySingleValue(value), this.getOptionBySingleValue(value));
  };

  fireChange = value => {
    const props = this.props;
    if (!('value' in props)) {
      this.setState({
        value,
      });
    }
    const vls = this.getVLForOnChange(value);
    const options = this.getOptionsBySingleValue(value);
    props.onChange(vls, isMultipleOrTags(this.props) ? options : options[0]);
  };

  isChildDisabled = key => {
    return childrenToArray(this.props.children).some(child => {
      const childValue = getValuePropValue(child);
      return childValue === key && child.props && child.props.disabled;
    });
  };

  adjustOpenState = () => {
    if (this.skipAdjustOpen) {
      return;
    }
    let { open } = this.state;
    let options = [];
    // If hidden menu due to no options, then it should be calculated again
    if (open || this.hiddenForNoOptions) {
      options = this.renderFilterOptions();
    }
    this._options = options;

    if (isMultipleOrTagsOrCombobox(this.props) || !this.props.showSearch) {
      if (open && !options.length) {
        open = false;
        this.hiddenForNoOptions = true;
      }
      // Keep menu open if there are options and hidden for no options before
      if (this.hiddenForNoOptions && options.length) {
        open = true;
        this.hiddenForNoOptions = false;
      }
    }
    this.state.open = open;
  };

  renderFilterOptions = () => {
    const { inputValue } = this.state;
    const { children, tags, filterOption, notFoundContent, showNotFindInputItem, showNotFindSelectedItem } = this.props;
    const menuItems = [];
    const childrenKeys = [];
    let options = this.renderFilterOptionsFromChildren(
      children,
      childrenKeys,
      menuItems,
    );
    if (tags) {
      if (showNotFindSelectedItem) {
        // tags value must be string
        let value = this.state.value || [];
        value = value.filter(singleValue => {
          return (
            childrenKeys.indexOf(singleValue) === -1 &&
            (!inputValue ||
              String(singleValue).indexOf(String(inputValue)) > -1)
          );
        });
        value.forEach(singleValue => {
          const key = singleValue;
          const menuItem = (
            <MenuItem
              style={UNSELECTABLE_STYLE}
              attribute={UNSELECTABLE_ATTRIBUTE}
              value={key}
              key={key}
            >
              {key}
            </MenuItem>
          );
          options.push(menuItem);
          menuItems.push(menuItem);
        });
      }
      if (inputValue && showNotFindInputItem) {
        const notFindInputItem = menuItems.every(option => {
          // this.filterOption return true has two meaning,
          // 1, some one exists after filtering
          // 2, filterOption is set to false
          // condition 2 does not mean the option has same value with inputValue
          const filterFn = () => getValuePropValue(option) === inputValue;
          if (filterOption !== false) {
            return !this.filterOption.call(
              this,
              inputValue,
              option,
              filterFn,
            );
          }
          return !filterFn();
        });
        if (notFindInputItem) {
          options.unshift(
            <MenuItem
              style={UNSELECTABLE_STYLE}
              attribute={UNSELECTABLE_ATTRIBUTE}
              value={inputValue}
              onMouseDown={preventDefaultEvent}
              key={inputValue}
            >
              {inputValue}
            </MenuItem>,
          );
        }
      }
    }
    let loading = this.props.loading;
    if (typeof loading === 'boolean') {
      loading = {
        spinning: loading,
      };
    }
    if (!options.length && notFoundContent) {
      options = [
        <MenuItem
          style={UNSELECTABLE_STYLE}
          attribute={UNSELECTABLE_ATTRIBUTE}
          disabled
          value="NOT_FOUND"
          key="NOT_FOUND"
          checkable={false}
        >
          {loading.spinning ? '' : notFoundContent}
        </MenuItem>,
      ];
    }
    return options;
  };

  renderFilterOptionsFromChildren = (children, childrenKeys, menuItems) => {
    const sel = [];
    const props = this.props;
    const { inputValue } = this.state;
    const tags = props.tags;
    Children.forEach(children, child => {
      if (!child) {
        return;
      }
      if (child.type.isSelectOptGroup) {
        const innerItems = this.renderFilterOptionsFromChildren(
          child.props.children,
          childrenKeys,
          menuItems,
        );
        if (innerItems.length) {
          let label = child.props.label;
          let key = child.key;
          // if (!key && typeof label === 'string') {
          //   key = label;
          // }
          // else if (!label && key) {
          //   label = key;
          // }
          sel.push(
            <MenuItemGroup key={key} title={label}>
              {innerItems}
            </MenuItemGroup>,
          );
        }
        return;
      }

      warning(
        child.type.isSelectOption,
        'the children of `Select` should be `Select.Option` or `Select.OptGroup`, ' +
        `instead of \`${child.type.name ||
        child.type.displayName ||
        child.type}\`.`,
      );

      const childValue = getValuePropValue(child);

      validateOptionValue(childValue, this.props);

      if (this.filterOption(inputValue, child)) {
        const menuItem = (
          <MenuItem
            style={UNSELECTABLE_STYLE}
            attribute={UNSELECTABLE_ATTRIBUTE}
            value={childValue}
            key={childValue}
            {...child.props}
          />
        );
        sel.push(menuItem);
        menuItems.push(menuItem);
      }
      if (tags && !child.props.disabled) {
        childrenKeys.push(childValue);
      }
    });

    return sel;
  };

  isChoiceRemove = (selectedKey) => {
    const { choiceRemove } = this.props;
    if (typeof choiceRemove === 'function') {
      return choiceRemove(selectedKey);
    }
    return choiceRemove;
  };

  renderTopControlNode = () => {
    const { value, open, inputValue } = this.state;
    const props = this.props;
    const tags = isTags(props);
    const {
      prefixCls,
      maxTagTextLength,
      maxTagCount,
      maxTagPlaceholder,
      showSearch,
      choiceRender,
    } = props;
    const className = `${prefixCls}-selection__rendered`;
    // search input is inside topControlNode in single, multiple & combobox. 2016/04/13
    let innerNode = null;
    if (isSingleMode(props)) {
      let selectedValue = null;
      let opacity = 1;
      if (value.length) {
        let showSelectedValue = false;
        if (showSearch && open) {
          showSelectedValue = !inputValue;
          if (showSelectedValue) {
            opacity = 0.4;
          }
        }
      }
      const singleValue = value && value[0];
      const { label, title } = this.getOptionInfoBySingleValue(singleValue);
      selectedValue = (
        <div
          key="value"
          className={`${prefixCls}-selection-selected-value`}
          title={title || label}
          style={{
            opacity,
          }}
        >
          {choiceRender ? choiceRender(label) : label}
        </div>
      );
      innerNode = [selectedValue];
    } else {
      let selectedValueNodes = [];
      let limitedCountValue = value;
      let maxTagPlaceholderEl;
      if (maxTagCount !== undefined && value.length > maxTagCount) {
        limitedCountValue = limitedCountValue.slice(0, maxTagCount);
        const omittedValues = this.getVLForOnChange(value.slice(maxTagCount, value.length));
        let content = `+ ${value.length - maxTagCount} ...`;
        if (maxTagPlaceholder) {
          content = typeof maxTagPlaceholder === 'function' ? maxTagPlaceholder(omittedValues) : maxTagPlaceholder;
        }
        maxTagPlaceholderEl = (<li
          style={UNSELECTABLE_STYLE}
          {...UNSELECTABLE_ATTRIBUTE}
          onMouseDown={preventDefaultEvent}
          className={`${prefixCls}-selection__choice ${prefixCls}-selection__choice__disabled ${prefixCls}-selection__max`}
          key={'maxTagPlaceholder'}
          // title={content}
        >
          <div className={`${prefixCls}-selection__choice__content`}>{content}</div>
        </li>);
      }
      if (isMultipleOrTags(props)) {
        selectedValueNodes = limitedCountValue.map((singleValue, index) => {
          const info = this.getOptionInfoBySingleValue(singleValue);
          let content = info.label;
          const title = info.title || content;
          if (
            maxTagTextLength &&
            typeof content === 'string' &&
            content.length > maxTagTextLength
          ) {
            content = `${content.slice(0, maxTagTextLength)}...`;
          }
          const disabled = this.isChildDisabled(singleValue);
          const choiceClassName = disabled
            ? `${prefixCls}-selection__choice ${prefixCls}-selection__choice__disabled`
            : `${prefixCls}-selection__choice`;
          const li = (<li
            style={UNSELECTABLE_STYLE}
            {...UNSELECTABLE_ATTRIBUTE}
            onMouseDown={preventDefaultEvent}
            onClick={this.handleChoiceItemClick.bind(this, singleValue)}
            className={choiceClassName}
            // title={title}
          >
            <div className={`${prefixCls}-selection__choice__content`}>
              {content}
            </div>
            {disabled || !this.isChoiceRemove(singleValue) ? null : (
              <span
                className={`${prefixCls}-selection__choice__remove`}
                onClick={this.removeSelected.bind(this, singleValue, index)}
              >
                <i className="icon icon-cancel" />
              </span>)}
          </li>);
          return (
            <Ripple
              key={singleValue + limitedCountValue.slice(0, index).filter(foundValue => foundValue === singleValue).length}
            >
              {choiceRender ? choiceRender(li, singleValue) : li}
            </Ripple>
          );
        });
        if (maxTagPlaceholderEl) {
          selectedValueNodes.push(maxTagPlaceholderEl);
        }
        selectedValueNodes.push(
          <li
            className={`${prefixCls}-search ${prefixCls}-search--inline`}
            key="__input"
          >
            {this.getInputElement()}
          </li>,
        );
      } else {
        selectedValueNodes.push(
          <div
            className={`${prefixCls}-search ${prefixCls}-search--inline`}
            key="__input"
            style={{ display: 'inline-block' }}
          >
            {this.getInputElement()}
          </div>,
        );
      }

      if (isMultipleOrTags(props)) {
        innerNode = (
          <ul>
            {selectedValueNodes}
          </ul>
        );
      } else {
        innerNode = selectedValueNodes;
      }
    }
    return (
      <div className={className} ref={saveRef(this, 'topCtrlRef')}>
        {this.getPlaceholderElement()}
        {innerNode}
        {this.renderClear()}
        {tags || !props.showArrow ? null : (
          <span
            key="arrow"
            className={`${prefixCls}-arrow`}
            style={UNSELECTABLE_STYLE}
            {...UNSELECTABLE_ATTRIBUTE}
            onClick={this.onArrowClick}
          >
          <i className="icon icon-arrow_drop_down"></i>
          <b />
          </span>
        )}
      </div>
    );
  };

  getBuiltinPlacements() {
    const { builtinPlacements, label } = this.props;
    if (builtinPlacements) {
      return builtinPlacements;
    }
    if (!isTags(this.props) && !isCombobox(this.props)) {
      if (label) {
        return BUILT_IN_PLACEMENTS_LABEL;
      }
      return BUILT_IN_PLACEMENTS;
    }
  }

  checkAll = (event) => {
    const name = event.target.getAttribute('name');
    const props = this.props;
    const state = this.state;
    if (props.disabled) {
      return;
    }

    let newValues;
    const values = this._options.filter((option) => {
      // 当这个选项为禁用时，全选和无不对这个选项做处理
      return option.props.disabled !== true;
    }).map((option) => {
      return getValuePropValue(option);
    });
    if (name === 'check-all') {
      newValues = new Set(state.value.concat(values));
      this.fireChange(Array.from(newValues));
    } else if (name === 'check-none') {
      newValues = state.value.filter((e) => values.indexOf(e) < 0);
      this.fireChange(newValues);
      this.focus();
    }
  };

  renderClear() {
    const { prefixCls, allowClear } = this.props;
    const { value, inputValue } = this.state;
    const clear = (
      <Button
        key="clear"
        className={`${prefixCls}-clear`}
        style={UNSELECTABLE_STYLE}
        {...UNSELECTABLE_ATTRIBUTE}
        shape="circle"
        icon="close"
        size="small"
        onClick={this.onClearSelection}
        onMouseDown={preventDefaultEvent}
      />
    );
    if (!allowClear) {
      return null;
    }
    if (isCombobox(this.props)) {
      if (inputValue) {
        return clear;
      }
      return null;
    }
    if (inputValue || value.length) {
      return clear;
    }
    return null;
  }

  getLabel() {
    const { placeholder, label } = this.props;
    if (!this.hasValue() && placeholder) {
      return placeholder;
    }
    return label;
  }

  renderFloatLabel() {
    const label = this.getLabel();
    const { prefixCls, border } = this.props;
    if (label && border) {
      return (
        <div className={`${prefixCls}-label-wrapper`}>
          <div className={`${prefixCls}-label`}>{label}</div>
        </div>
      );
    }
  }

  hasValue() {
    const { value, inputValue } = this.state;
    return inputValue || (value.length && value[0]);
  }

  render() {
    const props = this.props;
    const state = this.state;
    const {
      className,
      disabled,
      prefixCls,
      label,
      loading,
      border,
    } = props;
    const { open, value, inputValue } = this.state;
    const multiple = isMultipleOrTags(props);
    const ctrlNode = this.renderTopControlNode();
    let extraSelectionProps = {};
    const options = this._options;
    if (!isMultipleOrTagsOrCombobox(props)) {
      extraSelectionProps = {
        ...extraSelectionProps,
        onKeyDown: this.onKeyDown,
        tabIndex: disabled ? -1 : 0,
      };
    }

    const rootCls = {
      [className]: !!className,
      [prefixCls]: 1,
      [`${prefixCls}-open`]: open,
      [`${prefixCls}-focused`]: !isMultiple(props) && this._focused,
      [`${prefixCls}-has-value`]: this.hasValue(),
      [`${prefixCls}-has-label`]: label,
      [`${prefixCls}-combobox`]: isCombobox(props),
      [`${prefixCls}-disabled`]: disabled,
      [`${prefixCls}-enabled`]: !disabled,
      [`${prefixCls}-allow-clear`]: !!props.allowClear,
      [`${prefixCls}-tags`]: isTags(props),
      [`${prefixCls}-multiple`]: isMultiple(props),
      [`${prefixCls}-has-border`]: border,
    };
    return (
      <SelectTrigger
        onPopupFocus={this.onPopupFocus}
        onMouseEnter={props.onMouseEnter}
        onMouseLeave={props.onMouseLeave}
        checkAll={props.showCheckAll ? this.checkAll : undefined}
        dropdownAlign={props.dropdownAlign}
        dropdownClassName={props.dropdownClassName}
        dropdownMatchSelectWidth={props.dropdownMatchSelectWidth}
        defaultActiveFirstOption={props.defaultActiveFirstOption}
        dropdownMenuStyle={props.dropdownMenuStyle}
        transitionName={props.transitionName}
        animation={props.animation}
        prefixCls={props.prefixCls}
        dropdownStyle={props.dropdownStyle}
        combobox={props.combobox}
        showSearch={props.showSearch}
        options={options}
        multiple={multiple}
        disabled={disabled}
        visible={open}
        inputValue={state.inputValue}
        value={state.value}
        loading={loading}
        filter={props.filter}
        filterValue={state.filterValue}
        backfillValue={state.backfillValue}
        firstActiveValue={props.firstActiveValue}
        onFilterChange={this.onFilterChange}
        onDropdownVisibleChange={this.onDropdownVisibleChange}
        onDropdownMouseDown={props.onDropdownMouseDown}
        getPopupContainer={props.getPopupContainer}
        getRootDomNode={props.getRootDomNode}
        onMenuSelect={this.onMenuSelect}
        onMenuDeselect={this.onMenuDeselect}
        onPopupScroll={props.onPopupScroll}
        onKeyDown={chaining(
          this.onInputKeyDown,
          this.props.onInputKeyDown,
        )}
        filterPlaceholder={props.filterPlaceholder}
        builtinPlacements={this.getBuiltinPlacements()}
        footer={props.footer}
        ref={saveRef(this, 'selectTriggerRef')}
      >
        <div
          style={props.style}
          ref={saveRef(this, 'rootRef')}
          onBlur={this.onOuterBlur}
          onFocus={this.onOuterFocus}
          className={classnames(rootCls)}
        >
          <div
            ref={saveRef(this, 'selectionRef')}
            key="selection"
            className={`${prefixCls}-selection
            ${prefixCls}-selection--${multiple ? 'multiple' : 'single'}`}
            role="combobox"
            aria-autocomplete="list"
            aria-haspopup="true"
            aria-expanded={open}
            {...extraSelectionProps}
          >
            {ctrlNode}
            {this.renderFloatLabel()}
          </div>
        </div>
      </SelectTrigger>
    );
  }
}

Select.displayName = 'Select';
