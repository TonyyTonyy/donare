import { z } from 'zod'

export const step1Schema = z.object({
  title: z
    .string({ error: 'Título é obrigatório' })
    .min(3, { error: 'Mínimo de 3 caracteres' })
    .max(100, { error: 'Máximo de 100 caracteres' }),

  description: z
    .string({ error: 'Descrição é obrigatória' })
    .min(10, { error: 'Descreva melhor o produto (mínimo 10 caracteres)' })
    .max(2000, { error: 'Máximo de 2.000 caracteres' }),

  category: z
    .string({ error: 'Selecione uma categoria' })
    .min(1, { error: 'Selecione uma categoria' }),

  condition: z
    .string({ error: 'Selecione o estado do produto' })
    .min(1, { error: 'Selecione o estado do produto' }),

  size: z.string().optional(),

  brand: z
    .string()
    .max(60, { error: 'Máximo de 60 caracteres' })
    .optional(),

  isWorking: z.boolean().optional(),

  pickupType: z
    .string({ error: 'Selecione o tipo de retirada' })
    .min(1, { error: 'Selecione o tipo de retirada' }),
})

export const step2Schema = z.object({
  images: z
    .array(z.string())
    .min(1, { error: 'Adicione pelo menos uma foto do produto' })
    .max(8, { error: 'Máximo de 8 fotos' }),

  primaryImageIndex: z.number().default(0),
})

export const step3Schema = z.object({
  pickupCity: z
    .string({ error: 'Informe a cidade' })
    .min(1, { error: 'Cidade é obrigatória' }),

  pickupAddress: z.string().optional(),

  pickupLatitude: z.number().optional(),
  pickupLongitude: z.number().optional(),

  pickupInstructions: z
    .string()
    .max(500, { error: 'Máximo de 500 caracteres' })
    .optional(),
})

export const donationSchema = step1Schema.extend({
  ...step2Schema.shape,
  ...step3Schema.shape,
})

export type DonationFormData = z.infer<typeof donationSchema>

export type FormErrors = Partial<Record<keyof DonationFormData, string>>

export type FormData = Partial<DonationFormData>