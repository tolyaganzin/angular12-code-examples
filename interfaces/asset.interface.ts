import { IFilterConfig } from "./filter-config.interface";
import { Tag } from './favorite.interface';

export interface IAsset {
  is_partial_available?: boolean;
  days_available?:string[];
  bookings?: {booking_id: number, invites_count: number}[];
  days_not_available?:string[];
  booking_id: number;
  asset_id: number;
  id: number;
  icon: string;
  checked_in: boolean;
  required_check_in: boolean;
  name: string;
  status: "to assign" | "confirmed" | "to confirm" | number;
  from: string;
  to: string;
  subject: string;
  time_range: string;
  wing_name: string;
  neighborhoodName: string;
  isSelected: boolean;
  wing_id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  owner_id: number;
  capacity: number;
  level: number;
  device_id: number;
  internal: boolean;
  reservation_info_index: number;
  email: string;
  created_at: string;
  updated_at: string;
  requires_check_in: boolean;
  deleted_at: any;
  all_amenities: string;
  images: string;
  has_lock_reservation: boolean;
  type: number;
  rotation: number;
  border_radius: number;
  is_active: boolean;
  approver_mails: string;
  is_zone: boolean;
  zoning: string;
  neighbourhood_id: number;
  owner_name: string;
  neighbourhood_name: string;
  is_favourite: boolean;
  is_blocked: boolean;
  has_requested_amenities: boolean;
  fullname: string;
  easy_status: string;
  why: string;
  is_bookable: boolean;
  is_occupied: boolean;
  site_name: string;
  site_id: number;
  site_type_icon: any;
  resource_type: string;
  free_time_slots: FreeTimeSlot[];
  missing_amenities: string[];
  display_image: string;
  neighbourhood: INeighbourhod;
  colleague_info: IColleagueInfo[];
  filter: IFilterConfig;
  invite_count: number;
  user_is_favourite: boolean;
  user: { email: string; image: string; is_favourite: boolean; name: string, id: number, tags: Tag[] };
  release_id?: number;
  can_release: boolean;
  image: string;
}

export interface INeighbourhod {
  id: number;
  name: string;
  site_id: number;
  created_at: string;
  updated_at: string;
}

export interface FreeTimeSlot {
  from: string;
  to: string;
  text: string;
}

export interface IColleagueInfo {
  colleague_name: string;
  colleague_id: number;
  colleagueimage: string;
  is_visitor: boolean;
}
