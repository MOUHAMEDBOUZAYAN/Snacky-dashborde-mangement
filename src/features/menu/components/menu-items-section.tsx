"use client";

import {
  MoreHorizontal,
  Pencil,
  Plus,
  Power,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { t, tReplace } from "@/lib/i18n";

import {
  useCategoriesQuery,
  useMenuItemsQuery,
  useToggleMenuItemAvailabilityMutation,
} from "../hooks";
import type { MenuItem } from "../types";
import { formatPriceDh } from "../utils";
import { DeleteMenuItemDialog } from "./delete-menu-item-dialog";
import { MenuItemFormDialog } from "./menu-item-form-dialog";

const PAGE_SIZE = 10;

function ItemThumb({ item }: { item: MenuItem }) {
  if (item.imageUrl) {
    return (
      <div className="relative size-10 overflow-hidden rounded-lg bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.imageUrl}
          alt=""
          className="size-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="flex size-10 items-center justify-center rounded-lg bg-brand-orange-50 text-brand-orange-600">
      <UtensilsCrossed className="size-4" />
    </div>
  );
}

export function MenuItemsSection() {
  const { locale } = useAuth();
  const categoriesQuery = useCategoriesQuery();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [deleting, setDeleting] = useState<MenuItem | null>(null);

  const itemsQuery = useMenuItemsQuery({ categoryId: categoryFilter });
  const toggleAvailability = useToggleMenuItemAvailabilityMutation();

  const categories = useMemo(
    () => categoriesQuery.data ?? [],
    [categoriesQuery.data],
  );
  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const category of categories) {
      map.set(category.id, category.name);
    }
    return map;
  }, [categories]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return itemsQuery.data ?? [];
    return (itemsQuery.data ?? []).filter((item) =>
      item.name.toLowerCase().includes(q),
    );
  }, [itemsQuery.data, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(item: MenuItem) {
    setEditing(item);
    setFormOpen(true);
  }

  const loading = itemsQuery.isLoading || categoriesQuery.isLoading;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 space-y-0 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>{t("menuItems", locale)}</CardTitle>
          <CardDescription>{t("articlesSubtitle", locale)}</CardDescription>
        </div>
        <Button
          type="button"
          size="sm"
          className="bg-brand-orange hover:bg-brand-orange-600"
          onClick={openCreate}
          disabled={categories.length === 0}
        >
          <Plus data-icon="inline-start" />
          {t("addMenuItem", locale)}
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder={t("searchByName", locale)}
            className="sm:max-w-xs"
          />
          <Select
            value={categoryFilter}
            onValueChange={(value) => {
              setCategoryFilter(value ?? "all");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder={t("filterByCategory", locale)} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("all", locale)}</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="rounded-xl border border-dashed border-brand-orange-200 bg-brand-orange-50/40 px-4 py-10 text-center text-sm text-muted-foreground">
            {t("menuItemsEmpty", locale)}
          </p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14" />
                  <TableHead>{t("menuItemName", locale)}</TableHead>
                  <TableHead className="hidden md:table-cell">
                    {t("menuItemCategory", locale)}
                  </TableHead>
                  <TableHead>{t("menuItemPrice", locale)}</TableHead>
                  <TableHead>{t("availability", locale)}</TableHead>
                  <TableHead className="w-12 text-right">
                    {t("actions", locale)}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <ItemThumb item={item} />
                    </TableCell>
                    <TableCell>
                      <div className="min-w-0">
                        <p className="font-medium text-brand-charcoal">
                          {item.name}
                        </p>
                        {item.description ? (
                          <p className="line-clamp-1 text-xs text-muted-foreground">
                            {item.description}
                          </p>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {item.category?.name ??
                        categoryNameById.get(item.categoryId) ??
                        "—"}
                    </TableCell>
                    <TableCell className="font-medium tabular-nums">
                      {formatPriceDh(item.price)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          item.isAvailable
                            ? "bg-brand-green-100 text-brand-green-800"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {item.isAvailable
                          ? t("menuItemAvailable", locale)
                          : t("menuItemUnavailable", locale)}
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
                          <DropdownMenuItem onClick={() => openEdit(item)}>
                            <Pencil />
                            {t("edit", locale)}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={toggleAvailability.isPending}
                            onClick={() =>
                              toggleAvailability.mutate({
                                id: item.id,
                                isAvailable: !item.isAvailable,
                              })
                            }
                          >
                            <Power />
                            {t("toggleAvailability", locale)}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setDeleting(item)}
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

            {totalPages > 1 ? (
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  {tReplace(
                    "pageOf",
                    { page: currentPage, total: totalPages },
                    locale,
                  )}
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    {t("previous", locale)}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() =>
                      setPage((p) => Math.min(totalPages, p + 1))
                    }
                  >
                    {t("next", locale)}
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </CardContent>

      <MenuItemFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        item={editing}
        categories={categories}
      />
      <DeleteMenuItemDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        item={deleting}
      />
    </Card>
  );
}
