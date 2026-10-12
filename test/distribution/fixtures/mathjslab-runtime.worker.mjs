import { parentPort } from 'node:worker_threads';
import { RuntimeWorkerServer } from 'mathjslab/runtime';

const listeners = new Map();
new RuntimeWorkerServer({
  postMessage: (message, transfer) => parentPort.postMessage(message, transfer),
  addEventListener(_type, listener) {
    const receive = (data) => listener({ data });
    listeners.set(listener, receive);
    parentPort.on('message', receive);
  },
  removeEventListener(_type, listener) {
    parentPort.off('message', listeners.get(listener));
    listeners.delete(listener);
  },
});
