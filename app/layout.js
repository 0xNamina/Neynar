import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Neynar Score Checker',
  description: 'Check your Farcaster account quality with Neynar Score',
};

export default function RootLayout({ children }) {
  return (
    
      {children}
    
  );
}
```

---

## 🚀 Deploy ke Vercel

### Opsi 1: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variable di Vercel
vercel env add NEYNAR_API_KEY
# Paste API key Anda ketika diminta
