import { redirect } from "next/navigation";

/**
 * Shareholder accounts are opened only by the Aven team, so there is no
 * public sign-up. Anyone arriving here (old links, bookmarks) goes to the
 * share application instead.
 */
export default function RegisterPage() {
  redirect("/apply");
}
