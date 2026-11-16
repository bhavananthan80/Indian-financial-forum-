export async function editorRequest(path: string, body?: object) {
  const response = await fetch(`/api/iff/admin/${path}`, body && {
    method: 'POST', ...(body instanceof FormData ? { body } : {
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw Object.assign(new Error(data.error || 'The editor request failed. Try again.'), { status: response.status });
  }
  return response;
}

export async function editorApi<T>(path: string, body?: object): Promise<T> {
  return (await editorRequest(path, body)).json() as Promise<T>;
}
