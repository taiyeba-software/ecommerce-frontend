export const isAdminOrSeller = (user) => {
  if (!user) return false;

  const role = user.role?.toLowerCase();

  return role === "admin" || role === "seller" || user.isAdmin === true;
};
