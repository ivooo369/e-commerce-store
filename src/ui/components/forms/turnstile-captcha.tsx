"use client";

import {
  useRef,
  useState,
  useLayoutEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import type {
  TurnstileCaptchaProps,
  TurnstileCaptchaRef,
} from "@/lib/types/interfaces";

export default forwardRef<TurnstileCaptchaRef, TurnstileCaptchaProps>(
  function TurnstileCaptcha(
    {
      onVerify,
      onError,
      onExpire,
      theme = "auto",
      size = "normal",
      className = "",
    },
    ref
  ) {
    const turnstileRef = useRef<TurnstileInstance>(null);
    const [isDark, setIsDark] = useState(false);

    useImperativeHandle(ref, () => ({
      reset: () => {
        turnstileRef.current?.reset();
      },
    }));

    useLayoutEffect(() => {
      const checkDarkMode = () => {
        const hasDarkClass =
          document.documentElement.classList.contains("dark");
        const isDarkMode = hasDarkClass;

        setIsDark(isDarkMode);
      };

      checkDarkMode();

      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", checkDarkMode);

      const observer = new MutationObserver(checkDarkMode);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });

      return () => {
        mediaQuery.removeEventListener("change", checkDarkMode);
        observer.disconnect();
      };
    }, []);

    const handleVerify = (token: string) => {
      onVerify(token);
    };

    const handleError = () => {
      onError?.();
    };

    const handleExpire = () => {
      onExpire?.();
    };

    const actualTheme = theme === "auto" ? (isDark ? "dark" : "light") : theme;

    return (
      <div className={`flex justify-center ${className}`}>
        <Turnstile
          ref={turnstileRef}
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
          onSuccess={handleVerify}
          onError={handleError}
          onExpire={handleExpire}
          options={{
            theme: actualTheme,
            size,
          }}
        />
      </div>
    );
  }
);
