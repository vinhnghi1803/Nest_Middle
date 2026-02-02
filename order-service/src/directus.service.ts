// directus.service.ts
import { Injectable } from '@nestjs/common';
import { createDirectus, staticToken, rest, readItems } from '@directus/sdk';

@Injectable()
export class DirectusService {
  private readonly directus = createDirectus(
    process.env.DIRECTUS_URL || 'http://localhost:8055',
  )
    .with(staticToken(process.env.DIRECTUS_STATIC_TOKEN!))
    .with(rest());

  async getOrders() {
    return await this.directus.request(readItems('Order'));
  }
}
