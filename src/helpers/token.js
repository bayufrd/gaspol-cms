export function isTokenValid(token) {
  if (!token) {
    return { valid: false };
  }

  const tokenData = JSON.parse(atob(token.split(".")[1]));

  const currentTime = Math.floor(Date.now() / 1000);

  if (tokenData.exp && currentTime >= tokenData.exp) {
    return { valid: false, message: "Sesi login telah berakhir!" };
  }

  return { valid: true, message: "Token Valid!" };
}

export function extractUserTokenData(token) {
  try {
    const tokenData = JSON.parse(atob(token.split(".")[1]));
    return {
      userId: tokenData.userId,
      name: tokenData.name,
      role: tokenData.role,
      outlet_id: tokenData.outlet_id,
      outlet_name: tokenData.outlet_name,
      menu_access: tokenData.menu_access,
    };
  } catch (error) {
    console.error("Error extracting userTokenData:", error);
    return null;
  }
}
