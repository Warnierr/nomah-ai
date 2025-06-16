import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-background">
      <div className="pb-80 pt-16 sm:pb-40 sm:pt-24 lg:pb-48 lg:pt-40">
        <div className="relative mx-auto max-w-7xl px-4 sm:static sm:px-6 lg:px-8">
          <div className="sm:max-w-lg">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Des produits innovants pour votre quotidien
            </h1>
            <p className="mt-4 text-xl text-muted-foreground">
              Découvrez notre sélection de produits de qualité, conçus pour améliorer votre vie de tous les jours.
            </p>
          </div>
          <div className="mt-10">
            <div className="mt-10">
              <Button asChild size="lg">
                <Link href="/products">
                  Découvrir nos produits
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 