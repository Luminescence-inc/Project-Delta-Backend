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
- Data must survive computer restarts
- HTTP-based RESTFUL API

### System Capacity Estimations

#### Traffic Estimate

Assuming 50:1 read/write ratio

Short Url per month = 1 million

Number of short url links per seconds = 1 million /(30 days * 24 hours * 3600 seconds ) ~ 0.4 URLs/second

With 200:1 read/write ratio, number of redirections = 0.4 URLs/s * 50 = 20 URLs/s


#### Storage Estimate

Assuming the service will last for 10 years and create 1 million shortened links each month, we'll have a total of 120 million data points (i.e  million/month * 10 (years) * 12 (months)) in the system.

With each data object being 500 bytes in size, the total storage needed would be around 55.91 gigabytes.
