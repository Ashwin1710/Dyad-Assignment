import { randomUUID } from 'crypto';

export function generateUniqueEmail(): string {
  return `qa.user.${Date.now()}.${randomUUID().slice(0, 6)}@example.com`;
}
