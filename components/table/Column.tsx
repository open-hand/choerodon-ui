import { Component, ComponentState } from 'react';
import { ColumnProps } from './interface';

/* eslint-disable react/prefer-stateless-function */
export default class Column<T> extends Component<ColumnProps<T>, ComponentState> {}
