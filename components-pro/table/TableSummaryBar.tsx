import React, { Component, ReactElement } from 'react';
import { observer } from 'mobx-react';
import { action, observable } from 'mobx';
import { BigNumber } from 'bignumber.js';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import classNames from 'classnames';
import Icon from 'choerodon-ui/lib/icon';
import { math } from 'choerodon-ui/dataset';
import {
  SummaryBar,
  SummaryBarHook,
  TableQueryBarHookCustomProps,
  SummaryBarConfigProps,
  TableQueryBarHook,
} from './Table';
import { TableQueryBarType } from './enum';
import { FieldType } from '../data-set/enum';
import { $l } from '../locale-context';
import TableContext, { TableContextValue } from './TableContext';
import isEmpty from '../_util/isEmpty';

export interface TableSummaryBarProps {
  queryBar?: TableQueryBarType | TableQueryBarHook | undefined;
  summaryFieldsLimit?: number;
  summaryBarFieldWidth?: number;
  summaryBar?: SummaryBar[];
  summaryBarConfigProps?: SummaryBarConfigProps;
}

@observer
export default class TableSummaryBar extends Component<TableSummaryBarProps> {
  static displayName = 'TableSummaryBar';

  static get contextType(): typeof TableContext {
    return TableContext;
  }

  context: TableContextValue;

  /**
   * 多行汇总
   */
  @observable showMoreSummary: boolean | undefined;

  /**
   * 渲染表头汇总列
   * @param summary
   */
  renderSummary(summary?: SummaryBar[]): ReactElement[] | undefined {
    if (summary) {
      const { length } = summary;
      if (length) {
        const { summaryBar, summaryBarConfigProps = {} } = this.props;
        const {
          separator,
          useColon = true,
          labelStyle,
        } = summaryBarConfigProps;
        const colon = useColon ? ':' : '';
        if (summaryBar) {
          const { length: summaryLength } = summaryBar;
          const {
            props: { summaryFieldsLimit, summaryBarFieldWidth },
            context: {
              tableStore,
              dataSet,
              prefixCls,
            },
          } = this;
          const { props: { queryBarProps } } = tableStore;
          const tableQueryBarProps = { ...tableStore.getConfig('queryBarProps'), ...queryBarProps } as TableQueryBarHookCustomProps;
          const summaryFieldsLimits: number = summaryFieldsLimit || (tableQueryBarProps && tableQueryBarProps.summaryFieldsLimit) || 3;
          const fieldTypeArr = [FieldType.currency, FieldType.number];
          return summary.reduce<ReactElement[]>((list, summaryCol, index) => {
            const hasSeparate = length > summaryFieldsLimits || index !== (summaryLength - 1);
            if (isString(summaryCol)) {
              const field = dataSet.getField(summaryCol);
              if (field && fieldTypeArr.includes(field.get('type'))) {
                const summaryValue = dataSet.reduce<number | BigNumber>((sum, record) => {
                  const n = record.get(summaryCol);
                  if (isNumber(n) ||  math.isBigNumber(n)) {
                    return math.plus(sum, n);
                  }
                  return sum;
                }, 0);
                const name = field.get('name');
                const label = field.get('label');
                const sumNode = math.isBigNumber(summaryValue) ? math.toString(summaryValue) : summaryValue;
                list.push(
                  <div key={name}>
                    <div className={`${prefixCls}-summary-col`} style={{ width: summaryBarFieldWidth }}>
                      <div className={`${prefixCls}-summary-col-label`} title={String(label)} style={labelStyle}>{label}{colon}</div>
                      <div className={`${prefixCls}-summary-col-value`} title={String(sumNode)}>{sumNode}</div>
                    </div>
                    {hasSeparate && <div className={classNames(`${prefixCls}-summary-col-separate`, {
                      [`${prefixCls}-summary-col-separate-custom`]: !isEmpty(separator),
                    })}>
                      <div>{separator}</div>
                    </div>}
                  </div>,
                );
              }
            } else if (typeof summaryCol === 'function') {
              const summaryObj = (summaryCol as SummaryBarHook)({ summaryFieldsLimit: summaryFieldsLimits, summaryBarFieldWidth, dataSet });
              list.push(
                <div key={isString(summaryObj.label) ? summaryObj.label : ''}>
                  <div className={`${prefixCls}-summary-col`} style={{ width: summaryBarFieldWidth }}>
                    <div
                      className={`${prefixCls}-summary-col-label`}
                      title={isString(summaryObj.label) ? summaryObj.label : ''}
                      style={labelStyle}
                    >
                      {summaryObj.label}{colon}
                    </div>
                    <div
                      className={`${prefixCls}-summary-col-value`}
                      title={isString(summaryObj.value) || isNumber(summaryObj.value) ? summaryObj.value.toString() : ''}
                    >
                      {summaryObj.value}
                    </div>
                  </div>
                  {hasSeparate && <div className={classNames(`${prefixCls}-summary-col-separate`, {
                    [`${prefixCls}-summary-col-separate-custom`]: !isEmpty(separator),
                  })}>
                    <div>{separator}</div>
                  </div>}
                </div>,
              );
            }
            return list;
          }, []);
        }
      }
    }
  }

