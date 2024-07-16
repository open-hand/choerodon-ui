import { Children, isValidElement, ReactNode } from 'react';
import DataSet from '../data-set/DataSet';
import { DataSetSelection, FieldType } from '../data-set/enum';
import { FieldProps } from '../data-set/Field';
import OptGroup, { OptGroupProps } from './OptGroup';
import Option, { OptionProps } from './Option';
import isFragment from '../_util/isFragment';

export const OTHER_OPTION_PROPS = '__OTHER_OPTION_PROPS__';

function getOptionsFromChildren(
  elements: ReactNode[],
  data: object[],
  fields: FieldProps[],
  textField: string,
  valueField: string,
  disabledField: string,
  groups: ReactNode[] = [],
) {
  if (elements) {
    const getOption = (child) => {
      if (isFragment(child)) {
        const { children } = child.props as any;
        if (children) {
          Children.forEach(children, getOption);
        }
      } else if (isValidElement(child)) {
        const { type } = child;
        if ((type as typeof OptGroup).__PRO_OPT_GROUP) {
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
        } else if ((type as typeof Option).__PRO_OPTION) {
          const { value, children, disabled, ...rest } = child.props as OptionProps & { children };
          data.push(
            groups.reduce(
              (obj: object, group, index) => {
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
                [OTHER_OPTION_PROPS]: rest,
                [textField]: children,
                [valueField]: value === undefined && isValidElement(children) ? children : value,
                [disabledField]: disabled,
              },
            ),
          );
        }
      }
    };
    Children.forEach(elements, getOption);
  }
}

export default function normalizeOptions({
  textField,
  valueField,
  disabledField,
  multiple,
  children,
  getConfig,
}) {
  const data: object[] = [];
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

  if (children) {
    getOptionsFromChildren(children, data, fields, textField, valueField, disabledField);
  }
  return new DataSet({
    data,
    fields,
    paging: false,
    selection: multiple ? DataSetSelection.multiple : DataSetSelection.single,
    autoLocateFirst: false,
  }, { getConfig });
}
