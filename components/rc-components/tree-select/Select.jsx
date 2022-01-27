import React, { Children, Component } from 'react';
import { unmountComponentAtNode } from 'react-dom';
import classnames from 'classnames';
import noop from 'lodash/noop';
import KeyCode from '../../_util/KeyCode';
import Animate from '../../animate';
import {
  filterAllCheckedData,
  filterParentPosition,
  flatToHierarchy,
  getPropValue,
  getTreeNodesStates,
  getValuePropValue,
  isEmpty,
  isMultiple,
  isPositionPrefix,
  labelCompatible,
  loopAllChildren,
  preventDefaultEvent,
  processSimpleTreeData,
  saveRef,
  toArray,
  UNSELECTABLE_ATTRIBUTE,
  UNSELECTABLE_STYLE,
} from './util';
import SelectTrigger from './SelectTrigger';
import _TreeNode from './TreeNode';
import { SHOW_ALL, SHOW_CHILD, SHOW_PARENT } from './strategies';
import Button from '../../button/Button';

function filterFn(input, child) {
  return (
    String(getPropValue(child, labelCompatible(this.props.treeNodeFilterProp))).indexOf(input) > -1
  );
}

function loopTreeData(data, level = 0, treeCheckable) {
  return data.map((item, index) => {
    const pos = `${level}-${index}`;
    const {
      label,
      value,
      disabled,
      key,
      hasOwnProperty,
      selectable,
      children,
      isLeaf,
      ...otherProps
    } = item;
    const props = {
      value,
      title: label,
      // value: value || String(key || label), // cause onChange callback error
      key: key || value || pos,
      disabled: disabled || false,
      selectable: selectable === false ? selectable : !treeCheckable,
      ...otherProps,
    };
    let ret;
    if (children && children.length) {
      ret = <_TreeNode {...props}>{loopTreeData(children, pos, treeCheckable)}</_TreeNode>;
    } else {
      ret = <_TreeNode {...props} isLeaf={isLeaf} />;
    }
    return ret;
  });
}

export default class Select extends Component {
  static defaultProps = {
    prefixCls: 'rc-tree-select',
    filterTreeNode: filterFn,
    showSearch: true,
    allowClear: false,
    placeholder: '',
    searchPlaceholder: '',
    labelInValue: false,
    onClick: noop,
    onChange: noop,
    onSelect: noop,
    onDeselect: noop,
    onSearch: noop,
    showArrow: true,
    dropdownMatchSelectWidth: true,
    dropdownStyle: {},
    autoClearSearchValue: true,
    onDropdownVisibleChange: () => {
      return true;
    },
    optionLabelProp: 'value',
    notFoundContent: 'Not Found',
    showCheckedStrategy: SHOW_CHILD,
    // skipHandleInitValue: false, // Deprecated (use treeCheckStrictly)
    treeCheckStrictly: false,
    treeIcon: false,
    treeLine: false,
    treeDataSimpleMode: false,
    treeDefaultExpandAll: false,
    treeCheckable: false,
    treeNodeFilterProp: 'value',
    treeNodeLabelProp: 'title',
    searchValue:'',
  };

  static SHOW_ALL = SHOW_ALL;
  static SHOW_PARENT = SHOW_PARENT;
  static SHOW_CHILD = SHOW_CHILD;

  constructor(props) {
    super(props);
    let value = [];
    if ('value' in props) {
      value = toArray(props.value);
    } else {
      value = toArray(props.defaultValue);
    }
    // save parsed treeData, for performance (treeData may be very big)
    this.renderedTreeData = this.renderTreeData();
    value = this.addLabelToValue(props, value);
    value = this.getValue(props, value, props.inputValue ? '__strict' : true);
    let inputValue = props.inputValue || '';
    if (!isEmpty(props.searchValue)) {
      inputValue = String(props.searchValue)
    }
    this.state = {
      value,
      inputValue,
      open: props.open || props.defaultOpen,
      focused: false,
    };
  }

