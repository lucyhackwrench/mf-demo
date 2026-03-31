export function SharedFlowDiagram() {
  return (
    <div className="visual-card">
      <h3>Shared runtime semantics</h3>
      <svg viewBox="0 0 980 320" role="img" aria-label="Shared flow diagram">
        <rect x="36" y="44" width="240" height="222" rx="24" fill="#fff7ef" stroke="#d85834" strokeWidth="2" />
        <text x="66" y="84" fontSize="24" fontWeight="700" fill="#1d2430">Host publishes</text>
        <text x="66" y="124" fontSize="18" fill="#5f6b7b">react / react-dom</text>
        <text x="66" y="152" fontSize="18" fill="#5f6b7b">@demo/ui</text>
        <text x="66" y="180" fontSize="18" fill="#5f6b7b">effector / effector-react</text>
        <text x="66" y="216" fontSize="16" fill="#8f2f1d">singleton + eager only for React</text>

        <rect x="376" y="44" width="232" height="222" rx="24" fill="#f5fcfb" stroke="#0f8c8c" strokeWidth="2" />
        <text x="402" y="84" fontSize="24" fontWeight="700" fill="#1d2430">Share scope</text>
        <text x="402" y="124" fontSize="18" fill="#5f6b7b">One ThemeContext instance</text>
        <text x="402" y="152" fontSize="18" fill="#5f6b7b">One effector store</text>
        <text x="402" y="180" fontSize="18" fill="#5f6b7b">MF init before bootstrap</text>
        <text x="402" y="216" fontSize="16" fill="#0f8c8c">async boundary keeps startup sane</text>

        <rect x="706" y="44" width="236" height="222" rx="24" fill="#fffdf5" stroke="#b8852d" strokeWidth="2" />
        <text x="732" y="84" fontSize="24" fontWeight="700" fill="#1d2430">Remote consumes</text>
        <text x="732" y="124" fontSize="18" fill="#5f6b7b">@demo/ui with import:false</text>
        <text x="732" y="152" fontSize="18" fill="#5f6b7b">@demo/common with import:false</text>
        <text x="732" y="180" fontSize="18" fill="#5f6b7b">react/react-dom singleton</text>
        <text x="732" y="216" fontSize="16" fill="#b8852d">no local fallback copies</text>

        <path d="M276 154 C318 154, 332 154, 376 154" fill="none" stroke="#d85834" strokeWidth="4" />
        <path d="M608 154 C648 154, 662 154, 706 154" fill="none" stroke="#0f8c8c" strokeWidth="4" />
      </svg>
    </div>
  );
}
