# web-comments
A simple Express API for guest comments on [my site rusingh.com](https://rusingh.com/).

## Environment

The following environment variables are necessary:

- `NODE_ENV` - defaults to production
- `SENDGRID_API_KEY` - SendGrid API key used for sending notification emails
- `GITHUB_PAT` - GitHub personal access token

## API Endpoints

### v1

#### POST `/api/v1/comment/new`

Accepts URL encoded requests.

##### Form encoded data required

- `name`
- `email`
- `site`
- `comment`
- `age` (honeypot)
- `fallback-referer`: Some browsers do not add referer headers to form submission requests. We rely on this as a fallback. Requires JavaScript client-side.
  
  ```
  const target = document.querySelector(
    "form > input[name='fallback-referer']"
  );
  if (target) target.setAttribute("value", window.location.href);
  ```

#### GET `/api/v1/comment/moderate`

Accepts URL encoded requests.

##### Query parameters

- `comment_id`
- `action`: `approve` or `delete`
