import DataSet from './DataSet';
import Record from './Record';
import { DataToJSON } from './enum';

export default class DataSetSnapshot {
  records: Record[];

  originalData: Record[];

  cachedSelected: Record[];

  totalCount: number;

  currentPage: number;

  pageSize: number;

  dataToJSON: DataToJSON;

  constructor({
    records,
    originalData,
    totalCount,
    currentPage,
    pageSize,
    cachedSelected,
    dataToJSON,
  }: DataSet) {
    this.records = records;
    this.originalData = originalData;
    this.totalCount = totalCount;
    this.currentPage = currentPage;
    this.pageSize = pageSize;
    this.cachedSelected = cachedSelected;
    this.dataToJSON = dataToJSON;
  }
}
