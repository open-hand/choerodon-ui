import Mock from 'mockjs';

const dataSetAttachmentTemple = [
  {
    fileId: 1,
    fileName: 'demo1.png',
    fileType: 'image/png',
    fileSize: 300000,
    fileUrl: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    creationDate: '2021-08-16 19:19:00',
  },
  {
    fileId: 2,
    fileName: 'demo2.png',
    fileType: 'image/png',
    fileSize: 300000,
    fileUrl: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    creationDate: '2021-08-17 19:19:00',
  },
];

const dataSetAttachmentTemple2 = [
  ...dataSetAttachmentTemple,
  {
    fileId: 3,
    fileName: 'demo3.png',
    fileType: 'image/png',
    fileSize: 300000,
    fileUrl: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    creationDate: '2021-08-18 19:19:00',
  },
  {
    fileId: 4,
    fileName: 'demo4.png',
    fileType: 'image/png',
    fileSize: 300000,
    fileUrl: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    creationDate: '2021-08-19 19:19:00',
  },
  {
    fileId: 5,
    fileName: 'demo5.png',
    fileType: 'image/png',
    fileSize: 300000,
    fileUrl: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    creationDate: '2021-08-19 19:19:00',
  },
  {
    fileId: 6,
    fileName: 'demo6.png',
    fileType: 'image/png',
    fileSize: 300000,
    fileUrl: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    creationDate: '2021-08-19 19:19:00',
  },
  {
    fileId: 7,
    fileName: 'demo7.png',
    fileType: 'image/png',
    fileSize: 300000,
    fileUrl: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    creationDate: '2021-08-19 19:19:00',
  },
  {
    fileId: 8,
    fileName: 'demo8.png',
    fileType: 'image/png',
    fileSize: 300000,
    fileUrl: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    creationDate: '2021-08-19 19:19:00',
  },
  {
    fileId: 9,
    fileName: 'demo9.png',
    fileType: 'image/png',
    fileSize: 300000,
    fileUrl: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    creationDate: '2021-08-19 19:19:00',
  },
];

const dataSetAttachmentCountTemple = {
  '4c74a34a-fa37-4e92-be9d-5cf726fb1472': 2,
};

const dataSetAttachmentCountTemple2 = {
  '88888888-fa37-4e92-be9d-5cf726fb1472': 9,
};

const dataSetAttachmentCountTemple3 = {
  '4c74a34a-fa37-4e92-be9d-5cf726fb1472': 2,
  '88888888-fa37-4e92-be9d-5cf726fb1472': 9,
};

const dataSetAttachmentData = Mock.mock(dataSetAttachmentTemple);
const dataSetAttachmentData2 = Mock.mock(dataSetAttachmentTemple2);
const dataSetAttachmentCount = Mock.mock(dataSetAttachmentCountTemple);
const dataSetAttachmentCount2 = Mock.mock(dataSetAttachmentCountTemple2);
const dataSetAttachmentCount3 = Mock.mock(dataSetAttachmentCountTemple3);

const dataSetAttachmentRule = /\/attachment\/4c74a34a-fa37-4e92-be9d-5cf726fb1472/;
const dataSetAttachmentRule2 = /\/attachment\/88888888-fa37-4e92-be9d-5cf726fb1472/;
const dataSetAttachmentCountRule = /\/attachment-count\/4c74a34a-fa37-4e92-be9d-5cf726fb1472$/;
const dataSetAttachmentCountRule2 = /\/attachment-count\/88888888-fa37-4e92-be9d-5cf726fb1472$/;
const dataSetAttachmentCountRule3 = /\/attachment-count\/4c74a34a-fa37-4e92-be9d-5cf726fb1472,88888888-fa37-4e92-be9d-5cf726fb1472$/;

export default function () {
  if (typeof window !== 'undefined') {
    Mock.setup({ timeout: 0 });

    Mock.mock(dataSetAttachmentRule, dataSetAttachmentTemple);

    Mock.mock(dataSetAttachmentRule2, dataSetAttachmentTemple2);

    Mock.mock(dataSetAttachmentCountRule, dataSetAttachmentCountTemple);

    Mock.mock(dataSetAttachmentCountRule2, dataSetAttachmentCountTemple2);

    Mock.mock(dataSetAttachmentCountRule3, dataSetAttachmentCountTemple3);
  }
}

export const attachmentTempleList = [
  { rule: dataSetAttachmentRule, data: dataSetAttachmentData },
  { rule: dataSetAttachmentRule2, data: dataSetAttachmentData2 },
  { rule: dataSetAttachmentCountRule, data: dataSetAttachmentCount },
  { rule: dataSetAttachmentCountRule2, data: dataSetAttachmentCount2 },
  { rule: dataSetAttachmentCountRule3, data: dataSetAttachmentCount3 },
];
