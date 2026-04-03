'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Loader2, Heart, Leaf } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DonationFormData,
  step1Schema,
  step2Schema,
  step3Schema,
  donationSchema,
  FormData,
  FormErrors,
} from './_components/donation-step-schema'
import { StepIndicator } from './_components/step-indicator'
import { Step1ProductForm } from './_components/step-1-product-form'
import { Step2Photos } from './_components/step-2-photos'
import { Step3Location } from './_components/step-3-location'

const STEP_SCHEMAS = [step1Schema, step2Schema, step3Schema]

const STEP_TITLES = [
  { title: 'O que você vai doar?', subtitle: 'Preencha as informações do produto' },
  { title: 'Fotos do produto', subtitle: 'Mostre o que você está doando' },
  { title: 'Onde retirar?', subtitle: 'Defina o ponto de retirada no mapa' },
]

const DEFAULT_VALUES: FormData = {
  title: '',
  description: '',
  category: '',
  condition: '',
  pickupType: 'NEUTRAL_POINT',
  images: [],
  primaryImageIndex: 0,
  pickupCity: '',
  pickupAddress: '',
  pickupInstructions: '',
}

export default function DoarPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const [formData, setFormData] = useState<FormData>(DEFAULT_VALUES)
  const [errors, setErrors] = useState<FormErrors>({})

  const handleChange = (field: keyof DonationFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const validateStep = (stepIndex: number): FormErrors | null => {
    const schema = STEP_SCHEMAS[stepIndex]
    const result = schema.safeParse(formData)
    if (result.success) return null

    const fieldErrors: FormErrors = {}
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof DonationFormData
      if (!fieldErrors[field]) fieldErrors[field] = issue.message
    }
    return fieldErrors
  }

  const goNext = () => {
    const errs = validateStep(step - 1)
    if (errs) {
      setErrors(errs)
      return
    }
    setErrors({})
    setStep((s) => s + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goBack = () => {
    setStep((s) => Math.max(1, s - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const onSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault()

    const result = donationSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors: FormErrors = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof DonationFormData
        if (!fieldErrors[field]) fieldErrors[field] = issue.message
      }
      setErrors(fieldErrors)

      const step1Keys = Object.keys(fieldErrors).filter((k) =>
        ['title', 'description', 'category', 'condition', 'pickupType'].includes(k)
      )
      const step2Keys = Object.keys(fieldErrors).filter((k) => ['images'].includes(k))
      if (step1Keys.length) setStep(1)
      else if (step2Keys.length) setStep(2)
      else setStep(3)

      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.data),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Erro ao publicar doação')
      }

      setDone(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Algo deu errado. Tente novamente.'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }


  if (done) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-5 bg-background text-foreground">
        <div className="flex flex-col items-center gap-6 max-w-xs text-center">
          <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center">
            <Leaf className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Doação publicada!</h1>
            <p className="text-muted-foreground mt-2">
              Seu item já está disponível para quem precisa. Muito obrigado pela generosidade. 💚
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full">
            <Button className="w-full" onClick={() => router.push('/')}>
              Ver outros itens
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setDone(false)
                setStep(1)
                setFormData(DEFAULT_VALUES)
                setErrors({})
              }}
            >
              Fazer outra doação
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const { title, subtitle } = STEP_TITLES[step - 1]

  return (
    <div className="min-h-dvh bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-xl mx-auto px-4 py-4 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={step === 1 ? () => router.back() : goBack}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-base font-semibold tracking-tight leading-none">{title}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            </div>
          </div>
          <StepIndicator currentStep={step} />
        </div>
      </header>

      <section className="flex-1 max-w-xl mx-auto w-full px-4 py-6">
        <form onSubmit={onSubmit} noValidate>
          {step === 1 && <Step1ProductForm data={formData} onChange={handleChange} errors={errors} />}
          {step === 2 && <Step2Photos data={formData} onChange={handleChange} errors={errors} />}
          {step === 3 && <Step3Location data={formData} onChange={handleChange} errors={errors} />}

          <div className="mt-8 flex gap-3">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-2xl h-12"
                onClick={goBack}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Voltar
              </Button>
            )}

            {step < 3 ? (
              <Button
                type="button"
                className="flex-1 rounded-2xl h-12 font-semibold"
                onClick={goNext}
              >
                Continuar
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                type="submit"
                className="flex-1 rounded-2xl h-12 font-semibold gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Publicando…
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 fill-current" />
                    Publicar doação
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </section>

      <div className="h-6" />
    </div>
  )
}