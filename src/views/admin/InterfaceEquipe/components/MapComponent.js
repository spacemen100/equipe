import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MdDeleteForever, MdOutlineZoomInMap, MdOutlineZoomOutMap } from "react-icons/md"; 
import { renderToString } from "react-dom/server";
import { Box, Button } from '@chakra-ui/react';
import { MdPlace } from "react-icons/md";
import { supabase } from './../../../../supabaseClient';
import { useHistory, useLocation } from "react-router-dom";

const createCustomIcon = () => {
  const placeIconHtml = renderToString(<MdPlace style={{ fontSize: '24px', color: 'red' }} />);
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
  const [itineraries, setItineraries] = useState([]);
    // eslint-disable-next-line
  const [areas, setAreas] = useState([]);
  const [mapHeight, setMapHeight] = useState('800px');
  const history = useHistory();
  const location = useLocation();

  const buttonText = location.pathname === "/admin/zoomed-map" ? 
    <MdOutlineZoomInMap /> : 
    <MdOutlineZoomOutMap />;

  const toggleMapView = () => {
    if (location.pathname === "/admin/zoomed-map") {
      history.push("/admin/map");
    } else {
      history.push("/admin/zoomed-map");
    }
  };

  useEffect(() => {
    const updateMapHeight = () => {
      const newHeight = `${window.innerHeight - 60}px`;
      setMapHeight(newHeight);
    };

    updateMapHeight();
    window.addEventListener('resize', updateMapHeight);
    return () => window.removeEventListener('resize', updateMapHeight);
  }, []);

  useEffect(() => {
    const initializeMap = () => {
      if (mapRef.current && mapRef.current._leaflet_id) {
        return; // If map is already initialized, return
      }

      // Create a new map instance
      mapRef.current = L.map('map').setView([45, 4.7], 7);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: ''
      }).addTo(mapRef.current);
    };

    initializeMap();
  }, []);

  useEffect(() => {
    const fetchAndDisplayAreas = async () => {
      const { data: fetchedAreas, error } = await supabase
        .from('vianney_areas')
        .select('*');

      if (error) {
        console.error('Erreur lors de la récupération des aires:', error);
        return;
      }

      setAreas(fetchedAreas);

      let mapInstance = mapRef.current;
      if (!mapInstance) {
        console.log('Instance de carte non initialisée.');
        return;
      }

      mapInstance.eachLayer(layer => {
        if (layer instanceof L.Polygon) {
          mapInstance.removeLayer(layer);
        }
      });

      fetchedAreas.forEach(area => {
        const points = [
          [area.point1_lat, area.point1_lon],
          [area.point2_lat, area.point2_lon],
          [area.point3_lat, area.point3_lon],
          [area.point4_lat, area.point4_lon],
        ];

        const polygon = L.polygon(points, { color: 'red' }).addTo(mapInstance);

        const deleteIconHtml = renderToString(<MdDeleteForever style={{ cursor: 'pointer', fontSize: '24px', color: 'red' }} />);
        const popupContent = `
            <div>
              <strong>${area.name}</strong>
              <p>${area.description}</p>
              <div>${deleteIconHtml}</div>
            </div>
          `;

        polygon.bindPopup(popupContent);
      });
    };

    fetchAndDisplayAreas();
  }, []);

  useEffect(() => {
    const fetchItineraries = async () => {
      const { data: fetchedItineraries, error } = await supabase
        .from('vianney_itineraries')
        .select('*');

      if (error) {
        console.error('Error fetching itineraries:', error);
      } else {
        setItineraries(fetchedItineraries);
      }
    };

    fetchItineraries();
  }, []);

  useEffect(() => {
    let mapInstance = mapRef.current;

    if (mapInstance) {
      itineraries.forEach(itinerary => {
        if (!itinerary.points || !Array.isArray(itinerary.points)) {
          console.warn(`Itinerary with ID ${itinerary.id} has invalid points data.`);
          return;
        }

        const points = itinerary.points.map(point => [point.latitude, point.longitude]);
        const polyline = L.polyline(points, { color: 'blue' }).addTo(mapInstance);

        const deleteIconHtml = renderToString(
          <MdDeleteForever style={{ cursor: 'pointer', fontSize: '24px', color: 'red' }} />
        );

        const popupContent = `
          <div>
            <strong>${itinerary.name}</strong>
            <p>${itinerary.description}</p>
            <div>${deleteIconHtml}</div>
          </div>
        `;

        polyline.bindPopup(popupContent);
      });
    }

  }, [itineraries]);

  useEffect(() => {
    const fetchAndDisplayTeams = async () => {
      const { data: teams, error } = await supabase
        .from('vianney_teams')
        .select('*');

      if (error) {
        console.error('Erreur lors de la récupération des équipes:', error);
        return;
      }

      let mapInstance = mapRef.current;
      if (!mapInstance) return;

      // Cleanup existing team markers
      mapInstance.eachLayer(layer => {
        if (layer instanceof L.Marker || (layer.options && layer.options.team)) {
          mapInstance.removeLayer(layer);
        }
      });

      teams.forEach(team => {
        if (!team.latitude || !team.longitude) {
          console.warn(`Team with ID ${team.id} has invalid latitude or longitude.`);
          return;
        }

        const teamIcon = createCustomIcon();
        const deleteIconHtml = renderToString(<MdDeleteForever style={{ cursor: 'pointer', fontSize: '24px', color: 'red' }} />);

        // Generate Waze link with GPS coordinates
        const wazeUrl = `https://www.waze.com/ul?ll=${team.latitude},${team.longitude}&navigate=yes`;
        const wazeButtonHtml = `<a href="${wazeUrl}" target="_blank" style="display: inline-block; margin-top: 10px; padding: 5px 10px; background-color: #007aff; color: white; text-align: center; text-decoration: none; border-radius: 5px;">Aller vers Waze</a>`;

        const popupContent = `
          <div>
            <strong>${team.name_of_the_team}</strong>
            ${team.photo_profile_url ? `<br/><img src="${team.photo_profile_url}" alt="${team.name_of_the_team}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 50%; margin-top: 5px;"/>` : ''}
            <div onclick="window.deleteTeam(${team.id})" style="margin-top: 10px;">${deleteIconHtml}</div>
            ${wazeButtonHtml}
          </div>
        `;

        const tooltipContent = `
          <div>
            <strong>${team.name_of_the_team}</strong>
          </div>
        `;

        L.marker([team.latitude, team.longitude], { icon: teamIcon, team: true })
          .addTo(mapInstance)
          .bindPopup(popupContent, {
            permanent: false,
            direction: 'top',
            offset: L.point(0, 40)
          })
          .bindTooltip(tooltipContent, {
            permanent: false,
            direction: 'top',
            offset: L.point(0, -10)
          });
      });
    };

    fetchAndDisplayTeams();
  }, []);

  return (
    <Box pt="10px">
      <Button
        onClick={toggleMapView}
        bg="red.500"
        color="white"
        _hover={{ bg: "red.600" }}
        _active={{ bg: "red.700" }}
      >
        {buttonText}
      </Button>

      <div id="map" style={{ height: mapHeight, width: '100%', zIndex: '0' }}></div>
    </Box>
  );
};

export default MapComponent;
