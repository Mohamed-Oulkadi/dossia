import { useState, useRef, useMemo } from 'react'
import {
  usePatientDocuments,
  useUploadDocument,
  useDeleteDocument,
  type PatientDocument,
  type DocumentCategory,
} from '@/hooks/use-documents'
import { useAuthStore } from '@/store/useAuthStore'
import { DocumentPreviewModal } from './DocumentPreviewModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Lock,
  Users,
  Eye,
  Trash2,
  AlertCircle,
  Loader2,
  FileCheck,
  Shield,
  FileSearch,
} from 'lucide-react'
import { toast } from 'sonner'

interface PatientDocumentVaultProps {
  patientId: string
  consultationId?: string | null
  compact?: boolean
  onPreviewDocument?: (doc: PatientDocument) => void
}

const CATEGORIES: { id: DocumentCategory; label: string; icon: any; color: string }[] = [
  { id: 'BIOLOGIE', label: 'Bilan Biologique', icon: FileCheck, color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 border-sky-200 dark:border-sky-800' },
  { id: 'RADIOLOGIE_IMAGERIE', label: 'Radiologie / Écho', icon: ImageIcon, color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800' },
  { id: 'COMPTE_RENDU', label: 'Compte-Rendu', icon: FileText, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800' },
  { id: 'ADMINISTRATIF_CNSS', label: 'Administratif / CNSS', icon: Shield, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800' },
]

export function PatientDocumentVault({
  patientId,
  consultationId,
  compact: _compact = false,
  onPreviewDocument,
}: PatientDocumentVaultProps) {
  const { user } = useAuthStore()
  const isDoctor = user?.role === 'DOCTOR'

  const { data: documents = [], isLoading, isError } = usePatientDocuments(patientId)
  const uploadMutation = useUploadDocument()
  const deleteMutation = useDeleteDocument()

  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>(
    isDoctor ? 'BIOLOGIE' : 'ADMINISTRATIF_CNSS'
  )
  const [description, setDescription] = useState<string>('')
  const [dragActive, setDragActive] = useState<boolean>(false)
  const [previewDoc, setPreviewDoc] = useState<PatientDocument | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0])
    }
  }

  const handleFileSelected = (file: File) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      toast.error('Format non autorisé', {
        description: 'Veuillez sélectionner un fichier PDF, JPEG, PNG ou WEBP.',
      })
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Fichier trop volumineux', {
        description: 'La taille maximale autorisée est de 10 Mo.',
      })
      return
    }

    uploadMutation.mutate(
      {
        patientId,
        consultationId,
        category: selectedCategory,
        description: description.trim() || undefined,
        file,
      },
      {
        onSuccess: () => {
          setDescription('')
          if (fileInputRef.current) fileInputRef.current.value = ''
        },
      }
    )
  }

  const handleDelete = (doc: PatientDocument) => {
    if (window.confirm(`Voulez-vous vraiment archiver "${doc.originalFilename}" ?`)) {
      deleteMutation.mutate({ id: doc.id, patientId: doc.patientId })
    }
  }

  const filteredDocuments = useMemo(() => {
    if (categoryFilter === 'ALL') return documents
    return documents.filter((d) => d.category === categoryFilter)
  }, [documents, categoryFilter])

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) {
      return `${bytes} o`
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} Ko`
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`
  }

  const handleOpenPreview = (doc: PatientDocument) => {
    if (onPreviewDocument) {
      onPreviewDocument(doc)
    } else {
      setPreviewDoc(doc)
    }
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* ── Drag & Drop Upload Zone ── */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative p-3.5 rounded-lg border-2 border-dashed transition-all ${
          dragActive
            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
            : 'border-zinc-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={uploadMutation.isPending}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase text-zinc-500 dark:text-zinc-400">
                Catégorie :
              </span>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`text-[11px] font-medium px-2 py-0.5 rounded border transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? `${cat.color} font-semibold shadow-2xs`
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Note descriptive optionnelle (ex: Radio thorax face + profil)..."
                className="h-7 text-xs bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-2xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              type="button"
              size="sm"
              disabled={uploadMutation.isPending}
              onClick={() => fileInputRef.current?.click()}
              className="h-8 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-2xs"
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Chiffrement MinIO…</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Sélectionner ou glisser</span>
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-zinc-600 dark:text-zinc-400 mt-2 font-mono">
          <span>Formats : PDF, JPEG, PNG, WEBP (Max 10 Mo)</span>
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-600" />
            Hébergement Local Marocain (CNDP Loi 09-08)
          </span>
        </div>
      </div>

      {/* ── Document Vault Filter Bar ── */}
      <div className="flex items-center justify-between pb-1 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-1.5">
          <FileSearch className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
            Documents Enregistrés ({filteredDocuments.length})
          </h3>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCategoryFilter('ALL')}
            className={`px-2 py-0.5 text-[10px] font-mono rounded cursor-pointer ${
              categoryFilter === 'ALL'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            Tous ({documents.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = documents.filter((d) => d.category === cat.id).length
            if (count === 0) return null
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-2 py-0.5 text-[10px] font-mono rounded cursor-pointer ${
                  categoryFilter === cat.id
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                {cat.label} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Document Table / List ── */}
      <div className="flex-1 overflow-auto rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        {isLoading && (
          <div className="p-8 flex flex-col items-center justify-center text-zinc-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            <span className="text-xs">Chargement du coffre-fort…</span>
          </div>
        )}

        {isError && (
          <div className="p-6 text-center text-rose-500 space-y-1">
            <AlertCircle className="w-6 h-6 mx-auto" />
            <p className="text-xs font-medium">Erreur lors de la récupération des documents.</p>
          </div>
        )}

        {!isLoading && !isError && filteredDocuments.length === 0 && (
          <div className="p-10 text-center space-y-2 text-zinc-400">
            <UploadCloud className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-700 stroke-[1.5]" />
            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Aucun document dans le coffre-fort
            </p>
            <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
              Glissez-déposez des analyses biologiques, radiographies ou scans administratifs ci-dessus.
            </p>
          </div>
        )}

        {!isLoading && !isError && filteredDocuments.length > 0 && (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-slate-100/70 dark:bg-zinc-900/60 text-[10px] font-medium text-zinc-500 uppercase tracking-wider select-none">
                <th className="py-2 px-3">Document</th>
                <th className="py-2 px-3">Catégorie</th>
                <th className="py-2 px-3">Confidentialité</th>
                <th className="py-2 px-3">Taille</th>
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/70">
              {filteredDocuments.map((doc) => {
                const isPdf = doc.contentType === 'application/pdf'
                const isDocOnly = doc.visibilityLevel === 'DOCTOR_ONLY'

                return (
                  <tr
                    key={doc.id}
                    className="h-10 hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors group"
                  >
                    {/* Filename & Description */}
                    <td className="py-2 px-3 max-w-[220px]">
                      <div className="flex items-center gap-2 min-w-0">
                        {isPdf ? (
                          <FileText className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                        ) : (
                          <ImageIcon className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate" title={doc.originalFilename}>
                            {doc.originalFilename}
                          </p>
                          {doc.description && (
                            <p className="text-[10px] text-zinc-600 dark:text-zinc-400 truncate" title={doc.description}>
                              {doc.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono border bg-slate-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800">
                        {doc.category}
                      </span>
                    </td>

                    {/* CNDP Visibility */}
                    <td className="py-2 px-3 whitespace-nowrap">
                      {isDocOnly ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
                          <Lock className="w-2.5 h-2.5" />
                          <span>Secret Médical</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                          <Users className="w-2.5 h-2.5" />
                          <span>Partagé</span>
                        </span>
                      )}
                    </td>

                    {/* File Size */}
                    <td className="py-2 px-3 font-mono tabular-nums text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                      {formatFileSize(doc.fileSizeBytes)}
                    </td>

                    {/* Upload Date */}
                    <td className="py-2 px-3 font-mono text-[11px] text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                      {new Date(doc.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-2 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenPreview(doc)}
                          className="h-6 px-1.5 text-[11px] gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer"
                          title="Aperçu / Négatoscope"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Aperçu</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(doc)}
                          className="h-6 w-6 p-0 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                          title="Archiver document"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Standalone Lightbox Modal (when not in split view) */}
      <DocumentPreviewModal
        document={previewDoc}
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
      />
    </div>
  )
}
