import { Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 shadow-lg mt-auto">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-center h-auto sm:h-16 py-4 sm:py-0 gap-4 sm:gap-6">
          {/* Copyright */}
          <div className="flex items-center text-white text-sm">
            <span>© {currentYear} El Chalito. Todos los derechos reservados.</span>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-8 bg-blue-600"></div>

          {/* Soporte - Email y teléfono */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-white text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>Soporte:</span>
              <a
                href="mailto:software-mail@gmail.com"
                className="text-white hover:text-blue-200 transition-colors font-medium"
              >
                software-mail@gmail.com
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <a
                href="tel:+5491112345678"
                className="text-white hover:text-blue-200 transition-colors font-medium"
              >
                +54 9 11 1234-5678
              </a>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-8 bg-blue-600"></div>

          {/* Redes sociales */}
          <div className="flex items-center gap-3">
            <a
              href="https://facebook.com/elchalito"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-blue-700 hover:bg-blue-600 text-white flex items-center justify-center transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href="https://instagram.com/elchalito"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-blue-700 hover:bg-pink-600 text-white flex items-center justify-center transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="https://twitter.com/elchalito"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-blue-700 hover:bg-blue-500 text-white flex items-center justify-center transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
