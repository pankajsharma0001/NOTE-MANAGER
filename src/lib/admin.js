export const ADMIN_EMAILS = [
  "sharmapankaj102030@gmail.com",
  "engineeringnotez@gmail.com",
];

export function isAdminEmail(email) {
  return Boolean(email && ADMIN_EMAILS.includes(email));
}
