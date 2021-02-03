import { __decorate } from "tslib";
import React, { cloneElement, Component, isValidElement } from 'react';
import PropTypes from 'prop-types';
import { action, set, toJS, observable, runInAction } from 'mobx';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import omit from 'lodash/omit';
import debounce from 'lodash/debounce';
import defaultTo from 'lodash/defaultTo';
import isString from 'lodash/isString';
import classes from 'component-classes';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import { isFunction, isNil } from 'lodash';
import { minColumnWidth } from './Column';
import TableContext from './TableContext';
import Icon from '../icon';
import EventManager from '../_util/EventManager';
import { getAlignByField, getColumnKey, getHeader } from './utils';
import Tooltip from '../tooltip';
import autobind from '../_util/autobind';
import { SELECTION_KEY, DRAG_KEY } from './TableStore';
import ObserverTextField from '../text-field/TextField';
let TableHeaderCell = class TableHeaderCell extends Component {
    constructor(props) {
        super(props);
        this.resizeEvent = new EventManager(typeof window !== 'undefined' && document);
        this.resizeBoundary = 0;
        this.setresizeStart = debounce((e) => {
            this.resizeStart(e);
        }, 300);
        this.onChangeHeader = (value) => {
            const { tableStore: { props: { columnsOnChange }, columns, }, } = this.context;
            const { column } = this.props;
            set(column, 'header', value);
            if (columnsOnChange) {
                columnsOnChange({ column: toJS(column), columns: toJS(columns), type: "header" /* header */ });
            }
        };
        runInAction(() => {
            this.editing = false;
        });
    }
    setEditing(editing) {
        this.editing = editing;
    }
    handleClick() {
        const { column, dataSet } = this.props;
        const { name } = column;
        if (name) {
            dataSet.sort(name);
        }
    }
    getNode(column) {
        const { getHeaderNode } = this.props;
        const headerDom = getHeaderNode();
        if (headerDom) {
            return headerDom.querySelector(`[data-index="${getColumnKey(column)}"]`);
        }
    }
    setResizeColumn(column) {
        this.resizeColumn = column;
        const node = this.getNode(column);
        if (node) {
            this.resizeBoundary = node.getBoundingClientRect().left;
        }
    }
    handleLeftResize(e) {
        const { prevColumn } = this.props;
        this.setResizeColumn(prevColumn);
        e.persist();
        this.setresizeStart(e);
    }
    handleRightResize(e) {
        const { resizeColumn } = this.props;
        this.setResizeColumn(resizeColumn);
        e.persist();
        this.setresizeStart(e);
    }
    handleLeftDoubleClick(_e) {
        if (this.setresizeStart) {
            this.setresizeStart.cancel();
            this.resizeDoubleClick();
        }
    }
    handleRightDoubleClick(_e) {
        if (this.setresizeStart) {
            this.setresizeStart.cancel();
            this.resizeDoubleClick();
        }
    }
    resizeDoubleClick() {
        const column = this.resizeColumn;
        const { tableStore: { props: { autoMaxWidth } } } = this.context;
        if (autoMaxWidth && column && column.innerMaxWidth) {
            if (column.innerMaxWidth !== column.width) {
                set(column, 'width', column.innerMaxWidth);
            }
            else if (column.minWidth) {
                set(column, 'width', column.minWidth);
            }
        }
    }
    resizeStart(e) {
        const { prefixCls } = this.props;
        const { tableStore: { node: { element }, }, } = this.context;
        classes(element).add(`${prefixCls}-resizing`);
        delete this.resizePosition;
        this.setSplitLinePosition(e.pageX);
        this.resizeEvent
            .addEventListener('mousemove', this.resize)
            .addEventListener('mouseup', this.resizeEnd);
    }
    resize(e) {
        const column = this.resizeColumn;
        const limit = this.resizeBoundary + minColumnWidth(column);
        let left = e.pageX;
        if (left < limit) {
            left = limit;
        }
        this.resizePosition = this.setSplitLinePosition(left);
    }
    resizeEnd() {
        const { prefixCls } = this.props;
        const { tableStore: { node: { element }, }, } = this.context;
        classes(element).remove(`${prefixCls}-resizing`);
        this.resizeEvent.removeEventListener('mousemove').removeEventListener('mouseup');
        const column = this.resizeColumn;
        if (this.resizePosition && column) {
            const newWidth = Math.max(this.resizePosition - this.resizeBoundary, minColumnWidth(column));
            if (newWidth !== column.width) {
                set(column, 'width', newWidth);
            }
        }
    }
    setSplitLinePosition(left) {
        const { tableStore: { node: { resizeLine }, }, } = this.context;
        const { left: rectLeft, width } = resizeLine.offsetParent.getBoundingClientRect();
        left -= rectLeft;
        if (left < 0) {
            left = 0;
        }
        else if (left >= width) {
            left = width - 1;
        }
        resizeLine.style.left = pxToRem(left) || null;
        return left + rectLeft;
    }
    renderResizer() {
        const { prevColumn, column, prefixCls } = this.props;
        const resizerPrefixCls = `${prefixCls}-resizer`;
        const pre = prevColumn && prevColumn.resizable && (React.createElement("div", { key: "pre", className: `${resizerPrefixCls} ${resizerPrefixCls}-left`, onDoubleClick: this.handleLeftDoubleClick, onMouseDown: this.handleLeftResize }));
        const next = column.resizable && (React.createElement("div", { key: "next", className: `${resizerPrefixCls} ${resizerPrefixCls}-right`, onDoubleClick: this.handleRightDoubleClick, onMouseDown: this.handleRightResize }));
        return [pre, next];
    }
    onHeaderBlur() {
        this.setEditing(false);
    }
    render() {
        const { column, prefixCls, dataSet, rowSpan, colSpan, provided, snapshot } = this.props;
        const { tableStore: { rowHeight, columnMaxDeep, columnResizable, dragColumn, dragRow, headersEditable, props: { columnsDragRender = {}, dragColumnAlign }, }, } = this.context;
        const { renderIcon } = columnsDragRender;
        const sortPrefixCls = `${prefixCls}-sort`;
        const { headerClassName, headerStyle = {}, sortable, name, align, help, showHelp, children, command, key, } = column;
        const classList = [`${prefixCls}-cell`];
        const field = dataSet.getField(name);
        if (headerClassName) {
            classList.push(headerClassName);
        }
        let cellStyle = {
            textAlign: align ||
                (command || (children && children.length) ? "center" /* center */ : getAlignByField(field)),
            ...headerStyle,
        };
        const headerNode = getHeader(column, dataSet);
        // 计数有多少个icon
        let iconQuantity = 0;
        let helpIcon;
        let sortableIcon;
        // 帮助按钮
        if (showHelp !== "none" /* none */) {
            const fieldHelp = defaultTo(field && field.get('help'), help);
            if (fieldHelp) {
                helpIcon = (React.createElement(Tooltip, { title: fieldHelp, placement: "bottom", key: "help" },
                    React.createElement(Icon, { type: "help_outline", className: `${prefixCls}-help-icon` })));
                iconQuantity += 24;
            }
        }
        // 排序按钮
        if (sortable && name) {
            const sortProps = headersEditable ? { onClick: this.handleClick } : {};
            iconQuantity += 18;
            sortableIcon = React.createElement(Icon, Object.assign({ key: "sort", type: "arrow_upward", className: `${sortPrefixCls}-icon` }, sortProps));
        }
        const headerChildren = (headerChild) => {
            if (isValidElement(headerChild)) {
                return cloneElement(headerChild, { key: 'text' });
            }
            if (isString(headerChild) || (isNil(headerChild) && headersEditable)) {
                const widthEdit = iconQuantity
                    ? `calc(100% - ${pxToRem(iconQuantity)})`
                    : headersEditable && !!name ? `100%` : undefined;
                const spanStyle = {
                    display: 'inline-block',
                    maxWidth: widthEdit,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                };
                if (headersEditable && !!name) {
                    const editProps = {
                        defaultValue: headerChild,
                        value: headerChild,
                        onChange: this.onChangeHeader,
                        key: 'text',
                        style: { width: widthEdit },
                        className: `${prefixCls}-cell-inner-edit`,
                    };
                    if (dragColumn) {
                        return (React.createElement(ObserverTextField, Object.assign({}, editProps)));
                    }
                    // 当为null 和 undefined 也可以编辑
                    if (!headerChild) {
                        spanStyle.height = '100%';
                    }
                    return (this.editing ? React.createElement(ObserverTextField, Object.assign({ autoFocus: true, onBlur: this.onHeaderBlur }, editProps)) : React.createElement("span", { onClick: () => {
                            this.setEditing(true);
                        }, style: spanStyle, key: "text" }, headerChild));
                }
                // 当文字在左边无法查看到icon处理
                if (cellStyle.textAlign !== "right" /* right */ && iconQuantity) {
                    return React.createElement("span", { key: "text", style: spanStyle }, headerChild);
                }
                return (React.createElement("span", { key: "text" }, headerNode));
            }
            return headerChild;
        };
        const innerProps = {
            className: classNames(`${prefixCls}-cell-inner`, {
                [`${prefixCls}-cell-editor`]: headersEditable && !key && !dragColumn,
                [`${prefixCls}-header-edit`]: headersEditable && !key,
                [`${prefixCls}-cell-editing`]: this.editing,
            }),
            children: [
                headerChildren(headerNode),
            ],
        };
        if (rowHeight !== 'auto') {
            const rowHeightDIV = headersEditable ? pxToRem(rowHeight + 4) : pxToRem(rowHeight);
            innerProps.style = {
                height: rowHeightDIV,
            };
        }
        const dragIcon = () => {
            if (renderIcon && isFunction(renderIcon)) {
                return renderIcon({
                    column,
                    dataSet,
                    snapshot,
                });
            }
            if (column && column.key === DRAG_KEY) {
                // 修复数据为空造成的th无法撑开
                cellStyle.width = pxToRem(column.width);
                return React.createElement(Icon, { type: "baseline-drag_indicator" });
            }
            return null;
        };
        if (column.key !== SELECTION_KEY
            && dragRow
            && (dragColumnAlign === "left" /* left */ || dragColumnAlign === "right" /* right */)
            && columnMaxDeep <= 1) {
            innerProps.children.push(dragIcon());
        }
        if (helpIcon) {
            if (cellStyle.textAlign === "right" /* right */) {
                innerProps.children.unshift(helpIcon);
            }
            else {
                innerProps.children.push(helpIcon);
            }
        }
        if (sortableIcon) {
            if (field) {
                const { order } = field;
                if (order) {
                    classList.push(`${sortPrefixCls}-${order}`);
                }
            }
            if (!headersEditable) {
                innerProps.onClick = this.handleClick;
            }
            if (cellStyle.textAlign === "right" /* right */) {
                innerProps.children.unshift(sortableIcon);
            }
            else {
                innerProps.children.push(sortableIcon);
            }
        }
        if (dragColumn && provided.draggableProps.style) {
            cellStyle = { ...omit(cellStyle, ['width', 'height']), ...provided.draggableProps.style, cursor: 'move' };
        }
        return (React.createElement("th", Object.assign({ className: classList.join(' '), rowSpan: rowSpan, ref: (ref) => {
                if (ref) {
                    provided.innerRef(ref);
                }
            } }, provided.draggableProps, provided.dragHandleProps, { colSpan: colSpan, "data-index": getColumnKey(column), style: cellStyle }),
            React.createElement("div", Object.assign({}, innerProps)),
            columnResizable && !dragColumn && this.renderResizer()));
    }
    componentWillUnmount() {
        this.resizeEvent.clear();
        this.setresizeStart.cancel();
    }
};
TableHeaderCell.displayName = 'TableHeaderCell';
TableHeaderCell.propTypes = {
    column: PropTypes.object.isRequired,
};
TableHeaderCell.contextType = TableContext;
__decorate([
    observable
], TableHeaderCell.prototype, "editing", void 0);
__decorate([
    action
], TableHeaderCell.prototype, "setEditing", null);
__decorate([
    autobind
], TableHeaderCell.prototype, "handleClick", null);
__decorate([
    autobind
], TableHeaderCell.prototype, "handleLeftResize", null);
__decorate([
    autobind
], TableHeaderCell.prototype, "handleRightResize", null);
__decorate([
    autobind
], TableHeaderCell.prototype, "handleLeftDoubleClick", null);
__decorate([
    autobind
], TableHeaderCell.prototype, "handleRightDoubleClick", null);
__decorate([
    autobind,
    action
], TableHeaderCell.prototype, "resizeDoubleClick", null);
__decorate([
    action
], TableHeaderCell.prototype, "resizeStart", null);
__decorate([
    autobind
], TableHeaderCell.prototype, "resize", null);
__decorate([
    autobind,
    action
], TableHeaderCell.prototype, "resizeEnd", null);
__decorate([
    action
], TableHeaderCell.prototype, "setSplitLinePosition", null);
__decorate([
    action
], TableHeaderCell.prototype, "onChangeHeader", void 0);
__decorate([
    autobind,
    action
], TableHeaderCell.prototype, "onHeaderBlur", null);
TableHeaderCell = __decorate([
    observer
], TableHeaderCell);
export default TableHeaderCell;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL3RhYmxlL1RhYmxlSGVhZGVyQ2VsbC50c3giLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sS0FBSyxFQUFFLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBaUIsY0FBYyxFQUFFLE1BQU0sT0FBTyxDQUFDO0FBQ3RGLE9BQU8sU0FBUyxNQUFNLFlBQVksQ0FBQztBQUNuQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUNsRSxPQUFPLFVBQVUsTUFBTSxZQUFZLENBQUM7QUFDcEMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUN0QyxPQUFPLElBQUksTUFBTSxhQUFhLENBQUM7QUFDL0IsT0FBTyxRQUFRLE1BQU0saUJBQWlCLENBQUM7QUFDdkMsT0FBTyxTQUFTLE1BQU0sa0JBQWtCLENBQUM7QUFDekMsT0FBTyxRQUFRLE1BQU0saUJBQWlCLENBQUM7QUFDdkMsT0FBTyxPQUFPLE1BQU0sbUJBQW1CLENBQUM7QUFLeEMsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBQy9ELE9BQU8sRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLE1BQU0sUUFBUSxDQUFDO0FBQzNDLE9BQU8sRUFBZSxjQUFjLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDdkQsT0FBTyxZQUFZLE1BQU0sZ0JBQWdCLENBQUM7QUFFMUMsT0FBTyxJQUFJLE1BQU0sU0FBUyxDQUFDO0FBRTNCLE9BQU8sWUFBWSxNQUFNLHVCQUF1QixDQUFDO0FBQ2pELE9BQU8sRUFBRSxlQUFlLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUduRSxPQUFPLE9BQU8sTUFBTSxZQUFZLENBQUM7QUFDakMsT0FBTyxRQUFRLE1BQU0sbUJBQW1CLENBQUM7QUFDekMsT0FBTyxFQUFFLGFBQWEsRUFBRSxRQUFRLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDdkQsT0FBTyxpQkFBaUIsTUFBTSx5QkFBeUIsQ0FBQztBQWV4RCxJQUFxQixlQUFlLEdBQXBDLE1BQXFCLGVBQWdCLFNBQVEsU0FBb0M7SUFtQi9FLFlBQVksS0FBMkI7UUFDckMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBWGYsZ0JBQVcsR0FBaUIsSUFBSSxZQUFZLENBQUMsT0FBTyxNQUFNLEtBQUssV0FBVyxJQUFJLFFBQVEsQ0FBQyxDQUFDO1FBRXhGLG1CQUFjLEdBQVcsQ0FBQyxDQUFDO1FBNkRuQixtQkFBYyxHQUFHLFFBQVEsQ0FDL0IsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUNKLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEIsQ0FBQyxFQUNELEdBQUcsQ0FDSixDQUFDO1FBMEhGLG1CQUFjLEdBQUcsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUN6QixNQUFNLEVBQ0osVUFBVSxFQUFFLEVBQ1YsS0FBSyxFQUFFLEVBQUUsZUFBZSxFQUFFLEVBQzFCLE9BQU8sR0FDUixHQUNGLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUNqQixNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUM5QixHQUFHLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUM3QixJQUFJLGVBQWUsRUFBRTtnQkFDbkIsZUFBZSxDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksdUJBQXdCLEVBQUUsQ0FBQyxDQUFDO2FBQ2pHO1FBQ0gsQ0FBQyxDQUFDO1FBOUxBLFdBQVcsQ0FBQyxHQUFHLEVBQUU7WUFDZixJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztRQUN2QixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFHRCxVQUFVLENBQUMsT0FBZ0I7UUFDekIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7SUFDekIsQ0FBQztJQUdELFdBQVc7UUFDVCxNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDdkMsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQztRQUN4QixJQUFJLElBQUksRUFBRTtZQUNSLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDcEI7SUFDSCxDQUFDO0lBRUQsT0FBTyxDQUFDLE1BQU07UUFDWixNQUFNLEVBQUUsYUFBYSxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUNyQyxNQUFNLFNBQVMsR0FBbUIsYUFBYSxFQUFFLENBQUM7UUFDbEQsSUFBSSxTQUFTLEVBQUU7WUFDYixPQUFPLFNBQVMsQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLFlBQVksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDMUU7SUFDSCxDQUFDO0lBRUQsZUFBZSxDQUFDLE1BQU07UUFDcEIsSUFBSSxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUM7UUFDM0IsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNsQyxJQUFJLElBQUksRUFBRTtZQUNSLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUMsSUFBSSxDQUFDO1NBQ3pEO0lBQ0gsQ0FBQztJQUdELGdCQUFnQixDQUFDLENBQUM7UUFDaEIsTUFBTSxFQUFFLFVBQVUsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDbEMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNqQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDWixJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3pCLENBQUM7SUFHRCxpQkFBaUIsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sRUFBRSxZQUFZLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDbkMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ1osSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN6QixDQUFDO0lBVUQscUJBQXFCLENBQUMsRUFBRTtRQUN0QixJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUU7WUFDdkIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM3QixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztTQUMxQjtJQUNILENBQUM7SUFHRCxzQkFBc0IsQ0FBQyxFQUFFO1FBQ3ZCLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRTtZQUN2QixJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzdCLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1NBQzFCO0lBQ0gsQ0FBQztJQUlELGlCQUFpQjtRQUNmLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7UUFDakMsTUFBTSxFQUFFLFVBQVUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLFlBQVksRUFBRSxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ2pFLElBQUksWUFBWSxJQUFJLE1BQU0sSUFBSSxNQUFNLENBQUMsYUFBYSxFQUFFO1lBQ2xELElBQUksTUFBTSxDQUFDLGFBQWEsS0FBSyxNQUFNLENBQUMsS0FBSyxFQUFFO2dCQUN6QyxHQUFHLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7YUFDNUM7aUJBQU0sSUFBSSxNQUFNLENBQUMsUUFBUSxFQUFFO2dCQUMxQixHQUFHLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDdkM7U0FDRjtJQUNILENBQUM7SUFHRCxXQUFXLENBQUMsQ0FBQztRQUNYLE1BQU0sRUFBRSxTQUFTLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ2pDLE1BQU0sRUFDSixVQUFVLEVBQUUsRUFDVixJQUFJLEVBQUUsRUFBRSxPQUFPLEVBQUUsR0FDbEIsR0FDRixHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDakIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFNBQVMsV0FBVyxDQUFDLENBQUM7UUFDOUMsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDO1FBQzNCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbkMsSUFBSSxDQUFDLFdBQVc7YUFDYixnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQzthQUMxQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFHRCxNQUFNLENBQUMsQ0FBQztRQUNOLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7UUFDakMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDM0QsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUNuQixJQUFJLElBQUksR0FBRyxLQUFLLEVBQUU7WUFDaEIsSUFBSSxHQUFHLEtBQUssQ0FBQztTQUNkO1FBQ0QsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUlELFNBQVM7UUFDUCxNQUFNLEVBQUUsU0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUNqQyxNQUFNLEVBQ0osVUFBVSxFQUFFLEVBQ1YsSUFBSSxFQUFFLEVBQUUsT0FBTyxFQUFFLEdBQ2xCLEdBQ0YsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ2pCLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxTQUFTLFdBQVcsQ0FBQyxDQUFDO1FBQ2pELElBQUksQ0FBQyxXQUFXLENBQUMsbUJBQW1CLENBQUMsV0FBVyxDQUFDLENBQUMsbUJBQW1CLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDakYsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztRQUNqQyxJQUFJLElBQUksQ0FBQyxjQUFjLElBQUksTUFBTSxFQUFFO1lBQ2pDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQzdGLElBQUksUUFBUSxLQUFLLE1BQU0sQ0FBQyxLQUFLLEVBQUU7Z0JBQzdCLEdBQUcsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2FBQ2hDO1NBQ0Y7SUFDSCxDQUFDO0lBR0Qsb0JBQW9CLENBQUMsSUFBWTtRQUMvQixNQUFNLEVBQ0osVUFBVSxFQUFFLEVBQ1YsSUFBSSxFQUFFLEVBQUUsVUFBVSxFQUFFLEdBQ3JCLEdBQ0YsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ2pCLE1BQU0sRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxHQUFHLFVBQVUsQ0FBQyxZQUFZLENBQUMscUJBQXFCLEVBQUUsQ0FBQztRQUNsRixJQUFJLElBQUksUUFBUSxDQUFDO1FBQ2pCLElBQUksSUFBSSxHQUFHLENBQUMsRUFBRTtZQUNaLElBQUksR0FBRyxDQUFDLENBQUM7U0FDVjthQUFNLElBQUksSUFBSSxJQUFJLEtBQUssRUFBRTtZQUN4QixJQUFJLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQztTQUNsQjtRQUNELFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUM7UUFDOUMsT0FBTyxJQUFJLEdBQUcsUUFBUSxDQUFDO0lBQ3pCLENBQUM7SUFFRCxhQUFhO1FBQ1gsTUFBTSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUNyRCxNQUFNLGdCQUFnQixHQUFHLEdBQUcsU0FBUyxVQUFVLENBQUM7UUFDaEQsTUFBTSxHQUFHLEdBQUcsVUFBVSxJQUFJLFVBQVUsQ0FBQyxTQUFTLElBQUksQ0FDaEQsNkJBQ0UsR0FBRyxFQUFDLEtBQUssRUFDVCxTQUFTLEVBQUUsR0FBRyxnQkFBZ0IsSUFBSSxnQkFBZ0IsT0FBTyxFQUN6RCxhQUFhLEVBQUUsSUFBSSxDQUFDLHFCQUFxQixFQUN6QyxXQUFXLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixHQUNsQyxDQUNILENBQUM7UUFDRixNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsU0FBUyxJQUFJLENBQy9CLDZCQUNFLEdBQUcsRUFBQyxNQUFNLEVBQ1YsU0FBUyxFQUFFLEdBQUcsZ0JBQWdCLElBQUksZ0JBQWdCLFFBQVEsRUFDMUQsYUFBYSxFQUFFLElBQUksQ0FBQyxzQkFBc0IsRUFDMUMsV0FBVyxFQUFFLElBQUksQ0FBQyxpQkFBaUIsR0FDbkMsQ0FDSCxDQUFDO1FBRUYsT0FBTyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNyQixDQUFDO0lBcUJELFlBQVk7UUFDVixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3pCLENBQUM7SUFHRCxNQUFNO1FBQ0osTUFBTSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDeEYsTUFBTSxFQUNKLFVBQVUsRUFBRSxFQUNWLFNBQVMsRUFDVCxhQUFhLEVBQ2IsZUFBZSxFQUNmLFVBQVUsRUFDVixPQUFPLEVBQ1AsZUFBZSxFQUNmLEtBQUssRUFBRSxFQUFFLGlCQUFpQixHQUFHLEVBQUUsRUFBRSxlQUFlLEVBQUUsR0FDbkQsR0FDRixHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDakIsTUFBTSxFQUFFLFVBQVUsRUFBRSxHQUFHLGlCQUFpQixDQUFDO1FBQ3pDLE1BQU0sYUFBYSxHQUFHLEdBQUcsU0FBUyxPQUFPLENBQUM7UUFDMUMsTUFBTSxFQUNKLGVBQWUsRUFDZixXQUFXLEdBQUcsRUFBRSxFQUNoQixRQUFRLEVBQ1IsSUFBSSxFQUNKLEtBQUssRUFDTCxJQUFJLEVBQ0osUUFBUSxFQUNSLFFBQVEsRUFDUixPQUFPLEVBQ1AsR0FBRyxHQUNKLEdBQUcsTUFBTSxDQUFDO1FBQ1gsTUFBTSxTQUFTLEdBQWEsQ0FBQyxHQUFHLFNBQVMsT0FBTyxDQUFDLENBQUM7UUFDbEQsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyQyxJQUFJLGVBQWUsRUFBRTtZQUNuQixTQUFTLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1NBQ2pDO1FBRUQsSUFBSSxTQUFTLEdBQWtCO1lBQzdCLFNBQVMsRUFDUCxLQUFLO2dCQUNMLENBQUMsT0FBTyxJQUFJLENBQUMsUUFBUSxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLHVCQUFvQixDQUFDLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzFGLEdBQUcsV0FBVztTQUNmLENBQUM7UUFFRixNQUFNLFVBQVUsR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRTlDLGFBQWE7UUFDYixJQUFJLFlBQVksR0FBRyxDQUFDLENBQUM7UUFDckIsSUFBSSxRQUFRLENBQUM7UUFDYixJQUFJLFlBQVksQ0FBQztRQUNqQixPQUFPO1FBQ1AsSUFBSSxRQUFRLHNCQUFrQixFQUFFO1lBQzlCLE1BQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUM5RCxJQUFJLFNBQVMsRUFBRTtnQkFDYixRQUFRLEdBQUcsQ0FDVCxvQkFBQyxPQUFPLElBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUMsUUFBUSxFQUFDLEdBQUcsRUFBQyxNQUFNO29CQUN0RCxvQkFBQyxJQUFJLElBQUMsSUFBSSxFQUFDLGNBQWMsRUFBQyxTQUFTLEVBQUUsR0FBRyxTQUFTLFlBQVksR0FBSSxDQUN6RCxDQUNYLENBQUM7Z0JBQ0YsWUFBWSxJQUFJLEVBQUUsQ0FBQzthQUNwQjtTQUNGO1FBQ0QsT0FBTztRQUNQLElBQUksUUFBUSxJQUFJLElBQUksRUFBRTtZQUNwQixNQUFNLFNBQVMsR0FBRyxlQUFlLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ3ZFLFlBQVksSUFBSSxFQUFFLENBQUM7WUFDbkIsWUFBWSxHQUFHLG9CQUFDLElBQUksa0JBQUMsR0FBRyxFQUFDLE1BQU0sRUFBQyxJQUFJLEVBQUMsY0FBYyxFQUFDLFNBQVMsRUFBRSxHQUFHLGFBQWEsT0FBTyxJQUFNLFNBQVMsRUFBSSxDQUFDO1NBQzNHO1FBRUQsTUFBTSxjQUFjLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRTtZQUNyQyxJQUFJLGNBQWMsQ0FBQyxXQUFXLENBQUMsRUFBRTtnQkFDL0IsT0FBTyxZQUFZLENBQUMsV0FBVyxFQUFFLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7YUFDbkQ7WUFDRCxJQUFJLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxlQUFlLENBQUMsRUFBRTtnQkFDcEUsTUFBTSxTQUFTLEdBQUcsWUFBWTtvQkFDNUIsQ0FBQyxDQUFDLGVBQWUsT0FBTyxDQUFDLFlBQVksQ0FBQyxHQUFHO29CQUN6QyxDQUFDLENBQUMsZUFBZSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO2dCQUNuRCxNQUFNLFNBQVMsR0FBa0I7b0JBQy9CLE9BQU8sRUFBRSxjQUFjO29CQUN2QixRQUFRLEVBQUUsU0FBUztvQkFDbkIsUUFBUSxFQUFFLFFBQVE7b0JBQ2xCLFlBQVksRUFBRSxVQUFVO2lCQUN6QixDQUFDO2dCQUNGLElBQUksZUFBZSxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUU7b0JBQzdCLE1BQU0sU0FBUyxHQUFHO3dCQUNoQixZQUFZLEVBQUUsV0FBVzt3QkFDekIsS0FBSyxFQUFFLFdBQVc7d0JBQ2xCLFFBQVEsRUFBRSxJQUFJLENBQUMsY0FBYzt3QkFDN0IsR0FBRyxFQUFFLE1BQU07d0JBQ1gsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRTt3QkFDM0IsU0FBUyxFQUFFLEdBQUcsU0FBUyxrQkFBa0I7cUJBQzFDLENBQUM7b0JBQ0YsSUFBSSxVQUFVLEVBQUU7d0JBQ2QsT0FBTyxDQUNMLG9CQUFDLGlCQUFpQixvQkFDWixTQUFTLEVBQ2IsQ0FDSCxDQUFDO3FCQUNIO29CQUNELDJCQUEyQjtvQkFDM0IsSUFBSSxDQUFDLFdBQVcsRUFBRTt3QkFDaEIsU0FBUyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7cUJBQzNCO29CQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxvQkFBQyxpQkFBaUIsa0JBQ3ZDLFNBQVMsUUFDVCxNQUFNLEVBQUUsSUFBSSxDQUFDLFlBQVksSUFDckIsU0FBUyxFQUNiLENBQUMsQ0FBQyxDQUFDLDhCQUFNLE9BQU8sRUFBRSxHQUFHLEVBQUU7NEJBQ3ZCLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ3hCLENBQUMsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBQyxNQUFNLElBQUUsV0FBVyxDQUFRLENBQUMsQ0FBQztpQkFDdkQ7Z0JBQ0Qsb0JBQW9CO2dCQUNwQixJQUFJLFNBQVMsQ0FBQyxTQUFTLHdCQUFzQixJQUFJLFlBQVksRUFBRTtvQkFDN0QsT0FBTyw4QkFBTSxHQUFHLEVBQUMsTUFBTSxFQUFDLEtBQUssRUFBRSxTQUFTLElBQUcsV0FBVyxDQUFRLENBQUM7aUJBQ2hFO2dCQUVELE9BQU8sQ0FBQyw4QkFBTSxHQUFHLEVBQUMsTUFBTSxJQUFFLFVBQVUsQ0FBUSxDQUFDLENBQUM7YUFDL0M7WUFDRCxPQUFPLFdBQVcsQ0FBQztRQUNyQixDQUFDLENBQUM7UUFFRixNQUFNLFVBQVUsR0FBUTtZQUN0QixTQUFTLEVBQUUsVUFBVSxDQUFDLEdBQUcsU0FBUyxhQUFhLEVBQUU7Z0JBQy9DLENBQUMsR0FBRyxTQUFTLGNBQWMsQ0FBQyxFQUFFLGVBQWUsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVU7Z0JBQ3BFLENBQUMsR0FBRyxTQUFTLGNBQWMsQ0FBQyxFQUFFLGVBQWUsSUFBSSxDQUFDLEdBQUc7Z0JBQ3JELENBQUMsR0FBRyxTQUFTLGVBQWUsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPO2FBQzVDLENBQUM7WUFDRixRQUFRLEVBQUU7Z0JBQ1IsY0FBYyxDQUFDLFVBQVUsQ0FBQzthQUMzQjtTQUNGLENBQUM7UUFFRixJQUFJLFNBQVMsS0FBSyxNQUFNLEVBQUU7WUFDeEIsTUFBTSxZQUFZLEdBQUcsZUFBZSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDbkYsVUFBVSxDQUFDLEtBQUssR0FBRztnQkFDakIsTUFBTSxFQUFFLFlBQVk7YUFDckIsQ0FBQztTQUNIO1FBQ0QsTUFBTSxRQUFRLEdBQUcsR0FBRyxFQUFFO1lBQ3BCLElBQUksVUFBVSxJQUFJLFVBQVUsQ0FBQyxVQUFVLENBQUMsRUFBRTtnQkFDeEMsT0FBTyxVQUFVLENBQUM7b0JBQ2hCLE1BQU07b0JBQ04sT0FBTztvQkFDUCxRQUFRO2lCQUNULENBQUMsQ0FBQzthQUNKO1lBQ0QsSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLEdBQUcsS0FBSyxRQUFRLEVBQUU7Z0JBQ3JDLGtCQUFrQjtnQkFDbEIsU0FBUyxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUN4QyxPQUFPLG9CQUFDLElBQUksSUFBQyxJQUFJLEVBQUMseUJBQXlCLEdBQUcsQ0FBQzthQUNoRDtZQUNELE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQyxDQUFDO1FBQ0YsSUFDRSxNQUFNLENBQUMsR0FBRyxLQUFLLGFBQWE7ZUFDekIsT0FBTztlQUNQLENBQUMsZUFBZSxzQkFBeUIsSUFBSSxlQUFlLHdCQUEwQixDQUFDO2VBQ3ZGLGFBQWEsSUFBSSxDQUFDLEVBQ3JCO1lBQ0EsVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztTQUN0QztRQUVELElBQUksUUFBUSxFQUFFO1lBQ1osSUFBSSxTQUFTLENBQUMsU0FBUyx3QkFBc0IsRUFBRTtnQkFDN0MsVUFBVSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDdkM7aUJBQU07Z0JBQ0wsVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDcEM7U0FDRjtRQUVELElBQUksWUFBWSxFQUFFO1lBQ2hCLElBQUksS0FBSyxFQUFFO2dCQUNULE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxLQUFLLENBQUM7Z0JBQ3hCLElBQUksS0FBSyxFQUFFO29CQUNULFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxhQUFhLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQztpQkFDN0M7YUFDRjtZQUNELElBQUksQ0FBQyxlQUFlLEVBQUU7Z0JBQ3BCLFVBQVUsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQzthQUN2QztZQUNELElBQUksU0FBUyxDQUFDLFNBQVMsd0JBQXNCLEVBQUU7Z0JBQzdDLFVBQVUsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO2FBQzNDO2lCQUFNO2dCQUNMLFVBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO2FBQ3hDO1NBQ0Y7UUFDRCxJQUFJLFVBQVUsSUFBSSxRQUFRLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRTtZQUMvQyxTQUFTLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsQ0FBQztTQUMzRztRQUNELE9BQU8sQ0FDTCwwQ0FDRSxTQUFTLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFDOUIsT0FBTyxFQUFFLE9BQU8sRUFDaEIsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUU7Z0JBQ1gsSUFBSSxHQUFHLEVBQUU7b0JBQ1AsUUFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztpQkFDeEI7WUFDSCxDQUFDLElBQ0csUUFBUSxDQUFDLGNBQWMsRUFDdkIsUUFBUSxDQUFDLGVBQWUsSUFDNUIsT0FBTyxFQUFFLE9BQU8sZ0JBQ0osWUFBWSxDQUFDLE1BQU0sQ0FBQyxFQUNoQyxLQUFLLEVBQUUsU0FBUztZQUVoQiw2Q0FBUyxVQUFVLEVBQUk7WUFDdEIsZUFBZSxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FDcEQsQ0FDTixDQUFDO0lBQ0osQ0FBQztJQUVELG9CQUFvQjtRQUNsQixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDL0IsQ0FBQztDQUNGLENBQUE7QUE5YVEsMkJBQVcsR0FBRyxpQkFBaUIsQ0FBQztBQUVoQyx5QkFBUyxHQUFHO0lBQ2pCLE1BQU0sRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7Q0FDcEMsQ0FBQztBQUVLLDJCQUFXLEdBQUcsWUFBWSxDQUFDO0FBVXRCO0lBQVgsVUFBVTtnREFBa0I7QUFVN0I7SUFEQyxNQUFNO2lEQUdOO0FBR0Q7SUFEQyxRQUFRO2tEQU9SO0FBbUJEO0lBREMsUUFBUTt1REFNUjtBQUdEO0lBREMsUUFBUTt3REFNUjtBQVVEO0lBREMsUUFBUTs0REFNUjtBQUdEO0lBREMsUUFBUTs2REFNUjtBQUlEO0lBRkMsUUFBUTtJQUNSLE1BQU07d0RBV047QUFHRDtJQURDLE1BQU07a0RBY047QUFHRDtJQURDLFFBQVE7NkNBU1I7QUFJRDtJQUZDLFFBQVE7SUFDUixNQUFNO2dEQWlCTjtBQUdEO0lBREMsTUFBTTsyREFnQk47QUEyQkQ7SUFEQyxNQUFNO3VEQWFMO0FBS0Y7SUFGQyxRQUFRO0lBQ1IsTUFBTTttREFHTjtBQTFOa0IsZUFBZTtJQURuQyxRQUFRO0dBQ1ksZUFBZSxDQSthbkM7ZUEvYW9CLGVBQWUiLCJuYW1lcyI6W10sInNvdXJjZXMiOlsiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL3RhYmxlL1RhYmxlSGVhZGVyQ2VsbC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7IGNsb25lRWxlbWVudCwgQ29tcG9uZW50LCBDU1NQcm9wZXJ0aWVzLCBpc1ZhbGlkRWxlbWVudCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgeyBhY3Rpb24sIHNldCwgdG9KUywgb2JzZXJ2YWJsZSwgcnVuSW5BY3Rpb24gfSBmcm9tICdtb2J4JztcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHsgb2JzZXJ2ZXIgfSBmcm9tICdtb2J4LXJlYWN0JztcbmltcG9ydCBvbWl0IGZyb20gJ2xvZGFzaC9vbWl0JztcbmltcG9ydCBkZWJvdW5jZSBmcm9tICdsb2Rhc2gvZGVib3VuY2UnO1xuaW1wb3J0IGRlZmF1bHRUbyBmcm9tICdsb2Rhc2gvZGVmYXVsdFRvJztcbmltcG9ydCBpc1N0cmluZyBmcm9tICdsb2Rhc2gvaXNTdHJpbmcnO1xuaW1wb3J0IGNsYXNzZXMgZnJvbSAnY29tcG9uZW50LWNsYXNzZXMnO1xuaW1wb3J0IHtcbiAgRHJhZ2dhYmxlUHJvdmlkZWQsXG4gIERyYWdnYWJsZVN0YXRlU25hcHNob3QsXG59IGZyb20gJ3JlYWN0LWJlYXV0aWZ1bC1kbmQnO1xuaW1wb3J0IHsgcHhUb1JlbSB9IGZyb20gJ2Nob2Vyb2Rvbi11aS9saWIvX3V0aWwvVW5pdENvbnZlcnRvcic7XG5pbXBvcnQgeyBpc0Z1bmN0aW9uLCBpc05pbCB9IGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgeyBDb2x1bW5Qcm9wcywgbWluQ29sdW1uV2lkdGggfSBmcm9tICcuL0NvbHVtbic7XG5pbXBvcnQgVGFibGVDb250ZXh0IGZyb20gJy4vVGFibGVDb250ZXh0JztcbmltcG9ydCB7IEVsZW1lbnRQcm9wcyB9IGZyb20gJy4uL2NvcmUvVmlld0NvbXBvbmVudCc7XG5pbXBvcnQgSWNvbiBmcm9tICcuLi9pY29uJztcbmltcG9ydCBEYXRhU2V0IGZyb20gJy4uL2RhdGEtc2V0L0RhdGFTZXQnO1xuaW1wb3J0IEV2ZW50TWFuYWdlciBmcm9tICcuLi9fdXRpbC9FdmVudE1hbmFnZXInO1xuaW1wb3J0IHsgZ2V0QWxpZ25CeUZpZWxkLCBnZXRDb2x1bW5LZXksIGdldEhlYWRlciB9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHsgQ29sdW1uQWxpZ24sIENvbHVtbnNFZGl0VHlwZSwgRHJhZ0NvbHVtbkFsaWduIH0gZnJvbSAnLi9lbnVtJztcbmltcG9ydCB7IFNob3dIZWxwIH0gZnJvbSAnLi4vZmllbGQvZW51bSc7XG5pbXBvcnQgVG9vbHRpcCBmcm9tICcuLi90b29sdGlwJztcbmltcG9ydCBhdXRvYmluZCBmcm9tICcuLi9fdXRpbC9hdXRvYmluZCc7XG5pbXBvcnQgeyBTRUxFQ1RJT05fS0VZLCBEUkFHX0tFWSB9IGZyb20gJy4vVGFibGVTdG9yZSc7XG5pbXBvcnQgT2JzZXJ2ZXJUZXh0RmllbGQgZnJvbSAnLi4vdGV4dC1maWVsZC9UZXh0RmllbGQnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFRhYmxlSGVhZGVyQ2VsbFByb3BzIGV4dGVuZHMgRWxlbWVudFByb3BzIHtcbiAgZGF0YVNldDogRGF0YVNldDtcbiAgcHJldkNvbHVtbj86IENvbHVtblByb3BzO1xuICBjb2x1bW46IENvbHVtblByb3BzO1xuICByZXNpemVDb2x1bW4/OiBDb2x1bW5Qcm9wcztcbiAgcm93U3Bhbj86IG51bWJlcjtcbiAgY29sU3Bhbj86IG51bWJlcjtcbiAgZ2V0SGVhZGVyTm9kZTogKCkgPT4gSFRNTFRhYmxlU2VjdGlvbkVsZW1lbnQgfCBudWxsO1xuICBzbmFwc2hvdDogRHJhZ2dhYmxlU3RhdGVTbmFwc2hvdCxcbiAgcHJvdmlkZWQ6IERyYWdnYWJsZVByb3ZpZGVkO1xufVxuXG5Ab2JzZXJ2ZXJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRhYmxlSGVhZGVyQ2VsbCBleHRlbmRzIENvbXBvbmVudDxUYWJsZUhlYWRlckNlbGxQcm9wcywgYW55PiB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZSA9ICdUYWJsZUhlYWRlckNlbGwnO1xuXG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgY29sdW1uOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gIH07XG5cbiAgc3RhdGljIGNvbnRleHRUeXBlID0gVGFibGVDb250ZXh0O1xuXG4gIHJlc2l6ZUV2ZW50OiBFdmVudE1hbmFnZXIgPSBuZXcgRXZlbnRNYW5hZ2VyKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIGRvY3VtZW50KTtcblxuICByZXNpemVCb3VuZGFyeTogbnVtYmVyID0gMDtcblxuICByZXNpemVQb3NpdGlvbj86IG51bWJlcjtcblxuICByZXNpemVDb2x1bW4/OiBDb2x1bW5Qcm9wcztcblxuICBAb2JzZXJ2YWJsZSBlZGl0aW5nOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBUYWJsZUhlYWRlckNlbGxQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICB0aGlzLmVkaXRpbmcgPSBmYWxzZTtcbiAgICB9KTtcbiAgfVxuXG4gIEBhY3Rpb25cbiAgc2V0RWRpdGluZyhlZGl0aW5nOiBib29sZWFuKSB7XG4gICAgdGhpcy5lZGl0aW5nID0gZWRpdGluZztcbiAgfVxuXG4gIEBhdXRvYmluZFxuICBoYW5kbGVDbGljaygpIHtcbiAgICBjb25zdCB7IGNvbHVtbiwgZGF0YVNldCB9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7IG5hbWUgfSA9IGNvbHVtbjtcbiAgICBpZiAobmFtZSkge1xuICAgICAgZGF0YVNldC5zb3J0KG5hbWUpO1xuICAgIH1cbiAgfVxuXG4gIGdldE5vZGUoY29sdW1uKSB7XG4gICAgY29uc3QgeyBnZXRIZWFkZXJOb2RlIH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IGhlYWRlckRvbTogRWxlbWVudCB8IG51bGwgPSBnZXRIZWFkZXJOb2RlKCk7XG4gICAgaWYgKGhlYWRlckRvbSkge1xuICAgICAgcmV0dXJuIGhlYWRlckRvbS5xdWVyeVNlbGVjdG9yKGBbZGF0YS1pbmRleD1cIiR7Z2V0Q29sdW1uS2V5KGNvbHVtbil9XCJdYCk7XG4gICAgfVxuICB9XG5cbiAgc2V0UmVzaXplQ29sdW1uKGNvbHVtbikge1xuICAgIHRoaXMucmVzaXplQ29sdW1uID0gY29sdW1uO1xuICAgIGNvbnN0IG5vZGUgPSB0aGlzLmdldE5vZGUoY29sdW1uKTtcbiAgICBpZiAobm9kZSkge1xuICAgICAgdGhpcy5yZXNpemVCb3VuZGFyeSA9IG5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdDtcbiAgICB9XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgaGFuZGxlTGVmdFJlc2l6ZShlKSB7XG4gICAgY29uc3QgeyBwcmV2Q29sdW1uIH0gPSB0aGlzLnByb3BzO1xuICAgIHRoaXMuc2V0UmVzaXplQ29sdW1uKHByZXZDb2x1bW4pO1xuICAgIGUucGVyc2lzdCgpO1xuICAgIHRoaXMuc2V0cmVzaXplU3RhcnQoZSk7XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgaGFuZGxlUmlnaHRSZXNpemUoZSkge1xuICAgIGNvbnN0IHsgcmVzaXplQ29sdW1uIH0gPSB0aGlzLnByb3BzO1xuICAgIHRoaXMuc2V0UmVzaXplQ29sdW1uKHJlc2l6ZUNvbHVtbik7XG4gICAgZS5wZXJzaXN0KCk7XG4gICAgdGhpcy5zZXRyZXNpemVTdGFydChlKTtcbiAgfVxuXG4gIHByaXZhdGUgc2V0cmVzaXplU3RhcnQgPSBkZWJvdW5jZShcbiAgICAoZSkgPT4ge1xuICAgICAgdGhpcy5yZXNpemVTdGFydChlKTtcbiAgICB9LFxuICAgIDMwMCxcbiAgKTtcblxuICBAYXV0b2JpbmRcbiAgaGFuZGxlTGVmdERvdWJsZUNsaWNrKF9lKSB7XG4gICAgaWYgKHRoaXMuc2V0cmVzaXplU3RhcnQpIHtcbiAgICAgIHRoaXMuc2V0cmVzaXplU3RhcnQuY2FuY2VsKCk7XG4gICAgICB0aGlzLnJlc2l6ZURvdWJsZUNsaWNrKCk7XG4gICAgfVxuICB9XG5cbiAgQGF1dG9iaW5kXG4gIGhhbmRsZVJpZ2h0RG91YmxlQ2xpY2soX2UpIHtcbiAgICBpZiAodGhpcy5zZXRyZXNpemVTdGFydCkge1xuICAgICAgdGhpcy5zZXRyZXNpemVTdGFydC5jYW5jZWwoKTtcbiAgICAgIHRoaXMucmVzaXplRG91YmxlQ2xpY2soKTtcbiAgICB9XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgQGFjdGlvblxuICByZXNpemVEb3VibGVDbGljaygpOiB2b2lkIHtcbiAgICBjb25zdCBjb2x1bW4gPSB0aGlzLnJlc2l6ZUNvbHVtbjtcbiAgICBjb25zdCB7IHRhYmxlU3RvcmU6IHsgcHJvcHM6IHsgYXV0b01heFdpZHRoIH0gfSB9ID0gdGhpcy5jb250ZXh0O1xuICAgIGlmIChhdXRvTWF4V2lkdGggJiYgY29sdW1uICYmIGNvbHVtbi5pbm5lck1heFdpZHRoKSB7XG4gICAgICBpZiAoY29sdW1uLmlubmVyTWF4V2lkdGggIT09IGNvbHVtbi53aWR0aCkge1xuICAgICAgICBzZXQoY29sdW1uLCAnd2lkdGgnLCBjb2x1bW4uaW5uZXJNYXhXaWR0aCk7XG4gICAgICB9IGVsc2UgaWYgKGNvbHVtbi5taW5XaWR0aCkge1xuICAgICAgICBzZXQoY29sdW1uLCAnd2lkdGgnLCBjb2x1bW4ubWluV2lkdGgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIEBhY3Rpb25cbiAgcmVzaXplU3RhcnQoZSk6IHZvaWQge1xuICAgIGNvbnN0IHsgcHJlZml4Q2xzIH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHtcbiAgICAgIHRhYmxlU3RvcmU6IHtcbiAgICAgICAgbm9kZTogeyBlbGVtZW50IH0sXG4gICAgICB9LFxuICAgIH0gPSB0aGlzLmNvbnRleHQ7XG4gICAgY2xhc3NlcyhlbGVtZW50KS5hZGQoYCR7cHJlZml4Q2xzfS1yZXNpemluZ2ApO1xuICAgIGRlbGV0ZSB0aGlzLnJlc2l6ZVBvc2l0aW9uO1xuICAgIHRoaXMuc2V0U3BsaXRMaW5lUG9zaXRpb24oZS5wYWdlWCk7XG4gICAgdGhpcy5yZXNpemVFdmVudFxuICAgICAgLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMucmVzaXplKVxuICAgICAgLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLnJlc2l6ZUVuZCk7XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgcmVzaXplKGUpOiB2b2lkIHtcbiAgICBjb25zdCBjb2x1bW4gPSB0aGlzLnJlc2l6ZUNvbHVtbjtcbiAgICBjb25zdCBsaW1pdCA9IHRoaXMucmVzaXplQm91bmRhcnkgKyBtaW5Db2x1bW5XaWR0aChjb2x1bW4pO1xuICAgIGxldCBsZWZ0ID0gZS5wYWdlWDtcbiAgICBpZiAobGVmdCA8IGxpbWl0KSB7XG4gICAgICBsZWZ0ID0gbGltaXQ7XG4gICAgfVxuICAgIHRoaXMucmVzaXplUG9zaXRpb24gPSB0aGlzLnNldFNwbGl0TGluZVBvc2l0aW9uKGxlZnQpO1xuICB9XG5cbiAgQGF1dG9iaW5kXG4gIEBhY3Rpb25cbiAgcmVzaXplRW5kKCk6IHZvaWQge1xuICAgIGNvbnN0IHsgcHJlZml4Q2xzIH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHtcbiAgICAgIHRhYmxlU3RvcmU6IHtcbiAgICAgICAgbm9kZTogeyBlbGVtZW50IH0sXG4gICAgICB9LFxuICAgIH0gPSB0aGlzLmNvbnRleHQ7XG4gICAgY2xhc3NlcyhlbGVtZW50KS5yZW1vdmUoYCR7cHJlZml4Q2xzfS1yZXNpemluZ2ApO1xuICAgIHRoaXMucmVzaXplRXZlbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJykucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcpO1xuICAgIGNvbnN0IGNvbHVtbiA9IHRoaXMucmVzaXplQ29sdW1uO1xuICAgIGlmICh0aGlzLnJlc2l6ZVBvc2l0aW9uICYmIGNvbHVtbikge1xuICAgICAgY29uc3QgbmV3V2lkdGggPSBNYXRoLm1heCh0aGlzLnJlc2l6ZVBvc2l0aW9uIC0gdGhpcy5yZXNpemVCb3VuZGFyeSwgbWluQ29sdW1uV2lkdGgoY29sdW1uKSk7XG4gICAgICBpZiAobmV3V2lkdGggIT09IGNvbHVtbi53aWR0aCkge1xuICAgICAgICBzZXQoY29sdW1uLCAnd2lkdGgnLCBuZXdXaWR0aCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgQGFjdGlvblxuICBzZXRTcGxpdExpbmVQb3NpdGlvbihsZWZ0OiBudW1iZXIpOiBudW1iZXIgfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IHtcbiAgICAgIHRhYmxlU3RvcmU6IHtcbiAgICAgICAgbm9kZTogeyByZXNpemVMaW5lIH0sXG4gICAgICB9LFxuICAgIH0gPSB0aGlzLmNvbnRleHQ7XG4gICAgY29uc3QgeyBsZWZ0OiByZWN0TGVmdCwgd2lkdGggfSA9IHJlc2l6ZUxpbmUub2Zmc2V0UGFyZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGxlZnQgLT0gcmVjdExlZnQ7XG4gICAgaWYgKGxlZnQgPCAwKSB7XG4gICAgICBsZWZ0ID0gMDtcbiAgICB9IGVsc2UgaWYgKGxlZnQgPj0gd2lkdGgpIHtcbiAgICAgIGxlZnQgPSB3aWR0aCAtIDE7XG4gICAgfVxuICAgIHJlc2l6ZUxpbmUuc3R5bGUubGVmdCA9IHB4VG9SZW0obGVmdCkgfHwgbnVsbDtcbiAgICByZXR1cm4gbGVmdCArIHJlY3RMZWZ0O1xuICB9XG5cbiAgcmVuZGVyUmVzaXplcigpIHtcbiAgICBjb25zdCB7IHByZXZDb2x1bW4sIGNvbHVtbiwgcHJlZml4Q2xzIH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHJlc2l6ZXJQcmVmaXhDbHMgPSBgJHtwcmVmaXhDbHN9LXJlc2l6ZXJgO1xuICAgIGNvbnN0IHByZSA9IHByZXZDb2x1bW4gJiYgcHJldkNvbHVtbi5yZXNpemFibGUgJiYgKFxuICAgICAgPGRpdlxuICAgICAgICBrZXk9XCJwcmVcIlxuICAgICAgICBjbGFzc05hbWU9e2Ake3Jlc2l6ZXJQcmVmaXhDbHN9ICR7cmVzaXplclByZWZpeENsc30tbGVmdGB9XG4gICAgICAgIG9uRG91YmxlQ2xpY2s9e3RoaXMuaGFuZGxlTGVmdERvdWJsZUNsaWNrfVxuICAgICAgICBvbk1vdXNlRG93bj17dGhpcy5oYW5kbGVMZWZ0UmVzaXplfVxuICAgICAgLz5cbiAgICApO1xuICAgIGNvbnN0IG5leHQgPSBjb2x1bW4ucmVzaXphYmxlICYmIChcbiAgICAgIDxkaXZcbiAgICAgICAga2V5PVwibmV4dFwiXG4gICAgICAgIGNsYXNzTmFtZT17YCR7cmVzaXplclByZWZpeENsc30gJHtyZXNpemVyUHJlZml4Q2xzfS1yaWdodGB9XG4gICAgICAgIG9uRG91YmxlQ2xpY2s9e3RoaXMuaGFuZGxlUmlnaHREb3VibGVDbGlja31cbiAgICAgICAgb25Nb3VzZURvd249e3RoaXMuaGFuZGxlUmlnaHRSZXNpemV9XG4gICAgICAvPlxuICAgICk7XG5cbiAgICByZXR1cm4gW3ByZSwgbmV4dF07XG4gIH1cblxuXG4gIEBhY3Rpb25cbiAgb25DaGFuZ2VIZWFkZXIgPSAodmFsdWUpID0+IHtcbiAgICBjb25zdCB7XG4gICAgICB0YWJsZVN0b3JlOiB7XG4gICAgICAgIHByb3BzOiB7IGNvbHVtbnNPbkNoYW5nZSB9LFxuICAgICAgICBjb2x1bW5zLFxuICAgICAgfSxcbiAgICB9ID0gdGhpcy5jb250ZXh0O1xuICAgIGNvbnN0IHsgY29sdW1uIH0gPSB0aGlzLnByb3BzO1xuICAgIHNldChjb2x1bW4sICdoZWFkZXInLCB2YWx1ZSk7XG4gICAgaWYgKGNvbHVtbnNPbkNoYW5nZSkge1xuICAgICAgY29sdW1uc09uQ2hhbmdlKHsgY29sdW1uOiB0b0pTKGNvbHVtbiksIGNvbHVtbnM6IHRvSlMoY29sdW1ucyksIHR5cGU6IENvbHVtbnNFZGl0VHlwZS5oZWFkZXIgfSk7XG4gICAgfVxuICB9O1xuXG5cbiAgQGF1dG9iaW5kXG4gIEBhY3Rpb25cbiAgb25IZWFkZXJCbHVyKCkge1xuICAgIHRoaXMuc2V0RWRpdGluZyhmYWxzZSk7XG4gIH1cblxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7IGNvbHVtbiwgcHJlZml4Q2xzLCBkYXRhU2V0LCByb3dTcGFuLCBjb2xTcGFuLCBwcm92aWRlZCwgc25hcHNob3QgfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge1xuICAgICAgdGFibGVTdG9yZToge1xuICAgICAgICByb3dIZWlnaHQsXG4gICAgICAgIGNvbHVtbk1heERlZXAsXG4gICAgICAgIGNvbHVtblJlc2l6YWJsZSxcbiAgICAgICAgZHJhZ0NvbHVtbixcbiAgICAgICAgZHJhZ1JvdyxcbiAgICAgICAgaGVhZGVyc0VkaXRhYmxlLFxuICAgICAgICBwcm9wczogeyBjb2x1bW5zRHJhZ1JlbmRlciA9IHt9LCBkcmFnQ29sdW1uQWxpZ24gfSxcbiAgICAgIH0sXG4gICAgfSA9IHRoaXMuY29udGV4dDtcbiAgICBjb25zdCB7IHJlbmRlckljb24gfSA9IGNvbHVtbnNEcmFnUmVuZGVyO1xuICAgIGNvbnN0IHNvcnRQcmVmaXhDbHMgPSBgJHtwcmVmaXhDbHN9LXNvcnRgO1xuICAgIGNvbnN0IHtcbiAgICAgIGhlYWRlckNsYXNzTmFtZSxcbiAgICAgIGhlYWRlclN0eWxlID0ge30sXG4gICAgICBzb3J0YWJsZSxcbiAgICAgIG5hbWUsXG4gICAgICBhbGlnbixcbiAgICAgIGhlbHAsXG4gICAgICBzaG93SGVscCxcbiAgICAgIGNoaWxkcmVuLFxuICAgICAgY29tbWFuZCxcbiAgICAgIGtleSxcbiAgICB9ID0gY29sdW1uO1xuICAgIGNvbnN0IGNsYXNzTGlzdDogc3RyaW5nW10gPSBbYCR7cHJlZml4Q2xzfS1jZWxsYF07XG4gICAgY29uc3QgZmllbGQgPSBkYXRhU2V0LmdldEZpZWxkKG5hbWUpO1xuICAgIGlmIChoZWFkZXJDbGFzc05hbWUpIHtcbiAgICAgIGNsYXNzTGlzdC5wdXNoKGhlYWRlckNsYXNzTmFtZSk7XG4gICAgfVxuXG4gICAgbGV0IGNlbGxTdHlsZTogQ1NTUHJvcGVydGllcyA9IHtcbiAgICAgIHRleHRBbGlnbjpcbiAgICAgICAgYWxpZ24gfHxcbiAgICAgICAgKGNvbW1hbmQgfHwgKGNoaWxkcmVuICYmIGNoaWxkcmVuLmxlbmd0aCkgPyBDb2x1bW5BbGlnbi5jZW50ZXIgOiBnZXRBbGlnbkJ5RmllbGQoZmllbGQpKSxcbiAgICAgIC4uLmhlYWRlclN0eWxlLFxuICAgIH07XG5cbiAgICBjb25zdCBoZWFkZXJOb2RlID0gZ2V0SGVhZGVyKGNvbHVtbiwgZGF0YVNldCk7XG5cbiAgICAvLyDorqHmlbDmnInlpJrlsJHkuKppY29uXG4gICAgbGV0IGljb25RdWFudGl0eSA9IDA7XG4gICAgbGV0IGhlbHBJY29uO1xuICAgIGxldCBzb3J0YWJsZUljb247XG4gICAgLy8g5biu5Yqp5oyJ6ZKuXG4gICAgaWYgKHNob3dIZWxwICE9PSBTaG93SGVscC5ub25lKSB7XG4gICAgICBjb25zdCBmaWVsZEhlbHAgPSBkZWZhdWx0VG8oZmllbGQgJiYgZmllbGQuZ2V0KCdoZWxwJyksIGhlbHApO1xuICAgICAgaWYgKGZpZWxkSGVscCkge1xuICAgICAgICBoZWxwSWNvbiA9IChcbiAgICAgICAgICA8VG9vbHRpcCB0aXRsZT17ZmllbGRIZWxwfSBwbGFjZW1lbnQ9XCJib3R0b21cIiBrZXk9XCJoZWxwXCI+XG4gICAgICAgICAgICA8SWNvbiB0eXBlPVwiaGVscF9vdXRsaW5lXCIgY2xhc3NOYW1lPXtgJHtwcmVmaXhDbHN9LWhlbHAtaWNvbmB9IC8+XG4gICAgICAgICAgPC9Ub29sdGlwPlxuICAgICAgICApO1xuICAgICAgICBpY29uUXVhbnRpdHkgKz0gMjQ7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIOaOkuW6j+aMiemSrlxuICAgIGlmIChzb3J0YWJsZSAmJiBuYW1lKSB7XG4gICAgICBjb25zdCBzb3J0UHJvcHMgPSBoZWFkZXJzRWRpdGFibGUgPyB7IG9uQ2xpY2s6IHRoaXMuaGFuZGxlQ2xpY2sgfSA6IHt9O1xuICAgICAgaWNvblF1YW50aXR5ICs9IDE4O1xuICAgICAgc29ydGFibGVJY29uID0gPEljb24ga2V5PVwic29ydFwiIHR5cGU9XCJhcnJvd191cHdhcmRcIiBjbGFzc05hbWU9e2Ake3NvcnRQcmVmaXhDbHN9LWljb25gfSB7Li4uc29ydFByb3BzfSAvPjtcbiAgICB9XG5cbiAgICBjb25zdCBoZWFkZXJDaGlsZHJlbiA9IChoZWFkZXJDaGlsZCkgPT4ge1xuICAgICAgaWYgKGlzVmFsaWRFbGVtZW50KGhlYWRlckNoaWxkKSkge1xuICAgICAgICByZXR1cm4gY2xvbmVFbGVtZW50KGhlYWRlckNoaWxkLCB7IGtleTogJ3RleHQnIH0pO1xuICAgICAgfVxuICAgICAgaWYgKGlzU3RyaW5nKGhlYWRlckNoaWxkKSB8fCAoaXNOaWwoaGVhZGVyQ2hpbGQpICYmIGhlYWRlcnNFZGl0YWJsZSkpIHtcbiAgICAgICAgY29uc3Qgd2lkdGhFZGl0ID0gaWNvblF1YW50aXR5XG4gICAgICAgICAgPyBgY2FsYygxMDAlIC0gJHtweFRvUmVtKGljb25RdWFudGl0eSl9KWBcbiAgICAgICAgICA6IGhlYWRlcnNFZGl0YWJsZSAmJiAhIW5hbWUgPyBgMTAwJWAgOiB1bmRlZmluZWQ7XG4gICAgICAgIGNvbnN0IHNwYW5TdHlsZTogQ1NTUHJvcGVydGllcyA9IHtcbiAgICAgICAgICBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJyxcbiAgICAgICAgICBtYXhXaWR0aDogd2lkdGhFZGl0LFxuICAgICAgICAgIG92ZXJmbG93OiAnaGlkZGVuJyxcbiAgICAgICAgICB0ZXh0T3ZlcmZsb3c6ICdlbGxpcHNpcycsXG4gICAgICAgIH07XG4gICAgICAgIGlmIChoZWFkZXJzRWRpdGFibGUgJiYgISFuYW1lKSB7XG4gICAgICAgICAgY29uc3QgZWRpdFByb3BzID0ge1xuICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiBoZWFkZXJDaGlsZCxcbiAgICAgICAgICAgIHZhbHVlOiBoZWFkZXJDaGlsZCxcbiAgICAgICAgICAgIG9uQ2hhbmdlOiB0aGlzLm9uQ2hhbmdlSGVhZGVyLFxuICAgICAgICAgICAga2V5OiAndGV4dCcsXG4gICAgICAgICAgICBzdHlsZTogeyB3aWR0aDogd2lkdGhFZGl0IH0sXG4gICAgICAgICAgICBjbGFzc05hbWU6IGAke3ByZWZpeENsc30tY2VsbC1pbm5lci1lZGl0YCxcbiAgICAgICAgICB9O1xuICAgICAgICAgIGlmIChkcmFnQ29sdW1uKSB7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICA8T2JzZXJ2ZXJUZXh0RmllbGRcbiAgICAgICAgICAgICAgICB7Li4uZWRpdFByb3BzfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8g5b2T5Li6bnVsbCDlkowgdW5kZWZpbmVkIOS5n+WPr+S7pee8lui+kVxuICAgICAgICAgIGlmICghaGVhZGVyQ2hpbGQpIHtcbiAgICAgICAgICAgIHNwYW5TdHlsZS5oZWlnaHQgPSAnMTAwJSc7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiAodGhpcy5lZGl0aW5nID8gPE9ic2VydmVyVGV4dEZpZWxkXG4gICAgICAgICAgICBhdXRvRm9jdXNcbiAgICAgICAgICAgIG9uQmx1cj17dGhpcy5vbkhlYWRlckJsdXJ9XG4gICAgICAgICAgICB7Li4uZWRpdFByb3BzfVxuICAgICAgICAgIC8+IDogPHNwYW4gb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRFZGl0aW5nKHRydWUpO1xuICAgICAgICAgIH19IHN0eWxlPXtzcGFuU3R5bGV9IGtleT1cInRleHRcIj57aGVhZGVyQ2hpbGR9PC9zcGFuPik7XG4gICAgICAgIH1cbiAgICAgICAgLy8g5b2T5paH5a2X5Zyo5bem6L655peg5rOV5p+l55yL5YiwaWNvbuWkhOeQhlxuICAgICAgICBpZiAoY2VsbFN0eWxlLnRleHRBbGlnbiAhPT0gQ29sdW1uQWxpZ24ucmlnaHQgJiYgaWNvblF1YW50aXR5KSB7XG4gICAgICAgICAgcmV0dXJuIDxzcGFuIGtleT1cInRleHRcIiBzdHlsZT17c3BhblN0eWxlfT57aGVhZGVyQ2hpbGR9PC9zcGFuPjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoPHNwYW4ga2V5PVwidGV4dFwiPntoZWFkZXJOb2RlfTwvc3Bhbj4pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGhlYWRlckNoaWxkO1xuICAgIH07XG5cbiAgICBjb25zdCBpbm5lclByb3BzOiBhbnkgPSB7XG4gICAgICBjbGFzc05hbWU6IGNsYXNzTmFtZXMoYCR7cHJlZml4Q2xzfS1jZWxsLWlubmVyYCwge1xuICAgICAgICBbYCR7cHJlZml4Q2xzfS1jZWxsLWVkaXRvcmBdOiBoZWFkZXJzRWRpdGFibGUgJiYgIWtleSAmJiAhZHJhZ0NvbHVtbixcbiAgICAgICAgW2Ake3ByZWZpeENsc30taGVhZGVyLWVkaXRgXTogaGVhZGVyc0VkaXRhYmxlICYmICFrZXksXG4gICAgICAgIFtgJHtwcmVmaXhDbHN9LWNlbGwtZWRpdGluZ2BdOiB0aGlzLmVkaXRpbmcsXG4gICAgICB9KSxcbiAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgIGhlYWRlckNoaWxkcmVuKGhlYWRlck5vZGUpLFxuICAgICAgXSxcbiAgICB9O1xuXG4gICAgaWYgKHJvd0hlaWdodCAhPT0gJ2F1dG8nKSB7XG4gICAgICBjb25zdCByb3dIZWlnaHRESVYgPSBoZWFkZXJzRWRpdGFibGUgPyBweFRvUmVtKHJvd0hlaWdodCArIDQpIDogcHhUb1JlbShyb3dIZWlnaHQpO1xuICAgICAgaW5uZXJQcm9wcy5zdHlsZSA9IHtcbiAgICAgICAgaGVpZ2h0OiByb3dIZWlnaHRESVYsXG4gICAgICB9O1xuICAgIH1cbiAgICBjb25zdCBkcmFnSWNvbiA9ICgpID0+IHtcbiAgICAgIGlmIChyZW5kZXJJY29uICYmIGlzRnVuY3Rpb24ocmVuZGVySWNvbikpIHtcbiAgICAgICAgcmV0dXJuIHJlbmRlckljb24oe1xuICAgICAgICAgIGNvbHVtbixcbiAgICAgICAgICBkYXRhU2V0LFxuICAgICAgICAgIHNuYXBzaG90LFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGlmIChjb2x1bW4gJiYgY29sdW1uLmtleSA9PT0gRFJBR19LRVkpIHtcbiAgICAgICAgLy8g5L+u5aSN5pWw5o2u5Li656m66YCg5oiQ55qEdGjml6Dms5XmkpHlvIBcbiAgICAgICAgY2VsbFN0eWxlLndpZHRoID0gcHhUb1JlbShjb2x1bW4ud2lkdGgpO1xuICAgICAgICByZXR1cm4gPEljb24gdHlwZT1cImJhc2VsaW5lLWRyYWdfaW5kaWNhdG9yXCIgLz47XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9O1xuICAgIGlmIChcbiAgICAgIGNvbHVtbi5rZXkgIT09IFNFTEVDVElPTl9LRVlcbiAgICAgICYmIGRyYWdSb3dcbiAgICAgICYmIChkcmFnQ29sdW1uQWxpZ24gPT09IERyYWdDb2x1bW5BbGlnbi5sZWZ0IHx8IGRyYWdDb2x1bW5BbGlnbiA9PT0gRHJhZ0NvbHVtbkFsaWduLnJpZ2h0KVxuICAgICAgJiYgY29sdW1uTWF4RGVlcCA8PSAxXG4gICAgKSB7XG4gICAgICBpbm5lclByb3BzLmNoaWxkcmVuLnB1c2goZHJhZ0ljb24oKSk7XG4gICAgfVxuXG4gICAgaWYgKGhlbHBJY29uKSB7XG4gICAgICBpZiAoY2VsbFN0eWxlLnRleHRBbGlnbiA9PT0gQ29sdW1uQWxpZ24ucmlnaHQpIHtcbiAgICAgICAgaW5uZXJQcm9wcy5jaGlsZHJlbi51bnNoaWZ0KGhlbHBJY29uKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlubmVyUHJvcHMuY2hpbGRyZW4ucHVzaChoZWxwSWNvbik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHNvcnRhYmxlSWNvbikge1xuICAgICAgaWYgKGZpZWxkKSB7XG4gICAgICAgIGNvbnN0IHsgb3JkZXIgfSA9IGZpZWxkO1xuICAgICAgICBpZiAob3JkZXIpIHtcbiAgICAgICAgICBjbGFzc0xpc3QucHVzaChgJHtzb3J0UHJlZml4Q2xzfS0ke29yZGVyfWApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoIWhlYWRlcnNFZGl0YWJsZSkge1xuICAgICAgICBpbm5lclByb3BzLm9uQ2xpY2sgPSB0aGlzLmhhbmRsZUNsaWNrO1xuICAgICAgfVxuICAgICAgaWYgKGNlbGxTdHlsZS50ZXh0QWxpZ24gPT09IENvbHVtbkFsaWduLnJpZ2h0KSB7XG4gICAgICAgIGlubmVyUHJvcHMuY2hpbGRyZW4udW5zaGlmdChzb3J0YWJsZUljb24pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW5uZXJQcm9wcy5jaGlsZHJlbi5wdXNoKHNvcnRhYmxlSWNvbik7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChkcmFnQ29sdW1uICYmIHByb3ZpZGVkLmRyYWdnYWJsZVByb3BzLnN0eWxlKSB7XG4gICAgICBjZWxsU3R5bGUgPSB7IC4uLm9taXQoY2VsbFN0eWxlLCBbJ3dpZHRoJywgJ2hlaWdodCddKSwgLi4ucHJvdmlkZWQuZHJhZ2dhYmxlUHJvcHMuc3R5bGUsIGN1cnNvcjogJ21vdmUnIH07XG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICA8dGhcbiAgICAgICAgY2xhc3NOYW1lPXtjbGFzc0xpc3Quam9pbignICcpfVxuICAgICAgICByb3dTcGFuPXtyb3dTcGFufVxuICAgICAgICByZWY9eyhyZWYpID0+IHtcbiAgICAgICAgICBpZiAocmVmKSB7XG4gICAgICAgICAgICBwcm92aWRlZC5pbm5lclJlZihyZWYpO1xuICAgICAgICAgIH1cbiAgICAgICAgfX1cbiAgICAgICAgey4uLnByb3ZpZGVkLmRyYWdnYWJsZVByb3BzfVxuICAgICAgICB7Li4ucHJvdmlkZWQuZHJhZ0hhbmRsZVByb3BzfVxuICAgICAgICBjb2xTcGFuPXtjb2xTcGFufVxuICAgICAgICBkYXRhLWluZGV4PXtnZXRDb2x1bW5LZXkoY29sdW1uKX1cbiAgICAgICAgc3R5bGU9e2NlbGxTdHlsZX1cbiAgICAgID5cbiAgICAgICAgPGRpdiB7Li4uaW5uZXJQcm9wc30gLz5cbiAgICAgICAge2NvbHVtblJlc2l6YWJsZSAmJiAhZHJhZ0NvbHVtbiAmJiB0aGlzLnJlbmRlclJlc2l6ZXIoKX1cbiAgICAgIDwvdGg+XG4gICAgKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIHRoaXMucmVzaXplRXZlbnQuY2xlYXIoKTtcbiAgICB0aGlzLnNldHJlc2l6ZVN0YXJ0LmNhbmNlbCgpO1xuICB9XG59XG4iXSwidmVyc2lvbiI6M30=