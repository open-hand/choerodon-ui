const globalTimeout = global.setTimeout;

export const sleep = (timeout) => {
  return new Promise((resolve) => {
    globalTimeout(() => {
      resolve();
    }, timeout)
  });
};
