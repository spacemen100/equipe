import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hvjzemvfstwwhhahecwu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2anplbXZmc3R3d2hoYWhlY3d1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5MTQ4Mjc3MCwiZXhwIjoyMDA3MDU4NzcwfQ.6jThCX2eaUjl2qt4WE3ykPbrh6skE8drYcmk-UCNDSw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define a function to handle real-time updates
const handleRealTimeUpdate = (event, payload) => {
  console.log(`Change in ${event.table}:`, payload);
};

// Enable real-time updates for each table by subscribing to changes
const subscriptions = [];

// Subscribe to changes in the first table
const subscription1 = supabase
  .channel('schema-db-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'vianney_actions',
    },
    payload => handleRealTimeUpdate('vianney_actions', payload)
  )
  .subscribe();

subscriptions.push(subscription1);

// Subscribe to changes in the second table
const subscription2 = supabase
  .channel('schema-db-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'vianney_teams',
    },
    payload => handleRealTimeUpdate('vianney_teams', payload)
  )
  .subscribe();

subscriptions.push(subscription2);

// Subscribe to changes in the third table
const subscription3 = supabase
  .channel('schema-db-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'vianney_alert',
    },
    payload => handleRealTimeUpdate('vianney_alert', payload)
  )
  .subscribe();

subscriptions.push(subscription3);

// Subscribe to changes in the fourth table
const subscription4 = supabase
  .channel('schema-db-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'vianney_alertes_specifiques',
    },
    payload => handleRealTimeUpdate('vianney_alertes_specifiques', payload)
  )
  .subscribe();

subscriptions.push(subscription4);

// Subscribe to changes in the fifth table
const subscription5 = supabase
  .channel('schema-db-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'vianney_event',
    },
    payload => handleRealTimeUpdate('vianney_event', payload)
  )
  .subscribe();

subscriptions.push(subscription5);

// Subscribe to changes in the sixth table
const subscription6 = supabase
  .channel('schema-db-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'vianney_form_utile_salle_de_crise',
    },
    payload => handleRealTimeUpdate('vianney_form_utile_salle_de_crise', payload)
  )
  .subscribe();

subscriptions.push(subscription6);

// Subscribe to changes in the seventh table
const subscription7 = supabase
  .channel('schema-db-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'vianney_pdf_documents',
    },
    payload => handleRealTimeUpdate('vianney_pdf_documents', payload)
  )
  .subscribe();

subscriptions.push(subscription7);

// Subscribe to changes in the eighth table
const subscription8 = supabase
  .channel('schema-db-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'vianney_pdf_documents_salle_de_crise',
    },
    payload => handleRealTimeUpdate('vianney_pdf_documents_salle_de_crise', payload)
  )
  .subscribe();

subscriptions.push(subscription8);

// Subscribe to changes in the ninth table
const subscription9 = supabase
  .channel('schema-db-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'vianney_textarea',
    },
    payload => handleRealTimeUpdate('vianney_textarea', payload)
  )
  .subscribe();

subscriptions.push(subscription9);

// Subscribe to changes in the tenth table
const subscription10 = supabase
  .channel('schema-db-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'vianney_textarea_salle_de_crise',
    },
    payload => handleRealTimeUpdate('vianney_textarea_salle_de_crise', payload)
  )
  .subscribe();

subscriptions.push(subscription10);

// You can continue adding subscriptions for each table as needed

// Don't forget to unsubscribe from each subscription when you're done listening for updates
// subscriptions.forEach(subscription => subscription.unsubscribe());

export default supabase;
export { supabase, supabaseUrl };