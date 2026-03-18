// lib/testApi.ts
import api from './api';
import { MockAuthService } from '../src/services/mocks/authService';

const authService = new MockAuthService();

export async function runTest(email: string, password: string) {
  console.log("🔹 Logging in mock user:", email);

  // Log in via mock auth service
  const { accessToken, refreshToken, user } = await authService.login(email, password);
  console.log("Login successful:", user);
  console.log("Access token:", accessToken);
  console.log("Refresh token:", refreshToken);

  // Call a protected endpoint (through api + interceptor)
  console.log("🔹 Calling protected endpoint...");
  try {
    const response = await api.get('/mock-protected-endpoint');
    console.log("Protected API response:", response.data);
  } catch (err) {
    console.error("Error calling protected endpoint:", err);
  }

  // Optional: force token expiration to test refresh
  console.log("🔹 Forcing expired access token...");
  localStorage.setItem('decibel_access_token', 'expired');

  try {
    const retryResponse = await api.get('/mock-protected-endpoint');
    console.log("After forced 401, retried call success:", retryResponse.data);
  } catch (err) {
    console.error("Error after forced 401:", err);
  }

  // Optional: test multiple concurrent requests
  console.log("🔹 Testing concurrent requests with expired token...");
  localStorage.setItem('decibel_access_token', 'expired');

  await Promise.all([
    api.get('/mock-protected-endpoint').then(r => console.log("Req1:", r.data)).catch(e => console.log("Req1 error:", e)),
    api.get('/mock-protected-endpoint').then(r => console.log("Req2:", r.data)).catch(e => console.log("Req2 error:", e)),
    api.get('/mock-protected-endpoint').then(r => console.log("Req3:", r.data)).catch(e => console.log("Req3 error:", e)),
  ]);
}