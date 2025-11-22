import { component$, useContextProvider, Slot } from "@builder.io/qwik";
import { routeLoader$, type RequestHandler } from "@builder.io/qwik-city";
import jsyaml from "js-yaml";
import fs from "fs/promises";
import path from "path";

import Navbar from "~/components/furniture/nav";
import Footer from "~/components/furniture/footer";
import { ChecklistContext } from "~/store/checklist-context";
import type { Sections } from "~/types/PSC";

export const useChecklists = routeLoader$(async (ev) => {
  const localUrl = new URL('/personal-security-checklist.yml', ev.request.url).toString();
  try {
    const res = await fetch(localUrl);
    const text = await res.text();
    const parsed = jsyaml.load(text);
    return Array.isArray(parsed) ? parsed as Sections : [];
  } catch (err) {
    console.error('Failed to fetch checklist over HTTP, attempting filesystem fallback', err);
    try {
      const filePath = path.resolve(process.cwd(), '../personal-security-checklist.yml');
      const text = await fs.readFile(filePath, 'utf8');
      const parsed = jsyaml.load(text);
      return Array.isArray(parsed) ? parsed as Sections : [];
    } catch (fsErr) {
      console.error('Failed to load checklist data from filesystem', fsErr);
      return [] as Sections;
    }
  }
});

export const onGet: RequestHandler = async ({ cacheControl }) => {
  cacheControl({
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    maxAge: 5,
  });
};

export default component$(() => {
  const checklists = useChecklists();
  useContextProvider(ChecklistContext, checklists);

  return (
    <>
      <Navbar />
      <main class="bg-base-100 min-h-full">
        <Slot />
      </main>
      <Footer />
    </>
  );
});
