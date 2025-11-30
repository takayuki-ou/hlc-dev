# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Salesforce Developer Edition (DE) project for Happy Lucky Company (HLC). The project uses the Salesforce CLI (sf) and is configured to work with the target org "HLC".

**Org URL**: https://orgfarm-b8b33c74a4-dev-ed.develop.lightning.force.com/lightning/page/home

## Development Commands

### Testing
```bash
# Run all LWC unit tests
npm run test

# Run tests in watch mode
npm run test:unit:watch

# Run tests with coverage
npm run test:unit:coverage

# Run tests in debug mode
npm run test:unit:debug
```

### Code Quality
```bash
# Lint JavaScript files (Aura and LWC)
npm run lint

# Format all files
npm run prettier

# Check formatting without modifying files
npm run prettier:verify
```

### Deployment

**Interactive Deploy Tool**: This repository has a custom interactive deployment script that provides a more user-friendly deploy experience with conflict detection.

```bash
# Interactive deploy (recommended)
npm run deploy:interactive

# Standard Salesforce CLI deploy
sf project deploy start

# Deploy with validation only
sf project deploy start --dry-run

# Deploy specific metadata
sf project deploy start --metadata <type>:<name>
```

The interactive deploy tool (`scripts/tools/interactive-deploy/`) allows you to:
- Select target org interactively
- Preview changed components
- Handle conflicts with `--ignore-conflicts` flag
- Select specific metadata to deploy
- Save deploy commands to file for reuse

### Salesforce CLI Operations

```bash
# Check deploy status
sf project deploy preview

# Retrieve metadata from org
sf project retrieve start

# Open org in browser
sf org open

# Run Apex tests
sf apex run test

# Execute anonymous Apex
sf apex run --file <file>
```

## Project Architecture

### Directory Structure

- `force-app/main/default/` - Main package directory
  - `lwc/` - Lightning Web Components
  - `classes/` - Apex classes
  - `objects/` - Custom objects and standard object customizations
  - `aura/` - Aura components (legacy)
  - `flexipages/` - Lightning page layouts
  - `messageChannels/` - Lightning Message Service channels
  - `staticresources/` - Static resources (images, etc.)
  - `profiles/` - User profiles
  - `permissionsets/` - Permission sets

### Custom Objects

The project includes several custom objects:
- `Boat__c` - Boat inventory management
- `BoatType__c` - Boat type classification
- `BoatReview__c` - Boat reviews
- `OrderInfo__c` - Order information tracking
- `SalesAction__c` - Sales action tracking
- `SalesActivity__c` - Sales activity tracking

### Key LWC Components

- `accountTable` - Wire adapter pattern example showing top accounts with error handling via `ldsUtils`
- `googleMap` / `googleMapAddressPicker` - Map integration components
- `ldsUtils` - Shared utility for reducing LDS errors (used by other components)
- `contactList` - Contact management UI
- `augmentor`, `button`, `controls`, `counts`, `numerator`, `remoteControl`, `wireApexFunction` - Utility components (likely Trailhead exercises)

### Apex Controllers

The project contains various Apex classes for:
- External service integration (`ParkLocator`, `AnimalLocator`, `ParksServices`)
- Account and Contact management (`AccountController`, `AccountManager`, `ContactController`)
- Boat functionality (`SimilarBoatsController`)
- Callout services with async patterns (`AsyncParksServices`, `AsyncCalculatorServices`)

**Testing Pattern**: Most service classes have corresponding mock and test classes (e.g., `ParkLocatorMock`, `ParkLocatorTest`)

### Lightning Message Service

The project uses LMS for component communication:
- `BoatMessageChannel` - Used for boat-related component communication with `recordId` field

## Code Standards

### Formatting
- Uses Prettier with plugins for Apex and XML
- No trailing commas
- LWC HTML uses special parser
- Pre-commit hooks enforce formatting via husky and lint-staged

### Linting
- ESLint configured for LWC and Aura
- Follows Salesforce's ESLint configurations
- Lightning and Aura specific rules enabled

## Important Notes

1. **Target Org**: The default target org is "HLC" (configured in `.sf/config.json`)
2. **API Version**: Source API version is 62.0
3. **Namespace**: No namespace is configured for this project
4. **Japanese Comments**: The interactive deploy tool contains Japanese comments and UI text
5. **Git Hooks**: Husky is configured to run pre-commit checks (formatting and linting)
6. **LWC Error Handling**: Use the `ldsUtils.reduceErrors()` utility for consistent error handling in LWC components

## Testing Patterns

When writing LWC tests:
- Use `@salesforce/sfdx-lwc-jest` framework
- Test files should be in `__tests__` directories
- Mock Apex methods using Jest mocks
- Test both success and error scenarios

When writing Apex tests:
- Create mock classes for HTTP callouts
- Use test data factories where applicable
- Aim for high code coverage
- Test both positive and negative scenarios
