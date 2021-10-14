import React, { Children, ReactElement, cloneElement } from 'react';
import { observer } from 'mobx-react';
import { observable, computed, action, runInAction, toJS } from 'mobx';
import Tag from 'choerodon-ui/lib/tag';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import isNil from 'lodash/isNil';
import omit from 'lodash/omit';
import warning from 'choerodon-ui/lib/_util/warning';
import isArray from 'lodash/isArray';
import isSame from '../_util/isSame';
import DataSetComponent, { DataSetComponentProps } from '../data-set/DataSetComponent';
import ScreeningItem, { ScreeningItemProps } from './ScreeningItem';
import DataSet from '../data-set';
import Record from '../data-set/Record';
import { $l } from '../locale-context';

export interface TagProps {
  text: string;
  label: string;
  handleClose: (key) => void;
  key: string;
}

export interface ScreeningProps extends DataSetComponentProps {
  dataSet: DataSet;
  children: ReactElement<ScreeningItemProps>[];
  tagRender?: ({ labelTitle, tagsProps }: { labelTitle: string; tagsProps: TagProps[] }) => ReactElement<any>;
  onChange?: (value: any, oldValue: any) => void;
}

@observer
export default class Screening extends DataSetComponent<ScreeningProps> {
  static displayName = 'Screening';

  static ScreeningItem = ScreeningItem;

  @observable mergeValue: any;

  emptyValue?: any = null;

  // 存下所有子集的ref便于直接调用其中内部方法
  child?: any = {};

  static defaultProps = {
    suffixCls: 'screening',
  };

  constructor(props, context) {
    super(props, context);
    const dataSet = this.dataSet;
    const record = this.record;
    runInAction(() => {
      if (dataSet && record) {
        this.mergeValue = record.toData();
      }
    });
  }

  onRef = (ref, name) => {
    this.child[name] = ref;
  };

  /**
   * return the record: dataIndex record, current, undefined
   */
  @computed
  get record(): Record | undefined {
    const { record, dataSet, dataIndex } = this.observableProps;
    if (record) {
      return record;
    }
    if (dataSet) {
      if (isNumber(dataIndex)) {
        return dataSet.get(dataIndex);
      }
      return dataSet.current;
    }
    return undefined;
  }

  @computed
  get dataSet(): DataSet | undefined {
    const { record } = this;
    if (record) {
      return record.dataSet;
    }
    return this.observableProps.dataSet;
  }

  handleChange = (value, oldValue) => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(value, oldValue);
    }
  };

  @action
  handleConfirm = ({ value, fieldName }) => {
    const oldValue = omit(toJS(this.mergeValue), '__dirty');
    if (fieldName) {
      this.mergeValue = {
        ...this.mergeValue, [fieldName]: value,
      };
    }
    const valueNow = omit(toJS(this.mergeValue), '__dirty');
    if (!isSame(oldValue, valueNow)) {
      this.handleChange(valueNow, oldValue);
    }
  };

  @action
  handleCloseItem = (filedName) => {
    const { dataSet } = this.props;
    if (dataSet && filedName) {
      (this.record || dataSet.create({})).set(filedName, this.emptyValue);
    }
    this.mergeValue[filedName] = this.emptyValue;
    if (this.child && this.child[filedName]) {
      this.child[filedName].handleClear();
    }
  };

  findByValue = (value, name) => {
    if (value && this.child && this.child[name]) {
      return this.child[name].processValue(value);
    }
    return value;
  };

  renderTag = (mergeValue) => {
    const { dataSet } = this;
    const prefixCls = this.prefixCls;
    const { tagRender } = this.props;
    const tagsProps: TagProps[] = [];
    if (dataSet) {
      Object.keys(mergeValue).forEach(key => {
        const value = mergeValue[key];
        const field = dataSet.getField(key);
        let label = key;
        let text = value;
        if (field) {
          const { record } = this;
          label = field.get('label', record);
          if (isArray(value)) {
            text = value.map(v => {
              let itemText = field.getText(v, undefined, record);
              if (isNil(itemText)) {
                itemText = this.findByValue(v, key);
              }
              return itemText;
            });
          } else {
            text = field.getText(value, undefined, record);
            if (isNil(text)) {
              text = this.findByValue(value, key);
            }
          }
        }
        if (text && label) {
          const tagProps = {
            text,
            label,
            handleClose: (filedName: string) => {
              this.handleCloseItem(filedName);
            },
            key,
          };
          tagsProps.push(tagProps);
        }
      });
      const labelTitle = `${$l('Screening', 'selected')}:`;
      const labelNode = (<span className={`${prefixCls}-choosed-label`}>{labelTitle}</span>);
      if (tagsProps.length > 0) {
        return tagRender ? tagRender({
          labelTitle,
          tagsProps,
        }) : (
          <div className={`${prefixCls}-choosed`}>
            <div className={`${prefixCls}-choosed-title`}>{labelNode}</div>
            <div className={`${prefixCls}-choosed-content`}>
              {tagsProps.map(tagItemProps => (
                <Tag
                  onClose={(e) => {
                    e.preventDefault();
                    tagItemProps.handleClose(tagItemProps.key);
                  }}
                  key={tagItemProps.key}
                  closable
                >
                  {`${tagItemProps.label}:${tagItemProps.text}`}
                </Tag>
              ))}
            </div>
          </div>
        );
      }
    }
    return null;
  };

  render() {
    const dataSet = this.dataSet;
    const { children } = this.props;
    let mergeValue = toJS(this.mergeValue);
    mergeValue = omit(mergeValue, ['__dirty']);
    const filteredChildren = Children.toArray(children).filter(c => !!c);
    return (
      <div className={`${this.prefixCls}`}>
        {this.renderTag(mergeValue)}
        {Children.map(filteredChildren, (child: ReactElement, _index) => {
          const name = child.props.name;
          if (this.mergeValue && name && isNil(this.mergeValue[name])) {
            const screenProps = {
              onConfirm: this.handleConfirm,
              onChange: this.handleChange,
              dataSet,
              onRef: (ref) => {
                this.onRef(ref, name);
              },
            };
            if (!isString(name)) {
              // @ts-expect-error: this should be optional
              delete screenProps.onRef;
              warning(false, `ScreeningItem need binding DataSet with property name.`);
            }
            return cloneElement(child, screenProps);
          }
        })}
      </div>
    );
  }
}
