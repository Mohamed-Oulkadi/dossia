import { useState } from 'react'
import { useDocumentBlobUrl, type PatientDocument } from '@/hooks/use-documents'
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Contrast,
  FileText,
  Loader2,
  ShieldAlert,
  Maximize2,
  Minimize2,
  Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SplitDocumentViewerProps {
  document: PatientDocument | null
  onClose: () => void
}

export function SplitDocumentViewer({ document, onClose }: SplitDocumentViewerProps) {
  const { blobUrl, isLoading, isError, error } = useDocumentBlobUrl(document?.id ?? null)
  const [zoomLevel, setZoomLevel] = useState<number>(100)
  const [invertContrast, setInvertContrast] = useState<boolean>(false)
  const [isExpanded, setIsExpanded] = useState<boolean>(false)

  if (!document) return null

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
    <div
      className={`fixed top-12 bottom-0 right-0 z-40 bg-zinc-900 border-l border-zinc-800 shadow-2xl flex flex-col transition-all duration-200 ${
        isExpanded ? 'w-full md:w-3/4 lg:w-2/3' : 'w-full md:w-1/2 lg:w-[480px] xl:w-[540px]'
      }`}
    >
      {/* Header Toolbar */}
      <div className="h-11 px-3 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between gap-2 flex-shrink-0 text-zinc-100">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-semibold truncate text-zinc-100" title={document.originalFilename}>
            {document.originalFilename}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">
            {document.category}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {isImage && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setInvertContrast((v) => !v)}
                className={`h-6 px-1.5 text-[10px] gap-1 ${
                  invertContrast
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Inversion négatif (Mode Négatoscope Radiologique)"
              >
                <Contrast className="w-3 h-3" />
                <span className="hidden sm:inline">Négatoscope</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                className="h-6 w-6 p-0 text-zinc-400 hover:text-white"
                title="Zoom arrière"
              >
                <ZoomOut className="w-3 h-3" />
              </Button>

              <span className="text-[10px] font-mono text-zinc-400 w-9 text-center">
                {zoomLevel}%
              </span>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                className="h-6 w-6 p-0 text-zinc-400 hover:text-white"
                title="Zoom avant"
              >
                <ZoomIn className="w-3 h-3" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetZoom}
                className="h-6 w-6 p-0 text-zinc-400 hover:text-white"
                title="Réinitialiser zoom"
              >
                <RotateCcw className="w-3 h-3" />
              </Button>

              <div className="h-3 w-px bg-zinc-800 mx-0.5" />
            </>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            disabled={!blobUrl}
            className="h-6 w-6 p-0 text-zinc-400 hover:text-white"
            title="Télécharger"
          >
            <Download className="w-3 h-3" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded((e) => !e)}
            className="h-6 w-6 p-0 text-zinc-400 hover:text-white"
            title={isExpanded ? 'Réduire' : 'Agrandir'}
          >
            {isExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0 text-zinc-400 hover:text-white ml-0.5"
            title="Fermer le visualiseur"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Document View Area */}
      <div className="flex-1 bg-zinc-950 flex items-center justify-center overflow-auto p-2 select-none relative">
        {isLoading && (
          <div className="flex flex-col items-center gap-2 text-zinc-400">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            <span className="text-xs">Chargement du document…</span>
          </div>
        )}

        {isError && (
          <div className="p-4 text-center text-rose-400 space-y-1">
            <ShieldAlert className="w-6 h-6 mx-auto" />
            <p className="text-xs font-semibold">Erreur de chargement</p>
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
              className="rounded shadow-md object-contain pointer-events-none"
            />
          </div>
        )}
      </div>
    </div>
  )
}
