import React, { CSSProperties, FunctionComponent, useContext, useEffect, useMemo, useState } from 'react';
import ConfigContext from 'choerodon-ui/lib/config-provider/ConfigContext';
import { AttachmentValue, TemplateUrlType } from 'choerodon-ui/dataset/configure';
import isString from 'lodash/isString';
import isFunction from 'lodash/isFunction';
import isPromise from 'is-promise';
import { ButtonColor } from '../button/enum';
import Button from '../button';
import { $l } from '../locale-context';
import { ButtonProps } from '../button/interface';

export interface TemplateDownloadButtonProps extends AttachmentValue, ButtonProps {
}


const templateStyle: CSSProperties = { marginLeft: 0 };

const TemplateDownloadButton: FunctionComponent<TemplateDownloadButtonProps> = function TempalteDownloadButton(props) {
  const { attachmentUUID, bucketName, bucketDirectory, storageCode, isPublic, target, funcType, color = ButtonColor.primary } = props;
  const { getConfig } = useContext(ConfigContext);
  const { getTemplateDownloadUrl } = getConfig('attachment');
  const downloadUrl: TemplateUrlType | Promise<TemplateUrlType> = useMemo(() => getTemplateDownloadUrl ? getTemplateDownloadUrl({
    attachmentUUID,
    bucketName,
    bucketDirectory,
    storageCode,
    isPublic,
  }) : attachmentUUID, [
    getTemplateDownloadUrl, attachmentUUID, bucketName, bucketDirectory, storageCode, isPublic,
  ]);
  const [templateDownloadUrl, setTemplateDownloadUrl] = useState<TemplateUrlType | Promise<TemplateUrlType>>(() => downloadUrl);

  useEffect(() => {
    if (isPromise(downloadUrl)) {
      downloadUrl.then(url => setTemplateDownloadUrl(() => url));
    } else {
      setTemplateDownloadUrl(() => downloadUrl);
    }
  }, [downloadUrl]);

  if (templateDownloadUrl === undefined || isPromise(templateDownloadUrl)) {
    return null;
  }

  const downProps = {
    funcType,
    href: isString(templateDownloadUrl) ? templateDownloadUrl : undefined,
    onClick: isFunction(templateDownloadUrl) ? templateDownloadUrl : undefined,
    target,
    color,
    style: templateStyle,
  };
  return (
    <Button {...downProps}>({$l('Attachment', 'download_template')})</Button>
  );
};

TemplateDownloadButton.displayName = 'TemplateDownloadButton';

export default TemplateDownloadButton;
