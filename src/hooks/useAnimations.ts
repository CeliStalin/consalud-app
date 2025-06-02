import { useCallback, useRef, useEffect } from 'react';

interface AnimationConfig {
  duration?: number;
  delay?: number;
  easing?: string;
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
}

export const useAnimations = () => {
  // OPTIMIZADO: Crear estilos más simples y rápidos
  const createAnimationStyles = useCallback((animationName: string, config: AnimationConfig = {}) => {
    const {
      duration = 150, // Reducido significativamente
      delay = 0,
      easing = 'ease-out',
      fillMode = 'both'
    } = config;

    return {
      animation: `${animationName} ${duration}ms ${easing} ${delay}ms ${fillMode}`
    };
  }, []);

  // NUEVO: Animaciones ultra-optimizadas para navegación
  const navigationAnimations = {
    instantFade: (config?: AnimationConfig) => createAnimationStyles('instantFadeIn', { duration: 80, ...config }),
    microSlide: (config?: AnimationConfig) => createAnimationStyles('microSlide', { duration: 100, ...config }),
  };

  // OPTIMIZADO: Animaciones predefinidas más rápidas
  const animations = {
    fadeInUp: (config?: AnimationConfig) => createAnimationStyles('fadeInUp', { duration: 200, ...config }),
    fadeInScale: (config?: AnimationConfig) => createAnimationStyles('fadeInScale', { duration: 150, ...config }),
    slideInLeft: (config?: AnimationConfig) => createAnimationStyles('slideInLeft', { duration: 120, ...config }),
    bounceIn: (config?: AnimationConfig) => createAnimationStyles('bounceIn', { duration: 300, ...config }),
    // Nuevas animaciones optimizadas
    ...navigationAnimations,
  };

  // NUEVO: Hook para navegación sin parpadeos
  const useInstantAnimation = (element: HTMLElement | null) => {
    useEffect(() => {
      if (element) {
        // Aplicar clases de estabilidad inmediatamente
        element.classList.add('instant-stable', 'navigation-stable', 'no-flash');
        
        // Asegurar que el elemento sea visible inmediatamente
        element.style.opacity = '1';
        element.style.visibility = 'visible';
        element.style.transform = 'none';
      }
    }, [element]);
  };

  // Hook para aplicar animación en mount
  const useAnimateOnMount = (animationType: keyof typeof animations, config?: AnimationConfig) => {
    const elementRef = useRef<HTMLElement>(null);

    useEffect(() => {
      if (elementRef.current) {
        const animationStyle = animations[animationType](config);
        Object.assign(elementRef.current.style, animationStyle);
      }
    }, [animationType, config]);

    return elementRef;
  };

  // Función para triggear animaciones programáticamente
  const triggerAnimation = useCallback((element: HTMLElement, animationType: keyof typeof animations, config?: AnimationConfig) => {
    if (!element) return;

    const animationStyle = animations[animationType](config);
    Object.assign(element.style, animationStyle);

    // Remover la animación después de completarse
    const duration = config?.duration || 300;
    const delay = config?.delay || 0;
    
    setTimeout(() => {
      element.style.animation = '';
    }, duration + delay);
  }, [animations]);

  return {
    animations,
    navigationAnimations,
    createAnimationStyles,
    useAnimateOnMount,
    useInstantAnimation, // Nueva función
    triggerAnimation
  };
};

// Hook específico para animaciones de botones
export const useButtonAnimations = () => {
  const addHoverEffect = useCallback((element: HTMLElement) => {
    if (!element) return;

    const handleMouseEnter = () => {
      element.style.transform = 'translateY(-2px)';
      element.style.boxShadow = '0 8px 25px rgba(4, 165, 155, 0.3)';
    };

    const handleMouseLeave = () => {
      element.style.transform = 'translateY(0)';
      element.style.boxShadow = '';
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    // Cleanup function
    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const addRippleEffect = useCallback((element: HTMLElement) => {
    if (!element) return;

    const handleClick = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
      `;

      // Asegurar que el elemento padre tenga position relative
      element.style.position = 'relative';
      element.style.overflow = 'hidden';

      element.appendChild(ripple);

      // Remover el ripple después de la animación
      setTimeout(() => {
        ripple.remove();
      }, 600);
    };

    element.addEventListener('click', handleClick);

    // Cleanup function
    return () => {
      element.removeEventListener('click', handleClick);
    };
  }, []);

  return {
    addHoverEffect,
    addRippleEffect
  };
};
