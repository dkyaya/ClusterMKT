import type { DeadLetterItem } from "../schemas/dead-letter-item";

export class DeadLetterQueue {
  readonly items: DeadLetterItem[] = [];
  enqueue(item: DeadLetterItem): void {
    if (!this.items.some((current) => current.deadLetterId === item.deadLetterId))
      this.items.push(item);
  }
}
