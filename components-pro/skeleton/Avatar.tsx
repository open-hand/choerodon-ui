import React from 'react';
import C7nAvatar,{AvatarProps as C7nAvatarProps} from 'choerodon-ui/lib/skeleton/Avatar';
import { observer } from 'mobx-react';
import DataSetComponent,{ DataSetComponentProps } from '../data-set/DataSetComponent';

export interface AvatarProps extends Omit<C7nAvatarProps,'size'>,DataSetComponentProps{
}

@observer
export default class Avatar extends DataSetComponent<AvatarProps>{
    static displayName = 'Avatar'
    
    render(){
      const {...otherProps} = this.props

      const props: C7nAvatarProps = {}

      return <C7nAvatar {...otherProps} {...props} />
    }
}