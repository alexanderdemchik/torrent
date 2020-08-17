export class TimeoutError extends Error {}

export async function timeout(action: Promise<any>, timeout: number): Promise<any> {
  return new Promise(async (resolve, reject) => {
    let timer;

    timer = setTimeout(() => {
      reject(new TimeoutError());
    }, timeout);

    try {
      const result = await action;
      clearTimeout(timer);
      resolve(result);
    } catch (err) {
      clearTimeout(timer);
      reject(err);
    }
  });
}