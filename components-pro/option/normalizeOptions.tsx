import DataSet from '../data-set/DataSet';
import { DataSetSelection, FieldType } from '../data-set/enum';
import { FieldProps } from '../data-set/Field';
import { Children, isValidElement, ReactNode } from 'react';
import OptGroup, { OptGroupProps } from './OptGroup';
import Option, { OptionProps } from './Option';
import lookupStore from '../stores/LookupCodeStore';

export default function normalizeOptions({ field, textField, valueField, multiple, children }) {
  const selectionType = multiple ? DataSetSelection.multiple : multiple === void 0 ? void 0 : DataSetSelection.single;
  let data: object[] = [];
  let fetch;
  if (field) {
    const options = field.getOptions();
    if (options) {
      if (selectionType) {
        options.selection = selectionType;
      }
      return options;
    } else {
      const lookupKey = lookupStore.getKey(field);
      if (lookupKey) {
        data = lookupStore.get(lookupKey);
        if (!data) {
          fetch = lookupStore.fetchLookupData(lookupKey);
        }
      }
    }
  }
  const fields = [{
    name: textField,
    type: FieldType.reactNode,
  }, {
    name: valueField,
  }];

  if ((!data || !data.length) && children) {
    data = [];
    getOptionsFromChildren(children, data, fields, textField, valueField);
  }
  const ds = new DataSet({
    data,
    fields,
    paging: false,
    selection: selectionType || DataSetSelection.single,
  });
  if (fetch) {
    fetch.then(values => values && ds.loadData(values));
  }
  return ds;
}

function getOptionsFromChildren
(elements: ReactNode[], data: object[], fields: FieldProps[], textField: string, valueField: string, groups: string[] = []) {
  if (elements) {
    Children.forEach(elements, (child) => {
      if (isValidElement(child)) {
        const { type } = child;
        if (type === OptGroup) {
          const props = child.props as OptGroupProps & { children };
          getOptionsFromChildren(props.children, data, fields, textField, valueField, groups.concat(props.label || ''));
        } else if (type === Option) {
          const { value, children } = child.props as OptionProps & { children };
          data.push(groups.reduce((obj, group, index) => {
            const name = `group-${index}`;
            obj[name] = group;
            if (!fields.find((field) => field.name === name)) {
              fields.push({
                name,
                type: FieldType.reactNode,
                group: groups.length - 1,
              });
            }
            return obj;
          }, {
            [textField]: children,
            [valueField]: value === void 0 ? children : value,
          }));
        }
      }
    });
  }
}
