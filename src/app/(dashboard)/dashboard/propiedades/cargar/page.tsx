import { PropertyCreateForm } from '@/components/properties/property-create-form';

export const metadata = {
  title: 'Cargar propiedad | Inmobiliaria',
};

export default function CargarPropiedadPage() {
  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Cargar propiedad
          </h1>
        </div>
        <PropertyCreateForm />
      </div>
  );
}
