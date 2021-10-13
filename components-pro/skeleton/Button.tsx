import * as React from 'react';
import { observer } from 'mobx-react';
import C7nSkeletonButton,{SkeletonButtonProps as C7nSkeletonBUttonProps} from 'choerodon-ui/lib/skeleton/Button';
import DataSetComponent,{DataSetComponentProps} from '../data-set/DataSetComponent';

export interface SkeletonButtonProps extends Omit<C7nSkeletonBUttonProps,'size'>,DataSetComponentProps{}

@observer
export default class SkeletonButton extends DataSetComponent<SkeletonButtonProps>{
    static dispalyName = 'SkeletonButton';

    render(){
      const {...otherProps} = this.props;

      const props: SkeletonButtonProps = {}

      return <C7nSkeletonButton {...otherProps} {...props} />
    }
}
