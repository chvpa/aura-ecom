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
              <li>
                <a
                  href="mailto:odoraimports@gmail.com"
                  className="hover:text-primary transition-colors"
                >
                  Email: odoraimports@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+595972137968"
                  className="hover:text-primary transition-colors"
                >
                  Teléfono: 0972137968
                </a>
              </li>
              <li>Asunción, Paraguay</li>
            </ul>
            <div className="flex gap-4 pt-2">
              <a
                href="https://www.instagram.com/odoraimports"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-600 hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.467.398.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@odoraimports"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-600 hover:text-primary transition-colors"
                aria-label="TikTok"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                </svg>
              </a>
            </div>
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

