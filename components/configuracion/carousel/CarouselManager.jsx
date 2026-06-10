import { useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  GripVertical,
  ImagePlus,
  Save,
  Trash2,
} from 'lucide-react';
import { useTiendaCarouselConfig } from '@/hooks/configuracion/useTiendaCarouselConfig';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  buildCarouselWarnings,
  CAROUSEL_IDEAL,
  CAROUSEL_MAX_SLIDES,
  CAROUSEL_ZOOM_MAX,
  CAROUSEL_ZOOM_MIN,
  formatResolution,
  readImageDimensions,
} from '@/lib/carouselQuality';

function SlidePreview({ slide }) {
  const focalX = slide.focalX ?? 50;
  const focalY = slide.focalY ?? 50;
  const zoom = slide.zoom ?? 1;

  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md border bg-muted">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={slide.url}
        alt={slide.alt || 'Preview'}
        className="h-full w-full object-cover"
        style={{
          objectPosition: `${focalX}% ${focalY}%`,
          transform: `scale(${zoom})`,
          transformOrigin: `${focalX}% ${focalY}%`,
        }}
      />
    </div>
  );
}

function CarouselSlideItem({
  slide,
  index,
  total,
  onChange,
  onMoveUp,
  onMoveDown,
  onDelete,
  disabled,
}) {
  const warnings = slide.qualityMeta?.warnings?.length
    ? slide.qualityMeta.warnings
    : buildCarouselWarnings(slide.qualityMeta?.width, slide.qualityMeta?.height);

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-start gap-3">
        <GripVertical className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
        <div className="flex-1 min-w-0 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4">
            <SlidePreview slide={slide} />
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">Slide {index + 1}</p>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`slide-enabled-${slide.id}`}
                    checked={slide.enabled !== false}
                    onCheckedChange={(checked) => onChange({ enabled: Boolean(checked) })}
                    disabled={disabled}
                  />
                  <Label htmlFor={`slide-enabled-${slide.id}`} className="text-xs">
                    Visible
                  </Label>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor={`slide-alt-${slide.id}`}>Texto alternativo</Label>
                <Input
                  id={`slide-alt-${slide.id}`}
                  value={slide.alt || ''}
                  onChange={(e) => onChange({ alt: e.target.value })}
                  disabled={disabled}
                  placeholder="Descripción breve de la imagen"
                />
              </div>

              <p className="text-xs text-muted-foreground">
                {formatResolution(slide.qualityMeta?.width, slide.qualityMeta?.height)}
                {slide.qualityMeta?.aspectRatio
                  ? ` · ${slide.qualityMeta.aspectRatio}:1`
                  : ''}
              </p>

              {warnings.length > 0 && (
                <Alert variant="default" className="border-amber-200 bg-amber-50 py-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-xs text-amber-900">
                    {warnings.join(' ')}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor={`focal-x-${slide.id}`}>Encuadre horizontal ({slide.focalX ?? 50}%)</Label>
                  <input
                    id={`focal-x-${slide.id}`}
                    type="range"
                    min={0}
                    max={100}
                    value={slide.focalX ?? 50}
                    onChange={(e) => onChange({ focalX: Number(e.target.value) })}
                    disabled={disabled}
                    className="w-full"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`focal-y-${slide.id}`}>Encuadre vertical ({slide.focalY ?? 50}%)</Label>
                  <input
                    id={`focal-y-${slide.id}`}
                    type="range"
                    min={0}
                    max={100}
                    value={slide.focalY ?? 50}
                    onChange={(e) => onChange({ focalY: Number(e.target.value) })}
                    disabled={disabled}
                    className="w-full"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`zoom-${slide.id}`}>Zoom ({Number(slide.zoom ?? 1).toFixed(2)}x)</Label>
                  <input
                    id={`zoom-${slide.id}`}
                    type="range"
                    min={CAROUSEL_ZOOM_MIN}
                    max={CAROUSEL_ZOOM_MAX}
                    step={0.01}
                    value={slide.zoom ?? 1}
                    onChange={(e) => onChange({ zoom: Number(e.target.value) })}
                    disabled={disabled}
                    className="w-full"
                  />
                  {(slide.zoom ?? 1) > 1.15 && (
                    <p className="text-[11px] text-amber-700">Zoom alto: puede pixelar en pantallas grandes.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onMoveUp} disabled={disabled || index === 0}>
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onMoveDown}
          disabled={disabled || index === total - 1}
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Button type="button" variant="destructive" size="sm" onClick={onDelete} disabled={disabled}>
          <Trash2 className="h-4 w-4 mr-1" />
          Eliminar
        </Button>
      </div>
    </div>
  );
}

