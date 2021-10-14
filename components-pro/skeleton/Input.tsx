import React from 'react';
import {observer} from 'mobx-react';
import C7nSkeletonInput,{SkeletonInputProps as C7nSkeletonInpputProps } from 'choerodon-ui/lib/skeleton/Input'
import DataSetComponent, {DataSetComponentProps} from '../data-set/DataSetComponent';

export interface SkeletonInputProps extends DataSetComponentProps, Omit<C7nSkeletonInpputProps,'size'>{}

@observer
export default class SkeletonInput extends DataSetComponent<SkeletonInputProps> {
   static displayName = 'SkeletonInput'

   render(){
     const {...otherProps} = this.props

     const props: SkeletonInputProps = {}

     return <C7nSkeletonInput {...otherProps} {...props}/>
   }
}