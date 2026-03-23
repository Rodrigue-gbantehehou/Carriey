import { PaymentProvider, PaymentMethod, PaymentConfig } from './types'
import { FedaPayProvider } from './fedapay'
import { KkiaPayProvider } from './kkiapay'

export class PaymentFactory {
  private static config: PaymentConfig = {
    fedapayPublicKey: process.env.NEXT_PUBLIC_FEDAPAY_PUBLIC_KEY || 'pk_sandbox_votre_cle_test',
    kkiapayPublicKey: process.env.NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY || 'votre_cle_kkiapay_test',
    isSandbox: process.env.NEXT_PUBLIC_PAYMENT_SANDBOX === 'true' || true
  }

  static getProvider(method: PaymentMethod): PaymentProvider {
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
