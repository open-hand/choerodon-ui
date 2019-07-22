import React, { Component, ComponentType } from 'react';
import Spin from '../spin';
import exception from './exception';

interface AsyncComponentState {
  component?: ComponentType;
}

export type AsyncCmpLoadingFunction = () => Promise<{ default: ComponentType }>;

const asyncComponent = (importComponent: AsyncCmpLoadingFunction): any => {
  class AsyncComponent extends Component<any> {
    state: AsyncComponentState = {};

    componentDidMount() {
      importComponent().then(({ default: component }) => {
        this.setState({ component });
      }, exception);
    }

    render() {
      const { component: Cmp } = this.state;

      return Cmp
        ? <Cmp {...this.props} />
        : <Spin />;
    }

  }

  return AsyncComponent;
};

export default asyncComponent;
