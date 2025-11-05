import { ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

interface PermissionDeniedProps {
  message?: string;
  feature?: string;
}

export function PermissionDenied({ message, feature }: PermissionDeniedProps) {
  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-800">
          <ShieldAlert className="w-5 h-5" />
          Accès Refusé
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-amber-700">
            {message || "Vous n'avez pas les permissions nécessaires pour accéder à cette fonctionnalité."}
          </p>
          {feature && (
            <p className="text-sm text-amber-600">
              Fonctionnalité: <span className="font-medium">{feature}</span>
            </p>
          )}
          <p className="text-sm text-amber-600">
            Veuillez contacter votre administrateur pour obtenir les droits d'accès appropriés.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
