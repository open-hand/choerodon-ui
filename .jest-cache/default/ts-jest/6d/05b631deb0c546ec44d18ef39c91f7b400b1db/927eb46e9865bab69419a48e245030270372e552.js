import { __decorate } from "tslib";
import React, { cloneElement, Component, isValidElement, } from 'react';
import { observer } from 'mobx-react';
import { isArrayLike } from 'mobx';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import { getConfig } from 'choerodon-ui/lib/configure';
import Row from 'choerodon-ui/lib/row';
import Col from 'choerodon-ui/lib/col';
import { TableButtonType } from '../enum';
import TableButtons from './TableButtons';
import Table from '../Table';
import Button from '../../button/Button';
import { $l } from '../../locale-context';
import TableContext from '../TableContext';
import autobind from '../../_util/autobind';
import DataSet from '../../data-set';
import Modal from '../../modal';
import Column from '../Column';
import { getEditorByField } from '../utils';
import TableToolBar from './TableToolBar';
import TableFilterBar from './TableFilterBar';
import TableAdvancedQueryBar from './TableAdvancedQueryBar';
import TableProfessionalBar from './TableProfessionalBar';
import { findBindFieldBy } from '../../data-set/utils';
import NumberField from '../../number-field';
let TableQueryBar = class TableQueryBar extends Component {
    get showQueryBar() {
        const { props: { showQueryBar }, context: { tableStore: { queryBar }, }, } = this;
        return showQueryBar !== false && queryBar !== "none" /* none */;
    }
    componentWillUnmount() {
        if (this.exportModal) {
            this.exportModal.close(true);
        }
    }
    handleButtonCreate() {
        const { tableStore: { dataSet }, } = this.context;
        dataSet.create({}, 0);
    }
    handleButtonSubmit() {
        const { tableStore: { dataSet }, } = this.context;
        return dataSet.submit();
    }
    handleButtonDelete() {
        const { tableStore: { dataSet }, } = this.context;
        return dataSet.delete(dataSet.selected);
    }
    handleButtonRemove() {
        const { tableStore: { dataSet }, } = this.context;
        dataSet.remove(dataSet.selected);
    }
    handleButtonReset() {
        const { tableStore: { dataSet }, } = this.context;
        dataSet.reset();
    }
    handleQueryReset() {
        const { tableStore: { dataSet: { queryDataSet }, }, } = this.context;
        if (queryDataSet) {
            const { current } = queryDataSet;
            if (current) {
                current.reset();
            }
            this.handleQuery();
        }
    }
    handleExpandAll() {
        const { tableStore } = this.context;
        tableStore.expandAll();
    }
    handleCollapseAll() {
        const { tableStore } = this.context;
        tableStore.collapseAll();
    }
    async handleButtonExport() {
        const { tableStore } = this.context;
        const columnHeaders = await tableStore.getColumnHeaders();
        const changeQuantity = (value) => {
            this.exportQuantity = value;
        };
        const { prefixCls } = this.props;
        this.exportDataSet = new DataSet({ data: columnHeaders, paging: false });
        this.exportDataSet.selectAll();
        this.exportQuantity = tableStore.dataSet.totalCount;
        this.exportModal = Modal.open({
            title: $l('Table', 'choose_export_columns'),
            children: (React.createElement(React.Fragment, null,
                React.createElement(Table, { dataSet: this.exportDataSet, style: { height: pxToRem(300) } },
                    React.createElement(Column, { header: $l('Table', 'column_name'), name: "label", resizable: false })),
                tableStore.dataSet.exportMode === "client" /* client */
                    ? (React.createElement(Row, { className: `${prefixCls}-export-quantity` },
                        React.createElement(Col, { span: 11 },
                            React.createElement("span", null, $l('Table', 'max_export'))),
                        React.createElement(Col, { span: 13 },
                            React.createElement(NumberField, { onChange: changeQuantity, defaultValue: this.exportQuantity, max: 1000, clearButton: true, min: 0, step: 1 })))) : undefined)),
            closable: true,
            okText: $l('Table', 'export_button'),
            onOk: this.handleExport,
            style: {
                width: pxToRem(400),
            },
        });
    }
    handleQuery() {
        const { tableStore: { dataSet }, } = this.context;
        return dataSet.query();
    }
    handleExport() {
        const { selected } = this.exportDataSet;
        if (selected.length) {
            const { tableStore: { dataSet }, } = this.context;
            dataSet.export(selected.reduce((columns, record) => {
                let myName = record.get('name');
                const myField = dataSet.getField(myName);
                if (myField && myField.type === "object" /* object */) {
                    const bindField = findBindFieldBy(myField, dataSet.fields, 'textField');
                    if (bindField) {
                        myName = bindField.name;
                    }
                }
                columns[myName] = record.get('label');
                return columns;
            }, {}), this.exportQuantity);
        }
        else {
            return false;
        }
    }
    getButtonProps(type) {
        const { tableStore: { isTree, dataSet }, } = this.context;
        const disabled = dataSet.status !== "ready" /* ready */;
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
                    type: "submit" /* submit */,
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
                    type: "reset" /* reset */,
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
    getButtons() {
        const { buttons } = this.props;
        const children = [];
        if (buttons) {
            const tableButtonProps = getConfig('tableButtonProps');
            buttons.forEach(button => {
                let props = {};
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
                            defaultButtonProps.onClick = async (e) => {
                                e.persist();
                                try {
                                    await onClick(e);
                                }
                                finally {
                                    afterClick(e);
                                }
                            };
                        }
                        children.push(React.createElement(Button, Object.assign({ key: button }, tableButtonProps, defaultButtonProps, buttonProps)));
                    }
                }
                else if (isValidElement(button)) {
                    children.push(cloneElement(button, { ...tableButtonProps, ...button.props }));
                }
                else if (isObject(button)) {
                    children.push(React.createElement(Button, Object.assign({}, tableButtonProps, button)));
                }
            });
        }
        return children;
    }
    getQueryFields() {
        const { context: { tableStore: { dataSet }, }, props: { queryFields }, } = this;
        const { queryDataSet } = dataSet;
        const result = [];
        if (queryDataSet) {
            const { fields } = queryDataSet;
            return [...fields.entries()].reduce((list, [name, field]) => {
                if (!field.get('bind')) {
                    const props = {
                        key: name,
                        name,
                        dataSet: queryDataSet,
                    };
                    const element = queryFields[name];
                    list.push(isValidElement(element)
                        ? cloneElement(element, props)
                        : cloneElement(getEditorByField(field), {
                            ...props,
                            ...(isObject(element) ? element : {}),
                        }));
                }
                return list;
            }, result);
        }
        return result;
    }
    renderToolBar(props) {
        const { prefixCls } = this.props;
        return React.createElement(TableToolBar, Object.assign({ key: "toolbar", prefixCls: prefixCls }, props));
    }
    renderFilterBar(props) {
        const { props: { prefixCls, filterBarFieldName, filterBarPlaceholder }, } = this;
        return (React.createElement(TableFilterBar, Object.assign({ key: "toolbar", prefixCls: prefixCls, paramName: filterBarFieldName, placeholder: filterBarPlaceholder }, props)));
    }
    renderAdvancedQueryBar(props) {
        const { prefixCls } = this.props;
        return React.createElement(TableAdvancedQueryBar, Object.assign({ key: "toolbar", prefixCls: prefixCls }, props));
    }
    renderProfessionalBar(props) {
        const { prefixCls } = this.props;
        return React.createElement(TableProfessionalBar, Object.assign({ key: "toolbar", prefixCls: prefixCls }, props));
    }
    render() {
        const buttons = this.getButtons();
        const { context: { tableStore: { dataSet, queryBar }, }, props: { queryFieldsLimit, prefixCls, pagination }, showQueryBar, } = this;
        if (showQueryBar) {
            const { queryDataSet } = dataSet;
            const queryFields = this.getQueryFields();
            const props = {
                dataSet,
                queryDataSet,
                buttons,
                pagination,
                queryFields,
                queryFieldsLimit: queryFieldsLimit,
            };
            if (typeof queryBar === 'function') {
                return queryBar(props);
            }
            switch (queryBar) {
                case "normal" /* normal */:
                    return this.renderToolBar(props);
                case "bar" /* bar */:
                    return this.renderFilterBar(props);
                case "advancedBar" /* advancedBar */:
                    return this.renderAdvancedQueryBar(props);
                case "professionalBar" /* professionalBar */:
                    return this.renderProfessionalBar(props);
                default:
            }
        }
        return [React.createElement(TableButtons, { key: "toolbar", prefixCls: prefixCls, buttons: buttons }), pagination];
    }
};
TableQueryBar.displayName = 'TableQueryBar';
TableQueryBar.contextType = TableContext;
__decorate([
    autobind
], TableQueryBar.prototype, "handleButtonCreate", null);
__decorate([
    autobind
], TableQueryBar.prototype, "handleButtonSubmit", null);
__decorate([
    autobind
], TableQueryBar.prototype, "handleButtonDelete", null);
__decorate([
    autobind
], TableQueryBar.prototype, "handleButtonRemove", null);
__decorate([
    autobind
], TableQueryBar.prototype, "handleButtonReset", null);
__decorate([
    autobind
], TableQueryBar.prototype, "handleQueryReset", null);
__decorate([
    autobind
], TableQueryBar.prototype, "handleExpandAll", null);
__decorate([
    autobind
], TableQueryBar.prototype, "handleCollapseAll", null);
__decorate([
    autobind
], TableQueryBar.prototype, "handleButtonExport", null);
__decorate([
    autobind
], TableQueryBar.prototype, "handleQuery", null);
__decorate([
    autobind
], TableQueryBar.prototype, "handleExport", null);
TableQueryBar = __decorate([
    observer
], TableQueryBar);
export default TableQueryBar;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL3RhYmxlL3F1ZXJ5LWJhci9pbmRleC50c3giLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sS0FBSyxFQUFFLEVBQ1osWUFBWSxFQUNaLFNBQVMsRUFDVCxjQUFjLEdBSWYsTUFBTSxPQUFPLENBQUM7QUFDZixPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ3RDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDbkMsT0FBTyxRQUFRLE1BQU0saUJBQWlCLENBQUM7QUFDdkMsT0FBTyxRQUFRLE1BQU0saUJBQWlCLENBQUM7QUFDdkMsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBQy9ELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUN2RCxPQUFPLEdBQUcsTUFBTSxzQkFBc0IsQ0FBQztBQUN2QyxPQUFPLEdBQUcsTUFBTSxzQkFBc0IsQ0FBQztBQUN2QyxPQUFPLEVBQUUsZUFBZSxFQUFxQixNQUFNLFNBQVMsQ0FBQztBQUM3RCxPQUFPLFlBQVksTUFBTSxnQkFBZ0IsQ0FBQztBQUMxQyxPQUFPLEtBS04sTUFBTSxVQUFVLENBQUM7QUFDbEIsT0FBTyxNQUF1QixNQUFNLHFCQUFxQixDQUFDO0FBRzFELE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUMxQyxPQUFPLFlBQVksTUFBTSxpQkFBaUIsQ0FBQztBQUMzQyxPQUFPLFFBQVEsTUFBTSxzQkFBc0IsQ0FBQztBQUM1QyxPQUFPLE9BQU8sTUFBTSxnQkFBZ0IsQ0FBQztBQUNyQyxPQUFPLEtBQUssTUFBTSxhQUFhLENBQUM7QUFDaEMsT0FBTyxNQUFNLE1BQU0sV0FBVyxDQUFDO0FBQy9CLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUM1QyxPQUFPLFlBQVksTUFBTSxnQkFBZ0IsQ0FBQztBQUMx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QURDLFFBQVE7cURBY1I7QUFHRDtJQURDLFFBQVE7b0RBSVI7QUFHRDtJQURDLFFBQVE7c0RBSVI7QUFHRDtJQURDLFFBQVE7dURBd0NSO0FBR0Q7SUFEQyxRQUFRO2dEQU1SO0FBR0Q7SUFEQyxRQUFRO2lEQXlCUjtBQTFLa0IsYUFBYTtJQURqQyxRQUFRO0dBQ1ksYUFBYSxDQXNZakM7ZUF0WW9CLGFBQWEiLCJuYW1lcyI6W10sInNvdXJjZXMiOlsiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL3RhYmxlL3F1ZXJ5LWJhci9pbmRleC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7XG4gIGNsb25lRWxlbWVudCxcbiAgQ29tcG9uZW50LFxuICBpc1ZhbGlkRWxlbWVudCxcbiAgTW91c2VFdmVudEhhbmRsZXIsXG4gIFJlYWN0RWxlbWVudCxcbiAgUmVhY3ROb2RlLFxufSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBvYnNlcnZlciB9IGZyb20gJ21vYngtcmVhY3QnO1xuaW1wb3J0IHsgaXNBcnJheUxpa2UgfSBmcm9tICdtb2J4JztcbmltcG9ydCBpc09iamVjdCBmcm9tICdsb2Rhc2gvaXNPYmplY3QnO1xuaW1wb3J0IGlzU3RyaW5nIGZyb20gJ2xvZGFzaC9pc1N0cmluZyc7XG5pbXBvcnQgeyBweFRvUmVtIH0gZnJvbSAnY2hvZXJvZG9uLXVpL2xpYi9fdXRpbC9Vbml0Q29udmVydG9yJztcbmltcG9ydCB7IGdldENvbmZpZyB9IGZyb20gJ2Nob2Vyb2Rvbi11aS9saWIvY29uZmlndXJlJztcbmltcG9ydCBSb3cgZnJvbSAnY2hvZXJvZG9uLXVpL2xpYi9yb3cnO1xuaW1wb3J0IENvbCBmcm9tICdjaG9lcm9kb24tdWkvbGliL2NvbCc7XG5pbXBvcnQgeyBUYWJsZUJ1dHRvblR5cGUsIFRhYmxlUXVlcnlCYXJUeXBlIH0gZnJvbSAnLi4vZW51bSc7XG5pbXBvcnQgVGFibGVCdXR0b25zIGZyb20gJy4vVGFibGVCdXR0b25zJztcbmltcG9ydCBUYWJsZSwge1xuICBCdXR0b25zLFxuICBUYWJsZUJ1dHRvblByb3BzLFxuICBUYWJsZVF1ZXJ5QmFySG9vayxcbiAgVGFibGVRdWVyeUJhckhvb2tQcm9wcyxcbn0gZnJvbSAnLi4vVGFibGUnO1xuaW1wb3J0IEJ1dHRvbiwgeyBCdXR0b25Qcm9wcyB9IGZyb20gJy4uLy4uL2J1dHRvbi9CdXR0b24nO1xuaW1wb3J0IHsgQnV0dG9uVHlwZSB9IGZyb20gJy4uLy4uL2J1dHRvbi9lbnVtJztcbmltcG9ydCB7IERhdGFTZXRTdGF0dXMsIEZpZWxkVHlwZSwgRXhwb3J0TW9kZSB9IGZyb20gJy4uLy4uL2RhdGEtc2V0L2VudW0nO1xuaW1wb3J0IHsgJGwgfSBmcm9tICcuLi8uLi9sb2NhbGUtY29udGV4dCc7XG5pbXBvcnQgVGFibGVDb250ZXh0IGZyb20gJy4uL1RhYmxlQ29udGV4dCc7XG5pbXBvcnQgYXV0b2JpbmQgZnJvbSAnLi4vLi4vX3V0aWwvYXV0b2JpbmQnO1xuaW1wb3J0IERhdGFTZXQgZnJvbSAnLi4vLi4vZGF0YS1zZXQnO1xuaW1wb3J0IE1vZGFsIGZyb20gJy4uLy4uL21vZGFsJztcbmltcG9ydCBDb2x1bW4gZnJvbSAnLi4vQ29sdW1uJztcbmltcG9ydCB7IGdldEVkaXRvckJ5RmllbGQgfSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgVGFibGVUb29sQmFyIGZyb20gJy4vVGFibGVUb29sQmFyJztcbmltcG9ydCBUYWJsZUZpbHRlckJhciBmcm9tICcuL1RhYmxlRmlsdGVyQmFyJztcbmltcG9ydCBUYWJsZUFkdmFuY2VkUXVlcnlCYXIgZnJvbSAnLi9UYWJsZUFkdmFuY2VkUXVlcnlCYXInO1xuaW1wb3J0IFRhYmxlUHJvZmVzc2lvbmFsQmFyIGZyb20gJy4vVGFibGVQcm9mZXNzaW9uYWxCYXInO1xuaW1wb3J0IHsgUGFnaW5hdGlvblByb3BzIH0gZnJvbSAnLi4vLi4vcGFnaW5hdGlvbi9QYWdpbmF0aW9uJztcbmltcG9ydCB7IGZpbmRCaW5kRmllbGRCeSB9IGZyb20gJy4uLy4uL2RhdGEtc2V0L3V0aWxzJztcbmltcG9ydCBOdW1iZXJGaWVsZCBmcm9tICcuLi8uLi9udW1iZXItZmllbGQnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFRhYmxlUXVlcnlCYXJQcm9wcyB7XG4gIHByZWZpeENscz86IHN0cmluZztcbiAgYnV0dG9ucz86IEJ1dHRvbnNbXTtcbiAgcXVlcnlGaWVsZHM/OiB7IFtrZXk6IHN0cmluZ106IFJlYWN0RWxlbWVudDxhbnk+IH07XG4gIHF1ZXJ5RmllbGRzTGltaXQ/OiBudW1iZXI7XG4gIHNob3dRdWVyeUJhcj86IGJvb2xlYW47XG4gIHBhZ2luYXRpb24/OiBSZWFjdEVsZW1lbnQ8UGFnaW5hdGlvblByb3BzPjtcbiAgZmlsdGVyQmFyRmllbGROYW1lPzogc3RyaW5nO1xuICBmaWx0ZXJCYXJQbGFjZWhvbGRlcj86IHN0cmluZztcbn1cblxuQG9ic2VydmVyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUYWJsZVF1ZXJ5QmFyIGV4dGVuZHMgQ29tcG9uZW50PFRhYmxlUXVlcnlCYXJQcm9wcz4ge1xuICBzdGF0aWMgZGlzcGxheU5hbWUgPSAnVGFibGVRdWVyeUJhcic7XG5cbiAgc3RhdGljIGNvbnRleHRUeXBlID0gVGFibGVDb250ZXh0O1xuXG4gIGV4cG9ydE1vZGFsO1xuXG4gIGV4cG9ydERhdGFTZXQ6IERhdGFTZXQ7XG5cbiAgZXhwb3J0UXVhbnRpdHk6IG51bWJlcjtcblxuICBnZXQgc2hvd1F1ZXJ5QmFyKCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHtcbiAgICAgIHByb3BzOiB7IHNob3dRdWVyeUJhciB9LFxuICAgICAgY29udGV4dDoge1xuICAgICAgICB0YWJsZVN0b3JlOiB7IHF1ZXJ5QmFyIH0sXG4gICAgICB9LFxuICAgIH0gPSB0aGlzO1xuICAgIHJldHVybiBzaG93UXVlcnlCYXIgIT09IGZhbHNlICYmIHF1ZXJ5QmFyICE9PSBUYWJsZVF1ZXJ5QmFyVHlwZS5ub25lO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgaWYgKHRoaXMuZXhwb3J0TW9kYWwpIHtcbiAgICAgIHRoaXMuZXhwb3J0TW9kYWwuY2xvc2UodHJ1ZSk7XG4gICAgfVxuICB9XG5cbiAgQGF1dG9iaW5kXG4gIGhhbmRsZUJ1dHRvbkNyZWF0ZSgpIHtcbiAgICBjb25zdCB7XG4gICAgICB0YWJsZVN0b3JlOiB7IGRhdGFTZXQgfSxcbiAgICB9ID0gdGhpcy5jb250ZXh0O1xuICAgIGRhdGFTZXQuY3JlYXRlKHt9LCAwKTtcbiAgfVxuXG4gIEBhdXRvYmluZFxuICBoYW5kbGVCdXR0b25TdWJtaXQoKSB7XG4gICAgY29uc3Qge1xuICAgICAgdGFibGVTdG9yZTogeyBkYXRhU2V0IH0sXG4gICAgfSA9IHRoaXMuY29udGV4dDtcbiAgICByZXR1cm4gZGF0YVNldC5zdWJtaXQoKTtcbiAgfVxuXG4gIEBhdXRvYmluZFxuICBoYW5kbGVCdXR0b25EZWxldGUoKSB7XG4gICAgY29uc3Qge1xuICAgICAgdGFibGVTdG9yZTogeyBkYXRhU2V0IH0sXG4gICAgfSA9IHRoaXMuY29udGV4dDtcbiAgICByZXR1cm4gZGF0YVNldC5kZWxldGUoZGF0YVNldC5zZWxlY3RlZCk7XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgaGFuZGxlQnV0dG9uUmVtb3ZlKCkge1xuICAgIGNvbnN0IHtcbiAgICAgIHRhYmxlU3RvcmU6IHsgZGF0YVNldCB9LFxuICAgIH0gPSB0aGlzLmNvbnRleHQ7XG4gICAgZGF0YVNldC5yZW1vdmUoZGF0YVNldC5zZWxlY3RlZCk7XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgaGFuZGxlQnV0dG9uUmVzZXQoKSB7XG4gICAgY29uc3Qge1xuICAgICAgdGFibGVTdG9yZTogeyBkYXRhU2V0IH0sXG4gICAgfSA9IHRoaXMuY29udGV4dDtcbiAgICBkYXRhU2V0LnJlc2V0KCk7XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgaGFuZGxlUXVlcnlSZXNldCgpIHtcbiAgICBjb25zdCB7XG4gICAgICB0YWJsZVN0b3JlOiB7XG4gICAgICAgIGRhdGFTZXQ6IHsgcXVlcnlEYXRhU2V0IH0sXG4gICAgICB9LFxuICAgIH0gPSB0aGlzLmNvbnRleHQ7XG4gICAgaWYgKHF1ZXJ5RGF0YVNldCkge1xuICAgICAgY29uc3QgeyBjdXJyZW50IH0gPSBxdWVyeURhdGFTZXQ7XG4gICAgICBpZiAoY3VycmVudCkge1xuICAgICAgICBjdXJyZW50LnJlc2V0KCk7XG4gICAgICB9XG4gICAgICB0aGlzLmhhbmRsZVF1ZXJ5KCk7XG4gICAgfVxuICB9XG5cbiAgQGF1dG9iaW5kXG4gIGhhbmRsZUV4cGFuZEFsbCgpIHtcbiAgICBjb25zdCB7IHRhYmxlU3RvcmUgfSA9IHRoaXMuY29udGV4dDtcbiAgICB0YWJsZVN0b3JlLmV4cGFuZEFsbCgpO1xuICB9XG5cbiAgQGF1dG9iaW5kXG4gIGhhbmRsZUNvbGxhcHNlQWxsKCkge1xuICAgIGNvbnN0IHsgdGFibGVTdG9yZSB9ID0gdGhpcy5jb250ZXh0O1xuICAgIHRhYmxlU3RvcmUuY29sbGFwc2VBbGwoKTtcbiAgfVxuXG4gIEBhdXRvYmluZFxuICBhc3luYyBoYW5kbGVCdXR0b25FeHBvcnQoKSB7XG4gICAgY29uc3QgeyB0YWJsZVN0b3JlIH0gPSB0aGlzLmNvbnRleHQ7XG4gICAgY29uc3QgY29sdW1uSGVhZGVycyA9IGF3YWl0IHRhYmxlU3RvcmUuZ2V0Q29sdW1uSGVhZGVycygpO1xuICAgIGNvbnN0IGNoYW5nZVF1YW50aXR5ID0gKHZhbHVlOiBudW1iZXIpID0+IHtcbiAgICAgIHRoaXMuZXhwb3J0UXVhbnRpdHkgPSB2YWx1ZTtcbiAgICB9XG4gICAgY29uc3QgeyBwcmVmaXhDbHMgfSA9IHRoaXMucHJvcHM7XG4gICAgdGhpcy5leHBvcnREYXRhU2V0ID0gbmV3IERhdGFTZXQoeyBkYXRhOiBjb2x1bW5IZWFkZXJzLCBwYWdpbmc6IGZhbHNlIH0pO1xuICAgIHRoaXMuZXhwb3J0RGF0YVNldC5zZWxlY3RBbGwoKTtcbiAgICB0aGlzLmV4cG9ydFF1YW50aXR5ID0gdGFibGVTdG9yZS5kYXRhU2V0LnRvdGFsQ291bnRcbiAgICB0aGlzLmV4cG9ydE1vZGFsID0gTW9kYWwub3Blbih7XG4gICAgICB0aXRsZTogJGwoJ1RhYmxlJywgJ2Nob29zZV9leHBvcnRfY29sdW1ucycpLFxuICAgICAgY2hpbGRyZW46IChcbiAgICAgICAgPD5cbiAgICAgICAgICA8VGFibGUgZGF0YVNldD17dGhpcy5leHBvcnREYXRhU2V0fSBzdHlsZT17eyBoZWlnaHQ6IHB4VG9SZW0oMzAwKSB9fT5cbiAgICAgICAgICAgIDxDb2x1bW4gaGVhZGVyPXskbCgnVGFibGUnLCAnY29sdW1uX25hbWUnKX0gbmFtZT1cImxhYmVsXCIgcmVzaXphYmxlPXtmYWxzZX0gLz5cbiAgICAgICAgICA8L1RhYmxlPlxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHRhYmxlU3RvcmUuZGF0YVNldC5leHBvcnRNb2RlID09PSBFeHBvcnRNb2RlLmNsaWVudFxuICAgICAgICAgICAgICA/IChcbiAgICAgICAgICAgICAgICA8Um93IGNsYXNzTmFtZT17YCR7cHJlZml4Q2xzfS1leHBvcnQtcXVhbnRpdHlgfT5cbiAgICAgICAgICAgICAgICAgIDxDb2wgc3Bhbj17MTF9ID5cbiAgICAgICAgICAgICAgICAgIDxzcGFuPnskbCgnVGFibGUnLCdtYXhfZXhwb3J0Jyl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgPC9Db2w+XG4gICAgICAgICAgICAgICAgICA8Q29sIHNwYW49ezEzfT5cbiAgICAgICAgICAgICAgICAgICAgPE51bWJlckZpZWxkIG9uQ2hhbmdlPXtjaGFuZ2VRdWFudGl0eX0gZGVmYXVsdFZhbHVlPXt0aGlzLmV4cG9ydFF1YW50aXR5fSBtYXg9ezEwMDB9IGNsZWFyQnV0dG9uIG1pbj17MH0gc3RlcD17MX0gLz5cbiAgICAgICAgICAgICAgICAgIDwvQ29sPlxuICAgICAgICAgICAgICAgIDwvUm93PlxuICAgICAgICAgICAgICApIDogdW5kZWZpbmVkXG4gICAgICAgICAgfVxuICAgICAgICA8Lz5cbiAgICAgICksXG4gICAgICBjbG9zYWJsZTogdHJ1ZSxcbiAgICAgIG9rVGV4dDogJGwoJ1RhYmxlJywgJ2V4cG9ydF9idXR0b24nKSxcbiAgICAgIG9uT2s6IHRoaXMuaGFuZGxlRXhwb3J0LFxuICAgICAgc3R5bGU6IHtcbiAgICAgICAgd2lkdGg6IHB4VG9SZW0oNDAwKSxcbiAgICAgIH0sXG4gICAgfSk7XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgaGFuZGxlUXVlcnkoKSB7XG4gICAgY29uc3Qge1xuICAgICAgdGFibGVTdG9yZTogeyBkYXRhU2V0IH0sXG4gICAgfSA9IHRoaXMuY29udGV4dDtcbiAgICByZXR1cm4gZGF0YVNldC5xdWVyeSgpO1xuICB9XG5cbiAgQGF1dG9iaW5kXG4gIGhhbmRsZUV4cG9ydCgpIHtcbiAgICBjb25zdCB7IHNlbGVjdGVkIH0gPSB0aGlzLmV4cG9ydERhdGFTZXQ7XG4gICAgaWYgKHNlbGVjdGVkLmxlbmd0aCkge1xuICAgICAgY29uc3Qge1xuICAgICAgICB0YWJsZVN0b3JlOiB7IGRhdGFTZXQgfSxcbiAgICAgIH0gPSB0aGlzLmNvbnRleHQ7XG4gICAgICBkYXRhU2V0LmV4cG9ydChcbiAgICAgICAgc2VsZWN0ZWQucmVkdWNlKChjb2x1bW5zLCByZWNvcmQpID0+IHtcbiAgICAgICAgICBsZXQgbXlOYW1lID0gcmVjb3JkLmdldCgnbmFtZScpO1xuICAgICAgICAgIGNvbnN0IG15RmllbGQgPSBkYXRhU2V0LmdldEZpZWxkKG15TmFtZSk7XG4gICAgICAgICAgaWYgKG15RmllbGQgJiYgbXlGaWVsZC50eXBlID09PSBGaWVsZFR5cGUub2JqZWN0KSB7XG4gICAgICAgICAgICBjb25zdCBiaW5kRmllbGQgPSBmaW5kQmluZEZpZWxkQnkobXlGaWVsZCwgZGF0YVNldC5maWVsZHMsICd0ZXh0RmllbGQnKTtcbiAgICAgICAgICAgIGlmIChiaW5kRmllbGQpIHtcbiAgICAgICAgICAgICAgbXlOYW1lID0gYmluZEZpZWxkLm5hbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbHVtbnNbbXlOYW1lXSA9IHJlY29yZC5nZXQoJ2xhYmVsJyk7XG4gICAgICAgICAgcmV0dXJuIGNvbHVtbnM7XG4gICAgICAgIH0sIHt9KSxcbiAgICAgICAgdGhpcy5leHBvcnRRdWFudGl0eSxcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBnZXRCdXR0b25Qcm9wcyhcbiAgICB0eXBlOiBUYWJsZUJ1dHRvblR5cGUsXG4gICk6IEJ1dHRvblByb3BzICYgeyBvbkNsaWNrOiBNb3VzZUV2ZW50SGFuZGxlcjxhbnk+OyBjaGlsZHJlbj86IFJlYWN0Tm9kZSB9IHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCB7XG4gICAgICB0YWJsZVN0b3JlOiB7IGlzVHJlZSwgZGF0YVNldCB9LFxuICAgIH0gPSB0aGlzLmNvbnRleHQ7XG4gICAgY29uc3QgZGlzYWJsZWQgPSBkYXRhU2V0LnN0YXR1cyAhPT0gRGF0YVNldFN0YXR1cy5yZWFkeTtcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgVGFibGVCdXR0b25UeXBlLmFkZDpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpY29uOiAncGxheWxpc3RfYWRkJyxcbiAgICAgICAgICBvbkNsaWNrOiB0aGlzLmhhbmRsZUJ1dHRvbkNyZWF0ZSxcbiAgICAgICAgICBjaGlsZHJlbjogJGwoJ1RhYmxlJywgJ2NyZWF0ZV9idXR0b24nKSxcbiAgICAgICAgICBkaXNhYmxlZDogZGlzYWJsZWQgfHwgKGRhdGFTZXQucGFyZW50ID8gIWRhdGFTZXQucGFyZW50LmN1cnJlbnQgOiBmYWxzZSksXG4gICAgICAgIH07XG4gICAgICBjYXNlIFRhYmxlQnV0dG9uVHlwZS5zYXZlOlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGljb246ICdzYXZlJyxcbiAgICAgICAgICBvbkNsaWNrOiB0aGlzLmhhbmRsZUJ1dHRvblN1Ym1pdCxcbiAgICAgICAgICBjaGlsZHJlbjogJGwoJ1RhYmxlJywgJ3NhdmVfYnV0dG9uJyksXG4gICAgICAgICAgdHlwZTogQnV0dG9uVHlwZS5zdWJtaXQsXG4gICAgICAgICAgZGlzYWJsZWQsXG4gICAgICAgIH07XG4gICAgICBjYXNlIFRhYmxlQnV0dG9uVHlwZS5kZWxldGU6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaWNvbjogJ2RlbGV0ZScsXG4gICAgICAgICAgb25DbGljazogdGhpcy5oYW5kbGVCdXR0b25EZWxldGUsXG4gICAgICAgICAgY2hpbGRyZW46ICRsKCdUYWJsZScsICdkZWxldGVfYnV0dG9uJyksXG4gICAgICAgICAgZGlzYWJsZWQ6IGRpc2FibGVkIHx8IGRhdGFTZXQuc2VsZWN0ZWQubGVuZ3RoID09PSAwLFxuICAgICAgICB9O1xuICAgICAgY2FzZSBUYWJsZUJ1dHRvblR5cGUucmVtb3ZlOlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGljb246ICdyZW1vdmVfY2lyY2xlJyxcbiAgICAgICAgICBvbkNsaWNrOiB0aGlzLmhhbmRsZUJ1dHRvblJlbW92ZSxcbiAgICAgICAgICBjaGlsZHJlbjogJGwoJ1RhYmxlJywgJ3JlbW92ZV9idXR0b24nKSxcbiAgICAgICAgICBkaXNhYmxlZDogZGlzYWJsZWQgfHwgZGF0YVNldC5zZWxlY3RlZC5sZW5ndGggPT09IDAsXG4gICAgICAgIH07XG4gICAgICBjYXNlIFRhYmxlQnV0dG9uVHlwZS5yZXNldDpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpY29uOiAndW5kbycsXG4gICAgICAgICAgb25DbGljazogdGhpcy5oYW5kbGVCdXR0b25SZXNldCxcbiAgICAgICAgICBjaGlsZHJlbjogJGwoJ1RhYmxlJywgJ3Jlc2V0X2J1dHRvbicpLFxuICAgICAgICAgIHR5cGU6IEJ1dHRvblR5cGUucmVzZXQsXG4gICAgICAgIH07XG4gICAgICBjYXNlIFRhYmxlQnV0dG9uVHlwZS5xdWVyeTpcbiAgICAgICAgcmV0dXJuIHsgaWNvbjogJ3NlYXJjaCcsIG9uQ2xpY2s6IHRoaXMuaGFuZGxlUXVlcnksIGNoaWxkcmVuOiAkbCgnVGFibGUnLCAncXVlcnlfYnV0dG9uJykgfTtcbiAgICAgIGNhc2UgVGFibGVCdXR0b25UeXBlLmV4cG9ydDpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpY29uOiAnZXhwb3J0JyxcbiAgICAgICAgICBvbkNsaWNrOiB0aGlzLmhhbmRsZUJ1dHRvbkV4cG9ydCxcbiAgICAgICAgICBjaGlsZHJlbjogJGwoJ1RhYmxlJywgJ2V4cG9ydF9idXR0b24nKSxcbiAgICAgICAgfTtcbiAgICAgIGNhc2UgVGFibGVCdXR0b25UeXBlLmV4cGFuZEFsbDpcbiAgICAgICAgcmV0dXJuIGlzVHJlZVxuICAgICAgICAgID8ge1xuICAgICAgICAgICAgICBpY29uOiAnYWRkX2JveCcsXG4gICAgICAgICAgICAgIG9uQ2xpY2s6IHRoaXMuaGFuZGxlRXhwYW5kQWxsLFxuICAgICAgICAgICAgICBjaGlsZHJlbjogJGwoJ1RhYmxlJywgJ2V4cGFuZF9idXR0b24nKSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICA6IHVuZGVmaW5lZDtcbiAgICAgIGNhc2UgVGFibGVCdXR0b25UeXBlLmNvbGxhcHNlQWxsOlxuICAgICAgICByZXR1cm4gaXNUcmVlXG4gICAgICAgICAgPyB7XG4gICAgICAgICAgICAgIGljb246ICdzaG9ydF90ZXh0JyxcbiAgICAgICAgICAgICAgb25DbGljazogdGhpcy5oYW5kbGVDb2xsYXBzZUFsbCxcbiAgICAgICAgICAgICAgY2hpbGRyZW46ICRsKCdUYWJsZScsICdjb2xsYXBzZV9idXR0b24nKSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICA6IHVuZGVmaW5lZDtcbiAgICAgIGRlZmF1bHQ6XG4gICAgfVxuICB9XG5cbiAgZ2V0QnV0dG9ucygpOiBSZWFjdEVsZW1lbnQ8QnV0dG9uUHJvcHM+W10ge1xuICAgIGNvbnN0IHsgYnV0dG9ucyB9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCBjaGlsZHJlbjogUmVhY3RFbGVtZW50PEJ1dHRvblByb3BzPltdID0gW107XG4gICAgaWYgKGJ1dHRvbnMpIHtcbiAgICAgIGNvbnN0IHRhYmxlQnV0dG9uUHJvcHMgPSBnZXRDb25maWcoJ3RhYmxlQnV0dG9uUHJvcHMnKTtcbiAgICAgIGJ1dHRvbnMuZm9yRWFjaChidXR0b24gPT4ge1xuICAgICAgICBsZXQgcHJvcHM6IFRhYmxlQnV0dG9uUHJvcHMgPSB7fTtcbiAgICAgICAgaWYgKGlzQXJyYXlMaWtlKGJ1dHRvbikpIHtcbiAgICAgICAgICBwcm9wcyA9IGJ1dHRvblsxXSB8fCB7fTtcbiAgICAgICAgICBidXR0b24gPSBidXR0b25bMF07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzU3RyaW5nKGJ1dHRvbikgJiYgYnV0dG9uIGluIFRhYmxlQnV0dG9uVHlwZSkge1xuICAgICAgICAgIGNvbnN0IHsgYWZ0ZXJDbGljaywgLi4uYnV0dG9uUHJvcHMgfSA9IHByb3BzO1xuICAgICAgICAgIGNvbnN0IGRlZmF1bHRCdXR0b25Qcm9wcyA9IHRoaXMuZ2V0QnV0dG9uUHJvcHMoYnV0dG9uKTtcbiAgICAgICAgICBpZiAoZGVmYXVsdEJ1dHRvblByb3BzKSB7XG4gICAgICAgICAgICBpZiAoYWZ0ZXJDbGljaykge1xuICAgICAgICAgICAgICBjb25zdCB7IG9uQ2xpY2sgfSA9IGRlZmF1bHRCdXR0b25Qcm9wcztcbiAgICAgICAgICAgICAgZGVmYXVsdEJ1dHRvblByb3BzLm9uQ2xpY2sgPSBhc3luYyBlID0+IHtcbiAgICAgICAgICAgICAgICBlLnBlcnNpc3QoKTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgYXdhaXQgb25DbGljayhlKTtcbiAgICAgICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgYWZ0ZXJDbGljayhlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjaGlsZHJlbi5wdXNoKFxuICAgICAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICAgICAga2V5PXtidXR0b259XG4gICAgICAgICAgICAgICAgey4uLnRhYmxlQnV0dG9uUHJvcHN9XG4gICAgICAgICAgICAgICAgey4uLmRlZmF1bHRCdXR0b25Qcm9wc31cbiAgICAgICAgICAgICAgICB7Li4uYnV0dG9uUHJvcHN9XG4gICAgICAgICAgICAgIC8+LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoaXNWYWxpZEVsZW1lbnQ8QnV0dG9uUHJvcHM+KGJ1dHRvbikpIHtcbiAgICAgICAgICBjaGlsZHJlbi5wdXNoKGNsb25lRWxlbWVudChidXR0b24sIHsgLi4udGFibGVCdXR0b25Qcm9wcywgLi4uYnV0dG9uLnByb3BzIH0pKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc09iamVjdChidXR0b24pKSB7XG4gICAgICAgICAgY2hpbGRyZW4ucHVzaCg8QnV0dG9uIHsuLi50YWJsZUJ1dHRvblByb3BzfSB7Li4uYnV0dG9ufSAvPik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gY2hpbGRyZW47XG4gIH1cblxuICBnZXRRdWVyeUZpZWxkcygpOiBSZWFjdEVsZW1lbnQ8YW55PltdIHtcbiAgICBjb25zdCB7XG4gICAgICBjb250ZXh0OiB7XG4gICAgICAgIHRhYmxlU3RvcmU6IHsgZGF0YVNldCB9LFxuICAgICAgfSxcbiAgICAgIHByb3BzOiB7IHF1ZXJ5RmllbGRzIH0sXG4gICAgfSA9IHRoaXM7XG4gICAgY29uc3QgeyBxdWVyeURhdGFTZXQgfSA9IGRhdGFTZXQ7XG4gICAgY29uc3QgcmVzdWx0OiBSZWFjdEVsZW1lbnQ8YW55PltdID0gW107XG4gICAgaWYgKHF1ZXJ5RGF0YVNldCkge1xuICAgICAgY29uc3QgeyBmaWVsZHMgfSA9IHF1ZXJ5RGF0YVNldDtcbiAgICAgIHJldHVybiBbLi4uZmllbGRzLmVudHJpZXMoKV0ucmVkdWNlKChsaXN0LCBbbmFtZSwgZmllbGRdKSA9PiB7XG4gICAgICAgIGlmICghZmllbGQuZ2V0KCdiaW5kJykpIHtcbiAgICAgICAgICBjb25zdCBwcm9wczogYW55ID0ge1xuICAgICAgICAgICAga2V5OiBuYW1lLFxuICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgIGRhdGFTZXQ6IHF1ZXJ5RGF0YVNldCxcbiAgICAgICAgICB9O1xuICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSBxdWVyeUZpZWxkcyFbbmFtZV07XG4gICAgICAgICAgbGlzdC5wdXNoKFxuICAgICAgICAgICAgaXNWYWxpZEVsZW1lbnQoZWxlbWVudClcbiAgICAgICAgICAgICAgPyBjbG9uZUVsZW1lbnQoZWxlbWVudCwgcHJvcHMpXG4gICAgICAgICAgICAgIDogY2xvbmVFbGVtZW50KGdldEVkaXRvckJ5RmllbGQoZmllbGQpLCB7XG4gICAgICAgICAgICAgICAgICAuLi5wcm9wcyxcbiAgICAgICAgICAgICAgICAgIC4uLihpc09iamVjdChlbGVtZW50KSA/IGVsZW1lbnQgOiB7fSksXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGlzdDtcbiAgICAgIH0sIHJlc3VsdCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICByZW5kZXJUb29sQmFyKHByb3BzOiBUYWJsZVF1ZXJ5QmFySG9va1Byb3BzKSB7XG4gICAgY29uc3QgeyBwcmVmaXhDbHMgfSA9IHRoaXMucHJvcHM7XG4gICAgcmV0dXJuIDxUYWJsZVRvb2xCYXIga2V5PVwidG9vbGJhclwiIHByZWZpeENscz17cHJlZml4Q2xzfSB7Li4ucHJvcHN9IC8+O1xuICB9XG5cbiAgcmVuZGVyRmlsdGVyQmFyKHByb3BzOiBUYWJsZVF1ZXJ5QmFySG9va1Byb3BzKSB7XG4gICAgY29uc3Qge1xuICAgICAgcHJvcHM6IHsgcHJlZml4Q2xzLCBmaWx0ZXJCYXJGaWVsZE5hbWUsIGZpbHRlckJhclBsYWNlaG9sZGVyIH0sXG4gICAgfSA9IHRoaXM7XG4gICAgcmV0dXJuIChcbiAgICAgIDxUYWJsZUZpbHRlckJhclxuICAgICAgICBrZXk9XCJ0b29sYmFyXCJcbiAgICAgICAgcHJlZml4Q2xzPXtwcmVmaXhDbHN9XG4gICAgICAgIHBhcmFtTmFtZT17ZmlsdGVyQmFyRmllbGROYW1lIX1cbiAgICAgICAgcGxhY2Vob2xkZXI9e2ZpbHRlckJhclBsYWNlaG9sZGVyfVxuICAgICAgICB7Li4ucHJvcHN9XG4gICAgICAvPlxuICAgICk7XG4gIH1cblxuICByZW5kZXJBZHZhbmNlZFF1ZXJ5QmFyKHByb3BzOiBUYWJsZVF1ZXJ5QmFySG9va1Byb3BzKSB7XG4gICAgY29uc3QgeyBwcmVmaXhDbHMgfSA9IHRoaXMucHJvcHM7XG4gICAgcmV0dXJuIDxUYWJsZUFkdmFuY2VkUXVlcnlCYXIga2V5PVwidG9vbGJhclwiIHByZWZpeENscz17cHJlZml4Q2xzfSB7Li4ucHJvcHN9IC8+O1xuICB9XG5cbiAgcmVuZGVyUHJvZmVzc2lvbmFsQmFyKHByb3BzOiBUYWJsZVF1ZXJ5QmFySG9va1Byb3BzKSB7XG4gICAgY29uc3QgeyBwcmVmaXhDbHMgfSA9IHRoaXMucHJvcHM7XG4gICAgcmV0dXJuIDxUYWJsZVByb2Zlc3Npb25hbEJhciBrZXk9XCJ0b29sYmFyXCIgcHJlZml4Q2xzPXtwcmVmaXhDbHN9IHsuLi5wcm9wc30gLz47XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgYnV0dG9ucyA9IHRoaXMuZ2V0QnV0dG9ucygpO1xuICAgIGNvbnN0IHtcbiAgICAgIGNvbnRleHQ6IHtcbiAgICAgICAgdGFibGVTdG9yZTogeyBkYXRhU2V0LCBxdWVyeUJhciB9LFxuICAgICAgfSxcbiAgICAgIHByb3BzOiB7IHF1ZXJ5RmllbGRzTGltaXQsIHByZWZpeENscywgcGFnaW5hdGlvbiB9LFxuICAgICAgc2hvd1F1ZXJ5QmFyLFxuICAgIH0gPSB0aGlzO1xuICAgIGlmIChzaG93UXVlcnlCYXIpIHtcbiAgICAgIGNvbnN0IHsgcXVlcnlEYXRhU2V0IH0gPSBkYXRhU2V0O1xuICAgICAgY29uc3QgcXVlcnlGaWVsZHMgPSB0aGlzLmdldFF1ZXJ5RmllbGRzKCk7XG4gICAgICBjb25zdCBwcm9wczogVGFibGVRdWVyeUJhckhvb2tQcm9wcyA9IHtcbiAgICAgICAgZGF0YVNldCxcbiAgICAgICAgcXVlcnlEYXRhU2V0LFxuICAgICAgICBidXR0b25zLFxuICAgICAgICBwYWdpbmF0aW9uLFxuICAgICAgICBxdWVyeUZpZWxkcyxcbiAgICAgICAgcXVlcnlGaWVsZHNMaW1pdDogcXVlcnlGaWVsZHNMaW1pdCEsXG4gICAgICB9O1xuICAgICAgaWYgKHR5cGVvZiBxdWVyeUJhciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZXR1cm4gKHF1ZXJ5QmFyIGFzIFRhYmxlUXVlcnlCYXJIb29rKShwcm9wcyk7XG4gICAgICB9XG4gICAgICBzd2l0Y2ggKHF1ZXJ5QmFyKSB7XG4gICAgICAgIGNhc2UgVGFibGVRdWVyeUJhclR5cGUubm9ybWFsOlxuICAgICAgICAgIHJldHVybiB0aGlzLnJlbmRlclRvb2xCYXIocHJvcHMpO1xuICAgICAgICBjYXNlIFRhYmxlUXVlcnlCYXJUeXBlLmJhcjpcbiAgICAgICAgICByZXR1cm4gdGhpcy5yZW5kZXJGaWx0ZXJCYXIocHJvcHMpO1xuICAgICAgICBjYXNlIFRhYmxlUXVlcnlCYXJUeXBlLmFkdmFuY2VkQmFyOlxuICAgICAgICAgIHJldHVybiB0aGlzLnJlbmRlckFkdmFuY2VkUXVlcnlCYXIocHJvcHMpO1xuICAgICAgICBjYXNlIFRhYmxlUXVlcnlCYXJUeXBlLnByb2Zlc3Npb25hbEJhcjpcbiAgICAgICAgICByZXR1cm4gdGhpcy5yZW5kZXJQcm9mZXNzaW9uYWxCYXIocHJvcHMpO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gWzxUYWJsZUJ1dHRvbnMga2V5PVwidG9vbGJhclwiIHByZWZpeENscz17cHJlZml4Q2xzfSBidXR0b25zPXtidXR0b25zfSAvPiwgcGFnaW5hdGlvbl07XG4gIH1cbn1cbiJdLCJ2ZXJzaW9uIjozfQ==