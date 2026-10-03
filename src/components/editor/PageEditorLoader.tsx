"use client";

import dynamic from "next/dynamic";

// Only admins get this, and only in the browser: visitors never download the editor.
const PageEditor = dynamic(() => import("./PageEditor"), { ssr: false });

export function PageEditorLoader() {
  return <PageEditor />;
}
