import "./globals.css";
import ClientProviders from "./ClientProviders";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>{process.env.NEXT_PUBLIC_APP_NAME}</title>

        {/* Mobile viewport – no forced zoom */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />

        {/* Favicon */}
        <link rel="icon" href="/assets/162262.png" />
      </head>

      <body>
        {/* No global layout wrapper here so superadmin stays clean */}
        <div>{children}</div>
      </body>
    </html>
  );
}
