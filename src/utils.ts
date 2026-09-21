import { sourceImageFor } from "../scripts/og-cards.mjs";

export function formatDate(date: Date): string {
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// A 200 palabras por minuto, que es lo que se suele usar
export function minutosDeLectura(texto = ""): number {
  const palabras = texto.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(palabras / 200));
}

// La tarjeta que compone scripts/og-cards.mjs, si la entrada tiene alguna imagen
export function portadaDe(post: { id: string; body?: string; data: { image?: string } }) {
  const origen = post.data.image ?? sourceImageFor(post.body ?? "");
  return origen ? `/og/${post.id}.png` : null;
}
