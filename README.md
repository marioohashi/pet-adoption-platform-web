# Responsible Pet Adoption Platform — Web

The web application for the Responsible Pet Adoption Platform. It provides a Portuguese-language interface for browsing pet listings, managing personal listings and account details, and discovering partner NGOs and veterinary providers.

## Prototype

[Open the web prototype](https://pet-adoption-platform-web.vercel.app/)

## Implemented features

- Browse adoption listings and filter/search by supported listing attributes.
- Browse lost and found animal listings, with separate lost/found tabs.
- View pet details and image galleries.
- Register and sign in with email and password; Google sign-in is also available.
- Create, update, and delete a signed-in user's pet listings.
- View and update account profile information, change password, and delete the account.
- Browse NGO and veterinary partner directories.
- Admin interface for managing users, NGOs, and veterinary partners.
- Responsive layout and reusable UI components.

Adoption applications, adopter-to-NGO messaging, real-time chat, event/campaign publishing, and an adoption approval workflow are not implemented in this frontend.

## Technology

- React 19 with TypeScript 6
- Vite 8 and the React Vite plugin
- React Router 7 for client-side routing
- TanStack React Query 5 for server state and request caching
- Axios for REST API requests
- Tailwind CSS 4 through `@tailwindcss/vite`
- Zod 4 for client-side form validation
- React Context for authentication state; Zustand is not used
- `@react-oauth/google` for Google OAuth
- Cloudinary direct uploads for images
- Lucide React and React Icons

The project uses TypeScript's bundler module resolution, strict unused-symbol checks, and the `@/*` import alias for `src/*`.

## Requirements and setup

Install a Node.js version compatible with the versions in `package.json`, then install dependencies:

```bash
npm install
```

Create a local environment file (for example, `.env.local`) in the project root:

```dotenv
VITE_API_URL="http://localhost:3333"
VITE_GOOGLE_CLIENT_ID="your-google-oauth-client-id"
```

- `VITE_API_URL` is the base URL for the REST API. If omitted, the app uses `http://localhost:3333`.
- `VITE_GOOGLE_CLIENT_ID` configures Google sign-in. Configure the matching authorized origins in the Google OAuth client.

Vite exposes `VITE_*` values to client-side code; do not put private credentials or server secrets in these variables. The current Cloudinary upload helper has its cloud account and upload preset configured in source code rather than through environment variables.

Start the development server:

```bash
npm run dev
```

Vite prints the local development URL in the terminal when the server starts.

## Available scripts

| Command           | Description                                                                    |
| ----------------- | ------------------------------------------------------------------------------ |
| `npm run dev`     | Start the Vite development server.                                             |
| `npm run build`   | Run TypeScript project builds and generate the production frontend in `dist/`. |
| `npm run preview` | Serve the production build locally for preview. Run `npm run build` first.     |
| `npm run lint`    | Run ESLint over the project.                                                   |

There is currently no test script or test suite declared in `package.json`.

## Routes

The application uses React Router and has no `/api` prefix for its browser routes.

| Path           | Access    | Page                                      |
| -------------- | --------- | ----------------------------------------- |
| `/`            | Public    | Adoption listings.                        |
| `/pets`        | Public    | Adoption listings (same page as `/`).     |
| `/perdidos`    | Public    | Lost and found listings.                  |
| `/ongs`        | Public    | NGO directory.                            |
| `/clinicas`    | Public    | Veterinary clinic and provider directory. |
| `/meus-pets`   | Signed in | Manage the current user's pet listings.   |
| `/minha-conta` | Signed in | Account settings.                         |
| `/admin`       | Signed in | Administration interface.                 |
| Any other path | Public    | Not-found page.                           |

The route guard checks whether a session exists. Admin data queries are enabled only for users whose session role is `admin`; the backend remains responsible for enforcing authorization on administrative API operations.

## API integration

The Axios client in `src/services/api.ts` uses `VITE_API_URL` (or `http://localhost:3333`) as its base URL and attaches the saved bearer token to requests when available. Authentication state is managed by `AuthProvider` and persisted in browser `localStorage`.

The frontend communicates with the backend's REST endpoints, including:

- `/sessions` and `/sessions/google` for sign-in.
- `/users` for registration, profile, password, and user administration.
- `/pets` for listing, search, pagination, and pet management.
- `/ngos` and `/vets` for partner directories and administration.

Pet browsing uses React Query with a page size of nine. The interface passes pagination and filters including listing type, species, size, sex/gender, city, search text, and age to the API. The backend currently implements type, species, size, gender, city, and search filters; age is sent by the frontend but is not currently applied by the backend.

## Image uploads

Pet photos, partner images, and profile avatars are uploaded directly from the browser to Cloudinary; the frontend then sends the resulting image URL to the REST API. Uploads use the Cloudinary unsigned upload flow configured in `src/services/cloudinary.ts`. No upload proxy or server-side signing flow is implemented in this frontend.

## Project structure

```text
src/
  assets/       # Frontend assets
  components/   # Shared components and UI primitives
  contexts/     # Authentication context and provider
  hooks/        # Reusable React hooks
  layouts/      # Shared app layout and route guard
  lib/          # UI utilities
  modals/       # Authentication, pet, partner, and confirmation dialogs
  routes/       # React Router configuration
  sections/     # Route-level pages and sections
  services/     # API, pet, user, location, and Cloudinary integrations
  types/        # Shared TypeScript domain types
  utils/        # Formatting and other helpers
  App.tsx       # Query and authentication providers
  main.tsx      # React entry point
  index.css     # Global styles and Tailwind CSS
```

## Deployment notes and current limitations

- `vercel.json` rewrites incoming paths to `/index.html`, allowing Vercel to serve client-side routes on direct navigation and refresh.
- Directory pages use built-in sample NGO/veterinary records when the API request fails or returns no records. The lost/found page also falls back to local sample pets when the request fails or returns an empty result. These fallback records are demonstration data, not API data.
- Google sign-in requires a configured OAuth client ID and the corresponding provider setup.
- Cloudinary upload configuration is currently embedded in the client-side helper; review the upload preset and allowed formats/limits before deployment.
- The UI is currently written primarily in Portuguese, although this README is in English.

## License and contact

No license is currently declared in `package.json`.

**Mario Ohashi** · [LinkedIn](https://www.linkedin.com/in/marioohashi) · Curitiba, Brazil
