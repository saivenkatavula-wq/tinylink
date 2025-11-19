"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { Activity, Link2 } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Health", href: "/health", icon: <Activity size={18} /> },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
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
              TinyLink
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Button
                  key={item.href}
                  size="small"
                  component={Link}
                  href={item.href}
                  sx={{
                    borderRadius: 2,
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: item.icon ? 1 : 0,
                    bgcolor: isActive ? "primary.50" : "transparent",
                    color: isActive ? "primary.main" : "text.secondary",
                    "&:hover": {
                      bgcolor: "primary.50",
                    },
                  }}
                >
                  {item.icon}
                  {item.label}
                </Button>
              );
            })}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
