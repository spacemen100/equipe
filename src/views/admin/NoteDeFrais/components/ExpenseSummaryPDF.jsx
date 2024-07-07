import React, { useEffect, useState } from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import supabase from './../../../../supabaseClient';

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
    width: '50%',
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
  explanation: {
    marginTop: 20,
    fontSize: 10,
    textAlign: 'center',
    color: 'grey',
  },
});

const ExpenseSummaryPDF = ({ data, trips, expenses }) => {
  const [eventName, setEventName] = useState('');

  useEffect(() => {
    const fetchEventName = async () => {
      if (data.event_id) {
        const { data: event, error } = await supabase
          .from('vianney_event')
          .select('event_name')
          .eq('event_id', data.event_id)
          .single();

        if (error) {
          console.error('Error fetching event name:', error);
        } else {
          setEventName(event.event_name);
        }
      }
    };

    fetchEventName();
  }, [data.event_id]);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Note de frais</Text>
        <View style={styles.section}>
          <Text>Identité du bénévole : {data.volunteer_last_name} {data.volunteer_first_name}</Text>
          <Text>Pôle & service : {data.pole}</Text>
          <Text>Adresse postale : {data.address}</Text>
          <Text>Adresse Mail : {data.email}</Text>
          <Text>Numéro de téléphone : {data.phone_number}</Text>
          <Text>Évènement : {eventName}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>Déclaration de frais kilométriques</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={styles.tableCol}><Text style={styles.tableCell}>Motif</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>Distance parcourue</Text></View>
            </View>
            {trips.map((trip, index) => (
              <View style={styles.tableRow} key={index}>
                <View style={styles.tableCol}><Text style={styles.tableCell}>{trip.name}</Text></View>
                <View style={styles.tableCol}><Text style={styles.tableCell}>{trip.distance} km</Text></View>
              </View>
            ))}
          </View>
          <Text style={styles.explanation}>*Les frais kilométriques sont calculés selon la formule : distance parcourue (km) × 0,515 €</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>Déclaration de frais</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={styles.tableCol}><Text style={styles.tableCell}>Motif</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>Montant</Text></View>
            </View>
            {expenses.map((expense, index) => (
              <View style={styles.tableRow} key={index}>
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
};

export default ExpenseSummaryPDF;
