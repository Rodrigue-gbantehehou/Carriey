import { PaymentProvider, PaymentMethod, PaymentConfig } from './types'
import { FedaPayProvider } from './fedapay'
import { KkiaPayProvider } from './kkiapay'

export class PaymentFactory {
  private static config: PaymentConfig = {
    fedapayPublicKey: process.env.NEXT_PUBLIC_FEDAPAY_PUBLIC_KEY || '',
    kkiapayPublicKey: process.env.NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY || '',
    isSandbox: process.env.NEXT_PUBLIC_PAYMENT_SANDBOX === 'true' || process.env.NODE_ENV !== 'production'
  }

  static getProvider(method: PaymentMethod): PaymentProvider {
    console.log('PaymentFactory: Getting provider for', method, 'Sandbox:', this.config.isSandbox)
    
    if (!this.config.fedapayPublicKey && method === 'mobile_money') {
      console.error('FEDAPAY_PUBLIC_KEY is missing in frontend environment')
    }
    if (!this.config.kkiapayPublicKey && method === 'card') {
      console.error('KKIAPAY_PUBLIC_KEY is missing in frontend environment')
    }
    switch (method) {
      case 'mobile_money':
        return new FedaPayProvider(this.config.fedapayPublicKey, this.config.isSandbox)
      case 'card':
        return new KkiaPayProvider(this.config.kkiapayPublicKey, this.config.isSandbox)
      default:
        throw new Error(`Unsupported payment method: ${method}`)
    }
  }

  static setConfig(newConfig: Partial<PaymentConfig>) {
    this.config = { ...this.config, ...newConfig }
  }
}
