import React, { isValidElement, CSSProperties, FunctionComponent, ReactElement, ReactNode, useCallback, useContext, cloneElement, useMemo, JSXElementConstructor, useEffect, MouseEventHandler, useState } from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react-lite';
import { isArrayLike } from 'mobx';
import isString from 'lodash/isString';
import noop from 'lodash/noop';
import isObject from 'lodash/isObject';
import isFunction from 'lodash/isFunction';
import List, { ColumnCount } from 'choerodon-ui/lib/list';
import Icon from 'choerodon-ui/lib/icon';
import Card from 'choerodon-ui/lib/card';
import ReactResizeObserver from 'choerodon-ui/lib/_util/resizeObserver';
import DataSet from '../data-set';
import BoardContext from './BoardContext';
import TableDynamicFilterBar from '../table/query-bar/TableDynamicFilterBar';
import Field from '../data-set/Field';
import { getEditorByField, getPlaceholderByField } from '../table/utils';
import { TableButtonProps, TableQueryBarHookCustomProps } from '../table/Table';
import Button, { ButtonProps } from '../button/Button';
import { ButtonColor, ButtonType, FuncType } from '../button/enum';
import { useModal } from '../modal-provider/ModalProvider';
import { ModalProps } from '../modal/interface';
import { $l } from '../locale-context';
import KanbanCustomizationSettings from './kanban-customization-settings';
import { ViewField, ViewMode } from './enum';
import Output from '../output';
import CardCommand from './CardCommand';
import { DropDownProps } from '../dropdown/interface';
import { Buttons, TableButtonType } from '../table/interface';
import { DataSetStatus } from '../data-set/interface';
import Menu from '../menu';
import Dropdown from '../dropdown/Dropdown';
import Typography from '../typography';

export interface CardContentProps {
  animated?: boolean | undefined;
  animatedWithMargin?: boolean;
  destroyInactiveTabPane?: boolean | undefined;
  queryBarProps?: Partial<TableQueryBarHookCustomProps>;
  style?: CSSProperties | undefined;
  // view: viewProps;
  buttons?: ReactElement<ButtonProps, string | JSXElementConstructor<any>>[];
  tableBtns: ReactElement<ButtonProps, string | JSXElementConstructor<any>>[] | Buttons[];
  cardProps?: any;
  buttonsLimit?: number;
}

