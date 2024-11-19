import Attachment from './Attachment';
import Dragger from './Dragger';
import ModalProvider from '../modal-provider';

Attachment.Dragger = Dragger;

export default ModalProvider.injectModal(Attachment);
