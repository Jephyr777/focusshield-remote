import './globals.css'

export const metadata = {
  title: 'FocusShield Remote',
  description: 'Help your friend stay focused.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
