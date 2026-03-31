export function TopologyDiagram() {
  return (
    <div className="visual-card">
      <h3>Topology diagram</h3>
      <svg viewBox="0 0 980 360" role="img" aria-label="MF Demo topology diagram">
        <defs>
          <linearGradient id="nodeAccent" x1="0%" x2="100%">
            <stop offset="0%" stopColor="#d85834" />
            <stop offset="100%" stopColor="#0f8c8c" />
          </linearGradient>
        </defs>
        <rect x="32" y="34" width="240" height="132" rx="26" fill="#fff7ef" stroke="#d85834" strokeWidth="2" />
        <text x="60" y="82" fontSize="17" fill="#5f6b7b">Host shell</text>
        <text x="60" y="116" fontSize="34" fontWeight="700" fill="#1d2430">@demo/app</text>
        <text x="60" y="146" fontSize="16" fill="#5f6b7b">port 5000</text>
        <text x="60" y="170" fontSize="15" fill="#5f6b7b">bundles @demo/ui locally</text>

        <rect x="370" y="34" width="250" height="132" rx="26" fill="#f5fcfb" stroke="#0f8c8c" strokeWidth="2" />
        <text x="398" y="82" fontSize="17" fill="#5f6b7b">Remote state</text>
        <text x="398" y="116" fontSize="34" fontWeight="700" fill="#1d2430">@demo/common</text>
        <text x="398" y="146" fontSize="16" fill="#5f6b7b">port 5002</text>
        <text x="398" y="170" fontSize="15" fill="#5f6b7b">effector store + shared singleton</text>

        <rect x="690" y="34" width="258" height="132" rx="26" fill="#fffdf5" stroke="#b8852d" strokeWidth="2" />
        <text x="718" y="82" fontSize="17" fill="#5f6b7b">Remote consumer</text>
        <text x="718" y="116" fontSize="34" fontWeight="700" fill="#1d2430">@demo/components</text>
        <text x="718" y="146" fontSize="16" fill="#5f6b7b">port 5003</text>
        <text x="718" y="170" fontSize="15" fill="#5f6b7b">uses shared UI + common</text>

        <rect x="82" y="224" width="250" height="100" rx="24" fill="#fff7ef" stroke="#8f2f1d" strokeDasharray="8 8" />
        <text x="108" y="266" fontSize="17" fill="#5f6b7b">Standalone remote for experiments</text>
        <text x="108" y="294" fontSize="26" fontWeight="700" fill="#1d2430">@demo/ui @ 5001</text>

        <rect x="652" y="224" width="260" height="100" rx="24" fill="#f9f6ef" stroke="#5f6b7b" strokeDasharray="8 8" />
        <text x="682" y="266" fontSize="17" fill="#5f6b7b">Local code split only</text>
        <text x="682" y="294" fontSize="26" fontWeight="700" fill="#1d2430">packages/news</text>

        <path d="M272 100 C320 100, 330 100, 370 100" fill="none" stroke="url(#nodeAccent)" strokeWidth="4" />
        <path d="M620 100 C650 100, 658 100, 690 100" fill="none" stroke="url(#nodeAccent)" strokeWidth="4" />
        <path d="M190 166 C190 192, 190 204, 206 224" fill="none" stroke="#8f2f1d" strokeWidth="3" strokeDasharray="6 6" />
        <path d="M272 120 C468 228, 550 250, 652 250" fill="none" stroke="#5f6b7b" strokeWidth="3" strokeDasharray="8 6" />

        <text x="306" y="90" fontSize="14" fill="#8f2f1d">shared scope publish</text>
        <text x="642" y="92" fontSize="14" fill="#0f8c8c">remote consumption</text>
        <text x="214" y="216" fontSize="14" fill="#8f2f1d">experiment path only</text>
      </svg>
    </div>
  );
}
