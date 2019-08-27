import DataSet from './DataSet';
import Record from './Record';

export default class DataSetSnapshot {
  records: Record[];
  originalData: Record[];
  cachedSelected: Record[];
  totalCount: number;
  currentPage: number;
  pageSize: number;

  constructor({ records, originalData, totalCount, currentPage, pageSize, cachedSelected }: DataSet) {
    this.records = records;
    this.originalData = originalData;
    this.totalCount = totalCount;
    this.currentPage = currentPage;
    this.pageSize = pageSize;
    this.cachedSelected = cachedSelected;
  }
}
