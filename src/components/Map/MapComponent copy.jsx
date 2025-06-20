import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import L from "leaflet";
// Fix for Leaflet's default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const getFirstIPs = (cidrList) => {
  try {
    if (!Array.isArray(cidrList) || cidrList.length === 0) throw new Error("CIDR list must be a non-empty array");
    return cidrList.map((cidr) => {
      if (typeof cidr !== "string") throw new Error("CIDR must be a string");
      const [ip, prefix] = cidr.split("/");
      if (!ip || !prefix) throw new Error("Invalid CIDR format");

      const ipParts = ip.split(".").map(Number);
      if (ipParts.length !== 4) throw new Error("Invalid IPv4 format");

      return ipParts.join(".");
    });
  } catch (error) {
    console.error(`Failed to extract first IPs from range: ${cidrList}`, error);
    return [];
  }
};

const MapComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { ipRange } = location.state || {}; // Get IP range from state
  const [geoLocations, setGeoLocations] = useState([]); // Store multiple locations
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!Array.isArray(ipRange) || ipRange.length === 0) {
      console.error("No valid IP range provided.");
      navigate("/"); // Redirect to home or another page if no IP range is provided
      return;
    }

    console.log(`Fetching data for IP range: ${ipRange}`);

    const fetchGeoIPData = async () => {
      try {
        const firstIps = getFirstIPs(ipRange);
        if (!firstIps.length) {
          throw new Error(`Failed to extract first IPs from range: ${ipRange}`);
        }
        console.log(`Extracted IPs from range ${ipRange}: ${firstIps}`);

        const locationPromises = firstIps.map(async (ip) => {
          const response = await fetch(`http://ip-api.com/json/${ip}?timestamp=${Date.now()}`, {
            headers: {
              "Cache-Control": "no-cache",
            },
          });
          return response.json();
        });

        const results = await Promise.all(locationPromises);
        const validLocations = results
          .filter((data) => data.status === "success")
          .map((data) => ({ lat: data.lat, lng: data.lon }));

        if (validLocations.length > 0) {
          setGeoLocations(validLocations);
        } else {
          console.error("Failed to fetch valid GeoIP data.");
        }
      } catch (error) {
        console.error("Error fetching GeoIP data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGeoIPData();
  }, [ipRange, navigate]);

  if (isLoading) {
    return <div>Loading map...</div>;
  }

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <MapContainer center={[geoLocations[0]?.lat || 51.505, geoLocations[0]?.lng || -0.09]} zoom={8} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {geoLocations.map((location, index) => (
          <Marker key={index} position={[location.lat, location.lng]}>
            <Popup>{`IP Range: ${ipRange[index]}`}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
