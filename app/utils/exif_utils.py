# app/utils/exif_utils.py
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS
import io
import logging

logger = logging.getLogger(__name__)

def _convert_to_degrees(value):
    """Helper to convert GPS EXIF (degrees, minutes, seconds) to decimal degrees."""
    try:
        d = float(value[0])
        m = float(value[1])
        s = float(value[2])
        return d + (m / 60.0) + (s / 3600.0)
    except Exception:
        return None

def get_exif_data(image_bytes):
    """Extract and simplify EXIF data from image bytes."""
    extracted_data = {
        "date_time": "Unknown date/time",
        "location_details": "Location details not available",
        "camera_model": "N/A",
    }
    try:
        img = Image.open(io.BytesIO(image_bytes))
        exif = img.getexif()

        if exif:
            for tag_id, value in exif.items():
                tag_name = TAGS.get(tag_id, tag_id)

                if tag_name == "DateTimeOriginal" or (tag_name == "DateTime" and extracted_data["date_time"] == "Unknown date/time"):
                    extracted_data["date_time"] = str(value)
                elif tag_name == "Model":
                    extracted_data["camera_model"] = str(value)
                elif tag_name == "GPSInfo":
                    gps_data = {}
                    for gps_tag_id in value:
                        gps_tag_name = GPSTAGS.get(gps_tag_id, gps_tag_id)
                        gps_data[gps_tag_name] = value[gps_tag_id]

                    lat_data = gps_data.get('GPSLatitude')
                    lat_ref = gps_data.get('GPSLatitudeRef')
                    lon_data = gps_data.get('GPSLongitude')
                    lon_ref = gps_data.get('GPSLongitudeRef')

                    if lat_data and lat_ref and lon_data and lon_ref:
                        lat = _convert_to_degrees(lat_data)
                        lon = _convert_to_degrees(lon_data)

                        if lat is not None and lon is not None:
                            if lat_ref == 'S': lat = -lat
                            if lon_ref == 'W': lon = -lon
                            extracted_data["location_details"] = f"Lat: {lat:.4f}, Lon: {lon:.4f}"
                        else:
                            extracted_data["location_details"] = "Partial GPS coordinates found (conversion error)"
                    elif gps_data:
                         extracted_data["location_details"] = "GPS coordinates present but could not be fully parsed"
    except Exception as e:
        logger.error(f"Error reading or processing EXIF data: {e}", exc_info=True)

    return extracted_data
