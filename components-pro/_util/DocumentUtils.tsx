import { Util } from 'choerodon-ui/shared';

export { MousePosition } from 'choerodon-ui/shared/util';

const getDocument: typeof Util.getDocument = Util.getDocument;
const getDocuments: typeof Util.getDocuments = Util.getDocuments;
const findIFrame: typeof Util.findIFrame = Util.findIFrame;
const getMousePosition: typeof Util.getMousePosition = Util.getMousePosition;
const transformZoomData: typeof Util.transformZoomData = Util.transformZoomData;

export {
  getDocument,
  getDocuments,
  findIFrame,
  getMousePosition,
  transformZoomData,
};
