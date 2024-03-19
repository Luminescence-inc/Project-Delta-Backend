# CloudFlare URL Shortner Service

## Introduction

This is a HTTP-based RESTful API written in Express, for managing Short URLs and redirecting clients similar to other service like bit.ly or goo.gl.

## Getting Started

Pre-requisites:

- docker compose (v2+)

Running development server:

```bash
$ cd server
$ docker compose up -d --build

Server started on :3000
```

## API

### Generate url
```bash
$ curl -X POST http://localhost:3000/api/url/generate -d '{"url":"https://www.youtube.com"}'

```
