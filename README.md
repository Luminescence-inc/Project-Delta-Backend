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

### Redirect url

```bash
$ curl -X POST http://localhost:3000/api/url/generate -H "Content-Type: application/json" -d '{"url": "https://www.youtube.com/"}' 

{"status":200,"data":{"longUrl":"https://www.youtube.com/","shortUrl":"http://cloudflair.url/Z5YqHEAs"}}
```

### Analytics

```bash
$ curl -X POST http://localhost:3000/api/url/generate -H "Content-Type: application/json" -d '{"url": "https://www.youtube.com/"}' 

{"status":200,"data":{"longUrl":"https://www.youtube.com/","shortUrl":"http://cloudflair.url/Z5YqHEAs"}}
```

### Get All url

```bash
$ curl -X POST http://localhost:3000/api/url/generate -H "Content-Type: application/json" -d '{"url": "https://www.youtube.com/"}' 

{"status":200,"data":{"longUrl":"https://www.youtube.com/","shortUrl":"http://cloudflair.url/Z5YqHEAs"}}
```


## System Architecture

### Functional Requirement
- Generated Short Url should have one long url
- Short Url is Permanent, once created
- Short url is Unique; If a long url is added twice it should result in two different short urls
- Short Url is not easily discoverable; incrementing an already existing short url should have a low probability of finding a working short url
- Able to List the number of times a short url has been accessed in the last 24 hours, past week and all time

### Non-Functional Requirement
- Redirecting a short url to a long url within 10 ms
- HTTP-based RESTFUL API





