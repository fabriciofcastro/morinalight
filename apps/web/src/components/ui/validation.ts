import type { Variants } from "framer-motion";

/**
 * Animation presets for form validation feedback
 * Use em componentes com <motion.div {...validationAnimations.validateSuccess}>
 */

export const validationAnimations = {
  /**
   * Quando field passa em validação
   * - Icon aparece com scale-in + rotate
   */
  validateSuccess: {
    initial: { scale: 0, rotate: -180, opacity: 0 },
    animate: { scale: 1, rotate: 0, opacity: 1 },
    exit: { scale: 0, rotate: 180, opacity: 0 },
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15,
      duration: 0.3,
    },
  } as Variants,

  /**
   * Quando field falha validação
   * - Shake animation
   */
  validateError: {
    animate: {
      x: [-4, 4, -4, 4, 0],
    },
    transition: {
      duration: 0.4,
      ease: "easeInOut",
    },
  } as Variants,

  /**
   * Quando está validando (pending)
   * - Pulse opacity
   */
  validatePending: {
    animate: {
      opacity: [1, 0.6, 1],
    },
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  } as Variants,

  /**
   * Mensagem de sucesso aparece
   */
  showSuccess: {
    initial: { opacity: 0, y: -10, height: 0 },
    animate: { opacity: 1, y: 0, height: "auto" },
    exit: { opacity: 0, y: -10, height: 0 },
    transition: { duration: 0.2 },
  } as Variants,

  /**
   * Mensagem de erro aparece
   */
  showError: {
    initial: { opacity: 0, y: 10, height: 0 },
    animate: { opacity: 1, y: 0, height: "auto" },
    exit: { opacity: 0, y: 10, height: 0 },
    transition: { duration: 0.2 },
  } as Variants,

  /**
   * Loading spinner
   */
  loadingSpinner: {
    animate: { rotate: 360 },
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    },
  } as Variants,

  /**
   * Field group border highlight
   */
  highlightBorder: {
    animate: {
      boxShadow: [
        "0 0 0 0px hsl(227 100% 58% / 0)",
        "0 0 0 3px hsl(227 100% 58% / 0.1)",
        "0 0 0 0px hsl(227 100% 58% / 0)",
      ],
    },
    transition: {
      duration: 2,
      repeat: Infinity,
    },
  } as Variants,
};

/**
 * Presets para diferentes estados
 */
export const stateAnimations = {
  idle: {},
  valid: validationAnimations.validateSuccess,
  invalid: validationAnimations.validateError,
  pending: validationAnimations.validatePending,
  disabled: { opacity: 0.5 },
};
