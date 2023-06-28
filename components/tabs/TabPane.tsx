import React, { CSSProperties, FunctionComponent, memo, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { action } from 'mobx';
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
  hidden?: boolean;
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
  const invalidComponents: Set<any> = useMemo(() => new Set<any>(), []);
  const { length } = dsList;
  const [rendered, setRendered] = useState(active);
  const prefixCls = `${rootPrefixCls}-tabpane`;
  const cls = classnames(prefixCls, active ? `${prefixCls}-active` : `${prefixCls}-inactive`, className);
  const paneRef = useRef<HTMLDivElement>(null);

  const handleValidationReport = useCallback(action<(props: { showInvalid, component }) => void>((validationProps) => {
    // why validationProps is undefined?
    if (validationProps) {
      const { showInvalid, component } = validationProps;
      if (!disabled && eventKey) {
        if (showInvalid) {
          invalidComponents.add(component);
        } else {
          invalidComponents.delete(component);
        }
        validationMap.set(eventKey, invalidComponents.size === 0);
      }
    }
  }), [eventKey, disabled, invalidComponents]);
  const handleValidate = useCallback(({ valid, dataSet }) => {
    handleValidationReport({
      showInvalid: !valid,
      component: dataSet,
    });
  }, [handleValidationReport]);
  const handleReset = useCallback(({ dataSet, record }) => {
    if (record) {
      const errors = dataSet.getAllValidationErrors();
      handleValidationReport({
        showInvalid: errors.dataSet.length > 0 || errors.records.length > 0,
        component: dataSet,
      });
    } else {
      handleValidationReport({
        showInvalid: false,
        component: dataSet,
      });
    }
  }, []);

  const handleRemove = useCallback(({ dataSet, records }) => {
    if (records) {
      const errors = dataSet.getAllValidationErrors();
      handleValidationReport({
        showInvalid: errors.dataSet.length > 0 || errors.records.length > 0,
        component: dataSet,
      });
    }
  }, []);

  useEffect(() => () => invalidComponents.clear(), []);

  useEffect(() => {
    if (!destroyInactiveTabPane && active) {
      setRendered(true);
    }
  }, [destroyInactiveTabPane, active]);

  useEffect(() => {
    if (length && !disabled) {
      dsList.forEach(
        ds => ds
          .addEventListener(DataSetEvents.validate, handleValidate)
          .addEventListener(DataSetEvents.validateSelf, handleValidate)
          .addEventListener(DataSetEvents.remove, handleRemove)
          .addEventListener(DataSetEvents.reset, handleReset),
      );
      return () => dsList.forEach(
        ds => ds
          .removeEventListener(DataSetEvents.validate, handleValidate)
          .removeEventListener(DataSetEvents.validateSelf, handleValidate)
          .removeEventListener(DataSetEvents.remove, handleRemove)
          .removeEventListener(DataSetEvents.reset, handleReset),
      );
    }
  }, [active, disabled, handleValidate, handleReset, handleRemove, length, ...dsList]);

  const childrenWithProvider = length ? children : (
    <ConfigProvider onComponentValidationReport={handleValidationReport}>
      {children}
    </ConfigProvider>
  );

  const handleFocus = () => {
    if (!active && paneRef.current) {
      paneRef.current.focus();
    }
  }

  return (
    <div
      style={style}
      role="tabpanel"
      aria-hidden={active ? 'false' : 'true'}
      className={cls}
      tabIndex={-1}
      data-node-key={eventKey} 
      ref={paneRef}
      onFocus={handleFocus}
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
  hidden: false,
};

export default MemoTabPane;
