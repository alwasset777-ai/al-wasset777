
import React, { useState, useEffect } from 'react';
import { ClientProfile, INITIAL_CLIENT_PROFILE } from './types';
import ClientForm from './components/ClientForm';
import ClientCard from './components/ClientCard';
import { Sparkles, Printer, MessageCircle, Save, Building2, Loader2, FilePlus, Calculator, Percent, Calendar, Banknote, Search } from './components/Icons';
import { generateClientSummary, generateRecommendations, generateDraftMessage } from './services/geminiService';

const App: React.FC = () => {
  const [clientData, setClientData] = useState<ClientProfile>(INITIAL_CLIENT_PROFILE);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [aiRecommendations, setAiRecommendations] = useState<string>('');
  const [aiDraft, setAiDraft] = useState<string>('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [loadingDraft, setLoadingDraft] = useState(false);

  // Credit Simulator State
  const [loanAmount, setLoanAmount] = useState<number>(0);
  const [interestRate, setInterestRate] = useState<number>(4.5);
  const [loanDuration, setLoanDuration] = useState<number>(20);
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);

  useEffect(() => {
    // Auto update loan amount when price changes, but only if user hasn't manually edited it extensively
    if (clientData.price > 0) {
        setLoanAmount(clientData.price);
    }
  }, [clientData.price]);

  useEffect(() => {
    if (loanAmount > 0 && interestRate > 0 && loanDuration > 0) {
        const r = interestRate / 100 / 12;
        const n = loanDuration * 12;
        const payment = (loanAmount * r) / (1 - Math.pow(1 + r, -n));
        setMonthlyPayment(payment);
    } else {
        setMonthlyPayment(0);
    }
  }, [loanAmount, interestRate, loanDuration]);

  const handleUpdateClient = (field: keyof ClientProfile, value: any) => {
    setClientData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNewClient = () => {
    if (window.confirm("Voulez-vous créer une nouvelle fiche ? Les données actuelles non enregistrées seront effacées.")) {
        setClientData(INITIAL_CLIENT_PROFILE);
        setAiSummary('');
        setAiRecommendations('');
        setAiDraft('');
        setLoanAmount(0);
        setMonthlyPayment(0);
    }
  };

  const handleGenerateAI = async () => {
    if (!process.env.API_KEY) {
        alert("API Key manquante. L'IA ne peut pas fonctionner.");
        return;
    }
    
    setLoadingSummary(true);
    setLoadingRecs(true);
    setLoadingDraft(true);

    // Run in parallel
    generateClientSummary(clientData).then(res => {
        setAiSummary(res);
        setLoadingSummary(false);
    });
    generateRecommendations(clientData).then(res => {
        setAiRecommendations(res);
        setLoadingRecs(false);
    });
    generateDraftMessage(clientData).then(res => {
        setAiDraft(res);
        setLoadingDraft(false);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-800">
      {/* Navbar */}
      <header className="bg-morocco-green text-white sticky top-0 z-50 shadow-md print:hidden">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-morocco-gold" />
            <div>
              <h1 className="text-xl font-bold tracking-tight">AL WASSET 777 IMMOBILIER</h1>
              <p className="text-xs text-morocco-sand opacity-80">Gestion Fiche Client</p>
            </div>
          </div>

          {/* Barre de recherche visuelle */}
          <div className="flex-1 max-w-md w-full mx-4 relative hidden sm:block">
             <input 
               type="text" 
               placeholder="Rechercher un client / dossier..." 
               className="w-full bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-full py-2 pl-10 pr-4 text-sm outline-none focus:bg-white/20 transition"
             />
             <Search className="w-4 h-4 text-white/50 absolute left-3 top-2.5" />
          </div>

          <div className="flex gap-3">
            <button 
               onClick={handleNewClient}
               className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition border border-white/10"
            >
              <FilePlus className="w-4 h-4" />
              <span className="hidden sm:inline">Nouveau</span>
            </button>
            <button 
               onClick={handlePrint}
               className="flex items-center gap-2 bg-white text-morocco-green hover:bg-slate-100 px-4 py-2 rounded-lg text-sm font-bold transition shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimer</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Form (Input) */}
          <div className="lg:col-span-7 space-y-6 print:hidden">
             <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-4 flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                    <Sparkles className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-semibold text-blue-900 text-sm">Remplissage assisté</h3>
                    <p className="text-blue-700 text-sm mt-1">Remplissez les détails à gauche. Une fois terminé, cliquez sur "Analyser avec IA" pour obtenir un résumé professionnel, des recommandations de quartiers et un message de bienvenue.</p>
                </div>
             </div>

             <ClientForm data={clientData} onChange={handleUpdateClient} />
             
             <div className="flex justify-end">
                <button
                    onClick={handleGenerateAI}
                    disabled={loadingSummary || loadingRecs}
                    className="flex items-center gap-2 bg-morocco-gold hover:bg-yellow-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-orange-900/10 font-bold transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {(loadingSummary || loadingRecs) ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    Analyser avec IA Gemini
                </button>
             </div>
          </div>

          {/* Right Column: Visualization & AI Output */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* The "Fiche" Card */}
            <div>
                <div className="flex items-center justify-between mb-2 print:hidden">
                   <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Aperçu de la Fiche</h3>
                </div>
                <ClientCard data={clientData} />
            </div>

            {/* SIMULATEUR CREDIT IMMO (Widget Surprise) */}
            <div className="bg-slate-900 p-5 rounded-xl shadow-lg border border-slate-800 text-white print:hidden">
                 <h3 className="font-bold text-morocco-gold flex items-center gap-2 mb-4 uppercase tracking-wider text-sm">
                    <Calculator className="w-4 h-4" /> Simulateur Crédit Immo
                </h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                           <Banknote className="w-3 h-3" /> Montant du Bien (MAD)
                        </label>
                        <input 
                            type="number" 
                            value={loanAmount}
                            onChange={(e) => setLoanAmount(Number(e.target.value))}
                            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm focus:border-morocco-gold outline-none text-white"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                                <Percent className="w-3 h-3" /> Taux (%)
                            </label>
                            <input 
                                type="number" 
                                step="0.1"
                                value={interestRate}
                                onChange={(e) => setInterestRate(Number(e.target.value))}
                                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm focus:border-morocco-gold outline-none text-white"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                                <Calendar className="w-3 h-3" /> Durée (Ans)
                            </label>
                            <input 
                                type="number" 
                                value={loanDuration}
                                onChange={(e) => setLoanDuration(Number(e.target.value))}
                                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm focus:border-morocco-gold outline-none text-white"
                            />
                        </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-700">
                        <div className="flex justify-between items-end">
                            <span className="text-sm text-slate-400">Mensualité estimée</span>
                            <span className="text-xl font-bold text-green-400">
                                {formatCurrency(monthlyPayment)} / mois
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 text-right">*Estimation hors assurance et frais de dossier</p>
                    </div>
                </div>
            </div>

            {/* AI Insights Section */}
            <div className="space-y-4 print:break-inside-avoid">
                
                {/* Summary */}
                <div className="bg-white p-5 rounded-xl shadow border border-slate-100">
                    <h3 className="font-bold text-morocco-green flex items-center gap-2 mb-3">
                        <Save className="w-4 h-4" /> Résumé CRM
                    </h3>
                    {loadingSummary ? (
                        <div className="flex items-center gap-2 text-sm text-slate-400 animate-pulse">
                            <Loader2 className="w-4 h-4 animate-spin" /> Génération du résumé...
                        </div>
                    ) : (
                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                            {aiSummary || "En attente d'analyse..."}
                        </p>
                    )}
                </div>

                {/* Market Advice */}
                <div className="bg-white p-5 rounded-xl shadow border border-slate-100">
                     <h3 className="font-bold text-morocco-green flex items-center gap-2 mb-3">
                        <Building2 className="w-4 h-4" /> Recommandations Marché
                    </h3>
                     {loadingRecs ? (
                        <div className="flex items-center gap-2 text-sm text-slate-400 animate-pulse">
                            <Loader2 className="w-4 h-4 animate-spin" /> Analyse du marché en cours...
                        </div>
                    ) : (
                         <div className="text-sm text-slate-600 prose prose-sm max-w-none prose-ul:pl-4 prose-li:marker:text-morocco-gold">
                            {aiRecommendations ? (
                                <div dangerouslySetInnerHTML={{ 
                                    __html: aiRecommendations
                                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                        .replace(/- /g, '• ')
                                        .split('\n').join('<br/>') 
                                }} />
                            ) : (
                                "En attente d'analyse..."
                            )}
                        </div>
                    )}
                </div>

                 {/* Draft Message */}
                 <div className="bg-white p-5 rounded-xl shadow border border-slate-100">
                     <h3 className="font-bold text-morocco-green flex items-center gap-2 mb-3">
                        <MessageCircle className="w-4 h-4" /> Brouillon WhatsApp
                    </h3>
                     {loadingDraft ? (
                        <div className="flex items-center gap-2 text-sm text-slate-400 animate-pulse">
                            <Loader2 className="w-4 h-4 animate-spin" /> Rédaction en cours...
                        </div>
                    ) : (
                        <div className="bg-green-50 p-3 rounded-lg border border-green-100 relative">
                            <p className="text-sm text-slate-700 italic whitespace-pre-line">
                                {aiDraft || "En attente d'analyse..."}
                            </p>
                            {aiDraft && (
                                <button 
                                    onClick={() => navigator.clipboard.writeText(aiDraft)}
                                    className="absolute top-2 right-2 text-xs bg-white px-2 py-1 rounded border shadow-sm hover:bg-gray-50"
                                >
                                    Copier
                                </button>
                            )}
                        </div>
                    )}
                </div>

            </div>
          </div>

        </div>
      </main>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-card, #printable-card * {
            visibility: visible;
          }
          #printable-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            border: none;
            box-shadow: none;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default App;
