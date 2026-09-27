"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: { translate?: { TranslateElement: new (opts: object, id: string) => unknown } };
  }
}

/**
 * Automatic Bangla for everything that has no hand-written translation yet,
 * via Google's website translator. Only mounted when Bangla is chosen;
 * anything marked `translate="no"` (the hand-translated parts) is left alone.
 *
 * The translator rewrites text nodes behind React's back, which can make
 * React throw when it later removes or moves them. The two patches below make
 * those DOM calls tolerant, the standard fix for running both together.
 */
export function AutoTranslate() {
  useEffect(() => {
    const proto = Node.prototype as Node & { __avenPatched?: boolean };
    if (!proto.__avenPatched) {
      proto.__avenPatched = true;
      const removeChild = proto.removeChild;
      proto.removeChild = function <T extends Node>(this: Node, child: T): T {
        if (child.parentNode !== this) return child;
        return removeChild.call(this, child) as T;
      };
      const insertBefore = proto.insertBefore;
      proto.insertBefore = function <T extends Node>(this: Node, node: T, ref: Node | null): T {
        if (ref && ref.parentNode !== this) return insertBefore.call(this, node, null) as T;
        return insertBefore.call(this, node, ref) as T;
      };
    }

    if (document.getElementById("google-translate-script")) return;
    window.googleTranslateElementInit = () => {
      if (window.google?.translate) {
        new window.google.translate.TranslateElement({ pageLanguage: "en", includedLanguages: "bn", autoDisplay: false }, "google_translate_element");
      }
    };
    const s = document.createElement("script");
    s.id = "google-translate-script";
    s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    s.async = true;
    document.body.appendChild(s);
  }, []);

  return <div id="google_translate_element" className="hidden" aria-hidden="true" />;
}
