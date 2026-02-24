'use client'

import { useEffect, useMemo, useState } from 'react'
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

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/35"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-y-auto rounded-t-[24px] bg-white p-5 shadow-warmXl md:inset-x-auto md:left-1/2 md:top-1/2 md:max-h-[88vh] md:w-[560px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-card md:p-7"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9C9590]">Customize Item</p>
                <h3 className="font-display text-[26px] font-bold text-[#1A1A1A]">{item.name}</h3>
                <p className="mt-1 text-[14px] text-[#6B6560]">{formatCurrency(item.price)} base price</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="focus-ring flex h-9 w-9 items-center justify-center rounded-full bg-cream-200 text-[#6B6560]"
              >
                <X className="h-[18px] w-[18px]" />
              </button>
            </div>

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

              <section className="flex items-center justify-between rounded-card bg-cream-50 px-4 py-3">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9C9590]">Quantity</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Button variant="secondary" size="icon" onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center text-[16px] font-semibold text-[#1A1A1A]">{quantity}</span>
                    <Button variant="secondary" size="icon" onClick={() => setQuantity((prev) => prev + 1)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9C9590]">Total</p>
                  <p className="font-display text-[24px] font-bold text-[#1A1A1A]">{formatCurrency(lineTotal)}</p>
                </div>
              </section>

              <Button
                className="w-full"
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
                Add to Cart
              </Button>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  )
}
