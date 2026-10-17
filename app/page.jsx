
import "./globals.css";

export const metadata = {
  title: "LaunchPad | Your Project Workspace",
  description: "Plan projects, track progress, and turn ideas into action."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
