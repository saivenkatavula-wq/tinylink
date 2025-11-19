"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Stack,
  TextField,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Link2,
  BarChart3,
  Activity,
  Plus,
  Search,
  Copy,
  Trash2,
  ExternalLink,
  TrendingUp,
  Clock,
  MousePointerClick,
} from "lucide-react";
import Link from "next/link";
import { useSnackbar } from "./providers/SnackbarProvider";

// -----------------------------------------------------------------------------
// Type Definitions
// -----------------------------------------------------------------------------

type LinkItem = {
  code: string;
  targetUrl: string;
  shortUrl: string;
  clicks: number;
  lastClicked: string | null;
  createdAt: string;
  updatedAt?: string;
};

type HealthInfo = {
  ok: boolean;
  version?: string;
  uptime?: string;
  [key: string]: unknown;
};

function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------

export default function URLShortenerLayout() {
  const { showSnackbar } = useSnackbar();
  const [activeView, setActiveView] = useState<"dashboard" | "health">(
    "dashboard"
  );
  const [searchQuery, setSearchQuery] = useState("");

  // 🔹 Real data from backend
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
  const [healthData, setHealthData] = useState<HealthInfo | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [lastHealthCheck, setLastHealthCheck] = useState<Date | null>(null);
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 400);

  // ---- Load all links for dashboard ----
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

  // ---- Filtered list for search ----


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

  const fetchHealth = useCallback(async () => {
    try {
      setHealthLoading(true);
      setHealthError(null);
      const res = await fetch("/healthz", { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Health check failed (${res.status})`);
      }
      const data = (await res.json()) as HealthInfo;
      setHealthData(data);
      setLastHealthCheck(new Date());
    } catch (err: any) {
      console.error(err);
      setHealthError(err.message ?? "Unable to reach health endpoint");
      setHealthData(null);
    } finally {
      setHealthLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeView === "health") {
      fetchHealth();
    }
  }, [activeView, fetchHealth]);

  // -----------------------------------------------------------------------------
  // View Components
  // -----------------------------------------------------------------------------

  // ---- Dashboard view (uses real links) ----

  const isSearching = searchQuery.trim().length > 0;

  const HealthCheckView = () => {
    const extraEntries =
      healthData &&
      Object.entries(healthData).filter(
        ([key]) => !["ok", "version", "uptime"].includes(key)
      );

    return (
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            System Health
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Live status from <code>/healthz</code>
          </Typography>
        </Box>

        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          {healthLoading ? (
            <Box
              sx={{
                py: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress />
            </Box>
          ) : healthError ? (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={fetchHealth}>
                  Retry
                </Button>
              }
            >
              {healthError}
            </Alert>
          ) : healthData ? (
            <Stack spacing={2}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
              >
                <Stack spacing={1}>
                  <Typography variant="subtitle1">Overall Status</Typography>
                  <Chip
                    label={healthData.ok ? "Operational" : "Issues detected"}
                    color={healthData.ok ? "success" : "warning"}
                    sx={{ fontWeight: 600, width: "fit-content" }}
                  />
                </Stack>
                {lastHealthCheck && (
                  <Typography variant="body2" color="text.secondary">
                    Last checked {lastHealthCheck.toLocaleString()}
                  </Typography>
                )}
              </Stack>

              <Divider />

              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Version
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {healthData.version ?? "Unknown"}
                </Typography>
              </Stack>

              {"uptime" in healthData && (
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Uptime
                  </Typography>
                  <Typography variant="body1">
                    {String(healthData.uptime)}
                  </Typography>
                </Stack>
              )}

              {extraEntries && extraEntries.length > 0 && (
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Additional Details
                  </Typography>
                  {extraEntries.map(([key, value]) => (
                    <Typography key={key} variant="body2">
                      <strong>{key}:</strong> {String(value)}
                    </Typography>
                  ))}
                </Stack>
              )}
            </Stack>
          ) : (
            <Alert severity="info">
              No health data yet. Click refresh to run a health check.
            </Alert>
          )}
        </Paper>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
        >
          <Button
            variant="outlined"
            onClick={fetchHealth}
            disabled={healthLoading}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            {healthLoading ? "Checking..." : "Refresh Status"}
          </Button>
        </Stack>
      </Stack>
    );
  };

  // -----------------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------------

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
      {/* Header */}
      <Box
        component="header"
        sx={{
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              height: 64,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Link2 size={26} color="#1976d2" />
              <Typography variant="h6" fontWeight={700}>
                ShortLinks
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                onClick={() => setActiveView("dashboard")}
                sx={{
                  borderRadius: 2,
                  fontWeight: 500,
                  bgcolor:
                    activeView === "dashboard" ? "primary.50" : "transparent",
                  color:
                    activeView === "dashboard"
                      ? "primary.main"
                      : "text.secondary",
                  "&:hover": { bgcolor: "primary.50" },
                }}
              >
                Dashboard
              </Button>
              <Button
                size="small"
                onClick={() => setActiveView("health")}
                sx={{
                  borderRadius: 2,
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  bgcolor:
                    activeView === "health" ? "primary.50" : "transparent",
                  color:
                    activeView === "health"
                      ? "primary.main"
                      : "text.secondary",
                  "&:hover": { bgcolor: "primary.50" },
                }}
              >
                <Activity size={18} /> Health
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Main content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {activeView === "dashboard" && (
          <Stack spacing={3}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  Links
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                  Manage your shortened URLs
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Plus size={20} />}
                sx={{ borderRadius: 2, px: 3, py: 1.2 }}
                onClick={() => {
                  setIsCreateOpen(true);
                  setFormError(null);
                  setFieldErrors({});
                }}
              >
                Add New Link
              </Button>
            </Stack>

            <Box position="relative">
              <Box
                sx={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "text.secondary",
                }}
              >
                <Search size={20} />
              </Box>
              <TextField
                fullWidth
                placeholder="Search by code or URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="outlined"
                sx={{
                  "& .MuiInputBase-root": {
                    pl: 5,
                    borderRadius: 2,
                  },
                }}
              />
            </Box>

            <Paper
              variant="outlined"
              sx={{ borderRadius: 2, overflow: "hidden", bgcolor: "background.paper" }}
            >
              {linksLoading ? (
                <Box
                  sx={{
                    py: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : linksError ? (
                <Box sx={{ p: 3 }}>
                  <Alert severity="error">{linksError}</Alert>
                </Box>
              ) : links.length === 0 ? (
                <Box textAlign="center" py={6}>
                  <Box mb={2} display="flex" justifyContent="center">
                    <Link2 size={40} color="#9ca3af" />
                  </Box>
                  <Typography variant="h6" fontWeight={600}>
                    {isSearching ? "No matching links" : "No links yet"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    {isSearching
                      ? "Try searching for a different code or URL."
                      : "Get started by creating your first shortened URL"}
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Plus size={18} />}
                    sx={{ borderRadius: 2 }}
                    onClick={() => {
                      if (isSearching) {
                        setSearchQuery("");
                      } else {
                        setIsCreateOpen(true);
                        setFormError(null);
                        setFieldErrors({});
                      }
                    }}
                  >
                    {isSearching ? "Clear search" : "Add Your First Link"}
                  </Button>
                </Box>
              ) : (
                <Box sx={{ overflowX: "auto" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: "grey.50" }}>
                        <TableCell sx={{ fontWeight: 600 }}>Short Code</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Short URL</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Target URL</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Clicks</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Last Clicked</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {links.map((link) => (
                        <TableRow
                          key={link.code}
                          hover
                          sx={{
                            "&:hover": { bgcolor: "grey.50" },
                            transition: "background-color 0.15s ease",
                          }}
                        >
                          <TableCell>
                            <Chip
                              label={link.code}
                              size="small"
                              sx={{
                                bgcolor: "primary.50",
                                color: "primary.main",
                                fontFamily: "monospace",
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                              sx={{ maxWidth: 260 }}
                            >
                              <Typography variant="body2" color="text.primary" noWrap>
                                {link.shortUrl}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  navigator.clipboard
                                    .writeText(link.shortUrl)
                                    .then(() => showSnackbar("Copied!", "success"))
                                    .catch(() => showSnackbar("Copy failed", "error"))
                                }
                              >
                                <Copy size={16} />
                              </IconButton>
                              <IconButton
                                size="small"
                                component="a"
                                href={link.shortUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink size={16} />
                              </IconButton>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              noWrap
                              sx={{ maxWidth: 260 }}
                            >
                              {link.targetUrl}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <TrendingUp size={16} color="#16a34a" />
                              <Typography variant="body2" fontWeight={600} color="text.primary">
                                {link.clicks.toLocaleString()}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {link.lastClicked
                                ? new Date(link.lastClicked).toLocaleString()
                                : "Never"}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <IconButton
                                size="small"
                                component={Link}
                                href={`/code/${link.code}`}
                                title="View Stats"
                                sx={{
                                  color: "primary.main",
                                  "&:hover": { bgcolor: "primary.50" },
                                }}
                              >
                                <BarChart3 size={18} />
                              </IconButton>
                              <IconButton
                                size="small"
                                title="Delete"
                                sx={{
                                  color: "error.main",
                                  "&:hover": { bgcolor: "error.50" },
                                }}
                                onClick={() => handleDeleteLink(link.code)}
                                disabled={deletingCode === link.code}
                              >
                                <Trash2 size={18} />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </Paper>
          </Stack>
        )}
        {activeView === "health" && <HealthCheckView />}
      </Container>

      <Dialog
        open={isCreateOpen}
        onClose={() => {
          if (createLoading) return;
          setIsCreateOpen(false);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Short Link</DialogTitle>
        <DialogContent>
          <Stack
            spacing={2}
            component="form"
            id="create-link-form"
            onSubmit={(e) => {
              e.preventDefault();
              void handleCreateLink();
            }}
            sx={{ mt: 1 }}
          >
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField
              label="Target URL"
              placeholder="https://example.com/docs"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              fullWidth
              required
              error={Boolean(fieldErrors.targetUrl)}
              helperText={
                fieldErrors.targetUrl ??
                "Enter the full URL you want to redirect to"
              }
            />
            <TextField
              label="Custom Code (optional)"
              placeholder="6-8 letters or numbers"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              fullWidth
              error={Boolean(fieldErrors.code)}
              helperText={fieldErrors.code ?? "Leave blank to auto-generate"}
              inputProps={{ maxLength: 8 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setIsCreateOpen(false)} disabled={createLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-link-form"
            variant="contained"
            disabled={createLoading}
          >
            {createLoading ? "Creating..." : "Create Link"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
