# Core SPA Front-End Architecture Overview

## Purpose

This document guides the design and development of AutoRecordLive's core web application in `fe/app/`. It covers the pages users use to sign in, manage followed hosts and channels, review recordings, manage notifications, and view their account and plan information.

Marketing and advertising landing pages live in `fe/ads/`. They are separate from the core app and outside this document's scope. The core app relies on the back end for authentication, live-status monitoring, recording operations, and billing.

## Selected stack

| Area | Selection | Responsibility |
| --- | --- | --- |
| UI | React + TypeScript | Components, page composition, and typed front-end code |
| Build | Vite | Local development server and production SPA assets |
| Routing | React Router | URL-based navigation, nested layouts, and protected app routes |
| Forms | React Hook Form + Zod | Form state and schema-based client-side validation |
| Styling | Tailwind CSS | Utility-first styling and design tokens |
| UI primitives | shadcn/ui | Accessible, editable components owned in the front-end codebase |
| Back-end API | REST/JSON over HTTPS | CRUD operations and data queries through a shared API client |
| API authentication | JWT access and refresh tokens | Authenticated API requests and session renewal |
| Real-time updates | WebSockets over TLS (`wss://`) | Live status, recording progress, and in-app notification events |

## Application routes

Use a public authentication layout and a separate authenticated application shell with shared navigation, account menu, and notification affordances.

| Route area | Access | Main responsibilities |
| --- | --- | --- |
| `/login`, `/register`, `/forgot-password`, `/reset-password` | Public | Sign in, create an account, and recover access |
| `/` | Authenticated | Overview of followed hosts, current live/recording activity, recent recordings, and plan usage |
| `/hosts` | Authenticated | Add, view, edit, and remove followed hosts or channels |
| `/recordings` | Authenticated | Search and review recordings, inspect recording status, and request downloads |
| `/notifications` | Authenticated | Review in-app notifications and manage notification preferences |
| `/account` | Authenticated | Profile, account security, plan, subscription, and billing details |

