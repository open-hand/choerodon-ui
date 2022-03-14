import React, { CSSProperties, FunctionComponent, memo, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import classnames from 'classnames';
import DataSet from 'choerodon-ui/dataset';
import { DataSetEvents } from 'choerodon-ui/dataset/data-set/enum';
import ConfigProvider from '../config-provider';
import { getDataAttr } from './utils';
import { CountRendererProps } from './Count';
import TabsContext from './TabsContext';

export interface TabPaneProps {
  /** 选项卡头显示文字 */
  tab?: ReactNode | ((title?: string) => ReactNode);
  title?: string;
  style?: CSSProperties;
  active?: boolean;
  closable?: boolean;
  className?: string;
  eventKey?: string;
  rootPrefixCls?: string;
  disabled?: boolean;
  forceRender?: boolean;
  destroyInactiveTabPane?: boolean;
  count?: number | (() => number | undefined);
  countRenderer?: (props: CountRendererProps) => ReactNode;
  overflowCount?: number;
  showCount?: boolean;
  placeholder?: ReactNode;
  sort?: number;
  dataSet?: DataSet | DataSet[];
  children?: ReactNode;
}

const TabPane: FunctionComponent<TabPaneProps> = function TabPane(props) {
  const {
    className,
    destroyInactiveTabPane,
    active,
    forceRender,
    rootPrefixCls,
    style,
    children,
    placeholder,
    disabled,
    dataSet,
    eventKey,
    ...restProps
  } = props;
  const { validationMap } = useContext(TabsContext);
  const dsList: DataSet[] = dataSet ? ([] as DataSet[]).concat(dataSet) : [];
  const invalidDataSets: Set<DataSet> = useMemo(() => new Set<DataSet>(), []);
  const { length } = dsList;
  const [rendered, setRendered] = useState(active);
  const prefixCls = `${rootPrefixCls}-tabpane`;
  const cls = classnames(prefixCls, active ? `${prefixCls}-active` : `${prefixCls}-inactive`, className);

  const handleValidate = useCallback(({ dataSet }) => {
    if (!disabled && eventKey) {
      const errors = dataSet.getAllValidationErrors();
      if (errors.dataSet.length || errors.records.length) {
        invalidDataSets.add(dataSet);
      } else {
        invalidDataSets.delete(dataSet);
      }
      validationMap.set(eventKey, invalidDataSets.size === 0);
    }
  }, [eventKey, disabled, invalidDataSets]);

  useEffect(() => () => invalidDataSets.clear(), []);

  useEffect(() => {
    if (!destroyInactiveTabPane && active) {
      setRendered(true);
    }
  }, [destroyInactiveTabPane, active]);

  useEffect(() => {
    if (length && !disabled) {
      dsList.forEach(ds => ds.addEventListener(DataSetEvents.validate, handleValidate).addEventListener(DataSetEvents.validateSelf, handleValidate));
      return () => dsList.forEach(ds => ds.removeEventListener(DataSetEvents.validate, handleValidate).removeEventListener(DataSetEvents.validateSelf, handleValidate));
    }
  }, [active, disabled, handleValidate, length, ...dsList]);

  const childrenWithProvider = length ? children : (
    <ConfigProvider onValidate={handleValidate} onValidateSelf={handleValidate}>
      {children}
    </ConfigProvider>
  );

  return (
    <div
      style={style}
      role="tabpanel"
      aria-hidden={active ? 'false' : 'true'}
      className={cls}
      {...getDataAttr(restProps)}
    >
      {forceRender || (destroyInactiveTabPane ? active : rendered) ? childrenWithProvider : placeholder}
    </div>
  );
};

TabPane.displayName = 'TabPane';

const MemoTabPane: typeof TabPane = memo(TabPane, (props, nextProps) => !nextProps.forceRender && !props.active && !nextProps.active);

MemoTabPane.defaultProps = {
  overflowCount: 99,
  showCount: true,
};

export default MemoTabPane;
