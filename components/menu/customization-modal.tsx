'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { CartItemCustomization, MenuItemWithCustomizations, SpiceLevel } from '@/lib/types'
import { formatCurrency } from '@/lib/utils/format'

interface CustomizationModalProps {
  item: MenuItemWithCustomizations | null
  open: boolean
  onClose: () => void
  onAdd: (payload: {
    item: MenuItemWithCustomizations
    quantity: number
    spiceLevel: SpiceLevel
    customizations: CartItemCustomization[]
    instructions: string
  }) => void
}

export function CustomizationModal({ item, open, onClose, onAdd }: CustomizationModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [spiceLevel, setSpiceLevel] = useState<SpiceLevel>('medium')
  const [instructions, setInstructions] = useState('')
  const [selectedCheckboxes, setSelectedCheckboxes] = useState<Record<string, boolean>>({})
  const [selectedRadios, setSelectedRadios] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!item || !open) {
      return
    }

    setQuantity(1)
    setSpiceLevel(item.spice_level || 'medium')
    setInstructions('')
    setSelectedCheckboxes({})
    setSelectedRadios({})
  }, [item, open])

  const groupedCustomizations = useMemo(() => {
    if (!item?.menu_customizations?.length) {
      return {
        checkboxes: [] as MenuItemWithCustomizations['menu_customizations'],
        radios: {} as Record<string, NonNullable<MenuItemWithCustomizations['menu_customizations']>>
      }
    }

    const checkboxes = item.menu_customizations.filter((customization) => customization.type === 'checkbox')
    const radios = item.menu_customizations
      .filter((customization) => customization.type === 'radio')
      .reduce<Record<string, NonNullable<MenuItemWithCustomizations['menu_customizations']>>>((acc, customization) => {
        const group = customization.group_name || 'default'
        if (!acc[group]) {
          acc[group] = []
        }
        acc[group].push(customization)
        return acc
      }, {})

    return { checkboxes, radios }
  }, [item])

  const selectedCustomizations = useMemo(() => {
    if (!item?.menu_customizations?.length) {
      return [] as CartItemCustomization[]
    }

    const selected: CartItemCustomization[] = []

    for (const customization of groupedCustomizations.checkboxes || []) {
      if (selectedCheckboxes[customization.id]) {
        selected.push({
          id: customization.id,
          name: customization.name,
          price_addon: customization.price_addon,
          group_name: customization.group_name,
          type: customization.type
        })
      }
    }

    for (const [group, optionId] of Object.entries(selectedRadios)) {
      const option = item.menu_customizations.find((customization) => customization.id === optionId)
      if (option) {
        selected.push({
          id: option.id,
          name: option.name,
          price_addon: option.price_addon,
          group_name: group,
          type: option.type
        })
      }
    }

    return selected
  }, [groupedCustomizations.checkboxes, item, selectedCheckboxes, selectedRadios])

  const customizationTotal = selectedCustomizations.reduce((sum, customization) => sum + customization.price_addon, 0)
  const lineTotal = item ? (item.price + customizationTotal) * quantity : 0

  function toggleCheckbox(id: string) {
    setSelectedCheckboxes((prev) => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  function selectRadio(group: string, id: string) {
    setSelectedRadios((prev) => ({
      ...prev,
      [group]: id
    }))
  }

  if (!item) {
    return null
  }

  const modal = (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/35"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="pointer-events-auto relative flex w-full max-w-[560px] flex-col max-h-[90vh] overflow-hidden rounded-[24px] bg-white shadow-[0_2px_5px_rgba(0,0,0,0.1)] border border-cream-200/60 md:max-h-[88vh]"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-cream-200/60 p-4 md:px-6 md:py-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-[20px] md:text-[22px] font-bold leading-tight text-[#1A1A1A]">{item.name}</h3>
                  <span className="rounded-full bg-cream-100 px-2 py-0.5 text-[12px] font-medium text-[#6B6560]">
                    {formatCurrency(item.price)}
                  </span>
                </div>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#9C9590]">Customize Item</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="focus-ring flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream-200 text-[#6B6560]"
              >
                <X className="h-[16px] w-[16px]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:px-6 md:py-5">
              <div className="space-y-5">
                {groupedCustomizations.checkboxes?.length ? (
                <section>
                  <h4 className="mb-2 text-[13px] font-semibold text-[#1A1A1A]">Add-ons</h4>
                  <div className="space-y-2">
                    {groupedCustomizations.checkboxes.map((customization) => (
                      <label
                        key={customization.id}
                        className="flex cursor-pointer items-center justify-between rounded-button bg-cream-100 px-3 py-2"
                      >
                        <span className="flex items-center gap-2 text-[14px] text-[#1A1A1A]">
                          <input
                            type="checkbox"
                            checked={Boolean(selectedCheckboxes[customization.id])}
                            onChange={() => toggleCheckbox(customization.id)}
                            className="h-4 w-4 rounded-md border border-cream-400 bg-white accent-terracotta-500"
                          />
                          {customization.name}
                        </span>
                        <span className="text-[13px] font-semibold text-[#6B6560]">
                          {customization.price_addon > 0 ? `+${formatCurrency(customization.price_addon)}` : 'Free'}
                        </span>
                      </label>
                    ))}
                  </div>
                </section>
              ) : null}

              {Object.entries(groupedCustomizations.radios || {}).map(([group, options]) => (
                <section key={group}>
                  <h4 className="mb-2 text-[13px] font-semibold capitalize text-[#1A1A1A]">{group.replace('_', ' ')}</h4>
                  <div className="space-y-2">
                    {options.map((option) => (
                      <label
                        key={option.id}
                        className="flex cursor-pointer items-center justify-between rounded-button bg-cream-100 px-3 py-2"
                      >
                        <span className="flex items-center gap-2 text-[14px] text-[#1A1A1A]">
                          <input
                            type="radio"
                            name={group}
                            checked={selectedRadios[group] === option.id}
                            onChange={() => selectRadio(group, option.id)}
                            className="h-4 w-4 rounded-full border border-cream-400 bg-white accent-terracotta-500"
                          />
                          {option.name}
                        </span>
                        <span className="text-[13px] font-semibold text-[#6B6560]">
                          {option.price_addon > 0 ? `+${formatCurrency(option.price_addon)}` : 'Free'}
                        </span>
                      </label>
                    ))}
                  </div>
                </section>
              ))}

              <section>
                <h4 className="mb-2 text-[13px] font-semibold text-[#1A1A1A]">Spice Level</h4>
                <div className="grid grid-cols-3 gap-2">
                  {(['mild', 'medium', 'spicy'] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setSpiceLevel(level)}
                      className={`focus-ring rounded-button border px-3 py-2 text-[13px] font-semibold capitalize ${
                        spiceLevel === level
                          ? 'border-terracotta-500 bg-terracotta-50 text-terracotta-600'
                          : 'border-transparent bg-cream-100 text-[#6B6560]'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h4 className="mb-2 text-[13px] font-semibold text-[#1A1A1A]">Special Instructions (optional)</h4>
                <Textarea
                  maxLength={200}
                  value={instructions}
                  onChange={(event) => setInstructions(event.target.value)}
                  placeholder="No onion, less oil, extra crispy..."
                />
                <p className="mt-1 text-right text-[11px] text-[#9C9590]">{instructions.length}/200</p>
              </section>
            </div>
            </div>

            <div className="shrink-0 flex flex-row items-center gap-3 border-t border-cream-200/60 p-4 md:px-6 md:py-4 bg-white">
              <div className="flex items-center gap-1 shrink-0 rounded-[12px] bg-cream-50 p-1 border border-cream-100">
                <Button variant="secondary" size="icon" className="h-9 w-9 md:h-10 md:w-10 shrink-0" onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-6 md:w-8 text-center text-[15px] md:text-[16px] font-bold text-[#1A1A1A]">{quantity}</span>
                <Button variant="secondary" size="icon" className="h-9 w-9 md:h-10 md:w-10 shrink-0" onClick={() => setQuantity((prev) => prev + 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button
                className="flex-1 h-[44px] md:h-[48px] px-4 md:px-6 flex items-center justify-between"
                onClick={() =>
                  onAdd({
                    item,
                    quantity,
                    spiceLevel,
                    customizations: selectedCustomizations,
                    instructions: instructions.trim()
                  })
                }
              >
                <span className="font-medium">Add to Cart</span>
                <span className="font-bold">{formatCurrency(lineTotal)}</span>
              </Button>
            </div>
          </motion.div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  )

  return typeof window !== 'undefined' ? createPortal(modal, document.body) : null
}
