export function isTokenValid(token) {
    if (!token) {
        return { valid: false }; 
    }
  
    const tokenData = JSON.parse(atob(token.split('.')[1]));
  
    const currentTime = Math.floor(Date.now() / 1000);
  
    if (tokenData.exp && currentTime >= tokenData.exp) {
        return { valid: false, message: "Sesi login telah berakhir!" };
    }
  
    return { valid: true, message: "Token Valid!" };; 
  }