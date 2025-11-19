"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  ArrowLeft,
  ExternalLink,
  MousePointerClick,
  Clock,
} from "lucide-react";
import { useSnackbar } from "@/app/providers/SnackbarProvider";

type LinkStats = {
  code: string;
  targetUrl: string;
  shortUrl: string;
  clicks: number;
  lastClicked: string | null;
  createdAt: string | null;
};

export default function CodePage() {
  const params = useParams<{ code: string }>();
  const rawCode = params?.code;
  const code = typeof rawCode === "string" ? rawCode : undefined;
  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  const [data, setData] = useState<LinkStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) {
      setLoading(false);
      setError("Invalid short code");
      return;
    }
    let mounted = true;
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/links/${code}`, { cache: "no-store" });
        if (res.status === 404) {
          if (mounted) {
            setData(null);
            setError("Link not found (it may have been deleted)");
          }
          return;
        }
        if (!res.ok) {
          throw new Error(`Failed to load stats (${res.status})`);
        }
        const payload = (await res.json()) as LinkStats;
        if (mounted) {
          setData(payload);
        }
      } catch (err: any) {
        console.error(err);
        if (mounted) {
          setError(err.message ?? "Failed to load stats");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchStats();
    return () => {
      mounted = false;
    };
  }, [code]);

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      showSnackbar("Copied!", "success");
    } catch (err) {
      console.error("Copy failed:", err);
      showSnackbar("Copy failed", "error");
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Link href="/" passHref style={{ textDecoration: "none" }}>
        <Button startIcon={<ArrowLeft size={18} />} sx={{ mb: 3 }} component="span">
          Back to Dashboard
        </Button>
      </Link>

      {loading ? (
        <Box
          sx={{
            py: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : data ? (
        <>
          <Paper variant="outlined" sx={{ p: 4, borderRadius: 2, mb: 4 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Stack spacing={1} sx={{ maxWidth: { xs: "100%", sm: "70%" } }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Short Code
                </Typography>
                <Chip
                  label={data.code}
                  sx={{
                    bgcolor: "primary.50",
                    color: "primary.main",
                    fontFamily: "monospace",
                    fontWeight: 700,
                    width: "fit-content",
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  Target URL
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    flexWrap: "wrap",
                    width: "100%",
                  }}
                >
                  <ExternalLink size={16} color="#6b7280" />
                  <Box
                    sx={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      minWidth: 0,
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        bgcolor: "grey.50",
                        px: 1.5,
                        py: 1,
                        borderRadius: 1,
                        fontSize: "0.95rem",
                        flex: 1,
                        minWidth: 0,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={data.targetUrl}
                    >
                      {data.targetUrl}
                    </Typography>
                    <IconButton
                      aria-label="Copy target URL"
                      size="small"
                      onClick={() => handleCopy(data.targetUrl)}
                    >
                      <ContentCopyIcon fontSize="inherit" />
                    </IconButton>
                  </Box>
                </Box>
              </Stack>
              <Button
                variant="outlined"
                size="small"
                sx={{
                  alignSelf: { xs: "stretch", sm: "center" },
                  width: { xs: "100%", sm: "auto" },
                  whiteSpace: "nowrap",
                }}
                onClick={() => {
                  const shortPath = `/${data.code}`;
                  window.open(shortPath, "_blank");
                  router.push("/");
                }}
              >
                Open Short Link
              </Button>
            </Stack>

            <Divider sx={{ my: 3 }} />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Paper variant="outlined" sx={{ p: 3, flex: 1, borderRadius: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: "primary.50",
                    }}
                  >
                    <MousePointerClick size={24} color="#1976d2" />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Clicks
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {data.clicks.toLocaleString()}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              <Paper variant="outlined" sx={{ p: 3, flex: 1, borderRadius: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: "purple.50",
                    }}
                  >
                    <Clock size={24} color="#7e22ce" />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Last Clicked
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {data.lastClicked
                        ? new Date(data.lastClicked).toLocaleString()
                        : "Never"}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Stack>

            <Divider sx={{ my: 3 }} />

            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                Short URL
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {data.shortUrl}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Created At
              </Typography>
              <Typography variant="body1">
                {data.createdAt
                  ? new Date(data.createdAt).toLocaleString()
                  : "Unknown"}
              </Typography>
            </Stack>
          </Paper>
        </>
      ) : null}
    </Container>
  );
}
