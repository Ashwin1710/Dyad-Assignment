/** Converts display text such as "1,234.50" or "$10.00" into integer cents (avoids float errors). */
export function parseToCents(displayedPrice: string): number {
  const cleaned = displayedPrice.replace(/[^0-9.]/g, '');
  if (!cleaned) {
    throw new Error(`No numeric value in price text: '${displayedPrice}'`);
  }
  return Math.round(parseFloat(cleaned) * 100);
}

export function formatCents(cents: number): string {
  return (cents / 100).toFixed(2);
}
