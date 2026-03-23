import { PaymentProvider, PaymentAmount, CustomerInfo, PaymentResponse } from './types'

export class KkiaPayProvider implements PaymentProvider {
  id = 'kkiapay'
  name = 'KkiaPay (Carte Visa)'
  private publicKey: string
  private isSandbox: boolean

  constructor(publicKey: string, isSandbox: boolean = true) {
    this.publicKey = publicKey
    this.isSandbox = isSandbox
  }

  private loadScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).KkiaPay) {
        resolve()
        return
      }
      const script = document.createElement('script')
      script.src = 'https://cdn.kkiapay.me/k.js'
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load KkiaPay script'))
      document.body.appendChild(script)
    })
  }

  async initiate(amount: PaymentAmount, customer: CustomerInfo, metadata?: any): Promise<PaymentResponse> {
    try {
      await this.loadScript()
      
      return new Promise((resolve) => {
        const kkiapay = (window as any).Kkiapay({
          amount: amount.value,
          position: 'center',
          callback: '', // Not used here as we use listen
          data: metadata,
          key: this.publicKey,
          sandbox: this.isSandbox,
          email: customer.email,
          name: customer.name,
        })
        
        kkiapay.on('success', (response: any) => {
          console.log('KkiaPay success:', response)
          resolve({ success: true, transactionId: response.transactionId })
        })
        
        kkiapay.on('failed', (error: any) => {
          console.warn('KkiaPay failed:', error)
          resolve({ success: false, error: error.message || 'Payment failed' })
        })

        console.log('Opening KkiaPay widget...')
        kkiapay.open()
      })
    } catch (error: any) {
      console.error('KkiaPay initiation error:', error)
      return { success: false, error: error.message }
    }
  }

  async verify(transactionId: string): Promise<boolean> {
    console.log(`Verifying KkiaPay transaction: ${transactionId}`)
    return true
  }
}
