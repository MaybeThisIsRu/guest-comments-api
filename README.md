# web-comments
A simple Express API for guest comments on [my site rusingh.com](https://rusingh.com/).

## Environment

The following environment variables are necessary:

- `NODE_ENV` - defaults to production
- `SENDGRID_API_KEY` - SendGrid API key used for sending notification emails
- `GITHUB_PAT` - GitHub personal access token

## API Endpoints

### v1

#### GET `/api/v1/comment/new`

Accepts URL encoded requests.

#### GET `/api/v1/comment/moderate`

Accepts URL encoded requests.

##### Query parameters

- `comment_id`
- `action`: `approve` or `delete`
