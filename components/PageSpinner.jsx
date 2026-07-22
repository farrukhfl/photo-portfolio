export default function PageSpinner() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
      }}
    >
      <div
        role="status"
        aria-label="Loading"
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: '2.5px solid var(--faint, rgba(255,255,255,0.12))',
          borderTopColor: 'var(--fg, #fff)',
          animation: 'page-spin 0.7s linear infinite',
        }}
      />
      <style>{`@keyframes page-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
