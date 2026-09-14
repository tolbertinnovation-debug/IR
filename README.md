# ImpactReach Foundation (IRF)

Responsive multi-page website for ImpactReach Foundation, a Liberian humanitarian and development organization.

## Current scope

- Homepage
- About Us
- Founder & CEO profile
- Leadership team
- Our Programs
- Our Impact
- 100 Children initiative
- Partners
- News & Stories
- Contact
- Support Us
- Donation page
- Frequently Asked Questions
- Photo credits and licensing
- Mobile-first responsive navigation and layout
- Accessible semantic structure, keyboard navigation, focus states, and reduced-motion support
- Email-based inquiry forms that do not store visitor information
- Verified-information notices for impact, partnerships, stories, programs, and giving
- Basic SEO and social-sharing metadata

## Logo asset

The approved, unmodified IRF logo is stored at `assets/irf-logo.jpg` and is used in the header, footer, and browser icon.

## Photography

The founder portrait at `assets/michael-whea-mardeh.jpg` is supplied by the Foundation. All other website
photography is sourced from images explicitly documented as being photographed in Liberia or depicting
Liberian communities. Full source and licensing details are published on `credits.html`.

## Structure

All styling lives in a single `styles.css`. `script.js` handles navigation, scroll
reveals and the mailto-based forms only — it no longer injects stylesheets or
markup, so pages render in one pass.

## Preview

Open `index.html` in a browser or serve the folder with any static web server.
