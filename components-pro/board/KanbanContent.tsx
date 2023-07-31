import React, { isValidElement, CSSProperties, FunctionComponent, ReactElement, ReactNode, useCallback, useContext, useEffect, useState, cloneElement, useMemo, JSXElementConstructor, MouseEventHandler } from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react-lite';
import { DragDropContext } from 'react-beautiful-dnd';
import { isArrayLike } from 'mobx';
import isString from 'lodash/isString';
import noop from 'lodash/noop';
import isObject from 'lodash/isObject';
import isFunction from 'lodash/isFunction';
import uniqWith from 'lodash/uniqWith';
import isEqual from 'lodash/isEqual';
import Icon from 'choerodon-ui/lib/icon';
import { Row } from 'choerodon-ui/lib/grid';
import DataSet from '../data-set';
import KanbanColumn, { KanbanColumnProps } from './KanbanColumn';
import BoardContext from './BoardContext';
import TableDynamicFilterBar from '../table/query-bar/TableDynamicFilterBar';
import Field from '../data-set/Field';
import { TableQueryBarHookCustomProps } from '../table/Table';
import { getEditorByField, getPlaceholderByField } from '../table/utils';
import Button, { ButtonProps } from '../button/Button';
import { ButtonColor, ButtonType, FuncType } from '../button/enum';
import { useModal } from '../modal-provider/ModalProvider';
import { ModalProps } from '../modal/interface';
import { $l } from '../locale-context';
import KanbanCustomizationSettings from './kanban-customization-settings';
import { ViewField, ViewMode } from './enum';
import { KanbanProps } from './Board';
import { Buttons, TableButtonProps, TableButtonType } from '../table/interface';
import { DataSetStatus } from '../data-set/interface';
import Dropdown, { DropDownProps } from '../dropdown/Dropdown';
import Menu from '../menu';

export interface KanbanContentProps {
  animated?: boolean | undefined;
  animatedWithMargin?: boolean;
  destroyInactiveTabPane?: boolean | undefined;
  // queryFields: ReactElement<any>[];
  queryBarProps?: Partial<TableQueryBarHookCustomProps>;
  style?: CSSProperties | undefined;
  kanbanProps?: KanbanProps;
  // record: Record;
  dataSet: DataSet;
  buttons?: ReactElement<ButtonProps>[];
  buttonsLimit?: number;
  tableBtns: ReactElement<ButtonProps, string | JSXElementConstructor<any>>[] | Buttons[];
}

