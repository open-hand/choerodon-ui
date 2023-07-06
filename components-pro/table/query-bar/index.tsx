import React, { cloneElement, Component, isValidElement, MouseEventHandler, ReactElement, ReactNode, useState } from 'react';
import { observer } from 'mobx-react';
import { action, isArrayLike, observable } from 'mobx';
import { BigNumber } from 'bignumber.js';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import Icon from 'choerodon-ui/lib/icon';
import { DropDownProps } from 'choerodon-ui/lib/dropdown';
import { ProgressStatus } from 'choerodon-ui/lib/progress/enum';
import { math } from 'choerodon-ui/dataset';
import noop from 'lodash/noop';
import { TableButtonType, TableQueryBarType } from '../enum';
import TableButtons from './TableButtons';
import Table, {
  Buttons,
  ComboFilterBarConfig,
  DynamicFilterBarConfig,
  SummaryBar,
  SummaryBarHook,
  TableButtonProps,
  TableQueryBarHook,
  TableQueryBarHookCustomProps,
  TableQueryBarHookProps,
} from '../Table';
import Button, { ButtonProps } from '../../button/Button';
import Radio from '../../radio';
import { ButtonColor, ButtonType, FuncType } from '../../button/enum';
import { DataSetExportStatus, DataSetStatus, FieldType } from '../../data-set/enum';
import { $l } from '../../locale-context';
import TableContext, { TableContextValue } from '../TableContext';
import autobind from '../../_util/autobind';
import DataSet from '../../data-set';
import Modal from '../../modal';
import Progress from '../../progress';
import Column from '../Column';
import ColumnGroup from '../ColumnGroup';
import { getEditorByField, getPlaceholderByField, getTableHeaderRows } from '../utils';
import CombineSort from './CombineSort';
import TableToolBar from './TableToolBar';
import TableFilterBar from './TableFilterBar';
import TableAdvancedQueryBar from './TableAdvancedQueryBar';
import TableProfessionalBar from './TableProfessionalBar';
import TableComboBar from './TableComboBar';
import TableDynamicFilterBar from './TableDynamicFilterBar';
import { PaginationProps } from '../../pagination/Pagination';
import { exportExcel, findBindFieldBy } from '../../data-set/utils';
import Dropdown from '../../dropdown/Dropdown';
import Menu from '../../menu';
import TextField from '../../text-field';
import Field from '../../data-set/Field';

export interface TableQueryBarProps {
  buttons?: Buttons[];
  queryFields?: { [key: string]: ReactElement<any> };
  queryFieldsLimit?: number;
  buttonsLimit?: number;
  summaryFieldsLimit?: number;
  summaryBarFieldWidth?: number;
  showQueryBar?: boolean;
  pagination?: ReactElement<PaginationProps>;
  summaryBar?: SummaryBar[];
  dynamicFilterBar?: DynamicFilterBarConfig;
  filterBarFieldName?: string;
  filterBarPlaceholder?: string;
  searchCode?: string;
  clientExportQuantity?: number;
  onQuery?: () => void;
  onReset?: () => void;
  treeQueryExpanded?: boolean;
  comboFilterBar?: ComboFilterBarConfig;
}

const ExportBody = observer((props) => {
  const { dataSet, prefixCls } = props;
  let exportMessage = $l('Table', 'export_ing');
  let exportProgress = {
    percent: 1,
    status: ProgressStatus.active,
  };

  switch (dataSet.exportStatus) {
    case DataSetExportStatus.start:
      exportProgress = {
        percent: 1,
        status: ProgressStatus.active,
      };
      break;
    case DataSetExportStatus.exporting:
      exportProgress = {
        percent: dataSet.exportProgress,
        status: ProgressStatus.active,
      };
      break;
    case DataSetExportStatus.progressing:
      exportProgress = {
        percent: dataSet.exportProgress,
        status: ProgressStatus.active,
      };
      break;
    case DataSetExportStatus.failed:
      exportMessage = $l('Table', 'export_failed');
      exportProgress = {
        percent: 50,
        status: ProgressStatus.exception,
      };
      break;
    case DataSetExportStatus.success:
      exportMessage = $l('Table', 'export_success');
      exportProgress = {
        percent: 100,
        status: ProgressStatus.success,
      };
      break;
    default:
      break;
  }

  return (
    <div className={`${prefixCls}-export-progress-body`}>
      <span>
        {exportMessage}
      </span>
      <Progress {...exportProgress} />
    </div>
  );
});

