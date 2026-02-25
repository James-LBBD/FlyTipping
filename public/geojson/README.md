# LBBD GeoJSON Boundary File

## Required File
Place the actual LBBD boundary GeoJSON file here as:
`lbbd-boundary.json`

## Sample File Provided
A sample file `lbbd-boundary-sample.json` is provided as a placeholder. It contains a rough rectangular boundary around the approximate LBBD area.

**⚠️ Replace this with the actual LBBD boundary GeoJSON before production use!**

## To Use Sample for Testing
If you don't have the real boundary yet:

```cmd
copy lbbd-boundary-sample.json lbbd-boundary.json
```

## GeoJSON Format
The file should be a valid GeoJSON FeatureCollection with Polygon or MultiPolygon geometry representing the LBBD borough boundary.

Example structure:
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[lon, lat], [lon, lat], ...]]
      }
    }
  ]
}
```

## Where to Get Official Boundary
- London Data Store: https://data.london.gov.uk/
- UK Office for National Statistics
- Local Authority boundary files
