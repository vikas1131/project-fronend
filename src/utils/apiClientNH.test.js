// __tests__/apiClientNH.test.js

let apiClient;
let originalSessionStorage;
let originalLocation;

describe('apiClientNH interceptors', () => {
  beforeEach(() => {
    // Reset the module cache so that module-level variables (like isRedirecting) are reset.
    jest.resetModules();
    originalSessionStorage = window.sessionStorage;
    originalLocation = window.location;

    // Create a custom mock for sessionStorage.
    const mockSessionStorage = (() => {
      let store = {};
      return {
        getItem: jest.fn((key) => store[key] || null),
        setItem: jest.fn((key, value) => {
          store[key] = value.toString();
        }),
        removeItem: jest.fn((key) => {
          delete store[key];
        }),
        clear: jest.fn(() => {
          store = {};
        }),
      };
    })();
    Object.defineProperty(window, 'sessionStorage', {
      value: mockSessionStorage,
      writable: true,
    });

    // Mock window.location.href.
    delete window.location;
    window.location = { href: '' };

    // Import your axios client module.
    // Adjust the path as necessary (e.g., './apiClientNH' if in the same folder).
    apiClient = require('./apiClientNH').default;
  });

  afterEach(() => {
    window.sessionStorage = originalSessionStorage;
    window.location = originalLocation;
    jest.clearAllMocks();
  });

  describe('Request interceptor', () => {
    beforeEach(() => {
      // Override the adapter so that axios calls trigger the interceptor chain.
      // The adapter returns the final config (inside "data") so we can inspect it.
      apiClient.defaults.adapter = (config) =>
        Promise.resolve({
          data: config,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        });
    });

    it('should attach token, email, and role headers when available', async () => {
      // Set sessionStorage values.
      window.sessionStorage.getItem.mockImplementation((key) => {
        if (key === 'token') return 'nhToken';
        if (key === 'email') return 'nh@example.com';
        if (key === 'role') return 'nhRole';
        return null;
      });

      const response = await apiClient({ headers: {} });
      const config = response.data;
      expect(config.headers['Authorization']).toBe('Bearer nhToken');
      expect(config.headers['X-User-Email']).toBe('nh@example.com');
      expect(config.headers['X-User-Role']).toBe('nhRole');
    });

    it('should remove email and role headers when they are not available', async () => {
      // Only token is available.
      window.sessionStorage.getItem.mockImplementation((key) => {
        if (key === 'token') return 'nhToken';
        return null;
      });

      // Pre-populate headers to verify removal.
      const response = await apiClient({
        headers: { 'X-User-Email': 'old@example.com', 'X-User-Role': 'oldRole' },
      });
      const config = response.data;
      expect(config.headers['Authorization']).toBe('Bearer nhToken');
      expect(config.headers).not.toHaveProperty('X-User-Email');
      expect(config.headers).not.toHaveProperty('X-User-Role');
    });

    it('should handle errors thrown when accessing sessionStorage', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      // Force an error when sessionStorage.getItem is called.
      window.sessionStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const originalConfig = { headers: {} };
      const response = await apiClient(originalConfig);
      const config = response.data;
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error accessing sessionStorage:', expect.any(Error));
      // The original config should be returned unchanged.
      expect(config).toEqual(originalConfig);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Response interceptor', () => {
    it('should pass through responses without modification', async () => {
      // Override adapter to simulate a successful response.
      apiClient.defaults.adapter = (config) =>
        Promise.resolve({
          data: { success: true },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        });
      const response = await apiClient({ headers: {} });
      expect(response.data).toEqual({ success: true });
    });

    it('should not redirect if the error status is not 401', async () => {
      // Simulate an error with a status other than 401.
      apiClient.defaults.adapter = () =>
        Promise.reject({ response: { status: 400, data: undefined, headers: {} } });
      await expect(apiClient({ headers: {} })).rejects.toMatchObject({ response: { status: 400 } });
      expect(window.location.href).toBe('');
    });

    it('should clear sessionStorage and redirect on a 401 error', async () => {
      // Simulate a 401 error.
      apiClient.defaults.adapter = () =>
        Promise.reject({ response: { status: 401, data: undefined, headers: {} } });
      await expect(apiClient({ headers: {} })).rejects.toMatchObject({ response: { status: 401 } });
      expect(window.sessionStorage.clear).toHaveBeenCalled();
      expect(window.location.href).toBe('/login');
    });

    it('should not perform a duplicate redirect if already redirecting', async () => {
      // First 401 error triggers the redirect.
      apiClient.defaults.adapter = () =>
        Promise.reject({ response: { status: 401, data: undefined, headers: {} } });
      await expect(apiClient({ headers: {} })).rejects.toMatchObject({ response: { status: 401 } });
      expect(window.sessionStorage.clear).toHaveBeenCalled();
      expect(window.location.href).toBe('/login');

      // For the second call, do not reset window.location.href so that it remains '/login'.
      window.sessionStorage.clear.mockClear();
      await expect(apiClient({ headers: {} })).rejects.toMatchObject({ response: { status: 401 } });
      expect(window.sessionStorage.clear).not.toHaveBeenCalled();
      // window.location.href should still be '/login'
      expect(window.location.href).toBe('/login');
    });
  });
});