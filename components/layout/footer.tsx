import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Nomah AI</h3>
            <p className="text-sm text-muted-foreground">
              Votre destination pour des produits innovants et de qualité.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Produits</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products?category=electronique" className="text-muted-foreground hover:text-foreground">
                  Électronique
                </Link>
              </li>
              <li>
                <Link href="/products?category=mode" className="text-muted-foreground hover:text-foreground">
                  Mode
                </Link>
              </li>
              <li>
                <Link href="/products?category=maison" className="text-muted-foreground hover:text-foreground">
                  Maison & Jardin
                </Link>
              </li>
              <li>
                <Link href="/products?category=sport" className="text-muted-foreground hover:text-foreground">
                  Sport & Loisirs
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-foreground">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-muted-foreground hover:text-foreground">
                  Livraison
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-muted-foreground hover:text-foreground">
                  Retours
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Légal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                  Confidentialité
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-muted-foreground hover:text-foreground">
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t py-6">
          <p className="text-center text-sm text-muted-foreground">
            © 2024 Nomah AI. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
} 