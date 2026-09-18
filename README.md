# Entra Registration Campaign Simulator

A local-first React + TypeScript app for exploring Microsoft Entra registration campaign outcomes.

## What it does

- Simulates passkey and Microsoft Authenticator registration campaign outcomes.
- Focuses on policy consequences, not user or group scope.
- Shows a strict yes/no nudged result plus a readable reasoning trace.
- Supports JSON export and import for scenario sharing.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Notes

- The rule engine lives in `src/campaignEngine.ts`.
- The UI lives in `src/App.tsx`.
- The current setup is intentionally local-only with no backend.