  componentDidMount() {
    const { autoFocus, disabled } = this.props;
    if (isMultiple(this.props)) {
      const inputNode = this.getInputDOMNode();
      if (inputNode.value) {
        inputNode.style.width = '';
        inputNode.style.width = `${this.inputMirrorInstance.clientWidth}px`;
      } else {
        inputNode.style.width = '';
      }
    }
    if (autoFocus && !disabled) {
      this.focus();
    }
  }

  componentWillReceiveProps(nextProps) {
    // save parsed treeData, for performance (treeData may be very big)
    this.renderedTreeData = this.renderTreeData(nextProps);
    // Detecting whether the object of `onChange`'s argument  is old ref.
    // Better to do a deep equal later.
    this._cacheTreeNodesStates =
      this._cacheTreeNodesStates !== 'no' &&
      this._savedValue &&
      nextProps.value === this._savedValue;
    if (this.props.treeData !== nextProps.treeData || this.props.children !== nextProps.children) {
      // refresh this._treeNodesStates cache
      this._treeNodesStates = getTreeNodesStates(
        this.renderedTreeData || nextProps.children,
        this.state.value.map(item => item.value),
      );
    }
    if ('value' in nextProps) {
      let value = toArray(nextProps.value);
      value = this.addLabelToValue(nextProps, value);
      value = this.getValue(nextProps, value);
      this.setState({
        value,
      });
      if (nextProps.searchValue !== this.props.searchValue) {
        this.setState({
          inputValue: String(nextProps.searchValue)
        });
      }
    }
    if(isEmpty(this.props.searchValue)){
      if (nextProps.inputValue !== this.props.inputValue ) {
        this.setState({
          inputValue: nextProps.inputValue,
        });
      }
    }else{
      this.setState({
        inputValue: this.props.searchValue,
      });
    }

    if ('open' in nextProps) {
      this.setState({
        open: nextProps.open,
      });
    }
  }

  componentWillUpdate(nextProps) {
    if (
      this._savedValue &&
      nextProps.value &&
      nextProps.value !== this._savedValue &&
      nextProps.value === this.props.value
    ) {
      this._cacheTreeNodesStates = false;
      this.getValue(nextProps, this.addLabelToValue(nextProps, toArray(nextProps.value)));
    }
  }

  componentDidUpdate() {
    const state = this.state;
    const props = this.props;
    if (state.open && isMultiple(props)) {
      const inputNode = this.getInputDOMNode();
      if (inputNode.value) {
        inputNode.style.width = '';
        inputNode.style.width = `${this.inputMirrorInstance.clientWidth}px`;
      } else {
        inputNode.style.width = '';
      }
    }
  }

  componentWillUnmount() {
    this.clearDelayTimer();
    if (this.dropdownContainer) {
      unmountComponentAtNode(this.dropdownContainer);
      document.body.removeChild(this.dropdownContainer);
      this.dropdownContainer = null;
    }
  }

  onInputChange = event => {
    const val = event.target.value;
    const { props } = this;
    this.setState({
      inputValue:isEmpty(this.props.searchValue)? val :this.props.searchValue,
      open: true,
    });
    if (props.treeCheckable && !val) {
      this.setState({
        value: this.getValue(props, [...this.state.value], false),
      });
    }
    props.onSearch(val);
  };

