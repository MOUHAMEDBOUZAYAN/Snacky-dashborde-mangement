export interface AdminRating {
  id: string;
  orderId: string;
  createdAt: string;
  customerName: string;
  serviceRating: number;
  serviceComment: string | null;
  driverRating: number | null;
  driverComment: string | null;
  driverName: string | null;
  driverId: string | null;
}

export interface PaginatedRatings {
  items: AdminRating[];
  total: number;
  limit: number;
  offset: number;
}
