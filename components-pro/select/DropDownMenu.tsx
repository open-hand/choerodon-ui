import React, { cloneElement, Component, ReactElement } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';
import { observer, PropTypes as MobxPropTypes } from 'mobx-react';
import omit from 'lodash/omit';
import noop from 'lodash/noop';
import OptGroup, { OptGroupProps } from '../option/OptGroup';
import Option, { OptionProps } from '../option/Option';
import Record from '../data-set/Record';
import DataSetComponent, { DataSetComponentProps } from '../data-set/DataSetComponent';

export interface DropDownMenuProps extends DataSetComponentProps {
  textField: string;
  valueField: string;
  onOptionClick?: (record: Record) => void;
  options?: Record[];
}

@observer
export default class DropDownMenu extends DataSetComponent<DropDownMenuProps> {
  static displayName = 'DropDownMenu';

  static propTypes = {
    textField: PropTypes.string.isRequired,
    valueField: PropTypes.string.isRequired,
    onOptionClick: PropTypes.func,
    options: MobxPropTypes.arrayOrObservableArray,
    ...DataSetComponent.propTypes,
  };

  static defaultProps = {
    suffixCls: 'pro-dropdown-menu',
    textField: 'meaning',
    valueField: 'value',
  };

  currentNode?: Component<OptionProps>;

  getOtherProps() {
    return omit(super.getOtherProps(), [
      'textField',
      'valueField',
      'onOptionClick',
      'options',
    ]);
  }

  render() {
    const { dataSet, textField, valueField, options } = this.props;
    if (!dataSet) {
      return null;
    }
    const groups = dataSet.getGroups();
    const optGroups: ReactElement<OptGroupProps & { children }>[] = [];
    (options ? options : dataSet.data).forEach((record, index) => {
      let previousGroup: ReactElement<OptGroupProps & { children }> | undefined;
      groups.every((field) => {
        const label = record.get(field);
        if (label !== void 0) {
          if (!previousGroup) {
            previousGroup = optGroups.find(item => item.props.label === label);
            if (!previousGroup) {
              previousGroup = <OptGroup key={label} label={label} children={[]} level={1} />;
              optGroups.push(previousGroup);
            }
          } else {
            const { children, level } = previousGroup.props;
            previousGroup = children.find(item => item.props.label === label);
            if (!previousGroup) {
              previousGroup = <OptGroup key={label} label={label} children={[]} level={level + 1} />;
              children.push(previousGroup);
            }
          }
          return true;
        }
        return false;
      });
      const value = record.get(valueField);
      let classString: string[] = [];
      let ref;
      if (record.isSelected) {
        classString.push('selected');
      }
      if (record.isCurrent) {
        ref = (node) => this.currentNode = node;
        classString.push('current');
      }
      const text = record.get(textField);
      const option = (
        <Option
          selection={dataSet.selection}
          ref={ref}
          key={value && text ? `${value}-${text}` : index}
          value={value}
          level={1}
          className={classString.join(' ')}
          onClick={this.handleOptionClick.bind(this, record)}
        >
          {text}
        </Option>
      );
      if (previousGroup) {
        const { children, level } = previousGroup.props;
        children.push(cloneElement(option, { level: level + 1 }));
      } else {
        let preNode = optGroups[optGroups.length - 1];
        if (!preNode) {
          preNode = <ul key={optGroups.length} children={[]} />;
          optGroups.push(preNode);
        }
        preNode.props.children.push(option);
      }
    });

    return (
      <div
        {...this.getMergedProps()}
      >
        {optGroups}
      </div>
    );
  }

  componentDidMount() {
    this.syncScroll();
  }

  componentDidUpdate() {
    this.syncScroll();
  }

  handleOptionClick(record) {
    const { onOptionClick = noop } = this.props;
    onOptionClick(record);
  }

  syncScroll() {
    const { element, currentNode } = this;
    if (element && currentNode) {
      const { offsetTop, offsetHeight } = findDOMNode(currentNode) as HTMLLIElement;
      const { scrollTop, offsetHeight: height } = element;
      if (offsetTop < scrollTop) {
        element.scrollTop = offsetTop;
      } else if (offsetTop + offsetHeight > height) {
        element.scrollTop = offsetHeight + offsetTop - height;
      }
    }
  }
}