  onDropdownVisibleChange = open => {
    // selection inside combobox cause click
    if (!open && document.activeElement === this.getInputDOMNode()) {
      // return;
    }
    // this.setOpenState(open);
    // setTimeout, then have animation. why?
    setTimeout(() => {
      this.setOpenState(open, undefined, !open);
    }, 10);
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
    if (isMultiple(props) && !event.target.value && keyCode === KeyCode.BACKSPACE) {
      const value = state.value.concat();
      if (value.length) {
        const popValue = value.pop();
        this.removeSelected(this.isLabelInValue() ? popValue : popValue.value);
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
  };
  /**
   * 选择值
   */
  onSelect = (selectedKeys, info) => {
    const item = info.node;
    let value = this.state.value;
    const props = this.props;
    const selectedValue = getValuePropValue(item);
    const selectedLabel = this.getLabelFromNode(item);
    const checkableSelect = props.treeCheckable && info.event === 'select';
    let event = selectedValue;
    if (this.isLabelInValue()) {
      event = {
        value: event,
        label: selectedLabel,
      };
    }
    if (info.selected === false) {
      this.onDeselect(info);
      if (!checkableSelect) return;
    }
    props.onSelect(event, item, info);

    const checkEvt = info.event === 'check';
    if (isMultiple(props)) {
      this.clearSearchInput();
      if (checkEvt) {
        value = this.getCheckedNodes(info, props).map(n => {
          return {
            value: getValuePropValue(n),
            label: this.getLabelFromNode(n),
          };
        });
      } else {
        if (value.some(i => i.value === selectedValue)) {
          return;
        }
        value = value.concat([
          {
            value: selectedValue,
            label: selectedLabel,
          },
        ]);
      }
    } else {
      if (value.length && value[0].value === selectedValue) {
        this.setOpenState(false);
        return;
      }
      value = [
        {
          value: selectedValue,
          label: selectedLabel,
        },
      ];
      this.setOpenState(false);
    }

    const extraInfo = {
      triggerValue: selectedValue,
      triggerNode: item,
    };
    if (checkEvt) {
      extraInfo.checked = info.checked;
      // if inputValue existing, tree is checkStrictly
      extraInfo.allCheckedNodes =
        props.treeCheckStrictly || this.state.inputValue
          ? info.checkedNodes
          : flatToHierarchy(info.checkedNodesPositions);
      this._checkedNodes = info.checkedNodesPositions;
      const _tree = this.trigger.popupEle;
      this._treeNodesStates = _tree.checkKeys;
    } else {
      extraInfo.selected = info.selected;
    }

    this.fireChange(value, extraInfo);
    // 选中后判断是否需要清楚搜索值
    if(props.autoClearSearchValue ){
      this.clearSearchInput()
    }
    if (props.inputValue && isEmpty(this.props.searchValue)) {
      this.setState({
        inputValue: '',
      });
    }else{
      this.setState({
        inputValue: this.props.searchValue,
      });
    }
  };

  onDeselect = info => {
    this.removeSelected(getValuePropValue(info.node));
    if (!isMultiple(this.props)) {
      this.setOpenState(false);
    } else {
      this.clearSearchInput();
    }
  };

  onPlaceholderClick = () => {
    this.getInputDOMNode().focus();
  };

  onClearSelection = event => {
    const props = this.props;
    const state = this.state;
    if (props.disabled) {
      return;
    }
    event.stopPropagation();
    this._cacheTreeNodesStates = 'no';
    this._checkedNodes = [];
    if (state.inputValue || state.value.length) {
      this.setOpenState(false);
      if (typeof props.inputValue === 'undefined' ) {
        this.setState(
          {
            inputValue: isEmpty(this.props.searchValue) ? '':this.props.searchValue,
          },
          () => {
            this.fireChange([]);
          },
        );
      } else {
        this.fireChange([]);
      }
    }
  };

  onChoiceAnimationLeave = () => {
    this.trigger.trigger.forcePopupAlign();
  };

  getLabelFromNode(child) {
    return getPropValue(child, this.props.treeNodeLabelProp);
  }

  getLabelFromProps(props, value) {
    if (value === undefined) {
      return null;
    }
    let label = null;
    loopAllChildren(this.renderedTreeData || props.children, item => {
      if (getValuePropValue(item) === value) {
        label = this.getLabelFromNode(item);
      }
    });
    if (label === null) {
      return value;
    }
    return label;
  }

  getDropdownContainer() {
    if (!this.dropdownContainer) {
      this.dropdownContainer = document.createElement('div');
      document.body.appendChild(this.dropdownContainer);
    }
    return this.dropdownContainer;
  }

  getSearchPlaceholderElement(hidden) {
    const props = this.props;
    let placeholder;
    if (isMultiple(props)) {
      placeholder = props.placeholder || props.searchPlaceholder;
    } else {
      placeholder = props.searchPlaceholder;
    }
    if (placeholder) {
      return (
        <span
          style={{ display: hidden ? 'none' : 'block' }}
          onClick={this.onPlaceholderClick}
          className={`${props.prefixCls}-search__field__placeholder`}
        >
          {placeholder}
        </span>
      );
    }
    return null;
  }

  getInputElement() {
    const { inputValue } = this.state;
    const { prefixCls, disabled } = this.props;
    return (
      <span className={`${prefixCls}-search__field__wrap`}>
        <input
          ref={saveRef(this, 'inputInstance')}
          onChange={this.onInputChange}
          onKeyDown={this.onInputKeyDown}
          value={inputValue}
          disabled={disabled}
          className={`${prefixCls}-search__field`}
          role="textbox"
        />
        <span
          ref={saveRef(this, 'inputMirrorInstance')}
          className={`${prefixCls}-search__field__mirror`}
        >
          {inputValue}&nbsp;
        </span>
        {isMultiple(this.props) ? null : this.getSearchPlaceholderElement(!!inputValue)}
      </span>
    );
  }

  getInputDOMNode() {
    return this.inputInstance;
  }

  getPopupDOMNode() {
    return this.trigger.getPopupDOMNode();
  }

  getPopupComponentRefs() {
    return this.trigger.getPopupEleRefs();
  }

  getValue(_props, val, init = true) {
    let value = val;
    // if inputValue existing, tree is checkStrictly
    const _strict =
      init === '__strict' ||
      (init &&
        ((this.state && this.state.inputValue) || this.props.inputValue !== _props.inputValue));
    if (_props.treeCheckable && (_props.treeCheckStrictly || _strict)) {
      this.halfCheckedValues = [];
      value = [];
      val.forEach(i => {
        if (!i.halfChecked) {
          value.push(i);
        } else {
          this.halfCheckedValues.push(i);
        }
      });
    }
    // if (!(_props.treeCheckable && !_props.treeCheckStrictly)) {
    if (
      !!!_props.treeCheckable ||
      (_props.treeCheckable && (_props.treeCheckStrictly || _strict))
    ) {
      return value;
    }
    let checkedTreeNodes;
    if (
      this._cachetreeData &&
      this._cacheTreeNodesStates &&
      this._checkedNodes &&
      this.state &&
      !this.state.inputValue
    ) {
      this.checkedTreeNodes = checkedTreeNodes = this._checkedNodes;
    } else {
      /**
       * Note: `this._treeNodesStates`'s treeNodesStates must correspond to nodes of the
       * final tree (`processTreeNode` function from SelectTrigger.jsx produce the final tree).
       *
       * And, `this._treeNodesStates` from `onSelect` is previous value,
       * so it perhaps only have a few nodes, but the newly filtered tree can have many nodes,
       * thus, you cannot use previous _treeNodesStates.
       */
      // getTreeNodesStates is not effective.
      this._treeNodesStates = getTreeNodesStates(
        this.renderedTreeData || _props.children,
        value.map(item => item.value),
      );
      this.checkedTreeNodes = checkedTreeNodes = this._treeNodesStates.checkedNodes;
    }
    const mapLabVal = arr =>
      arr.map(itemObj => {
        return {
          value: getValuePropValue(itemObj.node),
          label: getPropValue(itemObj.node, _props.treeNodeLabelProp),
        };
      });
    const props = this.props;
    let checkedValues = [];
    if (props.showCheckedStrategy === SHOW_ALL) {
      checkedValues = mapLabVal(checkedTreeNodes);
    } else if (props.showCheckedStrategy === SHOW_PARENT) {
      const posArr = filterParentPosition(checkedTreeNodes.map(itemObj => itemObj.pos));
      checkedValues = mapLabVal(
        checkedTreeNodes.filter(itemObj => posArr.indexOf(itemObj.pos) !== -1),
      );
    } else {
      checkedValues = mapLabVal(checkedTreeNodes.filter(itemObj => !itemObj.node.props.children));
    }
    return checkedValues;
  }

  getCheckedNodes(info, props) {
    // TODO treeCheckable does not support tags/dynamic
    let { checkedNodes } = info;
    let checkNodeProps = checkedNodes.forEach(item => {
      if(!item.props){
        item.props = item
      }
      return item
    })
    if (props.treeCheckStrictly || this.state.inputValue) {
      return checkNodeProps;
    }
    const checkedNodesPositions = info.checkedNodesPositions;
    if (props.showCheckedStrategy === SHOW_ALL) {
      checkNodeProps = checkNodeProps;
    } else if (props.showCheckedStrategy === SHOW_PARENT) {
      const posArr = filterParentPosition(checkedNodesPositions.map(itemObj => itemObj.pos));
      checkNodeProps = checkedNodesPositions
        .filter(itemObj => posArr.indexOf(itemObj.pos) !== -1)
        .map(itemObj => itemObj.node);
    } else {
      checkNodeProps = checkNodeProps.filter(n => !n.props.children);
    }
    return checkNodeProps;
  }

  getDeselectedValue(selectedValue) {
    const checkedTreeNodes = this.checkedTreeNodes;
    let unCheckPos;
    checkedTreeNodes.forEach(itemObj => {
      if (itemObj.node.props.value === selectedValue) {
        unCheckPos = itemObj.pos;
      }
    });
    const newVals = [];
    const newCkTns = [];
    checkedTreeNodes.forEach(itemObj => {
      if (isPositionPrefix(itemObj.pos, unCheckPos) || isPositionPrefix(unCheckPos, itemObj.pos)) {
        // Filter ancestral and children nodes when uncheck a node.
        return;
      }
      newCkTns.push(itemObj);
      newVals.push(itemObj.node.props.value);
    });
    this.checkedTreeNodes = this._checkedNodes = newCkTns;
    const nv = this.state.value.filter(val => newVals.indexOf(val.value) !== -1);
    this.fireChange(nv, { triggerValue: selectedValue, clear: true });
  }

  setOpenState(open, needFocus, documentClickClose = false) {
    this.clearDelayTimer();
    const { props } = this;
    // can not optimize, if children is empty
    // if (this.state.open === open) {
    //   return;
    // }
    if (!this.props.onDropdownVisibleChange(open, { documentClickClose })) {
      return;
    }
    this.setState(
      {
        open,
      },
      () => {
        if (needFocus || open) {
          // Input dom init after first time component render
          // Add delay for this to get focus
          Promise.resolve().then(() => {
            if (open || isMultiple(props)) {
              const input = this.getInputDOMNode();
              if (input && document.activeElement !== input) {
                input.focus();
              }
            } else if (this.selection) {
              this.selection.focus();
            }
          });
        }
      },
    );
  }

  clearSearchInput() {
    const input = this.getInputDOMNode();
    if (input && document.activeElement !== input) {
      input.focus();
    }
    if (!('inputValue' in this.props)) {
      this.setState({ inputValue: isEmpty(this.props.searchValue)? '' : isEmpty(this.props.searchValue) });
    }
  }

  addLabelToValue(props, value_) {
    let value = value_;
    if (this.isLabelInValue()) {
      value.forEach((v, i) => {
        if (Object.prototype.toString.call(value[i]) !== '[object Object]') {
          value[i] = {
            value: '',
            label: '',
          };
          return;
        }
        v.label = v.label || this.getLabelFromProps(props, v.value);
      });
    } else {
      value = value.map(v => {
        return {
          value: v,
          label: this.getLabelFromProps(props, v),
        };
      });
    }
    return value;
  }

  clearDelayTimer() {
    if (this.delayTimer) {
      clearTimeout(this.delayTimer);
      this.delayTimer = null;
    }
  }

  /**
   * 移除select值
   * @param {*} selectedVal
   */
  removeSelected(selectedVal) {
    const props = this.props;
    if (props.disabled) {
      return;
    }
    this._cacheTreeNodesStates = 'no';
    if (
      props.treeCheckable &&
      (props.showCheckedStrategy === SHOW_ALL || props.showCheckedStrategy === SHOW_PARENT) &&
      !(props.treeCheckStrictly || this.state.inputValue)
    ) {
      this.getDeselectedValue(selectedVal);
      return;
    }
    // click the node's `x`(in select box), likely trigger the TreeNode's `unCheck` event,
    // cautiously, they are completely different, think about it, the tree may not render at first,
    // but the nodes in select box are ready.
    let label;
    const value = this.state.value.filter(singleValue => {
      if (singleValue.value === selectedVal) {
        label = singleValue.label;
      }
      return singleValue.value !== selectedVal;
    });
    const canMultiple = isMultiple(props);

    if (canMultiple) {
      let event = selectedVal;
      if (this.isLabelInValue()) {
        event = {
          value: selectedVal,
          label,
        };
      }
      props.onDeselect(event);
    }
    if (props.treeCheckable) {
      if (this.checkedTreeNodes && this.checkedTreeNodes.length) {
        this.checkedTreeNodes = this._checkedNodes = this.checkedTreeNodes.filter(item => {
          return value.some(i => i.value === item.node.props.value);
        });
      }
    }
    this.fireChange(value, { triggerValue: selectedVal, clear: true });
  }

  openIfHasChildren() {
    const props = this.props;
    if (Children.count(props.children) || !isMultiple(props)) {
      this.setOpenState(true);
    }
  }

  fireChange(value, extraInfo = {}) {
    const props = this.props;
    const vals = value.map(i => i.value);
    const sv = this.state.value.map(i => i.value);
    if (vals.length !== sv.length || !vals.every((val, index) => sv[index] === val)) {
      const ex = {
        preValue: [...this.state.value],
        ...extraInfo,
      };
      let labs = null;
      let vls = value;
      if (!this.isLabelInValue()) {
        labs = value.map(i => i.label);
        vls = vls.map(v => v.value);
      } else if (this.halfCheckedValues && this.halfCheckedValues.length) {
        this.halfCheckedValues.forEach(i => {
          if (!vls.some(v => v.value === i.value)) {
            vls.push(i);
          }
        });
      }
      if (props.treeCheckable && ex.clear) {
        const treeData = this.renderedTreeData || props.children;
        ex.allCheckedNodes = flatToHierarchy(filterAllCheckedData(vals, treeData));
      }
      if (props.treeCheckable && this.state.inputValue) {
        const _vls = [...this.state.value];
        if (ex.checked) {
          value.forEach(i => {
            if (_vls.every(ii => ii.value !== i.value)) {
              _vls.push({ ...i });
            }
          });
        } else {
          let index;
          const includeVal = _vls.some((i, ind) => {
            if (i.value === ex.triggerValue) {
              index = ind;
              return true;
            }
          });
          if (includeVal) {
            _vls.splice(index, 1);
          }
        }
        vls = _vls;
        if (!this.isLabelInValue()) {
          labs = _vls.map(v => v.label);
          vls = _vls.map(v => v.value);
        }
      }
      this._savedValue = isMultiple(props) ? vls : vls[0];
      props.onChange(this._savedValue, labs, ex);
      if (!('value' in props)) {
        this._cacheTreeNodesStates = false;
        this.setState({
          value: this.getValue(
            props,
            toArray(this._savedValue).map((v, i) => {
              return this.isLabelInValue()
                ? v
                : {
                    value: v,
                    label: labs && labs[i],
                  };
            }),
          ),
        });
      }
    }
  }

  isLabelInValue() {
    const { treeCheckable, treeCheckStrictly, labelInValue } = this.props;
    if (treeCheckable && treeCheckStrictly) {
      return true;
    }
    return labelInValue || false;
  }

  focus() {
    if (!isMultiple(this.props)) {
      this.selection.focus();
    } else {
      this.getInputDOMNode().focus();
    }
  }

  blur() {
    if (!isMultiple(this.props)) {
      this.selection.blur();
    } else {
      this.getInputDOMNode().blur();
    }
  }

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
    if (inputValue || value.length) {
      return clear;
    }
    return null;
  }

  onArrowClick = e => {
    e.stopPropagation();
    e.preventDefault();
    if (!this.props.disabled) {
      this.onDropdownVisibleChange(!this.state.open);
    }
  };

  getPlaceholderElement = () => {
    const { props, state } = this;
    const placeholder = props.placeholder;
    if (placeholder) {
      return <div className={`${props.prefixCls}-selection__placeholder`}>{placeholder}</div>;
    }
    return null;
  };

  renderTopControlNode() {
    const { value } = this.state;
    const props = this.props;
    const { labelInValue, choiceTransitionName, prefixCls, maxTagTextLength, maxTagCount, maxTagPlaceholder,  choiceRender } = props;
    const multiple = isMultiple(props);

    // single and not combobox, input is inside dropdown
    if (!multiple) {
      const singleValue = value && value[0];
      const { label } = singleValue || {};
      const innerNode = (
        <span key="value" title={label} className={`${prefixCls}-selection-selected-value`}>
          {choiceRender ? choiceRender(label) : label}
        </span>
      );
      return (
        <div className={`${prefixCls}-selection__rendered`}>
          {this.getPlaceholderElement()}
          {innerNode}
          {this.renderClear()}
          {multiple || !props.showArrow ? null : (
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
    }

    // Check if `maxTagCount` is set
    let myValueList = value;
    if (maxTagCount >= 0) {
      myValueList = value.slice(0, maxTagCount);
    }


    const selectedValueNodes = myValueList.map(singleValue => {
      let content = singleValue.label;
      const title = content;
      if (maxTagTextLength && typeof content === 'string' && content.length > maxTagTextLength) {
        content = `${content.slice(0, maxTagTextLength)}...`;
      }
      return (
        <li
          style={UNSELECTABLE_STYLE}
          {...UNSELECTABLE_ATTRIBUTE}
          onMouseDown={preventDefaultEvent}
          className={`${prefixCls}-selection__choice`}
          key={singleValue.value}
          title={title}
        >
          <span
            className={`${prefixCls}-selection__choice__remove`}
            onClick={this.removeSelected.bind(this, singleValue.value)}
          >
            <i className="icon icon-cancel" />
          </span>
          <span className={`${prefixCls}-selection__choice__content`}>{content}</span>
        </li>
      );
    });
    if (maxTagCount >= 0 && maxTagCount < value.length) {
      let content = `+ ${value.length - maxTagCount} ...`;
      if (typeof maxTagPlaceholder === 'string') {
        content = maxTagPlaceholder;
      } else if (typeof maxTagPlaceholder === 'function') {
        const restValueList = value.slice(maxTagCount);
        content = maxTagPlaceholder(
          labelInValue ? restValueList : restValueList.map(({ value }) => value)
        );
      }
      const restNodeSelect = (
        <li
          style={UNSELECTABLE_STYLE}
          {...UNSELECTABLE_ATTRIBUTE}
          onMouseDown={preventDefaultEvent}
          className={`${prefixCls}-selection__choice`}
          key="rc-tree-select-internal-max-tag-counter"
          title={content}
        >
          <span className={`${prefixCls}-selection__choice__content`}>{content}</span>
        </li>
      );
      selectedValueNodes.push(restNodeSelect);
    }

    selectedValueNodes.push(
      <li className={`${prefixCls}-search ${prefixCls}-search--inline`} key="__input">
        {this.getInputElement()}
      </li>,
    );
    const className = `${prefixCls}-selection__rendered`;
    if (choiceTransitionName) {
      return (
        <div className={className}>
          <Animate
            component="ul"
            transitionName={choiceTransitionName}
            onLeave={this.onChoiceAnimationLeave}
          >
            {selectedValueNodes}
          </Animate>
        </div>
      );
    }
    return <ul className={className}>{selectedValueNodes}</ul>;
  }

  renderTreeData(props) {
    const validProps = props || this.props;
    if (validProps.treeData) {
      if (props && props.treeData === this.props.treeData && this.renderedTreeData) {
        // cache and use pre data.
        this._cachetreeData = true;
        return this.renderedTreeData;
      }
      this._cachetreeData = false;
      let treeData = [...validProps.treeData];
      // process treeDataSimpleMode
      if (validProps.treeDataSimpleMode) {
        let simpleFormat = {
          id: 'id',
          pId: 'pId',
          rootPId: null,
        };
        if (Object.prototype.toString.call(validProps.treeDataSimpleMode) === '[object Object]') {
          simpleFormat = { ...simpleFormat, ...validProps.treeDataSimpleMode };
        }
        treeData = processSimpleTreeData(treeData, simpleFormat);
      }
      return loopTreeData(treeData, undefined, this.props.treeCheckable);
    }
  }

  getUnderLine() {
    const { prefixCls, className } = this.props;

    if (className && className.includes(`${prefixCls}-auto-complete`)) {
      return null;
    }

    return (
      <div className={`${prefixCls}-underline`}>
        <span className={`${prefixCls}-ripple`} />
      </div>
    );
  }

  render() {
    const props = this.props;
    const multiple = isMultiple(props);
    const { open, focused, inputValue, value } = this.state;
    const { className, disabled, label, prefixCls } = props;
    const ctrlNode = this.renderTopControlNode();
    let extraSelectionProps = {};
    if (!multiple) {
      extraSelectionProps = {
        onKeyDown: this.onKeyDown,
        tabIndex: 0,
      };
    }
    const rootCls = {
      [className]: !!className,
      [prefixCls]: 1,
      [`${prefixCls}-has-border`]: 1,
      [`${prefixCls}-open`]: open,
      [`${prefixCls}-focused`]: open || focused,
      [`${prefixCls}-has-value`]: inputValue || (value.length && value[0]),
      [`${prefixCls}-has-label`]: label,
      [`${prefixCls}-multiple`]: multiple,
      // [`${prefixCls}-combobox`]: isCombobox(props),
      [`${prefixCls}-disabled`]: disabled,
      [`${prefixCls}-enabled`]: !disabled,
      [`${prefixCls}-allow-clear`]: !!props.allowClear,
    };

    return (
      <SelectTrigger
        {...props}
        treeNodes={props.children}
        treeData={this.renderedTreeData}
        _cachetreeData={this._cachetreeData}
        _treeNodesStates={this._treeNodesStates}
        halfCheckedValues={this.halfCheckedValues}
        multiple={multiple}
        disabled={disabled}
        visible={open}
        inputValue={inputValue}
        inputElement={this.getInputElement()}
        value={value}
        onDropdownVisibleChange={this.onDropdownVisibleChange}
        getPopupContainer={props.getPopupContainer}
        onSelect={this.onSelect}
        ref={saveRef(this, 'trigger')}
      >
        <div
          style={props.style}
          onClick={props.onClick}
          className={classnames(rootCls)}
          onBlur={props.onBlur}
          onFocus={props.onFocus}
        >
          <div
            ref={saveRef(this, 'selection')}
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
            {multiple ? this.getSearchPlaceholderElement(!!inputValue || value.length) : null}
          </div>
          {this.getUnderLine()}
        </div>
      </SelectTrigger>
    );
  }
}
