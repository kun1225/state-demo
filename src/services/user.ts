export async function getUsers() {
  const res = await fetch(`${process.env.SITE_URL || ""}/api/users`);

  return res.json();
}
