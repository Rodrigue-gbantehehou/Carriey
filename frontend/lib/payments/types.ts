export type PaymentMethod = 'mobile_money' | 'card'

export interface PaymentAmount {
  value: number
  currency: string
}

export interface CustomerInfo {
  name: string
  email: string
  phoneNumber?: string
}

export interface PaymentResponse {
  success: boolean
  transactionId?: string
  redirectUrl?: string
  error?: string
}

export interface PaymentProvider {
  id: string
  name: string
  initiate(amount: PaymentAmount, customer: CustomerInfo, metadata?: any): Promise<PaymentResponse>
  verify(transactionId: string): Promise<boolean>
}

export interface PaymentConfig {
  fedapayPublicKey: string
  kkiapayPublicKey: string
  isSandbox: boolean
}
