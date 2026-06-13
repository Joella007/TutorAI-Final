// Nom : tout en MAJUSCULES
export const maskNom = (value: string) => value.toUpperCase();

// Prénom : première lettre de chaque mot en majuscule, reste en minuscule
export const maskPrenom = (value: string) =>
  value
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

// Email : pas de majuscules, pas d'espaces
export const maskEmail = (value: string) =>
  value.toLowerCase().replace(/\s/g, '');
// Vérifie si l'email a un Email valide
export const isEmailValid = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
