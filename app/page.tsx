"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Box, Container } from "@mui/material";
import { useSnackbar } from "./providers/SnackbarProvider";
import { AppHeader } from "@/components/AppHeader";
import { LinksTableSection } from "@/components/LinksTableSection";
import { CreateLinkDialog } from "@/components/CreateLinkDialog";
import type { LinkItem } from "@/types/link";

function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}

export default function URLShortenerLayout() {
  const { showSnackbar } = useSnackbar();
  const [searchQuery, setSearchQuery] = useState("");
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [linksLoading, setLinksLoading] = useState(true);
  const [linksError, setLinksError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [targetUrl, setTargetUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    targetUrl?: string;
    code?: string;
  }>({});

  const [deletingCode, setDeletingCode] = useState<string | null>(null);
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 400);

  const fetchLinks = useCallback(async (query?: string) => {
    try {
      setLinksLoading(true);
      setLinksError(null);
      const qs = query ? `?q=${encodeURIComponent(query)}` : "";
      const res = await fetch(`/api/links${qs}`, { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Failed to fetch links (${res.status})`);
      }
      const data = await res.json();
      setLinks(data);
    } catch (err: any) {
      console.error(err);
      setLinksError(err.message ?? "Failed to load links");
    } finally {
      setLinksLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  useEffect(() => {
    const refresh = () => {
      const trimmed = debouncedSearchQuery.trim();
      fetchLinks(trimmed || undefined);
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        refresh();
      }
    };

    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [debouncedSearchQuery, fetchLinks]);

  const debouncedSearchInitialized = useRef(false);
  useEffect(() => {
    if (!debouncedSearchInitialized.current) {
      debouncedSearchInitialized.current = true;
      return;
    }

    const trimmed = debouncedSearchQuery.trim();
    fetchLinks(trimmed || undefined);
  }, [debouncedSearchQuery, fetchLinks]);

  const handleCreateLink = useCallback(async () => {
    setCreateLoading(true);
    setFormError(null);
    setFieldErrors({});
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUrl,
          code: customCode.trim() || undefined,
        }),
      });

      if (res.status === 409) {
        const data = await res.json();
        setFieldErrors((prev) => ({
          ...prev,
          code: data?.error ?? "Code already exists",
        }));
        return;
      }

      if (res.status === 400) {
        const data = await res.json();
        const details = data?.details ?? {};
        setFieldErrors({
          targetUrl: details?.fieldErrors?.targetUrl?.[0],
          code: details?.fieldErrors?.code?.[0],
        });
        setFormError(data?.error ?? "Invalid input");
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to create link");
      }

      await res.json();
      showSnackbar("Link created successfully", "success");
      setTargetUrl("");
      setCustomCode("");
      setIsCreateOpen(false);
      const currentSearch = searchQuery.trim();
      fetchLinks(currentSearch || undefined);
    } catch (err: any) {
      console.error(err);
      setFormError(err.message ?? "Failed to create link");
    } finally {
      setCreateLoading(false);
    }
  }, [customCode, fetchLinks, searchQuery, showSnackbar, targetUrl]);

  const handleDeleteLink = useCallback(
    async (code: string) => {
      if (deletingCode) return;
      setDeletingCode(code);
      try {
        const res = await fetch(`/api/links/${code}`, {
          method: "DELETE",
        });

        if (res.status === 404) {
          showSnackbar("Link not found or already deleted", "warning");
          const currentSearch = searchQuery.trim();
          await fetchLinks(currentSearch || undefined);
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to delete link");
        }

        showSnackbar("Link deleted", "success");

        const currentSearch = searchQuery.trim();
        await fetchLinks(currentSearch || undefined);
      } catch (err: any) {
        console.error(err);
        showSnackbar(err.message ?? "Failed to delete link", "error");
      } finally {
        setDeletingCode(null);
      }
    },
    [deletingCode, fetchLinks, searchQuery, showSnackbar]
  );

  const isSearching = debouncedSearchQuery.trim().length > 0;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
      <AppHeader />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <LinksTableSection
          links={links}
          isLoading={linksLoading}
          error={linksError}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isSearching={isSearching}
          onClearSearch={() => setSearchQuery("")}
          onRequestCreate={() => {
            setIsCreateOpen(true);
            setFormError(null);
            setFieldErrors({});
          }}
          onDelete={handleDeleteLink}
          deletingCode={deletingCode}
        />
      </Container>

      <CreateLinkDialog
        open={isCreateOpen}
        loading={createLoading}
        formError={formError}
        fieldErrors={fieldErrors}
        targetUrl={targetUrl}
        customCode={customCode}
        onTargetChange={setTargetUrl}
        onCodeChange={setCustomCode}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateLink}
      />
    </Box>
  );
}
