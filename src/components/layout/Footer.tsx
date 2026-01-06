import Link from "next/link";
import { SITE_NAME } from "@/lib/utils/constants";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-neutral-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{SITE_NAME}</h3>
            <p className="text-sm text-neutral-600">
              Tu destino para encontrar el perfume perfecto con la ayuda de
              inteligencia artificial.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Enlaces</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/perfumes"
                  className="text-neutral-600 hover:text-primary transition-colors"
                >
                  Todos los Perfumes
                </Link>
              </li>
              <li>
                <Link
                  href="/marcas"
                  className="text-neutral-600 hover:text-primary transition-colors"
                >
                  Marcas
                </Link>
              </li>
              <li>
                <Link
                  href="/busqueda-ia"
                  className="text-neutral-600 hover:text-primary transition-colors"
                >
                  Búsqueda IA
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Mi Cuenta</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/cuenta"
                  className="text-neutral-600 hover:text-primary transition-colors"
                >
                  Perfil
                </Link>
              </li>
              <li>
                <Link
                  href="/cuenta/pedidos"
                  className="text-neutral-600 hover:text-primary transition-colors"
                >
                  Pedidos
                </Link>
              </li>
              <li>
                <Link
                  href="/cuenta/wishlist"
                  className="text-neutral-600 hover:text-primary transition-colors"
                >
                  Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Contacto</h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>Email: info@odoraperfumes.com.py</li>
              <li>Teléfono: +595 21 XXX XXXX</li>
              <li>Asunción, Paraguay</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-neutral-600">
          <p>
            © {currentYear} {SITE_NAME}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

