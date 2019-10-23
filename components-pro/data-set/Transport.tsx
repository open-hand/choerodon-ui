import { computed, observable, runInAction } from 'mobx';
import { AxiosRequestConfig } from 'axios';
import { getConfig } from 'choerodon-ui/lib/configure';
import DataSet from './DataSet';

function defaultAxiosAdapter(config: AxiosRequestConfig): AxiosRequestConfig {
  return config;
}

export type TransportAdapter = (config: AxiosRequestConfig, type: string) => AxiosRequestConfig;

export type TransportHook = (props: {
  data?: any;
  params?: any;
  dataSet: DataSet;
}) => AxiosRequestConfig;

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

  @computed
  get create(): TransportType | undefined {
    return this.props.create || this.globalTransport.create;
  }

  set read(read: TransportType | undefined) {
    runInAction(() => {
      this.props.read = read;
    });
  }

  @computed
  get read(): TransportType | undefined {
    return this.props.read || this.globalTransport.read || this.dataSet.queryUrl;
  }

  set update(update: TransportType | undefined) {
    runInAction(() => {
      this.props.update = update;
    });
  }

  @computed
  get update(): TransportType | undefined {
    return this.props.update || this.globalTransport.update;
  }

  set destroy(destroy: TransportType | undefined) {
    runInAction(() => {
      this.props.destroy = destroy;
    });
  }

  @computed
  get destroy(): TransportType | undefined {
    return this.props.destroy || this.globalTransport.destroy;
  }

  set validate(validate: TransportType | undefined) {
    runInAction(() => {
      this.props.validate = validate;
    });
  }

  @computed
  get validate(): TransportType | undefined {
    return this.props.validate || this.globalTransport.validate || this.dataSet.validateUrl;
  }

  set submit(submit: TransportType | undefined) {
    runInAction(() => {
      this.props.submit = submit;
    });
  }

  @computed
  get submit(): TransportType | undefined {
    return this.props.submit || this.globalTransport.submit || this.dataSet.submitUrl;
  }

  set exports(exports: TransportType | undefined) {
    runInAction(() => {
      this.props.exports = exports;
    });
  }

  @computed
  get exports(): TransportType | undefined {
    return this.props.exports || this.globalTransport.exports || this.dataSet.exportUrl;
  }

  set tls(tls: TransportType | undefined) {
    runInAction(() => {
      this.props.tls = tls;
    });
  }

  @computed
  get tls(): TransportType | undefined {
    return this.props.tls || this.globalTransport.tls || this.dataSet.tlsUrl;
  }

  set adapter(adapter: TransportAdapter) {
    runInAction(() => {
      this.props.adapter = adapter;
    });
  }

  @computed
  get adapter(): TransportAdapter {
    return this.props.adapter || this.globalTransport.adapter || defaultAxiosAdapter;
  }

  get globalTransport(): TransportProps {
    return getConfig('transport') || {};
  }

  constructor(props: TransportProps = {}, dataSet: DataSet) {
    runInAction(() => {
      this.props = props;
      this.dataSet = dataSet;
    });
  }
}
