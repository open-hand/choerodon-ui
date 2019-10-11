import { Children, isValidElement, ReactNode } from 'react';
import DataSet from '../data-set/DataSet';
import { DataSetSelection, FieldType } from '../data-set/enum';
import { FieldProps } from '../data-set/Field';
import OptGroup, { OptGroupProps } from './OptGroup';
import Option, { OptionProps } from './Option';
import lookupStore from '../stores/LookupCodeStore';

function getOptionsFromChildren(
  elements: ReactNode[],
  data: object[],
  fields: FieldProps[],
  textField: string,
  valueField: string,
  disabledField: string,
  groups: string[] = [],
) {
  if (elements) {
    Children.forEach(elements, child => {
      if (isValidElement(child)) {
        const { type } = child;
        if (type === OptGroup) {
          const props = child.props as OptGroupProps & { children };
          getOptionsFromChildren(
            props.children,
            data,
            fields,
            textField,
            valueField,
            disabledField,
            groups.concat(props.label || ''),
          );
        } else if (type === Option) {
          const { value, children, disabled } = child.props as OptionProps & { children };
          data.push(
            groups.reduce(
              (obj, group, index) => {
                const name = `group-${index}`;
                obj[name] = group;
                if (!fields.find(field => field.name === name)) {
                  fields.push({
                    name,
                    type: FieldType.reactNode,
                    group: groups.length - 1,
                  });
                }
                return obj;
              },
              {
                [textField]: children,
                [valueField]: value === undefined && isValidElement(children) ? children : value,
                [disabledField]: disabled,
              },
            ),
          );
        }
      }
    });
  }
}

export default function normalizeOptions({
  field,
  textField,
  valueField,
  disabledField,
  multiple,
  children,
}) {
  const selectionType = multiple
    ? DataSetSelection.multiple
    : multiple === undefined
    ? undefined
    : DataSetSelection.single;
  let data: object[] | undefined = [];
  let fetch;
  if (field) {
    const options = field.getOptions();
    if (options) {
      return options;
    }
    const axiosConfig = lookupStore.getAxiosConfig(field);
    const lookupKey = lookupStore.getKey(axiosConfig);
    if (lookupKey) {
      data = lookupStore.get(lookupKey);
      if (!data) {
        // fix mobx computed value issue
        fetch = new Promise(resolve => setTimeout(() => resolve(field.fetchLookup()), 0));
      }
    }
  }
  const fields = [
    {
      name: textField,
      type: FieldType.reactNode,
    },
    {
      name: valueField,
    },
    {
      name: disabledField,
      type: FieldType.boolean,
    },
  ];

  if ((!data || !data.length) && children) {
    data = [];
    getOptionsFromChildren(children, data, fields, textField, valueField, disabledField);
  }
  const ds = new DataSet({
    data,
    fields,
    paging: false,
    selection: selectionType || DataSetSelection.single,
    autoLocateFirst: false,
  });
  if (fetch) {
    fetch.then(values => values && ds.loadData(values));
  }
  return ds;
}
