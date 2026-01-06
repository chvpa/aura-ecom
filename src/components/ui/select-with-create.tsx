"use client"

import * as React from "react"
import { useState } from "react"
import { Plus, Check } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils/cn"

interface SelectWithCreateProps {
  value?: string
  onValueChange?: (value: string) => void
  options: string[]
  onCreateOption?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  emptyText?: string
}

export function SelectWithCreate({
  value,
  onValueChange,
  options,
  onCreateOption,
  placeholder = "Seleccionar...",
  className,
  disabled,
  emptyText = "Sin opciones",
}: SelectWithCreateProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [newValue, setNewValue] = useState("")
  const [open, setOpen] = useState(false)

  const handleCreateClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsCreating(true)
    setNewValue("")
  }

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const trimmedValue = newValue.trim()
    if (trimmedValue && onCreateOption) {
      onCreateOption(trimmedValue)
      if (onValueChange) {
        onValueChange(trimmedValue)
      }
      setNewValue("")
      setIsCreating(false)
      setOpen(false)
    }
  }

  const handleCreateCancel = () => {
    setIsCreating(false)
    setNewValue("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleCreateCancel()
    } else if (e.key === "Enter" && newValue.trim()) {
      handleCreateSubmit(e)
    }
  }

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      open={open}
      onOpenChange={setOpen}
      disabled={disabled}
    >
      <SelectTrigger className={cn(className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        <SelectScrollUpButton />
        <div className="p-1">
          {options.length > 0 && options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
          
          {isCreating ? (
            <form onSubmit={handleCreateSubmit} className="px-2 py-1.5" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2">
                <Input
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={(e) => {
                    // Solo cancelar si el blur no es hacia el botón de check
                    if (!e.currentTarget.parentElement?.contains(e.relatedTarget as Node)) {
                      handleCreateCancel()
                    }
                  }}
                  placeholder="Nueva opción..."
                  className="h-8 text-sm"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  type="submit"
                  className="flex h-8 w-8 items-center justify-center rounded-sm hover:bg-accent"
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    handleCreateSubmit(e)
                  }}
                >
                  <Check className="h-4 w-4" />
                </button>
              </div>
            </form>
          ) : (
            onCreateOption && (
              <div
                className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                onClick={handleCreateClick}
                onMouseDown={(e) => e.preventDefault()}
              >
                <Plus className="mr-2 h-4 w-4" />
                <span>Crear nueva opción</span>
              </div>
            )
          )}
          {options.length === 0 && !isCreating && !onCreateOption && (
            <div className="px-2 py-1.5 text-sm text-muted-foreground text-center">
              {emptyText}
            </div>
          )}
        </div>
        <SelectScrollDownButton />
      </SelectContent>
    </Select>
  )
}

