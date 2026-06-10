import { useCallback, useEffect, useState } from 'react';
import { tiendaOnlineService } from '@/services/tiendaOnlineService';

const EMPTY = {
  enabled: true,
  slides: [],
  updatedAt: null,
};

export function useTiendaCarouselConfig(notification) {
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [carousel, setCarousel] = useState(EMPTY);

  const cargar = useCallback(async () => {
    setLoading(true);
    const result = await tiendaOnlineService.getCarousel();
    setLoading(false);
    if (!result.success) {
      notification?.showError?.(result.message);
      return;
    }
    setCarousel(result.data || EMPTY);
  }, [notification]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const guardar = async (nextCarousel = carousel) => {
    setGuardando(true);
    const result = await tiendaOnlineService.updateCarousel({
      enabled: nextCarousel.enabled,
      slides: nextCarousel.slides,
    });
    setGuardando(false);
    if (!result.success) {
      notification?.showError?.(result.message);
      return false;
    }
    notification?.showSuccess?.(result.message || 'Carrusel guardado');
    setCarousel(result.data || nextCarousel);
    return true;
  };

  const subirSlide = async ({ file, alt, width, height }) => {
    setSubiendo(true);
    const result = await tiendaOnlineService.uploadCarouselSlide({
      file,
      alt,
      width,
      height,
    });
    setSubiendo(false);
    if (!result.success) {
      notification?.showError?.(result.message);
      return false;
    }
    notification?.showSuccess?.(result.message || 'Imagen agregada');
    setCarousel(result.data?.carousel || result.data || carousel);
    return true;
  };

  const eliminarSlide = async (slideId) => {
    const result = await tiendaOnlineService.deleteCarouselSlide(slideId);
    if (!result.success) {
      notification?.showError?.(result.message);
      return false;
    }
    notification?.showSuccess?.(result.message || 'Slide eliminado');
    setCarousel(result.data || { ...carousel, slides: carousel.slides.filter((s) => s.id !== slideId) });
    return true;
  };

  return {
    loading,
    guardando,
    subiendo,
    carousel,
    setCarousel,
    cargar,
    guardar,
    subirSlide,
    eliminarSlide,
  };
}
