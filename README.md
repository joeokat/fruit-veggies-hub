# Fruit & Veggies Hub — Online Ordering Platform

A lightweight, link-based ordering platform that lets customers browse fresh produce and place orders in seconds, with every order landing straight in the business owner's WhatsApp — no back-and-forth messaging required.

## Overview

Fruit & Veggies Hub sells fresh fruits, vegetables, and spices to customers who currently place orders manually through WhatsApp chats. This platform replaces that scattered conversation with a single shareable link. A customer opens the link, sees the full catalogue with photos and prices, adds what they need to a cart, fills in their name, phone number, and delivery location, and submits. The complete, structured order is delivered instantly to the business's WhatsApp, ready to prepare and dispatch.

The project is built as a responsive web app demonstrating both sides of the experience: the customer-facing storefront and the business-facing admin view.

## Core Concept

One link. Full catalogue. Instant order. No chat threads, no missed items, no back-and-forth — just a clean order arriving on WhatsApp the moment a customer checks out.

## Customer Experience

- **Home page** — a clean, welcoming storefront introducing Fruit & Veggies Hub
- **Product catalogue** — every available item shown with a photo, name, and price
- **Categories** — items organized into Vegetables, Fruits, Spices, and other groups for easy browsing
- **Search** — quick lookup of specific products by name
- **Shopping cart** — add, adjust quantities, and remove items before checkout
- **Order form** — captures customer name, phone number, and delivery location
- **Order confirmation** — a clear summary once the order has been submitted, with the order also sent directly to the business's WhatsApp

## Business / Admin Experience

- **Instant WhatsApp delivery** — every order arrives automatically as a formatted WhatsApp message, itemized and ready to act on
- **Product management** — add new products, remove discontinued ones, and update prices
- **Availability control** — mark individual items as unavailable without deleting them from the catalogue
- **Order visibility** — a view of customer orders as they come in

## Tech Stack

Built with HTML, CSS, and JavaScript for a fast, dependency-light demonstration that runs anywhere — no backend or database required for the prototype stage. The WhatsApp handoff uses WhatsApp's click-to-chat link format, which pre-fills a message containing the full order details for the business to receive and confirm.

## Project Structure

```
fruit-veggies-hub/
├── index.html          # Customer storefront (home, catalogue, cart, order form)
├── admin.html          # Business/admin dashboard
├── css/
│   └── style.css       # Shared styling, responsive layout
├── js/
│   ├── catalogue.js     # Product rendering, categories, search
│   ├── cart.js          # Cart logic and order form handling
│   └── admin.js          # Product management and availability toggling
├── assets/
│   └── images/          # Product photos
└── README.md
```

## How an Order Flows

1. Customer opens the shared link and browses the catalogue by category or search
2. Items are added to the cart with live quantity and price updates
3. Customer fills in their name, phone number, and delivery location
4. On submission, an order confirmation is shown
5. The same order is instantly delivered to the business's WhatsApp as a ready-to-read message

## Status

This is a working demonstration covering both the customer ordering flow and the business-side product and order management view, intended to showcase the experience before moving into a production build.
