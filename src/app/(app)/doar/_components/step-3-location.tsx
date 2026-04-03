'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Locate, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { DonationFormData, FormData, FormErrors } from './donation-step-schema'
import FormField from '@/components/form-field'
import FieldError from '@/components/field-error'

let LeafletMap: any = null
let LeafletTileLayer: any = null
let LeafletMarker: any = null
let LeafletPopup: any = null

interface Step3LocationProps {
  data: FormData
  onChange: (field: keyof DonationFormData, value: unknown) => void
  errors: FormErrors
}

export function Step3Location({ data, onChange, errors }: Step3LocationProps) {
  const mapRef = useRef<any>(null)

  const lat = data.pickupLatitude
  const lng = data.pickupLongitude

  const [mapReady, setMapReady] = useState(false)
  const [locating, setLocating] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const [reactLeaflet, leaflet] = await Promise.all([
        import('react-leaflet'),
        import('leaflet'),
      ])

      const iconDefault = leaflet.default.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      })
      leaflet.default.Marker.prototype.options.icon = iconDefault

      if (mounted) {
        LeafletMap = reactLeaflet.MapContainer
        LeafletTileLayer = reactLeaflet.TileLayer
        LeafletMarker = reactLeaflet.Marker
        LeafletPopup = reactLeaflet.Popup
        setMapReady(true)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const locateMe = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocalização não suportada neste dispositivo.')
      return
    }
    setLocating(true)
    setGeoError(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange('pickupLatitude', pos.coords.latitude)
        onChange('pickupLongitude', pos.coords.longitude)
        if (mapRef.current) {
          mapRef.current.flyTo([pos.coords.latitude, pos.coords.longitude], 15)
        }
        setLocating(false)
      },
      () => {
        setGeoError('Não foi possível obter sua localização. Tente mover o mapa.')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  function ClickListener() {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useMapEvents } = require('react-leaflet')
    useMapEvents({
      click(e: any) {
        onChange('pickupLatitude', e.latlng.lat)
        onChange('pickupLongitude', e.latlng.lng)
      },
    })
    return null
  }

  const defaultCenter: [number, number] = [-12.25840, -38.96070]

  return (
    <div className="flex flex-col gap-5">
      <div className="relative rounded-2xl overflow-hidden border border-border">
        {mapReady && LeafletMap ? (
          <LeafletMap
            ref={mapRef}
            center={lat && lng ? [lat, lng] : defaultCenter}
            zoom={13}
            style={{ height: 260, width: '100%' }}
            className="z-0"
          >
            <LeafletTileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
            />
            <ClickListener />
            {lat && lng && (
              <LeafletMarker position={[lat, lng]}>
                <LeafletPopup>Ponto de retirada</LeafletPopup>
              </LeafletMarker>
            )}
          </LeafletMap>
        ) : (
          <div className="h-65 flex items-center justify-center bg-muted/30 text-muted-foreground text-sm gap-2">
            <MapPin className="w-4 h-4 animate-pulse" />
            Carregando mapa…
          </div>
        )}

        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="absolute bottom-3 right-3 z-20 gap-1.5 shadow-lg"
          onClick={locateMe}
          disabled={locating}
        >
          {locating ? (
            <Navigation className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Locate className="w-3.5 h-3.5" />
          )}
          {locating ? 'Localizando…' : 'Usar minha localização'}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground flex items-center gap-1.5 -mt-2">
        Toque no mapa para marcar o ponto de retirada
      </p>

      {geoError && <p className="text-sm text-destructive">{geoError}</p>}

      {lat && lng && (
        <div className="flex gap-2 text-xs text-muted-foreground bg-muted/40 rounded-xl px-3 py-2">
          <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
          {lat.toFixed(5)}, {lng.toFixed(5)}
        </div>
      )}

      <FormField>
        <Label htmlFor="pickup-city">Cidade</Label>
        <Input
          id="pickup-city"
          value={data.pickupCity ?? ''}
          onChange={(e) => onChange('pickupCity', e.target.value)}
          aria-invalid={!!errors.pickupCity}
          placeholder="Ex: Feira de Santana, BA"
          className={cn('bg-muted/40 border-border', errors.pickupCity && 'border-destructive')}
        />
        <FieldError message={errors.pickupCity} />
      </FormField>

      <FormField>
        <Label htmlFor="pickup-address">
          Endereço{' '}
          <span className="text-muted-foreground text-xs font-normal">(opcional)</span>
        </Label>
        <Input
          id="pickup-address"
          value={data.pickupAddress ?? ''}
          onChange={(e) => onChange('pickupAddress', e.target.value)}
          aria-invalid={!!errors.pickupAddress}
          placeholder="Rua, número, bairro"
          className={cn(
            'bg-muted/40 border-border',
            errors.pickupAddress && 'border-destructive',
          )}
        />
        <FieldError message={errors.pickupAddress} />
      </FormField>

      <FormField>
        <Label htmlFor="pickup-instructions">
          Instruções de retirada{' '}
          <span className="text-muted-foreground text-xs font-normal">(opcional)</span>
        </Label>
        <Textarea
          id="pickup-instructions"
          value={data.pickupInstructions ?? ''}
          onChange={(e) => onChange('pickupInstructions', e.target.value)}
          aria-invalid={!!errors.pickupInstructions}
          placeholder="Ex: Ligar antes, portaria 24h, retirada aos finais de semana…"
          className={cn(
            'bg-muted/40 border-border resize-none',
            errors.pickupInstructions && 'border-destructive',
          )}
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          Ajude o solicitante a encontrar o ponto de retirada facilmente.
        </p>
        <FieldError message={errors.pickupInstructions} />
      </FormField>

    </div>
  )
}