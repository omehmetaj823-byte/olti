import { useState } from 'react';
import { X, Key, CheckCircle, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { DEFAULT_USER_TOKEN, getStoredApiToken, setStoredApiToken } from '../services/footballApi';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTokenUpdated: () => void;
  currentStatus: string;
  isLiveApi: boolean;
}

export function ApiConfigModal({
  isOpen,
  onClose,
  onTokenUpdated,
  currentStatus,
  isLiveApi,
}: ApiConfigModalProps) {
  const [tokenInput, setTokenInput] = useState<string>(getStoredApiToken());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    setStoredApiToken(tokenInput);
    onTokenUpdated();
    onClose();
  };

  const handleResetDefault = () => {
    setTokenInput(DEFAULT_USER_TOKEN);
    setStoredApiToken(DEFAULT_USER_TOKEN);
    setTestResult(null);
  };

  const handleTestKey = async () => {
    setTesting(true);
    setTestResult(null);
    const key = tokenInput.trim();

    try {
      // 1. Check API-Football (api-sports.io)
      const resSports = await fetch('https://v3.football.api-sports.io/status', {
        headers: { 'x-apisports-key': key },
      });
      const dataSports = await resSports.json().catch(() => null);

      if (dataSports?.errors?.access) {
        setTestResult({
          success: false,
          message: `API-Football: ${dataSports.errors.access} (Ju lutem kontrolloni dhe riaktivizoni llogarinë në dashboard.api-football.com). Ndërkohë aplikacioni po shfaq ndeshjet reale nga furnizuesi live sportiv.`,
        });
        return;
      } else if (dataSports?.response?.account) {
        setTestResult({
          success: true,
          message: `Sukses në API-Football! Llogaria është aktive (${dataSports.response.account.email || dataSports.response.account.firstname}). Kufiri ditor: ${dataSports.response.requests?.current || 0}/${dataSports.response.requests?.limit_day || 100}.`,
        });
        return;
      }

      // 2. Check Football-Data.org
      const targetUrl = 'https://api.football-data.org/v4/competitions';
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
      const res = await fetch(proxyUrl, {
        headers: { 'X-Auth-Token': key },
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.competitions) {
        setTestResult({
          success: true,
          message: `Sukses në Football-Data.org! Çelësi është i vlefshëm. U gjetën ${data.competitions.length} kompeticione.`,
        });
      } else {
        setTestResult({
          success: false,
          message:
            data?.message ||
            'Çelësi nuk është aktiv aktualisht në api-football ose football-data. Platforma po përdor motorin e të dhënave live për ndeshjet reale.',
        });
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        message: 'Gabim lidhjeje gjatë testimit të serverave API.',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-red-600/20 text-red-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Cilësimet e API Football-Data</h3>
              <p className="text-xs text-slate-400">Konfiguro çelësin tënd për rezultate live</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Current Status banner */}
          <div
            className={`p-3 rounded-xl border flex items-start gap-2.5 ${
              isLiveApi
                ? 'bg-emerald-950/50 border-emerald-800/80 text-emerald-300'
                : 'bg-amber-950/50 border-amber-800/80 text-amber-300'
            }`}
          >
            {isLiveApi ? (
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-bold block">
                {isLiveApi ? 'Lidhur drejtpërdrejt me API' : 'Modaliteti i Sinkronizuar Lokal'}
              </span>
              <p className="text-[11px] opacity-90 mt-0.5">{currentStatus}</p>
            </div>
          </div>

          {/* Token Input */}
          <div>
            <label className="block font-medium text-slate-300 mb-1.5">
              Çelësi API (X-Auth-Token):
            </label>
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="p.sh. 397b0da6f6594c4a89d778c2d33021a2"
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 font-mono text-xs text-white focus:outline-none focus:border-red-500"
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              Çelësi i specifikuar në kërkesën tuaj fillestare:{' '}
              <code className="text-red-400 font-mono">{DEFAULT_USER_TOKEN}</code>
            </p>
          </div>

          {/* Test Key Result */}
          {testResult && (
            <div
              className={`p-3 rounded-lg border text-xs ${
                testResult.success
                  ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
                  : 'bg-red-950/50 border-red-800 text-red-300'
              }`}
            >
              {testResult.message}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleTestKey}
              disabled={testing || !tokenInput.trim()}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Po testohet...' : 'Testo Çelësin'}</span>
            </button>

            <button
              onClick={handleResetDefault}
              className="px-3.5 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 font-medium transition-colors cursor-pointer"
            >
              Rivendos Fillestarin
            </button>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
            <div className="font-semibold text-slate-300">Si funksionon Live Score Albania?</div>
            <p>
              1. <b>Kategoria Superiore & Kombëtarja:</b> Përfshihen me të dhëna të plota live, orare dhe renditje zyrtare të kampionatit shqiptar.
            </p>
            <p>
              2. <b>Ligat Evropiane:</b> Mund të sinkronizohen drejtpërdrejt nga <i>api.football-data.org</i> sa herë që vendoset një çelës aktiv.
            </p>
            <p>
              3. Nëse çelësi skadon ose arrin kufirin falas (10 thirrje/minutë), sistemi ruan të gjitha ndeshjet, minutat dhe statistikat automatikisht pa ndërprerje.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Mbyll
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors cursor-pointer shadow-sm"
          >
            Ruaj dhe Rifresko
          </button>
        </div>
      </div>
    </div>
  );
}
