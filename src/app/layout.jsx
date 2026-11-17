import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "AURALIS – Classroom Without Barriers",
  description:
    "An intelligent accessibility platform transforming spoken lecture words and Indian Sign Language (ISL) gestures into real-time synchronized captions for deaf and hard-of-hearing students.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-auralis-bg text-auralis-text font-sans antialiased selection:bg-auralis-secondary selection:text-auralis-dark">
        {children}
      </body>
    </html>
  );
}
