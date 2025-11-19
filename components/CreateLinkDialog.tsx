"use client";

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";

type FieldErrors = {
  targetUrl?: string;
  code?: string;
};

type CreateLinkDialogProps = {
  open: boolean;
  loading: boolean;
  formError: string | null;
  fieldErrors: FieldErrors;
  targetUrl: string;
  customCode: string;
  onTargetChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export function CreateLinkDialog({
  open,
  loading,
  formError,
  fieldErrors,
  targetUrl,
  customCode,
  onTargetChange,
  onCodeChange,
  onClose,
  onSubmit,
}: CreateLinkDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={() => {
        if (loading) return;
        onClose();
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
            onSubmit();
          }}
          sx={{ mt: 1 }}
        >
          {formError && <Alert severity="error">{formError}</Alert>}
          <TextField
            label="Target URL"
            placeholder="https://example.com/docs"
            value={targetUrl}
            onChange={(e) => onTargetChange(e.target.value)}
            fullWidth
            required
            error={Boolean(fieldErrors.targetUrl)}
            helperText={
              fieldErrors.targetUrl ?? "Enter the full URL you want to redirect to"
            }
          />
          <TextField
            label="Custom Code (optional)"
            placeholder="6-8 letters or numbers"
            value={customCode}
            onChange={(e) => onCodeChange(e.target.value)}
            fullWidth
            error={Boolean(fieldErrors.code)}
            helperText={fieldErrors.code ?? "Leave blank to auto-generate"}
            inputProps={{ maxLength: 8 }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="create-link-form"
          variant="contained"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Link"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
