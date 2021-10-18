import lookupStore from './LookupCodeStore';
import lovStore from './LovCodeStore';
import attachmentStore from './AttachmentStore';

const stores: any = {
  LovCodeStore: lovStore,
  LookupCodeStore: lookupStore,
  AttachmentStore: attachmentStore,
};

export default stores;
