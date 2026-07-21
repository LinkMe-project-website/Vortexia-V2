import { startRegistration, startAuthentication } from "@simplewebauthn/browser";
import { supabase } from "@/lib/supabase";

const FUNCTION_URL = "https://rgoasqesstmwfuqzhmqp.supabase.co/functions/v1/webauthn";

async function callFn(payload: Record<string, unknown>) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ ...payload, origin: window.location.origin, rpID: window.location.hostname }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "WebAuthn request failed");
  return json;
}

/**
 * Registers this device's platform authenticator (Face Unlock / fingerprint
 * / screen lock, depending on device) for the current user. The actual
 * biometric scan happens entirely inside the OS — this code never sees it,
 * only the resulting public key.
 */
export async function registerBiometric(deviceLabel?: string) {
  const options = await callFn({ action: "reg-options" });
  const attResp = await startRegistration({ optionsJSON: options });
  return callFn({ action: "reg-verify", response: attResp, deviceLabel });
}

/**
 * Prompts the platform authenticator (Face Unlock/fingerprint/PIN fallback)
 * for a signed assertion, verified server-side. Use this to gate sensitive
 * actions: change email, renew VIP, apply for team.
 */
export async function verifyBiometric() {
  const options = await callFn({ action: "auth-options" });
  const authResp = await startAuthentication({ optionsJSON: options });
  return callFn({ action: "auth-verify", response: authResp });
}

export async function hasBiometricRegistered(userId: string) {
  const { data } = await supabase.from("webauthn_credentials").select("id").eq("user_id", userId).limit(1);
  return (data?.length ?? 0) > 0;
}
