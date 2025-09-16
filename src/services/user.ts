export async function getUsers(q?: string) {
  const base = `${process.env.SITE_URL || ""}/api/users`;
  const url = q ? `${base}?q=${encodeURIComponent(q)}` : base;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export type UsersPage = {
  items: Array<{
    id: number;
    name: string;
    email: string;
    gender: 'male' | 'female' | 'non-binary' | 'other';
    title: string;
  }>;
  nextCursor: number | null;
  total: number;
};

export async function getUsersPage(params: { q?: string; cursor?: number | null; limit?: number }) {
  const base = `${process.env.SITE_URL || ""}/api/users`;
  const sp = new URLSearchParams();
  if (params.q) sp.set('q', params.q);
  if (typeof params.limit === 'number') sp.set('limit', String(params.limit));
  if (params.cursor) sp.set('cursor', String(params.cursor));
  const url = sp.toString() ? `${base}?${sp.toString()}` : base;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch users page');
  return res.json() as Promise<UsersPage>;
}

export type NewUserInput = {
  name: string;
  email: string;
  gender: 'male' | 'female' | 'non-binary' | 'other';
  title: string;
};

export async function createUser(input: NewUserInput) {
  const res = await fetch(`/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to create user');
  return res.json();
}

export async function deleteUser(id: number) {
  const url = new URL(`/api/users`, typeof window === 'undefined' ? 'http://localhost' : window.location.origin);
  url.searchParams.set('id', String(id));
  const res = await fetch(url.toString(), { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete user');
  return res.json();
}
