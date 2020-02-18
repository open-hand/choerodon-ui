import moment from 'moment';
import MockDate from 'mockdate';
import mock from 'xhr-mock';
import { mockTempleList } from '../site/theme/mock';

export function setup() {
  mock.setup();
  if (mockTempleList.length >= 1) {
    // eslint-disable-next-line array-callback-return
    mockTempleList.map(item => {
      const { rule, data } = item;
      mock.post(rule, {
        status: 201,
        body: JSON.stringify(data),
      });
    });
  }
}

export const teardown = mock.teardown.bind(mock);

export function setMockDate(dateString = '2017-09-18T03:30:07.795') {
  MockDate.set(moment(dateString));
}

export function resetMockDate() {
  MockDate.reset();
}

export const sleep = (timeout = 0) => new Promise(resolve => setTimeout(resolve, timeout));