const ExportFooter = observer((props) => {
  const { dataSet, prefixCls, exportButton } = props;
  const [username, setUsername] = useState(dataSet.name || $l('Table', 'default_export'));
  const handleClick = () => {
    exportButton(dataSet.exportStatus, username);
  };
  const [messageTimeout, setMessageTimeout] = useState<string | undefined>(undefined);

  React.useEffect(() => {
    let currentTimeout: any = null;
    currentTimeout = setTimeout(() => {
      if (dataSet && dataSet.exportStatus !== DataSetExportStatus.success && dataSet.exportStatus !== DataSetExportStatus.failed) {
        setMessageTimeout($l('Table', 'export_waiting'));
      }
    }, 5000);
    return () => {
      if (currentTimeout) {
        clearTimeout(currentTimeout);
      }
    };
  }, []);
  return (
    <div className={`${prefixCls}-export-progress-footer`}>
      {dataSet.exportStatus === DataSetExportStatus.failed && <><span>{$l('Table', 'export_break')}</span><Button
        onClick={handleClick}>{$l('Table', 'retry_button')}</Button></>}
      {dataSet.exportStatus === DataSetExportStatus.success && <>
        <div><span>{`${$l('Table', 'file_name')}:`}</span><TextField value={username} onChange={(value) => {
          setUsername(value);
        }} /></div>
        <Button color={ButtonColor.primary} onClick={handleClick}>{$l('Table', 'download_button')}</Button></>}
      {dataSet.exportStatus !== DataSetExportStatus.success &&
      dataSet.exportStatus !== DataSetExportStatus.failed &&
      <>
        <span>{messageTimeout || $l('Table', 'export_operating')}</span>
        <Button
          color={ButtonColor.gray}
          onClick={handleClick}
        >{$l('Table', 'cancel_button')}
        </Button>
      </>
      }
    </div>
  );
});

@observer
export default class TableQueryBar extends Component<TableQueryBarProps> {
  static displayName = 'TableQueryBar';

  static get contextType(): typeof TableContext {
    return TableContext;
  }

  context: TableContextValue;

  exportModal;

  exportDataSet: DataSet;

  exportData: any;

  queryFieldsElement: ReactElement<any>[] = [];

  /**
   * 多行汇总
   */
  @observable moreSummary: ReactElement[] | undefined;

  static defaultProps = {
    summaryBarFieldWidth: 170,
  };

  get showQueryBar(): boolean {
    const {
      props: { showQueryBar },
      context: {
        tableStore: { queryBar },
      },
    } = this;
    return showQueryBar !== false && queryBar !== TableQueryBarType.none;
  }

  componentWillUnmount() {
    if (this.exportModal) {
      this.exportModal.close(true);
    }
  }

  @autobind
  handleButtonCreate() {
    const {
      dataSet,
    } = this.context;
    dataSet.create({}, 0);
  }

  @autobind
  handleButtonSubmit() {
    const {
      dataSet,
    } = this.context;
    return dataSet.submit();
  }

  @autobind
  handleButtonDelete() {
    const {
      dataSet,
    } = this.context;
    return dataSet.delete(dataSet.selected);
  }

  @autobind
  handleButtonRemove() {
    const {
      dataSet,
    } = this.context;
    dataSet.remove(dataSet.selected);
  }

  @autobind
  handleButtonReset() {
    const {
      dataSet,
    } = this.context;
    dataSet.reset();
  }

