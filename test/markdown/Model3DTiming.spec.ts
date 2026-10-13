/// <reference types="jest" />
import { jest } from '@jest/globals';
import { Timer } from 'three';

it('keeps animation deltas stable and excludes offscreen and hidden time', () => {
  let now = 0;
  const performanceNow = jest.spyOn(performance, 'now').mockImplementation(() => now);
  const hidden = jest.spyOn(document, 'hidden', 'get').mockReturnValue(false);
  const timer = new Timer();
  timer.connect(document);
  timer.reset();
  now = 16;
  timer.update();
  expect(timer.getDelta()).toBeCloseTo(0.016);
  expect(timer.getDelta()).toBeCloseTo(0.016);
  now = 10_000;
  timer.reset();
  now = 10_016;
  timer.update();
  expect(timer.getDelta()).toBeCloseTo(0.016);
  hidden.mockReturnValue(true);
  now = 20_000;
  timer.update();
  expect(timer.getDelta()).toBe(0);
  hidden.mockReturnValue(false);
  document.dispatchEvent(new Event('visibilitychange'));
  now = 20_016;
  timer.update();
  expect(timer.getDelta()).toBeCloseTo(0.016);
  timer.dispose();
  hidden.mockRestore();
  performanceNow.mockRestore();
});
