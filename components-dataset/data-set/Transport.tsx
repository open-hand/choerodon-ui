import { observable, runInAction } from 'mobx';
import { AxiosRequestConfig } from 'axios';
import DataSet from './DataSet';

export type SubmitTypes = 'create' | 'update' | 'destroy' | 'submit';

export type TransportTypes = SubmitTypes | 'read' | 'validate' | 'tls' | 'exports';

export type TransportAdapter = (
  config: AxiosRequestConfig,
  type: TransportTypes,
) => AxiosRequestConfig;

export type TransportHookProps = {
  data?: any;
  params?: any;
  dataSet?: DataSet;
  lovQueryDetail?: boolean;
  [key: string]: any;
};

export type TransportHook = (props: TransportHookProps) => AxiosRequestConfig;

export type TransportType = AxiosRequestConfig | TransportHook | string;

export type TransportProps = {
  create?: TransportType;
  read?: TransportType;
  update?: TransportType;
  destroy?: TransportType;
  validate?: TransportType;
  submit?: TransportType;
  tls?: TransportType;
  exports?: TransportType;
  adapter?: TransportAdapter;
};

export default class Transport {
  @observable props: TransportProps;

  dataSet: DataSet;

  set create(create: TransportType | undefined) {
    runInAction(() => {
      this.props.create = create;
    });
  }

  get create(): TransportType | undefined {
    return this.props.create;
  }

  set read(read: TransportType | undefined) {
    runInAction(() => {
      this.props.read = read;
    });
  }

  get read(): TransportType | undefined {
    return this.props.read || this.dataSet.queryUrl;
  }

  set update(update: TransportType | undefined) {
    runInAction(() => {
      this.props.update = update;
    });
  }

  get update(): TransportType | undefined {
    return this.props.update;
  }

  set destroy(destroy: TransportType | undefined) {
    runInAction(() => {
      this.props.destroy = destroy;
    });
  }

  get destroy(): TransportType | undefined {
    return this.props.destroy;
  }

  set validate(validate: TransportType | undefined) {
    runInAction(() => {
      this.props.validate = validate;
    });
  }

  get validate(): TransportType | undefined {
    return this.props.validate || this.dataSet.validateUrl;
  }

  set submit(submit: TransportType | undefined) {
    runInAction(() => {
      this.props.submit = submit;
    });
  }

  get submit(): TransportType | undefined {
    return this.props.submit || this.dataSet.submitUrl;
  }

  set exports(exports: TransportType | undefined) {
    runInAction(() => {
      this.props.exports = exports;
    });
  }

  get exports(): TransportType | undefined {
    return this.props.exports || this.dataSet.exportUrl;
  }

  set tls(tls: TransportType | undefined) {
    runInAction(() => {
      this.props.tls = tls;
    });
  }

  get tls(): TransportType | undefined {
    return this.props.tls || this.dataSet.tlsUrl;
  }

  set adapter(adapter: TransportAdapter | undefined) {
    runInAction(() => {
      this.props.adapter = adapter;
    });
  }

  get adapter(): TransportAdapter | undefined {
    return this.props.adapter;
  }

  constructor(props: TransportProps = {}, dataSet: DataSet) {
    runInAction(() => {
      this.props = props;
      this.dataSet = dataSet;
    });
  }
}
