"use client";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useSnackbar } from "@/app/providers/SnackbarProvider";
import {
  BarChart3,
  Copy,
  ExternalLink,
  Link2,
  Plus,
  Search,
  Trash2,
  TrendingUp,
} from "lucide-react";
import type { LinkItem } from "@/types/link";

type LinksTableSectionProps = {
  links: LinkItem[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  isSearching: boolean;
  onClearSearch: () => void;
  onRequestCreate: () => void;
  onDelete: (code: string) => void;
  deletingCode: string | null;
};

export function LinksTableSection({
  links,
  isLoading,
  error,
  searchQuery,
  onSearchChange,
  isSearching,
  onClearSearch,
  onRequestCreate,
  onDelete,
  deletingCode,
}: LinksTableSectionProps) {
  const { showSnackbar } = useSnackbar();

  return (
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
          onClick={onRequestCreate}
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
          onChange={(e) => onSearchChange(e.target.value)}
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
        {isLoading ? (
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
          <Box sx={{ p: 3 }}>
            <Alert severity="error">{error}</Alert>
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
              onClick={isSearching ? onClearSearch : onRequestCreate}
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
                          onClick={() => onDelete(link.code)}
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
  );
}
