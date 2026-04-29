export enum UserRole {
  Admin = "Admin",
  User = "User",
  WarehouseManager = "Warehouse_Manager",
  Investor = "Investor", // Kept for legacy/reference if still used
  Agent = "Agent" // Kept for legacy/reference if still used
}

export enum UserStatus {
  Active = "Active",
  Suspended = "Suspended",
  Pending = "Pending"
}

export enum KYCStatus {
  Pending = "PENDING",
  Verified = "VERIFIED",
  Rejected = "REJECTED",
  UnderReview = "UNDER_REVIEW"
}
