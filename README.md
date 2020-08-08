# web-comments
A simple Express API written in TypeScript for guest comments on my static site @ [rusingh.com](https://rusingh.com/).

## Idealogy

Comments should be a part of my static site repository and handled at the static site level. This is most performant and keeps data in one place. There is no API endpoint to _fetch_ comments as the app does not store any data by itself, for example, in a database.

All operations (well, just the three) interact with my GitHub repository. Currently only GitHub is supported but I may be open to adding support for [Gitea](https://gitea.io/) or [Codeberg](https://codeberg.org/) should I switch to such options in the future.

## Environment

The following environment variables are necessary:

- `NODE_ENV` (optional) - defaults to `production`
- `SENDGRID_API_KEY` - SendGrid API key used for sending notification emails
- `GITHUB_PAT` - GitHub personal access token

## API Endpoints

### v1

#### POST `/api/v1/comment/new`

Accepts URL encoded requests. Redirects to `${origin}/thank-you/` or `${origin}/error`. If the origin is not available, it simply responds with a 200/500 HTTP response.

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

Accepts URL encoded requests. Responds with a plain-text message upon success.

##### Query parameters

- `comment_id`
- `action`: `approve` or `delete`
