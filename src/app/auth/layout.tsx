import AuthProtection from "@/components/auth/AuthProtection";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProtection>{children}</AuthProtection>;
} 