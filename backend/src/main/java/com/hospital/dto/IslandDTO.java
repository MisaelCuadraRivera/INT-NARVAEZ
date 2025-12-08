package com.hospital.dto;

import java.util.List;

public class IslandDTO {
    private Long id;
    private String name;
    private String description;
    private List<BedDTO> beds;
    private Integer totalBeds;
    private Integer occupiedBeds;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<BedDTO> getBeds() {
        return beds;
    }

    public void setBeds(List<BedDTO> beds) {
        this.beds = beds;
    }

    public Integer getTotalBeds() {
        return totalBeds;
    }

    public void setTotalBeds(Integer totalBeds) {
        this.totalBeds = totalBeds;
    }

    public Integer getOccupiedBeds() {
        return occupiedBeds;
    }

    public void setOccupiedBeds(Integer occupiedBeds) {
        this.occupiedBeds = occupiedBeds;
    }
}


