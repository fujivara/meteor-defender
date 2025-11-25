# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `ng serve` (serves on http://localhost:4200)
- **Build for production**: `ng build`
- **Build with watch mode**: `ng build --watch --configuration development`
- **Run unit tests**: `ng test`
- **Generate components**: `ng generate component component-name`
- **Package manager**: npm (v10.9.3)

## Architecture Overview

This is an Angular 21 application built with:
- **Framework**: Angular 21 with standalone components (no NgModules)
- **Routing**: Angular Router with file-based routing configuration
- **Styling**: TailwindCSS v4.1.12 with PostCSS
- **Testing**: Vitest for unit testing (instead of Karma/Jasmine)
- **Build System**: Angular's new Application Builder
- **Entry Point**: `src/main.ts` bootstraps the standalone `App` component

### Key Files Structure
- `src/app/app.ts` - Root component using Angular signals
- `src/app/app.config.ts` - Application configuration with providers
- `src/app/app.routes.ts` - Route definitions
- `angular.json` - Angular CLI workspace configuration
- `tsconfig.app.json` - TypeScript configuration for the app

### Code Style
- **Prettier**: Configured with 100 character line width, single quotes
- **HTML Templates**: Uses Angular parser for formatting
- **Components**: Uses standalone components with signal-based state management
- **File Naming**: Uses Angular naming conventions (app.ts, app.html, app.css)

### Testing Setup
- Uses Vitest instead of traditional Karma/Jasmine setup
- Test files follow `.spec.ts` naming convention
- JSDOM for DOM simulation

### Build Configuration
- Production builds use output hashing and optimization
- Bundle size limits: 500kB warning, 1MB error for initial bundles
- Component styles limited to 4kB warning, 8kB error