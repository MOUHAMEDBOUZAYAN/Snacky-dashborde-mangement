"use client";

import { MoreHorizontal, Pencil, Plus, Power, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { t } from "@/lib/i18n";

import {
  useSaucesQuery,
  useToggleSauceActiveMutation,
} from "../hooks";
import type { Sauce } from "../types";
import { DeleteSauceDialog } from "./delete-sauce-dialog";
import { SauceFormDialog } from "./sauce-form-dialog";

export function SaucesSection() {
  const { locale } = useAuth();
  const saucesQuery = useSaucesQuery();
  const toggleActive = useToggleSauceActiveMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Sauce | null>(null);
  const [deleting, setDeleting] = useState<Sauce | null>(null);

  const sauces = useMemo(() => {
    const list = saucesQuery.data ?? [];
    return [...list].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  }, [saucesQuery.data]);

  const loading = saucesQuery.isLoading;

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(sauce: Sauce) {
    setEditing(sauce);
    setFormOpen(true);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle>{t("sauces", locale)}</CardTitle>
          <CardDescription>{t("saucesSubtitle", locale)}</CardDescription>
        </div>
        <Button
          type="button"
          size="sm"
          className="bg-brand-orange hover:bg-brand-orange-600"
          onClick={openCreate}
        >
          <Plus data-icon="inline-start" />
          {t("addSauce", locale)}
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : sauces.length === 0 ? (
          <p className="rounded-xl border border-dashed border-brand-orange-200 bg-brand-orange-50/40 px-4 py-8 text-center text-sm text-muted-foreground">
            {t("saucesEmpty", locale)}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("sauceName", locale)}</TableHead>
                <TableHead className="w-24">{t("sauceSortOrder", locale)}</TableHead>
                <TableHead>{t("availability", locale)}</TableHead>
                <TableHead className="w-12 text-right">
                  <span className="sr-only">{t("actions", locale)}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sauces.map((sauce) => (
                <TableRow key={sauce.id}>
                  <TableCell className="font-medium text-brand-charcoal">
                    {sauce.name}
                  </TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {sauce.sortOrder}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        sauce.isActive
                          ? "bg-brand-green-100 text-brand-green-800"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {sauce.isActive
                        ? t("sauceActive", locale)
                        : t("sauceInactive", locale)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={t("actions", locale)}
                          >
                            <MoreHorizontal />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(sauce)}>
                          <Pencil />
                          {t("edit", locale)}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={toggleActive.isPending}
                          onClick={() =>
                            toggleActive.mutate({
                              id: sauce.id,
                              isActive: !sauce.isActive,
                            })
                          }
                        >
                          <Power />
                          {t("toggleSauceActive", locale)}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeleting(sauce)}
                        >
                          <Trash2 />
                          {t("delete", locale)}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <SauceFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        sauce={editing}
      />
      <DeleteSauceDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        sauce={deleting}
      />
    </Card>
  );
}
