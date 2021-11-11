import { Handler } from '../event-manager';
import DataSet, { DataSetChildren } from './DataSet';
import Record from './Record';
import { DataToJSON } from './enum';

/* istanbul ignore next */
export default class DataSetSnapshot {
  dataSet: DataSet;

  records: Record[];

  current?: Record;

  events?: { [eventName: string]: Handler[] };

  originalData: Record[];

  cachedSelected: Record[];

  cachedModified: Record[];

  totalCount: number;

  currentPage: number;

  pageSize: number;

  dataToJSON: DataToJSON;

  children: DataSetChildren;

  constructor(dataSet: DataSet) {
    this.dataSet = dataSet;
    this.records = dataSet.records;
    this.originalData = dataSet.originalData;
    this.totalCount = dataSet.totalCount;
    this.currentPage = dataSet.currentPage;
    this.pageSize = dataSet.pageSize;
    this.cachedSelected = dataSet.cachedSelected;
    this.cachedModified = dataSet.cachedModified;
    this.dataToJSON = dataSet.dataToJSON;
    this.children = dataSet.children;
    this.events = dataSet.events;
    this.current = dataSet.current;
  }
}
