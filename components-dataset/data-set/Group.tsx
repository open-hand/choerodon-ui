import Record from './Record';
import { iteratorReduce } from '../../dataset/iterator-helper';

export default class Group {

  name: string | symbol;

  value: any;

  records: Record[];

  totalRecords: Record[];

  subGroups: Group[];

  subHGroups?: Set<Group>;

  parent?: Group | undefined;

  get rowSpan(): number {
    const { subGroups, subHGroups } = this;
    if (subHGroups) {
      return iteratorReduce(subHGroups.values(), (rowSpan, group) => Math.max(rowSpan, group.records.length), 0);
    }
    return subGroups.reduce((rowSpan, group) => rowSpan + (group.subGroups.length ? group.rowSpan : 0) + group.records.length, 0);
  }

  constructor(name: string | symbol, value?: any, parent?: Group) {
    this.name = name;
    this.value = value;
    this.parent = parent;
    this.records = [];
    this.totalRecords = [];
    this.subGroups = [];
  }
}
