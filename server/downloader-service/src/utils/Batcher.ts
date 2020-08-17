export class Batcher {
  private timeout?: NodeJS.Timeout;
  private queue: Array<any> = [];

  batch(obj: any, time: number, cb: any) {
    this.queue.push(obj);
    if (!this.timeout) {
      this.timeout = setTimeout(() => {
        cb(this.queue);
        this.queue = [];
        this.timeout = undefined;
      }, time);
    }
  }
}
