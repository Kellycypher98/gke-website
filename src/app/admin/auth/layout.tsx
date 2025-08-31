// This layout is specifically for auth pages and doesn't include the admin layout
// This prevents the auth check from running on login/signup pages

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
