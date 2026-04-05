'use client'

import { useTranslations } from 'next-intl'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Category, ProductFilters as Filters } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'

interface ProductFiltersProps {
  filters: Filters
  categories: Category[]
  onFilterChange: (filters: Filters) => void
}

export function ProductFilters({
  filters,
  categories,
  onFilterChange,
}: ProductFiltersProps) {
  const t = useTranslations('products')
  const tCommon = useTranslations('common')

  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filters, search: value, page: 1 })
  }

  const handleCategoryChange = (value: string) => {
    onFilterChange({
      ...filters,
      categoryId: value === 'all' ? undefined : value,
      page: 1,
    })
  }

  const handleSortChange = (value: string) => {
    onFilterChange({
      ...filters,
      sortBy: value as Filters['sortBy'],
      page: 1,
    })
  }

  const handlePriceChange = (min?: number, max?: number) => {
    onFilterChange({
      ...filters,
      minPrice: min,
      maxPrice: max,
      page: 1,
    })
  }

  const clearFilters = () => {
    onFilterChange({
      page: 1,
      limit: filters.limit,
    })
  }

  const hasActiveFilters = filters.search || filters.categoryId || filters.minPrice || filters.maxPrice

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={tCommon('search')}
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-12 pl-11 pr-4 rounded-xl bg-muted/50 border-0 focus-visible:ring-accent"
          />
        </div>

        {/* Category Select */}
        <Select
          value={filters.categoryId || 'all'}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger className="w-full sm:w-[180px] h-12 rounded-xl bg-muted/50 border-0">
            <SelectValue placeholder={t('category')} />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all" className="rounded-lg">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id} className="rounded-lg">
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort Select */}
        <Select
          value={filters.sortBy || 'newest'}
          onValueChange={handleSortChange}
        >
          <SelectTrigger className="w-full sm:w-[180px] h-12 rounded-xl bg-muted/50 border-0">
            <SelectValue placeholder={tCommon('sortBy')} />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="newest" className="rounded-lg">{t('sortNewest')}</SelectItem>
            <SelectItem value="oldest" className="rounded-lg">{t('sortOldest')}</SelectItem>
            <SelectItem value="price-asc" className="rounded-lg">{t('sortPriceAsc')}</SelectItem>
            <SelectItem value="price-desc" className="rounded-lg">{t('sortPriceDesc')}</SelectItem>
          </SelectContent>
        </Select>

        {/* Filter Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="h-12 w-12 sm:w-auto sm:px-4 rounded-xl border-0 bg-muted/50 hover:bg-accent hover:text-accent-foreground"
            >
              <SlidersHorizontal className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Filters</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:w-[400px] border-0">
            <SheetHeader className="pb-6 border-b">
              <SheetTitle className="text-xl font-bold">{tCommon('filter')}</SheetTitle>
            </SheetHeader>
            <div className="space-y-8 mt-8">
              {/* Price Range */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">{t('price')}</Label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground mb-2 block">Minimum</Label>
                    <Input
                      type="number"
                      placeholder="$0"
                      value={filters.minPrice || ''}
                      onChange={(e) =>
                        handlePriceChange(
                          e.target.value ? Number(e.target.value) : undefined,
                          filters.maxPrice
                        )
                      }
                      className="h-12 rounded-xl bg-muted/50 border-0"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground mb-2 block">Maximum</Label>
                    <Input
                      type="number"
                      placeholder="$999"
                      value={filters.maxPrice || ''}
                      onChange={(e) =>
                        handlePriceChange(
                          filters.minPrice,
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      className="h-12 rounded-xl bg-muted/50 border-0"
                    />
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full h-12 rounded-xl gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear all filters
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm">
              Search: {filters.search}
              <button onClick={() => handleSearchChange('')}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.categoryId && (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm">
              {categories.find(c => c.id === filters.categoryId)?.name}
              <button onClick={() => handleCategoryChange('all')}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}
