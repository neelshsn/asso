export const Role = {
  VOLUNTEER: "VOLUNTEER",
  ASSOCIATION: "ASSOCIATION",
  ADMIN: "ADMIN",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const AvailabilityType = {
  FULLTIME: "FULLTIME",
  PARTTIME: "PARTTIME",
  OCCASIONAL: "OCCASIONAL",
} as const;

export type AvailabilityType =
  (typeof AvailabilityType)[keyof typeof AvailabilityType];

export const Modality = {
  ONSITE: "ONSITE",
  REMOTE: "REMOTE",
  HYBRID: "HYBRID",
} as const;

export type Modality = (typeof Modality)[keyof typeof Modality];

export const MatchStatus = {
  PROPOSED: "PROPOSED",
  ACCEPTED: "ACCEPTED",
  DECLINED: "DECLINED",
  EXPIRED: "EXPIRED",
} as const;

export type MatchStatus = (typeof MatchStatus)[keyof typeof MatchStatus];
