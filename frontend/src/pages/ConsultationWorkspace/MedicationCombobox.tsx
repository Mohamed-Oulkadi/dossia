import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useMedicationSearch, type MedicationCatalogItem } from '@/hooks/use-clinical-library'
import { Pill, Search, Check, Sparkles } from 'lucide-react'

interface MedicationComboboxProps {
  value: string
  onChange: (value: string) => void
  onSelectMedication?: (item: MedicationCatalogItem) => void
  placeholder?: string
  className?: string
}

export function MedicationCombobox({
  value,
  onChange,
  onSelectMedication,
  placeholder = 'Nom du médicament ou DCI (ex: Augmentin, Doliprane…)',
  className = '',
}: MedicationComboboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState(value)
  const prevValueRef = useRef(value)
  const containerRef = useRef<HTMLDivElement>(null)

  // Keep internal query synchronized if external value changes
  if (prevValueRef.current !== value) {
    prevValueRef.current = value
    setQuery(value)
  }

  const { data: suggestions = [], isLoading } = useMedicationSearch(query)

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (item: MedicationCatalogItem) => {
    setQuery(item.brandName)
    onChange(item.brandName)
    if (onSelectMedication) {
      onSelectMedication(item)
    }
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            onChange(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => {
            if (query.trim().length >= 2) {
              setIsOpen(true)
            }
          }}
          placeholder={placeholder}
          className={`h-8 text-xs font-semibold pl-7 pr-7 ${className}`}
        />
        <Pill className="w-3.5 h-3.5 text-zinc-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none stroke-[1.5]" />
        {isLoading && (
          <Search className="w-3 h-3 text-emerald-500 animate-pulse absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        )}
      </div>

      {/* Floating Suggestions Dropdown */}
      {isOpen && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 max-h-64 overflow-y-auto rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-lg shadow-black/10 py-1">
          <div className="px-2.5 py-1 text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60 mb-1">
            <span>Catalogue Officiel Maroc (DMP)</span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <Sparkles className="w-2.5 h-2.5" /> 1-Click Posologie
            </span>
          </div>

          {suggestions.length === 0 ? (
            <div className="px-3 py-3 text-center text-xs text-zinc-500">
              {isLoading ? (
                <span>Recherche dans le catalogue…</span>
              ) : (
                <div className="space-y-1">
                  <p className="font-medium text-zinc-700 dark:text-zinc-300">Aucun résultat exact dans le catalogue</p>
                  <p className="text-[11px] text-zinc-400">
                    Vous pouvez prescrire &quot;{query}&quot; librement en saisie manuelle.
                  </p>
                </div>
              )}
            </div>
          ) : (
            suggestions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-zinc-900/80 transition-colors flex items-start justify-between gap-3 border-b border-zinc-50 dark:border-zinc-900 last:border-0 cursor-pointer group"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {item.brandName}
                    </span>
                    <Badge variant="outline" className="font-mono text-[9px] py-0 px-1 border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400">
                      {item.dosage} · {item.form}
                    </Badge>
                  </div>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate font-mono">
                    DCI: <span className="text-zinc-700 dark:text-zinc-300">{item.dci}</span>
                  </div>
                  {item.defaultPosology && (
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                      Posologie usuelle: {item.defaultPosology}
                    </div>
                  )}
                </div>

                <div className="text-right flex-shrink-0 space-y-0.5">
                  <div className="font-mono text-xs font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                    {item.ppvMad.toFixed(2)} <span className="text-[10px] font-normal text-zinc-500">DH</span>
                  </div>
                  {item.isReimbursable && (
                    <Badge className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[9px] py-0 px-1">
                      AMO <Check className="w-2.5 h-2.5 inline ml-0.5" />
                    </Badge>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
