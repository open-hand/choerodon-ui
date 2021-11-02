import { action, observable, runInAction } from 'mobx';

class CountDown {
  @observable count: number;

  startTime: number;

  constructor() {
    runInAction(() => {
      this.count = 0;
    });
  }

  @action
  setCount() {
    // 计算时间差
    const millis = Date.now() - this.startTime;
    this.count = 60 - Math.floor(millis / 1000);
  }

  start() {
    this.startTime = Date.now();
    const timer = setInterval(() => {
      this.setCount();
      // 倒计时结束
      if (this.count <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  }
}
export default CountDown;
