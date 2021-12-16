<div align="center">

# oak-rate-limit
Rate limiter for Oak Server on Deno

</div>

## Description
A Simple Rate Limiter for Oak Server on Deno inspired by express-rate-limit. It's currently under development and if you'd like to contribute, feel free to make a PR!

## Features
- Custom Cache Stores Support. Currently using Map by default (more coming soon).
- Timestamp Comparisons instead of Intervals for Efficiency.
- Custom handlers, window duration, max requests, status code, and error message support.

## Usage
```ts
import { RateLimiter } from "https://deno.land/x/oak_rate_limit/mod.ts";

const rateLimit = RateLimiter({
  store: STORE, // Using MapStore by default.
  windowMs: 1000, // Window for the requests that can be made in miliseconds.
  max: 10, // Max requests within the predefined window.
  headers: true, // Default true, it will add the headers X-RateLimit-Limit, X-RateLimit-Remaining.
  message: "Too many requests, please try again later.", // Default message if rate limit reached.
  statusCode: 429, // Default status code if rate limit reached.
});

app.use(rateLimit);
```

## Configuration
`onRateLimit(opt, ctx, next)`

Define a custom method to handle when the rate limit has been reached. The default implementation will send a 429 status code and the message defined in the message option.

## Liked The Project?
[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/W7W31Z2B3)

## License
[Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0)