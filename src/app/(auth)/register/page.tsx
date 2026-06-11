import { AuthCard } from '@/components/auth/auth-card';
import { RegisterForm } from '@/components/auth/register-form';

export const metadata = {
  title: 'Registro | Inmobiliaria',
};

export default function RegisterPage() {
  return (
    <AuthCard
      title="Crear cuenta"
      subtitle="El primer usuario registrado será administrador"
    >
      <RegisterForm />
    </AuthCard>
  );
}
