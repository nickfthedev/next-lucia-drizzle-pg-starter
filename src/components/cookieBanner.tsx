"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getCookie, setCookie } from "cookies-next";

export function CookieBanner() {
  const [consent, setConsent] = useState<boolean | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const handleAccept = () => {
    setConsent(true);
    setCookie("consent", "true");
  };

  const handleDecline = () => {
    setConsent(false);
    setCookie("consent", "false");
  };

  useEffect(() => {
    const consent = getCookie("consent");

    if (consent != undefined) {
      setConsent(consent === "true");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (consent === true) {
      // Tracking goes here
      console.log("Tracking goes here");
    }
  }, [consent]);

  if (consent != undefined || loading) {
    return null;
  }

  return (
    <div className="absolute z-10 w-full bottom-0 left-0 right-0 bg-base-300 text-base-content">
      <div className="w-full flex flex-col items-center gap-4 p-4 lg:flex-row lg:justify-between">
        <div className="flex flex-col gap-4 text-center">
          <p className="max-w-4xl text-sm leading-6 text-base-content">
            This website uses cookies to enhance your browsing experience,
            analyze site traffic, and serve better user experiences. Learn more
            in our{" "}
            <Link className="font-semibold text-primary" href="/privacy-policy">
              Privacy Policy
            </Link>
          </p>
        </div>

        <div className="flex flex-col w-full gap-2 lg:flex-row lg:w-fit">
          <button className="btn btn-primary" onClick={handleAccept}>
            Accept
          </button>
          <button className="btn btn-outline" onClick={handleDecline}>
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
