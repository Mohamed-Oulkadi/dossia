import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCreatePrescriptionTemplate, type TemplatePrescriptionItem } from '@/hooks/use-clinical-library'
import { BookmarkPlus, Loader2 } from 'lucide-react'

interface SaveTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  items: TemplatePrescriptionItem[]
}

const COMMON_CATEGORIES = [
  'Médecine Générale',
  'Cardiologie',
  'Pneumologie',
  'Gastro-entérologie',
  'Pédiatrie',
  'Dermatologie',
  'ORL',
  'Rhumatologie',
]

export function SaveTemplateModal({ isOpen, onClose, items }: SaveTemplateModalProps) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Médecine Générale')
  const createTemplate = useCreatePrescriptionTemplate()

  const validItems = items.filter((i) => i.medicationName.trim().length > 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || validItems.length === 0) return

    await createTemplate.mutateAsync({
      title: title.trim(),
      category: category.trim(),
      items: validItems,
    })

    setTitle('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <BookmarkPlus className="w-5 h-5 stroke-[1.5]" />
            <DialogTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Enregistrer comme Ordonnance Type
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-zinc-500">
            Créez un protocole réutilisable en 1-click pour l&apos;ensemble de votre cabinet médical.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              Nom du protocole / Titre de l&apos;ordonnance type *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: HTA Bithérapie - Suivi Semestriel"
              className="h-8 text-xs font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              Spécialité / Catégorie
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                    category === cat
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ou saisir une autre catégorie…"
              className="h-7 text-xs font-mono"
            />
          </div>

          <div className="rounded-md border border-zinc-200 dark:border-zinc-800 p-2.5 bg-slate-50/50 dark:bg-zinc-900/30">
            <div className="text-[10px] font-mono text-zinc-500 uppercase mb-1.5">
              Médicaments inclus ({validItems.length}):
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
              {validItems.map((item, idx) => (
                <div key={idx} className="text-xs text-zinc-800 dark:text-zinc-200 font-mono flex items-center justify-between">
                  <span className="font-semibold truncate">{item.medicationName}</span>
                  <span className="text-[10px] text-zinc-500 flex-shrink-0 ml-2">{item.dosage}</span>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
              Annuler
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createTemplate.isPending || !title.trim() || validItems.length === 0}
              className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
            >
              {createTemplate.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Enregistrement…
                </>
              ) : (
                'Enregistrer le modèle'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
