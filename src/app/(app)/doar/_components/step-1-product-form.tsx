'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { DonationFormData, FormData, FormErrors } from './donation-step-schema'
import {
  CATEGORIES_WITH_BRAND,
  CATEGORIES_WITH_IS_WORKING,
  CATEGORIES_WITH_SIZE,
  categoryLabels,
  conditionLabels,
  pickupTypeLabels,
  SIZE_OPTIONS,
} from './donation-labels'
import FormField from '@/components/form-field'
import FieldError from '@/components/field-error'

interface Step1ProductFormProps {
  data: FormData
  onChange: (field: keyof DonationFormData, value: unknown) => void
  errors: FormErrors
}

export function Step1ProductForm({ data, onChange, errors }: Step1ProductFormProps) {
  const category = data.category ?? ''

  const showSize = category ? CATEGORIES_WITH_SIZE.has(category) : false
  const showBrand = category ? CATEGORIES_WITH_BRAND.has(category) : false
  const showIsWorking = category ? CATEGORIES_WITH_IS_WORKING.has(category) : false
  const sizeOptions = SIZE_OPTIONS[category] ?? []

  return (
    <div className="flex flex-col gap-5">

      <FormField>
        <Label htmlFor="title">Título do produto</Label>
        <Input
          id="title"
          value={data.title ?? ''}
          onChange={(e) => onChange('title', e.target.value)}
          aria-invalid={!!errors.title}
          placeholder="Ex: Camiseta polo azul"
          className={cn('', errors.title && 'border-destructive')}
        />
        <FieldError message={errors.title} />
      </FormField>

      <FormField>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={data.description ?? ''}
          onChange={(e) => onChange('description', e.target.value)}
          aria-invalid={!!errors.description}
          placeholder="Descreva o produto com detalhes: estado, cor, histórico de uso..."
          className={cn(
            ' min-h-25 resize-none',
            errors.description && 'border-destructive',
          )}
        />
        <div className="flex items-center justify-between">
          <FieldError message={errors.description} />
          <span className="text-xs text-muted-foreground ml-auto">
            {(data.description?.length ?? 0)}/2000
          </span>
        </div>
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField>
          <Label htmlFor="category">Categoria</Label>
          <Select
            value={data.category ?? ''}
            onValueChange={(v) => onChange('category', v)}
          >
            <SelectTrigger
              id="category"
              aria-invalid={!!errors.category}
              className={cn('', errors.category && 'border-destructive')}
            >
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError message={errors.category} />
        </FormField>

        <FormField>
          <Label htmlFor="condition">Estado</Label>
          <Select
            value={data.condition ?? ''}
            onValueChange={(v) => onChange('condition', v)}
          >
            <SelectTrigger
              id="condition"
              aria-invalid={!!errors.condition}
              className={cn('', errors.condition && 'border-destructive')}
            >
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(conditionLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError message={errors.condition} />
        </FormField>
      </div>

      {showSize && (
        <FormField>
          <Label>Tamanho</Label>
          {sizeOptions.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {sizeOptions.map((s) => (
                <Badge
                  key={s}
                  variant={data.size === s ? 'default' : 'outline'}
                  className="cursor-pointer select-none px-3 py-1 text-sm transition-all"
                  onClick={() => onChange('size', data.size === s ? '' : s)}
                >
                  {s}
                </Badge>
              ))}
            </div>
          ) : (
            <Input
              value={data.size ?? ''}
              onChange={(e) => onChange('size', e.target.value)}
              aria-invalid={!!errors.size}
              placeholder="Ex: 42, P, Único"
              className={cn('', errors.size && 'border-destructive')}
            />
          )}
          <FieldError message={errors.size} />
        </FormField>
      )}

      {showBrand && (
        <FormField>
          <Label htmlFor="brand">
            Marca{' '}
            <span className="text-muted-foreground text-xs font-normal">(opcional)</span>
          </Label>
          <Input
            id="brand"
            value={data.brand ?? ''}
            onChange={(e) => onChange('brand', e.target.value)}
            aria-invalid={!!errors.brand}
            placeholder="Ex: Nike, Samsung, IKEA"
            className={cn('', errors.brand && 'border-destructive')}
          />
          <FieldError message={errors.brand} />
        </FormField>
      )}

      {showIsWorking && (
        <div
          className={cn(
            'flex items-center gap-4 rounded-xl border border-border bg-muted/40 px-4 py-3',
            errors.isWorking && 'border-destructive',
          )}
        >
          <div className="flex flex-col gap-0.5 flex-1">
            <Label htmlFor="is-working">Está funcionando?</Label>
            <p className="text-xs text-muted-foreground">
              Informe se o produto está em pleno funcionamento
            </p>
            <FieldError message={errors.isWorking} />
          </div>
          <Switch
            id="is-working"
            checked={data.isWorking ?? false}
            onCheckedChange={(v) => onChange('isWorking', v)}
            aria-invalid={!!errors.isWorking}
          />
        </div>
      )}

      <FormField>
        <Label>Tipo de retirada</Label>
        <div className="grid grid-cols-2 gap-2 pt-1">
          {Object.entries(pickupTypeLabels).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange('pickupType', value)}
              className={cn(
                'rounded-xl border px-3 py-2.5 text-sm font-medium transition-all text-left',
                data.pickupType === value
                  ? 'border-secondary bg-primary/20 text-primary'
                  : 'border-border bg-muted/40 text-muted-foreground hover:border-secondary hover:text-foreground',
                errors.pickupType && 'border-destructive',
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <FieldError message={errors.pickupType} />
      </FormField>

    </div>
  )
}