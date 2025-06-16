"use client"

import { useRouter, useSearchParams } from "next/navigation"

interface SortSelectProps {
  currentSort?: string
}

export function SortSelect({ currentSort }: SortSelectProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value) {
      params.set('sort', value)
    } else {
      params.delete('sort')
    }
    
    router.push(`/products?${params.toString()}`)
  }

  return (
    <select
      className="px-3 py-2 border rounded-md text-sm"
      defaultValue={currentSort || ""}
      onChange={(e) => handleSortChange(e.target.value)}
    >
      <option value="">Trier par</option>
      <option value="name">Nom A-Z</option>
      <option value="price-asc">Prix croissant</option>
      <option value="price-desc">Prix décroissant</option>
    </select>
  )
} 