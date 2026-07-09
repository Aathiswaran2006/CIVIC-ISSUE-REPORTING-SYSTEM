export enum UserRole {
  CITIZEN = "CITIZEN",
  AUTHORITY = "AUTHORITY",
  ADMIN = "ADMIN",
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  department?: string; // For authorities (e.g., "Roads & Highways", "Sanitation", "Water Supply")
  district?: string;   // For district authorities
  state?: string;
  avatar?: string;
}

export enum ComplaintStatus {
  SUBMITTED = "Submitted",
  SEEN_BY_AUTHORITY = "Seen By Authority",
  UNDER_REVIEW = "Under Review",
  ASSIGNED = "Assigned",
  IN_PROGRESS = "In Progress",
  RESOLVED = "Resolved",
  REJECTED = "Rejected",
  CLOSED = "Closed",
}

export enum ComplaintPriority {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
  CRITICAL = "Critical",
}

export interface ComplaintTimelineEvent {
  id: string;
  status: ComplaintStatus;
  updatedBy: string;
  remarks: string;
  timestamp: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  images: string[];
  video?: string;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  landmark?: string;
  state: string;
  district: string;
  pinCode: string;
  anonymous: boolean;
  citizenId: string;
  citizenName?: string; // Blank if anonymous
  submissionTime: string;
  assignedDepartment?: string;
  authorityRemarks?: string;
  resolutionImage?: string;
  timeline: ComplaintTimelineEvent[];
  seenByAuthority?: boolean;
  seenTime?: string;
  seenTimestamp?: string;
  estimatedResolutionTime?: string;
  isArchived?: boolean;
  completionDate?: string;
  progressLogs?: { id: string; date: string; time: string; officerName: string; message: string; }[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  userName: string;
  details: string;
  timestamp: string;
}

export interface AppLanguage {
  code: "en" | "hi" | "ta";
  name: string;
}

export interface CategoryMapping {
  id: string;
  name: string;
  hindiName: string;
  tamilName: string;
  defaultDepartment: string;
}
