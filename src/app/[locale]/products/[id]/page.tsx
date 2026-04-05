'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Heart, Share2, Minus, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { Product } from '@/types'
import { ProductsService } from '@/services/products.service'
import { useCart } from '@/context/CartContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProductGrid } from '@/components/products/ProductGrid'
import { Loading } from '@/components/common/Loading'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'

export default function ProductDetailPage() {
  const params = useParams()
  const t = useTranslations('products')
  const tCart = useTranslations('cart')
  const { addToCart } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await ProductsService.getById(params.id as string)
        setProduct(data)

        if (data?.categoryId) {
          const related = await ProductsService.getByCategory(data.categoryId)
          setRelatedProducts(related.filter((p) => p.id !== data.id).slice(0, 4))
        }
      } catch (error) {
        console.error('Error loading product:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadProduct()
    }
  }, [params.id])

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity)
      toast.success(tCart('addedToCart'))
    }
  }

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? (product?.images.length || 1) - 1 : prev - 1
    )
  }

  const handleNextImage = () => {
    setSelectedImageIndex((prev) =>
      prev === (product?.images.length || 1) - 1 ? 0 : prev + 1
    )
  }

  if (loading) {
    return <Loading />
  }

  if (!product) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <Link href="/products">
          <Button>Back to Products</Button>
        </Link>
      </div>
    )
  }

  const isOutOfStock = product.stock <= 0

  return (
    <div className="container py-8">
      <div className="grid lg:grid-cols-2 gap-12 mb-16">
        {/* Product Images */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[selectedImageIndex]}
                    alt={product.title}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-muted-foreground">No image</span>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {product.images && product.images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full"
                  onClick={handlePrevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full"
                  onClick={handleNextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                    selectedImageIndex === index
                      ? 'border-primary'
                      : 'border-transparent'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.title} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div>
            {product.featured && <Badge className="mb-2">Featured</Badge>}
            <h1 className="text-3xl font-bold">{product.title}</h1>
          </div>

          <div className="flex items-baseline gap-4">
            <span className="text-4xl font-bold">{formatPrice(product.price)}</span>
            {!isOutOfStock && (
              <Badge variant="secondary">
                {product.stock} {t('inStock').toLowerCase()}
              </Badge>
            )}
            {isOutOfStock && <Badge variant="destructive">{t('outOfStock')}</Badge>}
          </div>

          <Separator />

          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          <Separator />

          {!isOutOfStock && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-medium">{t('quantity')}:</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  size="lg"
                  className="flex-1 gap-2"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {t('addToCart')}
                </Button>
                <Button size="lg" variant="outline">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          <Separator />

          <Tabs defaultValue="description">
            <TabsList>
              <TabsTrigger value="description">{t('description')}</TabsTrigger>
              <TabsTrigger value="details">{t('details')}</TabsTrigger>
              <TabsTrigger value="reviews">{t('reviews')}</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="pt-4">
              <p className="text-muted-foreground">{product.description}</p>
            </TabsContent>
            <TabsContent value="details" className="pt-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SKU</span>
                  <span className="font-medium">{product.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('stock')}</span>
                  <span className="font-medium">{product.stock}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('category')}</span>
                  <span className="font-medium">{product.categoryId}</span>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="pt-4">
              <p className="text-muted-foreground">No reviews yet.</p>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">{t('related')}</h2>
          <ProductGrid products={relatedProducts} />
        </section>
      )}
    </div>
  )
}