  @autobind
  handleQueryReset() {
    const {
      dataSet: { queryDataSet },
    } = this.context;
    if (queryDataSet) {
      const { current } = queryDataSet;
      if (current) {
        current.reset();
      }
      this.handleQuery();
    }
  }

  @autobind
  handleExpandAll() {
    const { tableStore } = this.context;
    tableStore.expandAll();
  }

  @autobind
  handleCollapseAll() {
    const { tableStore } = this.context;
    tableStore.collapseAll();
  }

  @autobind
  handleChangeExportStrategy(value) {
    const { dataSet } = this.context;
    dataSet.setState('__EXPORT-STRATEGY__', value);
  }

  @autobind
  async handleButtonExport() {
    const { tableStore, prefixCls, tableStore: { getConfig } } = this.context;
    const columnHeaders = await tableStore.getColumnHeaders();
    this.exportDataSet = new DataSet({ data: columnHeaders, paging: false }, { getConfig: getConfig as any});
    this.exportDataSet.selectAll();
    this.handleChangeExportStrategy('ALL');
    this.exportModal = Modal.open({
      title: $l('Table', 'choose_export_columns'),
      children: (
        <>
          <Table dataSet={this.exportDataSet} style={{ height: pxToRem(300) }}>
            <Column header={$l('Table', 'column_name')} name="label" resizable={false} />
          </Table>
        </>
      ),
      closable: true,
      okText: $l('Table', 'export_button'),
      onOk: this.handleExport,
      footer: (okBtn, cancelBtn) => (
        <div className={`${prefixCls}-export-modal-footer`}>
          <div className={`${prefixCls}-export-modal-footer-radio`}>
            <Radio name="exportStrategy" value="ALL" defaultChecked onChange={this.handleChangeExportStrategy}>{$l('Table', 'export_all')}</Radio>
            <Radio name="exportStrategy" value="SELECTED" onChange={this.handleChangeExportStrategy}>{$l('Table', 'export_selected')}</Radio>
          </div>
          <div>
            {okBtn}
            {cancelBtn}
          </div>
        </div>
      ),
      style: {
        width: pxToRem(500),
      },
    });
  }

  @autobind
  async handleQuery() {
    const {
      tableStore,
      dataSet,
      dataSet: { queryDataSet },
    } = this.context;
    if (tableStore.queryBar === TableQueryBarType.filterBar) {
      if (await dataSet.modifiedCheck(undefined, dataSet, 'query') && queryDataSet && queryDataSet.current && await queryDataSet.current.validate()) {
        return dataSet.query();
      }
    } else {
      return dataSet.query();
    }
  }

  @autobind
  handleExport() {
    const { selected } = this.exportDataSet;
    const {
      props: { clientExportQuantity },
      context: {
        prefixCls, dataSet,
      },
    } = this;
    if (selected.length) {
      const { exportModal } = this;
      dataSet.export(
        selected.reduce((columns, record) => {
          let myName = record.get('name');
          const myField = dataSet.getField(myName);
          if (myField && myField.type === FieldType.object) {
            const bindField = findBindFieldBy(myField, dataSet.fields, 'textField');
            if (bindField) {
              myName = bindField.name;
            }
          }
          columns[myName] = record.get('label');
          return columns;
        }, {}),
        clientExportQuantity,
      ).then((exportData) => {
        this.exportData = exportData;
      });
      if (exportModal) {
        exportModal.update(
          {
            title: $l('Table', 'export_button'),
            children: (
              <ExportBody prefixCls={prefixCls} dataSet={dataSet} />
            ),
            onCancel: this.handleExportButton,
            footer: <ExportFooter prefixCls={prefixCls} exportButton={this.handleExportButton} exportModal={exportModal} dataSet={dataSet} />,
          });
      }
    }
    return false;
  }

  @autobind
  @action
  handleExportButton(data: DataSetExportStatus, filename?: string) {
    const {
      dataSet,
      tableStore,
    } = this.context;
    if (data === DataSetExportStatus.success) {
      if (this.exportData) {
        exportExcel(this.exportData, filename, tableStore.getConfig('xlsx'));
        this.exportModal.close();
        this.exportData = null;
      }
    } else if (data === DataSetExportStatus.failed) {
      this.exportData = null;
      this.handleExport();
    } else {
      this.exportModal.close();
      this.exportData = null;
    }
    dataSet.exportStatus = undefined;
  }

