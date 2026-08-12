function LoadingState() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center gap-3 py-12 text-white/80">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-accent-400" />
      <p>Carregando previsão do tempo…</p>
    </div>
  );
}

export default LoadingState;
