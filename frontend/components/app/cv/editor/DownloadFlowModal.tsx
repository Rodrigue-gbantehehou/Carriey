'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { PaymentFactory } from '@/lib/payments/factory'
import { toast } from 'react-hot-toast'
import config from '@/lib/config'

interface DownloadFlowModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (guestData: { email: string, name: string, plan: string, paymentId?: string }) => void
  templatePrice: string
  templateName: string
}

const Icons = {
  Smartphone: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  CreditCard: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  Lock: ({ className }: { className?: string }) => (
    <svg className={className || "w-4 h-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  Close: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  ArrowRight: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  ),
  Sparkles: () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" /></svg>,
  Mail: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  User: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Check: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>,
  Shield: () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
}

type ModalStep = 'identity' | 'pricing' | 'payment'

export default function DownloadFlowModal({ isOpen, onClose, onSuccess, templatePrice, templateName }: DownloadFlowModalProps) {
  console.log("DownloadFlowModal Render:", { isOpen, templatePrice, templateName })
  const { data: session } = useSession()
  const [step, setStep] = useState<ModalStep>('identity')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')

  // Pré-remplir les données si l'utilisateur est connecté
  useEffect(() => {
    if (session?.user) {
      if (session.user.email) setEmail(session.user.email)
      if (session.user.name) setName(session.user.name)
      
      // Si on a déjà les infos, on peut potentiellement sauter l'étape identity
      // Mais restons prudents et laissons l'utilisateur confirmer
    }
  }, [session])

  const [selectedPlan, setSelectedPlan] = useState<'single' | 'trial'>('trial')
  const [isProcessing, setIsProcessing] = useState(false)
  const isSandbox = process.env.NEXT_PUBLIC_PAYMENT_SANDBOX === 'true'
  const [selectedMethod, setSelectedMethod] = useState<'mobile_money' | 'card'>('mobile_money')

  if (!isOpen) return null

  const handleNext = () => {
    if (step === 'identity') setStep('pricing')
    else if (step === 'pricing') setStep('payment')
    else if (step === 'payment') handlePayment()
  }

  const handlePayment = async () => {
    console.log("--- STARTING PAYMENT FLOW ---", { selectedMethod, selectedPlan })
    setIsProcessing(true)
    try {
      const provider = PaymentFactory.getProvider(selectedMethod)
      const amount = selectedPlan === 'trial' ? 300 : parseInt(templatePrice.replace(/\s/g, ''))
      
      const response = await provider.initiate(
        { value: amount, currency: 'XOF' },
        { name, email }
      )

      if (response.success) {
        console.log("Payment success in modal, calling onSuccess")
        toast.success("Paiement validé avec succès !")
        onSuccess({ email, name, plan: selectedPlan, paymentId: response.transactionId })
      } else {
        console.warn("Payment failed in modal:", response.error)
        toast.error(response.error || "Le paiement a échoué")
      }
    } catch (error: any) {
      toast.error("Une erreur est survenue lors du paiement")
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Icons as SVG components to avoid lucide-react dependency
  const Icons = {
    Close: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
    Sparkles: () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" /></svg>,
    Mail: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    User: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    Check: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>,
    Shield: () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    CreditCard: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
    Smartphone: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
    ArrowRight: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <div 
        className="absolute inset-0 bg-brand-text/80 backdrop-blur-md"
        onClick={() => {
          if (!isProcessing) {
             console.log("Backdrop clicked, calling onClose")
             onClose()
          } else {
             console.log("Backdrop clicked but suppressed because isProcessing is true")
          }
        }}
      />
      
      <div 
        className="relative w-full max-w-lg bg-white rounded-[24px] sm:rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 max-h-[95vh]"
      >
        {/* Header decoration */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-cta" />
        
        <button 
          type="button"
          onClick={() => {
            console.log("Modal Close Button Clicked")
            onClose()
          }}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-brand-text transition-colors rounded-full hover:bg-gray-100 z-10"
        >
          <Icons.Close />
        </button>

        <div className="p-6 sm:p-12 overflow-y-auto">
          {step === 'identity' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-brand-cta/10 text-brand-cta rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Icons.Sparkles />
                </div>
                <h2 className="text-3xl font-black text-brand-text tracking-tight uppercase leading-none">Prêt à briller ?</h2>
                <p className="text-brand-muted font-medium">Récupérez votre CV professionnel en quelques secondes.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Votre Nom Complet</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-brand-cta focus:bg-white transition-all font-medium text-brand-text pl-12"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <Icons.User />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Adresse Email</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@exemple.com"
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-brand-cta focus:bg-white transition-all font-medium text-brand-text pl-12"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <Icons.Mail />
                    </div>
                  </div>
                </div>
              </div>

              <button 
                type="button"
                onClick={handleNext}
                disabled={!name || !email}
                className="w-full py-5 bg-brand-text text-white font-black rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                Continuer vers le téléchargement
                <div className="group-hover:translate-x-1 transition-transform">
                  <Icons.ArrowRight />
                </div>
              </button>
            </div>
          )}

          {step === 'pricing' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="text-center space-y-3">
                <span className="px-3 py-1 bg-brand-cta/10 text-brand-cta text-[10px] font-black uppercase tracking-widest rounded-full">
                  Offre Limitée
                </span>
                <h2 className="text-2xl font-black text-brand-text tracking-tight uppercase">Activez votre Excellence</h2>
              </div>

              <div className="space-y-4">
                {/* Trial Plan */}
                <button 
                  onClick={() => setSelectedPlan('trial')}
                  className={`w-full p-6 h-full text-left rounded-3xl border-2 transition-all relative overflow-hidden group ${
                    selectedPlan === 'trial' ? 'border-brand-cta bg-brand-cta/5' : 'border-gray-100 hover:border-brand-cta/30 bg-white'
                  }`}
                >
                  {selectedPlan === 'trial' && (
                    <div className="absolute top-0 right-0 bg-brand-cta text-white px-4 py-1.5 text-[10px] font-black rounded-bl-xl uppercase tracking-widest">
                      Conseillé
                    </div>
                  )}
                  {/* L'ancien bloc mal placé a été retiré ici */}
                  <div className="flex items-start gap-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 transition-colors ${
                      selectedPlan === 'trial' ? 'border-brand-cta bg-brand-cta' : 'border-gray-200'
                    }`}>
                      {selectedPlan === 'trial' && <Icons.Check />}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-black text-brand-text text-lg italic">Pass Elite 14 Jours</h3>
                      <p className="text-brand-muted text-xs font-medium">Testez ce modèle pendant 14 jours. Téléchargements illimités pendant la période.</p>
                      <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-2xl font-black text-brand-text">300 F</span>
                        <span className="text-brand-muted text-xs font-bold uppercase">CFA</span>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Single Plan */}
                <button 
                  onClick={() => setSelectedPlan('single')}
                  className={`w-full p-6 text-left rounded-3xl border-2 transition-all group ${
                    selectedPlan === 'single' ? 'border-brand-cta bg-brand-cta/5' : 'border-gray-100 hover:border-brand-cta/30 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 transition-colors ${
                      selectedPlan === 'single' ? 'border-brand-cta bg-brand-cta' : 'border-gray-200'
                    }`}>
                      {selectedPlan === 'single' && <Icons.Check />}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-gray-600 uppercase tracking-tight">Achat unique</h3>
                      <p className="text-brand-muted text-xs font-medium">Accès permanent à ce modèle. Téléchargements illimités, sans limite de temps.</p>
                      <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-xl font-black text-gray-600">{templatePrice} F</span>
                        <span className="text-brand-muted text-xs font-bold uppercase">CFA</span>
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 flex gap-3.5">
                <div className="text-emerald-600 shrink-0 mt-0.5">
                  <Icons.Shield />
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-black text-emerald-950 uppercase tracking-wide">Inclus avec votre déblocage :</p>
                  <ul className="text-[11px] text-emerald-900/80 font-medium space-y-1">
                    <li className="flex items-center gap-1.5"><span className="text-emerald-600 font-bold">✓</span> PDF vectoriel haute fidélité (sans aucun filigrane)</li>
                    <li className="flex items-center gap-1.5"><span className="text-emerald-600 font-bold">✓</span> 100% lisible par les robots de recrutement (ATS)</li>
                    <li className="flex items-center gap-1.5"><span className="text-emerald-600 font-bold">✓</span> Téléchargements et modifications illimités</li>
                  </ul>
                </div>
              </div>

              <button 
                type="button"
                onClick={handleNext}
                className="w-full py-5 bg-brand-text text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl shadow-black/10 uppercase tracking-wider text-sm"
              >
                Continuer vers le paiement
              </button>
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-brand-text tracking-tight uppercase">Méthode de Paiement</h2>
                <p className="text-brand-muted font-medium">Plus que cette étape pour télécharger votre CV.</p>
              </div>

              <div className="space-y-4">
                 <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Sélectionnez votre moyen de paiement</div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <button 
                      type="button"
                      onClick={() => setSelectedMethod('mobile_money')}
                      className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all group ${
                        selectedMethod === 'mobile_money' ? 'border-brand-cta bg-brand-cta/5' : 'border-gray-100 bg-white'
                      }`}
                    >
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                         selectedMethod === 'mobile_money' ? 'bg-white shadow-sm text-brand-cta' : 'bg-gray-50 text-brand-text'
                       }`}>
                          <Icons.Smartphone />
                       </div>
                       <span className="text-[10px] font-bold uppercase tracking-wider">Mobile Money</span>
                       <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${
                         selectedMethod === 'mobile_money' ? 'text-brand-cta bg-brand-cta/10' : 'text-gray-400 bg-gray-100'
                       }`}>via FedaPay</span>
                    </button>
                    <button 
                      type="button"
                      disabled={true}
                      className="flex flex-col items-center gap-3 p-6 rounded-3xl border-2 border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed relative"
                    >
                       <div className="absolute top-2 right-2">
                          <span className="bg-orange-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Maintenance</span>
                       </div>
                       <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gray-100 text-gray-400">
                          <Icons.CreditCard />
                       </div>
                       <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Carte Visa</span>
                       <span className="text-[8px] font-black px-2 py-0.5 rounded-full uppercase text-gray-400 bg-gray-200">Bientôt disponible</span>
                    </button>
                 </div>

                 <div className="pt-4 space-y-4">
                    <div className="flex -space-x-2 justify-center pb-4 opacity-40 grayscale">
                        <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white uppercase italic">V</div>
                        <div className="w-8 h-8 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white uppercase italic">M</div>
                        <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white uppercase italic">P</div>
                    </div>
                    
                    <button 
                      type="button"
                      onClick={handlePayment}
                      disabled={isProcessing}
                      className="w-full py-5 bg-brand-cta text-white font-black rounded-2xl hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Traitement...
                        </>
                      ) : (
                        `Payer ${selectedPlan === 'trial' ? '300 F' : `${templatePrice} F`} & Télécharger`
                      )}
                    </button>
                 </div>
              </div>

              <p className="text-center text-[10px] text-brand-muted font-medium px-8 leading-relaxed">
                En cliquant sur payer, vous acceptez nos conditions générales de vente. Le modèle sera disponible immédiatement après validation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
