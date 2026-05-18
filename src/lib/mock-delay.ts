const MIN_DELAY = 300;
const MAX_DELAY = 800;
const ERROR_RATE = 0.1;

function randomDelay(): Promise<void> {
  const ms = MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withMockLatency<T>(fn: () => T): Promise<T> {
  await randomDelay();
  if (Math.random() < ERROR_RATE) {
    throw new Error("Internal Server Error (mock 500)");
  }
  return fn();
}
