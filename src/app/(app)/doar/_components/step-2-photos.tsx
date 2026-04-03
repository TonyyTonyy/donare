'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { Camera, X, Star, ImagePlus, RefreshCw, SwitchCamera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { DonationFormData, FormData, FormErrors } from './donation-step-schema'

type CaptureMode = 'idle' | 'camera'

interface Step2PhotosProps {
  data: FormData
  onChange: (field: keyof DonationFormData, value: unknown) => void
  errors: FormErrors
}

export function Step2Photos({ data, onChange, errors }: Step2PhotosProps) {
  const images: string[] = data.images ?? []
  const primaryIdx: number = data.primaryImageIndex ?? 0

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [mode, setMode] = useState<CaptureMode>('idle')
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)

  useEffect(() => {
    return () => stopStream()
  }, [])

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  const startCamera = useCallback(
    async (facing: 'environment' | 'user' = facingMode) => {
      setCameraError(null)
      stopStream()

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
        })
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        setMode('camera')
      } catch (err: unknown) {
        const name = err instanceof Error ? (err as any).name : ''
        if (name === 'NotAllowedError') {
          setCameraError('Permissão de câmera negada. Você pode enviar fotos da galeria.')
        } else {
          setCameraError('Câmera indisponível. Tente enviar da galeria.')
        }
        setMode('idle')
      }
    },
    [facingMode],
  )

  const flipCamera = async () => {
    const next = facingMode === 'environment' ? 'user' : 'environment'
    setFacingMode(next)
    await startCamera(next)
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    setIsCapturing(true)

    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')!.drawImage(video, 0, 0)

    const dataUrl = canvas.toDataURL('image/jpeg', 0.65)
    const updated = [...images, dataUrl]
    onChange('images', updated)
    if (updated.length === 1) onChange('primaryImageIndex', 0)

    setTimeout(() => setIsCapturing(false), 300)
  }

  const closeCamera = () => {
    stopStream()
    setMode('idle')
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const remaining = 8 - images.length
    const toProcess = files.slice(0, remaining)

    const results: string[] = []
    let loaded = 0

    toProcess.forEach((file, i) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        results[i] = ev.target?.result as string
        loaded++
        if (loaded === toProcess.length) {
          const updated = [...images, ...results]
          onChange('images', updated)
          if (images.length === 0 && updated.length > 0) {
            onChange('primaryImageIndex', 0)
          }
        }
      }
      reader.readAsDataURL(file)
    })

    e.target.value = ''
  }

  const removeImage = (idx: number) => {
    const updated = images.filter((_, i) => i !== idx)
    onChange('images', updated)
    if (primaryIdx >= updated.length) {
      onChange('primaryImageIndex', Math.max(0, updated.length - 1))
    }
  }

  const setPrimary = (idx: number) => {
    onChange('primaryImageIndex', idx)
  }

  const canAddMore = images.length < 8

  return (
    <div className="space-y-5">

      {mode === 'camera' && (
        <div className="relative rounded-2xl overflow-hidden bg-black aspect-4/3 w-full">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          <div
            className={cn(
              'absolute inset-0 bg-white transition-opacity duration-150 pointer-events-none',
              isCapturing ? 'opacity-80' : 'opacity-0',
            )}
          />

          <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-6">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="rounded-full bg-black/40 text-white hover:bg-black/60 w-10 h-10"
              onClick={flipCamera}
            >
              <SwitchCamera className="w-4 h-4" />
            </Button>

            <button
              type="button"
              onClick={capturePhoto}
              disabled={!canAddMore}
              className="w-16 h-16 rounded-full border-4 border-white bg-white/20 hover:bg-white/30 transition-transform active:scale-90 disabled:opacity-40"
            />

            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="rounded-full bg-black/40 text-white hover:bg-black/60 w-10 h-10"
              onClick={closeCamera}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">
            {images.length}/8
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      {mode !== 'camera' && canAddMore && (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => startCamera()}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/40 bg-accent/30 hover:bg-accent/50 hover:border-primary/70 transition-all py-5 text-primary"
          >
            <Camera className="w-6 h-6" />
            <span className="text-sm font-medium">Abrir câmera</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/50 transition-all py-5 text-muted-foreground hover:text-foreground"
          >
            <ImagePlus className="w-6 h-6" />
            <span className="text-sm font-medium">Da galeria</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      )}

      {cameraError && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <RefreshCw className="w-4 h-4 mt-0.5 shrink-0" />
          {cameraError}
        </div>
      )}

      {errors.images && (
        <p className="text-xs text-destructive">{errors.images}</p>
      )}

      {images.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">
            Toque na ⭐ para definir como capa · {images.length}/8 fotos
          </p>
          <div className="grid grid-cols-3 gap-2">
            {images.map((src, idx) => (
              <div
                key={idx}
                className={cn(
                  'relative aspect-square rounded-xl overflow-hidden border-2 transition-all',
                  primaryIdx === idx ? 'border-primary' : 'border-transparent',
                )}
              >
                <img src={src} alt="" className="w-full h-full object-cover" />

                <button
                  type="button"
                  onClick={() => setPrimary(idx)}
                  className={cn(
                    'absolute top-1.5 left-1.5 w-7 h-7 rounded-full flex items-center justify-center transition-all',
                    primaryIdx === idx
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-black/40 text-white hover:bg-black/60',
                  )}
                >
                  <Star className={cn('w-3.5 h-3.5', primaryIdx === idx && 'fill-current')} />
                </button>

                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/40 hover:bg-destructive flex items-center justify-center text-white transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {primaryIdx === idx && (
                  <div className="absolute bottom-0 inset-x-0 bg-primary/90 text-primary-foreground text-[10px] font-medium text-center py-0.5">
                    Capa
                  </div>
                )}
              </div>
            ))}

            {canAddMore && mode !== 'camera' && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
              >
                <ImagePlus className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  )
}