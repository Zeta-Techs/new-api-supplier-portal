# Change: Write a complete project README

## Why
The repository currently has no `README.md`, which makes it harder for suppliers to understand what the portal does and how to run it locally. A clear, bilingual README reduces onboarding time and avoids accidental misuse (especially around write-only keys and token storage).

## What Changes
- Add a new `README.md` at the repository root
- README is bilingual (Chinese + English)
- README focuses on supplier/user usage first, with a short developer section for running/building locally
- Document environment variables and Vite dev proxy behavior
- Document key security constraints (token stored in localStorage; upstream API key is write-only and never displayed)

## Impact
- Affected specs: (new) `project-docs` capability
- Affected code: none (documentation-only)
- User-visible: improved onboarding and self-service usage instructions
