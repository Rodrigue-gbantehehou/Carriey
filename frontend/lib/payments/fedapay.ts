import { PaymentProvider, PaymentAmount, CustomerInfo, PaymentResponse } from './types'

export class FedaPayProvider implements PaymentProvider {
  id = 'fedapay'
  name = 'FedaPay (Mobile Money)'
  private publicKey: string
  private isSandbox: boolean

  constructor(publicKey: string, isSandbox: boolean = true) {
    this.publicKey = publicKey
    this.isSandbox = isSandbox
  }

  private loadScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).FedaPay) {
        resolve()
        return
      }
      const script = document.createElement('script')
      script.src = 'https://cdn.fedapay.com/checkout.js?v=1.1.7'
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load FedaPay script'))
      document.body.appendChild(script)
    })
  }

  async initiate(amount: PaymentAmount, customer: CustomerInfo, metadata?: any): Promise<PaymentResponse> {
    console.log('--- FEDAPAY INITIATE START ---', { amount, customer })
    
    try {
      await this.loadScript()
      
      return new Promise((resolve) => {
        const fp = (window as any).FedaPay
        if (!fp) return resolve({ success: false, error: 'SDK FedaPay introuvable' })

        // 1. Définir le gestionnaire universel
        const handleComplete = (resp: any) => {
          console.log('--- GLOBAL FEDAPAY SIGNAL RECEIVED ---', resp)
          
          // FedaPay peut renvoyer les données à la racine ou dans un objet "transaction"
          const data = resp.transaction || resp
          const status = (data.status || '').toLowerCase()
          const transactionId = data.id || resp.id
          
          console.log('Extraited Data:', { status, transactionId })

          const isSuccessStatus = ['approved', 'success', 'captured', 'paid'].includes(status)
          
          if (isSuccessStatus) {
            console.log('FedaPay Success confirmed')
            // Nettoyage des globaux pour éviter les doubles déclenchements
            delete (window as any).onFedaPayComplete
            resolve({ success: true, transactionId: transactionId })
          } else if (status === 'canceled' || status === 'cancelled') {
            console.log('FedaPay Payment Canceled')
            resolve({ success: false, error: 'Paiement annulé' })
          } else {
            console.log('FedaPay other status:', status)
            // Ne pas résoudre immédiatement si c'est un autre statut (ex: pending)
            // sauf si la fenêtre est fermée
          }
        }

        const handleClose = () => {
          console.log('FedaPay Window Close Signal')
          setTimeout(() => resolve({ success: false, error: 'Fenêtre fermée' }), 1000)
        }

        // 2. Attacher à window (certaines versions d'SDK cherchent des noms de fonctions globales)
        (window as any).onFedaPayComplete = handleComplete;
        (window as any).onFedaPayClose = handleClose;

        // 3. Initialisation avec TOUS les noms de paramètres possibles
        console.log('Running FedaPay.init with universal options...')
        const checkout = fp.init({
          public_key: this.publicKey,
          transaction: {
            amount: amount.value,
            description: `CVTor - ${customer.email}`,
            custom_metadata: metadata
          },
          customer: {
            firstname: customer.name.split(' ')[0],
            lastname: customer.name.split(' ').slice(1).join(' ') || 'Client',
            email: customer.email,
          },
          // On met toutes les variantes possibles
          on_complete: handleComplete,
          onComplete: handleComplete,
          callback: handleComplete,
          on_close: handleClose,
          onClose: handleClose,
          // Support pour les versions qui attendent des noms de fonctions globales (strings)
          on_complete_callback: 'onFedaPayComplete',
          on_close_callback: 'onFedaPayClose'
        })
        
        // 4. Fallback sur l'objet FedaPay global si l'init n'est pas une instance
        const openMethod = (checkout && typeof checkout.open === 'function') ? checkout.open.bind(checkout) : 
                           (typeof fp.open === 'function') ? fp.open : 
                           (fp.checkout && typeof fp.checkout.open === 'function') ? fp.checkout.open : null

        if (openMethod) {
          console.log('Triggering FedaPay terminal...')
          openMethod()
        } else {
          console.error('CRITICAL: FedaPay open method not found')
          resolve({ success: false, error: 'Terminal de paiement indisponible' })
        }

        // 5. Sécurité : Si après 10 minutes rien ne s'est passé, on libère le bouton
        setTimeout(() => {
          resolve({ success: false, error: 'Délai d\'attente dépassé' })
        }, 600000)
      })
    } catch (error: any) {
      console.error('FedaPay Initiation Error:', error)
      return { success: false, error: error.message }
    }
  }

  async verify(transactionId: string): Promise<boolean> {
    // In a real app, this would call the backend to verify the transaction
    console.log(`Verifying FedaPay transaction: ${transactionId}`)
    return true
  }
}
