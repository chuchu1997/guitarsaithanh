let shouldStop = false;

export function setStopSeeding(value: boolean) {
  shouldStop = value;
}

export function getStopSeeding(): boolean {
  return shouldStop;
}