package com.smartkrishisahayak.util;

import java.util.HashMap;
import java.util.Map;

/**
 * Geolocation resolver for Indian agricultural districts and regions.
 */
public final class IndianDistrictGeoLocator {

    public static class Coordinates {
        private final double latitude;
        private final double longitude;
        private final String districtName;
        private final String stateName;

        public Coordinates(double latitude, double longitude, String districtName, String stateName) {
            this.latitude = latitude;
            this.longitude = longitude;
            this.districtName = districtName;
            this.stateName = stateName;
        }

        public double getLatitude() {
            return latitude;
        }

        public double getLongitude() {
            return longitude;
        }

        public String getDistrictName() {
            return districtName;
        }

        public String getStateName() {
            return stateName;
        }
    }

    private static final Map<String, Coordinates> DISTRICT_COORDINATES = new HashMap<>();

    static {
        // --- Maharashtra Districts (All 36) ---
        addCoord("pune", 18.5204, 73.8567, "Pune", "Maharashtra");
        addCoord("nashik", 19.9975, 73.7898, "Nashik", "Maharashtra");
        addCoord("nagpur", 21.1458, 79.0882, "Nagpur", "Maharashtra");
        addCoord("aurangabad", 19.8762, 75.3433, "Chhatrapati Sambhajinagar", "Maharashtra");
        addCoord("chhatrapati sambhajinagar", 19.8762, 75.3433, "Chhatrapati Sambhajinagar", "Maharashtra");
        addCoord("sambhajinagar", 19.8762, 75.3433, "Chhatrapati Sambhajinagar", "Maharashtra");
        addCoord("ahmednagar", 19.0948, 74.7480, "Ahilyanagar (Ahmednagar)", "Maharashtra");
        addCoord("ahilyanagar", 19.0948, 74.7480, "Ahilyanagar (Ahmednagar)", "Maharashtra");
        addCoord("solapur", 17.6599, 75.9064, "Solapur", "Maharashtra");
        addCoord("kolhapur", 16.7050, 74.2433, "Kolhapur", "Maharashtra");
        addCoord("satara", 17.6805, 74.0183, "Satara", "Maharashtra");
        addCoord("sangli", 16.8524, 74.5815, "Sangli", "Maharashtra");
        addCoord("jalgaon", 21.0077, 75.5626, "Jalgaon", "Maharashtra");
        addCoord("dhule", 20.9042, 74.7749, "Dhule", "Maharashtra");
        addCoord("nandurbar", 21.3698, 74.2384, "Nandurbar", "Maharashtra");
        addCoord("amravati", 20.9320, 77.7523, "Amravati", "Maharashtra");
        addCoord("akola", 20.7002, 77.0082, "Akola", "Maharashtra");
        addCoord("yavatmal", 20.3888, 78.1204, "Yavatmal", "Maharashtra");
        addCoord("buldhana", 20.5312, 76.1848, "Buldhana", "Maharashtra");
        addCoord("washim", 20.1114, 77.1340, "Washim", "Maharashtra");
        addCoord("wardha", 20.7453, 78.6022, "Wardha", "Maharashtra");
        addCoord("chandrapur", 19.9615, 79.2961, "Chandrapur", "Maharashtra");
        addCoord("gadchiroli", 20.1849, 80.0030, "Gadchiroli", "Maharashtra");
        addCoord("bhandara", 21.1685, 79.6543, "Bhandara", "Maharashtra");
        addCoord("gondia", 21.4598, 80.1961, "Gondia", "Maharashtra");
        addCoord("nanded", 19.1383, 77.3210, "Nanded", "Maharashtra");
        addCoord("parbhani", 19.2686, 76.7719, "Parbhani", "Maharashtra");
        addCoord("latur", 18.4088, 76.5604, "Latur", "Maharashtra");
        addCoord("osmanabad", 18.1856, 76.0419, "Dharashiv (Osmanabad)", "Maharashtra");
        addCoord("dharashiv", 18.1856, 76.0419, "Dharashiv (Osmanabad)", "Maharashtra");
        addCoord("beed", 18.9891, 75.7601, "Beed", "Maharashtra");
        addCoord("jalna", 19.8347, 75.8816, "Jalna", "Maharashtra");
        addCoord("hingoli", 19.7180, 77.1472, "Hingoli", "Maharashtra");
        addCoord("raigad", 18.5158, 73.1812, "Raigad", "Maharashtra");
        addCoord("ratnagiri", 16.9902, 73.3120, "Ratnagiri", "Maharashtra");
        addCoord("sindhudurg", 16.1158, 73.6983, "Sindhudurg", "Maharashtra");
        addCoord("thane", 19.2183, 72.9781, "Thane", "Maharashtra");
        addCoord("palghar", 19.6967, 72.7699, "Palghar", "Maharashtra");
        addCoord("mumbai", 19.0760, 72.8777, "Mumbai", "Maharashtra");

        // --- Major Agricultural Regions Across India ---
        addCoord("indore", 22.7196, 75.8577, "Indore", "Madhya Pradesh");
        addCoord("bhopal", 23.2599, 77.4126, "Bhopal", "Madhya Pradesh");
        addCoord("ludhiana", 30.9010, 75.8573, "Ludhiana", "Punjab");
        addCoord("karnal", 29.6857, 76.9905, "Karnal", "Haryana");
        addCoord("jaipur", 26.9124, 75.7873, "Jaipur", "Rajasthan");
        addCoord("ahmedabad", 23.0225, 72.5714, "Ahmedabad", "Gujarat");
        addCoord("surat", 21.1702, 72.8311, "Surat", "Gujarat");
        addCoord("belagavi", 15.8497, 74.4977, "Belagavi", "Karnataka");
        addCoord("mysuru", 12.2958, 76.6394, "Mysuru", "Karnataka");
        addCoord("coimbatore", 11.0168, 76.9558, "Coimbatore", "Tamil Nadu");
        addCoord("guntur", 16.3067, 80.4365, "Guntur", "Andhra Pradesh");
        addCoord("hyderabad", 17.3850, 78.4867, "Hyderabad", "Telangana");
        addCoord("patna", 25.5941, 85.1376, "Patna", "Bihar");
        addCoord("varanasi", 25.3176, 82.9739, "Varanasi", "Uttar Pradesh");
    }

    private static void addCoord(String key, double lat, double lon, String dist, String state) {
        DISTRICT_COORDINATES.put(key.toLowerCase().trim(), new Coordinates(lat, lon, dist, state));
    }

    private IndianDistrictGeoLocator() {}

    /**
     * Resolve district or state string to GPS coordinates.
     */
    public static Coordinates resolveCoordinates(String districtOrLocation, String state) {
        if (districtOrLocation != null && !districtOrLocation.trim().isEmpty()) {
            String clean = districtOrLocation.toLowerCase().trim();
            for (Map.Entry<String, Coordinates> entry : DISTRICT_COORDINATES.entrySet()) {
                if (clean.contains(entry.getKey()) || entry.getKey().contains(clean)) {
                    return entry.getValue();
                }
            }
        }

        if (state != null && !state.trim().isEmpty()) {
            String cleanState = state.toLowerCase().trim();
            for (Map.Entry<String, Coordinates> entry : DISTRICT_COORDINATES.entrySet()) {
                if (cleanState.contains(entry.getValue().getStateName().toLowerCase())) {
                    return entry.getValue();
                }
            }
        }

        // Default to Central Maharashtra (Pune)
        return DISTRICT_COORDINATES.get("pune");
    }
}
