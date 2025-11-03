"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Upload, FileText, Car, Coffee, Home, Plane, CheckCircle, XCircle, AlertCircle, Eye, Download } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Expense {
  id: string;
  employee: string;
  type: 'transport' | 'repas' | 'hebergement' | 'mission' | 'divers';
  description: string;
  amount: number;
  date: Date;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  receiptUrl?: string;
  category: string;
  project?: string;
  submittedAt?: Date;
  approvedAt?: Date;
  approvedBy?: string;
  comments?: string;
}

const mockExpenses: Expense[] = [
  {
    id: '1',
    employee: 'Jean Dupont',
    type: 'transport',
    description: 'Ticket de train Paris - Lyon',
    amount: 85.50,
    date: new Date(2025, 10, 15),
    status: 'approved',
    category: 'Déplacement professionnel',
    project: 'Projet Alpha',
    submittedAt: new Date(2025, 10, 16),
    approvedAt: new Date(2025, 10, 17),
    approvedBy: 'Marie Martin',
    receiptUrl: '/receipts/train-ticket-1.pdf'
  },
  {
    id: '2',
    employee: 'Marie Martin',
    type: 'repas',
    description: 'Déjeuner client restaurant Le Gourmet',
    amount: 65.00,
    date: new Date(2025, 10, 14),
    status: 'submitted',
    category: 'Repas d\'affaires',
    project: 'Projet Beta',
    submittedAt: new Date(2025, 10, 15)
  },
  {
    id: '3',
    employee: 'Pierre Durand',
    type: 'hebergement',
    description: 'Hôtel Ibis Marseille 2 nuits',
    amount: 180.00,
    date: new Date(2025, 10, 10),
    status: 'draft',
    category: 'Mission',
    project: 'Projet Gamma'
  }
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [showNewExpense, setShowNewExpense] = useState(false);
  const [filter, setFilter] = useState<'all' | 'draft' | 'submitted' | 'approved' | 'rejected'>('all');
  const [newExpense, setNewExpense] = useState({
    type: 'transport' as 'transport' | 'repas' | 'hebergement' | 'mission' | 'divers',
    description: '',
    amount: '',
    date: '',
    category: '',
    project: ''
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'transport': return <Car className="w-4 h-4" />;
      case 'repas': return <Coffee className="w-4 h-4" />;
      case 'hebergement': return <Home className="w-4 h-4" />;
      case 'mission': return <Plane className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'submitted': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Approuvée';
      case 'submitted': return 'En attente';
      case 'rejected': return 'Rejetée';
      case 'draft': return 'Brouillon';
      default: return status;
    }
  };

  const handleNewExpense = () => {
    if (!newExpense.description || !newExpense.amount || !newExpense.date || !newExpense.category) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const expense: Expense = {
      id: Date.now().toString(),
      employee: 'Utilisateur courant',
      type: newExpense.type,
      description: newExpense.description,
      amount: parseFloat(newExpense.amount),
      date: new Date(newExpense.date),
      status: 'draft',
      category: newExpense.category,
      project: newExpense.project || undefined
    };

    setExpenses([...expenses, expense]);
    setNewExpense({
      type: 'transport',
      description: '',
      amount: '',
      date: '',
      category: '',
      project: ''
    });
    setShowNewExpense(false);
    alert('Note de frais créée avec succès !');
  };

  const handleSubmitExpense = (id: string) => {
    setExpenses(expenses.map(exp => 
      exp.id === id ? { ...exp, status: 'submitted', submittedAt: new Date() } : exp
    ));
    alert('Note de frais soumise pour validation !');
  };

  const handleApproveExpense = (id: string) => {
    setExpenses(expenses.map(exp => 
      exp.id === id ? { 
        ...exp, 
        status: 'approved', 
        approvedAt: new Date(),
        approvedBy: 'Manager'
      } : exp
    ));
  };

  const handleRejectExpense = (id: string) => {
    const reason = prompt('Motif du rejet :');
    if (reason) {
      setExpenses(expenses.map(exp => 
        exp.id === id ? { ...exp, status: 'rejected', comments: reason } : exp
      ));
    }
  };

  const filteredExpenses = filter === 'all' 
    ? expenses 
    : expenses.filter(exp => exp.status === filter);

  const totalAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const exportExpenses = () => {
    const csvContent = [
      ['Date', 'Employé', 'Type', 'Description', 'Montant', 'Statut', 'Catégorie', 'Projet'],
      ...filteredExpenses.map(exp => [
        format(exp.date, 'dd/MM/yyyy'),
        exp.employee,
        exp.type,
        exp.description,
        exp.amount.toFixed(2),
        getStatusText(exp.status),
        exp.category,
        exp.project || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes-de-frais-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Notes de Frais</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportExpenses}>
            <Download className="w-4 h-4 mr-2" />Exporter
          </Button>
          <Button onClick={() => setShowNewExpense(true)}>
            <Plus className="w-4 h-4 mr-2" />Nouvelle note
          </Button>
        </div>
      </div>

      {/* Modal Nouvelle Note de Frais */}
      {showNewExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Nouvelle note de frais</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type *</label>
                <select 
                  value={newExpense.type}
                  onChange={(e) => setNewExpense({...newExpense, type: e.target.value as any})}
                  className="w-full p-2 border rounded"
                >
                  <option value="transport">Transport</option>
                  <option value="repas">Repas</option>
                  <option value="hebergement">Hébergement</option>
                  <option value="mission">Mission</option>
                  <option value="divers">Divers</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description *</label>
                <input 
                  type="text"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  className="w-full p-2 border rounded"
                  placeholder="Description de la dépense..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Montant (€) *</label>
                <input 
                  type="number"
                  step="0.01"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  className="w-full p-2 border rounded"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date *</label>
                <input 
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Catégorie *</label>
                <input 
                  type="text"
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                  className="w-full p-2 border rounded"
                  placeholder="Déplacement professionnel, Repas d'affaires..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Projet</label>
                <input 
                  type="text"
                  value={newExpense.project}
                  onChange={(e) => setNewExpense({...newExpense, project: e.target.value})}
                  className="w-full p-2 border rounded"
                  placeholder="Projet concerné (optionnel)"
                />
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center">
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Glissez un justificatif ici</p>
                <p className="text-xs text-gray-500">ou cliquez pour parcourir</p>
                <input type="file" className="hidden" accept="image/*,.pdf" />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowNewExpense(false)}>
                  Annuler
                </Button>
                <Button onClick={handleNewExpense}>
                  Créer la note
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtres et Statistiques */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total des dépenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAmount.toFixed(2)} €</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {expenses.filter(exp => exp.status === 'submitted').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approuvées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {expenses.filter(exp => exp.status === 'approved').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Brouillons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {expenses.filter(exp => exp.status === 'draft').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        <Button 
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          Toutes ({expenses.length})
        </Button>
        <Button 
          variant={filter === 'draft' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('draft')}
        >
          Brouillons ({expenses.filter(exp => exp.status === 'draft').length})
        </Button>
        <Button 
          variant={filter === 'submitted' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('submitted')}
        >
          En attente ({expenses.filter(exp => exp.status === 'submitted').length})
        </Button>
        <Button 
          variant={filter === 'approved' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('approved')}
        >
          Approuvées ({expenses.filter(exp => exp.status === 'approved').length})
        </Button>
        <Button 
          variant={filter === 'rejected' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('rejected')}
        >
          Rejetées ({expenses.filter(exp => exp.status === 'rejected').length})
        </Button>
      </div>

      {/* Liste des notes de frais */}
      <div className="space-y-4">
        {filteredExpenses.map(expense => (
          <Card key={expense.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getTypeIcon(expense.type)}
                    <div>
                      <h3 className="font-medium">{expense.description}</h3>
                      <p className="text-sm text-gray-600">{expense.category}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Employé:</span>
                      <div className="font-medium">{expense.employee}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Date:</span>
                      <div className="font-medium">{format(expense.date, 'dd/MM/yyyy')}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Montant:</span>
                      <div className="font-medium">{expense.amount.toFixed(2)} €</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Projet:</span>
                      <div className="font-medium">{expense.project || '—'}</div>
                    </div>
                  </div>
                  {expense.comments && (
                    <div className="mt-2 text-sm text-red-600">
                      <span className="font-medium">Motif rejet:</span> {expense.comments}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 ml-4">
                  <Badge className={getStatusColor(expense.status)}>
                    {getStatusText(expense.status)}
                  </Badge>
                  <div className="flex gap-1">
                    {expense.receiptUrl && (
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                    {expense.status === 'draft' && (
                      <Button size="sm" onClick={() => handleSubmitExpense(expense.id)}>
                        Soumettre
                      </Button>
                    )}
                    {expense.status === 'submitted' && (
                      <>
                        <Button size="sm" onClick={() => handleApproveExpense(expense.id)}>
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleRejectExpense(expense.id)}>
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredExpenses.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Aucune note de frais trouvée</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
