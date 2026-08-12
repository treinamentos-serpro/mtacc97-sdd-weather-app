interface EmptyStateProps {
  onClear?: () => void;
}

function EmptyState({ onClear }: EmptyStateProps) {
  return (
    <div role="status" className="flex flex-col items-center gap-3 py-12 text-center text-white/70">
      <p>Nenhum resultado encontrado. Tente buscar por outra cidade, estado ou bairro.</p>
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-accent-500"
        >
          Tentar nova busca
        </button>
      )}
    </div>
  );
}

export default EmptyState;