  getButtonProps(
    type: TableButtonType,
  ): ButtonProps & { onClick: MouseEventHandler<any>; children?: ReactNode } | undefined {
    const {
      isTree, dataSet,
    } = this.context;
    const disabled = dataSet.status !== DataSetStatus.ready;
    switch (type) {
      case TableButtonType.add:
        return {
          icon: 'playlist_add',
          onClick: this.handleButtonCreate,
          children: $l('Table', 'create_button'),
          disabled: disabled || (dataSet.parent ? !dataSet.parent.current : false),
        };
      case TableButtonType.save:
        return {
          icon: 'save',
          onClick: this.handleButtonSubmit,
          children: $l('Table', 'save_button'),
          type: ButtonType.submit,
          disabled,
        };
      case TableButtonType.delete:
        return {
          icon: 'delete',
          onClick: this.handleButtonDelete,
          children: $l('Table', 'delete_button'),
          disabled: disabled || dataSet.selected.length === 0,
        };
      case TableButtonType.remove:
        return {
          icon: 'remove_circle',
          onClick: this.handleButtonRemove,
          children: $l('Table', 'remove_button'),
          disabled: disabled || dataSet.selected.length === 0,
        };
      case TableButtonType.reset:
        return {
          icon: 'undo',
          onClick: this.handleButtonReset,
          children: $l('Table', 'reset_button'),
          type: ButtonType.reset,
        };
      case TableButtonType.query:
        return { icon: 'search', onClick: this.handleQuery, children: $l('Table', 'query_button') };
      case TableButtonType.export:
        return {
          icon: 'export',
          onClick: this.handleButtonExport,
          children: $l('Table', 'export_button'),
        };
      case TableButtonType.expandAll:
        return isTree
          ? {
            icon: 'add_box',
            onClick: this.handleExpandAll,
            children: $l('Table', 'expand_button'),
          }
          : undefined;
      case TableButtonType.collapseAll:
        return isTree
          ? {
            icon: 'short_text',
            onClick: this.handleCollapseAll,
            children: $l('Table', 'collapse_button'),
          }
          : undefined;
      default:
    }
  }

