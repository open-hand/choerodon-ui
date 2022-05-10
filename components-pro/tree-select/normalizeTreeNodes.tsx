import { Children, isValidElement, ReactNode } from 'react';
import DataSet from '../data-set/DataSet';
import { DataSetSelection, FieldType } from '../data-set/enum';
import { FieldProps } from '../data-set/Field';
import TreeNode, { TreeNodeProps } from './TreeNode';

function getOptionsFromChildren(
  elements: ReactNode[],
  data: object[],
  fields: FieldProps[],
  textField: string,
  valueField: string,
  parentField: string,
  idField: string,
  disabledField: string,
  parent?: any,
) {
  if (elements) {
    Children.forEach(elements, child => {
      if (isValidElement(child)) {
        const { type } = child;
        if ((type as typeof TreeNode).__PRO_TREE_SELECT_NODE) {
          const props = child.props as TreeNodeProps & { children };
          const { value, title, children, disabled, ...__treeNodeProps } = props;
          data.push(
            {
              [textField]: title,
              [valueField]: value,
              [disabledField]: disabled,
              [parentField]: parent,
              __treeNodeProps,
            },
          );
          if (idField !== valueField) {
            data[idField] = props[idField] || value;
          }
          getOptionsFromChildren(
            children,
            data,
            fields,
            textField,
            valueField,
            parentField,
            idField,
            disabledField,
            props[idField] || value,
          );
        }
      }
    });
  }
}

export default function normalizeTreeNodes({
  textField,
  valueField,
  disabledField,
  parentField,
  idField,
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
    getOptionsFromChildren(children, data, fields, textField, valueField, parentField, idField, disabledField);
  }
  return new DataSet({
    data,
    fields,
    paging: false,
    selection: multiple ? DataSetSelection.multiple : DataSetSelection.single,
    autoLocateFirst: false,
    parentField,
    idField,
  }, { getConfig });
}
