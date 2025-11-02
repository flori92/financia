"use client";
import { useState } from "react";
import { Plus, TrendingUp, TrendingDown, Wallet, AlertTriangle, Download, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BankAccount {
  name: string;
  bank: string;
  balance: number;
  currency: string;
  status: "Connecté" | "Manuel";
}

export default function TreasuryPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([
    { name: "Compte Principal BNI", bank: "BNI", balance: 15000000, currency: "FCFA", status: "Connecté" },
    { name: "Compte USD", bank: "Ecobank", balance: 25000, currency: "USD", status: "Connecté" },
    { name: "Compte Épargne", bank: "BOA", balance: 5000000, currency: "FCFA", status: "Manuel" }
  ]);

  const [forecast] = useState([
    { date: "2025-01-20", inflow: 2000000, outflow: 1500000, balance: 15500000 },
    { date: "2025-01-27", inflow: 1800000, outflow: 2200000, balance: 15100000 },
    { date: "2025-02-03", inflow: 2500000, outflow: 1800000, balance: 15800000 },
    { date: "2025-02-10", inflow: 2200000, outflow: 2000000, balance: 16000000 }
  ]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: "",
    bank: "",
    balance: "",
    currency: "FCFA",
    status: "Manuel" as "Connecté" | "Manuel"
  });

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccount.name || !newAccount.bank || !newAccount.balance) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setCreatingAccount(true);
    try {
      // Simuler la création (remplacer par appel API réel)
      setTimeout(() => {
        const account: BankAccount = {
          name: newAccount.name,
          bank: newAccount.bank,
          balance: parseFloat(newAccount.balance),
          currency: newAccount.currency,
          status: newAccount.status
        };
        
        setAccounts([account, ...accounts]);
        setIsCreateModalOpen(false);
        setNewAccount({
          name: "",
          bank: "",
          balance: "",
          currency: "FCFA",
          status: "Manuel"
        });
        setCreatingAccount(false);
      }, 1000);
    } catch (error) {
      console.error("Erreur création compte:", error);
      alert("Erreur lors de la création du compte");
      setCreatingAccount(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Trésorerie</h1>
          <p className="text-gray-600">Gestion multi-banques et prévisionnel de trésorerie</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
            <Download className="w-4 h-4" />
            Export SEPA
          </button>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74]">
                <Plus className="w-4 h-4" />
                Nouveau compte
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Nouveau compte bancaire</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="accountName">Nom du compte *</Label>
                  <Input
                    id="accountName"
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                    placeholder="Ex: Compte courant BNI"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank">Banque *</Label>
                  <Select value={newAccount.bank} onValueChange={(value) => setNewAccount({...newAccount, bank: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une banque" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BNI">BNI</SelectItem>
                      <SelectItem value="Ecobank">Ecobank</SelectItem>
                      <SelectItem value="BOA">BOA</SelectItem>
                      <SelectItem value="SGBCI">SGBCI</SelectItem>
                      <SelectItem value="NSIA Banque">NSIA Banque</SelectItem>
                      <SelectItem value="SIB">SIB</SelectItem>
                      <SelectItem value="Autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="balance">Solde initial *</Label>
                  <Input
                    id="balance"
                    type="number"
                    step="0.01"
                    value={newAccount.balance}
                    onChange={(e) => setNewAccount({...newAccount, balance: e.target.value})}
                    placeholder="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Devise</Label>
                  <Select value={newAccount.currency} onValueChange={(value) => setNewAccount({...newAccount, currency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FCFA">FCFA</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Type de synchronisation</Label>
                  <Select value={newAccount.status} onValueChange={(value: string) => setNewAccount({...newAccount, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Connecté">Connecté (API bancaire)</SelectItem>
                      <SelectItem value="Manuel">Manuel (saisie manuelle)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateModalOpen(false)}
                    disabled={creatingAccount}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={creatingAccount}>
                    {creatingAccount ? "Création..." : "Créer le compte"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPIs Trésorerie */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <Wallet className="w-8 h-8 text-[#0D9488]" />
            <div>
              <div className="text-sm text-gray-600">Trésorerie totale</div>
              <div className="text-2xl font-semibold">
                {new Intl.NumberFormat('fr-FR').format(
                  accounts.reduce((sum, acc) => sum + acc.balance, 0)
                )} FCFA
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-sm text-gray-600">Entrées prévues (7j)</div>
              <div className="text-2xl font-semibold text-green-600">4 200 000 FCFA</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <TrendingDown className="w-8 h-8 text-red-600" />
            <div>
              <div className="text-sm text-gray-600">Sorties prévues (7j)</div>
              <div className="text-2xl font-semibold text-red-600">3 700 000 FCFA</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
            <div>
              <div className="text-sm text-gray-600">Runway</div>
              <div className="text-2xl font-semibold text-orange-600">45 jours</div>
            </div>
          </div>
        </div>
      </div>

      {/* Comptes bancaires */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Comptes bancaires</h2>
        <div className="space-y-4">
          {accounts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucun compte bancaire. Cliquez sur "Nouveau compte" pour en ajouter un.
            </div>
          ) : (
            accounts.map((account, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#0D9488] rounded-lg flex items-center justify-center text-white font-semibold">
                    {account.bank.substring(0, 2)}
                  </div>
                  <div>
                    <div className="font-medium">{account.name}</div>
                    <div className="text-sm text-gray-600">{account.bank}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {new Intl.NumberFormat('fr-FR').format(account.balance)} {account.currency}
                  </div>
                  <div className={`text-sm ${account.status === 'Connecté' ? 'text-green-600' : 'text-orange-600'}`}>
                    {account.status}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Prévisionnel */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Prévisionnel de trésorerie</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Entrées</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Sorties</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Solde prévisionnel</th>
              </tr>
            </thead>
            <tbody>
              {forecast.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="py-3 px-4">{new Date(item.date).toLocaleDateString('fr-FR')}</td>
                  <td className="py-3 px-4 text-right text-green-600 font-medium">
                    +{new Intl.NumberFormat('fr-FR').format(item.inflow)} FCFA
                  </td>
                  <td className="py-3 px-4 text-right text-red-600 font-medium">
                    -{new Intl.NumberFormat('fr-FR').format(item.outflow)} FCFA
                  </td>
                  <td className="py-3 px-4 text-right font-semibold">
                    {new Intl.NumberFormat('fr-FR').format(item.balance)} FCFA
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}