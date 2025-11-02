"use client";

// Type pour le profil utilisateur
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'entrepreneur' | 'expert' | 'admin';
  company?: string;
  avatar?: string;
}

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function EntrepreneurInterface({
  children,
  profile,
}: {
  children: React.ReactNode;
  profile: UserProfile;
}) {
  return (
    <div className="container mx-auto space-y-6 p-4">
      <TabsRoot defaultValue="dashboard">
        <TabsList>
          <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
          <TabsTrigger value="operations">Opérations</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="analysis">Analyse</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard">
          <DashboardView profile={profile} />
        </TabsContent>
        <TabsContent value="operations">
          <OperationsView profile={profile} />
        </TabsContent>
        <TabsContent value="documents">
          <DocumentsView profile={profile} />
        </TabsContent>
        <TabsContent value="analysis">
          <AnalysisView profile={profile} />
        </TabsContent>
      </TabsRoot>
      {children}
    </div>
  );
}

function ExpertInterface({
  children,
  profile,
}: {
  children: React.ReactNode;
  profile: UserProfile;
}) {
  return (
    <div className="container mx-auto space-y-6 p-4">
      <TabsRoot defaultValue="clients">
        <TabsList>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="reports">Rapports</TabsTrigger>
          <TabsTrigger value="admin">Administration</TabsTrigger>
        </TabsList>
        <TabsContent value="clients">
          <ClientsView profile={profile} />
        </TabsContent>
        <TabsContent value="validation">
          <ValidationView profile={profile} />
        </TabsContent>
        <TabsContent value="reports">
          <ReportsView profile={profile} />
        </TabsContent>
        <TabsContent value="admin">
          <AdminView profile={profile} />
        </TabsContent>
      </TabsRoot>
      {children}
    </div>
  );
}

function AdminInterface({
  children,
  profile,
}: {
  children: React.ReactNode;
  profile: UserProfile;
}) {
  return (
    <div className="container mx-auto space-y-6 p-4">
      <TabsRoot defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="compliance">Conformité</TabsTrigger>
          <TabsTrigger value="analytics">Analytique</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <OverviewView profile={profile} />
        </TabsContent>
        <TabsContent value="compliance">
          <ComplianceView profile={profile} />
        </TabsContent>
        <TabsContent value="analytics">
          <AnalyticsView profile={profile} />
        </TabsContent>
        <TabsContent value="settings">
          <SettingsView profile={profile} />
        </TabsContent>
      </TabsRoot>
      {children}
    </div>
  );
}

const DashboardView = ({ profile }: { profile: UserProfile }) => (
  <div>Tableau de bord</div>
);
const OperationsView = ({ profile }: { profile: UserProfile }) => (
  <div>Opérations</div>
);
const DocumentsView = ({ profile }: { profile: UserProfile }) => (
  <div>Documents</div>
);
const AnalysisView = ({ profile }: { profile: UserProfile }) => (
  <div>Analyse</div>
);

const ClientsView = ({ profile }: { profile: UserProfile }) => (
  <div>Clients</div>
);
const ValidationView = ({ profile }: { profile: UserProfile }) => (
  <div>Validation</div>
);
const ReportsView = ({ profile }: { profile: UserProfile }) => (
  <div>Rapports</div>
);
const AdminView = ({ profile }: { profile: UserProfile }) => (
  <div>Administration</div>
);

const OverviewView = ({ profile }: { profile: UserProfile }) => (
  <div>Vue d'ensemble</div>
);
const ComplianceView = ({ profile }: { profile: UserProfile }) => (
  <div>Conformité</div>
);
const AnalyticsView = ({ profile }: { profile: UserProfile }) => (
  <div>Analytique</div>
);
const SettingsView = ({ profile }: { profile: UserProfile }) => (
  <div>Paramètres</div>
);
