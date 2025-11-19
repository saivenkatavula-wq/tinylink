import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Container,
  Paper,
  Stack,
  Typography,
  Chip,
  Button,
  Divider,
  Box,
} from "@mui/material";
import {
  ArrowLeft,
  ExternalLink,
  MousePointerClick,
  Clock,
} from "lucide-react";

async function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

async function fetchStats(code: string) {
  const baseUrl = await getBaseUrl();
  const res = await fetch(`${baseUrl}/api/links/${code}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to load stats");
  return res.json();
}

export default async function CodePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const data = await fetchStats(code);
  if (!data) notFound();

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Link href="/" passHref style={{ textDecoration: "none" }}>
        <Button startIcon={<ArrowLeft size={18} />} sx={{ mb: 3 }} component="span">
          Back to Dashboard
        </Button>
      </Link>

      <Paper variant="outlined" sx={{ p: 4, borderRadius: 2, mb: 4 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="space-between"
        >
          <Stack spacing={1}>
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
            <Stack direction="row" spacing={1} alignItems="center">
              <ExternalLink size={16} color="#6b7280" />
              <Typography variant="body1">{data.targetUrl}</Typography>
            </Stack>
          </Stack>
          <Button
            variant="outlined"
            component="a"
            href={`/${data.code}`}
            target="_blank"
            rel="noopener noreferrer"
            size="small"
            sx={{
              alignSelf: { xs: "stretch", sm: "center" },
              width: { xs: "100%", sm: "auto" },
              whiteSpace: "nowrap",
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
    </Container>
  );
}
