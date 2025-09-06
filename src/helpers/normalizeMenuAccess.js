// helpers/normalizeMenuAccess.js

/**
 * Normalize menu_access into an array of numbers
 * 
 * Contoh:
 * "2,3,11"   => [2, 3, 11]
 * ["2","3"]  => [2, 3]
 * [2,3,11]   => [2, 3, 11]
 */
export const normalizeMenuAccess = (menu_access) => {
  if (!menu_access) return [];

  if (typeof menu_access === "string") {
    return menu_access
      .split(",")
      .map((x) => Number(x.trim()))
      .filter((x) => !isNaN(x));
  }

  if (Array.isArray(menu_access)) {
    return menu_access
      .map((x) => Number(x))
      .filter((x) => !isNaN(x));
  }

  return [];
};
