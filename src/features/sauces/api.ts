import { api } from "@/lib/api";

import type { CreateSauceInput, Sauce, UpdateSauceInput } from "./types";

export async function fetchSauces(): Promise<Sauce[]> {
  const { data } = await api.get<Sauce[]>("/sauces/all");
  return data;
}

export async function createSauce(input: CreateSauceInput): Promise<Sauce> {
  const { data } = await api.post<Sauce>("/sauces", input);
  return data;
}

export async function updateSauce(
  id: string,
  input: UpdateSauceInput,
): Promise<Sauce> {
  const { data } = await api.patch<Sauce>(`/sauces/${id}`, input);
  return data;
}

export async function deleteSauce(
  id: string,
): Promise<{ id: string; deleted: boolean }> {
  const { data } = await api.delete<{ id: string; deleted: boolean }>(
    `/sauces/${id}`,
  );
  return data;
}
