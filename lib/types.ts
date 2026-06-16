export interface Place {
  id: number;
  created_at: string;
  name: string;
  address: string;
  max_capacity: number;
}

export interface Event {
  id: number;
  created_at: string;
  oragnizer: string;
  title: string;
  start_time: string;
  open: boolean;
  place_id: number;
  place?: Place;
}

export interface TicketTier {
  id: number;
  created_at: string;
  name: string;
  price: number;
  total_inventory: number;
  event_id: number;
}

export interface Command {
  id: number;
  created_at: string;
  user_id: string;
  total_amount: number;
  status: string;
}

export interface Ticket {
  id: number;
  created_at: string;
  tier_id: number;
  order_id: number;
  seat_number: number;
  seat_row: string;
  qr_code: string;
}

export interface Profile {
  id: string;
  email: string;
  role: 'user' | 'admin' | 'organisation';
  is_banned: boolean;
  banned_until: string | null;
  created_at: string;
  name: string | null;
  first_name: string | null;
}
