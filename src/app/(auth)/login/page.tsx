import { AuthCard } from '@/components/auth/auth-card';
import { LoginForm } from '@/components/auth/login-form';

export const metadata = {
  title: 'Iniciar sesión | Inmobiliaria',
};

export default function LoginPage() {
  return (
    <AuthCard
      title="Bienvenido"
      subtitle="Ingresá a la plataforma de gestión inmobiliaria"
    >
      <LoginForm />
    </AuthCard>
  );
}
