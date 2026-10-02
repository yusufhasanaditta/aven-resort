"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

/**
 * The circular's images as a grid; one opens full screen, with arrows and
 * Escape — so a scanned printed circular can actually be read.
 */
const noop = () => () => {};

export function JobGallery({ images, title }: { images: string[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  // The viewer is a portal on document.body, so it only renders after hydration.
  const client = useSyncExternalStore(noop, () => true, () => false);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % images.length));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i - 1 + images.length) % images.length));
    };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open, images.length]);

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((src, i) => (
          <li key={src}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              className="group relative block aspect-[4/3] w-full overflow-hidden rounded-2xl bg-forest-900/5 ring-1 ring-forest-600/10"
              aria-label={`Open image ${i + 1} of ${images.length}`}
            >
              <Image
                src={src}
                alt={`${title} — image ${i + 1}`}
                fill
                sizes="(min-width: 1024px) 18rem, 45vw"
                unoptimized={src.startsWith("http")}
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute inset-0 flex items-end justify-end bg-gradient-to-t from-forest-950/40 to-transparent p-2.5 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="rounded-full bg-cream-50/95 px-2.5 py-1 text-[0.6875rem] font-medium text-forest-900">View full size</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {client &&
        createPortal(
          <AnimatePresence>
            {open !== null && (
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label={`${title} — image ${open + 1} of ${images.length}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[90] flex items-center justify-center bg-forest-950/92 p-4 backdrop-blur-sm sm:p-10"
                onClick={() => setOpen(null)}
              >
                <motion.div
                  key={open}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative h-full w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* The original file, not a resized copy, so a scanned circular stays readable. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={images[open]} alt={`${title} — image ${open + 1}`} className="absolute inset-0 h-full w-full object-contain" />
                </motion.div>
                <button type="button" onClick={() => setOpen(null)} className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-cream-50/10 text-cream-50 hover:bg-cream-50/20" aria-label="Close">
                  ✕
                </button>
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpen((open - 1 + images.length) % images.length);
                      }}
                      className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-cream-50/10 text-2xl text-cream-50 hover:bg-cream-50/20"
                      aria-label="Previous image"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpen((open + 1) % images.length);
                      }}
                      className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-cream-50/10 text-2xl text-cream-50 hover:bg-cream-50/20"
                      aria-label="Next image"
                    >
                      ›
                    </button>
                    <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-cream-50/10 px-3 py-1 text-xs text-cream-100">
                      {open + 1} / {images.length}
                    </p>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}

/** Copy the circular's link, or pass it on by WhatsApp or Facebook. */
export function ShareJob({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  function url() {
    return window.location.href.split("#")[0];
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", url());
    }
  }

  const chip = "inline-flex h-9 items-center gap-1.5 rounded-full bg-forest-600/7 px-3.5 text-xs font-medium text-forest-800 transition-colors hover:bg-forest-600/12";
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={copy} className={chip}>
        {copied ? "Link copied ✓" : "Copy link"}
      </button>
      <button type="button" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`${title} — Aven Resort careers\n${url()}`)}`, "_blank", "noopener")} className={chip}>
        WhatsApp
      </button>
      <button type="button" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url())}`, "_blank", "noopener")} className={chip}>
        Facebook
      </button>
    </div>
  );
}
