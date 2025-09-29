import React, { useState, useEffect } from 'react';
import { Users, CreditCard, TrendingUp, Building2, Star, MessageSquare, Settings, Shield, Search, Filter, Download, CreditCard as Edit, Trash2, Plus, Eye, ChevronRight, AlertTriangle, CheckCircle, XCircle, Clock, Send, Mail, UserCheck, Calendar } from 'lucide-react';
import StarlinkoLogo from '../components/StarlinkoLogo';

interface User {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: 'active' | 'trial' | 'expired' | 'cancelled';
  trialDaysLeft?: number;
  joinDate: string;
  lastActive: string;
  revenue: number;
  establishments: number;
  reviewsProcessed: number;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  users: number;
  revenue: number;
  features: string[];
}

const SuperAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [messageForm, setMessageForm] = useState({
    recipient: 'all',
    subject: '',
    message: '',
    type: 'notification'
  });
  const [sentMessages, setSentMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data - In real app, this would come from your backend
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setUsers([
        {
          id: '1',
          name: 'Marie Dubois',
          email: 'marie@restaurant-paris.fr',
          plan: 'pro',
          status: 'active',
          joinDate: '2024-01-15',
          lastActive: '2024-01-20',
          revenue: 29.90,
          establishments: 2,
          reviewsProcessed: 156
        },
        {
          id: '2',
          name: 'Jean Martin',
          email: 'jean@boulangerie-lyon.fr',
          plan: 'starter',
          status: 'trial',
          trialDaysLeft: 7,
          joinDate: '2024-01-18',
          lastActive: '2024-01-20',
          revenue: 0,
          establishments: 1,
          reviewsProcessed: 23
        },
        {
          id: '3',
          name: 'Sophie Laurent',
          email: 'sophie@hotel-nice.com',
          plan: 'business',
          status: 'active',
          joinDate: '2024-01-10',
          lastActive: '2024-01-19',
          revenue: 79.90,
          establishments: 5,
          reviewsProcessed: 342
        },
        {
          id: '4',
          name: 'Pierre Durand',
          email: 'pierre@garage-marseille.fr',
          plan: 'starter',
          status: 'expired',
          joinDate: '2024-01-05',
          lastActive: '2024-01-15',
          revenue: 9.90,
          establishments: 1,
          reviewsProcessed: 45
        }
      ]);

      setPlans([
        {
          id: 'starter',
          name: 'Starter',
          price: 9.90,
          users: 1247,
          revenue: 12345.30,
          features: ['1 établissement', '50 avis/mois', 'IA basique']
        },
        {
          id: 'pro',
          name: 'Pro',
          price: 29.90,
          users: 456,
          revenue: 13634.40,
          features: ['3 établissements', '300 avis/mois', 'IA premium']
        },
        {
          id: 'business',
          name: 'Business',
          price: 79.90,
          users: 123,
          revenue: 9827.70,
          features: ['Illimité', '1000 avis/mois', 'IA premium + posts auto']
        }
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'plans', label: 'Plans', icon: CreditCard },
    { id: 'messaging', label: 'Messagerie', icon: Mail },
    { id: 'analytics', label: 'Analytics', icon: Star },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-[#34A853]/10 text-[#34A853]';
      case 'trial': return 'bg-[#FBBC05]/10 text-[#FBBC05]';
      case 'expired': return 'bg-[#EA4335]/10 text-[#EA4335]';
      case 'cancelled': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'trial': return <Clock className="w-4 h-4" />;
      case 'expired': return <XCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertTriangle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const handleMessageFormChange = (field: string, value: string) => {
    setMessageForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSendMessage = () => {
    if (!messageForm.subject || !messageForm.message) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const newMessage = {
      id: Date.now(),
      recipient: messageForm.recipient === 'all' ? 'Tous les utilisateurs' : messageForm.recipient,
      subject: messageForm.subject,
      message: messageForm.message,
      type: messageForm.type,
      sentAt: new Date().toISOString(),
      status: 'sent',
      openRate: '0%'
    };

    setSentMessages(prev => [newMessage, ...prev]);
    setMessageForm({
      recipient: 'all',
      subject: '',
      message: '',
      type: 'notification'
    });

    alert('Message envoyé avec succès !');
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalUsers = users.length;
  const totalRevenue = users.reduce((sum, user) => sum + user.revenue, 0);
  const totalReviews = users.reduce((sum, user) => sum + user.reviewsProcessed, 0);
  const totalEstablishments = users.reduce((sum, user) => sum + user.establishments, 0);

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-[#4285F4]/10 rounded-lg">
              <Users className="w-6 h-6 text-[#4285F4]" />
            </div>
            <span className="text-sm text-[#34A853] font-medium">+12%</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{totalUsers.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Utilisateurs totaux</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-[#34A853]/10 rounded-lg">
              <CreditCard className="w-6 h-6 text-[#34A853]" />
            </div>
            <span className="text-sm text-[#34A853] font-medium">+8%</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">€{totalRevenue.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Revenus mensuels</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-[#FBBC05]/10 rounded-lg">
              <Star className="w-6 h-6 text-[#FBBC05]" />
            </div>
            <span className="text-sm text-[#34A853] font-medium">+25%</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{totalReviews.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Avis traités</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-[#EA4335]/10 rounded-lg">
              <Building2 className="w-6 h-6 text-[#EA4335]" />
            </div>
            <span className="text-sm text-[#34A853] font-medium">+15%</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{totalEstablishments.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Établissements</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h3>
        <div className="space-y-4">
          {users.slice(0, 5).map((user) => (
            <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-[#4285F4]/10 rounded-full flex items-center justify-center mr-3">
                  <Users className="w-5 h-5 text-[#4285F4]" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                  {getStatusIcon(user.status)}
                  <span className="ml-1 capitalize">{user.status}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(user.lastActive).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4] focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4] focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="trial">Essai</option>
              <option value="expired">Expiré</option>
              <option value="cancelled">Annulé</option>
            </select>
            
            <button className="flex items-center px-4 py-2 bg-[#4285F4] text-white rounded-lg hover:bg-[#3367D6] transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenus
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Établissements
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-[#4285F4]/10 rounded-full flex items-center justify-center mr-3">
                        <Users className="w-5 h-5 text-[#4285F4]" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#4285F4]/10 text-[#4285F4] capitalize">
                      {user.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {getStatusIcon(user.status)}
                      <span className="ml-1 capitalize">{user.status}</span>
                      {user.status === 'trial' && user.trialDaysLeft && (
                        <span className="ml-1">({user.trialDaysLeft}j)</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    €{user.revenue.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.establishments}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-[#4285F4] hover:text-[#3367D6]">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-[#FBBC05] hover:text-[#F9AB00]">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-[#EA4335] hover:text-[#D33B2C]">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPlans = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 capitalize">{plan.name}</h3>
              <div className="text-2xl font-bold text-[#4285F4]">€{plan.price}</div>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Utilisateurs</span>
                <span className="font-medium text-gray-900">{plan.users.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Revenus</span>
                <span className="font-medium text-gray-900">€{plan.revenue.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-2">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-[#34A853] mr-2 flex-shrink-0" />
                  {feature}
                </div>
              ))}
            </div>

            <button className="w-full mt-4 px-4 py-2 bg-[#4285F4] text-white rounded-lg hover:bg-[#3367D6] transition-colors">
              Gérer le plan
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F1F3F4] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4285F4] mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du panneau d'administration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F3F4]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <StarlinkoLogo size="md" showText={true} />
              <div className="ml-4 flex items-center">
                <Shield className="w-5 h-5 text-[#EA4335] mr-2" />
                <span className="text-lg font-semibold text-gray-900">Super Admin</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR')}
              </div>
              <button className="bg-[#EA4335] text-white px-4 py-2 rounded-lg hover:bg-[#D33B2C] transition-colors">
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#4285F4] text-[#4285F4]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'plans' && renderPlans()}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics avancées</h3>
            <p className="text-gray-600">Fonctionnalité en cours de développement</p>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Paramètres système</h3>
            <p className="text-gray-600">Configuration globale de l'application</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdmin;