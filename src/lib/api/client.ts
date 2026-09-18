/**
 
 * Usage: const { data, error } = await fetchApi('/api/appointments')
 */
export async function fetchApi<T>(endpoint: string) {
  try {
    const res = await fetch(endpoint);
    const json = await res.json();
    
    if (!res.ok) return { error: json.error || "Failed to fetch" };
    
    return { data: json.data as T };
  } catch {
    return { error: "Network error" };
  }
}
