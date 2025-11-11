import { Input, Textarea, Select, Checkbox } from '../common/Input';
import { Modal, ModalBody, ModalFooter } from '../common/Modal';
import { Button } from '../common/Button';

/**
 * Componente de formulario para crear/editar artículos
 */
export const ArticulosForm = ({
  isOpen,
  onClose,
  formulario,
  setFormulario,
  categorias = [],
  onSubmit,
  isEditing = false,
  loading = false,
}) => {
  const handleChange = (field, value) => {
    setFormulario(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Artículo' : 'Agregar Artículo'}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <ModalBody>
          {/* Código y Nombre */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Código"
              value={formulario.codigo || ''}
              onChange={(e) => handleChange('codigo', e.target.value)}
              placeholder="Ej: HAM001"
              required
            />
            <Input
              label="Nombre"
              value={formulario.nombre || ''}
              onChange={(e) => handleChange('nombre', e.target.value)}
              placeholder="Ej: Hamburguesa Clásica"
              required
            />
          </div>

          {/* Descripción */}
          <Textarea
            label="Descripción"
            value={formulario.descripcion || ''}
            onChange={(e) => handleChange('descripcion', e.target.value)}
            placeholder="Describe el artículo..."
            rows={3}
          />

          {/* Precio y Tiempo de preparación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Precio"
              type="number"
              step="0.01"
              value={formulario.precio || ''}
              onChange={(e) => handleChange('precio', e.target.value)}
              placeholder="0.00"
              required
            />
            <Input
              label="Tiempo de Preparación (min)"
              type="number"
              value={formulario.tiempoPreparacion || ''}
              onChange={(e) => handleChange('tiempoPreparacion', e.target.value)}
              placeholder="15"
              required
            />
          </div>

          {/* Categoría */}
          <Select
            label="Categoría"
            value={formulario.categoria || ''}
            onChange={(e) => handleChange('categoria', e.target.value)}
            required
          >
            <option value="">Seleccionar categoría</option>
            {categorias.map(categoria => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </Select>

          {/* Disponible */}
          <Checkbox
            id="disponible"
            label="Disponible"
            checked={formulario.disponible || false}
            onChange={(e) => handleChange('disponible', e.target.checked)}
          />
        </ModalBody>

        <ModalFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
            fullWidth
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            fullWidth
          >
            {isEditing ? 'Actualizar' : 'Crear'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};


