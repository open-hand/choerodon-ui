import { observable } from 'mobx';

export default class LookupCache {
  @observable items?: object[];

  @observable promise?: Promise<object[]> | undefined;
}