const CardContent: FunctionComponent<CardContentProps> = function CardContent(props) {
  const { tableBtns, buttonsLimit, buttons, cardProps = {}, queryBarProps } = props;
  const { onChange, displayFields, renderButtons = noop, autoQuery, getConfig, getProPrefixCls, prefixCls = '', customizedDS, dataSet, queryFields, command, renderCommand, commandsLimit } = useContext(BoardContext);
  const viewProps = customizedDS!.current!.get(ViewField.viewProps);
  const [cardHeight, setCardHeight] = useState(0);

  const modal = useModal();
  const openCustomizationModal = useCallback(() => {
    const modalProps: ModalProps = {
      drawer: true,
      okFirst: false,
      title: '卡片视图配置',
      children: <KanbanCustomizationSettings viewMode={ViewMode.card} />,
      bodyStyle: {
        overflow: 'hidden auto',
        padding: 0,
      },
    };
    modalProps.okText = $l('Tabs', 'save');
    modal.open(modalProps);
  }, [modal]);

  const cardDS = useMemo(() => {
    const defaultSortParams = (dataSet!.combineSort && viewProps) ? viewProps[ViewField.combineSort] || [] : [];
    const orgFields = dataSet!.props.fields ? dataSet!.props.fields : [];
    const orderFields = orgFields.map((field) => {
      const orderField = defaultSortParams.find(of => of.sortName === field.name);
      const newField = { ...field };
      if (orderField) {
        newField.order = orderField.order;
      }
      return newField;
    });
    return new DataSet({
      ...dataSet!.props,
      fields: orderFields,
      ...cardProps.dsProps,
      autoQuery: false,
    });
  }, [dataSet!.props]);

  /**
   * 查询看板数据
   */
  const loadData = useCallback(async () => {
    dataSet!.setState('__CURRENTVIEWDS__', cardDS);
    if (isFunction(onChange) && customizedDS) {
      const changed = customizedDS.getState('__ISCHANGE__');
      if (changed) {
        onChange({ dataSet, currentViewDS: cardDS, record: customizedDS!.current })
      }
    }
    if (autoQuery) {
      await cardDS.query();
    }
  }, [dataSet, cardDS]);

  useEffect(() => {
    loadData();
  }, [dataSet, cardDS]);

  const cls = classnames(
    `${prefixCls}-card-wrapper`,
    {
    },
    // className,
  );

  /**
* 渲染查询条字段组件
*/
  const getQueryFields = useCallback((): ReactElement<any>[] => {
    const { queryDataSet } = cardDS;
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
    const disabled = cardDS.status !== DataSetStatus.ready;
    switch (type) {
      case TableButtonType.add:
        return {
          icon: 'playlist_add',
          onClick: () => cardDS.create({}, 0),
          children: $l('Table', 'create_button'),
          disabled: disabled || (cardDS.parent ? !cardDS.parent.current : false),
        };
      case TableButtonType.save:
        return {
          icon: 'save',
          onClick: () => cardDS.submit(),
          children: $l('Table', 'save_button'),
          type: ButtonType.submit,
          disabled,
        };
      case TableButtonType.delete:
        return {
          icon: 'delete',
          onClick: () => cardDS.delete(cardDS.selected),
          children: $l('Table', 'delete_button'),
          disabled: disabled || cardDS.selected.length === 0,
        };
      case TableButtonType.remove:
        return {
          icon: 'remove_circle',
          onClick: () => cardDS.remove(cardDS.selected),
          children: $l('Table', 'remove_button'),
          disabled: disabled || cardDS.selected.length === 0,
        };
      case TableButtonType.reset:
        return {
          icon: 'undo',
          onClick: () => cardDS.reset(),
          children: $l('Table', 'reset_button'),
          type: ButtonType.reset,
        };
      case TableButtonType.query:
        return {
          icon: 'search',
          onClick: async () => {
            if (await cardDS.modifiedCheck(undefined, dataSet, 'query') && cardDS.queryDataSet && cardDS.queryDataSet.current && await cardDS.queryDataSet.current.validate()) {
              return cardDS.query();
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
  }, [tableBtns, cardDS])

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
        const getBtns = getButtons(renderButtons({ viewMode: ViewMode.card, dataSet: cardDS, buttons: tableButtons }));
        mergeButtons.push(getBtns);
      }
      mergeButtons.unshift(
        <Button
          className={`${prefixCls}-hover-button`}
          funcType={FuncType.flat}
          color={ButtonColor.primary}
          hidden={customizedDS!.current?.get(ViewField.id) === '__DEFAULT__'}
          icon="settings-o"
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
      buttonRenderer.unshift(renderButtons({ viewMode: ViewMode.card, dataSet: cardDS, buttons: tableBtns }));
    }
    return buttonRenderer;
  }

  const handleResize = useCallback((_width: number, height: number) => {
    if (height > cardHeight) {
      setCardHeight(height + 1);
    }
  }, [cardHeight]);
  
  useEffect(() => {
    setCardHeight(0);
  }, [customizedDS!.current]);

  return (
    <div style={{ height: '100%' }}>
      {cardDS && cardDS.queryDataSet ? (
        <TableDynamicFilterBar
          {...queryBarProps}
          dataSet={cardDS}
          queryDataSet={cardDS.queryDataSet}
          queryFields={getQueryFields()}
          buttons={getCustomizationIcon()}
        />
      ) : getCustomizationIcon()}
      <div className={cls}>
        <List
          // @ts-ignore
          style={{
            height: viewProps && viewProps.viewHeight || 366,
            overflowX: 'hidden',
            overflowY: 'auto',
          }}
          grid={{ gutter: 16, column: (24 / customizedDS!.current!.get(ViewField.cardWidth)) as ColumnCount || 4 as ColumnCount }}
          dataSet={cardDS}
          pagination={!!cardDS.paging}
          renderItem={({ record }) => (
            <List.Item key={`${record.id}-card`} className={`${prefixCls}-card-container`}>
              <ReactResizeObserver resizeProp="height" onResize={handleResize} immediately>
                <Card
                  key={`${record.id}-card-content`}
                  {...cardProps}
                  selected={record.isSelected}
                  style={{
                    ...cardProps.style,
                    minHeight: cardHeight,
                  }}
                  title={viewProps && viewProps.displayFields ?
                    <Typography.Paragraph
                      ellipsis={{ rows: 2, tooltip: <Output name={viewProps.displayFields[0]} record={record} renderer={displayFields.find(df => df.name === viewProps.displayFields[0]) ? displayFields.find(df => df.name === viewProps.displayFields[0]).renderer : noop} /> }}
                      name={viewProps.displayFields[0]}
                      record={record}
                      renderer={displayFields.find(df => df.name === viewProps.displayFields[0]) ? displayFields.find(df => df.name === viewProps.displayFields[0]).renderer : noop}
                    />
                    : null}
                  onClick={
                    (e) => {
                      if (cardDS.selection) {
                        if (record.isSelected) {
                          cardDS.unSelect(record);
                        } else {
                          cardDS.select(record);
                        }
                      }
                      if (isFunction(cardProps.onClick)) {
                        cardProps.onClick(e, record)
                      }
                    }
                  }
                  onHeadClick={
                    (e) => {
                      if (isFunction(cardProps.onHeadClick)) {
                        cardProps.onHeadClick(e, record)
                      }
                    }
                  }
                  extra={
                    <CardCommand
                      command={command}
                      dataSet={cardDS}
                      record={record}
                      renderCommand={renderCommand}
                      prefixCls={prefixCls}
                      viewMode={ViewMode.card}
                      commandsLimit={commandsLimit}
                    />
                  }
                >
                  {viewProps && viewProps.displayFields ? viewProps.displayFields.map(fieldName => (
                    <div key={`${fieldName}-card-label`} className={`${prefixCls}-quote-content-item`}>
                      <span className={`${prefixCls}-quote-content-label`} hidden={!viewProps.showLabel}>
                        {record.getField(fieldName).get('label')}
                      </span>
                      <Typography.Text
                        ellipsis={{
                          tooltip: true,
                        }}
                        name={fieldName}
                        record={record}
                        renderer={displayFields.find(df => df.name === fieldName) ? displayFields.find(df => df.name === fieldName).renderer : noop}
                      />
                    </div>
                  )) : null}
                </Card>
              </ReactResizeObserver>
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};

CardContent.defaultProps = {
  animated: true,
};

CardContent.displayName = 'CardContent';

export default observer(CardContent);