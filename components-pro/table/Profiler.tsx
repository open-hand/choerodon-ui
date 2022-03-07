import { PureComponent, ReactNode } from 'react';
import TableContext, { TableContextValue } from './TableContext';
import { DataSetStatus } from '../data-set/enum';

export interface ProfilerProps {
  children?: ReactNode;
}

export default class Profiler extends PureComponent<ProfilerProps> {
  static displayName = 'Profiler';

  static get contextType(): typeof TableContext {
    return TableContext;
  }

  context: TableContextValue;

  constructor(props, context) {
    super(props, context);
    const { tableStore, dataSet } = context;
    if (tableStore.performanceEnabled) {
      if (dataSet.status === DataSetStatus.ready && dataSet.length) {
        tableStore.performanceOn = true;
        tableStore.timing.renderStart = Date.now();
      }
    }
  }

  componentWillUpdate(): void {
    const { tableStore } = this.context;
    if (tableStore.performanceEnabled && tableStore.performanceOn) {
      tableStore.timing.renderStart = Date.now();
    }
  }

  componentDidMount() {
    this.handlePerformance();
  }

  componentDidUpdate() {
    this.handlePerformance();
  }

  handlePerformance() {
    const { code, tableStore, dataSet } = this.context;
    if (tableStore.performanceEnabled && tableStore.performanceOn) {
      const { timing } = tableStore;
      const { performance } = dataSet;
      const onPerformance = tableStore.getConfig('onPerformance');
      timing.renderEnd = Date.now();
      onPerformance('Table', {
        name: code,
        url: performance.url,
        size: dataSet.length,
        timing: {
          ...performance.timing,
          ...timing,
        },
      });
      tableStore.performanceOn = false;
    }
  }

  render() {
    const { children } = this.props;
    return children;
  }
}
