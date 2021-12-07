import * as React from 'react';
import classNames from 'classnames';
import { polyfill } from 'react-lifecycles-compat';
import { observer } from 'mobx-react';
import Checkbox from 'choerodon-ui/lib/checkbox';
import { CheckboxChangeEvent } from 'choerodon-ui/lib/checkbox';
import { SelectionCheckboxAllProps, SelectionCheckboxAllState, SelectionItem } from './Table';
import Dropdown from '../dropdown';
import Menu from '../menu';
import Icon from '../icon';

function checkSelection({
                          store,
                          getCheckboxPropsByItem,
                          getRecordKey,
                          data,
                          type,
                          byDefaultChecked,
                        }: {
  store: SelectionCheckboxAllProps['store'];
  getCheckboxPropsByItem: SelectionCheckboxAllProps['getCheckboxPropsByItem'];
  getRecordKey: SelectionCheckboxAllProps['getRecordKey'];
  data: object[];
  type: 'every' | 'some';
  byDefaultChecked: boolean;
}) {
  return byDefaultChecked
    ? data[type]((item, i) => getCheckboxPropsByItem(item, i).defaultChecked)
    : data[type](
      (item, i) => store.selectedRowKeys.indexOf(getRecordKey(item, i)) >= 0,
    );
}

function getIndeterminateState(props: SelectionCheckboxAllProps) {
  const { store, data } = props;
  if (!data.length) {
    return false;
  }

  const someCheckedNotByDefaultChecked =
    checkSelection({
      ...props,
      data,
      type: 'some',
      byDefaultChecked: false,
    }) &&
    !checkSelection({
      ...props,
      data,
      type: 'every',
      byDefaultChecked: false,
    });
  const someCheckedByDefaultChecked =
    checkSelection({
      ...props,
      data,
      type: 'some',
      byDefaultChecked: true,
    }) &&
    !checkSelection({
      ...props,
      data,
      type: 'every',
      byDefaultChecked: true,
    });

  if (store.selectionDirty) {
    return someCheckedNotByDefaultChecked;
  }
  return someCheckedNotByDefaultChecked || someCheckedByDefaultChecked;
}

function getCheckState(props: SelectionCheckboxAllProps) {
  const { store, data } = props;
  if (!data.length) {
    return false;
  }
  if (store.selectionDirty) {
    return checkSelection({
      ...props,
      data,
      type: 'every',
      byDefaultChecked: false,
    });
  }
  return (
    checkSelection({
      ...props,
      data,
      type: 'every',
      byDefaultChecked: false,
    }) ||
    checkSelection({
      ...props,
      data,
      type: 'every',
      byDefaultChecked: true,
    })
  );
}

@observer
class SelectionCheckboxAll extends React.Component<SelectionCheckboxAllProps,
  SelectionCheckboxAllState> {

  defaultSelections: SelectionItem[];

  constructor(props: SelectionCheckboxAllProps) {
    super(props);
    this.defaultSelections = props.hideDefaultSelections
      ? []
      : [
        {
          key: 'all',
          text: 'SelectAll',
        },
        {
          key: 'invert',
          text: 'SelectInvert',
        },
      ];
  }

  setCheckState(props: SelectionCheckboxAllProps) {
    const checked = getCheckState(props);
    const indeterminate = getIndeterminateState(props);
    this.setState(prevState => {
      const newState: SelectionCheckboxAllState = {};
      if (indeterminate !== prevState.indeterminate) {
        newState.indeterminate = indeterminate;
      }
      if (checked !== prevState.checked) {
        newState.checked = checked;
      }
      return newState;
    });
  }

  handleSelectAllChange = (e: CheckboxChangeEvent) => {
    const { checked } = e.target;
    this.props.onSelect(checked ? 'all' : 'removeAll', 0, null);
  };

  renderMenus(selections: SelectionItem[]) {
    return selections.map((selection, index) => {
      return (
        <Menu.Item key={selection.key || index}>
          <div
            onClick={() => {
              this.props.onSelect(selection.key, index, selection.onSelect);
            }}
          >
            {selection.text}
          </div>
        </Menu.Item>
      );
    });
  }

  render() {
    const { disabled, prefixCls, selections } = this.props;
    const checked = getCheckState(this.props);
    const indeterminate = getIndeterminateState(this.props);

    const selectionPrefixCls = `${prefixCls}-selection`;

    let customSelections: React.ReactNode = null;

    if (selections) {
      const newSelections = Array.isArray(selections)
        ? this.defaultSelections.concat(selections)
        : this.defaultSelections;

      const menu = (
        <Menu className={`${selectionPrefixCls}-menu`} selectedKeys={[]}>
          {this.renderMenus(newSelections)}
        </Menu>
      );

      customSelections =
        newSelections.length > 0 ? (
          <Dropdown overlay={menu}>
            <div className={`${selectionPrefixCls}-down`}>
              <Icon type="down" />
            </div>
          </Dropdown>
        ) : null;
    }

    return (
      <div className={selectionPrefixCls}>
        <Checkbox
          className={classNames({ [`${selectionPrefixCls}-select-all-custom`]: customSelections })}
          checked={checked}
          indeterminate={indeterminate}
          disabled={disabled}
          onChange={this.handleSelectAllChange}
        />
        {customSelections}
      </div>
    );
  }
}

polyfill(SelectionCheckboxAll);

export default SelectionCheckboxAll;
