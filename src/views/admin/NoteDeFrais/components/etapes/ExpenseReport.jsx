import React from 'react';
import { Document, Page, Text, View, StyleSheet} from '@react-pdf/renderer';

// Define styles
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 12,
    padding: 30,
    flexDirection: 'column',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  table: {
    display: 'table',
    width: 'auto',
    margin: '10px 0',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCol: {
    width: '33.33%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    textAlign: 'center',
    padding: 5,
  },
  tableCell: {
    margin: 'auto',
    marginTop: 5,
    fontSize: 10,
  },
  total: {
    marginTop: 20,
    textAlign: 'right',
    fontSize: 14,
  },
});

// Create Document Component
const ExpenseReport = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Note de frais</Text>
      <View style={styles.section}>
        <Text>Identité du bénévole : {data.volunteer_last_name} {data.volunteer_first_name}</Text>
        <Text>Pôle & service : {data.pole}</Text>
        <Text>Adresse postale : {data.address}</Text>
        <Text>Adresse Mail : {data.email}</Text>
        <Text>Numéro de téléphone : {data.phone_number}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Déclaration de frais kilométriques</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableCol}><Text style={styles.tableCell}>Date</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>Motif</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>Distance parcourue</Text></View>
          </View>
          {data.trips && JSON.parse(data.trips).map((trip, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{trip.date}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{trip.name}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{trip.distance} km</Text></View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Déclaration de frais</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableCol}><Text style={styles.tableCell}>Date</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>Motif</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>Montant</Text></View>
          </View>
          {data.expenses && JSON.parse(data.expenses).map((expense, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{expense.date}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{expense.name}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{expense.cost ? expense.cost.toFixed(2) : 'N/A'} €</Text></View>
            </View>
          ))}
        </View>
      </View>

      <Text style={styles.total}>Total: {data.total} €</Text>
    </Page>
  </Document>
);

export default ExpenseReport;