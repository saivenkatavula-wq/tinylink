"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { AppHeader } from "@/components/AppHeader";

type HealthInfo = {
  ok: boolean;
  version?: string;
  uptime?: string;
  [key: string]: unknown;
};

export default function HealthPage() {
  const [healthData, setHealthData] = useState<HealthInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/healthz", { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Health check failed (${res.status})`);
      }
      const data = (await res.json()) as HealthInfo;
      setHealthData(data);
      setLastChecked(new Date());
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Unable to reach /healthz");
      setHealthData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const extraEntries =
    healthData &&
    Object.entries(healthData).filter(
      ([key]) => !["ok", "version", "uptime"].includes(key)
    );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
      <AppHeader />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              System Health
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Status powered by <code>/healthz</code>
            </Typography>
          </Box>

          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            {loading ? (
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
            ) : error ? (
              <Alert
                severity="error"
                action={
                  <Button color="inherit" size="small" onClick={fetchHealth}>
                    Retry
                  </Button>
                }
              >
                {error}
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
                  {lastChecked && (
                    <Typography variant="body2" color="text.secondary">
                      Last checked {lastChecked.toLocaleString()}
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
              <Alert severity="info">No health data available.</Alert>
            )}
          </Paper>

          <Button
            variant="outlined"
            onClick={fetchHealth}
            disabled={loading}
            sx={{ alignSelf: { xs: "stretch", sm: "flex-start" } }}
          >
            {loading ? "Checking..." : "Refresh Status"}
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
