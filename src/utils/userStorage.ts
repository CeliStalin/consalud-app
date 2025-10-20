/**
 * Utilidades para manejo de información de usuario desde el localStorage
 */

/**
 * Obtiene el UserName desde el localStorage (usuarioAD)
 * @returns UserName del usuario logueado o 'SISTEMA' como fallback
 */
export const getUserNameFromStorage = (): string => {
  try {
    const usuarioAD = localStorage.getItem('usuarioAD');
    if (usuarioAD) {
      const usuarioData = JSON.parse(usuarioAD);
      const userName = usuarioData.UserName || usuarioData.userName || usuarioData.username;
      if (userName && typeof userName === 'string' && userName.trim() !== '') {
        return userName.trim();
      }
    }
  } catch (error) {
    console.warn('Error al obtener UserName del localStorage:', error);
  }
  return 'SISTEMA'; // Fallback por defecto
};

/**
 * Obtiene información completa del usuario desde el localStorage (usuarioAD)
 * @returns Objeto con información del usuario o null si no existe
 */
export const getUserDataFromStorage = (): any | null => {
  try {
    const usuarioAD = localStorage.getItem('usuarioAD');
    if (usuarioAD) {
      return JSON.parse(usuarioAD);
    }
  } catch (error) {
    console.warn('Error al obtener datos de usuario del localStorage:', error);
  }
  return null;
};
