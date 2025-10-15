import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Card, Text, Button, ActivityIndicator, FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

export const DashboardScreen = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    unpaidInvoices: 0,
    cashBalance: 0,
    mobileMoneyBalance: 0,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Implémenter le rafraîchissement des données
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Carte Trésorerie */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">💰 Trésorerie</Text>
            <View style={styles.row}>
              <View style={styles.col}>
                <Text variant="bodySmall">Espèces</Text>
                <Text variant="headlineSmall" style={styles.amount}>
                  {metrics.cashBalance.toLocaleString()} FCFA
                </Text>
              </View>
              <View style={styles.col}>
                <Text variant="bodySmall">Mobile Money</Text>
                <Text variant="headlineSmall" style={styles.amount}>
                  {metrics.mobileMoneyBalance.toLocaleString()} FCFA
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Carte Revenus */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">📈 Revenus du mois</Text>
            <Text variant="headlineLarge" style={styles.revenue}>
              {metrics.totalRevenue.toLocaleString()} FCFA
            </Text>
          </Card.Content>
        </Card>

        {/* Carte Factures Impayées */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">⚠️ Factures Impayées</Text>
            <Text variant="headlineSmall" style={styles.unpaid}>
              {metrics.unpaidInvoices.toLocaleString()} FCFA
            </Text>
            <Button mode="text" onPress={() => navigation.navigate('Invoices' as never)}>
              Voir les factures
            </Button>
          </Card.Content>
        </Card>

        {/* Actions Rapides */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">⚡ Actions Rapides</Text>
            <View style={styles.actions}>
              <Button
                mode="contained"
                icon="plus"
                onPress={() => navigation.navigate('CreateInvoice' as never)}
                style={styles.actionButton}
              >
                Nouvelle Facture
              </Button>
              <Button
                mode="outlined"
                icon="cash"
                onPress={() => navigation.navigate('Payments' as never)}
                style={styles.actionButton}
              >
                Encaisser
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Alertes */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">🔔 Alertes</Text>
            <Text variant="bodyMedium" style={styles.alert}>
              • 3 factures en retard de paiement
            </Text>
            <Text variant="bodyMedium" style={styles.alert}>
              • Synchronisation en attente (5 changements)
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* FAB pour nouvelle facture */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('CreateInvoice' as never)}
        label="Nouvelle Facture"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 16,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    marginTop: 12,
  },
  col: {
    flex: 1,
  },
  amount: {
    color: '#0066CC',
    fontWeight: 'bold',
    marginTop: 4,
  },
  revenue: {
    color: '#34C759',
    fontWeight: 'bold',
    marginTop: 8,
  },
  unpaid: {
    color: '#FF3B30',
    fontWeight: 'bold',
    marginTop: 8,
  },
  actions: {
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    marginBottom: 8,
  },
  alert: {
    marginTop: 8,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#0066CC',
  },
});
