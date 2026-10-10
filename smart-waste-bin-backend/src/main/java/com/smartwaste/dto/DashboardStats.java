package com.smartwaste.dto;

public class DashboardStats {
    private long totalBins;
    private long activeBins;
    private long criticalBins;
    private long warningBins;
    private double averageFillPercentage;
    private long totalReadingsToday;
    
    public DashboardStats() {}

    public long getTotalBins() { return totalBins; }
    public void setTotalBins(long totalBins) { this.totalBins = totalBins; }

    public long getActiveBins() { return activeBins; }
    public void setActiveBins(long activeBins) { this.activeBins = activeBins; }

    public long getCriticalBins() { return criticalBins; }
    public void setCriticalBins(long criticalBins) { this.criticalBins = criticalBins; }

    public long getWarningBins() { return warningBins; }
    public void setWarningBins(long warningBins) { this.warningBins = warningBins; }

    public double getAverageFillPercentage() { return averageFillPercentage; }
    public void setAverageFillPercentage(double averageFillPercentage) { this.averageFillPercentage = averageFillPercentage; }

    public long getTotalReadingsToday() { return totalReadingsToday; }
    public void setTotalReadingsToday(long totalReadingsToday) { this.totalReadingsToday = totalReadingsToday; }
}
