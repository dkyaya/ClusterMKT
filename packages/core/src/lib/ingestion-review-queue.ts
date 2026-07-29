import type { IngestionReviewItem } from "../schemas/ingestion-review-item";

export class IngestionReviewQueue {
  readonly items: IngestionReviewItem[] = [];
  enqueue(item: IngestionReviewItem): void {
    if (!this.items.some((current) => current.reviewItemId === item.reviewItemId))
      this.items.push(item);
  }
}
