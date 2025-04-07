import "./globals.css";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Timeline Component</title>
        <meta name="description" content="Interactive timeline component with React 18" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="" rel="stylesheet"/>
      </head>
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}