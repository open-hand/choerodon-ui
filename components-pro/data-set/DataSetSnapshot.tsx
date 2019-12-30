import DataSet, { DataSetChildren } from './DataSet';
import Record from './Record';
import { DataToJSON } from './enum';

export default class DataSetSnapshot {
  records: Record[];

  current?: Record;

  events?: { [eventName: string]: [Function, boolean][] };

  originalData: Record[];

  cachedSelected: Record[];

  totalCount: number;

  currentPage: number;

  pageSize: number;

  dataToJSON: DataToJSON;

  children: DataSetChildren;

  constructor({
    records,
    originalData,
    totalCount,
    currentPage,
    pageSize,
    cachedSelected,
    dataToJSON,
    children,
    current,
    events,
  }: DataSet) {
    this.records = records;
    this.originalData = originalData;
    this.totalCount = totalCount;
    this.currentPage = currentPage;
    this.pageSize = pageSize;
    this.cachedSelected = cachedSelected;
    this.dataToJSON = dataToJSON;
    this.children = children;
    this.current = current;
    this.events = events;
  }
}
