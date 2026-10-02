"use client";

import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
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
import { t, tReplace } from "@/lib/i18n";

import { useCategoriesQuery, useMenuItemsQuery } from "../hooks";
import type { Category } from "../types";
import { CategoryFormDialog } from "./category-form-dialog";
import { DeleteCategoryDialog } from "./delete-category-dialog";

export function CategoriesSection() {
  const { locale } = useAuth();
  const categoriesQuery = useCategoriesQuery();
  const itemsQuery = useMenuItemsQuery();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const itemCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of itemsQuery.data ?? []) {
      map.set(item.categoryId, (map.get(item.categoryId) ?? 0) + 1);
    }
    return map;
  }, [itemsQuery.data]);

  const categories = categoriesQuery.data ?? [];
  const loading = categoriesQuery.isLoading;

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    setFormOpen(true);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle>{t("categories", locale)}</CardTitle>
          <CardDescription>{t("categoriesSubtitle", locale)}</CardDescription>
        </div>
        <Button
          type="button"
          size="sm"
          className="bg-brand-orange hover:bg-brand-orange-600"
          onClick={openCreate}
        >
          <Plus data-icon="inline-start" />
          {t("addCategory", locale)}
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <p className="rounded-xl border border-dashed border-brand-orange-200 bg-brand-orange-50/40 px-4 py-8 text-center text-sm text-muted-foreground">
            {t("categoriesEmpty", locale)}
          </p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const count = itemCounts.get(category.id) ?? 0;
              return (
                <li
                  key={category.id}
                  className="flex items-start justify-between gap-2 rounded-xl border border-border bg-white px-3 py-3"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium text-brand-charcoal">
                        {category.name}
                      </p>
                      <Badge
                        variant="secondary"
                        className={
                          category.isActive
                            ? "bg-brand-green-100 text-brand-green-800"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {category.isActive
                          ? t("categoryActive", locale)
                          : t("categoryInactive", locale)}
                      </Badge>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {category.slug} · #{category.sortOrder} ·{" "}
                      {tReplace("categoryItemCount", { count }, locale)}
                    </p>
                  </div>

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
                      <DropdownMenuItem onClick={() => openEdit(category)}>
                        <Pencil />
                        {t("edit", locale)}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setDeleting(category)}
                      >
                        <Trash2 />
                        {t("delete", locale)}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>

      <CategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editing}
      />
      <DeleteCategoryDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        category={deleting}
        itemCount={deleting ? (itemCounts.get(deleting.id) ?? 0) : 0}
      />
    </Card>
  );
}
