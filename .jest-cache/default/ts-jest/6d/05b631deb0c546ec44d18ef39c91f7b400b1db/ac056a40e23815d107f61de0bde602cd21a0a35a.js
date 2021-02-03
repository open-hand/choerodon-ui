import { __decorate } from "tslib";
import React from 'react';
import PropTypes from 'prop-types';
import { action, computed, runInAction } from "mobx";
import { observer } from 'mobx-react';
import omit from 'lodash/omit';
import debounce from 'lodash/debounce';
import isObject from 'lodash/isObject';
import defaultTo from 'lodash/defaultTo';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import isString from 'lodash/isString';
import DataSetComponent from '../data-set/DataSetComponent';
import ObserverSelect from '../select/Select';
import ObserverNumberField from '../number-field/NumberField';
import Button from '../button';
import autobind from '../_util/autobind';
import { $l } from '../locale-context';
import Pager from './Pager';
import Icon from '../icon';
import confirm from '../modal/confirm';
function defaultItemRender(page, type) {
    switch (type) {
        case 'first':
            return React.createElement(Icon, { type: "first_page" });
        case 'last':
            return React.createElement(Icon, { type: "last_page" });
        case 'prev':
            return React.createElement(Icon, { type: "navigate_before" });
        case 'next':
            return React.createElement(Icon, { type: "navigate_next" });
        case 'jump-prev':
        case 'jump-next':
            return '•••';
        default:
            return page;
    }
}
let Pagination = class Pagination extends DataSetComponent {
    constructor() {
        super(...arguments);
        this.handlePageSizeChange = async (value, oldValue) => {
            const { dataSet } = this.props;
            if (dataSet) {
                dataSet.pageSize = value;
            }
            if (!this.lastPageSize)
                this.lastPageSize = oldValue;
            if (!dataSet?.props.modifiedCheck ||
                !dataSet.dirty ||
                (await confirm($l("DataSet", "unsaved_data_confirm"))) !== "cancel") {
                this.handleChange(this.page, Number(value));
            }
            else {
                runInAction(() => {
                    if (dataSet) {
                        dataSet.pageSize = this.lastPageSize;
                    }
                });
            }
        };
        this.handlePagerClick = page => {
            const { dataSet } = this.props;
            if (dataSet) {
                dataSet.page(page);
            }
            this.handleChange(page, this.pageSize);
        };
        this.jumpPage = debounce(value => this.handlePagerClick(value), 200);
    }
    get pageSize() {
        const { dataSet, pageSize } = this.observableProps;
        if (dataSet) {
            return dataSet.pageSize;
        }
        return pageSize;
    }
    get page() {
        const { dataSet, page } = this.observableProps;
        if (dataSet) {
            return dataSet.currentPage;
        }
        return page;
    }
    get total() {
        const { dataSet, total } = this.observableProps;
        if (dataSet) {
            return dataSet.totalCount;
        }
        return total;
    }
    get totalPage() {
        const { dataSet } = this.observableProps;
        const { total, pageSize } = this;
        if (dataSet) {
            return dataSet.totalPage;
        }
        if (total !== undefined && pageSize !== undefined) {
            return Math.ceil(total / pageSize);
        }
        return 1;
    }
    getObservableProps(props, context) {
        return {
            ...super.getObservableProps(props, context),
            page: defaultTo(props.page, 1),
            pageSize: defaultTo(props.pageSize, 10),
            total: props.total,
        };
    }
    handleChange(page, pageSize) {
        const { dataSet, onChange } = this.props;
        if (this.pageSize !== pageSize) {
            this.lastPageSize = pageSize;
            this.observableProps.pageSize = pageSize;
            this.observableProps.page = 1;
            if (dataSet) {
                dataSet.pageSize = pageSize;
                dataSet.currentPage = 1;
                dataSet.query();
            }
        }
        else {
            this.observableProps.page = page;
        }
        if (onChange) {
            onChange(page, pageSize);
        }
    }
    getValidValue(value) {
        const { page, totalPage } = this;
        value = Number(value);
        if (isNaN(value)) {
            value = page;
        }
        if (value > totalPage) {
            value = totalPage;
        }
        return value;
    }
    /**
     * 快速跳至 input 事件
     * @param e
     */
    handleJump(e) {
        let { value } = e.target;
        const { page, totalPage, props: { showQuickJumper } } = this;
        value = Number(value);
        if (isNaN(value)) {
            value = page;
        }
        if (value > totalPage) {
            value = totalPage;
        }
        this.goInputText = value;
        if (showQuickJumper) {
            return;
        }
        this.jumpPage(value);
    }
    handleJumpChange(value) {
        const { page, totalPage, props: { showQuickJumper } } = this;
        value = Number(value);
        if (isNaN(value)) {
            value = page;
        }
        if (value > totalPage) {
            value = totalPage;
        }
        if (showQuickJumper) {
            this.jumpPage(value);
        }
    }
    handleJumpGo(e) {
        if (e.keyCode === KeyCode.ENTER || e.type === 'click') {
            this.jumpPage(this.goInputText);
        }
    }
    getOtherProps() {
        return omit(super.getOtherProps(), [
            'total',
            'page',
            'pageSize',
            'onChange',
            'pageSizeOptions',
            'itemRender',
            'showSizeChanger',
            'showQuickJumper',
            'showSizeChangerLabel',
            'showTotal',
            'showPager',
            'sizeChangerPosition',
            'sizeChangerOptionRenderer',
            'hideOnSinglePage',
            'simple',
        ]);
    }
    getOptions() {
        const { pageSize } = this;
        const { pageSizeOptions } = this.props;
        const options = pageSizeOptions || [];
        if (options.indexOf(String(pageSize)) === -1) {
            options.unshift(String(pageSize));
        }
        const { Option } = ObserverSelect;
        return options.map(option => (React.createElement(Option, { key: option, value: option }, option)));
    }
    getPager(page, type, active = false, disabledSender) {
        const { prefixCls, props: { itemRender = defaultItemRender, disabled = false }, } = this;
        const disabledValue = disabledSender || disabled;
        const classNamePager = isString(type) ? `${prefixCls}-pager-${type}` : ``;
        return (React.createElement(Pager, { key: type === 'page' ? page : type, page: page, active: active, type: type, onClick: this.handlePagerClick, renderer: itemRender, disabled: disabledValue, className: `${prefixCls}-pager ${classNamePager}` }));
    }
    renderPagers(page) {
        const { totalPage } = this;
        const bufferSize = 1;
        const pagerList = [];
        if (totalPage <= 3 + bufferSize * 2) {
            for (let i = 1; i <= totalPage; i += 1) {
                pagerList.push(this.getPager(i, 'page', page === i));
            }
        }
        else {
            let left = Math.max(1, page - bufferSize);
            let right = Math.min(totalPage, page + bufferSize);
            if (page - 1 <= bufferSize) {
                right = 1 + bufferSize * 2;
            }
            if (totalPage - page <= bufferSize) {
                left = totalPage - bufferSize * 2;
            }
            for (let i = left; i <= right; i++) {
                pagerList.push(this.getPager(i, 'page', page === i));
            }
            if (page - 1 >= bufferSize * 2 && page !== 1 + 2) {
                pagerList.unshift(this.getPager(Math.max(page - 5, 1), 'jump-prev'));
            }
            if (totalPage - page >= bufferSize * 2 && page !== totalPage - 2) {
                pagerList.push(this.getPager(Math.min(page + 5, totalPage), 'jump-next'));
            }
            if (left !== 1) {
                pagerList.unshift(this.getPager(1, 'page', page === 1));
            }
            if (totalPage > 1 && right !== totalPage) {
                pagerList.push(this.getPager(totalPage, 'page', page === totalPage));
            }
        }
        return pagerList;
    }
    renderSizeChange(pageSize) {
        const { showSizeChangerLabel, showSizeChanger, sizeChangerOptionRenderer, disabled, } = this.props;
        if (showSizeChanger) {
            const select = (React.createElement(ObserverSelect, { key: "size-select", disabled: disabled, onChange: this.handlePageSizeChange, value: String(pageSize), clearButton: false, renderer: sizeChangerOptionRenderer, optionRenderer: sizeChangerOptionRenderer }, this.getOptions()));
            return showSizeChangerLabel
                ? [React.createElement("span", { key: "size-info" }, $l('Pagination', 'records_per_page')), select]
                : select;
        }
    }
    renderTotal(pageSize, page, total) {
        const { prefixCls, props: { showTotal } } = this;
        if (typeof showTotal === 'function') {
            return (React.createElement("span", { key: "total", className: `${prefixCls}-page-info` }, showTotal(total, [
                pageSize * (page - 1) + 1,
                Math.min(pageSize * page, total),
            ])));
        }
        return (React.createElement("span", { key: "total", className: `${prefixCls}-page-info` },
            pageSize * (page - 1) + 1,
            " - ",
            Math.min(pageSize * page, total),
            " / ",
            total));
    }
    /**
     * 渲染快速跳至
     */
    renderQuickGo() {
        const { prefixCls } = this;
        const { disabled, showQuickJumper } = this.props;
        let gotoButton = null;
        if (isObject(showQuickJumper) && 'goButton' in showQuickJumper) {
            const { goButton } = showQuickJumper;
            gotoButton =
                typeof goButton === 'boolean' ? (React.createElement(Button, { className: `${prefixCls}-go-button`, onClick: this.handleJumpGo, onKeyUp: this.handleJumpGo, disabled: disabled }, $l('Pagination', 'jump_to_confirm'))) : (React.createElement("span", { className: `${prefixCls}-go-button`, onClick: this.handleJumpGo, onKeyUp: this.handleJumpGo }, goButton));
        }
        return (React.createElement("div", { className: `${prefixCls}-quick-jumper` },
            $l('Pagination', 'jump_to'),
            React.createElement(ObserverNumberField, { disabled: disabled, min: 1, onChange: this.handleJumpChange, onInput: this.handleJump }),
            $l('Pagination', 'page'),
            gotoButton));
    }
    renderSimple() {
        const { prefixCls, props: { disabled } } = this;
        const { total, page, totalPage, } = this;
        return (React.createElement("nav", Object.assign({}, this.getMergedProps()),
            this.getPager(page - 1, 'prev', false, page === 1),
            React.createElement("li", { className: `${prefixCls}-simple-pager` },
                React.createElement(ObserverNumberField, { disabled: disabled, min: 1, onInput: this.handleJump }),
                React.createElement("span", { className: `${prefixCls}-slash` }, "\uFF0F"),
                total),
            this.getPager(page + 1, 'next', false, page === totalPage)));
    }
    render() {
        const { total, pageSize, page, props: { hideOnSinglePage, simple }, prefixCls, } = this;
        if (total === undefined || pageSize === undefined || page === undefined) {
            return null;
        }
        if (hideOnSinglePage === true && total <= pageSize) {
            return null;
        }
        const { totalPage, props: { children, sizeChangerPosition, showTotal, showPager, showQuickJumper }, } = this;
        const sizeChanger = this.renderSizeChange(pageSize);
        if (simple) {
            return (React.createElement("nav", Object.assign({}, this.getMergedProps()),
                this.getPager(page - 1, 'prev', false, page === 1),
                React.createElement("li", { className: `${prefixCls}-simple-pager` },
                    React.createElement(ObserverNumberField, { value: page, min: 1, onChange: this.handleJumpChange, onInput: this.handleJump }),
                    React.createElement("span", null, "\uFF0F"),
                    totalPage),
                this.getPager(page + 1, 'next', false, page === totalPage)));
        }
        return (React.createElement("nav", Object.assign({}, this.getMergedProps()),
            children,
            sizeChangerPosition === "left" /* left */ && sizeChanger,
            showTotal && this.renderTotal(pageSize, page, total),
            this.getPager(1, 'first', false, page === 1),
            this.getPager(page - 1, 'prev', false, page === 1),
            showPager && this.renderPagers(page),
            this.getPager(page + 1, 'next', false, page === totalPage),
            this.getPager(totalPage, 'last', false, page === totalPage),
            sizeChangerPosition === "right" /* right */ && sizeChanger,
            showQuickJumper && this.renderQuickGo()));
    }
};
Pagination.displayName = 'Pagination';
Pagination.propTypes = {
    total: PropTypes.number,
    page: PropTypes.number,
    pageSize: PropTypes.number,
    onChange: PropTypes.func,
    itemRender: PropTypes.func,
    sizeChangerPosition: PropTypes.oneOf(["left" /* left */, "right" /* right */]),
    sizeChangerOptionRenderer: PropTypes.func,
    showSizeChanger: PropTypes.bool,
    showQuickJumper: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    showSizeChangerLabel: PropTypes.bool,
    showTotal: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
    showPager: PropTypes.bool,
    simple: PropTypes.bool,
    ...DataSetComponent.propTypes,
};
Pagination.defaultProps = {
    suffixCls: 'pagination',
    pageSizeOptions: ['10', '20', '50', '100'],
    sizeChangerPosition: "left" /* left */,
    sizeChangerOptionRenderer: ({ text }) => text,
    hideOnSinglePage: false,
    showSizeChanger: true,
    showQuickJumper: false,
    showSizeChangerLabel: true,
    showTotal: true,
    simple: false,
};
__decorate([
    computed
], Pagination.prototype, "pageSize", null);
__decorate([
    computed
], Pagination.prototype, "page", null);
__decorate([
    computed
], Pagination.prototype, "total", null);
__decorate([
    computed
], Pagination.prototype, "totalPage", null);
__decorate([
    action
], Pagination.prototype, "handleChange", null);
__decorate([
    autobind,
    action
], Pagination.prototype, "handleJump", null);
__decorate([
    autobind
], Pagination.prototype, "handleJumpChange", null);
__decorate([
    autobind
], Pagination.prototype, "handleJumpGo", null);
__decorate([
    action
], Pagination.prototype, "getOptions", null);
Pagination = __decorate([
    observer
], Pagination);
export default Pagination;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL3BhZ2luYXRpb24vUGFnaW5hdGlvbi50c3giLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sS0FBb0IsTUFBTSxPQUFPLENBQUM7QUFDekMsT0FBTyxTQUFTLE1BQU0sWUFBWSxDQUFDO0FBQ25DLE9BQU8sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUNyRCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ3RDLE9BQU8sSUFBSSxNQUFNLGFBQWEsQ0FBQztBQUMvQixPQUFPLFFBQVEsTUFBTSxpQkFBaUIsQ0FBQztBQUN2QyxPQUFPLFFBQVEsTUFBTSxpQkFBaUIsQ0FBQztBQUN2QyxPQUFPLFNBQVMsTUFBTSxrQkFBa0IsQ0FBQztBQUN6QyxPQUFPLE9BQU8sTUFBTSxnQ0FBZ0MsQ0FBQztBQUNyRCxPQUFPLFFBQVEsTUFBTSxpQkFBaUIsQ0FBQztBQUN2QyxPQUFPLGdCQUEyQyxNQUFNLDhCQUE4QixDQUFDO0FBQ3ZGLE9BQU8sY0FBYyxNQUFNLGtCQUFrQixDQUFDO0FBQzlDLE9BQU8sbUJBQW1CLE1BQU0sNkJBQTZCLENBQUM7QUFDOUQsT0FBTyxNQUFNLE1BQU0sV0FBVyxDQUFDO0FBQy9CLE9BQU8sUUFBUSxNQUFNLG1CQUFtQixDQUFDO0FBQ3pDLE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUN2QyxPQUFPLEtBQUssTUFBTSxTQUFTLENBQUM7QUFDNUIsT0FBTyxJQUFJLE1BQU0sU0FBUyxDQUFDO0FBRzNCLE9BQU8sT0FBTyxNQUFNLGtCQUFrQixDQUFDO0FBc0J2QyxTQUFTLGlCQUFpQixDQUFDLElBQVksRUFBRSxJQUFlO0lBQ3RELFFBQVEsSUFBSSxFQUFFO1FBQ1osS0FBSyxPQUFPO1lBQ1YsT0FBTyxvQkFBQyxJQUFJLElBQUMsSUFBSSxFQUFDLFlBQVksR0FBRyxDQUFDO1FB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QVMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2hFLFNBQVMsRUFBRSxTQUFTLENBQUMsSUFBSTtJQUN6QixNQUFNLEVBQUUsU0FBUyxDQUFDLElBQUk7SUFDdEIsR0FBRyxnQkFBZ0IsQ0FBQyxTQUFTO0NBQzlCLENBQUM7QUFFSyx1QkFBWSxHQUFHO0lBQ3BCLFNBQVMsRUFBRSxZQUFZO0lBQ3ZCLGVBQWUsRUFBRSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQztJQUMxQyxtQkFBbUIsbUJBQTBCO0lBQzdDLHlCQUF5QixFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUMsSUFBSTtJQUM3QyxnQkFBZ0IsRUFBRSxLQUFLO0lBQ3ZCLGVBQWUsRUFBRSxJQUFJO0lBQ3JCLGVBQWUsRUFBRSxLQUFLO0lBQ3RCLG9CQUFvQixFQUFFLElBQUk7SUFDMUIsU0FBUyxFQUFFLElBQUk7SUFDZixNQUFNLEVBQUUsS0FBSztDQUNkLENBQUM7QUFPRjtJQURDLFFBQVE7MENBT1I7QUFHRDtJQURDLFFBQVE7c0NBT1I7QUFHRDtJQURDLFFBQVE7dUNBT1I7QUFHRDtJQURDLFFBQVE7MkNBV1I7QUFnQ0Q7SUFEQyxNQUFNOzhDQWtCTjtBQThCRDtJQUZDLFFBQVE7SUFDUixNQUFNOzRDQWdCTjtBQUdEO0lBREMsUUFBUTtrREFhUjtBQUdEO0lBREMsUUFBUTs4Q0FLUjtBQXVCRDtJQURDLE1BQU07NENBY047QUFuT2tCLFVBQVU7SUFEOUIsUUFBUTtHQUNZLFVBQVUsQ0FrYzlCO2VBbGNvQixVQUFVIiwibmFtZXMiOltdLCJzb3VyY2VzIjpbIi9Vc2Vycy9odWlodWF3ay9Eb2N1bWVudHMvb3B0L2Nob2Vyb2Rvbi11aS9jb21wb25lbnRzLXByby9wYWdpbmF0aW9uL1BhZ2luYXRpb24udHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCwgeyBSZWFjdE5vZGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHsgYWN0aW9uLCBjb21wdXRlZCwgcnVuSW5BY3Rpb24gfSBmcm9tIFwibW9ieFwiO1xuaW1wb3J0IHsgb2JzZXJ2ZXIgfSBmcm9tICdtb2J4LXJlYWN0JztcbmltcG9ydCBvbWl0IGZyb20gJ2xvZGFzaC9vbWl0JztcbmltcG9ydCBkZWJvdW5jZSBmcm9tICdsb2Rhc2gvZGVib3VuY2UnO1xuaW1wb3J0IGlzT2JqZWN0IGZyb20gJ2xvZGFzaC9pc09iamVjdCc7XG5pbXBvcnQgZGVmYXVsdFRvIGZyb20gJ2xvZGFzaC9kZWZhdWx0VG8nO1xuaW1wb3J0IEtleUNvZGUgZnJvbSAnY2hvZXJvZG9uLXVpL2xpYi9fdXRpbC9LZXlDb2RlJztcbmltcG9ydCBpc1N0cmluZyBmcm9tICdsb2Rhc2gvaXNTdHJpbmcnO1xuaW1wb3J0IERhdGFTZXRDb21wb25lbnQsIHsgRGF0YVNldENvbXBvbmVudFByb3BzIH0gZnJvbSAnLi4vZGF0YS1zZXQvRGF0YVNldENvbXBvbmVudCc7XG5pbXBvcnQgT2JzZXJ2ZXJTZWxlY3QgZnJvbSAnLi4vc2VsZWN0L1NlbGVjdCc7XG5pbXBvcnQgT2JzZXJ2ZXJOdW1iZXJGaWVsZCBmcm9tICcuLi9udW1iZXItZmllbGQvTnVtYmVyRmllbGQnO1xuaW1wb3J0IEJ1dHRvbiBmcm9tICcuLi9idXR0b24nO1xuaW1wb3J0IGF1dG9iaW5kIGZyb20gJy4uL191dGlsL2F1dG9iaW5kJztcbmltcG9ydCB7ICRsIH0gZnJvbSAnLi4vbG9jYWxlLWNvbnRleHQnO1xuaW1wb3J0IFBhZ2VyIGZyb20gJy4vUGFnZXInO1xuaW1wb3J0IEljb24gZnJvbSAnLi4vaWNvbic7XG5pbXBvcnQgeyBTaXplQ2hhbmdlclBvc2l0aW9uIH0gZnJvbSAnLi9lbnVtJztcbmltcG9ydCB7IFJlbmRlcmVyIH0gZnJvbSAnLi4vZmllbGQvRm9ybUZpZWxkJztcbmltcG9ydCBjb25maXJtIGZyb20gJy4uL21vZGFsL2NvbmZpcm0nO1xuXG5leHBvcnQgdHlwZSBQYWdlclR5cGUgPSAncGFnZScgfCAncHJldicgfCAnbmV4dCcgfCAnZmlyc3QnIHwgJ2xhc3QnIHwgJ2p1bXAtcHJldicgfCAnanVtcC1uZXh0JztcblxuZXhwb3J0IGludGVyZmFjZSBQYWdpbmF0aW9uUHJvcHMgZXh0ZW5kcyBEYXRhU2V0Q29tcG9uZW50UHJvcHMge1xuICB0b3RhbD86IG51bWJlcjtcbiAgcGFnZT86IG51bWJlcjtcbiAgcGFnZVNpemU/OiBudW1iZXI7XG4gIG9uQ2hhbmdlPzogKHBhZ2U6IG51bWJlciwgcGFnZVNpemU6IG51bWJlcikgPT4gdm9pZDtcbiAgaXRlbVJlbmRlcj86IChwYWdlOiBudW1iZXIsIHR5cGU6IFBhZ2VyVHlwZSkgPT4gUmVhY3ROb2RlO1xuICBwYWdlU2l6ZU9wdGlvbnM/OiBzdHJpbmdbXTtcbiAgc2l6ZUNoYW5nZXJQb3NpdGlvbj86IFNpemVDaGFuZ2VyUG9zaXRpb247XG4gIHNpemVDaGFuZ2VyT3B0aW9uUmVuZGVyZXI/OiBSZW5kZXJlcjtcbiAgc2hvd1NpemVDaGFuZ2VyPzogYm9vbGVhbjtcbiAgc2hvd1F1aWNrSnVtcGVyPzogYm9vbGVhbiB8IHsgZ29CdXR0b24/OiBSZWFjdC5SZWFjdE5vZGUgfTtcbiAgc2hvd1NpemVDaGFuZ2VyTGFiZWw/OiBib29sZWFuO1xuICBzaG93VG90YWw/OiBib29sZWFuIHwgKCh0b3RhbDogbnVtYmVyLCByYW5nZTogW251bWJlciwgbnVtYmVyXSkgPT4gUmVhY3QuUmVhY3ROb2RlKTtcbiAgc2hvd1BhZ2VyPzogYm9vbGVhbjtcbiAgaGlkZU9uU2luZ2xlUGFnZT86IGJvb2xlYW47XG4gIHNpbXBsZT86IGJvb2xlYW47XG59XG5cbmZ1bmN0aW9uIGRlZmF1bHRJdGVtUmVuZGVyKHBhZ2U6IG51bWJlciwgdHlwZTogUGFnZXJUeXBlKSB7XG4gIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgJ2ZpcnN0JzpcbiAgICAgIHJldHVybiA8SWNvbiB0eXBlPVwiZmlyc3RfcGFnZVwiIC8+O1xuICAgIGNhc2UgJ2xhc3QnOlxuICAgICAgcmV0dXJuIDxJY29uIHR5cGU9XCJsYXN0X3BhZ2VcIiAvPjtcbiAgICBjYXNlICdwcmV2JzpcbiAgICAgIHJldHVybiA8SWNvbiB0eXBlPVwibmF2aWdhdGVfYmVmb3JlXCIgLz47XG4gICAgY2FzZSAnbmV4dCc6XG4gICAgICByZXR1cm4gPEljb24gdHlwZT1cIm5hdmlnYXRlX25leHRcIiAvPjtcbiAgICBjYXNlICdqdW1wLXByZXYnOlxuICAgIGNhc2UgJ2p1bXAtbmV4dCc6XG4gICAgICByZXR1cm4gJ+KAouKAouKAoic7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBwYWdlO1xuICB9XG59XG5cbkBvYnNlcnZlclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGFnaW5hdGlvbiBleHRlbmRzIERhdGFTZXRDb21wb25lbnQ8UGFnaW5hdGlvblByb3BzPiB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZSA9ICdQYWdpbmF0aW9uJztcblxuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIHRvdGFsOiBQcm9wVHlwZXMubnVtYmVyLFxuICAgIHBhZ2U6IFByb3BUeXBlcy5udW1iZXIsXG4gICAgcGFnZVNpemU6IFByb3BUeXBlcy5udW1iZXIsXG4gICAgb25DaGFuZ2U6IFByb3BUeXBlcy5mdW5jLFxuICAgIGl0ZW1SZW5kZXI6IFByb3BUeXBlcy5mdW5jLFxuICAgIHNpemVDaGFuZ2VyUG9zaXRpb246IFByb3BUeXBlcy5vbmVPZihbU2l6ZUNoYW5nZXJQb3NpdGlvbi5sZWZ0LCBTaXplQ2hhbmdlclBvc2l0aW9uLnJpZ2h0XSksXG4gICAgc2l6ZUNoYW5nZXJPcHRpb25SZW5kZXJlcjogUHJvcFR5cGVzLmZ1bmMsXG4gICAgc2hvd1NpemVDaGFuZ2VyOiBQcm9wVHlwZXMuYm9vbCxcbiAgICBzaG93UXVpY2tKdW1wZXI6IFByb3BUeXBlcy5vbmVPZlR5cGUoW1Byb3BUeXBlcy5ib29sLCBQcm9wVHlwZXMub2JqZWN0XSksXG4gICAgc2hvd1NpemVDaGFuZ2VyTGFiZWw6IFByb3BUeXBlcy5ib29sLFxuICAgIHNob3dUb3RhbDogUHJvcFR5cGVzLm9uZU9mVHlwZShbUHJvcFR5cGVzLmJvb2wsIFByb3BUeXBlcy5mdW5jXSksXG4gICAgc2hvd1BhZ2VyOiBQcm9wVHlwZXMuYm9vbCxcbiAgICBzaW1wbGU6IFByb3BUeXBlcy5ib29sLFxuICAgIC4uLkRhdGFTZXRDb21wb25lbnQucHJvcFR5cGVzLFxuICB9O1xuXG4gIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgc3VmZml4Q2xzOiAncGFnaW5hdGlvbicsXG4gICAgcGFnZVNpemVPcHRpb25zOiBbJzEwJywgJzIwJywgJzUwJywgJzEwMCddLFxuICAgIHNpemVDaGFuZ2VyUG9zaXRpb246IFNpemVDaGFuZ2VyUG9zaXRpb24ubGVmdCxcbiAgICBzaXplQ2hhbmdlck9wdGlvblJlbmRlcmVyOiAoeyB0ZXh0IH0pID0+IHRleHQsXG4gICAgaGlkZU9uU2luZ2xlUGFnZTogZmFsc2UsXG4gICAgc2hvd1NpemVDaGFuZ2VyOiB0cnVlLFxuICAgIHNob3dRdWlja0p1bXBlcjogZmFsc2UsXG4gICAgc2hvd1NpemVDaGFuZ2VyTGFiZWw6IHRydWUsXG4gICAgc2hvd1RvdGFsOiB0cnVlLFxuICAgIHNpbXBsZTogZmFsc2UsXG4gIH07XG5cbiAgZ29JbnB1dFRleHQ6IG51bWJlcjtcblxuICBsYXN0UGFnZVNpemU6IG51bWJlcjtcblxuICBAY29tcHV0ZWRcbiAgZ2V0IHBhZ2VTaXplKCk6IG51bWJlciB7XG4gICAgY29uc3QgeyBkYXRhU2V0LCBwYWdlU2l6ZSB9ID0gdGhpcy5vYnNlcnZhYmxlUHJvcHM7XG4gICAgaWYgKGRhdGFTZXQpIHtcbiAgICAgIHJldHVybiBkYXRhU2V0LnBhZ2VTaXplO1xuICAgIH1cbiAgICByZXR1cm4gcGFnZVNpemUhO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBwYWdlKCk6IG51bWJlciB7XG4gICAgY29uc3QgeyBkYXRhU2V0LCBwYWdlIH0gPSB0aGlzLm9ic2VydmFibGVQcm9wcztcbiAgICBpZiAoZGF0YVNldCkge1xuICAgICAgcmV0dXJuIGRhdGFTZXQuY3VycmVudFBhZ2U7XG4gICAgfVxuICAgIHJldHVybiBwYWdlITtcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgdG90YWwoKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCB7IGRhdGFTZXQsIHRvdGFsIH0gPSB0aGlzLm9ic2VydmFibGVQcm9wcztcbiAgICBpZiAoZGF0YVNldCkge1xuICAgICAgcmV0dXJuIGRhdGFTZXQudG90YWxDb3VudDtcbiAgICB9XG4gICAgcmV0dXJuIHRvdGFsO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCB0b3RhbFBhZ2UoKTogbnVtYmVyIHtcbiAgICBjb25zdCB7IGRhdGFTZXQgfSA9IHRoaXMub2JzZXJ2YWJsZVByb3BzO1xuICAgIGNvbnN0IHsgdG90YWwsIHBhZ2VTaXplIH0gPSB0aGlzO1xuICAgIGlmIChkYXRhU2V0KSB7XG4gICAgICByZXR1cm4gZGF0YVNldC50b3RhbFBhZ2U7XG4gICAgfVxuICAgIGlmICh0b3RhbCAhPT0gdW5kZWZpbmVkICYmIHBhZ2VTaXplICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBNYXRoLmNlaWwodG90YWwgLyBwYWdlU2l6ZSk7XG4gICAgfVxuICAgIHJldHVybiAxO1xuICB9XG5cbiAgZ2V0T2JzZXJ2YWJsZVByb3BzKHByb3BzLCBjb250ZXh0KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLnN1cGVyLmdldE9ic2VydmFibGVQcm9wcyhwcm9wcywgY29udGV4dCksXG4gICAgICBwYWdlOiBkZWZhdWx0VG8ocHJvcHMucGFnZSwgMSksXG4gICAgICBwYWdlU2l6ZTogZGVmYXVsdFRvKHByb3BzLnBhZ2VTaXplLCAxMCksXG4gICAgICB0b3RhbDogcHJvcHMudG90YWwsXG4gICAgfTtcbiAgfVxuXG4gIGhhbmRsZVBhZ2VTaXplQ2hhbmdlID0gYXN5bmMgKHZhbHVlOiBudW1iZXIsIG9sZFZhbHVlOiBudW1iZXIpID0+IHtcbiAgICBjb25zdCB7IGRhdGFTZXQgfSA9IHRoaXMucHJvcHM7XG4gICAgaWYgKGRhdGFTZXQpIHtcbiAgICAgIGRhdGFTZXQucGFnZVNpemUgPSB2YWx1ZTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLmxhc3RQYWdlU2l6ZSkgdGhpcy5sYXN0UGFnZVNpemUgPSBvbGRWYWx1ZTtcbiAgICBpZiAoXG4gICAgICAhZGF0YVNldD8ucHJvcHMubW9kaWZpZWRDaGVjayB8fFxuICAgICAgIWRhdGFTZXQuZGlydHkgfHxcbiAgICAgIChhd2FpdCBjb25maXJtKCRsKFwiRGF0YVNldFwiLCBcInVuc2F2ZWRfZGF0YV9jb25maXJtXCIpKSkgIT09IFwiY2FuY2VsXCIpIHtcbiAgICAgIHRoaXMuaGFuZGxlQ2hhbmdlKHRoaXMucGFnZSwgTnVtYmVyKHZhbHVlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgICAgaWYgKGRhdGFTZXQpIHtcbiAgICAgICAgICBkYXRhU2V0LnBhZ2VTaXplID0gdGhpcy5sYXN0UGFnZVNpemU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICBAYWN0aW9uXG4gIGhhbmRsZUNoYW5nZShwYWdlOiBudW1iZXIsIHBhZ2VTaXplOiBudW1iZXIpIHtcbiAgICBjb25zdCB7IGRhdGFTZXQsIG9uQ2hhbmdlIH0gPSB0aGlzLnByb3BzO1xuICAgIGlmICh0aGlzLnBhZ2VTaXplICE9PSBwYWdlU2l6ZSkge1xuICAgICAgdGhpcy5sYXN0UGFnZVNpemUgPSBwYWdlU2l6ZTtcbiAgICAgIHRoaXMub2JzZXJ2YWJsZVByb3BzLnBhZ2VTaXplID0gcGFnZVNpemU7XG4gICAgICB0aGlzLm9ic2VydmFibGVQcm9wcy5wYWdlID0gMTtcbiAgICAgIGlmIChkYXRhU2V0KSB7XG4gICAgICAgIGRhdGFTZXQucGFnZVNpemUgPSBwYWdlU2l6ZTtcbiAgICAgICAgZGF0YVNldC5jdXJyZW50UGFnZSA9IDE7XG4gICAgICAgIGRhdGFTZXQucXVlcnkoKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vYnNlcnZhYmxlUHJvcHMucGFnZSA9IHBhZ2U7XG4gICAgfVxuICAgIGlmIChvbkNoYW5nZSkge1xuICAgICAgb25DaGFuZ2UocGFnZSwgcGFnZVNpemUpO1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZVBhZ2VyQ2xpY2sgPSBwYWdlID0+IHtcbiAgICBjb25zdCB7IGRhdGFTZXQgfSA9IHRoaXMucHJvcHM7XG4gICAgaWYgKGRhdGFTZXQpIHtcbiAgICAgIGRhdGFTZXQucGFnZShwYWdlKTtcbiAgICB9XG4gICAgdGhpcy5oYW5kbGVDaGFuZ2UocGFnZSwgdGhpcy5wYWdlU2l6ZSk7XG4gIH07XG5cbiAgZ2V0VmFsaWRWYWx1ZSh2YWx1ZSkge1xuICAgIGNvbnN0IHsgcGFnZSwgdG90YWxQYWdlIH0gPSB0aGlzO1xuICAgIHZhbHVlID0gTnVtYmVyKHZhbHVlKTtcbiAgICBpZiAoaXNOYU4odmFsdWUpKSB7XG4gICAgICB2YWx1ZSA9IHBhZ2U7XG4gICAgfVxuICAgIGlmICh2YWx1ZSA+IHRvdGFsUGFnZSkge1xuICAgICAgdmFsdWUgPSB0b3RhbFBhZ2U7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZVxuICB9XG5cbiAganVtcFBhZ2UgPSBkZWJvdW5jZSh2YWx1ZSA9PiB0aGlzLmhhbmRsZVBhZ2VyQ2xpY2sodmFsdWUpLCAyMDApO1xuXG4gIC8qKlxuICAgKiDlv6vpgJ/ot7Poh7MgaW5wdXQg5LqL5Lu2XG4gICAqIEBwYXJhbSBlXG4gICAqL1xuICBAYXV0b2JpbmRcbiAgQGFjdGlvblxuICBoYW5kbGVKdW1wKGUpIHtcbiAgICBsZXQgeyB2YWx1ZSB9ID0gZS50YXJnZXQ7XG4gICAgY29uc3QgeyBwYWdlLCB0b3RhbFBhZ2UsIHByb3BzOiB7IHNob3dRdWlja0p1bXBlciB9IH0gPSB0aGlzO1xuICAgIHZhbHVlID0gTnVtYmVyKHZhbHVlKTtcbiAgICBpZiAoaXNOYU4odmFsdWUpKSB7XG4gICAgICB2YWx1ZSA9IHBhZ2U7XG4gICAgfVxuICAgIGlmICh2YWx1ZSA+IHRvdGFsUGFnZSkge1xuICAgICAgdmFsdWUgPSB0b3RhbFBhZ2U7XG4gICAgfVxuICAgIHRoaXMuZ29JbnB1dFRleHQgPSB2YWx1ZTtcbiAgICBpZiAoc2hvd1F1aWNrSnVtcGVyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuanVtcFBhZ2UodmFsdWUpO1xuICB9XG5cbiAgQGF1dG9iaW5kXG4gIGhhbmRsZUp1bXBDaGFuZ2UodmFsdWUpIHtcbiAgICBjb25zdCB7IHBhZ2UsIHRvdGFsUGFnZSwgcHJvcHM6IHsgc2hvd1F1aWNrSnVtcGVyIH0gfSA9IHRoaXM7XG4gICAgdmFsdWUgPSBOdW1iZXIodmFsdWUpO1xuICAgIGlmIChpc05hTih2YWx1ZSkpIHtcbiAgICAgIHZhbHVlID0gcGFnZTtcbiAgICB9XG4gICAgaWYgKHZhbHVlID4gdG90YWxQYWdlKSB7XG4gICAgICB2YWx1ZSA9IHRvdGFsUGFnZTtcbiAgICB9XG4gICAgaWYgKHNob3dRdWlja0p1bXBlcikge1xuICAgICAgdGhpcy5qdW1wUGFnZSh2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgQGF1dG9iaW5kXG4gIGhhbmRsZUp1bXBHbyhlKSB7XG4gICAgaWYgKGUua2V5Q29kZSA9PT0gS2V5Q29kZS5FTlRFUiB8fCBlLnR5cGUgPT09ICdjbGljaycpIHtcbiAgICAgIHRoaXMuanVtcFBhZ2UodGhpcy5nb0lucHV0VGV4dCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0T3RoZXJQcm9wcygpIHtcbiAgICByZXR1cm4gb21pdChzdXBlci5nZXRPdGhlclByb3BzKCksIFtcbiAgICAgICd0b3RhbCcsXG4gICAgICAncGFnZScsXG4gICAgICAncGFnZVNpemUnLFxuICAgICAgJ29uQ2hhbmdlJyxcbiAgICAgICdwYWdlU2l6ZU9wdGlvbnMnLFxuICAgICAgJ2l0ZW1SZW5kZXInLFxuICAgICAgJ3Nob3dTaXplQ2hhbmdlcicsXG4gICAgICAnc2hvd1F1aWNrSnVtcGVyJyxcbiAgICAgICdzaG93U2l6ZUNoYW5nZXJMYWJlbCcsXG4gICAgICAnc2hvd1RvdGFsJyxcbiAgICAgICdzaG93UGFnZXInLFxuICAgICAgJ3NpemVDaGFuZ2VyUG9zaXRpb24nLFxuICAgICAgJ3NpemVDaGFuZ2VyT3B0aW9uUmVuZGVyZXInLFxuICAgICAgJ2hpZGVPblNpbmdsZVBhZ2UnLFxuICAgICAgJ3NpbXBsZScsXG4gICAgXSk7XG4gIH1cblxuICBAYWN0aW9uXG4gIGdldE9wdGlvbnMoKTogUmVhY3ROb2RlIHtcbiAgICBjb25zdCB7IHBhZ2VTaXplIH0gPSB0aGlzO1xuICAgIGNvbnN0IHsgcGFnZVNpemVPcHRpb25zIH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IG9wdGlvbnMgPSBwYWdlU2l6ZU9wdGlvbnMgfHwgW107XG4gICAgaWYgKG9wdGlvbnMuaW5kZXhPZihTdHJpbmcocGFnZVNpemUpKSA9PT0gLTEpIHtcbiAgICAgIG9wdGlvbnMudW5zaGlmdChTdHJpbmcocGFnZVNpemUpKTtcbiAgICB9XG4gICAgY29uc3QgeyBPcHRpb24gfSA9IE9ic2VydmVyU2VsZWN0O1xuICAgIHJldHVybiBvcHRpb25zLm1hcChvcHRpb24gPT4gKFxuICAgICAgPE9wdGlvbiBrZXk9e29wdGlvbn0gdmFsdWU9e29wdGlvbn0+XG4gICAgICAgIHtvcHRpb259XG4gICAgICA8L09wdGlvbj5cbiAgICApKTtcbiAgfVxuXG4gIGdldFBhZ2VyKHBhZ2U6IG51bWJlciwgdHlwZTogUGFnZXJUeXBlLCBhY3RpdmU6IGJvb2xlYW4gPSBmYWxzZSwgZGlzYWJsZWRTZW5kZXI/OiBib29sZWFuKSB7XG4gICAgY29uc3Qge1xuICAgICAgcHJlZml4Q2xzLFxuICAgICAgcHJvcHM6IHsgaXRlbVJlbmRlciA9IGRlZmF1bHRJdGVtUmVuZGVyLCBkaXNhYmxlZCA9IGZhbHNlIH0sXG4gICAgfSA9IHRoaXM7XG4gICAgY29uc3QgZGlzYWJsZWRWYWx1ZSA9IGRpc2FibGVkU2VuZGVyIHx8IGRpc2FibGVkO1xuICAgIGNvbnN0IGNsYXNzTmFtZVBhZ2VyID0gaXNTdHJpbmcodHlwZSkgPyBgJHtwcmVmaXhDbHN9LXBhZ2VyLSR7dHlwZX1gIDogYGBcbiAgICByZXR1cm4gKFxuICAgICAgPFBhZ2VyXG4gICAgICAgIGtleT17dHlwZSA9PT0gJ3BhZ2UnID8gcGFnZSA6IHR5cGV9XG4gICAgICAgIHBhZ2U9e3BhZ2V9XG4gICAgICAgIGFjdGl2ZT17YWN0aXZlfVxuICAgICAgICB0eXBlPXt0eXBlfVxuICAgICAgICBvbkNsaWNrPXt0aGlzLmhhbmRsZVBhZ2VyQ2xpY2t9XG4gICAgICAgIHJlbmRlcmVyPXtpdGVtUmVuZGVyfVxuICAgICAgICBkaXNhYmxlZD17ZGlzYWJsZWRWYWx1ZX1cbiAgICAgICAgY2xhc3NOYW1lPXtgJHtwcmVmaXhDbHN9LXBhZ2VyICR7Y2xhc3NOYW1lUGFnZXJ9YH1cbiAgICAgIC8+XG4gICAgKTtcbiAgfVxuXG4gIHJlbmRlclBhZ2VycyhwYWdlOiBudW1iZXIpOiBSZWFjdE5vZGUge1xuICAgIGNvbnN0IHsgdG90YWxQYWdlIH0gPSB0aGlzO1xuICAgIGNvbnN0IGJ1ZmZlclNpemUgPSAxO1xuICAgIGNvbnN0IHBhZ2VyTGlzdDogYW55W10gPSBbXTtcbiAgICBpZiAodG90YWxQYWdlIDw9IDMgKyBidWZmZXJTaXplICogMikge1xuICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPD0gdG90YWxQYWdlOyBpICs9IDEpIHtcbiAgICAgICAgcGFnZXJMaXN0LnB1c2godGhpcy5nZXRQYWdlcihpLCAncGFnZScsIHBhZ2UgPT09IGkpKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IGxlZnQgPSBNYXRoLm1heCgxLCBwYWdlIC0gYnVmZmVyU2l6ZSk7XG4gICAgICBsZXQgcmlnaHQgPSBNYXRoLm1pbih0b3RhbFBhZ2UsIHBhZ2UgKyBidWZmZXJTaXplKTtcbiAgICAgIGlmIChwYWdlIC0gMSA8PSBidWZmZXJTaXplKSB7XG4gICAgICAgIHJpZ2h0ID0gMSArIGJ1ZmZlclNpemUgKiAyO1xuICAgICAgfVxuXG4gICAgICBpZiAodG90YWxQYWdlIC0gcGFnZSA8PSBidWZmZXJTaXplKSB7XG4gICAgICAgIGxlZnQgPSB0b3RhbFBhZ2UgLSBidWZmZXJTaXplICogMjtcbiAgICAgIH1cbiAgICAgIGZvciAobGV0IGkgPSBsZWZ0OyBpIDw9IHJpZ2h0OyBpKyspIHtcbiAgICAgICAgcGFnZXJMaXN0LnB1c2godGhpcy5nZXRQYWdlcihpLCAncGFnZScsIHBhZ2UgPT09IGkpKTtcbiAgICAgIH1cbiAgICAgIGlmIChwYWdlIC0gMSA+PSBidWZmZXJTaXplICogMiAmJiBwYWdlICE9PSAxICsgMikge1xuICAgICAgICBwYWdlckxpc3QudW5zaGlmdCh0aGlzLmdldFBhZ2VyKE1hdGgubWF4KHBhZ2UgLSA1LCAxKSwgJ2p1bXAtcHJldicpKTtcbiAgICAgIH1cbiAgICAgIGlmICh0b3RhbFBhZ2UgLSBwYWdlID49IGJ1ZmZlclNpemUgKiAyICYmIHBhZ2UgIT09IHRvdGFsUGFnZSAtIDIpIHtcbiAgICAgICAgcGFnZXJMaXN0LnB1c2godGhpcy5nZXRQYWdlcihNYXRoLm1pbihwYWdlICsgNSwgdG90YWxQYWdlKSwgJ2p1bXAtbmV4dCcpKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGxlZnQgIT09IDEpIHtcbiAgICAgICAgcGFnZXJMaXN0LnVuc2hpZnQodGhpcy5nZXRQYWdlcigxLCAncGFnZScsIHBhZ2UgPT09IDEpKTtcbiAgICAgIH1cbiAgICAgIGlmICh0b3RhbFBhZ2UgPiAxICYmIHJpZ2h0ICE9PSB0b3RhbFBhZ2UpIHtcbiAgICAgICAgcGFnZXJMaXN0LnB1c2godGhpcy5nZXRQYWdlcih0b3RhbFBhZ2UsICdwYWdlJywgcGFnZSA9PT0gdG90YWxQYWdlKSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBwYWdlckxpc3Q7XG4gIH1cblxuICByZW5kZXJTaXplQ2hhbmdlKHBhZ2VTaXplOiBudW1iZXIpOiBSZWFjdE5vZGUge1xuICAgIGNvbnN0IHtcbiAgICAgIHNob3dTaXplQ2hhbmdlckxhYmVsLFxuICAgICAgc2hvd1NpemVDaGFuZ2VyLFxuICAgICAgc2l6ZUNoYW5nZXJPcHRpb25SZW5kZXJlcixcbiAgICAgIGRpc2FibGVkLFxuICAgIH0gPSB0aGlzLnByb3BzO1xuICAgIGlmIChzaG93U2l6ZUNoYW5nZXIpIHtcbiAgICAgIGNvbnN0IHNlbGVjdCA9IChcbiAgICAgICAgPE9ic2VydmVyU2VsZWN0XG4gICAgICAgICAga2V5PVwic2l6ZS1zZWxlY3RcIlxuICAgICAgICAgIGRpc2FibGVkPXtkaXNhYmxlZH1cbiAgICAgICAgICBvbkNoYW5nZT17dGhpcy5oYW5kbGVQYWdlU2l6ZUNoYW5nZX1cbiAgICAgICAgICB2YWx1ZT17U3RyaW5nKHBhZ2VTaXplKX1cbiAgICAgICAgICBjbGVhckJ1dHRvbj17ZmFsc2V9XG4gICAgICAgICAgcmVuZGVyZXI9e3NpemVDaGFuZ2VyT3B0aW9uUmVuZGVyZXJ9XG4gICAgICAgICAgb3B0aW9uUmVuZGVyZXI9e3NpemVDaGFuZ2VyT3B0aW9uUmVuZGVyZXJ9XG4gICAgICAgID5cbiAgICAgICAgICB7dGhpcy5nZXRPcHRpb25zKCl9XG4gICAgICAgIDwvT2JzZXJ2ZXJTZWxlY3Q+XG4gICAgICApO1xuICAgICAgcmV0dXJuIHNob3dTaXplQ2hhbmdlckxhYmVsXG4gICAgICAgID8gWzxzcGFuIGtleT1cInNpemUtaW5mb1wiPnskbCgnUGFnaW5hdGlvbicsICdyZWNvcmRzX3Blcl9wYWdlJyl9PC9zcGFuPiwgc2VsZWN0XVxuICAgICAgICA6IHNlbGVjdDtcbiAgICB9XG4gIH1cblxuICByZW5kZXJUb3RhbChwYWdlU2l6ZTogbnVtYmVyLCBwYWdlOiBudW1iZXIsIHRvdGFsOiBudW1iZXIpOiBSZWFjdE5vZGUge1xuICAgIGNvbnN0IHsgcHJlZml4Q2xzLCBwcm9wczogeyBzaG93VG90YWwgfSB9ID0gdGhpcztcbiAgICBpZiAodHlwZW9mIHNob3dUb3RhbCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPHNwYW4ga2V5PVwidG90YWxcIiBjbGFzc05hbWU9e2Ake3ByZWZpeENsc30tcGFnZS1pbmZvYH0+XG4gICAgICAgICAge3Nob3dUb3RhbCh0b3RhbCwgW1xuICAgICAgICAgICAgcGFnZVNpemUgKiAocGFnZSAtIDEpICsgMSxcbiAgICAgICAgICAgIE1hdGgubWluKHBhZ2VTaXplICogcGFnZSwgdG90YWwpLFxuICAgICAgICAgIF0pfVxuICAgICAgICA8L3NwYW4+XG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgPHNwYW4ga2V5PVwidG90YWxcIiBjbGFzc05hbWU9e2Ake3ByZWZpeENsc30tcGFnZS1pbmZvYH0+XG4gICAgICAgIHtwYWdlU2l6ZSAqIChwYWdlIC0gMSkgKyAxfSAtIHtNYXRoLm1pbihwYWdlU2l6ZSAqIHBhZ2UsIHRvdGFsKX0gLyB7dG90YWx9XG4gICAgICA8L3NwYW4+XG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDmuLLmn5Plv6vpgJ/ot7Poh7NcbiAgICovXG4gIHJlbmRlclF1aWNrR28oKTogUmVhY3ROb2RlIHtcbiAgICBjb25zdCB7IHByZWZpeENscyB9ID0gdGhpcztcbiAgICBjb25zdCB7IGRpc2FibGVkLCBzaG93UXVpY2tKdW1wZXIgfSA9IHRoaXMucHJvcHM7XG4gICAgbGV0IGdvdG9CdXR0b246IGFueSA9IG51bGw7XG5cbiAgICBpZiAoaXNPYmplY3Qoc2hvd1F1aWNrSnVtcGVyKSAmJiAnZ29CdXR0b24nIGluIHNob3dRdWlja0p1bXBlciApIHtcbiAgICAgIGNvbnN0IHsgZ29CdXR0b24gfSA9IHNob3dRdWlja0p1bXBlcjtcbiAgICAgIGdvdG9CdXR0b24gPVxuICAgICAgICB0eXBlb2YgZ29CdXR0b24gPT09ICdib29sZWFuJyA/IChcbiAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICBjbGFzc05hbWU9e2Ake3ByZWZpeENsc30tZ28tYnV0dG9uYH1cbiAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuaGFuZGxlSnVtcEdvfVxuICAgICAgICAgICAgb25LZXlVcD17dGhpcy5oYW5kbGVKdW1wR299XG4gICAgICAgICAgICBkaXNhYmxlZD17ZGlzYWJsZWR9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgeyRsKCdQYWdpbmF0aW9uJywgJ2p1bXBfdG9fY29uZmlybScpfVxuICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICApIDogKFxuICAgICAgICAgIDxzcGFuXG4gICAgICAgICAgICBjbGFzc05hbWU9e2Ake3ByZWZpeENsc30tZ28tYnV0dG9uYH1cbiAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuaGFuZGxlSnVtcEdvfVxuICAgICAgICAgICAgb25LZXlVcD17dGhpcy5oYW5kbGVKdW1wR299XG4gICAgICAgICAgPlxuICAgICAgICAgICAge2dvQnV0dG9ufVxuICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9e2Ake3ByZWZpeENsc30tcXVpY2stanVtcGVyYH0+XG4gICAgICAgIHskbCgnUGFnaW5hdGlvbicsICdqdW1wX3RvJyl9XG4gICAgICAgIDxPYnNlcnZlck51bWJlckZpZWxkIGRpc2FibGVkPXtkaXNhYmxlZH0gbWluPXsxfSBvbkNoYW5nZT17dGhpcy5oYW5kbGVKdW1wQ2hhbmdlfSBvbklucHV0PXt0aGlzLmhhbmRsZUp1bXB9IC8+XG4gICAgICAgIHskbCgnUGFnaW5hdGlvbicsICdwYWdlJyl9XG4gICAgICAgIHtnb3RvQnV0dG9ufVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIHJlbmRlclNpbXBsZSgpOiBSZWFjdE5vZGUge1xuICAgIGNvbnN0IHsgcHJlZml4Q2xzLCBwcm9wczogeyBkaXNhYmxlZCB9IH0gPSB0aGlzO1xuICAgIGNvbnN0IHtcbiAgICAgIHRvdGFsLFxuICAgICAgcGFnZSxcbiAgICAgIHRvdGFsUGFnZSxcbiAgICB9ID0gdGhpcztcbiAgICByZXR1cm4gKFxuICAgICAgPG5hdiB7Li4udGhpcy5nZXRNZXJnZWRQcm9wcygpfT5cbiAgICAgICAge3RoaXMuZ2V0UGFnZXIocGFnZSAtIDEsICdwcmV2JywgZmFsc2UsIHBhZ2UgPT09IDEpfVxuICAgICAgICA8bGlcbiAgICAgICAgICBjbGFzc05hbWU9e2Ake3ByZWZpeENsc30tc2ltcGxlLXBhZ2VyYH1cbiAgICAgICAgPlxuICAgICAgICAgIDxPYnNlcnZlck51bWJlckZpZWxkIGRpc2FibGVkPXtkaXNhYmxlZH0gbWluPXsxfSBvbklucHV0PXt0aGlzLmhhbmRsZUp1bXB9IC8+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgJHtwcmVmaXhDbHN9LXNsYXNoYH0+77yPPC9zcGFuPlxuICAgICAgICAgIHt0b3RhbH1cbiAgICAgICAgPC9saT5cbiAgICAgICAge3RoaXMuZ2V0UGFnZXIocGFnZSArIDEsICduZXh0JywgZmFsc2UsIHBhZ2UgPT09IHRvdGFsUGFnZSl9XG4gICAgICA8L25hdj5cbiAgICApO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHtcbiAgICAgIHRvdGFsLFxuICAgICAgcGFnZVNpemUsXG4gICAgICBwYWdlLFxuICAgICAgcHJvcHM6IHsgaGlkZU9uU2luZ2xlUGFnZSwgc2ltcGxlIH0sXG4gICAgICBwcmVmaXhDbHMsXG4gICAgfSA9IHRoaXM7XG4gICAgaWYgKHRvdGFsID09PSB1bmRlZmluZWQgfHwgcGFnZVNpemUgPT09IHVuZGVmaW5lZCB8fCBwYWdlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAoaGlkZU9uU2luZ2xlUGFnZSA9PT0gdHJ1ZSAmJiB0b3RhbCA8PSBwYWdlU2l6ZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3Qge1xuICAgICAgdG90YWxQYWdlLFxuICAgICAgcHJvcHM6IHsgY2hpbGRyZW4sIHNpemVDaGFuZ2VyUG9zaXRpb24sIHNob3dUb3RhbCwgc2hvd1BhZ2VyLCBzaG93UXVpY2tKdW1wZXIgfSxcbiAgICB9ID0gdGhpcztcblxuICAgIGNvbnN0IHNpemVDaGFuZ2VyID0gdGhpcy5yZW5kZXJTaXplQ2hhbmdlKHBhZ2VTaXplKTtcblxuICAgIGlmIChzaW1wbGUpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxuYXYgey4uLnRoaXMuZ2V0TWVyZ2VkUHJvcHMoKX0+XG4gICAgICAgICAge3RoaXMuZ2V0UGFnZXIocGFnZSAtIDEsICdwcmV2JywgZmFsc2UsIHBhZ2UgPT09IDEpfVxuICAgICAgICAgIDxsaVxuICAgICAgICAgICBjbGFzc05hbWU9e2Ake3ByZWZpeENsc30tc2ltcGxlLXBhZ2VyYH1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8T2JzZXJ2ZXJOdW1iZXJGaWVsZCB2YWx1ZT17cGFnZX0gbWluPXsxfSBvbkNoYW5nZT17dGhpcy5oYW5kbGVKdW1wQ2hhbmdlfSBvbklucHV0PXt0aGlzLmhhbmRsZUp1bXB9IC8+XG4gICAgICAgICAgICA8c3Bhbj7vvI88L3NwYW4+XG4gICAgICAgICAgICB7dG90YWxQYWdlfVxuICAgICAgICAgIDwvbGk+XG4gICAgICAgICAge3RoaXMuZ2V0UGFnZXIocGFnZSArIDEsICduZXh0JywgZmFsc2UsIHBhZ2UgPT09IHRvdGFsUGFnZSl9XG4gICAgICAgIDwvbmF2PlxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPG5hdiB7Li4udGhpcy5nZXRNZXJnZWRQcm9wcygpfT5cbiAgICAgICAge2NoaWxkcmVufVxuICAgICAgICB7c2l6ZUNoYW5nZXJQb3NpdGlvbiA9PT0gU2l6ZUNoYW5nZXJQb3NpdGlvbi5sZWZ0ICYmIHNpemVDaGFuZ2VyfVxuICAgICAgICB7c2hvd1RvdGFsICYmIHRoaXMucmVuZGVyVG90YWwocGFnZVNpemUsIHBhZ2UsIHRvdGFsKX1cbiAgICAgICAge3RoaXMuZ2V0UGFnZXIoMSwgJ2ZpcnN0JywgZmFsc2UsIHBhZ2UgPT09IDEpfVxuICAgICAgICB7dGhpcy5nZXRQYWdlcihwYWdlIC0gMSwgJ3ByZXYnLCBmYWxzZSwgcGFnZSA9PT0gMSl9XG4gICAgICAgIHtzaG93UGFnZXIgJiYgdGhpcy5yZW5kZXJQYWdlcnMocGFnZSl9XG4gICAgICAgIHt0aGlzLmdldFBhZ2VyKHBhZ2UgKyAxLCAnbmV4dCcsIGZhbHNlLCBwYWdlID09PSB0b3RhbFBhZ2UpfVxuICAgICAgICB7dGhpcy5nZXRQYWdlcih0b3RhbFBhZ2UsICdsYXN0JywgZmFsc2UsIHBhZ2UgPT09IHRvdGFsUGFnZSl9XG4gICAgICAgIHtzaXplQ2hhbmdlclBvc2l0aW9uID09PSBTaXplQ2hhbmdlclBvc2l0aW9uLnJpZ2h0ICYmIHNpemVDaGFuZ2VyfVxuICAgICAgICB7c2hvd1F1aWNrSnVtcGVyICYmIHRoaXMucmVuZGVyUXVpY2tHbygpfVxuICAgICAgPC9uYXY+XG4gICAgKTtcbiAgfVxufVxuIl0sInZlcnNpb24iOjN9