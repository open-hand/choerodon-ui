import React, { FunctionComponent } from 'react';
import { observer } from 'mobx-react-lite';
import Animate from 'choerodon-ui/lib/animate';
import Icon from 'choerodon-ui/lib/icon';
import DataSet from '../data-set/DataSet';

export interface ErrorBarProps {
  dataSet: DataSet;
  prefixCls?: string;
}

const ErrorBar: FunctionComponent<ErrorBarProps> = function ErrorBar(props) {
  const { dataSet, prefixCls } = props;
  const { validationSelfErrors: error } = dataSet;
  const errorMessage: string | undefined = error && error.length ? error[0].message : undefined;
  const saveRef = (node) => {
    if (node) {
      node.focus();
    }
  };
  return (
    <Animate
      transitionName="slide-down"
      className={`${prefixCls}-error`}
      hiddenProp="hidden"
      component="div"
    >
      {
        errorMessage && (
          <div ref={saveRef} hidden={!errorMessage} className={`${prefixCls}-error-content`} tabIndex={-1}>
            <div>
              <Icon type="cancel" />
              {errorMessage}
            </div>
            <Icon type="close" onClick={() => dataSet.clearValidationError()} />
          </div>
        )
      }
    </Animate>
  );
};

ErrorBar.displayName = 'ErrorBar';

export default observer(ErrorBar);
