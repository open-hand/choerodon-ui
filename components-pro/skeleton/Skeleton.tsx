import C7nSkeleton,{SkeletonProps as C7nSkeletonProps} from 'choerodon-ui/lib/skeleton';
import { observer } from 'mobx-react';
import React from 'react';
import omit from 'lodash/omit';
import { DataSetStatus } from '../data-set/enum';
import DataSetComponent,{ DataSetComponentProps } from '../data-set/DataSetComponent';
import SkeletonButton from './Button'
import SkeletonInput from './Input';
import Avatar from './Avatar';

export interface SkeletonProps extends DataSetComponentProps,Omit<C7nSkeletonProps,'title'>{
    skeletonTitile?:boolean,
}


@observer
export default class Skeleton extends DataSetComponent<SkeletonProps>{
    static displayName = 'Skeletions'

    static Button = SkeletonButton

    static Input = SkeletonInput

    static Avatar = Avatar

    static defaultProps:Partial<SkeletonProps> = {
        skeletonTitile:true,
    }

    getOtherProps() {
        const otherProps = omit(super.getOtherProps(), [
          'skeletonTitile',
        ]);
        return otherProps;
    }

    render(){
        const { dataSet,skeletonTitile, ...otherProps } = this.props;
        const props:C7nSkeletonProps = {
            title:skeletonTitile,
        }  
        const omitProps = omit(otherProps,'title')
        
        if (dataSet) {
            // @ts-ignore
            props.loading = dataSet.status !== DataSetStatus.ready;
        }
        
        return <C7nSkeleton {...omitProps} {...props} />;
    }
}