  /**
   * 渲染表头汇总列
   * @param summary
   */
  renderSummary(summary?: SummaryBar[]): ReactElement[] | undefined {
    if (summary) {
      const { length } = summary;
      if (length) {
        const { summaryBar } = this.props;
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
                list.push(
                  <div key={name}>
                    <div className={`${prefixCls}-summary-col`} style={{ width: summaryBarFieldWidth }}>
                      <div className={`${prefixCls}-summary-col-label`} title={String(label)}>{label}:</div>
                      <div className={`${prefixCls}-summary-col-value`} title={String(summaryValue)}>{summaryValue}</div>
                    </div>
                    {hasSeparate && <div className={`${prefixCls}-summary-col-separate`}>
                      <div />
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
                    >
                      {summaryObj.label}:
                    </div>
                    <div
                      className={`${prefixCls}-summary-col-value`}
                      title={isString(summaryObj.value) || isNumber(summaryObj.value) ? summaryObj.value.toString() : ''}
                    >
                      {summaryObj.value}
                    </div>
                  </div>
                  {hasSeparate && <div className={`${prefixCls}-summary-col-separate`}>
                    <div />
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
   * @param summary
   */
  @action
  openMore = (summary?: SummaryBar[]) => {
    if (this.moreSummary && this.moreSummary.length) {
      this.moreSummary = [];
    } else {
      this.moreSummary = this.renderSummary(summary);
    }
    return this.moreSummary;
  };

  /**
   * 汇总条展开收起按钮
   * @param summary
   */
  getMoreSummaryButton(summary: SummaryBar[]) {
    if (summary.length) {
      const { prefixCls } = this.context;
      return (
        <div className={`${prefixCls}-summary-button-more`}>
          <a
            onClick={() => this.openMore(summary)}
          >
            {$l('Table', 'more')}
            {this.moreSummary && this.moreSummary.length ? <Icon type='expand_less' /> : <Icon type='expand_more' />}
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
      },
      context: {
        prefixCls,
        tableStore,
      },
    } = this;
    const { props: { queryBarProps } } = tableStore;
    const tableQueryBarProps = { ...tableStore.getConfig('queryBarProps'), ...queryBarProps } as TableQueryBarHookCustomProps;
    const summaryFieldsLimits: number = summaryFieldsLimit || (tableQueryBarProps && tableQueryBarProps.summaryFieldsLimit) || 3;
    if (summaryBar) {
      const currentSummaryBar = this.renderSummary(summaryBar.slice(0, summaryFieldsLimits));
      const moreSummary = summaryBar.slice(summaryFieldsLimits);
      const moreSummaryButton: ReactElement | undefined = this.getMoreSummaryButton(moreSummary);
      return (
        <div className={`${prefixCls}-summary-group-wrapper`}>
          <div className={`${prefixCls}-summary-group`}>
            {currentSummaryBar}
            {this.moreSummary}
          </div>
          {moreSummaryButton}
        </div>
      );
    }
  }

  /**
   * buttons 大于 buttonsLimits 放入下拉
   * @param buttonsLimits
   */
  getMoreButton(buttonsLimits: number): ReactElement {
    const { buttons } = this.props;
    const { prefixCls, tableStore } = this.context;
    const tableButtonProps = tableStore.getConfig('tableButtonProps');
    const children: ReactElement<ButtonProps | DropDownProps>[] = [];
    if (buttons && buttons.length && buttonsLimits) {
      buttons.slice(buttonsLimits).forEach(button => {
        let props: TableButtonProps = {};
        if (isArrayLike(button)) {
          props = button[1] || {};
          button = button[0];
        }
        if (isString(button) && button in TableButtonType) {
          const { afterClick, ...buttonProps } = props;
          const defaultButtonProps = this.getButtonProps(button);
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
            <Menu.Item hidden={button.props.hidden} key={button.key}> 
              {cloneElement(button, { ...tableButtonProps, ...button.props, funcType: FuncType.link })}
            </Menu.Item>,
          );
        } else if (isObject(button)) {
          children.push(
            <Menu.Item hidden={props.hidden} key={(button as ButtonProps).key}> 
              <Button {...tableButtonProps} {...button} funcType={FuncType.link}/>
            </Menu.Item>,
          );
        }
      });
    }
    const menu = (
      <Menu prefixCls={`${prefixCls}-dropdown-menu`}>
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

  getButtons(): ReactElement<ButtonProps>[] {
    const { tableStore: { queryBar, prefixCls, dataSet, customizedBtn, customizable, customizedColumnHeader } } = this.context;
    const { buttons: originalButtons, summaryBar, buttonsLimit } = this.props;
    const { tableStore } = this.context;
    const children: ReactElement<ButtonProps | DropDownProps>[] = [];
    let buttons = originalButtons;
    if (customizable && customizedBtn) {
      buttons = [customizedColumnHeader(), ...(buttons || [])];
    }
    if (queryBar !== TableQueryBarType.filterBar && dataSet.props.combineSort) {
      const sortableFieldNames = this.getSortableFieldNames();
      if (sortableFieldNames.length > 0) {
        buttons = [(
          <CombineSort key="CombineSort" dataSet={dataSet} prefixCls={prefixCls} sortableFieldNames={sortableFieldNames} />
        ), ...(buttons || [])];
      }
    }
    if (buttons) {
      // 汇总条存在下 buttons 大于 3 个放入下拉
      const buttonsLimits = summaryBar ? (buttonsLimit || 3) : buttonsLimit;
      const tableButtonProps = tableStore.getConfig('tableButtonProps');
      const buttonsArr = buttons.slice(0, buttonsLimits);
      buttonsArr.forEach(button => {
        let props: TableButtonProps = {};
        if (isArrayLike(button)) {
          props = button[1] || {};
          button = button[0];
        }
        if (isString(button) && button in TableButtonType) {
          const { afterClick, ...buttonProps } = props;
          const defaultButtonProps = this.getButtonProps(button);
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
      if (buttonsLimits && buttons.length > buttonsLimits) {
        const moreButton: ReactElement = this.getMoreButton(buttonsLimits);
        children.push(moreButton);
      }
    }
    return children;
  }

  getQueryFields(): ReactElement<any>[] {
    const {
      context: {
        dataSet,
        tableStore: { queryBar, getConfig },
      },
      props: { queryFields, buttons },
    } = this;
    const { queryDataSet } = dataSet;
    const result: ReactElement<any>[] = [];
    if (queryDataSet) {
      const { fields, current, props: { fields: propFields = [] } } = queryDataSet;
      // 减少重复渲染
      // 使用了 buttons 判断，是因为 getButtons 中有用 DataSet.status 可观察对象判断，确保 buttons 用到 status 时，此处才用 status 判断，减少渲染
      if (this.queryFieldsElement.length && (
        (!current || (buttons && buttons.some(button => isString(button) && button in TableButtonType) && dataSet.status !== DataSetStatus.ready))
      )) return this.queryFieldsElement;
      const cloneFields: Map<string, Field> = fields.toJS();
      const tlsKey = getConfig('tlsKey');
      const processField = (field, name) => {
        if (!field.get('bind', current) && !name.includes(tlsKey)) {
          const element: ReactNode = queryFields![name];
          let filterBarProps = {};
          if (queryBar === TableQueryBarType.filterBar) {
            const placeholder = isValidElement(element) && element.props.placeholder ? element.props.placeholder : getPlaceholderByField(field, current);
            filterBarProps = {
              placeholder,
              border: false,
              clearButton: true,
            };

          }
          const props: any = {
            key: name,
            name,
            dataSet: queryDataSet,
            isFlat: queryBar === TableQueryBarType.filterBar,
            ...filterBarProps,
          };
          result.push(
            isValidElement(element)
              ? cloneElement(element, props)
              : cloneElement(getEditorByField(field, current, queryBar !== TableQueryBarType.professionalBar, queryBar === TableQueryBarType.filterBar || queryBar === TableQueryBarType.comboBar), {
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
    this.queryFieldsElement = result;
    return result;
  }

  getSortableFieldNames(): string[] {
    const { tableStore: { columnGroups } } =  this.context;
    const { columns } = columnGroups;
    const headerRows: ColumnGroup[][] = getTableHeaderRows(columns);
    const sortableFieldNames: Set<string> = new Set();
    headerRows.forEach(cols => {
      cols.forEach(col => {
        if (col.column && col.column.name && col.column.sortable) {
          sortableFieldNames.add(col.column.name);
        }
      });
    });
    return [...sortableFieldNames];
  }

  renderToolBar(props: TableQueryBarHookProps) {
    const { prefixCls } = this.context;
    return <TableToolBar key="toolbar" prefixCls={prefixCls} {...props} />;
  }

  renderFilterBar(props: TableQueryBarHookProps) {
    const { prefixCls } = this.context;
    const {
      props: { filterBarFieldName, filterBarPlaceholder },
    } = this;
    return (
      <TableFilterBar
        key="toolbar"
        prefixCls={prefixCls}
        paramName={filterBarFieldName!}
        placeholder={filterBarPlaceholder}
        {...props}
      />
    );
  }

  renderAdvancedQueryBar(props: TableQueryBarHookProps) {
    const { prefixCls } = this.context;
    return <TableAdvancedQueryBar key="toolbar" prefixCls={prefixCls} {...props} />;
  }

  renderProfessionalBar(props: TableQueryBarHookProps) {
    const { prefixCls } = this.context;
    return <TableProfessionalBar key="toolbar" prefixCls={prefixCls} {...props} />;
  }

  renderDynamicFilterBar(props: TableQueryBarHookProps) {
    const { dynamicFilterBar, searchCode } = this.props;
    const { prefixCls, tableStore } = this.context;
    const sortableFieldNames = this.getSortableFieldNames();
    return (
      <TableDynamicFilterBar
        key="toolbar"
        searchCode={searchCode}
        dynamicFilterBar={dynamicFilterBar}
        prefixCls={prefixCls}
        sortableFieldNames={sortableFieldNames}
        tableStore={tableStore}
        {...props}
      />
    );
  }

  renderComboBar(props: TableQueryBarHookProps) {
    const { comboFilterBar } = this.props;
    const { prefixCls } = this.context;
    return <TableComboBar key="toolbar" comboFilterBar={comboFilterBar} prefixCls={prefixCls} {...props} />;
  }

  @autobind
  expandTree() {
    const { tableStore } = this.context;
    const { props: { queryBarProps } } = tableStore;
    if (queryBarProps && typeof queryBarProps.onQuery === 'function') {
      queryBarProps.onQuery();
    }
    tableStore.expandAll();
  }

  @autobind
  collapseTree() {
    const { tableStore } = this.context;
    const { props: { queryBarProps } } = tableStore;
    if (queryBarProps && typeof queryBarProps.onReset === 'function') {
      queryBarProps.onReset();
    }
    tableStore.collapseAll();
  }

  render() {
    const buttons = this.getButtons();
    const summaryBar = this.getSummaryBar();
    const {
      context: {
        prefixCls,
        dataSet,
        isTree,
        tableStore,
        tableStore: { queryBar, props: { queryBarProps } },
      },
      props: { queryFieldsLimit, summaryFieldsLimit, pagination, treeQueryExpanded },
      showQueryBar,
    } = this;
    if (showQueryBar) {
      const { queryDataSet } = dataSet;
      const queryFields = this.getQueryFields();
      const tableQueryBarProps = { ...tableStore.getConfig('queryBarProps'), ...queryBarProps } as TableQueryBarHookCustomProps;
      const onReset = typeof tableQueryBarProps.onReset === 'function' ? tableQueryBarProps.onReset : noop;
      const onQuery = typeof tableQueryBarProps.onQuery === 'function' ? tableQueryBarProps.onQuery : noop;
      const queryFieldsLimits = queryFieldsLimit || tableQueryBarProps.queryFieldsLimit;
      const summaryFieldsLimits = summaryFieldsLimit || tableQueryBarProps.summaryFieldsLimit || 3;
      const props: TableQueryBarHookCustomProps & TableQueryBarHookProps = {
        ...tableQueryBarProps,
        dataSet,
        queryDataSet,
        buttons,
        pagination,
        queryFields,
        queryFieldsLimit: queryFieldsLimits,
        summaryFieldsLimit: summaryFieldsLimits,
        summaryBar,
        onQuery: treeQueryExpanded && isTree ? this.expandTree : onQuery,
        onReset: treeQueryExpanded && isTree ? this.collapseTree : onReset,
      };
      if (typeof queryBar === 'function') {
        return (queryBar as TableQueryBarHook)(props);
      }
      switch (queryBar) {
        case TableQueryBarType.normal:
          return this.renderToolBar(props);
        case TableQueryBarType.bar:
          return this.renderFilterBar(props);
        case TableQueryBarType.advancedBar:
          return this.renderAdvancedQueryBar(props);
        case TableQueryBarType.professionalBar:
          return this.renderProfessionalBar(props);
        case TableQueryBarType.filterBar:
          return this.renderDynamicFilterBar(props);
        case TableQueryBarType.comboBar:
          return this.renderComboBar(props);
        default:
      }
    }
    return [
      <TableButtons key="toolbar" prefixCls={prefixCls} buttons={buttons}>
        {summaryBar}
      </TableButtons>,
      pagination,
    ];
  }
}
