# AI Fly-Tipping POC - Hybrid B/C Rebuild

## Plan

Rewrite the PoC to match the real LBBD form (eforms.lbbd.gov.uk/report-fly-tipping) with AI enhancement.
The existing form has: location map → photo → land ownership → waste type → waste size → who tipped → contact details → submit.
Our version: photo upload → AI validate → location (EXIF/GPS/manual map) → duplicate check → AI-prefilled form → submit → confirmation.

## Tasks

- [x] 1. Update types to match real LBBD form fields (land ownership, who-tipped, LBBD waste categories)
- [x] 2. Rewrite globals.css with LBBD council branding (dark teal/green, professional gov style)
- [x] 3. Create proper LBBD layout with council header/footer
- [x] 4. Build new home page matching council style
- [x] 5. Build full report page with step-by-step wizard
- [x] 6. Create Leaflet map component with LBBD boundary
- [x] 7. Rewrite SmartForm matching real form fields + AI enhancement
- [x] 8. Build proper confirmation page
- [x] 9. Build functional admin dashboard
- [x] 10. Update API routes (add GET reports endpoint for admin)
- [x] 11. Build, test, verify

## Design Direction

- Professional council gov.uk style — not startup/tech aesthetic
- LBBD brand: dark teal (#00473E), white, clean typography
- Mobile-first, accessible, high contrast
- Matches the real form's field structure with AI pre-fill overlay
