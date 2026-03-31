export interface User {
  lineUserId: string
  displayName: string
  pictureUrl: string
  referralCode: string
  referredBy?: string
  createdAt: string
}

export interface ReferralStats {
  referralCode: string
  clicks: number
  applications: number
  shares: number
}

export interface Application {
  id: string
  name: string
  phone: string
  note: string
  referralCode: string
  applicantLineUserId?: string
  createdAt: string
}

export interface RegisterResponse {
  user: User
  stats: ReferralStats
  isNew: boolean
}
