import ModalProvider from 'choerodon-ui/pro/lib/modal-provider';
import Upload from './Upload';
import Dragger from './Dragger';

export { UploadProps, UploadListProps, UploadChangeParam } from './interface';
export { DraggerProps } from './Dragger';

Upload.Dragger = Dragger;
export default ModalProvider.injectModal(Upload);
