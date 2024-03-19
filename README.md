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
$ curl -X POST http://localhost:3000/api/url/generate -H "Content-Type: application/json" -d '{"url": "https://www.youtube.com/"}' 

{"status":200,"data":{"longUrl":"https://www.youtube.com/","shortUrl":"http://cloudflair.url/Z5YqHEAs"}}
```
<img width="691" alt="Screenshot 2024-03-18 at 11 22 12 PM" src="https://github.com/Luminescence-inc/Project-Delta-Backend/assets/55120346/536d1ed5-9839-49ed-833e-bda10bc7422e">
