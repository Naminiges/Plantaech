const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const request = async (method, path, body) => {
  const token = localStorage.getItem('plantaech_token');
  const isForm = body instanceof FormData;

  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (body && !isForm) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: isForm ? body : body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(30000),
    });
  } catch (networkErr) {
    // Connection refused, timeout, DNS failure, etc.
    const err = new Error('Cannot connect to server. Make sure the backend is running.');
    err.response = { data: { error: err.message }, status: 0 };
    throw err;
  }

  // Auto-logout on 401 only when we had a token (expired session).
  // If no token was sent, 401 means wrong credentials — let the error propagate normally.
  if (res.status === 401 && localStorage.getItem('plantaech_token')) {
    localStorage.removeItem('plantaech_token');
    localStorage.removeItem('plantaech_user');
    window.location.href = '/login';
    return;
  }

  let data;
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    // Mirror Axios error shape so all existing catch blocks work unchanged
    const err = new Error(data?.error || `HTTP ${res.status}`);
    err.response = { data, status: res.status };
    throw err;
  }

  return { data };
};

const api = {
  get:    (path, opts)         => request('GET',    path + buildQuery(opts?.params)),
  post:   (path, body, opts)   => request('POST',   path, body),
  put:    (path, body, opts)   => request('PUT',    path, body),
  delete: (path)               => request('DELETE', path),
};

function buildQuery(params) {
  if (!params) return '';
  const q = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null)
  ).toString();
  return q ? `?${q}` : '';
}

export default api;