const KanbanContent: FunctionComponent<KanbanContentProps> = function KanbanContent(props) {
  const { dataSet, buttons, kanbanProps = {} as KanbanProps, tableBtns, buttonsLimit, queryBarProps } = props;
  const { onChange, getConfig, getProPrefixCls, prefixCls = '', customizedDS, queryFields, autoQuery, renderButtons = noop } = useContext(BoardContext);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [columnData, setColumnData] = useState<Object[] | null>();
  const groupField = customizedDS!.current!.get(ViewField.groupField);
  const viewProps = customizedDS!.current!.get(ViewField.viewProps);
  const dataKey = kanbanProps.columnDsProps ? kanbanProps.columnDsProps.dataKey || getConfig('dataKey') : getConfig('dataKey');
  const totalKey = kanbanProps.columnDsProps ? kanbanProps.columnDsProps.totalKey || getConfig('totalKey') : getConfig('dataKey');
  const dsField = useMemo(() => dataSet.fields.get(groupField), [dataSet, groupField]);


  const modal = useModal();
  const openCustomizationModal = useCallback(() => {
    const modalProps: ModalProps = {
      drawer: true,
      title: '看板视图配置',
      children: <KanbanCustomizationSettings viewMode={ViewMode.kanban} />,
      bodyStyle: {
        overflow: 'hidden auto',
        padding: 0,
      },
    };
    modalProps.okText = $l('Tabs', 'save');
    modal.open(modalProps);
  }, [modal]);

  const kanbanDS = useMemo(() => {
    const defaultSortParams = (dataSet!.combineSort && viewProps) ? viewProps[ViewField.combineSort] || [] : [];
    const orgFields = dataSet.props.fields ? dataSet.props.fields : [];
    const orderFields = orgFields.map((field) => {
      const orderField = defaultSortParams.find(of => of.sortName === field.name);
      const newField = { ...field };
      if (orderField) {
        newField.order = orderField.order;
      }
      return newField;
    });
    return new DataSet({
      ...dataSet.props,
      dataKey: 'null',
      fields: orderFields,
      ...kanbanProps.allDsProps,
      autoQuery: false,
    });
  }, []);

  const loadColumnData = useCallback(async () => {
    setLoaded(false);
    if (dsField && dsField.getOptions() && dsField.getOptions()!.toData().length) {
      const res = [...dsField.getOptions()!.toData()];
      res.unshift({});
      setColumnData(uniqWith(res, isEqual));
      kanbanDS.setQueryParameter('groupingBy', dsField.name);
      dataSet.setState('__CURRENTVIEWDS__', kanbanDS);
      const changed = customizedDS && customizedDS.getState('__ISCHANGE__');
      if (isFunction(onChange) && changed) {
        onChange({ dataSet, currentViewDS: kanbanDS, record: customizedDS!.current })
      }
      if (autoQuery) {
        await kanbanDS.query();
      }
      setLoaded(true);
    } else if (dsField) {
      try {
        const res = await dsField!.fetchLookup(true);
        if (res && res.length) {
          res.unshift({});
          setColumnData(uniqWith(res, isEqual));
          kanbanDS.setQueryParameter('groupingBy', dsField.name);
          dataSet.setState('__CURRENTVIEWDS__', kanbanDS);
          const changed = customizedDS && customizedDS.getState('__ISCHANGE__');
          if (isFunction(onChange) && changed) {
            onChange({ dataSet, currentViewDS: kanbanDS, record: customizedDS!.current })
          }
          if (autoQuery) {
            await kanbanDS.query();
          }
          setLoaded(true);
        }
      } finally {
        setLoaded(true);
      }
    }
  }, [dsField, dataSet]);

  useEffect(() => {
    loadColumnData();
  }, [dataSet, customizedDS!.current, groupField, kanbanProps]);

  /**
   * 根据列数据渲染列组件  
   * @returns 看板列组件
   */
  const getBoardColumns = useCallback((): ReactElement<KanbanColumnProps>[] | null => {
    if (dsField && columnData && loaded) {
      const groupFieldName = dsField.get('name');
      const groupValueField = dsField.get('valueField');
      const groupTextField = dsField.get('textField');
      return columnData.map(groupRecord => {
        const groupValue = groupRecord[groupValueField];
        const groupText = groupRecord[groupTextField];
        const kanbanQuote = kanbanDS.find(record => record.get(groupFieldName) === groupValue);
        kanbanDS.setState(`${groupValue === undefined ? '_empty' : groupValue}_totalCount`, kanbanQuote ? kanbanQuote.get(totalKey) : undefined);
        return (
          <KanbanColumn
            key={groupValue === undefined ? '_empty' : groupValue}
            kanbanProps={kanbanProps}
            prefixCls={prefixCls}
            quotes={kanbanQuote ? kanbanQuote.get(dataKey) : []}
            kanbanDS={kanbanDS}
            columnId={groupValue === undefined ? '_empty' : groupValue}
            header={groupText || '未分组'}
            groupingBy={groupFieldName}
          />
        )
      });
    }
    return null;
  }, [columnData, loaded]);

  const cls = classnames(
    `${prefixCls}-wrapper`,
    {
    },
    // className,
  );

  /**
* buttons 大于 buttonsLimits 放入下拉
* @param buttonsLimits
*/
  const getMoreButton = (buttonsLimits: number): ReactElement => {
    const tableButtonProps = getConfig('tableButtonProps');
    const children: ReactElement<ButtonProps | DropDownProps>[] = [];
    if (tableBtns && tableBtns.length && buttonsLimits) {
      tableBtns.slice(buttonsLimits).forEach(button => {
        let props: TableButtonProps = {};
        if (isArrayLike(button)) {
          props = button[1] || {};
          button = button[0];
        }
        if (isString(button) && button in TableButtonType) {
          const { afterClick, ...buttonProps } = props;
          const defaultButtonProps = getButtonProps(button as TableButtonType);
          if (defaultButtonProps) {
            if (afterClick) {
              const { onClick } = defaultButtonProps;
              defaultButtonProps.onClick = async e => {
                e.persist();
                try {
                  await onClick(e);
                } finally {
                  afterClick(e);
                }
              };
            }
            children.push(
              <Menu.Item hidden={tableButtonProps.hidden} key={button}>
                <Button
                  key={`${button}-btn`}
                  {...tableButtonProps}
                  {...defaultButtonProps}
                  {...buttonProps}
                  funcType={FuncType.link}
                />
              </Menu.Item>,
            );
          }
        } else if (isValidElement<ButtonProps>(button)) {
          children.push(
            <Menu.Item hidden={button.props.hidden}>
              {cloneElement(button, { ...tableButtonProps, ...button.props, funcType: FuncType.link })}
            </Menu.Item>,
          );
        } else if (isObject(button)) {
          children.push(
            <Menu.Item hidden={props.hidden}>
              <Button {...tableButtonProps} {...button} funcType={FuncType.link} />
            </Menu.Item>,
          );
        }
      });
    }
    const menu = (
      <Menu prefixCls={`${getProPrefixCls('table')}-dropdown-menu`}>
        {children}
      </Menu>
    );
    return (
      <Dropdown overlay={menu} key="dropdown_button">
        <Button {...tableButtonProps} key="more_button">
          <span>{$l('Table', 'more')}</span>
          <Icon type='expand_more' />
        </Button>
      </Dropdown>
    );
  }

  const getButtonProps = useCallback((
    type: TableButtonType,
  ): ButtonProps & { onClick: MouseEventHandler<any>; children?: ReactNode } | undefined => {
    const disabled = kanbanDS.status !== DataSetStatus.ready;
    switch (type) {
      case TableButtonType.add:
        return {
          icon: 'playlist_add',
          onClick: () => kanbanDS.create({}, 0),
          children: $l('Table', 'create_button'),
          disabled: disabled || (kanbanDS.parent ? !kanbanDS.parent.current : false),
        };
      case TableButtonType.save:
        return {
          icon: 'save',
          onClick: () => kanbanDS.submit(),
          children: $l('Table', 'save_button'),
          type: ButtonType.submit,
          disabled,
        };
      case TableButtonType.delete:
        return {
          icon: 'delete',
          onClick: () => kanbanDS.delete(kanbanDS.selected),
          children: $l('Table', 'delete_button'),
          disabled: disabled || kanbanDS.selected.length === 0,
        };
      case TableButtonType.remove:
        return {
          icon: 'remove_circle',
          onClick: () => kanbanDS.remove(kanbanDS.selected),
          children: $l('Table', 'remove_button'),
          disabled: disabled || kanbanDS.selected.length === 0,
        };
      case TableButtonType.reset:
        return {
          icon: 'undo',
          onClick: () => kanbanDS.reset(),
          children: $l('Table', 'reset_button'),
          type: ButtonType.reset,
        };
      case TableButtonType.query:
        return {
          icon: 'search',
          onClick: async () => {
            if (await kanbanDS.modifiedCheck(undefined, dataSet, 'query') && kanbanDS.queryDataSet && kanbanDS.queryDataSet.current && await kanbanDS.queryDataSet.current.validate()) {
              return kanbanDS.query();
            }
          },
          children: $l('Table', 'query_button'),
        };
      case TableButtonType.export:
        return undefined;
      case TableButtonType.expandAll:
        return undefined;
      case TableButtonType.collapseAll:
        return undefined;
      default:
    }
  }, []);

  const getButtons = useCallback((buttonsArr?: ReactElement<ButtonProps>[]): ReactElement<ButtonProps>[] => {
    const children: ReactElement<ButtonProps | DropDownProps>[] = [];
    const buttons = buttonsArr || tableBtns;
    if (buttons) {
      const tableButtonProps = getConfig('tableButtonProps');
      const buttonsArr = buttons.slice(0, buttonsLimit);
      buttonsArr.forEach(button => {
        let props: TableButtonProps = {};
        if (isArrayLike(button)) {
          props = button[1] || {};
          button = button[0];
        }
        if (isString(button) && button in TableButtonType) {
          const { afterClick, ...buttonProps } = props;
          const defaultButtonProps = getButtonProps(button as TableButtonType);
          if (defaultButtonProps) {
            if (afterClick) {
              const { onClick } = defaultButtonProps;
              defaultButtonProps.onClick = async e => {
                e.persist();
                try {
                  await onClick(e);
                } finally {
                  afterClick(e);
                }
              };
            }
            children.push(
              <Button
                key={button}
                {...tableButtonProps}
                {...defaultButtonProps}
                {...buttonProps}
              />,
            );
          }
        } else if (isValidElement<ButtonProps>(button)) {
          children.push(cloneElement(button, { ...tableButtonProps, ...button.props }));
        } else if (isObject(button)) {
          children.push(<Button {...tableButtonProps} {...button} />);
        }
      });
      if (buttonsLimit && buttons.length > buttonsLimit) {
        const moreButton: ReactElement = getMoreButton(buttonsLimit);
        children.push(moreButton);
      }
    }
    return children;
  }, [tableBtns, kanbanDS])

  const getCustomizationIcon = (): ReactElement<ButtonProps>[] => {
    // 是否存在切换面板按钮
    const hasButtons = buttons && buttons.length;
    // 是否存在视图按钮控制
    const shouldRenderTableBtns = !isFunction(renderButtons);

    const tableButtons = getButtons();

    const mergeButtons: any = buttons && buttons.length ? [...buttons] : [];

    if (hasButtons) {
      if (shouldRenderTableBtns) {
        mergeButtons.push(tableButtons);
      } else {
        const getBtns = getButtons(renderButtons({ viewMode: ViewMode.card, dataSet: kanbanDS, buttons: tableButtons }));
        mergeButtons.push(getBtns);
      }
      mergeButtons.unshift(
        <Button
          key="settings"
          className={`${prefixCls}-hover-button`}
          funcType={FuncType.flat}
          color={ButtonColor.primary}
          icon="settings-o"
          hidden={customizedDS!.current?.get(ViewField.id) === '__DEFAULT__'}
          onClick={openCustomizationModal}
        />,
      );
      return mergeButtons;
    }

    const buttonRenderer = [
      <Button
        key="settings"
        className={`${prefixCls}-hover-button`}
        funcType={FuncType.flat}
        color={ButtonColor.primary}
        icon="settings-o"
        hidden={customizedDS!.current?.get(ViewField.id) === '__DEFAULT__'}
        onClick={openCustomizationModal}
      />,
    ];
    if (shouldRenderTableBtns) {
      buttonRenderer.unshift(tableBtns as any);
    } else {
      buttonRenderer.unshift(renderButtons({ viewMode: ViewMode.card, dataSet: kanbanDS, buttons: tableBtns }));
    }
    return buttonRenderer;
  }

  /**
 * 渲染查询条字段组件
 */
  const getQueryFields = useCallback((): ReactElement<any>[] => {
    const { queryDataSet } = kanbanDS;
    const result: ReactElement<any>[] = [];
    if (queryDataSet) {
      const { fields, current, props: { fields: propFields = [] } } = queryDataSet;
      const cloneFields: Map<string, Field> = fields.toJS();
      const tlsKey = getConfig('tlsKey');
      const processField = (field, name) => {
        if (!field.get('bind', current) && !name.includes(tlsKey)) {
          const element: ReactNode = queryFields![name];
          let filterBarProps = {};
          const inValidElement = getEditorByField(field, current, true);
          const placeholder = isValidElement(element) && element.props.placeholder ? element.props.placeholder : getPlaceholderByField(field, current);
          filterBarProps = {
            placeholder,
            border: false,
            clearButton: true,
          };

          const elementType = inValidElement.type as JSXElementConstructor<any>;
          if ((!isValidElement(element) || element.props.suffix === undefined) && ['Currency', 'ObserverNumberField', 'EmailField', 'UrlField', 'ObserverTextField'].indexOf(elementType.name) !== -1) {
            Object.assign(filterBarProps, { suffix: <Icon type="search" /> });
          }
          const props: any = {
            key: name,
            name,
            dataSet: queryDataSet,
            isFlat: true,
            ...filterBarProps,
          };
          result.push(
            isValidElement(element)
              ? cloneElement(element, props)
              : cloneElement(inValidElement, {
                ...props,
                ...(isObject(element) ? element : {}),
              }),
          );
        }
      };
      propFields.forEach(({ name }) => {
        if (name) {
          const field = cloneFields.get(name);
          if (field) {
            cloneFields.delete(name);
            processField(field, name);
          }
        }
      });
      cloneFields.forEach((field, name) => {
        processField(field, name);
      });
    }
    return result;
  }, []);

  const restDragDropContext = useCallback(() => {
    const { dragDropContext } = kanbanProps;
    if (isFunction(dragDropContext)) {
      return dragDropContext({ kanbanDS, dataSet })
    }
    return dragDropContext;
  }, [kanbanDS, dataSet]);

  return (
    <div style={{ height: '100%' }}>
      {kanbanDS && kanbanDS.queryDataSet ? (
        <TableDynamicFilterBar
          {...queryBarProps}
          dataSet={kanbanDS}
          queryDataSet={kanbanDS.queryDataSet}
          queryFields={getQueryFields()}
          buttons={getCustomizationIcon()}
        />
      ) : getCustomizationIcon()}
      <DragDropContext {...restDragDropContext()}>
        <Row gutter={16} className={cls}>
          {getBoardColumns()}
        </Row>
      </DragDropContext>
    </div>
  );
};

KanbanContent.defaultProps = {
  animated: true,
};

KanbanContent.displayName = 'KanbanContent';

export default observer(KanbanContent);