export function CarouselManager({ notification }) {
  const fileInputRef = useRef(null);
  const [pendingWarnings, setPendingWarnings] = useState([]);
  const [pendingMeta, setPendingMeta] = useState(null);
  const {
    loading,
    guardando,
    subiendo,
    carousel,
    setCarousel,
    cargar,
    guardar,
    subirSlide,
    eliminarSlide,
  } = useTiendaCarouselConfig(notification);

  const slides = carousel.slides || [];
  const canUpload = slides.length < CAROUSEL_MAX_SLIDES;

  const updateSlide = (slideId, patch) => {
    setCarousel((prev) => ({
      ...prev,
      slides: (prev.slides || []).map((slide) =>
        slide.id === slideId ? { ...slide, ...patch } : slide
      ),
    }));
  };

  const moveSlide = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= slides.length) return;
    setCarousel((prev) => {
      const nextSlides = [...(prev.slides || [])];
      const [item] = nextSlides.splice(fromIndex, 1);
      nextSlides.splice(toIndex, 0, item);
      return {
        ...prev,
        slides: nextSlides.map((slide, index) => ({ ...slide, position: index })),
      };
    });
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      notification?.showError?.('Formato no permitido. Use JPG, PNG o WEBP.');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      notification?.showError?.('La imagen supera 5MB.');
      event.target.value = '';
      return;
    }

    try {
      const dimensions = await readImageDimensions(file);
      const warnings = buildCarouselWarnings(dimensions.width, dimensions.height);
      setPendingMeta(dimensions);
      setPendingWarnings(warnings);

      const ok = await subirSlide({
        file,
        alt: file.name.replace(/\.[^.]+$/, ''),
        width: dimensions.width,
        height: dimensions.height,
      });

      if (ok) {
        setPendingMeta(null);
        setPendingWarnings([]);
      }
    } catch (error) {
      notification?.showError?.(error.message || 'No se pudo procesar la imagen');
    } finally {
      event.target.value = '';
    }
  };

  const handleSave = async () => {
    await guardar(carousel);
  };

  const handleDelete = async (slideId) => {
    const confirmed = window.confirm('¿Eliminar este slide del carrusel?');
    if (!confirmed) return;
    await eliminarSlide(slideId);
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <ImagePlus className="h-5 w-5 text-violet-700" />
          Carrusel inicio
        </CardTitle>
        <CardDescription>
          Imágenes del carrusel en la página de inicio de la carta online.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription className="text-sm">
            <strong>Recomendado:</strong> {CAROUSEL_IDEAL.width}×{CAROUSEL_IDEAL.height} (16:9) o superior.
            Si la imagen no cumple, mostramos una advertencia y aplicamos recorte automático con encuadre ajustable.
            Máximo {CAROUSEL_MAX_SLIDES} slides · JPG, PNG, WEBP · hasta 5MB.
          </AlertDescription>
        </Alert>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="carousel-enabled"
              checked={carousel.enabled !== false}
              onCheckedChange={(checked) =>
                setCarousel((prev) => ({ ...prev, enabled: Boolean(checked) }))
              }
              disabled={loading || guardando}
            />
            <Label htmlFor="carousel-enabled">Carrusel activo en la carta</Label>
          </div>
          <span className="text-xs text-muted-foreground">
            {slides.length}/{CAROUSEL_MAX_SLIDES} slides
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading || subiendo || !canUpload}
          >
            <ImagePlus className="h-4 w-4 mr-2" />
            {subiendo ? 'Subiendo...' : 'Subir imagen'}
          </Button>
          <Button type="button" variant="outline" onClick={cargar} disabled={loading || guardando || subiendo}>
            Recargar
          </Button>
        </div>

        {pendingWarnings.length > 0 && pendingMeta && (
          <Alert variant="default" className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-sm text-amber-900">
              Última subida ({formatResolution(pendingMeta.width, pendingMeta.height)}):{' '}
              {pendingWarnings.join(' ')}
            </AlertDescription>
          </Alert>
        )}

        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando carrusel...</p>
        ) : slides.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay slides configurados. La carta usará imágenes por defecto hasta que agregues al menos una.
          </p>
        ) : (
          <div className="space-y-4">
            {slides.map((slide, index) => (
              <CarouselSlideItem
                key={slide.id}
                slide={slide}
                index={index}
                total={slides.length}
                disabled={guardando || subiendo}
                onChange={(patch) => updateSlide(slide.id, patch)}
                onMoveUp={() => moveSlide(index, index - 1)}
                onMoveDown={() => moveSlide(index, index + 1)}
                onDelete={() => handleDelete(slide.id)}
              />
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={handleSave}
            disabled={loading || guardando || subiendo}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {guardando ? 'Guardando...' : 'Guardar carrusel'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
