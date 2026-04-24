import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-200">404</h1>
        <h2 className="text-xl font-semibold text-slate-900 mt-4">
          Página não encontrada
        </h2>
        <p className="text-slate-500 mt-2">
          O endereço que você acessou não existe.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block px-5 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
