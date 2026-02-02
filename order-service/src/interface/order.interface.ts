import { UUID } from 'crypto';

export interface Order {
  id: bigint;
  user_id: UUID;
  status: 'PENDING' | 'SHIPPED' | 'DELIVERED';
  total: number;
  created_at: string;
  updated_at: string;
}
