import { useState } from 'react'
import { useDocumentBlobUrl, type PatientDocument } from '@/hooks/use-documents'
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Contrast,
  FileText,
  Loader2,
  ShieldAlert,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DocumentPreviewModalProps {
  document: PatientDocument | null
  isOpen: boolean
  onClose: () => void
}

export function DocumentPreviewModal({ document, isOpen, onClose }: DocumentPreviewModalProps) {
  const { blobUrl, isLoading, isError, error } = useDocumentBlobUrl(document?.id ?? null)
  const [zoomLevel, setZoomLevel] = useState<number>(100)
  const [invertContrast, setInvertContrast] = useState<boolean>(false)

  if (!isOpen || !document) return null

  const isPdf = document.contentType === 'application/pdf'
  const isImage = document.contentType.startsWith('image/')

  const handleZoomIn = () => setZoomLevel((z) => Math.min(250, z + 25))
  const handleZoomOut = () => setZoomLevel((z) => Math.max(50, z - 25))
  const handleResetZoom = () => {
    setZoomLevel(100)
    setInvertContrast(false)
  }

  const handleDownload = () => {
    if (!blobUrl) return
    const a = window.document.createElement('a')
    a.href = blobUrl
    a.download = document.originalFilename
    window.document.body.appendChild(a)
    a.click()
    window.document.body.removeChild(a)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in-0 duration-150">
      <div className="relative w-full max-w-5xl h-[88vh] bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl flex flex-col overflow-hidden text-zinc-100">
        {/* Header Toolbar */}
        <div className="h-13 px-4 border-b border-zinc-800 bg-zinc-950/80 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded bg-zinc-800 text-zinc-300">
              {isPdf ? <FileText className="w-4 h-4 text-rose-400" /> : <Eye className="w-4 h-4 text-emerald-400" />}
            </div>
            <div className="min-w-0">
              <h2 className="text-xs font-semibold text-zinc-100 truncate" title={document.originalFilename}>
                {document.originalFilename}
              </h2>
              <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                <span className="font-mono">{document.category}</span>
                <span>•</span>
                <span className="font-mono">{(document.fileSizeBytes / (1024 * 1024)).toFixed(2)} Mo</span>
              </div>
            </div>
          </div>

          {/* Imaging & Zoom Controls for Radiography / Photos */}
          <div className="flex items-center gap-1.5">
            {isImage && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setInvertContrast((v) => !v)}
                  className={`h-7 px-2 text-xs gap-1.5 ${
                    invertContrast
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                  }`}
                  title="Inversion négatif (Mode Négatoscope Radiologique)"
                >
                  <Contrast className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Négatoscope</span>
                </Button>

                <div className="h-4 w-px bg-zinc-800 mx-1" />

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  className="h-7 w-7 p-0 text-zinc-300 hover:text-white hover:bg-zinc-800"
                  title="Zoom arrière"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </Button>

                <span className="text-[11px] font-mono text-zinc-400 w-11 text-center select-none">
                  {zoomLevel}%
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  className="h-7 w-7 p-0 text-zinc-300 hover:text-white hover:bg-zinc-800"
                  title="Zoom avant"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetZoom}
                  className="h-7 w-7 p-0 text-zinc-300 hover:text-white hover:bg-zinc-800"
                  title="Réinitialiser zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </Button>

                <div className="h-4 w-px bg-zinc-800 mx-1" />
              </>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={!blobUrl}
              className="h-7 px-2 text-xs gap-1.5 bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Télécharger</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-7 w-7 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800 ml-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 bg-zinc-950 flex items-center justify-center overflow-auto p-4 select-none">
          {isLoading && (
            <div className="flex flex-col items-center gap-2 text-zinc-400">
              <Loader2 className="w-7 h-7 animate-spin text-emerald-500" />
              <span className="text-xs">Déchiffrement et streaming sécurisé MinIO…</span>
            </div>
          )}

          {isError && (
            <div className="max-w-md text-center p-6 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 space-y-2">
              <ShieldAlert className="w-8 h-8 text-rose-400 mx-auto" />
              <p className="text-xs font-semibold">Accès refusé ou document introuvable</p>
              <p className="text-[11px] text-zinc-400">{error}</p>
            </div>
          )}

          {!isLoading && !isError && blobUrl && isPdf && (
            <iframe
              src={`${blobUrl}#toolbar=0`}
              className="w-full h-full rounded border-0 bg-white"
              title={document.originalFilename}
            />
          )}

          {!isLoading && !isError && blobUrl && isImage && (
            <div className="overflow-auto max-h-full max-w-full flex items-center justify-center">
              <img
                src={blobUrl}
                alt={document.originalFilename}
                style={{
                  width: `${zoomLevel}%`,
                  filter: invertContrast ? 'invert(1) contrast(150%) hue-rotate(180deg)' : 'none',
                  transition: 'filter 0.15s ease, width 0.1s ease',
                }}
                className="rounded shadow-lg object-contain pointer-events-none"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
