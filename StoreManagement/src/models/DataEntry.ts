export interface DataEntry<T> {
  prefix?: string;
  isTitle?: boolean;

  render(e: T): string;
}
