export function getQuickViewPrice(basePrice: string, selectedPrice?: number | null): number {
  return selectedPrice ?? parseFloat(basePrice);
}

export function needsQuickViewSizeSelection(
  sizes: { label: string; price: number }[],
  selectedSize?: string | null
): boolean {
  return sizes.length > 0 && !selectedSize;
}
