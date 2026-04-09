'use client'

import { useEffect, useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  Package,
  ImageIcon,
  Star,
  Filter,
  MoreVertical,
} from "lucide-react";
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProductForm } from '@/components/admin/ProductForm'
import { ProductsService } from '@/services/products.service'
import { CategoriesService } from '@/services/categories.service'
import { StorageService } from '@/services/storage.service'
import { Product, ProductCreateData, Category } from '@/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function AdminProductsPage() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        ProductsService.getAll({ limit: 100 }),
        CategoriesService.getAll(),
      ]);
      setProducts(productsData.items);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(tCommon("error"));
    } finally {
      setLoading(false);
    }
  }, [tCommon]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async (data: ProductCreateData) => {
    try {
      const newProduct = await ProductsService.create(data);
      setProducts([newProduct, ...products]);
      toast.success(t("productCreated"));
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error(tCommon("error"));
      throw error;
    }
  };

  const handleUpdate = async (data: ProductCreateData) => {
    if (!editingProduct) return;

    try {
      await ProductsService.update(editingProduct.id, data);
      setProducts(
        products.map((p) =>
          p.id === editingProduct.id ? { ...p, ...data } : p,
        ),
      );
      setEditingProduct(null);
      toast.success(t("productUpdated"));
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(tCommon("error"));
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!deleteProduct) return;

    setIsDeleting(true);
    try {
      await StorageService.deleteProductImages(deleteProduct.id);
      await ProductsService.delete(deleteProduct.id);
      setProducts(products.filter((p) => p.id !== deleteProduct.id));
      setDeleteProduct(null);
      toast.success(t("productDeleted"));
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(tCommon("error"));
    } finally {
      setIsDeleting(false);
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "Unknown";
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || product.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-light tracking-tight"
          >
            {t("manageProducts")}
          </motion.h1>
          <p className="text-zinc-500 text-sm mt-1">
            {products.length} {t("products").toLowerCase()} registrados
          </p>
        </div>
        <Button
          onClick={() => setFormOpen(true)}
          className="gap-2 rounded-full px-6"
        >
          <Plus className="h-4 w-4" />
          {t("addProduct")}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder={t("searchProducts")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-card rounded-xl border-zinc-100 dark:border-zinc-800"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[200px] bg-card rounded-xl border-zinc-100 dark:border-zinc-800">
            <Filter className="h-4 w-4 mr-2 text-zinc-400" />
            <SelectValue placeholder={t("allCategories")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allCategories")}</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-[2rem] bg-card border border-dashed border-zinc-200 dark:border-zinc-800">
          <Package className="h-10 w-10 text-zinc-300 mb-4" />
          <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
            {t("noProducts")}
          </h3>
          <p className="text-zinc-500 text-sm mt-1 max-w-xs">
            Intenta ajustar los filtros de búsqueda.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-card border border-zinc-100 dark:border-zinc-900 rounded-[2rem] overflow-hidden hover:shadow-xl hover:shadow-zinc-500/5 transition-all duration-500"
              >
                {/* Square Image Section */}
                <div className="aspect-square relative overflow-hidden bg-zinc-50 dark:bg-zinc-900">
                  {product.images && product.images.length > 0 ? (
                    <Image
                      src={product.images[0]}
                      alt={product.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="h-10 w-10 text-zinc-200" />
                    </div>
                  )}

                  {/* Floating Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.featured && (
                      <Badge className="bg-amber-400 hover:bg-amber-400 text-black border-none rounded-full px-3">
                        <Star className="h-3 w-3 fill-current mr-1" /> Destacado
                      </Badge>
                    )}
                    <Badge
                      variant="secondary"
                      className="backdrop-blur-md bg-white/70 dark:bg-black/70 rounded-full"
                    >
                      {getCategoryName(product.categoryId)}
                    </Badge>
                  </div>

                  {/* Quick Actions Hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="rounded-full h-12 w-12"
                      onClick={() => {
                        setEditingProduct(product);
                        setFormOpen(true);
                      }}
                    >
                      <Edit2 className="h-5 w-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="rounded-full h-12 w-12"
                      onClick={() => setDeleteProduct(product)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-semibold text-lg leading-tight truncate flex-1">
                      {product.title}
                    </h3>
                    <p className="font-bold text-lg">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-full px-3 font-normal border-none",
                        product.stock > 10
                          ? "bg-emerald-50 text-emerald-600"
                          : product.stock > 0
                            ? "bg-amber-50 text-amber-600"
                            : "bg-red-50 text-red-600",
                      )}
                    >
                      {product.stock} en stock
                    </Badge>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* MOBILE VIEW: ORIGINAL TABLE (No se toca) */}
          <div className="md:hidden rounded-2xl bg-card border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50 text-left">
                    <th className="p-4 font-medium text-xs text-muted-foreground uppercase tracking-wider">
                      {t("productImages")}
                    </th>
                    <th className="p-4 font-medium text-xs text-muted-foreground uppercase tracking-wider">
                      {t("productTitle")}
                    </th>
                    <th className="p-4 text-right font-medium text-xs text-muted-foreground uppercase tracking-wider">
                      {t("actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-muted/50">
                      <td className="p-4">
                        <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden relative">
                          {product.images?.[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <ImageIcon className="absolute inset-0 m-auto h-5 w-5 text-muted-foreground/30" />
                          )}
                        </div>
                      </td>
                      <td className="p-4 italic">
                        <p className="font-medium text-sm truncate max-w-[150px]">
                          {product.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ${product.price}
                        </p>
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingProduct(product);
                                setFormOpen(true);
                              }}
                            >
                              <Edit2 className="h-4 w-4 mr-2" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteProduct(product)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Borrar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Product Form */}
      <ProductForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingProduct(null);
        }}
        product={editingProduct}
        onSubmit={editingProduct ? handleUpdate : handleCreate}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteProduct}
        onOpenChange={(open) => !open && setDeleteProduct(null)}
      >
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteProduct")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirmDeleteProduct")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full"
            >
              {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {tCommon("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}