import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MdPlace } from "react-icons/md";
import { renderToString } from "react-dom/server";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://hvjzemvfstwwhhahecwu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2anplbXZmc3R3d2hoYWhlY3d1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5MTQ4Mjc3MCwiZXhwIjoyMDA3MDU4NzcwfQ.6jThCX2eaUjl2qt4WE3ykPbrh6skE8drYcmk-UCNDSw';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const createCustomIcon = () => {
  const placeIconHtml = renderToString(<MdPlace style={{ fontSize: '24px', color: 'red' }} />);
  // Only include the MdPlace icon
  return L.divIcon({
    html: placeIconHtml,
    className: 'custom-leaflet-icon',
    iconSize: L.point(30, 30),
    iconAnchor: [15, 30],
    popupAnchor: [0, -50]
  });
};

const MapComponent = () => {
  const mapRef = useRef(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch users from the database
    const fetchUsers = async () => {
      let { data: usersOnGround, error } = await supabase
        .from('vianney_teams')
        .select('*');

      if (error) {
        console.error('Error fetching users:', error);
      } else {
        setUsers(usersOnGround);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([0, 0], 13); // Initial map setup
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: ''
      }).addTo(mapRef.current);
    }

    if (users.length > 0) {
      mapRef.current.setView([users[0].latitude, users[0].longitude], 13);

      users.forEach(user => {
        if (user) {
          // Updated HTML content for the popup
          const popupContent = `
            <div>
              <strong>${user.first_name} ${user.family_name}</strong>
              ${user.photo_profile_url ? `<br/><img src="${user.photo_profile_url}" alt="${user.first_name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 50%; margin-top: 5px;"/>` : ''}
            </div>
          `;

          const customIcon = createCustomIcon(); // Custom icon without user photo

          L.marker([user.latitude, user.longitude], { icon: customIcon })
            .addTo(mapRef.current)
            .bindPopup(popupContent);
        }
      });
    }
  }, [users]);

  return <div id="map" style={{ height: '500px', width: '100%' }}></div>;
};

export default MapComponent;