import React, { isValidElement } from 'react';
import isString from 'lodash/isString';
import warning from 'choerodon-ui/lib/_util/warning';
import ObserverCheckBox from '../check-box/CheckBox';
import Switch from '../switch/Switch';
import ObserverRadio from '../radio/Radio';
import ObserverSelect from '../select/Select';
import SelectBox from '../select-box/SelectBox';
import Lov from '../lov/Lov';
import ObserverNumberField from '../number-field/NumberField';
import Currency from '../currency/Currency';
import DatePicker from '../date-picker/DatePicker';
import DateTimePicker from '../date-time-picker/DateTimePicker';
import TimePicker from '../time-picker/TimePicker';
import WeekPicker from '../week-picker/WeekPicker';
import MonthPicker from '../month-picker/MonthPicker';
import YearPicker from '../year-picker/YearPicker';
import ObserverTextField from '../text-field/TextField';
import IntlField from '../intl-field/IntlField';
import UrlField from '../url-field/UrlField';
import EmailField from '../email-field/EmailField';
import ColorPicker from '../color-picker/ColorPicker';
import Output from '../output/Output';
export function getEditorByField(field) {
    const lookupCode = field.get('lookupCode');
    const lookupUrl = field.get('lookupUrl');
    const lovCode = field.get('lovCode');
    const multiLine = field.get('multiLine');
    const { type, name } = field;
    if (lookupCode ||
        isString(lookupUrl) ||
        (type !== "object" /* object */ && (lovCode || field.options))) {
        return React.createElement(ObserverSelect, null);
    }
    if (lovCode) {
        return React.createElement(Lov, null);
    }
    if (multiLine) {
        return React.createElement(Output, null);
    }
    switch (type) {
        case "boolean" /* boolean */:
            return React.createElement(ObserverCheckBox, null);
        case "number" /* number */:
            return React.createElement(ObserverNumberField, null);
        case "currency" /* currency */:
            return React.createElement(Currency, null);
        case "date" /* date */:
            return React.createElement(DatePicker, null);
        case "dateTime" /* dateTime */:
            return React.createElement(DateTimePicker, null);
        case "time" /* time */:
            return React.createElement(TimePicker, null);
        case "week" /* week */:
            return React.createElement(WeekPicker, null);
        case "month" /* month */:
            return React.createElement(MonthPicker, null);
        case "year" /* year */:
            return React.createElement(YearPicker, null);
        case "intl" /* intl */:
            return React.createElement(IntlField, null);
        case "email" /* email */:
            return React.createElement(EmailField, null);
        case "url" /* url */:
            return React.createElement(UrlField, null);
        case "color" /* color */:
            return React.createElement(ColorPicker, null);
        case "string" /* string */:
            return React.createElement(ObserverTextField, null);
        default:
            warning(false, `Table auto editor: No editor exists on the field<${name}>'s type<${type}>, so use the TextField as default editor`);
            return React.createElement(ObserverTextField, null);
    }
}
export function getAlignByField(field) {
    if (field) {
        const { type } = field;
        switch (type) {
            case "number" /* number */:
                return "right" /* right */;
            case "boolean" /* boolean */:
                return "center" /* center */;
            default:
        }
    }
}
export function getEditorByColumnAndRecord(column, record) {
    const { name, editor } = column;
    if (record) {
        let cellEditor = editor;
        if (typeof editor === 'function') {
            cellEditor = editor(record, name);
        }
        if (cellEditor === true) {
            const field = record.getField(name);
            if (field) {
                if (!field.get('unique') ||
                    field.get('multiple') ||
                    field.get('range') ||
                    record.status === "add" /* add */) {
                    return getEditorByField(field);
                }
            }
        }
        if (isValidElement(cellEditor)) {
            return cellEditor;
        }
    }
}
export function isRadio(element) {
    if (element) {
        switch (element.type) {
            case ObserverCheckBox:
            case ObserverRadio:
            case Switch:
            case SelectBox:
                return true;
            default:
        }
    }
    return false;
}
export function findCell(tableStore, prefixCls, name, lock) {
    const { node, dataSet, overflowX, currentEditRecord } = tableStore;
    const current = currentEditRecord || dataSet.current;
    const tableCellPrefixCls = `${prefixCls}-cell`;
    if (name !== undefined && current && node.element) {
        const wrapperSelector = overflowX && lock ? `.${prefixCls}-fixed-${lock === true ? "left" /* left */ : lock} ` : '';
        const selector = `${wrapperSelector}tr[data-index="${current.id}"] td[data-index="${name}"] span.${tableCellPrefixCls}-inner`;
        return node.element.querySelector(selector);
    }
}
export function findFirstFocusableElement(node) {
    if (node.children) {
        let found;
        [...node.children].some(child => {
            if (child.tabIndex > -1 && child.getAttribute('type') !== 'checkbox' && child.getAttribute('type') !== 'radio') {
                found = child;
            }
            else {
                found = findFirstFocusableElement(child);
            }
            return !!found;
        });
        return found;
    }
}
// 用于校验定位 focus 第一个非法单元格
export function findFirstFocusableInvalidElement(node) {
    if (node.children) {
        let found;
        [...node.children].some(child => {
            if (child.tabIndex > -1 && child.className.includes('invalid')) {
                found = child;
            }
            else {
                found = findFirstFocusableInvalidElement(child);
            }
            return !!found;
        });
        return found;
    }
}
export function findIndexedSibling(element, direction) {
    const sibling = direction > 0 ? element.nextElementSibling : element.previousElementSibling;
    if (!sibling ||
        ('index' in sibling.dataset &&
            !sibling.getAttributeNodeNS('', 'disabled') &&
            (!document.defaultView || document.defaultView.getComputedStyle(sibling).display !== 'none'))) {
        return sibling;
    }
    return findIndexedSibling(sibling, direction);
}
export function isDisabledRow(record) {
    return record.isCached || record.status === "delete" /* delete */;
}
export function isSelectedRow(record) {
    return record.isSelected;
}
export function getHeader(column, dataSet) {
    const { header, name } = column;
    if (typeof header === 'function') {
        return header(dataSet, name);
    }
    if (header !== undefined) {
        return header;
    }
    const field = dataSet.getField(name);
    if (field) {
        return field.get('label');
    }
}
export function getColumnKey({ name, key }) {
    return key || name;
}
export function getPaginationPosition(pagination) {
    if (pagination) {
        const { position } = pagination;
        if (position) {
            return position;
        }
    }
    return "bottom" /* bottom */;
}
export function getHeight(el) {
    return el.getBoundingClientRect().height;
}
/**
 * 合并指定的对象参数
 * @param keys 需要合并的关键字
 * @param newObj 传入的新对象
 * @param oldObj 返回的旧对象
 */
