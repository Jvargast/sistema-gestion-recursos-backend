export const getCookieSettings = () => {
  const isProduction = process.env.NODE_ENV === "production";

  const baseSettings = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  };

  if (isProduction && process.env.COOKIE_DOMAIN_PROD) {
    baseSettings.domain = process.env.COOKIE_DOMAIN_PROD;
  }

  return baseSettings;
};
