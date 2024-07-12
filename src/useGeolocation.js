import { useEffect } from 'react';

const useGeolocation = () => {
  useEffect(() => {
    const requestPermission = async () => {
      if ('geolocation' in navigator) {
        try {
          await navigator.permissions.query({ name: 'geolocation' }).then(permission => {
            if (permission.state !== 'granted') {
              navigator.geolocation.getCurrentPosition(() => { }, (error) => {
                console.error('Permission denied for geolocation', error);
              });
            }
          });
        } catch (error) {
          console.error('Error requesting geolocation permissions', error);
        }
      }
    };
    requestPermission();
  }, []);
};

export default useGeolocation;
