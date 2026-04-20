/**
 * @description Shared type definitions for the Admin Dashboard module.
 */

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum ReportStatus {
  PENDING = 'pending',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}

export enum ReportReason {
  COPYRIGHT = 'copyright',
  INAPPROPRIATE = 'inappropriate',
  VIOLENCE = 'violence',
  SPAM = 'spam',
}

export enum ReportType {
  TRACK = 'track',
  COMMENT = 'comment',
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

export enum UserRole {
  ARTIST = 'artist',
  LISTENER = 'listener',
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface StatCardData {
  label: string;
  value: string | number;
}

export interface StorageUsage {
  usedGB: number;
}

// export interface FlaggedContentBreakdown {
//   copyright: number;
//   inappropriate: number;
// }

// export interface ActivityStat {
//   label: string;
//   value: number;
//   change: string;
// }

export interface ArtistListenerRatio {
  artistCount: number;
  listenerCount: number;
  artistPercent: number;
  listenerPercent: number;
}

export interface AnalyticsDashboardData {
  plays: StatCardData;
  totalUsers: StatCardData;
  storage: StorageUsage;
  // flaggedContent: FlaggedContentBreakdown & { total: number };
  // highestMonthlyActivity: ActivityStat;
  // lowestMonthlyActivity: ActivityStat;
  artistListenerRatio: ArtistListenerRatio;
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export interface ReportRow {
  id: string;
  user: string;
  type: ReportType;
  reason: ReportReason;
  date: string;
  status: ReportStatus;
}

export interface ReportsDashboardData {
  totalReports: number;
  resolved: { count: number; total: number; percent: number };
  flaggedItems: { total: number; items: ReportRow[] };
}

// ─── Report View Popup ────────────────────────────────────────────────────────

export interface ReportedTrackInfo {
  thumbnailUrl: string;
  artistName: string;
  trackTitle: string;
  plays: string;
  uploadedDate: string;
}

export interface ReportedCommentInfo {
  author: string;
  postedOnTrack: string;
  uploadedDate: string;
  commentContent: string;
}

export interface ReportDetail {
  reason: string;
  type: ReportType;
  reportedBy: string;
  date: string;
  status: ReportStatus;
  description?: string;
  track?: ReportedTrackInfo;
  comment?: ReportedCommentInfo;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export interface UserRow {
  id: string;
  username: string;
  avatarUrl?: string;
  type: UserRole;
  status: UserStatus;
}

export interface UsersDashboardData {
  suspendedCount: number;
  users: UserRow[];
}