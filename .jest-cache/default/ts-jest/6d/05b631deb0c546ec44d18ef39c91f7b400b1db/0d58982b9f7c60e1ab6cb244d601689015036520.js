import { __decorate } from "tslib";
import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import omit from 'lodash/omit';
import isEqual from 'lodash/isEqual';
import isString from 'lodash/isString';
import isFunction from 'lodash/isFunction';
import { action, computed, observable, toJS } from 'mobx';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import { getConfig } from 'choerodon-ui/lib/configure';
import Icon from '../icon';
import { open } from '../modal-container/ModalContainer';
import LovView from './LovView';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import lovStore from '../stores/LovCodeStore';
import autobind from '../_util/autobind';
import { stopEvent } from '../_util/EventManager';
import { Select } from '../select/Select';
import Button from '../button/Button';
import { $l } from '../locale-context';
import { getLovPara } from '../stores/utils';
let Lov = class Lov extends Select {
    constructor() {
        super(...arguments);
        this.openModal = action(() => {
            const config = this.getConfig();
            const { options, multiple, primitive, valueField } = this;
            const { tableProps } = this.props;
            const modalProps = this.getModalProps();
            const noCache = this.getProp('noCache');
            if (!this.modal && config && options) {
                const { width, title } = config;
                options.unSelectAll();
                options.clearCachedSelected();
                if (multiple) {
                    options.setCachedSelected(this.getValues().map(value => {
                        const selected = new Record(primitive ? { [valueField]: value } : toJS(value), options);
                        selected.isSelected = true;
                        return selected;
                    }));
                }
                this.modal = open({
                    title,
                    children: (React.createElement(LovView, { dataSet: options, config: config, tableProps: tableProps, onDoubleClick: this.handleLovViewSelect, onEnterDown: this.handleLovViewSelect, multiple: this.multiple, values: this.getValues() })),
                    onClose: this.handleLovViewClose,
                    onOk: this.handleLovViewOk,
                    destroyOnClose: true,
                    closable: true,
                    ...modalProps,
                    style: {
                        width: pxToRem(width),
                        minHeight: pxToRem(Math.min(350, window.innerHeight)),
                        ...(modalProps && modalProps.style),
                    },
                });
                if (this.resetOptions(noCache)) {
                    options.query();
                }
                else if (multiple) {
                    options.releaseCachedSelected();
                }
            }
        });
        this.handleLovViewSelect = () => {
            this.modal.close();
            this.handleLovViewOk();
        };
        this.handleLovViewClose = async () => {
            delete this.modal;
            this.focus();
        };
        this.handleLovViewOk = async () => {
            const { options, multiple } = this;
            // 根据 mode 进行区分 假如 存在 rowbox 这些 不应该以 current 作为基准
            let selectionMode = {
                selectionMode: multiple ? "rowbox" /* rowbox */ : "none" /* none */,
                ...getConfig('lovTableProps'),
                ...this.props.tableProps,
            }.selectionMode;
            if ({
                ...getConfig('lovTableProps'),
                ...this.props.tableProps,
            }.alwaysShowRowBox) {
                selectionMode = "rowbox" /* rowbox */;
            }
            const result = [];
            const records = selectionMode === "rowbox" /* rowbox */ ? options.selected : result.concat(options.current || []);
            const values = records.map(record => this.processRecordToObject(record));
            if (values[0]) {
                this.setValue(multiple ? values : values[0] || this.emptyValue);
            }
        };
        this.onClick = () => {
            return this.isDisabled() || this.isReadOnly() ? undefined : this.openModal();
        };
    }
    get searchMatcher() {
        const { searchMatcher } = this.observableProps;
        if (isString(searchMatcher)) {
            return searchMatcher;
        }
        return this.textField;
    }
    get paramMatcher() {
        const { paramMatcher } = this.observableProps;
        return paramMatcher;
    }
    get searchable() {
        const config = this.getConfig();
        const triggerMode = this.getTriggerMode();
        if (config) {
            return config.editableFlag === 'Y' && triggerMode !== "input" /* input */;
        }
        return !!this.props.searchable;
    }
    get lovCode() {
        const { field } = this;
        if (field) {
            return field.get('lovCode');
        }
        return undefined;
    }
    get popup() {
        return !this.filterText || this.modal ? false : this.statePopup;
    }
    get options() {
        const { field, lovCode } = this;
        if (field) {
            const { options } = field;
            if (options) {
                return options;
            }
        }
        if (lovCode) {
            const lovDataSet = lovStore.getLovDataSet(lovCode, field);
            if (lovDataSet) {
                return lovDataSet;
            }
        }
        return new DataSet();
    }
    /**
     * 处理 Lov input 查询参数
     * @param text
     */
    searchRemote(text) {
        if (this.filterText !== text) {
            const { options, searchMatcher, paramMatcher, record, textField, valueField } = this;
            this.filterText = text;
            if (text && isString(searchMatcher)) {
                this.resetOptions(true);
                let textMatcher = text;
                if (isString(paramMatcher)) {
                    textMatcher = text + paramMatcher;
                }
                else if (isFunction(paramMatcher)) {
                    textMatcher = paramMatcher({ record, text, textField, valueField }) || text;
                }
                options.setQueryParameter(searchMatcher, textMatcher);
                options.query();
            }
        }
    }
    resetOptions(noCache = false) {
        const { field, record, options } = this;
        const { queryDataSet, props: { pageSize } } = options;
        let dirty = noCache;
        if (noCache) {
            options.pageSize = pageSize || 10;
        }
        if (queryDataSet && noCache) {
            const { current } = queryDataSet;
            if (current && current.dirty) {
                dirty = true;
                current.reset();
            }
        }
        if (field) {
            const lovPara = getLovPara(field, record);
            if (!isEqual(lovPara, options.queryParameter)) {
                options.queryParameter = lovPara;
                return true;
            }
            options.first();
            if (!options.length) {
                return true;
            }
        }
        return dirty;
    }
    handleKeyDown(e) {
        if (!this.popup && e.keyCode === KeyCode.DOWN) {
            stopEvent(e);
            this.openModal();
        }
        super.handleKeyDown(e);
    }
    handleBlur(e) {
        if (this.modal) {
            e.preventDefault();
        }
        super.handleBlur(e);
    }
    syncValueOnBlur(value) {
        const { mode } = this.props;
        if (mode !== "button" /* button */) {
            super.syncValueOnBlur(value);
        }
    }
    getConfig() {
        const { lovCode } = this;
        if (lovCode) {
            return lovStore.getConfig(lovCode);
        }
    }
    getPlaceholders() {
        const placeholder = super.getPlaceholders();
        if (placeholder.length) {
            return placeholder;
        }
        const config = this.getConfig();
        if (config) {
            const { placeholder: holder } = config;
            const holders = [];
            return holder ? holders.concat(holder) : holders;
        }
        return [];
    }
    getTriggerMode() {
        const { triggerMode } = this.props;
        if (triggerMode !== undefined) {
            return triggerMode;
        }
        return getConfig('lovTriggerMode');
    }
    getModalProps() {
        const { modalProps } = this.props;
        if (modalProps !== undefined) {
            return modalProps;
        }
        return getConfig('lovModalProps');
    }
    getOtherProps() {
        const otherProps = omit(super.getOtherProps(), ['modalProps', 'noCache', 'tableProps', 'triggerMode']);
        const triggerMode = this.getTriggerMode();
        if (triggerMode === "input" /* input */)
            otherProps.onClick = this.onClick;
        return otherProps;
    }
    getButtonProps() {
        const { className, type } = this.props;
        const props = {
            ...Button.defaultProps,
            ...omit(this.getOtherProps(), ['name']),
            className,
            type,
        };
        if (!this.isValid) {
            props.color = "red" /* red */;
        }
        return props;
    }
    getSuffix() {
        const { suffix } = this.props;
        return this.wrapperSuffix(suffix || React.createElement(Icon, { type: "search" }), {
            onClick: this.isDisabled() || this.isReadOnly() ? undefined : this.openModal,
        });
    }
    getInnerSpanButton() {
        const { props: { clearButton }, prefixCls, } = this;
        if (clearButton && !this.isReadOnly()) {
            return this.wrapperInnerSpanButton(React.createElement(Icon, { type: "close", onClick: (e) => {
                    const triggerMode = this.getTriggerMode();
                    if (triggerMode === "input" /* input */)
                        e.preventDefault();
                    this.handleClearButtonClick();
                } }), {
                className: `${prefixCls}-clear-button`,
            });
        }
    }
    componentWillUnmount() {
        super.componentWillUnmount();
        if (this.modal) {
            this.modal.close();
        }
    }
    select() {
        const { mode } = this.props;
        const triggerMode = this.getTriggerMode();
        if (mode !== "button" /* button */ && triggerMode !== "input" /* input */) {
            super.select();
        }
    }
    renderWrapper() {
        const { mode, children, clearButton } = this.props;
        if (mode === "button" /* button */) {
            const elements = [
                React.createElement(Button, Object.assign({ key: "lov_button" }, this.getButtonProps(), { disabled: this.isDisabled(), onClick: this.openModal }), children || this.getTextNode() || this.getPlaceholders()[0] || $l('Lov', 'choose')),
            ];
            if (clearButton) {
                elements.push(React.createElement(Button, { key: "lov_clear_button", size: "small" /* small */, funcType: "flat" /* flat */, icon: "close", onClick: this.handleClearButtonClick }));
            }
            return elements;
        }
        return super.renderWrapper();
    }
};
Lov.displayName = 'Lov';
Lov.propTypes = {
    ...Select.propTypes,
    ...Button.propTypes,
    modalProps: PropTypes.object,
    tableProps: PropTypes.object,
    noCache: PropTypes.bool,
    triggerMode: PropTypes.string,
};
Lov.defaultProps = {
    ...Select.defaultProps,
    clearButton: true,
    checkValueOnOptionsChange: false,
};
__decorate([
    observable
], Lov.prototype, "filterText", void 0);
__decorate([
    computed
], Lov.prototype, "searchMatcher", null);
__decorate([
    computed
], Lov.prototype, "paramMatcher", null);
__decorate([
    computed
], Lov.prototype, "searchable", null);
__decorate([
    computed
], Lov.prototype, "lovCode", null);
__decorate([
    computed
], Lov.prototype, "popup", null);
__decorate([
    computed
], Lov.prototype, "options", null);
__decorate([
    action
], Lov.prototype, "searchRemote", null);
__decorate([
    autobind
], Lov.prototype, "handleKeyDown", null);
__decorate([
    autobind
], Lov.prototype, "handleBlur", null);
Lov = __decorate([
    observer
], Lov);
export default Lov;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL2xvdi9Mb3YudHN4IiwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEtBQW9CLE1BQU0sT0FBTyxDQUFDO0FBQ3pDLE9BQU8sU0FBUyxNQUFNLFlBQVksQ0FBQztBQUNuQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ3RDLE9BQU8sSUFBSSxNQUFNLGFBQWEsQ0FBQztBQUMvQixPQUFPLE9BQU8sTUFBTSxnQkFBZ0IsQ0FBQztBQUNyQyxPQUFPLFFBQVEsTUFBTSxpQkFBaUIsQ0FBQztBQUN2QyxPQUFPLFVBQVUsTUFBTSxtQkFBbUIsQ0FBQztBQUMzQyxPQUFPLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzFELE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUMvRCxPQUFPLE9BQU8sTUFBTSxnQ0FBZ0MsQ0FBQztBQUVyRCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDdkQsT0FBTyxJQUFJLE1BQU0sU0FBUyxDQUFDO0FBQzNCLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQUN6RCxPQUFPLE9BQU8sTUFBTSxXQUFXLENBQUM7QUFFaEMsT0FBTyxPQUFPLE1BQU0scUJBQXFCLENBQUM7QUFDMUMsT0FBTyxNQUFNLE1BQU0sb0JBQW9CLENBQUM7QUFDeEMsT0FBTyxRQUFRLE1BQU0sd0JBQXdCLENBQUM7QUFDOUMsT0FBTyxRQUFRLE1BQU0sbUJBQW1CLENBQUM7QUFDekMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQ2xELE9BQU8sRUFBK0IsTUFBTSxFQUFlLE1BQU0sa0JBQWtCLENBQUM7QUFJcEYsT0FBTyxNQUF1QixNQUFNLGtCQUFrQixDQUFDO0FBRXZELE9BQU8sRUFBRSxFQUFFLEVBQUUs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QUFRLHFCQUNSLElBQUksRUFBQyxPQUFPLEVBQ1osT0FBTyxFQUFFLElBQUksQ0FBQyxzQkFBc0IsR0FDcEMsQ0FDSCxDQUFDO2FBQ0g7WUFDRCxPQUFPLFFBQVEsQ0FBQztTQUNqQjtRQUNELE9BQU8sS0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQy9CLENBQUM7Q0FDRixDQUFBO0FBdlhRLGVBQVcsR0FBRyxLQUFLLENBQUM7QUFFcEIsYUFBUyxHQUFHO0lBQ2pCLEdBQUcsTUFBTSxDQUFDLFNBQVM7SUFDbkIsR0FBRyxNQUFNLENBQUMsU0FBUztJQUNuQixVQUFVLEVBQUUsU0FBUyxDQUFDLE1BQU07SUFDNUIsVUFBVSxFQUFFLFNBQVMsQ0FBQyxNQUFNO0lBQzVCLE9BQU8sRUFBRSxTQUFTLENBQUMsSUFBSTtJQUN2QixXQUFXLEVBQUUsU0FBUyxDQUFDLE1BQU07Q0FDOUIsQ0FBQztBQUVLLGdCQUFZLEdBQUc7SUFDcEIsR0FBRyxNQUFNLENBQUMsWUFBWTtJQUN0QixXQUFXLEVBQUUsSUFBSTtJQUNqQix5QkFBeUIsRUFBRSxLQUFLO0NBQ2pDLENBQUM7QUFJVTtJQUFYLFVBQVU7dUNBQXFCO0FBR2hDO0lBREMsUUFBUTt3Q0FPUjtBQUdEO0lBREMsUUFBUTt1Q0FJUjtBQUdEO0lBREMsUUFBUTtxQ0FRUjtBQUdEO0lBREMsUUFBUTtrQ0FPUjtBQUdEO0lBREMsUUFBUTtnQ0FHUjtBQUdEO0lBREMsUUFBUTtrQ0FnQlI7QUEwREQ7SUFEQyxNQUFNO3VDQWlCTjtBQW1FRDtJQURDLFFBQVE7d0NBT1I7QUFHRDtJQURDLFFBQVE7cUNBTVI7QUF4T2tCLEdBQUc7SUFEdkIsUUFBUTtHQUNZLEdBQUcsQ0F3WHZCO2VBeFhvQixHQUFHIiwibmFtZXMiOltdLCJzb3VyY2VzIjpbIi9Vc2Vycy9odWlodWF3ay9Eb2N1bWVudHMvb3B0L2Nob2Vyb2Rvbi11aS9jb21wb25lbnRzLXByby9sb3YvTG92LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgUmVhY3ROb2RlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCB7IG9ic2VydmVyIH0gZnJvbSAnbW9ieC1yZWFjdCc7XG5pbXBvcnQgb21pdCBmcm9tICdsb2Rhc2gvb21pdCc7XG5pbXBvcnQgaXNFcXVhbCBmcm9tICdsb2Rhc2gvaXNFcXVhbCc7XG5pbXBvcnQgaXNTdHJpbmcgZnJvbSAnbG9kYXNoL2lzU3RyaW5nJztcbmltcG9ydCBpc0Z1bmN0aW9uIGZyb20gJ2xvZGFzaC9pc0Z1bmN0aW9uJztcbmltcG9ydCB7IGFjdGlvbiwgY29tcHV0ZWQsIG9ic2VydmFibGUsIHRvSlMgfSBmcm9tICdtb2J4JztcbmltcG9ydCB7IHB4VG9SZW0gfSBmcm9tICdjaG9lcm9kb24tdWkvbGliL191dGlsL1VuaXRDb252ZXJ0b3InO1xuaW1wb3J0IEtleUNvZGUgZnJvbSAnY2hvZXJvZG9uLXVpL2xpYi9fdXRpbC9LZXlDb2RlJztcbmltcG9ydCB7IFNpemUgfSBmcm9tICdjaG9lcm9kb24tdWkvbGliL191dGlsL2VudW0nO1xuaW1wb3J0IHsgZ2V0Q29uZmlnIH0gZnJvbSAnY2hvZXJvZG9uLXVpL2xpYi9jb25maWd1cmUnO1xuaW1wb3J0IEljb24gZnJvbSAnLi4vaWNvbic7XG5pbXBvcnQgeyBvcGVuIH0gZnJvbSAnLi4vbW9kYWwtY29udGFpbmVyL01vZGFsQ29udGFpbmVyJztcbmltcG9ydCBMb3ZWaWV3IGZyb20gJy4vTG92Vmlldyc7XG5pbXBvcnQgeyBNb2RhbFByb3BzIH0gZnJvbSAnLi4vbW9kYWwvTW9kYWwnO1xuaW1wb3J0IERhdGFTZXQgZnJvbSAnLi4vZGF0YS1zZXQvRGF0YVNldCc7XG5pbXBvcnQgUmVjb3JkIGZyb20gJy4uL2RhdGEtc2V0L1JlY29yZCc7XG5pbXBvcnQgbG92U3RvcmUgZnJvbSAnLi4vc3RvcmVzL0xvdkNvZGVTdG9yZSc7XG5pbXBvcnQgYXV0b2JpbmQgZnJvbSAnLi4vX3V0aWwvYXV0b2JpbmQnO1xuaW1wb3J0IHsgc3RvcEV2ZW50IH0gZnJvbSAnLi4vX3V0aWwvRXZlbnRNYW5hZ2VyJztcbmltcG9ydCB7IFBhcmFtTWF0Y2hlciwgU2VhcmNoTWF0Y2hlciwgU2VsZWN0LCBTZWxlY3RQcm9wcyB9IGZyb20gJy4uL3NlbGVjdC9TZWxlY3QnO1xuaW1wb3J0IHsgQ29sdW1uQWxpZ24sIFRhYmxlUXVlcnlCYXJUeXBlLCBTZWxlY3Rpb25Nb2RlIH0gZnJvbSAnLi4vdGFibGUvZW51bSc7XG5pbXBvcnQgeyBGaWVsZFR5cGUgfSBmcm9tICcuLi9kYXRhLXNldC9lbnVtJztcbmltcG9ydCB7IExvdkZpZWxkVHlwZSwgVmlld01vZGUsIFRyaWdnZXJNb2RlIH0gZnJvbSAnLi9lbnVtJztcbmltcG9ydCBCdXR0b24sIHsgQnV0dG9uUHJvcHMgfSBmcm9tICcuLi9idXR0b24vQnV0dG9uJztcbmltcG9ydCB7IEJ1dHRvbkNvbG9yLCBGdW5jVHlwZSB9IGZyb20gJy4uL2J1dHRvbi9lbnVtJztcbmltcG9ydCB7ICRsIH0gZnJvbSAnLi4vbG9jYWxlLWNvbnRleHQnO1xuaW1wb3J0IHsgZ2V0TG92UGFyYSB9IGZyb20gJy4uL3N0b3Jlcy91dGlscyc7XG5pbXBvcnQgeyBUYWJsZVF1ZXJ5QmFySG9vaywgVGFibGVQcm9wcyB9IGZyb20gJy4uL3RhYmxlL1RhYmxlJztcbmltcG9ydCB7IEZpZWxkUHJvcHMgfSBmcm9tICcuLi9kYXRhLXNldC9GaWVsZCc7XG5cbmV4cG9ydCB0eXBlIExvdkNvbmZpZ0l0ZW0gPSB7XG4gIGRpc3BsYXk/OiBzdHJpbmc7XG4gIGNvbmRpdGlvbkZpZWxkPzogc3RyaW5nO1xuICBjb25kaXRpb25GaWVsZExvdkNvZGU/OiBzdHJpbmc7XG4gIGNvbmRpdGlvbkZpZWxkVHlwZT86IEZpZWxkVHlwZSB8IExvdkZpZWxkVHlwZTtcbiAgY29uZGl0aW9uRmllbGROYW1lPzogc3RyaW5nO1xuICBjb25kaXRpb25GaWVsZFNlbGVjdENvZGU/OiBzdHJpbmc7XG4gIGNvbmRpdGlvbkZpZWxkU2VsZWN0VXJsPzogc3RyaW5nO1xuICBjb25kaXRpb25GaWVsZFNlbGVjdFRmPzogc3RyaW5nO1xuICBjb25kaXRpb25GaWVsZFNlbGVjdFZmPzogc3RyaW5nO1xuICBjb25kaXRpb25GaWVsZFNlcXVlbmNlOiBudW1iZXI7XG4gIGNvbmRpdGlvbkZpZWxkUmVxdWlyZWQ/OiBib29sZWFuO1xuICBncmlkRmllbGQ/OiBzdHJpbmc7XG4gIGdyaWRGaWVsZE5hbWU/OiBzdHJpbmc7XG4gIGdyaWRGaWVsZFdpZHRoPzogbnVtYmVyO1xuICBncmlkRmllbGRBbGlnbj86IENvbHVtbkFsaWduO1xuICBncmlkRmllbGRTZXF1ZW5jZTogbnVtYmVyO1xuICBmaWVsZFByb3BzPzogRmllbGRQcm9wcztcbn07XG5cbmV4cG9ydCB0eXBlIExvdkNvbmZpZyA9IHtcbiAgdGl0bGU/OiBzdHJpbmc7XG4gIHdpZHRoPzogbnVtYmVyO1xuICBoZWlnaHQ/OiBudW1iZXI7XG4gIGN1c3RvbVVybD86IHN0cmluZztcbiAgbG92UGFnZVNpemU/OiBzdHJpbmc7XG4gIGxvdkl0ZW1zOiBMb3ZDb25maWdJdGVtW10gfCBudWxsO1xuICB0cmVlRmxhZz86ICdZJyB8ICdOJztcbiAgcGFyZW50SWRGaWVsZD86IHN0cmluZztcbiAgaWRGaWVsZD86IHN0cmluZztcbiAgdGV4dEZpZWxkPzogc3RyaW5nO1xuICB2YWx1ZUZpZWxkPzogc3RyaW5nO1xuICBwbGFjZWhvbGRlcj86IHN0cmluZztcbiAgZWRpdGFibGVGbGFnPzogJ1knIHwgJ04nO1xuICBxdWVyeUNvbHVtbnM/OiBudW1iZXI7XG4gIHF1ZXJ5QmFyPzogVGFibGVRdWVyeUJhclR5cGUgfCBUYWJsZVF1ZXJ5QmFySG9vaztcbn07XG5cbmV4cG9ydCBpbnRlcmZhY2UgTG92UHJvcHMgZXh0ZW5kcyBTZWxlY3RQcm9wcywgQnV0dG9uUHJvcHMge1xuICBtb2RhbFByb3BzPzogTW9kYWxQcm9wcztcbiAgdGFibGVQcm9wcz86IFRhYmxlUHJvcHM7XG4gIG5vQ2FjaGU/OiBib29sZWFuO1xuICBtb2RlPzogVmlld01vZGU7XG4gIHRyaWdnZXJNb2RlPzogVHJpZ2dlck1vZGU7XG59XG5cbkBvYnNlcnZlclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTG92IGV4dGVuZHMgU2VsZWN0PExvdlByb3BzPiB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZSA9ICdMb3YnO1xuXG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgLi4uU2VsZWN0LnByb3BUeXBlcyxcbiAgICAuLi5CdXR0b24ucHJvcFR5cGVzLFxuICAgIG1vZGFsUHJvcHM6IFByb3BUeXBlcy5vYmplY3QsXG4gICAgdGFibGVQcm9wczogUHJvcFR5cGVzLm9iamVjdCxcbiAgICBub0NhY2hlOiBQcm9wVHlwZXMuYm9vbCxcbiAgICB0cmlnZ2VyTW9kZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgfTtcblxuICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgIC4uLlNlbGVjdC5kZWZhdWx0UHJvcHMsXG4gICAgY2xlYXJCdXR0b246IHRydWUsXG4gICAgY2hlY2tWYWx1ZU9uT3B0aW9uc0NoYW5nZTogZmFsc2UsXG4gIH07XG5cbiAgbW9kYWw7XG5cbiAgQG9ic2VydmFibGUgZmlsdGVyVGV4dD86IHN0cmluZztcblxuICBAY29tcHV0ZWRcbiAgZ2V0IHNlYXJjaE1hdGNoZXIoKTogU2VhcmNoTWF0Y2hlciB7XG4gICAgY29uc3QgeyBzZWFyY2hNYXRjaGVyIH0gPSB0aGlzLm9ic2VydmFibGVQcm9wcztcbiAgICBpZiAoaXNTdHJpbmcoc2VhcmNoTWF0Y2hlcikpIHtcbiAgICAgIHJldHVybiBzZWFyY2hNYXRjaGVyO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy50ZXh0RmllbGQ7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IHBhcmFtTWF0Y2hlcigpOiBQYXJhbU1hdGNoZXIge1xuICAgIGNvbnN0IHsgcGFyYW1NYXRjaGVyIH0gPSB0aGlzLm9ic2VydmFibGVQcm9wcztcbiAgICByZXR1cm4gcGFyYW1NYXRjaGVyO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBzZWFyY2hhYmxlKCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGNvbmZpZyA9IHRoaXMuZ2V0Q29uZmlnKCk7XG4gICAgY29uc3QgdHJpZ2dlck1vZGUgPSB0aGlzLmdldFRyaWdnZXJNb2RlKCk7XG4gICAgaWYgKGNvbmZpZykge1xuICAgICAgcmV0dXJuIGNvbmZpZy5lZGl0YWJsZUZsYWcgPT09ICdZJyAmJiB0cmlnZ2VyTW9kZSAhPT0gVHJpZ2dlck1vZGUuaW5wdXQ7XG4gICAgfVxuICAgIHJldHVybiAhIXRoaXMucHJvcHMuc2VhcmNoYWJsZTtcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgbG92Q29kZSgpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IHsgZmllbGQgfSA9IHRoaXM7XG4gICAgaWYgKGZpZWxkKSB7XG4gICAgICByZXR1cm4gZmllbGQuZ2V0KCdsb3ZDb2RlJyk7XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IHBvcHVwKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhdGhpcy5maWx0ZXJUZXh0IHx8IHRoaXMubW9kYWwgPyBmYWxzZSA6IHRoaXMuc3RhdGVQb3B1cDtcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgb3B0aW9ucygpOiBEYXRhU2V0IHtcbiAgICBjb25zdCB7IGZpZWxkLCBsb3ZDb2RlIH0gPSB0aGlzO1xuICAgIGlmIChmaWVsZCkge1xuICAgICAgY29uc3QgeyBvcHRpb25zIH0gPSBmaWVsZDtcbiAgICAgIGlmIChvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBvcHRpb25zO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAobG92Q29kZSkge1xuICAgICAgY29uc3QgbG92RGF0YVNldCA9IGxvdlN0b3JlLmdldExvdkRhdGFTZXQobG92Q29kZSwgZmllbGQpO1xuICAgICAgaWYgKGxvdkRhdGFTZXQpIHtcbiAgICAgICAgcmV0dXJuIGxvdkRhdGFTZXQ7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXcgRGF0YVNldCgpO1xuICB9XG5cbiAgcHJpdmF0ZSBvcGVuTW9kYWwgPSBhY3Rpb24oKCkgPT4ge1xuICAgIGNvbnN0IGNvbmZpZyA9IHRoaXMuZ2V0Q29uZmlnKCk7XG4gICAgY29uc3QgeyBvcHRpb25zLCBtdWx0aXBsZSwgcHJpbWl0aXZlLCB2YWx1ZUZpZWxkIH0gPSB0aGlzO1xuICAgIGNvbnN0IHsgdGFibGVQcm9wcyB9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCBtb2RhbFByb3BzID0gdGhpcy5nZXRNb2RhbFByb3BzKCk7XG4gICAgY29uc3Qgbm9DYWNoZSA9IHRoaXMuZ2V0UHJvcCgnbm9DYWNoZScpO1xuICAgIGlmICghdGhpcy5tb2RhbCAmJiBjb25maWcgJiYgb3B0aW9ucykge1xuICAgICAgY29uc3QgeyB3aWR0aCwgdGl0bGUgfSA9IGNvbmZpZztcbiAgICAgIG9wdGlvbnMudW5TZWxlY3RBbGwoKTtcbiAgICAgIG9wdGlvbnMuY2xlYXJDYWNoZWRTZWxlY3RlZCgpO1xuICAgICAgaWYgKG11bHRpcGxlKSB7XG4gICAgICAgIG9wdGlvbnMuc2V0Q2FjaGVkU2VsZWN0ZWQoXG4gICAgICAgICAgdGhpcy5nZXRWYWx1ZXMoKS5tYXAodmFsdWUgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWQgPSBuZXcgUmVjb3JkKHByaW1pdGl2ZSA/IHsgW3ZhbHVlRmllbGRdOiB2YWx1ZSB9IDogdG9KUyh2YWx1ZSksIG9wdGlvbnMpO1xuICAgICAgICAgICAgc2VsZWN0ZWQuaXNTZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4gc2VsZWN0ZWQ7XG4gICAgICAgICAgfSksXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICB0aGlzLm1vZGFsID0gb3Blbih7XG4gICAgICAgIHRpdGxlLFxuICAgICAgICBjaGlsZHJlbjogKFxuICAgICAgICAgIDxMb3ZWaWV3XG4gICAgICAgICAgICBkYXRhU2V0PXtvcHRpb25zfVxuICAgICAgICAgICAgY29uZmlnPXtjb25maWd9XG4gICAgICAgICAgICB0YWJsZVByb3BzPXt0YWJsZVByb3BzfVxuICAgICAgICAgICAgb25Eb3VibGVDbGljaz17dGhpcy5oYW5kbGVMb3ZWaWV3U2VsZWN0fVxuICAgICAgICAgICAgb25FbnRlckRvd249e3RoaXMuaGFuZGxlTG92Vmlld1NlbGVjdH1cbiAgICAgICAgICAgIG11bHRpcGxlPXt0aGlzLm11bHRpcGxlfVxuICAgICAgICAgICAgdmFsdWVzPXt0aGlzLmdldFZhbHVlcygpfVxuICAgICAgICAgIC8+XG4gICAgICAgICksXG4gICAgICAgIG9uQ2xvc2U6IHRoaXMuaGFuZGxlTG92Vmlld0Nsb3NlLFxuICAgICAgICBvbk9rOiB0aGlzLmhhbmRsZUxvdlZpZXdPayxcbiAgICAgICAgZGVzdHJveU9uQ2xvc2U6IHRydWUsXG4gICAgICAgIGNsb3NhYmxlOiB0cnVlLFxuICAgICAgICAuLi5tb2RhbFByb3BzLFxuICAgICAgICBzdHlsZToge1xuICAgICAgICAgIHdpZHRoOiBweFRvUmVtKHdpZHRoKSxcbiAgICAgICAgICBtaW5IZWlnaHQ6IHB4VG9SZW0oTWF0aC5taW4oMzUwLCB3aW5kb3cuaW5uZXJIZWlnaHQpKSxcbiAgICAgICAgICAuLi4obW9kYWxQcm9wcyAmJiBtb2RhbFByb3BzLnN0eWxlKSxcbiAgICAgICAgfSxcbiAgICAgIH0gYXMgTW9kYWxQcm9wcyAmIHsgY2hpbGRyZW47IH0pO1xuICAgICAgaWYgKHRoaXMucmVzZXRPcHRpb25zKG5vQ2FjaGUpKSB7XG4gICAgICAgIG9wdGlvbnMucXVlcnkoKTtcbiAgICAgIH0gZWxzZSBpZiAobXVsdGlwbGUpIHtcbiAgICAgICAgb3B0aW9ucy5yZWxlYXNlQ2FjaGVkU2VsZWN0ZWQoKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIC8qKlxuICAgKiDlpITnkIYgTG92IGlucHV0IOafpeivouWPguaVsFxuICAgKiBAcGFyYW0gdGV4dFxuICAgKi9cbiAgQGFjdGlvblxuICBzZWFyY2hSZW1vdGUodGV4dCkge1xuICAgIGlmICh0aGlzLmZpbHRlclRleHQgIT09IHRleHQpIHtcbiAgICAgIGNvbnN0IHsgb3B0aW9ucywgc2VhcmNoTWF0Y2hlciwgcGFyYW1NYXRjaGVyLCByZWNvcmQsIHRleHRGaWVsZCwgdmFsdWVGaWVsZCB9ID0gdGhpcztcbiAgICAgIHRoaXMuZmlsdGVyVGV4dCA9IHRleHQ7XG4gICAgICBpZiAodGV4dCAmJiBpc1N0cmluZyhzZWFyY2hNYXRjaGVyKSkge1xuICAgICAgICB0aGlzLnJlc2V0T3B0aW9ucyh0cnVlKTtcbiAgICAgICAgbGV0IHRleHRNYXRjaGVyID0gdGV4dDtcbiAgICAgICAgaWYgKGlzU3RyaW5nKHBhcmFtTWF0Y2hlcikpIHtcbiAgICAgICAgICB0ZXh0TWF0Y2hlciA9IHRleHQgKyBwYXJhbU1hdGNoZXI7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNGdW5jdGlvbihwYXJhbU1hdGNoZXIpKXtcbiAgICAgICAgICB0ZXh0TWF0Y2hlciA9IHBhcmFtTWF0Y2hlcih7IHJlY29yZCwgdGV4dCwgdGV4dEZpZWxkLCB2YWx1ZUZpZWxkIH0pIHx8IHRleHQ7XG4gICAgICAgIH1cbiAgICAgICAgb3B0aW9ucy5zZXRRdWVyeVBhcmFtZXRlcihzZWFyY2hNYXRjaGVyLCB0ZXh0TWF0Y2hlcik7XG4gICAgICAgIG9wdGlvbnMucXVlcnkoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBoYW5kbGVMb3ZWaWV3U2VsZWN0ID0gKCkgPT4ge1xuICAgIHRoaXMubW9kYWwuY2xvc2UoKTtcbiAgICB0aGlzLmhhbmRsZUxvdlZpZXdPaygpO1xuICB9O1xuXG4gIGhhbmRsZUxvdlZpZXdDbG9zZSA9IGFzeW5jICgpID0+IHtcbiAgICBkZWxldGUgdGhpcy5tb2RhbDtcbiAgICB0aGlzLmZvY3VzKCk7XG4gIH07XG5cbiAgaGFuZGxlTG92Vmlld09rID0gYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IHsgb3B0aW9ucywgbXVsdGlwbGUgfSA9IHRoaXM7XG5cbiAgICAvLyDmoLnmja4gbW9kZSDov5vooYzljLrliIYg5YGH5aaCIOWtmOWcqCByb3dib3gg6L+Z5LqbIOS4jeW6lOivpeS7pSBjdXJyZW50IOS9nOS4uuWfuuWHhlxuICAgIGxldCBzZWxlY3Rpb25Nb2RlID0ge1xuICAgICAgc2VsZWN0aW9uTW9kZTogbXVsdGlwbGUgPyBTZWxlY3Rpb25Nb2RlLnJvd2JveCA6IFNlbGVjdGlvbk1vZGUubm9uZSxcbiAgICAgIC4uLmdldENvbmZpZygnbG92VGFibGVQcm9wcycpLFxuICAgICAgLi4udGhpcy5wcm9wcy50YWJsZVByb3BzLFxuICAgIH0uc2VsZWN0aW9uTW9kZTtcblxuICAgIGlmICh7XG4gICAgICAuLi5nZXRDb25maWcoJ2xvdlRhYmxlUHJvcHMnKSxcbiAgICAgIC4uLnRoaXMucHJvcHMudGFibGVQcm9wcyxcbiAgICB9LmFsd2F5c1Nob3dSb3dCb3gpIHtcbiAgICAgIHNlbGVjdGlvbk1vZGUgPSBTZWxlY3Rpb25Nb2RlLnJvd2JveDtcbiAgICB9XG5cbiAgICBjb25zdCByZXN1bHQ6IFJlY29yZFtdID0gW107XG4gICAgY29uc3QgcmVjb3JkcyA9IHNlbGVjdGlvbk1vZGUgPT09IFNlbGVjdGlvbk1vZGUucm93Ym94ID8gb3B0aW9ucy5zZWxlY3RlZCA6IHJlc3VsdC5jb25jYXQob3B0aW9ucy5jdXJyZW50IHx8IFtdKTtcbiAgICBjb25zdCB2YWx1ZXMgPSByZWNvcmRzLm1hcChyZWNvcmQgPT4gdGhpcy5wcm9jZXNzUmVjb3JkVG9PYmplY3QocmVjb3JkKSk7XG5cbiAgICBpZiAodmFsdWVzWzBdKSB7XG4gICAgICB0aGlzLnNldFZhbHVlKG11bHRpcGxlID8gdmFsdWVzIDogdmFsdWVzWzBdIHx8IHRoaXMuZW1wdHlWYWx1ZSk7XG4gICAgfVxuICB9O1xuXG4gIHJlc2V0T3B0aW9ucyhub0NhY2hlOiBib29sZWFuID0gZmFsc2UpOiBib29sZWFuIHtcbiAgICBjb25zdCB7IGZpZWxkLCByZWNvcmQsIG9wdGlvbnMgfSA9IHRoaXM7XG4gICAgY29uc3QgeyBxdWVyeURhdGFTZXQsIHByb3BzOiB7IHBhZ2VTaXplIH0gfSA9IG9wdGlvbnM7XG4gICAgbGV0IGRpcnR5ID0gbm9DYWNoZTtcbiAgICBpZiAobm9DYWNoZSkge1xuICAgICAgb3B0aW9ucy5wYWdlU2l6ZSA9IHBhZ2VTaXplIHx8IDEwO1xuICAgIH1cbiAgICBpZiAocXVlcnlEYXRhU2V0ICYmIG5vQ2FjaGUpIHtcbiAgICAgIGNvbnN0IHsgY3VycmVudCB9ID0gcXVlcnlEYXRhU2V0O1xuICAgICAgaWYgKGN1cnJlbnQgJiYgY3VycmVudC5kaXJ0eSkge1xuICAgICAgICBkaXJ0eSA9IHRydWU7XG4gICAgICAgIGN1cnJlbnQucmVzZXQoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGZpZWxkKSB7XG4gICAgICBjb25zdCBsb3ZQYXJhID0gZ2V0TG92UGFyYShmaWVsZCwgcmVjb3JkKTtcbiAgICAgIGlmICghaXNFcXVhbChsb3ZQYXJhLCBvcHRpb25zLnF1ZXJ5UGFyYW1ldGVyKSkge1xuICAgICAgICBvcHRpb25zLnF1ZXJ5UGFyYW1ldGVyID0gbG92UGFyYTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICBvcHRpb25zLmZpcnN0KCk7XG4gICAgICBpZiAoIW9wdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGlydHk7XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgaGFuZGxlS2V5RG93bihlKSB7XG4gICAgaWYgKCF0aGlzLnBvcHVwICYmIGUua2V5Q29kZSA9PT0gS2V5Q29kZS5ET1dOKSB7XG4gICAgICBzdG9wRXZlbnQoZSk7XG4gICAgICB0aGlzLm9wZW5Nb2RhbCgpO1xuICAgIH1cbiAgICBzdXBlci5oYW5kbGVLZXlEb3duKGUpO1xuICB9XG5cbiAgQGF1dG9iaW5kXG4gIGhhbmRsZUJsdXIoZSkge1xuICAgIGlmICh0aGlzLm1vZGFsKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuICAgIHN1cGVyLmhhbmRsZUJsdXIoZSk7XG4gIH1cblxuICBzeW5jVmFsdWVPbkJsdXIodmFsdWUpIHtcbiAgICBjb25zdCB7IG1vZGUgfSA9IHRoaXMucHJvcHM7XG4gICAgaWYgKG1vZGUgIT09IFZpZXdNb2RlLmJ1dHRvbikge1xuICAgICAgc3VwZXIuc3luY1ZhbHVlT25CbHVyKHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICBnZXRDb25maWcoKSB7XG4gICAgY29uc3QgeyBsb3ZDb2RlIH0gPSB0aGlzO1xuICAgIGlmIChsb3ZDb2RlKSB7XG4gICAgICByZXR1cm4gbG92U3RvcmUuZ2V0Q29uZmlnKGxvdkNvZGUpO1xuICAgIH1cbiAgfVxuXG4gIGdldFBsYWNlaG9sZGVycygpOiBzdHJpbmdbXSB7XG4gICAgY29uc3QgcGxhY2Vob2xkZXIgPSBzdXBlci5nZXRQbGFjZWhvbGRlcnMoKTtcbiAgICBpZiAocGxhY2Vob2xkZXIubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gcGxhY2Vob2xkZXI7XG4gICAgfVxuICAgIGNvbnN0IGNvbmZpZyA9IHRoaXMuZ2V0Q29uZmlnKCk7XG4gICAgaWYgKGNvbmZpZykge1xuICAgICAgY29uc3QgeyBwbGFjZWhvbGRlcjogaG9sZGVyIH0gPSBjb25maWc7XG4gICAgICBjb25zdCBob2xkZXJzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgcmV0dXJuIGhvbGRlciA/IGhvbGRlcnMuY29uY2F0KGhvbGRlcikgOiBob2xkZXJzO1xuICAgIH1cbiAgICByZXR1cm4gW107XG4gIH1cblxuICBvbkNsaWNrID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLmlzRGlzYWJsZWQoKSB8fCB0aGlzLmlzUmVhZE9ubHkoKSA/IHVuZGVmaW5lZCA6IHRoaXMub3Blbk1vZGFsKCk7XG4gIH07XG5cbiAgZ2V0VHJpZ2dlck1vZGUoKSB7XG4gICAgY29uc3QgeyB0cmlnZ2VyTW9kZSB9ID0gdGhpcy5wcm9wcztcbiAgICBpZiAodHJpZ2dlck1vZGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHRyaWdnZXJNb2RlO1xuICAgIH1cbiAgICByZXR1cm4gZ2V0Q29uZmlnKCdsb3ZUcmlnZ2VyTW9kZScpO1xuICB9XG5cbiAgZ2V0TW9kYWxQcm9wcygpIHtcbiAgICBjb25zdCB7IG1vZGFsUHJvcHMgfSA9IHRoaXMucHJvcHM7XG4gICAgaWYgKG1vZGFsUHJvcHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIG1vZGFsUHJvcHM7XG4gICAgfVxuICAgIHJldHVybiBnZXRDb25maWcoJ2xvdk1vZGFsUHJvcHMnKTtcbiAgfVxuXG4gIGdldE90aGVyUHJvcHMoKSB7XG4gICAgY29uc3Qgb3RoZXJQcm9wcyA9IG9taXQoc3VwZXIuZ2V0T3RoZXJQcm9wcygpLCBbJ21vZGFsUHJvcHMnLCAnbm9DYWNoZScsICd0YWJsZVByb3BzJywgJ3RyaWdnZXJNb2RlJ10pO1xuICAgIGNvbnN0IHRyaWdnZXJNb2RlID0gdGhpcy5nZXRUcmlnZ2VyTW9kZSgpO1xuICAgIGlmICh0cmlnZ2VyTW9kZSA9PT0gVHJpZ2dlck1vZGUuaW5wdXQpIG90aGVyUHJvcHMub25DbGljayA9IHRoaXMub25DbGljaztcbiAgICByZXR1cm4gb3RoZXJQcm9wcztcbiAgfVxuXG4gIGdldEJ1dHRvblByb3BzKCkge1xuICAgIGNvbnN0IHsgY2xhc3NOYW1lLCB0eXBlIH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHByb3BzOiBCdXR0b25Qcm9wcyA9IHtcbiAgICAgIC4uLkJ1dHRvbi5kZWZhdWx0UHJvcHMsXG4gICAgICAuLi5vbWl0KHRoaXMuZ2V0T3RoZXJQcm9wcygpLCBbJ25hbWUnXSksXG4gICAgICBjbGFzc05hbWUsXG4gICAgICB0eXBlLFxuICAgIH07XG4gICAgaWYgKCF0aGlzLmlzVmFsaWQpIHtcbiAgICAgIHByb3BzLmNvbG9yID0gQnV0dG9uQ29sb3IucmVkO1xuICAgIH1cblxuICAgIHJldHVybiBwcm9wcztcbiAgfVxuXG4gIGdldFN1ZmZpeCgpOiBSZWFjdE5vZGUge1xuICAgIGNvbnN0IHsgc3VmZml4IH0gPSB0aGlzLnByb3BzO1xuICAgIHJldHVybiB0aGlzLndyYXBwZXJTdWZmaXgoc3VmZml4IHx8IDxJY29uIHR5cGU9XCJzZWFyY2hcIiAvPiwge1xuICAgICAgb25DbGljazogdGhpcy5pc0Rpc2FibGVkKCkgfHwgdGhpcy5pc1JlYWRPbmx5KCkgPyB1bmRlZmluZWQgOiB0aGlzLm9wZW5Nb2RhbCxcbiAgICB9KTtcbiAgfVxuXG4gIGdldElubmVyU3BhbkJ1dHRvbigpOiBSZWFjdE5vZGUge1xuICAgIGNvbnN0IHtcbiAgICAgIHByb3BzOiB7IGNsZWFyQnV0dG9uIH0sXG4gICAgICBwcmVmaXhDbHMsXG4gICAgfSA9IHRoaXM7XG4gICAgaWYgKGNsZWFyQnV0dG9uICYmICF0aGlzLmlzUmVhZE9ubHkoKSkge1xuICAgICAgcmV0dXJuIHRoaXMud3JhcHBlcklubmVyU3BhbkJ1dHRvbihcbiAgICAgICAgPEljb25cbiAgICAgICAgICB0eXBlPVwiY2xvc2VcIlxuICAgICAgICAgIG9uQ2xpY2s9eyhlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB0cmlnZ2VyTW9kZSA9IHRoaXMuZ2V0VHJpZ2dlck1vZGUoKTtcbiAgICAgICAgICAgIGlmICh0cmlnZ2VyTW9kZSA9PT0gVHJpZ2dlck1vZGUuaW5wdXQpIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlQ2xlYXJCdXR0b25DbGljaygpO1xuICAgICAgICAgIH19XG4gICAgICAgIC8+LFxuICAgICAgICB7XG4gICAgICAgICAgY2xhc3NOYW1lOiBgJHtwcmVmaXhDbHN9LWNsZWFyLWJ1dHRvbmAsXG4gICAgICAgIH0sXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIHN1cGVyLmNvbXBvbmVudFdpbGxVbm1vdW50KCk7XG4gICAgaWYgKHRoaXMubW9kYWwpIHtcbiAgICAgIHRoaXMubW9kYWwuY2xvc2UoKTtcbiAgICB9XG4gIH1cblxuICBzZWxlY3QoKSB7XG4gICAgY29uc3QgeyBtb2RlIH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHRyaWdnZXJNb2RlID0gdGhpcy5nZXRUcmlnZ2VyTW9kZSgpO1xuICAgIGlmIChtb2RlICE9PSBWaWV3TW9kZS5idXR0b24gJiYgdHJpZ2dlck1vZGUgIT09IFRyaWdnZXJNb2RlLmlucHV0KSB7XG4gICAgICBzdXBlci5zZWxlY3QoKTtcbiAgICB9XG4gIH1cblxuICByZW5kZXJXcmFwcGVyKCk6IFJlYWN0Tm9kZSB7XG4gICAgY29uc3QgeyBtb2RlLCBjaGlsZHJlbiwgY2xlYXJCdXR0b24gfSA9IHRoaXMucHJvcHM7XG4gICAgaWYgKG1vZGUgPT09IFZpZXdNb2RlLmJ1dHRvbikge1xuICAgICAgY29uc3QgZWxlbWVudHMgPSBbXG4gICAgICAgIDxCdXR0b25cbiAgICAgICAgICBrZXk9XCJsb3ZfYnV0dG9uXCJcbiAgICAgICAgICB7Li4udGhpcy5nZXRCdXR0b25Qcm9wcygpfVxuICAgICAgICAgIGRpc2FibGVkPXt0aGlzLmlzRGlzYWJsZWQoKX1cbiAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9wZW5Nb2RhbH1cbiAgICAgICAgPlxuICAgICAgICAgIHtjaGlsZHJlbiB8fCB0aGlzLmdldFRleHROb2RlKCkgfHwgdGhpcy5nZXRQbGFjZWhvbGRlcnMoKVswXSB8fCAkbCgnTG92JywgJ2Nob29zZScpfVxuICAgICAgICA8L0J1dHRvbj4sXG4gICAgICBdO1xuICAgICAgaWYgKGNsZWFyQnV0dG9uKSB7XG4gICAgICAgIGVsZW1lbnRzLnB1c2goXG4gICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAga2V5PVwibG92X2NsZWFyX2J1dHRvblwiXG4gICAgICAgICAgICBzaXplPXtTaXplLnNtYWxsfVxuICAgICAgICAgICAgZnVuY1R5cGU9e0Z1bmNUeXBlLmZsYXR9XG4gICAgICAgICAgICBpY29uPVwiY2xvc2VcIlxuICAgICAgICAgICAgb25DbGljaz17dGhpcy5oYW5kbGVDbGVhckJ1dHRvbkNsaWNrfVxuICAgICAgICAgIC8+LFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGVsZW1lbnRzO1xuICAgIH1cbiAgICByZXR1cm4gc3VwZXIucmVuZGVyV3JhcHBlcigpO1xuICB9XG59XG4iXSwidmVyc2lvbiI6M30=