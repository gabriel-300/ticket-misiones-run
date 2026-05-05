import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MapPin } from 'lucide-react'

interface CourseMapProps {
  lat: number
  lng: number
  label?: string
}

export default function CourseMap({ lat, lng, label }: CourseMapProps) {
  return (
    <div className="rounded-xl overflow-hidden h-64 w-full">
      <Map
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        initialViewState={{ longitude: lng, latitude: lat, zoom: 13 }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
      >
        <NavigationControl position="top-right" />
        <Marker longitude={lng} latitude={lat} anchor="bottom">
          <div className="flex flex-col items-center">
            <div className="bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg">
              <MapPin className="h-5 w-5" />
            </div>
            {label && (
              <span className="text-xs bg-white border rounded px-1.5 py-0.5 mt-1 shadow font-medium whitespace-nowrap">
                {label}
              </span>
            )}
          </div>
        </Marker>
      </Map>
    </div>
  )
}
