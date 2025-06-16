'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  sizes?: string
  fill?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  sizes,
  fill = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }

  // Fallback image for errors
  const fallbackSrc = '/images/placeholder.jpg'

  if (hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gray-100 text-gray-400',
          className
        )}
        style={{ width, height }}
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {isLoading && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{ width, height }}
        />
      )}
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        quality={quality}
        sizes={sizes}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          fill ? 'object-cover' : ''
        )}
      />
    </div>
  )
}

// Preset configurations for common use cases
export const ImagePresets = {
  productCard: {
    width: 300,
    height: 300,
    quality: 80,
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  },
  productGallery: {
    width: 600,
    height: 600,
    quality: 90,
    sizes: '(max-width: 768px) 100vw, 50vw',
  },
  thumbnail: {
    width: 100,
    height: 100,
    quality: 70,
    sizes: '100px',
  },
  hero: {
    fill: true,
    quality: 90,
    priority: true,
    sizes: '100vw',
  },
  avatar: {
    width: 40,
    height: 40,
    quality: 80,
    sizes: '40px',
  },
} as const

// Helper component for product images
export function ProductImage({
  src,
  alt,
  variant = 'card',
  className,
  ...props
}: OptimizedImageProps & {
  variant?: 'card' | 'gallery' | 'thumbnail'
}) {
  const presets = {
    card: ImagePresets.productCard,
    gallery: ImagePresets.productGallery,
    thumbnail: ImagePresets.thumbnail,
  }

  const preset = presets[variant]

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={className}
      {...preset}
      {...props}
    />
  )
} 