export async function fetchWithRetry(
  input: string | URL,
  init: RequestInit,
): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch {
    return fetch(input, init);
  }
}
