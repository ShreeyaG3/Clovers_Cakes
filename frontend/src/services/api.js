const API = import.meta.env.VITE_API_URL;

async function request(url, options) {
  const response = await fetch(`${API}${url}`, options);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.detail || "Something went wrong.");
  return body;
}

export const getImports = () => request("/api/imports");
export const getDashboard = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) query.set(key, value);
  });
  return request(`/api/dashboard${query.size ? `?${query}` : ""}`);
};
export const uploadCsv = (file) => {
  const form = new FormData();
  form.append("file", file);
  return request("/api/upload", { method: "POST", body: form });
};
