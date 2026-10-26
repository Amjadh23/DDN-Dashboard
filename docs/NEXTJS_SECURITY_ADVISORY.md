# Existing Next.js dependency advisory — separate from DDN 2.0

Assessment: 26 October 2026. Installed and declared Next.js: **16.4.0**. The DDN 2.0 restructuring did not change package.json, package-lock.json or installed dependencies during this run. package.json already had uncommitted changes at intake.

The production build compiled and typechecked, then Next's security-upgrade check reported `SecurityFatalError`. A normal immediate retry, supported by the installed Next CLI's retry mechanism, completed the build. This retry permits local verification; it does not remediate the advisory or establish production security approval.

A separate read-only dependency assessment was executed:

```powershell
node 'C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js' audit --omit=dev --json
```

The npm audit response lists Next.js advisories for SVG image optimization remote code execution (GHSA-2464-fhr4-w9xw), App Router Server Actions denial of service (GHSA-p3m5-59mp-jv5r), and typed-array `use cache` remote code execution (GHSA-673q-mjm6-r5xr). It reports an affected range through 16.4.0 and suggests Next.js **16.4.3** as a non-major fix. These are the registry's findings; this task did not independently demonstrate exploitability in this dashboard. The original response is retained in the local temporary validation log `tmp/ddn2-dependency-audit.json`.

Recommendation: handle the Next.js security update as a separate dependency change, checking compatible Next/eslint-config-next versions, lockfile changes, local bundled documentation, and the complete build/security/workflow regression suite. No automatic upgrade, deployment or production-readiness claim is part of the four-Teras restructuring.

The same production-dependency audit also reported an existing high-severity Zod finding and suggested 4.6.7. This adjacent dependency finding is likewise outside the taxonomy change and remains open; the audit is not reported as clean.
