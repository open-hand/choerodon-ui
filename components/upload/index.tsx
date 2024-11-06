import Upload from './Upload';
import Dragger from './Dragger';
import { ModalProvider } from '../../components-pro';

export { UploadProps, UploadListProps, UploadChangeParam } from './interface';
export { DraggerProps } from './Dragger';

Upload.Dragger = Dragger;
export default ModalProvider.injectModal(Upload);
