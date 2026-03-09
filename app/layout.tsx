import type { Metadata } from "next";
import "./globals.css";
import "./neon-buttons.css";

export const metadata: Metadata = {
  title: "Nixa Page",
  description: "Objeto 3D animado según la canción",
  icons: {
    icon: "/Gemini_Generated_Image_7zeusr7zeusr7zeu.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Lato&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Megrim&family=Pompiere&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
