import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { renderToString } from "react-dom/server";
import {
  Box, Button, useToast, CloseButton, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader,
  AlertDialogContent, AlertDialogOverlay, Input, VStack, HStack, FormControl, FormLabel, Text, Tooltip, Table,
  Thead, Tbody, Tr, Th, Td, TableContainer
} from '@chakra-ui/react';
import { MdPlace, MdOutlineZoomInMap, MdOutlineZoomOutMap, MdDeleteForever } from "react-icons/md";
import { useEvent } from './../../../../EventContext';
import { supabase } from './../../../../supabaseClient';
import { useHistory, useLocation } from "react-router-dom";
import 'leaflet-draw';
import 'leaflet-routing-machine';
import { useGPSPosition } from './../../../../GPSPositionContext';
import ToggleComponentGpsPointForm from '../ToggleComponentGpsPointForm';

const createTeamIcon = () => {
  const placeIconHtml = renderToString(<MdPlace style={{ fontSize: '24px', color: 'red' }} />);
  return L.divIcon({
    html: placeIconHtml,
    className: 'custom-leaflet-icon',
    iconSize: L.point(30, 30),
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

// eslint-disable-next-line
const createCustomIcon = () => {
  const placeIconHtml = renderToString(<MdPlace style={{ fontSize: '24px', color: '#34A853' }} />);
  return L.divIcon({
    html: placeIconHtml,
    className: 'custom-leaflet-icon',
    iconSize: L.point(30, 30),
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

const formatItineraryText = (itineraryText) => {
  if (!itineraryText) return [];
  // eslint-disable-next-line
  const [distance, duration, ...steps] = itineraryText.split(/Instructions:|\s->\s/);
  return steps.map((step, index) => ({
    id: index + 1,
    step,
  }));
};

const MapComponent = () => {
  const mapRef = useRef(null);
  const routingControlRef = useRef(null);
  const gpsPosition = useGPSPosition();
  // eslint-disable-next-line
  const [mapHeight, setMapHeight] = useState('800px');
  const { selectedEventId } = useEvent();
  const history = useHistory();
  const location = useLocation();
  const toast = useToast();
  const [newElementColor, setNewElementColor] = useState('#3388ff');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [elementToDelete, setElementToDelete] = useState(null);
  const cancelRef = useRef();
  // eslint-disable-next-line
  const [teamsList, setTeamsList] = useState([]); 

  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [newElementName, setNewElementName] = useState('');
  const [pendingLayer, setPendingLayer] = useState(null);
  const [pendingType, setPendingType] = useState(null);

  const [startLat, setStartLat] = useState('');
  const [startLng, setStartLng] = useState('');
  const [endLat, setEndLat] = useState('');
  const [endLng, setEndLng] = useState('');
  // eslint-disable-next-line
  const [itineraryText, setItineraryText] = useState('');
  const [latestItineraryText, setLatestItineraryText] = useState([]);
  const [selectingStart, setSelectingStart] = useState(false);
  const [selectingEnd, setSelectingEnd] = useState(false);
  const [showRouteDetails, setShowRouteDetails] = useState(false);
  const [showItineraryDetails, setShowItineraryDetails] = useState(false);

  const buttonText = location.pathname === "/admin/zoomed-map" ?
    <MdOutlineZoomInMap /> :
    <MdOutlineZoomOutMap />;
  const isButtonVisible = location.pathname !== "/admin/zoomed-map";

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const { data: eventDetails, error } = await supabase
          .from('vianney_event') // Ensure your table name is correct
          .select('latitude, longitude')
          .eq('event_id', selectedEventId) // Replace with your selectedEventId
          .single();

        if (error) {
          throw error;
        }

        // Check if latitude and longitude are null
        if (eventDetails.latitude === null && eventDetails.longitude === null && gpsPosition && mapRef.current) {
          const { latitude, longitude } = gpsPosition;
          mapRef.current.setView([latitude, longitude], 13); // Set the view using GPS coordinates
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des détails de l\'événement:', error.message);
      }
    };

    if (selectedEventId) {
      fetchEventDetails(); // Only fetch details if an event ID is selected
    }
  }, [selectedEventId, gpsPosition]);

  const toggleMapView = () => {
    if (location.pathname === "/admin/zoomed-map") {
      history.push("/admin/map");
    } else {
      history.push("/admin/zoomed-map");
    }
  };

  const closeModal = () => {
    if (location.pathname === "/admin/zoomed-map") {
      history.push("/admin/map");
    }
  };

  const openDeleteDialog = (layer, type, id) => {
    setElementToDelete({ layer, type, id });
    setIsDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDialogOpen(false);
    setElementToDelete(null);
  };

  const confirmDelete = async () => {
    const { layer, type, id } = elementToDelete;
    try {
      let tableName = '';
      if (type === 'marker') tableName = 'vianney_drawn_markers';
      if (type === 'polyline') tableName = 'vianney_drawn_polylines';
      if (type === 'polygon') tableName = 'vianney_drawn_polygons';
      if (type === 'circlemarker') tableName = 'vianney_drawn_circle_markers';

      const { error } = await supabase
        .from(tableName)
        .delete()
        .match({ id, event_id: selectedEventId });

      if (error) throw error;

      mapRef.current.removeLayer(layer);
      toast({
        title: 'Élément supprimé',
        description: 'L\'élément a été supprimé avec succès.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'élément. Veuillez réessayer.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      closeDeleteDialog();
    }
  };

  const openNameModal = (layer, type) => {
    setPendingLayer(layer);
    setPendingType(type);
    setIsNameModalOpen(true);
  };

  const handleAddElement = async (layer, type, nameElement) => {
    let payload = {
      event_id: selectedEventId,
      name_element: nameElement || null,
      couleur: newElementColor, // Ajout de la couleur au payload
    };

    try {
      let insertedItem;
      if (type === 'marker') {
        payload = {
          ...payload,
          latitude: layer.getLatLng().lat,
          longitude: layer.getLatLng().lng,
        };
        const { data, error } = await supabase.from('vianney_drawn_markers').insert(payload).select().single();
        if (error) throw error;
        insertedItem = data;

        layer.setIcon(createCustomIcon(newElementColor));

        const wazeUrl = `https://www.waze.com/ul?ll=${layer.getLatLng().lat},${layer.getLatLng().lng}&navigate=yes`;
        const wazeButtonHtml = `<a href="${wazeUrl}" target="_blank" style="display: inline-block; margin-top: 10px; padding: 5px 10px; background-color: #007aff; color: white; text-align: center; text-decoration: none; border-radius: 5px;">Se rendre sur place</a>`;
        const deleteButtonHtml = renderToString(<MdDeleteForever style={{ cursor: 'pointer', fontSize: '24px', color: 'red' }} />);

        const popupContent = `
          <div>
            <strong>${nameElement || 'Élément'}</strong>
            <div onclick="window.deleteItem('${type}', '${insertedItem.id}')">${deleteButtonHtml}</div>
            ${wazeButtonHtml}
          </div>
        `;

        layer.bindPopup(popupContent).bindTooltip(nameElement || 'Élément');
      } else if (type === 'polyline') {
        const points = layer.getLatLngs().map(latlng => ({
          latitude: latlng.lat,
          longitude: latlng.lng,
        }));
        payload = {
          ...payload,
          points,
        };
        const { data, error } = await supabase.from('vianney_drawn_polylines').insert(payload).select().single();
        if (error) throw error;
        insertedItem = data;

        layer.setStyle({ color: newElementColor });
        layer.bindTooltip(nameElement || 'Ligne').on('click', () => openDeleteDialog(layer, type, insertedItem.id));
      } else if (type === 'polygon') {
        const points = layer.getLatLngs()[0].map(latlng => ({
          latitude: latlng.lat,
          longitude: latlng.lng,
        }));
        payload = {
          ...payload,
          points,
        };
        const { data, error } = await supabase.from('vianney_drawn_polygons').insert(payload).select().single();
        if (error) throw error;
        insertedItem = data;

        layer.setStyle({ color: newElementColor });

        const firstPoint = points[0];
        const wazeUrl = `https://www.waze.com/ul?ll=${firstPoint.latitude},${firstPoint.longitude}&navigate=yes`;
        const wazeButtonHtml = `<a href="${wazeUrl}" target="_blank" style="display: inline-block; margin-top: 10px; padding: 5px 10px; background-color: #007aff; color: white; text-align: center; text-decoration: none; border-radius: 5px;">Se rendre sur place</a>`;
        const deleteButtonHtml = renderToString(<MdDeleteForever style={{ cursor: 'pointer', fontSize: '24px', color: 'red' }} />);

        const popupContent = `
          <div>
            <strong>${nameElement || 'Polygone'}</strong>
            <div onclick="window.deleteItem('${type}', '${insertedItem.id}')">${deleteButtonHtml}</div>
            ${wazeButtonHtml}
          </div>
        `;

        layer.bindPopup(popupContent).bindTooltip(nameElement || 'Polygone').on('click', () => openDeleteDialog(layer, type, insertedItem.id));
      } else if (type === 'circlemarker') {
        payload = {
          ...payload,
          latitude: layer.getLatLng().lat,
          longitude: layer.getLatLng().lng,
          radius: layer.getRadius(),
        };
        const { data, error } = await supabase.from('vianney_drawn_circle_markers').insert(payload).select().single();
        if (error) throw error;
        insertedItem = data;

        layer.setStyle({ color: newElementColor });

        const wazeUrl = `https://www.waze.com/ul?ll=${layer.getLatLng().lat},${layer.getLatLng().lng}&navigate=yes`;
        const wazeButtonHtml = `<a href="${wazeUrl}" target="_blank" style="display: inline-block; margin-top: 10px; padding: 5px 10px; background-color: #007aff; color: white; text-align: center; text-decoration: none; border-radius: 5px;">Se rendre sur place</a>`;
        const deleteButtonHtml = renderToString(<MdDeleteForever style={{ cursor: 'pointer', fontSize: '24px', color: 'red' }} />);

        const popupContent = `
          <div>
            <strong>${nameElement || 'Cercle'}</strong>
            <div onclick="window.deleteItem('${type}', '${insertedItem.id}')">${deleteButtonHtml}</div>
            ${wazeButtonHtml}
          </div>
        `;

        layer.bindPopup(popupContent).bindTooltip(nameElement || 'Cercle');
      }

      window.deleteItem = (type, id) => openDeleteDialog(layer, type, id);

      mapRef.current.addLayer(layer);
      toast({
        title: 'Objet ajouté',
        description: `L'objet a été ajouté avec succès.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'objet:', error.message);
      toast({
        title: 'Erreur',
        description: "Impossible d'ajouter l'objet. Veuillez réessayer.",
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const displayRoute = useCallback((route) => {
    return new Promise((resolve) => {
      if (routingControlRef.current) {
        mapRef.current.removeControl(routingControlRef.current);
      }

      const startPoint = L.latLng(route.start_latitude, route.start_longitude);
      const endPoint = L.latLng(route.end_latitude, route.end_longitude);

      routingControlRef.current = L.Routing.control({
        waypoints: [startPoint, endPoint],
        routeWhileDragging: false,
        show: showRouteDetails,
        createMarker: function () { return null; },
        lineOptions: {
          styles: [{ color: '#34A853', weight: 4 }]
        },
        language: 'fr',
        router: new L.Routing.OSRMv1({
          language: 'fr',
          profile: 'car',
        }),
        formatter: new L.Routing.Formatter({
          language: 'fr'
        })
      }).addTo(mapRef.current);

      routingControlRef.current.on('routesfound', function (e) {
        const routes = e.routes;
        const summary = routes[0].summary;
        const instructions = routes[0].instructions.map(instr => instr.text).join(' -> ');

        const fullItineraryText = `Distance: ${summary.totalDistance} m, Durée: ${summary.totalTime} s. Instructions: ${instructions}`;
        console.log(fullItineraryText);

        resolve();
      });
    });
  }, [showRouteDetails]);

  const loadAndDisplaySavedRoutes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('vianney_itineraire_carte')
        .select('*')
        .eq('event_id', selectedEventId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        throw error;
      }

      if (data.length === 0) {
        console.log("Aucun itinéraire trouvé pour cet événement.");
        return;
      }

      const lastRoute = data[0];
      setLatestItineraryText(formatItineraryText(lastRoute.itinerary_text));
      await displayRoute(lastRoute);

    } catch (error) {
      console.error('Erreur lors du chargement des itinéraires depuis la base de données:', error.message);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les itinéraires depuis la base de données. Veuillez réessayer.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [displayRoute, selectedEventId, toast]);

  const handleRouteCalculation = () => {
    if (!mapRef.current) return;

    if (routingControlRef.current) {
      mapRef.current.removeControl(routingControlRef.current);
    }

    const startPoint = L.latLng(parseFloat(startLat), parseFloat(startLng));
    const endPoint = L.latLng(parseFloat(endLat), parseFloat(endLng));

    routingControlRef.current = L.Routing.control({
      waypoints: [startPoint, endPoint],
      routeWhileDragging: true,
      show: showRouteDetails,
      createMarker: function () { return null; },
      lineOptions: {
        styles: [{ color: '#6FA1EC', weight: 4 }]
      },
      language: 'fr',
      router: new L.Routing.OSRMv1({
        language: 'fr',
        profile: 'car',
      }),
      formatter: new L.Routing.Formatter({
        language: 'fr'
      })
    }).addTo(mapRef.current);

    routingControlRef.current.on('routesfound', async function (e) {
      const routes = e.routes;
      const summary = routes[0].summary;
      const instructions = routes[0].instructions.map(instr => instr.text).join(' -> ');

      const fullItineraryText = `Distance: ${summary.totalDistance} m, Durée: ${summary.totalTime} s. Instructions: ${instructions}`;
      setItineraryText(fullItineraryText);

      await saveItinerary(startLat, startLng, endLat, endLng, fullItineraryText);

      loadAndDisplaySavedRoutes();
    });
  };

  const saveItinerary = async (startLat, startLng, endLat, endLng, itineraryText) => {
    try {
      // eslint-disable-next-line
      const { data, error } = await supabase
        .from('vianney_itineraire_carte')
        .insert([
          {
            event_id: selectedEventId,
            start_latitude: startLat,
            start_longitude: startLng,
            end_latitude: endLat,
            end_longitude: endLng,
            itinerary_text: itineraryText
          }
        ])
        .single();

      if (error) throw error;

      toast({
        title: 'Itinéraire enregistré',
        description: 'L\'itinéraire a été enregistré avec succès dans la base de données.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer l\'itinéraire. Veuillez réessayer.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const deleteLastItinerary = async () => {
    try {
      const { data, error } = await supabase
        .from('vianney_itineraire_carte')
        .select('id')
        .eq('event_id', selectedEventId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      if (data) {
        const { error: deleteError } = await supabase
          .from('vianney_itineraire_carte')
          .delete()
          .eq('id', data.id);

        if (deleteError) throw deleteError;

        toast({
          title: 'Itinéraire supprimé',
          description: 'Le dernier itinéraire a été supprimé avec succès.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        if (routingControlRef.current) {
          mapRef.current.removeControl(routingControlRef.current);
          routingControlRef.current = null;
        }

        setLatestItineraryText([]);
      } else {
        toast({
          title: 'Aucun itinéraire trouvé',
          description: "Il n'y a pas d'itinéraire à supprimer.",
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le dernier itinéraire. Veuillez réessayer.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };



  useEffect(() => {
    if (!selectedEventId) {
      toast({
        title: 'Erreur',
        description: "L'ID de l'événement est manquant. Impossible d'ajouter l'objet.",
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const fetchEventDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('vianney_event')
          .select('latitude, longitude')
          .eq('event_id', selectedEventId)
          .single();

        if (error) throw error;

        let mapInstance = mapRef.current;

        if (!mapInstance) {
          // Default map initialization with fallback to a general view
          const defaultLatLng = [45, 4.7];
          const latLng = data.latitude && data.longitude ? [data.latitude, data.longitude] : defaultLatLng;

          mapInstance = L.map('map').setView(latLng, 13); // Zoom level set to 13 for a closer view
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: ''
          }).addTo(mapInstance);

          const drawControl = new L.Control.Draw({
            draw: {
              polygon: true,
              polyline: true,
              marker: true,
              circle: false,
              rectangle: false,
              circlemarker: true,
            },
            edit: {
              featureGroup: new L.FeatureGroup().addTo(mapInstance),
            },
          });
          mapInstance.addControl(drawControl);
          mapRef.current = mapInstance;

          mapInstance.on(L.Draw.Event.CREATED, (event) => {
            const layer = event.layer;
            const type = event.layerType;

            if (!selectedEventId) {
              toast({
                title: 'Erreur',
                description: "L'ID de l'événement est manquant. Impossible d'ajouter l'objet.",
                status: 'error',
                duration: 5000,
                isClosable: true,
              });
              return;
            }

            openNameModal(layer, type);
          });
        }

      } catch (error) {
        console.error('Erreur lors de la récupération des détails de l\'événement:', error.message);
        toast({
          title: 'Erreur',
          description: 'Impossible de récupérer les détails de l\'événement. Veuillez réessayer.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchEventDetails();
    loadAndDisplaySavedRoutes(); // Load saved routes once the map is set up

  }, [selectedEventId, toast, loadAndDisplaySavedRoutes]);

  const teamLayersRef = useRef([]); // Référence pour les couches des équipes
const itemLayersRef = useRef([]); // Référence pour les couches des items

useEffect(() => {
  if (!selectedEventId) {
    console.error('selectedEventId is not defined.');
    return;
  }

  const fetchAndDisplayTeams = async () => {
    if (!mapRef.current) {
      console.warn("Map is not initialized yet.");
      return;
    }

    try {
      const { data: teams, error } = await supabase
        .from('vianney_teams')
        .select('*')
        .eq('event_id', selectedEventId);

      if (error) {
        console.error('Erreur lors de la récupération des équipes:', error);
        return;
      }

      // Mettre à jour l'état de la liste des équipes
      setTeamsList(teams);

      // Supprimez uniquement les couches des équipes existantes
      teamLayersRef.current.forEach(layer => {
        mapRef.current.removeLayer(layer);
      });
      teamLayersRef.current = [];

      teams.forEach(team => {
        const teamIcon = createTeamIcon();
        const deleteIconHtml = renderToString(<MdDeleteForever style={{ cursor: 'pointer', fontSize: '24px', color: 'red' }} />);

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

        const tooltipContent = team.name_of_the_team;

        const marker = L.marker([team.latitude, team.longitude], { icon: teamIcon, team: true });

        marker.addTo(mapRef.current)
          .bindPopup(popupContent, {
            offset: L.point(0, -30),
            direction: 'top'
          })
          .bindTooltip(tooltipContent, {
            permanent: false,
            direction: 'top',
            offset: L.point(0, -30)
          });

        // Ajouter le marqueur à la référence
        teamLayersRef.current.push(marker);
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des équipes:', error.message);
    }
  };

  // Appeler la fonction une première fois immédiatement
  fetchAndDisplayTeams();

  // Mettre à jour les équipes toutes les 5 secondes
  const intervalId = setInterval(fetchAndDisplayTeams, 2000);

  // Nettoyer l'intervalle à la fin du cycle de vie du composant
  return () => clearInterval(intervalId);
}, [selectedEventId]);

useEffect(() => {
  if (!selectedEventId) {
    console.error('selectedEventId is not defined.');
    return;
  }

  const fetchAndDisplayDrawnItems = async () => {
    if (!mapRef.current) {
      console.warn("Map is not initialized yet.");
      return;
    }

    try {
      const { data: markers, error: markerError } = await supabase
        .from('vianney_drawn_markers')
        .select('*')
        .eq('event_id', selectedEventId);

      if (markerError) {
        console.error('Erreur lors de la récupération des marqueurs:', markerError);
        return;
      }

      const { data: polylines, error: polylineError } = await supabase
        .from('vianney_drawn_polylines')
        .select('*')
        .eq('event_id', selectedEventId);

      if (polylineError) {
        console.error('Erreur lors de la récupération des polylignes:', polylineError);
        return;
      }

      const { data: polygons, error: polygonError } = await supabase
        .from('vianney_drawn_polygons')
        .select('*')
        .eq('event_id', selectedEventId);

      if (polygonError) {
        console.error('Erreur lors de la récupération des polygones:', polygonError);
        return;
      }

      const { data: circleMarkers, error: circleMarkerError } = await supabase
        .from('vianney_drawn_circle_markers')
        .select('*')
        .eq('event_id', selectedEventId);

      if (circleMarkerError) {
        console.error('Erreur lors de la récupération des cercles:', circleMarkerError);
        return;
      }

      // Supprimez uniquement les couches des items existants
      itemLayersRef.current.forEach(layer => {
        mapRef.current.removeLayer(layer);
      });
      itemLayersRef.current = [];

      // Ajouter les marqueurs
      markers.forEach(marker => {
        const layer = L.marker([marker.latitude, marker.longitude], { icon: createCustomIcon(marker.couleur) });
        const wazeUrl = `https://www.waze.com/ul?ll=${marker.latitude},${marker.longitude}&navigate=yes`;
        const wazeButtonHtml = `<a href="${wazeUrl}" target="_blank" style="display: inline-block; margin-top: 10px; padding: 5px 10px; background-color: #007aff; color: white; text-align: center; text-decoration: none; border-radius: 5px;">Se rendre sur place</a>`;
        const deleteButtonHtml = renderToString(<MdDeleteForever style={{ cursor: 'pointer', fontSize: '24px', color: 'red' }} />);

        const popupContent = `
          <div>
            <strong>${marker.name_element || 'Marker'}</strong>
            <div onclick="window.deleteItem('marker', '${marker.id}')">${deleteButtonHtml}</div>
            ${wazeButtonHtml}
          </div>
        `;

        layer.bindPopup(popupContent).bindTooltip(marker.name_element || 'Marker');
        window.deleteItem = (type, id) => openDeleteDialog(layer, type, id);

        layer.addTo(mapRef.current);
        itemLayersRef.current.push(layer);
      });

      polylines.forEach(polyline => {
        const points = polyline.points.map(point => [point.latitude, point.longitude]);
        const layer = L.polyline(points, { color: polyline.couleur });
        const nameElement = polyline.name_element || 'Polyline';
        layer.bindTooltip(nameElement);
        layer.addTo(mapRef.current);
        itemLayersRef.current.push(layer);
      });
      
      // Ajouter les polygones
      polygons.forEach(polygon => {
        const points = polygon.points.map(point => [point.latitude, point.longitude]);
        const layer = L.polygon(points, { color: polygon.couleur });
        const nameElement = polygon.name_element || 'Polygon';
      
        const firstPoint = points[0];
        const wazeUrl = `https://www.waze.com/ul?ll=${firstPoint[0]},${firstPoint[1]}&navigate=yes`;
        const wazeButtonHtml = `<a href="${wazeUrl}" target="_blank" style="display: inline-block; margin-top: 10px; padding: 5px 10px; background-color: #007aff; color: white; text-align: center; text-decoration: none; border-radius: 5px;">Se rendre sur place</a>`;
        const deleteButtonHtml = renderToString(<MdDeleteForever style={{ cursor: 'pointer', fontSize: '24px', color: 'red' }} />);
      
        const popupContent = `
          <div>
            <strong>${nameElement}</strong>
            <div onclick="window.deleteItem('polygon', '${polygon.id}')">${deleteButtonHtml}</div>
            ${wazeButtonHtml}
          </div>
        `;
      
        layer.bindPopup(popupContent).bindTooltip(nameElement);
        layer.addTo(mapRef.current);
        itemLayersRef.current.push(layer);
      });

      // Ajouter les cercles
      circleMarkers.forEach(circleMarker => {
        const layer = L.circleMarker([circleMarker.latitude, circleMarker.longitude], {
          radius: circleMarker.radius,
          color: circleMarker.couleur,
        });
        const wazeUrl = `https://www.waze.com/ul?ll=${circleMarker.latitude},${circleMarker.longitude}&navigate=yes`;
        const wazeButtonHtml = `<a href="${wazeUrl}" target="_blank" style="display: inline-block; margin-top: 10px; padding: 5px 10px; background-color: #007aff; color: white; text-align: center; text-decoration: none; border-radius: 5px;">Se rendre sur place</a>`;
        const deleteButtonHtml = renderToString(<MdDeleteForever style={{ cursor: 'pointer', fontSize: '24px', color: 'red' }} />);

        const popupContent = `
          <div>
            <strong>${circleMarker.name_element || 'CircleMarker'}</strong>
            <div onclick="window.deleteItem('circlemarker', '${circleMarker.id}')">${deleteButtonHtml}</div>
            ${wazeButtonHtml}
          </div>
        `;

        layer.bindPopup(popupContent).bindTooltip(circleMarker.name_element || 'CircleMarker');
        window.deleteItem = (type, id) => openDeleteDialog(layer, type, id);

        layer.addTo(mapRef.current);
        itemLayersRef.current.push(layer);
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des items:', error.message);
    }
  };

  // Exécuter une première fois
  fetchAndDisplayDrawnItems();

  // Mettre à jour les items toutes les 10 secondes
  const intervalId = setInterval(fetchAndDisplayDrawnItems, 5000);

  // Nettoyer l'intervalle lors du démontage du composant
  return () => clearInterval(intervalId);
}, [selectedEventId]);  
  const createCustomIcon = (color) => {
    const placeIconHtml = renderToString(<MdPlace style={{ fontSize: '24px', color: color }} />);
    return L.divIcon({
      html: placeIconHtml,
      className: 'custom-leaflet-icon',
      iconSize: L.point(30, 30),
      iconAnchor: [15, 30],
      popupAnchor: [0, -30],
    });
  };

  const [startMarker, setStartMarker] = useState(null);
  const [endMarker, setEndMarker] = useState(null);
  // Centrer la carte sur la position de l'équipe
  const centerMapOnPosition = (latitude, longitude) => {
    if (mapRef.current) {
      mapRef.current.setView([latitude, longitude], 13); // Ajuster le zoom si nécessaire
    }
  };

  useEffect(() => {
    if (mapRef.current) {
      const handleStartSelection = (e) => {
        if (selectingStart) {
          setStartLat(e.latlng.lat);
          setStartLng(e.latlng.lng);

          if (startMarker) {
            mapRef.current.removeLayer(startMarker);
          }

          const marker = L.marker([e.latlng.lat, e.latlng.lng], { icon: createCustomIcon() }).addTo(mapRef.current);
          setStartMarker(marker);

          setSelectingStart(false);
        }
      };

      mapRef.current.on('click', handleStartSelection);

      return () => {
        mapRef.current.off('click', handleStartSelection);
      };
    }
  }, [selectingStart, startMarker]);

  useEffect(() => {
    if (mapRef.current) {
      const handleEndSelection = (e) => {
        if (selectingEnd) {
          setEndLat(e.latlng.lat);
          setEndLng(e.latlng.lng);

          if (endMarker) {
            mapRef.current.removeLayer(endMarker);
          }

          const marker = L.marker([e.latlng.lat, e.latlng.lng], { icon: createCustomIcon() }).addTo(mapRef.current);
          setEndMarker(marker);

          setSelectingEnd(false);
        }
      };

      mapRef.current.on('click', handleEndSelection);

      return () => {
        mapRef.current.off('click', handleEndSelection);
      };
    }
  }, [selectingEnd, endMarker]);

  const handleNameSubmit = () => {
    if (pendingLayer && pendingType) {
      handleAddElement(pendingLayer, pendingType, newElementName);
    }
    setIsNameModalOpen(false);
    setNewElementName('');
    setPendingLayer(null);
    setPendingType(null);
  };

  return (
    <Box pt="10px" position="relative">
      {isButtonVisible && (
        <HStack spacing={4} mt={4}> {/* Adjust spacing as needed */}
          <Tooltip label="Basculer entre vue zoomée et vue complète de la carte" aria-label="Toggle map view tooltip">
            <Button
              onClick={toggleMapView}
              bg="red.500"
              color="white"
              _hover={{ bg: "red.600" }}
              _active={{ bg: "red.700" }}
            >
              {buttonText}
            </Button>
          </Tooltip>
          <ToggleComponentGpsPointForm />
        </HStack>
      )}
      {location.pathname === "/admin/zoomed-map" && (
        <Tooltip label="Fermer la vue zoomée et retourner à la carte complète" aria-label="Close zoomed map tooltip">
          <CloseButton
            position="absolute"
            top="10px"
            right="10px"
            onClick={closeModal}
            bg="white"
            color="black"
            _hover={{ bg: "gray.300" }}
            zIndex="1000"
          />
        </Tooltip>
      )}

      <div id="map" style={{ height: mapHeight, width: '100%', zIndex: '0' }}></div>

      <Box mt={8} p={4} bg="gray.100" borderRadius="md" boxShadow="md" border="1px solid black">
        <Text fontSize="xl" mb={4} fontWeight="bold" color="black" textAlign="center">
          Liste des équipes
        </Text>
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Nom de l'équipe</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {teamsList.map((team, index) => (
                <Tr key={index}>
                  <Td>{team.name_of_the_team}</Td>
                  <Td>
                    <HStack spacing={2}>
                      {/* Bouton pour centrer la carte */}
                      <Button
                        size="sm"
                        colorScheme="blue"
                        onClick={() => centerMapOnPosition(team.latitude, team.longitude)}
                      >
                        Sur la carte
                      </Button>

                      {/* Bouton pour ouvrir Waze */}
                      <Button
                        size="sm"
                        colorScheme="teal"
                        onClick={() => {
                          const wazeUrl = `https://www.waze.com/ul?ll=${team.latitude},${team.longitude}&navigate=yes`;
                          window.open(wazeUrl, '_blank');
                        }}
                      >
                        Avec Waze
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>

      <Box
        mt={4}
        p={4}
        bg="gray.100"
        borderRadius="md"
        boxShadow="md"
        border="1px solid black"
      >
        <Box textAlign="center">
          <Text fontSize="xl" mb={4} fontWeight="bold" color="black">
            Itinéraire
          </Text>
        </Box>
        <HStack spacing={4} mt={4}>
          <Tooltip label="Sélectionner le point de départ de l'itinéraire sur la carte" aria-label="Select start point tooltip">
            <Button
              colorScheme={selectingStart ? "green" : "blue"}
              onClick={() => {
                setSelectingStart(true);
                setSelectingEnd(false);
              }}
            >
              Sélectionner le point de départ sur la carte
            </Button>
          </Tooltip>
          <Tooltip label="Sélectionner le point d'arrivée de l'itinéraire sur la carte" aria-label="Select end point tooltip">
            <Button
              colorScheme={selectingEnd ? "green" : "blue"}
              onClick={() => {
                setSelectingStart(false);
                setSelectingEnd(true);
              }}
            >
              Sélectionner le point d'arrivée sur la carte
            </Button>
          </Tooltip>
        </HStack>
        <VStack spacing={4}>
          <HStack spacing={4} display="none">
            <FormControl>
              <FormLabel>Latitude de départ</FormLabel>
              <Input
                placeholder="Latitude de départ"
                value={startLat}
                onChange={(e) => setStartLat(e.target.value)}
                type="number"
                step="any"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Longitude de départ</FormLabel>
              <Input
                placeholder="Longitude de départ"
                value={startLng}
                onChange={(e) => setStartLng(e.target.value)}
                type="number"
                step="any"
              />
            </FormControl>
          </HStack>
          <HStack spacing={4} display="none">
            <FormControl>
              <FormLabel>Latitude d'arrivée</FormLabel>
              <Input
                placeholder="Latitude d'arrivée"
                value={endLat}
                onChange={(e) => setEndLat(e.target.value)}
                type="number"
                step="any"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Longitude d'arrivée</FormLabel>
              <Input
                placeholder="Longitude d'arrivée"
                value={endLng}
                onChange={(e) => setEndLng(e.target.value)}
                type="number"
                step="any"
              />
            </FormControl>
          </HStack>
          <Tooltip label="Calculer et ajouter l'itinéraire sélectionné" aria-label="Add route tooltip">
            <Button colorScheme="blue" onClick={handleRouteCalculation} mt="10px">
              Ajouter l'itinéraire
            </Button>
          </Tooltip>
          <Tooltip label="Supprimer le dernier itinéraire enregistré et afficher le précédent enregistré s'il existe" aria-label="Delete last itinerary tooltip">
            <Button colorScheme="red" onClick={deleteLastItinerary} mt="10px">
              Supprimer l'itinéraire
            </Button>
          </Tooltip>
          <Tooltip label="Afficher ou masquer les détails textuels de l'itinéraire" aria-label="Toggle route details tooltip">
            <Button
              colorScheme={showRouteDetails ? "red" : "green"}
              onClick={() => setShowRouteDetails(prev => !prev)}
              mt={4}
            >
              {showRouteDetails ? "Masquer les détails de l'itinéraire en texte" : "Afficher les détails de l'itinéraire en texte"}
            </Button>
          </Tooltip>

          <Tooltip label="Afficher ou masquer les étapes détaillées de l'itinéraire" aria-label="Toggle itinerary details tooltip">
            <Button
              colorScheme={showItineraryDetails ? "red" : "green"}
              onClick={() => setShowItineraryDetails(prev => !prev)}
              mt={4}
            >
              {showItineraryDetails ? "Masquer les détails" : "Montrer les détails"}
            </Button>
          </Tooltip>
          {showItineraryDetails && (
            <VStack spacing={2} align="stretch">
              {latestItineraryText.map(step => (
                <Box
                  key={step.id}
                  p={2}
                  bg="blue.100"
                  borderRadius="md"
                  borderWidth={1}
                  borderColor="blue.200"
                  fontSize="sm"
                  lineHeight="1.25"
                  maxW="600px"
                  textAlign="left"
                >
                  <Text>{step.step}</Text>
                </Box>
              ))}
            </VStack>
          )}
        </VStack>
      </Box>

      <AlertDialog
        isOpen={isDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={closeDeleteDialog}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Supprimer l'élément
            </AlertDialogHeader>

            <AlertDialogBody>
              Voulez-vous vraiment supprimer cet élément ?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={closeDeleteDialog}>
                Annuler
              </Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                Supprimer
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <AlertDialog
        isOpen={isNameModalOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsNameModalOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Entrez le nom et la couleur de l'élément
            </AlertDialogHeader>

            <AlertDialogBody>
              <VStack spacing={4}>
                <Input
                  placeholder="Nom de l'élément"
                  value={newElementName}
                  onChange={(e) => setNewElementName(e.target.value)}
                />
                <FormControl>
                  <FormLabel>Couleur</FormLabel>
                  <Input
                    type="color"
                    value={newElementColor}
                    onChange={(e) => setNewElementColor(e.target.value)}
                  />
                </FormControl>
              </VStack>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button onClick={() => setIsNameModalOpen(false)}>
                Annuler
              </Button>
              <Button colorScheme="green" onClick={handleNameSubmit} ml={3}>
                Enregistrer
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default MapComponent;
