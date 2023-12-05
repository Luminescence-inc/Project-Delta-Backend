

# Project-Delta

Opinionated project architecture for Full-Stack JavaScript Applications.

## About

Using JavaScript for full-stack has always been a challenge especially with architecting various pieces of the application, choosing technologies and managing devOps. This project provides a base for typical project consisting a Landing Website, Web and Mobile Applications, API service and easy deployment of these services. This project uses a microservice architecture where all individual project runs as a service (container).

A typical product (SaaS, etc.) usually consists of following services:

- Landing page
  - Used for introducing your business to customers
  - Provide links to download the mobile application
  - Provide link to access web application
  - Contact page
  - Privacy policy page
  - Terms of use page
  - SEO friendly (should support server side rendering)
- Web Application
  - Your actual application for your customers to use
  - Desktop browser
  - Tablet and mobile browser via responsive design
- Mobile Application
  - Your actual application for your customers to use
  - Android (Mobile/Tablet)
  - iOS (Mobile/Tablet)

## Core Structure

    project delta
      ├── backend
      │   ├── api
      │   │   > NodeJS
      │   │   > PORT ####
      │   │   > api.example.com
      │   │
      │   ├── database
      │   │   > Postgres
      │   │   > PORT ####
      │   │
      │   └── proxy
      │       > NGINX
      │       > PORT 80 / 443
      │
      ├── deployment
      │   > Docker Compose
      │
      ├── frontend
      │   └── app
      │       > React
      │       > Server side rendered
      │       > PORT 3000
      │       > example.com
      │
      └── README.md (you are here)

## Stack

### Backend

- API
  - NodeJS
  - Express
- Database
  - Postgres
- Proxy
  - NGINX

### Frontend
- Web
  - React
  - Redux
  - React Router
  - Material UI
- Mobile (iOS, Android)
  - React Native
  - Redux
  - React Navigation

### Deployment

- Technologies
  - Docker
  - Docker compose
