/**
 * Application user persisted after successful Diia identity confirmation.
 */
export interface User {
  id: string;
  diia_id: string;
  full_name: string;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}
