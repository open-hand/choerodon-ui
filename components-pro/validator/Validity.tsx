import { action, computed, observable } from 'mobx';

export default class Validity {
  @observable badInput: boolean;
  @observable customError: boolean;
  @observable patternMismatch: boolean;
  @observable rangeOverflow: boolean;
  @observable rangeUnderflow: boolean;
  @observable stepMismatch: boolean;
  @observable tooLong: boolean;
  @observable tooShort: boolean;
  @observable typeMismatch: boolean;
  @observable valueMissing: boolean;
  @observable uniqueError: boolean;

  @computed
  get valid(): boolean {
    return Object.keys(this).filter(key => key !== 'valid').every(key => !this[key]);
  }

  constructor() {
    this.init();
  }

  reset() {
    this.init();
  }

  @action
  init() {
    this.badInput = false;
    this.customError = false;
    this.patternMismatch = false;
    this.rangeOverflow = false;
    this.rangeUnderflow = false;
    this.stepMismatch = false;
    this.tooLong = false;
    this.tooShort = false;
    this.typeMismatch = false;
    this.valueMissing = false;
    this.uniqueError = false;
  }
}
