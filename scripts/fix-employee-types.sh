#!/bin/bash

# Script pour corriger les types d'employés dans les services

echo "🔧 Correction des types d'employés..."

# Fichiers à corriger
FILES=(
  "railway-deploy/backend/src/hr-manager/hr-manager-dashboard.service.ts"
  "railway-deploy/backend/src/manager/manager-dashboard.service.ts"
  "railway-deploy/backend/src/employee/employee-dashboard.service.ts"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "📝 Correction de $file..."
    
    # Remplacer status: 'active' par status: EmployeeStatus.ACTIVE
    sed -i '' "s/status: 'active'/status: EmployeeStatus.ACTIVE/g" "$file"
    
    # Remplacer status: 'terminated' par status: EmployeeStatus.TERMINATED
    sed -i '' "s/status: 'terminated'/status: EmployeeStatus.TERMINATED/g" "$file"
    
    # Remplacer contractType: 'cdi' par contractType: ContractType.PERMANENT
    sed -i '' "s/contractType: 'cdi'/contractType: ContractType.PERMANENT/g" "$file"
    
    # Remplacer contractType: 'cdd' par contractType: ContractType.FIXED_TERM
    sed -i '' "s/contractType: 'cdd'/contractType: ContractType.FIXED_TERM/g" "$file"
    
    # Remplacer status: 'approved' par status: LeaveStatus.APPROVED
    sed -i '' "s/status: 'approved'/status: LeaveStatus.APPROVED/g" "$file"
    
    # Remplacer status: 'pending' par status: LeaveStatus.PENDING
    sed -i '' "s/status: 'pending'/status: LeaveStatus.PENDING/g" "$file"
    
    echo "✅ $file corrigé"
  else
    echo "⚠️  $file non trouvé"
  fi
done

echo "✨ Correction terminée!"