  /**
   * 点击汇总条展开收起
   */
  @action
  toggleShowMoreSummary = () => {
    this.showMoreSummary = !this.showMoreSummary;
  };

  /**
   * 汇总条展开收起按钮
   * @param summary
   */
  getMoreSummaryButton(summary, moreStyle) {
    if (summary.length) {
      const { prefixCls } = this.context;
      return (
        <div className={`${prefixCls}-summary-button-more`} style={moreStyle}>
          <a
            onClick={() => this.toggleShowMoreSummary()}
          >
            {$l('Table', 'more')}
            {this.showMoreSummary ? <Icon type='expand_less' /> : <Icon type='expand_more' />}
          </a>
        </div>
      );
    }
  }

  /**
   * 渲染汇总条
   */
  getSummaryBar(): ReactElement<any> | undefined {
    const {
      props: {
        summaryBar,
        summaryFieldsLimit,
        summaryBarConfigProps = {},
        queryBar,
      },
      context: {
        prefixCls,
        tableStore,
      },
    } = this;
    const defaultPlacement = queryBar === 'professionalBar' ? 'topLeft' : 'topRight';
    const {
      placement = defaultPlacement,
      groupStyle,
      moreStyle,
    } = summaryBarConfigProps;
    const summaryBarCls = summaryBar && ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'].includes(placement)
      ? `${prefixCls}-summary-group-wrapper-${placement}` : '';
    const { props: { queryBarProps } } = tableStore;
    const tableQueryBarProps = { ...tableStore.getConfig('queryBarProps'), ...queryBarProps } as TableQueryBarHookCustomProps;
    const summaryFieldsLimits: number = summaryFieldsLimit || (tableQueryBarProps && tableQueryBarProps.summaryFieldsLimit) || 3;
    if (summaryBar) {
      const currentSummaryBar = this.renderSummary(summaryBar.slice(0, summaryFieldsLimits));
      const moreSummary = summaryBar.slice(summaryFieldsLimits);
      const moreSummaryBar = this.renderSummary(moreSummary);
      const moreSummaryButton: ReactElement | undefined = this.getMoreSummaryButton(moreSummary, moreStyle);
      return (
        <div className={classNames(`${prefixCls}-summary-group-wrapper`, summaryBarCls)}>
          <div className={`${prefixCls}-summary-group`} style={groupStyle}>
            {currentSummaryBar}
            {this.showMoreSummary && moreSummaryBar}
          </div>
          {moreSummaryButton}
        </div>
      );
    }
  }

  render() {
    const summaryBar = this.getSummaryBar();
    return (
      <>
        {summaryBar}
      </>
    );
  }
}
