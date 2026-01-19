export class CallQueue {
  private queue: string[] = [];

  enqueue(callId: string): void {
    this.queue.push(callId);
  }

  dequeue(): string | undefined {
    return this.queue.shift();
  }

  length(): number {
    return this.queue.length;
  }

  isEmpty(): boolean {
    return this.queue.length === 0;
  }
}