# Indianfinancialforum

Imported website: https://stitch.withgoogle.com/projects/8810253848235921543

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9046fac1-bcea-4800-a52c-04f05fc69a55).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Use Node.js 24 and npm. Run these commands from the directory containing `package.json`.

```sh
npm ci
npm run dev
```

The dev server prints its URL. Form submissions and publications are saved in the ignored `.iff-data/` directory by default. Set `IFF_LOCAL_DB` to point dev at a different directory, or set `IFF_DATABASE_URL` to use a PostgreSQL instance instead.

Set `IFF_ADMIN_PASSWORD` in the server environment before starting if you want to sign in to the CRM at `/admin`. Choose a generated password of at least 16 characters.

- **Submissions inbox** receives membership and contact enquiries, career and speaker applications, and newsletter sign-ups. Search or filter submissions, set their follow-up status, record an owner and private notes, download résumés, or export the filtered inbox to CSV.
- **Publications** creates and edits blogs, reports, podcasts and webinars. Drafts stay private until published. Write blog text directly in the editor or use a public article URL. Reports, podcasts and webinars use public asset or episode URLs.

The approved event photos in `public/photos/` were sourced from the [IFF photo shortlist](https://drive.google.com/drive/folders/1VwYvFv-1NnxSosQGMo0VXfr0bHy-m8DK). The volunteer section is pending the form response export and approved headshots.

## AWS deployment

The Dockerfile builds a Node server for Amazon ECS Fargate. Run `docker build -t iff .` and push the image to Amazon ECR. Configure the ECS task with container port `8080`, CloudWatch logs, and environment variables and secrets as listed below. Use an Application Load Balancer IP target group on port `8080` with `/api/iff/health` as the health check. Route HTTPS through an ACM certificate and redirect HTTP to HTTPS.

| Setting | Value |
| --- | --- |
| `IFF_PUBLIC_ORIGIN` | Public HTTPS origin, such as `https://www.example.org`, without a path. Redirect alternate hostnames to this origin. |
| `IFF_DATABASE_URL` | Secrets Manager value containing the PostgreSQL connection URL. URL-encode the password and omit SSL query options. |
| `IFF_ADMIN_PASSWORD` | Secrets Manager value containing a generated shared editor password of at least 16 characters. |
| `IFF_DATABASE_CA_FILE` | Already set in the image to the AWS RDS CA bundle. |

Create a private RDS PostgreSQL database with encryption and automated backups. The app connects over TLS with certificate verification. Give its database role ownership of the application database so it can create the IFF tables at first startup. Allow port `5432` from the ECS task security group only and allow inbound `8080` on the tasks from the load balancer only. Give the task execution role access to the referenced Secrets Manager secrets. Keep the ECS tasks private and provide outbound access for ECR, Secrets Manager and CloudWatch through NAT or VPC endpoints.

If using CloudFront, disable caching for `/admin`, `/api/iff/*`, TanStack server-function requests and pages that show newly published content. The public Knowledge Hub reads from the database. The admin session and all submission data are kept on the server; connecting a newsletter sender is a separate integration.

After deploying, verify `/api/iff/health` and the homepage return HTTP 200. Submit a test membership enquiry and verify it appears in `/admin`, then publish a draft and open it in the Knowledge Hub.
