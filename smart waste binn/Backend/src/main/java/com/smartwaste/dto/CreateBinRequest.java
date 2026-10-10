package com.smartwaste.dto;

public class CreateBinRequest {
    private String id;
    private String name;
    private Double latitude;
    private Double longitude;
    private String zone;
    private Double binHeightCm = 40.0;

    public CreateBinRequest() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getZone() { return zone; }
    public void setZone(String zone) { this.zone = zone; }

    public Double getBinHeightCm() { return binHeightCm; }
    public void setBinHeightCm(Double binHeightCm) { this.binHeightCm = binHeightCm; }
}