export function mergeObject(keys, newObj, oldObj) {
    let mergedObj = oldObj;
    if (keys.length > 0) {
        keys.forEach(key => {
            if (key in newObj) {
                oldObj[key] = newObj[key];
                mergedObj = { ...oldObj };
            }
        });
    }
    return mergedObj;
}
/**
 * 更具是否是react节点生成对象返回不同值
 * @param key 返回的属性
 * @param column 可能是reactnode 也可能是columprops 对象
 */
function getColumnChildrenValue(key, column) {
    if (React.isValidElement(column)) {
        return column.props[key];
    }
    return column[key];
}
/**
 * 如果找不到给js最大值9007199254740991
 */
export function changeIndexOf(array, value) {
    if (array.indexOf(value) === -1) {
        return 9007199254740991;
    }
    return array.indexOf(value);
}
/**
 * 实现首次进入就开始排序
 * @param newColumns 需要这样排序以及合并参数的列表
 * @param originalColumns 原始列表
 */
export function reorderingColumns(newColumns, originalColumns) {
    if (newColumns && newColumns.length > 0 && originalColumns.length > 0) {
        // 暂时定性为对存在name的进行排序
        const nameColumns = originalColumns.filter(columnItem => getColumnChildrenValue('name', columnItem));
        const noNameColumns = originalColumns.filter(columnItem => !getColumnChildrenValue('name', columnItem));
        if (nameColumns && newColumns && nameColumns.length > 0 && newColumns.length > 0) {
            const newColumnsStr = newColumns.map(function (obj) {
                return getColumnChildrenValue('name', obj);
            }).join(',');
            const newColumnsNameArray = newColumnsStr.split(',');
            if (newColumnsNameArray.length > 0) {
                nameColumns.sort((prev, next) => {
                    if (getColumnChildrenValue('name', prev) && getColumnChildrenValue('name', next)) {
                        return changeIndexOf(newColumnsNameArray, getColumnChildrenValue('name', prev)) - changeIndexOf(newColumnsNameArray, getColumnChildrenValue('name', next));
                    }
                    return 1;
                });
                return [...nameColumns, ...noNameColumns];
            }
        }
    }
    return originalColumns;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL3RhYmxlL3V0aWxzLnRzeCIsIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEtBQUssRUFBRSxFQUFFLGNBQWMsRUFBZ0MsTUFBTSxPQUFPLENBQUM7QUFDNUUsT0FBTyxRQUFRLE1BQU0saUJBQWlCLENBQUM7QUFDdkMsT0FBTyxPQUFPLE1BQU0sZ0NBQWdDLENBQUM7QUFHckQsT0FBTyxnQkFBZ0IsTUFBTSx1QkFBdUIsQ0FBQztBQUNyRCxPQUFPLE1BQU0sTUFBTSxrQkFBa0IsQ0FBQztBQUN0QyxPQUFPLGFBQWEsTUFBTSxnQkFBZ0IsQ0FBQztBQUczQyxPQUFPLGNBQWMsTUFBTSxrQkFBa0IsQ0FBQztBQUM5QyxPQUFPLFNBQVMsTUFBTSx5QkFBeUIsQ0FBQztBQUNoRCxPQUFPLEdBQUcsTUFBTSxZQUFZLENBQUM7QUFDN0IsT0FBTyxtQkFBbUIsTUFBTSw2QkFBNkIsQ0FBQztBQUM5RCxPQUFPLFFBQVEsTUFBTSxzQkFBc0IsQ0FBQztBQUM1QyxPQUFPLFVBQVUsTUFBTSwyQkFBMkIsQ0FBQztBQUNuRCxPQUFPLGNBQWMsTUFBTSxvQ0FBb0MsQ0FBQztBQUNoRSxPQUFPLFVBQVUsTUFBTSwyQkFBMkIsQ0FBQztBQUNuRCxPQUFPLFVBQVUsTUFBTSwyQkFBMkIsQ0FBQztBQUNuRCxPQUFPLFdBQVcsTUFBTSw2QkFBNkIsQ0FBQztBQUN0RCxPQUFPLFVBQVUsTUFBTSwyQkFBMkIsQ0FBQztBQUNuRCxPQUFPLGlCQUFpQixNQUFNLHlCQUF5QixDQUFDO0FBR3hELE9BQU8sU0FBUyxNQUFNLHlCQUF5QixDQUFDO0FBQ2hELE9BQU8sUUFBUSxNQUFNLHVCQUF1QixDQUFDO0FBQzdDLE9BQU8sVUFBVSxNQUFNLDJCQUEyQixDQUFDO0FBQ25ELE9BQU8sV0FBVyxNQUFNLDZCQUE2QixDQUFDO0FBQ3RELE9BQU8sTUFBTSxNQUFNLGtCQUFrQixDQUFDO0FBS3RDLE1BQU0sVUFBVSxnQkFBZ0Is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QUFHLENBQUMsRUFBRTtZQUNoRixNQUFNLGFBQWEsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLFVBQVMsR0FBRztnQkFDL0MsT0FBTyxzQkFBc0IsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDN0MsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2IsTUFBTSxtQkFBbUIsR0FBRyxhQUFhLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3JELElBQUksbUJBQW1CLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDbEMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsRUFBRTtvQkFDOUIsSUFBSSxzQkFBc0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksc0JBQXNCLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxFQUFFO3dCQUNoRixPQUFPLGFBQWEsQ0FBQyxtQkFBbUIsRUFBRSxzQkFBc0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxhQUFhLENBQUMsbUJBQW1CLEVBQUUsc0JBQXNCLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7cUJBQzVKO29CQUNELE9BQU8sQ0FBQyxDQUFDO2dCQUNYLENBQUMsQ0FBQyxDQUFDO2dCQUNILE9BQU8sQ0FBQyxHQUFHLFdBQVcsRUFBRSxHQUFHLGFBQWEsQ0FBQyxDQUFDO2FBQzNDO1NBQ0Y7S0FDRjtJQUNELE9BQU8sZUFBZSxDQUFDO0FBQ3pCLENBQUMiLCJuYW1lcyI6W10sInNvdXJjZXMiOlsiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL3RhYmxlL3V0aWxzLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgaXNWYWxpZEVsZW1lbnQsIEtleSwgUmVhY3RFbGVtZW50LCBSZWFjdE5vZGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgaXNTdHJpbmcgZnJvbSAnbG9kYXNoL2lzU3RyaW5nJztcbmltcG9ydCB3YXJuaW5nIGZyb20gJ2Nob2Vyb2Rvbi11aS9saWIvX3V0aWwvd2FybmluZyc7XG5pbXBvcnQgeyBDb2x1bW5Qcm9wcyB9IGZyb20gJy4vQ29sdW1uJztcbmltcG9ydCBSZWNvcmQgZnJvbSAnLi4vZGF0YS1zZXQvUmVjb3JkJztcbmltcG9ydCBPYnNlcnZlckNoZWNrQm94IGZyb20gJy4uL2NoZWNrLWJveC9DaGVja0JveCc7XG5pbXBvcnQgU3dpdGNoIGZyb20gJy4uL3N3aXRjaC9Td2l0Y2gnO1xuaW1wb3J0IE9ic2VydmVyUmFkaW8gZnJvbSAnLi4vcmFkaW8vUmFkaW8nO1xuaW1wb3J0IHsgRmllbGRUeXBlLCBSZWNvcmRTdGF0dXMgfSBmcm9tICcuLi9kYXRhLXNldC9lbnVtJztcbmltcG9ydCBGaWVsZCBmcm9tICcuLi9kYXRhLXNldC9GaWVsZCc7XG5pbXBvcnQgT2JzZXJ2ZXJTZWxlY3QgZnJvbSAnLi4vc2VsZWN0L1NlbGVjdCc7XG5pbXBvcnQgU2VsZWN0Qm94IGZyb20gJy4uL3NlbGVjdC1ib3gvU2VsZWN0Qm94JztcbmltcG9ydCBMb3YgZnJvbSAnLi4vbG92L0xvdic7XG5pbXBvcnQgT2JzZXJ2ZXJOdW1iZXJGaWVsZCBmcm9tICcuLi9udW1iZXItZmllbGQvTnVtYmVyRmllbGQnO1xuaW1wb3J0IEN1cnJlbmN5IGZyb20gJy4uL2N1cnJlbmN5L0N1cnJlbmN5JztcbmltcG9ydCBEYXRlUGlja2VyIGZyb20gJy4uL2RhdGUtcGlja2VyL0RhdGVQaWNrZXInO1xuaW1wb3J0IERhdGVUaW1lUGlja2VyIGZyb20gJy4uL2RhdGUtdGltZS1waWNrZXIvRGF0ZVRpbWVQaWNrZXInO1xuaW1wb3J0IFRpbWVQaWNrZXIgZnJvbSAnLi4vdGltZS1waWNrZXIvVGltZVBpY2tlcic7XG5pbXBvcnQgV2Vla1BpY2tlciBmcm9tICcuLi93ZWVrLXBpY2tlci9XZWVrUGlja2VyJztcbmltcG9ydCBNb250aFBpY2tlciBmcm9tICcuLi9tb250aC1waWNrZXIvTW9udGhQaWNrZXInO1xuaW1wb3J0IFllYXJQaWNrZXIgZnJvbSAnLi4veWVhci1waWNrZXIvWWVhclBpY2tlcic7XG5pbXBvcnQgT2JzZXJ2ZXJUZXh0RmllbGQgZnJvbSAnLi4vdGV4dC1maWVsZC9UZXh0RmllbGQnO1xuaW1wb3J0IHsgQ29sdW1uQWxpZ24sIENvbHVtbkxvY2ssIFRhYmxlUGFnaW5hdGlvblBvc2l0aW9uIH0gZnJvbSAnLi9lbnVtJztcbmltcG9ydCB7IEZvcm1GaWVsZFByb3BzIH0gZnJvbSAnLi4vZmllbGQvRm9ybUZpZWxkJztcbmltcG9ydCBJbnRsRmllbGQgZnJvbSAnLi4vaW50bC1maWVsZC9JbnRsRmllbGQnO1xuaW1wb3J0IFVybEZpZWxkIGZyb20gJy4uL3VybC1maWVsZC9VcmxGaWVsZCc7XG5pbXBvcnQgRW1haWxGaWVsZCBmcm9tICcuLi9lbWFpbC1maWVsZC9FbWFpbEZpZWxkJztcbmltcG9ydCBDb2xvclBpY2tlciBmcm9tICcuLi9jb2xvci1waWNrZXIvQ29sb3JQaWNrZXInO1xuaW1wb3J0IE91dHB1dCBmcm9tICcuLi9vdXRwdXQvT3V0cHV0JztcbmltcG9ydCBEYXRhU2V0IGZyb20gJy4uL2RhdGEtc2V0L0RhdGFTZXQnO1xuaW1wb3J0IFRhYmxlU3RvcmUgZnJvbSAnLi9UYWJsZVN0b3JlJztcbmltcG9ydCB7IFRhYmxlUGFnaW5hdGlvbkNvbmZpZyB9IGZyb20gJy4vVGFibGUnO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RWRpdG9yQnlGaWVsZChmaWVsZDogRmllbGQpOiBSZWFjdEVsZW1lbnQ8Rm9ybUZpZWxkUHJvcHM+IHtcbiAgY29uc3QgbG9va3VwQ29kZSA9IGZpZWxkLmdldCgnbG9va3VwQ29kZScpO1xuICBjb25zdCBsb29rdXBVcmwgPSBmaWVsZC5nZXQoJ2xvb2t1cFVybCcpO1xuICBjb25zdCBsb3ZDb2RlID0gZmllbGQuZ2V0KCdsb3ZDb2RlJyk7XG4gIGNvbnN0IG11bHRpTGluZSA9IGZpZWxkLmdldCgnbXVsdGlMaW5lJyk7XG4gIGNvbnN0IHsgdHlwZSwgbmFtZSB9ID0gZmllbGQ7XG4gIGlmIChcbiAgICBsb29rdXBDb2RlIHx8XG4gICAgaXNTdHJpbmcobG9va3VwVXJsKSB8fFxuICAgICh0eXBlICE9PSBGaWVsZFR5cGUub2JqZWN0ICYmIChsb3ZDb2RlIHx8IGZpZWxkLm9wdGlvbnMpKVxuICApIHtcbiAgICByZXR1cm4gPE9ic2VydmVyU2VsZWN0IC8+O1xuICB9XG4gIGlmIChsb3ZDb2RlKSB7XG4gICAgcmV0dXJuIDxMb3YgLz47XG4gIH1cbiAgaWYgKG11bHRpTGluZSkge1xuICAgIHJldHVybiA8T3V0cHV0IC8+O1xuICB9XG4gIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgRmllbGRUeXBlLmJvb2xlYW46XG4gICAgICByZXR1cm4gPE9ic2VydmVyQ2hlY2tCb3ggLz47XG4gICAgY2FzZSBGaWVsZFR5cGUubnVtYmVyOlxuICAgICAgcmV0dXJuIDxPYnNlcnZlck51bWJlckZpZWxkIC8+O1xuICAgIGNhc2UgRmllbGRUeXBlLmN1cnJlbmN5OlxuICAgICAgcmV0dXJuIDxDdXJyZW5jeSAvPjtcbiAgICBjYXNlIEZpZWxkVHlwZS5kYXRlOlxuICAgICAgcmV0dXJuIDxEYXRlUGlja2VyIC8+O1xuICAgIGNhc2UgRmllbGRUeXBlLmRhdGVUaW1lOlxuICAgICAgcmV0dXJuIDxEYXRlVGltZVBpY2tlciAvPjtcbiAgICBjYXNlIEZpZWxkVHlwZS50aW1lOlxuICAgICAgcmV0dXJuIDxUaW1lUGlja2VyIC8+O1xuICAgIGNhc2UgRmllbGRUeXBlLndlZWs6XG4gICAgICByZXR1cm4gPFdlZWtQaWNrZXIgLz47XG4gICAgY2FzZSBGaWVsZFR5cGUubW9udGg6XG4gICAgICByZXR1cm4gPE1vbnRoUGlja2VyIC8+O1xuICAgIGNhc2UgRmllbGRUeXBlLnllYXI6XG4gICAgICByZXR1cm4gPFllYXJQaWNrZXIgLz47XG4gICAgY2FzZSBGaWVsZFR5cGUuaW50bDpcbiAgICAgIHJldHVybiA8SW50bEZpZWxkIC8+O1xuICAgIGNhc2UgRmllbGRUeXBlLmVtYWlsOlxuICAgICAgcmV0dXJuIDxFbWFpbEZpZWxkIC8+O1xuICAgIGNhc2UgRmllbGRUeXBlLnVybDpcbiAgICAgIHJldHVybiA8VXJsRmllbGQgLz47XG4gICAgY2FzZSBGaWVsZFR5cGUuY29sb3I6XG4gICAgICByZXR1cm4gPENvbG9yUGlja2VyIC8+O1xuICAgIGNhc2UgRmllbGRUeXBlLnN0cmluZzpcbiAgICAgIHJldHVybiA8T2JzZXJ2ZXJUZXh0RmllbGQgLz47XG4gICAgZGVmYXVsdDpcbiAgICAgIHdhcm5pbmcoXG4gICAgICAgIGZhbHNlLFxuICAgICAgICBgVGFibGUgYXV0byBlZGl0b3I6IE5vIGVkaXRvciBleGlzdHMgb24gdGhlIGZpZWxkPCR7bmFtZX0+J3MgdHlwZTwke3R5cGV9Piwgc28gdXNlIHRoZSBUZXh0RmllbGQgYXMgZGVmYXVsdCBlZGl0b3JgLFxuICAgICAgKTtcbiAgICAgIHJldHVybiA8T2JzZXJ2ZXJUZXh0RmllbGQgLz47XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEFsaWduQnlGaWVsZChmaWVsZD86IEZpZWxkKTogQ29sdW1uQWxpZ24gfCB1bmRlZmluZWQge1xuICBpZiAoZmllbGQpIHtcbiAgICBjb25zdCB7IHR5cGUgfSA9IGZpZWxkO1xuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgY2FzZSBGaWVsZFR5cGUubnVtYmVyOlxuICAgICAgICByZXR1cm4gQ29sdW1uQWxpZ24ucmlnaHQ7XG4gICAgICBjYXNlIEZpZWxkVHlwZS5ib29sZWFuOlxuICAgICAgICByZXR1cm4gQ29sdW1uQWxpZ24uY2VudGVyO1xuICAgICAgZGVmYXVsdDpcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEVkaXRvckJ5Q29sdW1uQW5kUmVjb3JkKFxuICBjb2x1bW46IENvbHVtblByb3BzLFxuICByZWNvcmQ/OiBSZWNvcmQsXG4pOiBSZWFjdEVsZW1lbnQ8Rm9ybUZpZWxkUHJvcHM+IHwgdW5kZWZpbmVkIHtcbiAgY29uc3QgeyBuYW1lLCBlZGl0b3IgfSA9IGNvbHVtbjtcbiAgaWYgKHJlY29yZCkge1xuICAgIGxldCBjZWxsRWRpdG9yID0gZWRpdG9yO1xuICAgIGlmICh0eXBlb2YgZWRpdG9yID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjZWxsRWRpdG9yID0gZWRpdG9yKHJlY29yZCwgbmFtZSk7XG4gICAgfVxuICAgIGlmIChjZWxsRWRpdG9yID09PSB0cnVlKSB7XG4gICAgICBjb25zdCBmaWVsZCA9IHJlY29yZC5nZXRGaWVsZChuYW1lKTtcbiAgICAgIGlmIChmaWVsZCkge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgIWZpZWxkLmdldCgndW5pcXVlJykgfHxcbiAgICAgICAgICBmaWVsZC5nZXQoJ211bHRpcGxlJykgfHxcbiAgICAgICAgICBmaWVsZC5nZXQoJ3JhbmdlJykgfHxcbiAgICAgICAgICByZWNvcmQuc3RhdHVzID09PSBSZWNvcmRTdGF0dXMuYWRkXG4gICAgICAgICkge1xuICAgICAgICAgIHJldHVybiBnZXRFZGl0b3JCeUZpZWxkKGZpZWxkKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoaXNWYWxpZEVsZW1lbnQoY2VsbEVkaXRvcikpIHtcbiAgICAgIHJldHVybiBjZWxsRWRpdG9yO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNSYWRpbyhlbGVtZW50PzogUmVhY3RFbGVtZW50PEZvcm1GaWVsZFByb3BzPik6IGJvb2xlYW4ge1xuICBpZiAoZWxlbWVudCkge1xuICAgIHN3aXRjaCAoZWxlbWVudC50eXBlIGFzIGFueSkge1xuICAgICAgY2FzZSBPYnNlcnZlckNoZWNrQm94OlxuICAgICAgY2FzZSBPYnNlcnZlclJhZGlvOlxuICAgICAgY2FzZSBTd2l0Y2g6XG4gICAgICBjYXNlIFNlbGVjdEJveDpcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICBkZWZhdWx0OlxuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaW5kQ2VsbChcbiAgdGFibGVTdG9yZTogVGFibGVTdG9yZSxcbiAgcHJlZml4Q2xzPzogc3RyaW5nLFxuICBuYW1lPzogS2V5LFxuICBsb2NrPzogQ29sdW1uTG9jayB8IGJvb2xlYW4sXG4pOiBIVE1MVGFibGVDZWxsRWxlbWVudCB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IHsgbm9kZSwgZGF0YVNldCwgb3ZlcmZsb3dYLCBjdXJyZW50RWRpdFJlY29yZCB9ID0gdGFibGVTdG9yZTtcbiAgY29uc3QgY3VycmVudCA9IGN1cnJlbnRFZGl0UmVjb3JkIHx8IGRhdGFTZXQuY3VycmVudDtcbiAgY29uc3QgdGFibGVDZWxsUHJlZml4Q2xzID0gYCR7cHJlZml4Q2xzfS1jZWxsYDtcbiAgaWYgKG5hbWUgIT09IHVuZGVmaW5lZCAmJiBjdXJyZW50ICYmIG5vZGUuZWxlbWVudCkge1xuICAgIGNvbnN0IHdyYXBwZXJTZWxlY3RvciA9XG4gICAgICBvdmVyZmxvd1ggJiYgbG9jayA/IGAuJHtwcmVmaXhDbHN9LWZpeGVkLSR7bG9jayA9PT0gdHJ1ZSA/IENvbHVtbkxvY2subGVmdCA6IGxvY2t9IGAgOiAnJztcbiAgICBjb25zdCBzZWxlY3RvciA9IGAke3dyYXBwZXJTZWxlY3Rvcn10cltkYXRhLWluZGV4PVwiJHtjdXJyZW50LmlkfVwiXSB0ZFtkYXRhLWluZGV4PVwiJHtuYW1lfVwiXSBzcGFuLiR7dGFibGVDZWxsUHJlZml4Q2xzfS1pbm5lcmA7XG4gICAgcmV0dXJuIG5vZGUuZWxlbWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZmluZEZpcnN0Rm9jdXNhYmxlRWxlbWVudChub2RlOiBIVE1MRWxlbWVudCk6IEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkIHtcbiAgaWYgKG5vZGUuY2hpbGRyZW4pIHtcbiAgICBsZXQgZm91bmQ6IEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuICAgIFsuLi4obm9kZS5jaGlsZHJlbiBhcyBIVE1MQ29sbGVjdGlvbk9mPEhUTUxFbGVtZW50PildLnNvbWUoY2hpbGQgPT4ge1xuICAgICAgaWYgKGNoaWxkLnRhYkluZGV4ID4gLTEgJiYgY2hpbGQuZ2V0QXR0cmlidXRlKCd0eXBlJykgIT09ICdjaGVja2JveCcgJiYgY2hpbGQuZ2V0QXR0cmlidXRlKCd0eXBlJykgIT09ICdyYWRpbycpIHtcbiAgICAgICAgZm91bmQgPSBjaGlsZDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvdW5kID0gZmluZEZpcnN0Rm9jdXNhYmxlRWxlbWVudChjaGlsZCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gISFmb3VuZDtcbiAgICB9KTtcbiAgICByZXR1cm4gZm91bmQ7XG4gIH1cbn1cblxuLy8g55So5LqO5qCh6aqM5a6a5L2NIGZvY3VzIOesrOS4gOS4qumdnuazleWNleWFg+agvFxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRGaXJzdEZvY3VzYWJsZUludmFsaWRFbGVtZW50KG5vZGU6IEhUTUxFbGVtZW50KTogSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQge1xuICBpZiAobm9kZS5jaGlsZHJlbikge1xuICAgIGxldCBmb3VuZDogSFRNTEVsZW1lbnQgfCB1bmRlZmluZWQ7XG4gICAgWy4uLihub2RlLmNoaWxkcmVuIGFzIEhUTUxDb2xsZWN0aW9uT2Y8SFRNTEVsZW1lbnQ+KV0uc29tZShjaGlsZCA9PiB7XG4gICAgICBpZiAoY2hpbGQudGFiSW5kZXggPiAtMSAmJiBjaGlsZC5jbGFzc05hbWUuaW5jbHVkZXMoJ2ludmFsaWQnKSkge1xuICAgICAgICBmb3VuZCA9IGNoaWxkO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm91bmQgPSBmaW5kRmlyc3RGb2N1c2FibGVJbnZhbGlkRWxlbWVudChjaGlsZCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gISFmb3VuZDtcbiAgICB9KTtcbiAgICByZXR1cm4gZm91bmQ7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRJbmRleGVkU2libGluZyhlbGVtZW50LCBkaXJlY3Rpb24pOiBIVE1MVGFibGVSb3dFbGVtZW50IHwgbnVsbCB7XG4gIGNvbnN0IHNpYmxpbmc6IEhUTUxUYWJsZVJvd0VsZW1lbnQgfCBudWxsID1cbiAgICBkaXJlY3Rpb24gPiAwID8gZWxlbWVudC5uZXh0RWxlbWVudFNpYmxpbmcgOiBlbGVtZW50LnByZXZpb3VzRWxlbWVudFNpYmxpbmc7XG4gIGlmIChcbiAgICAhc2libGluZyB8fFxuICAgICgnaW5kZXgnIGluIHNpYmxpbmcuZGF0YXNldCAmJlxuICAgICAgIXNpYmxpbmcuZ2V0QXR0cmlidXRlTm9kZU5TKCcnLCAnZGlzYWJsZWQnKSAmJlxuICAgICAgKCFkb2N1bWVudC5kZWZhdWx0VmlldyB8fCBkb2N1bWVudC5kZWZhdWx0Vmlldy5nZXRDb21wdXRlZFN0eWxlKHNpYmxpbmcpLmRpc3BsYXkgIT09ICdub25lJykpXG4gICkge1xuICAgIHJldHVybiBzaWJsaW5nO1xuICB9XG4gIHJldHVybiBmaW5kSW5kZXhlZFNpYmxpbmcoc2libGluZywgZGlyZWN0aW9uKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRGlzYWJsZWRSb3cocmVjb3JkOiBSZWNvcmQpIHtcbiAgcmV0dXJuIHJlY29yZC5pc0NhY2hlZCB8fCByZWNvcmQuc3RhdHVzID09PSBSZWNvcmRTdGF0dXMuZGVsZXRlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNTZWxlY3RlZFJvdyhyZWNvcmQ6IFJlY29yZCkge1xuICByZXR1cm4gcmVjb3JkLmlzU2VsZWN0ZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRIZWFkZXIoY29sdW1uOiBDb2x1bW5Qcm9wcywgZGF0YVNldDogRGF0YVNldCk6IFJlYWN0Tm9kZSB7XG4gIGNvbnN0IHsgaGVhZGVyLCBuYW1lIH0gPSBjb2x1bW47XG4gIGlmICh0eXBlb2YgaGVhZGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGhlYWRlcihkYXRhU2V0LCBuYW1lKTtcbiAgfVxuICBpZiAoaGVhZGVyICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gaGVhZGVyO1xuICB9XG4gIGNvbnN0IGZpZWxkID0gZGF0YVNldC5nZXRGaWVsZChuYW1lKTtcbiAgaWYgKGZpZWxkKSB7XG4gICAgcmV0dXJuIGZpZWxkLmdldCgnbGFiZWwnKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29sdW1uS2V5KHsgbmFtZSwga2V5IH06IENvbHVtblByb3BzKTogS2V5IHtcbiAgcmV0dXJuIGtleSB8fCBuYW1lITtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFBhZ2luYXRpb25Qb3NpdGlvbihwYWdpbmF0aW9uPzogVGFibGVQYWdpbmF0aW9uQ29uZmlnKTogVGFibGVQYWdpbmF0aW9uUG9zaXRpb24ge1xuICBpZiAocGFnaW5hdGlvbikge1xuICAgIGNvbnN0IHsgcG9zaXRpb24gfSA9IHBhZ2luYXRpb247XG4gICAgaWYgKHBvc2l0aW9uKSB7XG4gICAgICByZXR1cm4gcG9zaXRpb247XG4gICAgfVxuICB9XG4gIHJldHVybiBUYWJsZVBhZ2luYXRpb25Qb3NpdGlvbi5ib3R0b207XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRIZWlnaHQoZWw6IEhUTUxFbGVtZW50KSB7XG4gIHJldHVybiBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQ7XG59XG5cbi8qKlxuICog5ZCI5bm25oyH5a6a55qE5a+56LGh5Y+C5pWwXG4gKiBAcGFyYW0ga2V5cyDpnIDopoHlkIjlubbnmoTlhbPplK7lrZdcbiAqIEBwYXJhbSBuZXdPYmog5Lyg5YWl55qE5paw5a+56LGhXG4gKiBAcGFyYW0gb2xkT2JqIOi/lOWbnueahOaXp+WvueixoVxuICovXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VPYmplY3Qoa2V5czogc3RyaW5nW10sIG5ld09iajogb2JqZWN0LCBvbGRPYmo6IG9iamVjdCkge1xuICBsZXQgbWVyZ2VkT2JqID0gb2xkT2JqO1xuICBpZiAoa2V5cy5sZW5ndGggPiAwKSB7XG4gICAga2V5cy5mb3JFYWNoKGtleSA9PiB7XG4gICAgICBpZiAoa2V5IGluIG5ld09iaikge1xuICAgICAgICBvbGRPYmpba2V5XSA9IG5ld09ialtrZXldO1xuICAgICAgICBtZXJnZWRPYmogPSB7IC4uLm9sZE9iaiB9O1xuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIHJldHVybiBtZXJnZWRPYmo7XG59XG5cbi8qKlxuICog5pu05YW35piv5ZCm5pivcmVhY3ToioLngrnnlJ/miJDlr7nosaHov5Tlm57kuI3lkIzlgLxcbiAqIEBwYXJhbSBrZXkg6L+U5Zue55qE5bGe5oCnXG4gKiBAcGFyYW0gY29sdW1uIOWPr+iDveaYr3JlYWN0bm9kZSDkuZ/lj6/og73mmK9jb2x1bXByb3BzIOWvueixoVxuICovXG5mdW5jdGlvbiBnZXRDb2x1bW5DaGlsZHJlblZhbHVlKGtleTogc3RyaW5nLCBjb2x1bW46IENvbHVtblByb3BzIHwgUmVhY3RFbGVtZW50KTogc3RyaW5nIHtcbiAgaWYgKFJlYWN0LmlzVmFsaWRFbGVtZW50KGNvbHVtbikpIHtcbiAgICByZXR1cm4gY29sdW1uLnByb3BzW2tleV07XG4gIH1cbiAgcmV0dXJuIGNvbHVtbltrZXldO1xufVxuXG4vKipcbiAqIOWmguaenOaJvuS4jeWIsOe7mWpz5pyA5aSn5YC8OTAwNzE5OTI1NDc0MDk5MVxuICovXG5leHBvcnQgZnVuY3Rpb24gY2hhbmdlSW5kZXhPZihhcnJheTogc3RyaW5nW10sIHZhbHVlOiBzdHJpbmcpOiBudW1iZXIge1xuICBpZiAoYXJyYXkuaW5kZXhPZih2YWx1ZSkgPT09IC0xKSB7XG4gICAgcmV0dXJuIDkwMDcxOTkyNTQ3NDA5OTE7XG4gIH1cbiAgcmV0dXJuIGFycmF5LmluZGV4T2YodmFsdWUpO1xufVxuXG4vKipcbiAqIOWunueOsOmmluasoei/m+WFpeWwseW8gOWni+aOkuW6j1xuICogQHBhcmFtIG5ld0NvbHVtbnMg6ZyA6KaB6L+Z5qC35o6S5bqP5Lul5Y+K5ZCI5bm25Y+C5pWw55qE5YiX6KGoXG4gKiBAcGFyYW0gb3JpZ2luYWxDb2x1bW5zIOWOn+Wni+WIl+ihqFxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVvcmRlcmluZ0NvbHVtbnMobmV3Q29sdW1uczogQ29sdW1uUHJvcHNbXSwgb3JpZ2luYWxDb2x1bW5zOiBDb2x1bW5Qcm9wc1tdKSB7XG4gIGlmIChuZXdDb2x1bW5zICYmIG5ld0NvbHVtbnMubGVuZ3RoID4gMCAmJiBvcmlnaW5hbENvbHVtbnMubGVuZ3RoID4gMCkge1xuICAgIC8vIOaaguaXtuWumuaAp+S4uuWvueWtmOWcqG5hbWXnmoTov5vooYzmjpLluo9cbiAgICBjb25zdCBuYW1lQ29sdW1ucyA9IG9yaWdpbmFsQ29sdW1ucy5maWx0ZXIoY29sdW1uSXRlbSA9PiBnZXRDb2x1bW5DaGlsZHJlblZhbHVlKCduYW1lJywgY29sdW1uSXRlbSkpO1xuICAgIGNvbnN0IG5vTmFtZUNvbHVtbnMgPSBvcmlnaW5hbENvbHVtbnMuZmlsdGVyKGNvbHVtbkl0ZW0gPT4gIWdldENvbHVtbkNoaWxkcmVuVmFsdWUoJ25hbWUnLCBjb2x1bW5JdGVtKSk7XG4gICAgaWYgKG5hbWVDb2x1bW5zICYmIG5ld0NvbHVtbnMgJiYgbmFtZUNvbHVtbnMubGVuZ3RoID4gMCAmJiBuZXdDb2x1bW5zLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IG5ld0NvbHVtbnNTdHIgPSBuZXdDb2x1bW5zLm1hcChmdW5jdGlvbihvYmopIHtcbiAgICAgICAgcmV0dXJuIGdldENvbHVtbkNoaWxkcmVuVmFsdWUoJ25hbWUnLCBvYmopO1xuICAgICAgfSkuam9pbignLCcpO1xuICAgICAgY29uc3QgbmV3Q29sdW1uc05hbWVBcnJheSA9IG5ld0NvbHVtbnNTdHIuc3BsaXQoJywnKTtcbiAgICAgIGlmIChuZXdDb2x1bW5zTmFtZUFycmF5Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgbmFtZUNvbHVtbnMuc29ydCgocHJldiwgbmV4dCkgPT4ge1xuICAgICAgICAgIGlmIChnZXRDb2x1bW5DaGlsZHJlblZhbHVlKCduYW1lJywgcHJldikgJiYgZ2V0Q29sdW1uQ2hpbGRyZW5WYWx1ZSgnbmFtZScsIG5leHQpKSB7XG4gICAgICAgICAgICByZXR1cm4gY2hhbmdlSW5kZXhPZihuZXdDb2x1bW5zTmFtZUFycmF5LCBnZXRDb2x1bW5DaGlsZHJlblZhbHVlKCduYW1lJywgcHJldikpIC0gY2hhbmdlSW5kZXhPZihuZXdDb2x1bW5zTmFtZUFycmF5LCBnZXRDb2x1bW5DaGlsZHJlblZhbHVlKCduYW1lJywgbmV4dCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBbLi4ubmFtZUNvbHVtbnMsIC4uLm5vTmFtZUNvbHVtbnNdO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gb3JpZ2luYWxDb2x1bW5zO1xufVxuXG5cbiJdLCJ2ZXJzaW9uIjozfQ==