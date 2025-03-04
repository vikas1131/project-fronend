import axios from "axios";
import apiClient from "./apiClient"; // Update the path as needed

jest.mock("axios");

const mockAxios = {
    interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() }
    },
    create: jest.fn(() => mockAxios),
};
axios.create.mockReturnValue(mockAxios);

beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    delete global.window.location;
    global.window = { location: { href: "" } };
});

describe("apiClient", () => {
    test("should create an axios instance with the correct base URL and headers", () => {
        expect(axios.create).toHaveBeenCalledWith({
            baseURL: expect.any(String),
            headers: { "Content-Type": "application/json" },
        });
    });

    test("should attach token, email, and role from sessionStorage to headers", async () => {
        sessionStorage.setItem("token", "mockToken");
        sessionStorage.setItem("email", "user@example.com");
        sessionStorage.setItem("role", "admin");

        const config = { headers: {} };
        mockAxios.interceptors.request.use.mock.calls[0][0](config);

        expect(config.headers["Authorization"]).toBe("Bearer mockToken");
        expect(config.headers["X-User-Email"]).toBe("user@example.com");
        expect(config.headers["X-User-Role"]).toBe("admin");
    });

    test("should handle missing sessionStorage values and clean headers", async () => {
        sessionStorage.removeItem("email");
        sessionStorage.removeItem("role");

        const config = { headers: {} };
        mockAxios.interceptors.request.use.mock.calls[0][0](config);

        expect(config.headers["X-User-Email"]).toBeUndefined();
        expect(config.headers["X-User-Role"]).toBeUndefined();
    });

    test("should redirect to /login on 401 response and clear sessionStorage", async () => {
        sessionStorage.setItem("token", "mockToken");
        const error = { response: { status: 401 } };
        
        await expect(mockAxios.interceptors.response.use.mock.calls[0][1](error)).rejects.toEqual(error);
        
        expect(sessionStorage.length).toBe(0);
        expect(global.window.location.href).toBe("/login");
    });
});
