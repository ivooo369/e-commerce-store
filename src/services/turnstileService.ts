import axios from "axios";
import * as Sentry from "@sentry/nextjs";

export async function verifyTurnstileToken(token: string): Promise<boolean> {
  if (!token) {
    return false;
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    return false;
  }

  try {
    const response = await axios.post(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data.success === true;
  } catch (error) {
    Sentry.captureException(error);
    return false;
  }
}

export function createTurnstileErrorResponse() {
  return new Response(
    JSON.stringify({
      error: "CAPTCHA проверката не беше успешна!",
      message: "Моля, потвърдете че не сте робот!",
    }),
    {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
