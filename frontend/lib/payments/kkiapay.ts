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
      if ((window as any).Kkiapay || (window as any).openKkiapayWidget) {
        resolve()
        return
      }
      const script = document.createElement('script')
      script.src = 'https://cdn.kkiapay.me/k.js'
      script.async = true
      script.onload = () => {
        console.log('Kkiapay script loaded')
        resolve()
      }
      script.onerror = () => reject(new Error('Failed to load Kkiapay script'))
      document.body.appendChild(script)
    })
  }

  async initiate(amount: PaymentAmount, customer: CustomerInfo, metadata?: any): Promise<PaymentResponse> {
    console.log('--- KKIAPAY INITIATE START ---', { amount, customer })
    try {
      await this.loadScript()
      
      return new Promise((resolve) => {
        // Try different global names used by Kkiapay
        const openWidget = (window as any).openKkiapayWidget || (window as any).Kkiapay || (window as any).KkiaPay
        
        if (!openWidget) {
          console.error('Kkiapay SDK not found on window. Tried: openKkiapayWidget, Kkiapay, KkiaPay')
          return resolve({ success: false, error: 'SDK Kkiapay introuvable' })
        }

        console.log('Opening Kkiapay widget with key:', this.publicKey)
        
        // Configuration object
        const config = {
          amount: amount.value,
          position: 'center',
          callback: '', 
          data: metadata,
          key: this.publicKey,      // Some versions use 'key'
          api_key: this.publicKey,  // Others use 'api_key'
          sandbox: this.isSandbox,
          email: customer.email,
          name: customer.name,
          phone: customer.phoneNumber || '',
        }

        // Handle success/failure via events if the SDK supports them
        if (typeof (window as any).addKkiapayListener === 'function') {
          const successHandler = (response: any) => {
            console.log('Kkiapay success event:', response)
            ;(window as any).removeKkiapayListener('success', successHandler)
            resolve({ success: true, transactionId: response.transactionId })
          }
          const failureHandler = (error: any) => {
            console.warn('Kkiapay failure event:', error)
            ;(window as any).removeKkiapayListener('failed', failureHandler)
            resolve({ success: false, error: error.message || 'Payment failed' })
          }
          ;(window as any).addKkiapayListener('success', successHandler)
          ;(window as any).addKkiapayListener('failed', failureHandler)
        }

        // Call the open function
        // Note: Some versions are constructors, others are functions
        try {
          if (typeof openWidget === 'function' && openWidget.prototype && openWidget.prototype.constructor === openWidget) {
            // It's a constructor
            const instance = new (openWidget as any)(config)
            if (instance.on) {
                instance.on('success', (res: any) => resolve({ success: true, transactionId: res.transactionId }))
                instance.on('failed', (err: any) => resolve({ success: false, error: err.message }))
            }
            instance.open()
          } else {
            // It's a plain function (like openKkiapayWidget)
            const result = openWidget(config)
            // If it returns an object with .on (newer JS SDK)
            if (result && typeof result.on === 'function') {
                result.on('success', (res: any) => resolve({ success: true, transactionId: res.transactionId }))
                result.on('failed', (err: any) => resolve({ success: false, error: err.message }))
            }
          }
        } catch (e) {
          console.error('Error calling Kkiapay open function:', e)
          resolve({ success: false, error: 'Erreur lors de l\'ouverture du widget' })
        }
      })
    } catch (error: any) {
      console.error('Kkiapay initiation error:', error)
      return { success: false, error: error.message }
    }
  }

  async verify(transactionId: string): Promise<boolean> {
    console.log(`Verifying KkiaPay transaction: ${transactionId}`)
    return true
  }
}
