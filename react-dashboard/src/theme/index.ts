import { createTheme } from '@mui/material/styles';

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0B1220', // Azure portal dark navy
      paper: '#172033',   // Soft card surface
    },
    primary: {
      main: '#0078D4', // Azure Primary Blue
      light: '#2899F5',
      dark: '#005A9E',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#50E6FF', // Cyan accent
    },
    success: {
      main: '#107C41', // Azure Green
      light: '#13A10E',
    },
    warning: {
      main: '#FFB900', // Azure Amber
    },
    error: {
      main: '#D13438', // Azure Critical Red
    },
    info: {
      main: '#00B7C3',
    },
    text: {
      primary: '#F3F4F6',
      secondary: '#9CA3AF',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 600, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    body1: { fontSize: '0.925rem' },
    body2: { fontSize: '0.825rem', color: '#9CA3AF' },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#172033',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.35)',
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});
