export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="container-custom">
        <div className="py-6 text-center">
          <p className="text-sm text-gray-600">
            © El Chalito {new Date().getFullYear()}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
