export interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  planet_color: string;
  planet_size: number;
  created_at: string;
}

export interface GuestbookEntryAdmin extends GuestbookEntry {
  ip_address: string | null;
  deleted_at: string | null;
}
