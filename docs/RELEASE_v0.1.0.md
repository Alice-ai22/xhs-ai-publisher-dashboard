# v0.1.0 - Initial open source release

## Overview

This is the first open-source release of `xhs-ai-publisher-dashboard`, a local-first AI-assisted content workflow dashboard for Xiaohongshu creators.

The project focuses on a compliant workflow:

- AI generation
- human review
- manual publishing

It does not provide auto-login, auto-posting, captcha bypass, or unofficial publishing automation.

## Included in v0.1.0

- Dashboard overview for content pipeline status
- Profile setup for account positioning, audience, style, banned words, and common tags
- Topic library for structured idea management
- AI content generation with multiple content templates
- Compliance checks for sensitive or overly promotional language
- Draft review flow with status transitions
- Publishing calendar for scheduling
- Export / publishing assistant for manual posting workflow
- AI generation logs for troubleshooting
- Local SQLite + Prisma setup
- Seed data for quick local onboarding

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Prisma
- SQLite
- Zod
- Vitest

## Project Boundary

This repository is intentionally scoped as:

- local-first
- single-user or small-team friendly
- workflow-oriented
- suitable for continued extension by independent developers

This repository is not intended to be:

- a growth-hacking automation tool
- a bypass for platform restrictions
- a production-ready multi-tenant SaaS

## Getting Started

Please see the README for:

- environment setup
- database initialization
- local development commands
- compliance notes

## Feedback

Issues, suggestions, and PRs are welcome.
