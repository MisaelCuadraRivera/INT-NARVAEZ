package com.hospital.dto;

import java.util.List;

public class AssignRequest {
    private List<Long> islandIds;
    private List<Long> bedIds;

    public List<Long> getIslandIds() {
        return islandIds;
    }

    public void setIslandIds(List<Long> islandIds) {
        this.islandIds = islandIds;
    }

    public List<Long> getBedIds() {
        return bedIds;
    }

    public void setBedIds(List<Long> bedIds) {
        this.bedIds = bedIds;
    }
}
