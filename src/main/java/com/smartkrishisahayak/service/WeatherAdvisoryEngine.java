package com.smartkrishisahayak.service;

import com.smartkrishisahayak.dto.response.WeatherAdvisoryResponse;
import com.smartkrishisahayak.dto.weather.WeatherData;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.Month;
import java.util.ArrayList;
import java.util.List;

/**
 * Intelligent Agricultural Advisory Engine converting weather parameters
 * into localized multilingual agronomic recommendations.
 */
@Component
public class WeatherAdvisoryEngine {

    public WeatherAdvisoryResponse generateAdvisory(WeatherData weather, String language) {
        String lang = (language != null && !language.trim().isEmpty()) ? language.trim().toUpperCase() : "EN";

        String location = weather.getLocation();
        String state = weather.getState();
        double temp = weather.getTemperature() != null ? weather.getTemperature() : 28.0;
        int humidity = weather.getHumidity() != null ? weather.getHumidity() : 65;
        double rain = weather.getPrecipitation() != null ? weather.getPrecipitation() : 0.0;
        double wind = weather.getWindSpeed() != null ? weather.getWindSpeed() : 10.0;

        Month currentMonth = LocalDate.now().getMonth();
        String seasonEn = getSeasonEn(currentMonth);
        String seasonLocalized = getSeasonLocalized(seasonEn, lang);

        String tempStr = String.format("%.1f°C", temp);
        String humidityStr = humidity + "%";
        String windStr = String.format("%.1f km/h", wind);
        String rainfallStr = rain > 0 ? String.format("%.1f mm (Rain)", rain) : "Dry / Nil (0.0 mm)";

        String localizedCondition = translateCondition(weather.getConditionText(), lang);

        // Compute Agricultural Advisory based on live meteorological metrics
        String generalAdvisory = buildGeneralAdvisory(temp, humidity, rain, wind, seasonEn, lang);
        List<String> pestAlerts = buildPestAlerts(temp, humidity, rain, seasonEn, lang);
        List<String> fieldWork = buildFieldWork(temp, humidity, rain, wind, seasonEn, lang);

        WeatherAdvisoryResponse response = new WeatherAdvisoryResponse(
                location,
                state,
                seasonLocalized,
                tempStr,
                humidityStr,
                rainfallStr,
                localizedCondition,
                generalAdvisory,
                pestAlerts,
                fieldWork
        );

        // Enrich extended response fields
        response.setTempCelsius(temp);
        response.setFeelsLikeCelsius(weather.getFeelsLike());
        response.setMinTempCelsius(weather.getMinTemp());
        response.setMaxTempCelsius(weather.getMaxTemp());
        response.setHumidityPercent(humidity);
        response.setPrecipitationMm(rain);
        response.setWindSpeedKmh(wind);
        response.setWindDirection(formatWindDirection(weather.getWindDirection()));
        response.setPressureHpa(weather.getPressure());
        response.setCloudCoverPercent(weather.getCloudCover());
        response.setWeatherIcon(weather.getWeatherIcon() != null ? weather.getWeatherIcon() : "bi-cloud-sun");
        response.setProvider(weather.getProvider() != null ? weather.getProvider() : "Agricultural Weather Advisory");
        response.setLiveData(weather.isLive());
        response.setLastUpdated(weather.getTimestamp() != null ? weather.getTimestamp().toString() : "");

        return response;
    }

    private String getSeasonEn(Month month) {
        int m = month.getValue();
        if (m >= 6 && m <= 9) return "Kharif (Monsoon)";
        if (m >= 10 || m <= 2) return "Rabi (Winter)";
        return "Zaid (Summer)";
    }

    private String getSeasonLocalized(String seasonEn, String lang) {
        if ("MR".equals(lang)) {
            if (seasonEn.contains("Kharif")) return "खरीप हंगाम (पावसाळा)";
            if (seasonEn.contains("Rabi")) return "रब्बी हंगाम (हिवाळा)";
            return "उन्हाळी हंगाम (झायेद)";
        } else if ("HI".equals(lang)) {
            if (seasonEn.contains("Kharif")) return "खरीफ मौसम (मानसून)";
            if (seasonEn.contains("Rabi")) return "रबी मौसम (सर्दियां)";
            return "जायद मौसम (गर्मी)";
        }
        return seasonEn;
    }

    private String translateCondition(String condition, String lang) {
        if (condition == null) return "Normal";
        String cLower = condition.toLowerCase();

        if ("MR".equals(lang)) {
            if (cLower.contains("clear")) return "निरभ्र आकाश (स्वच्छ हवामान)";
            if (cLower.contains("cloud") || cLower.contains("overcast")) return "ढगाळ वातावरण";
            if (cLower.contains("rain") || cLower.contains("drizzle")) return "पावसाची शक्यता / सरी";
            if (cLower.contains("thunder")) return "वादळी वारा व पाऊस";
            if (cLower.contains("fog")) return "धुके व थंड हवा";
            return "सामान्य हवामान";
        } else if ("HI".equals(lang)) {
            if (cLower.contains("clear")) return "साफ आसमान (खुशनुमा मौसम)";
            if (cLower.contains("cloud") || cLower.contains("overcast")) return "आंशिक बादल छाए रहेंगे";
            if (cLower.contains("rain") || cLower.contains("drizzle")) return "हल्की से मध्यम बारिश की संभावना";
            if (cLower.contains("thunder")) return "आंधी-तूफान और गरज के साथ बारिश";
            if (cLower.contains("fog")) return "कोहरा और ठंडी हवा";
            return "सामान्य मौसम";
        }
        return condition;
    }

    private String buildGeneralAdvisory(double temp, int humidity, double rain, double wind, String season, String lang) {
        if ("MR".equals(lang)) {
            if (rain > 2.0) {
                return "शेतात पाऊस असल्याने सिंचन तात्काळ थांबवा. साचलेले पाणी वाहून जाण्यासाठी चर मोकळे करा आणि फवारणी पुढे ढकला.";
            } else if (temp > 35.0) {
                return "उष्ण तापमान आणि तीव्र उन्हामुळे पिकांची पाण्याची गरज वाढली आहे. ओलावा टिकवण्यासाठी संध्याकाळी किंवा पहाटे ठिबक सिंचन द्या.";
            } else if (humidity > 75) {
                return "हवेत दमटपणा जास्त असल्याने बुरशीजन्य रोगांचा धोका संभवतो. पिकांची नियमित पाहणी करा व निचरा उत्तम ठेवा.";
            } else {
                return "सध्याचे हवामान पिकांच्या निरोगी वाढीसाठी पोषक आहे. संतुलित खत व्यवस्थापन आणि वेळेवर पाणी व्यवस्थापन ठेवा.";
            }
        } else if ("HI".equals(lang)) {
            if (rain > 2.0) {
                return "खेत में बारिश के कारण सिंचाई तुरंत रोक दें। जल निकासी नालियों को साफ रखें और किसी भी प्रकार के छिड़काव को टालें।";
            } else if (temp > 35.0) {
                return "उच्च तापमान के कारण फसलों में नमी की कमी हो सकती है। शाम या सुबह के समय हल्की ड्रिप सिंचाई करें।";
            } else if (humidity > 75) {
                return "हवा में उच्च आर्द्रता के कारण फफूंद जनित रोगों का खतरा अधिक है। फसलों की नियमित निगरानी करें।";
            } else {
                return "वर्तमान मौसम फसलों की वृद्धि के लिए अनुकूल है। आवश्यकतानुसार संतुलित उर्वरक और सिंचाई दें।";
            }
        } else {
            if (rain > 2.0) {
                return "Precipitation recorded. Suspend active irrigation, clear water drainage channels, and postpone foliar spray applications.";
            } else if (temp > 35.0) {
                return "Elevated temperatures detected. Irrigate during cooler evening/morning hours and apply mulch to conserve root zone moisture.";
            } else if (humidity > 75) {
                return "High relative humidity promotes fungal spore germination. Inspect lower crop canopy and ensure good field aeration.";
            } else {
                return "Weather conditions are favorable for vegetative growth. Maintain standard agronomic scheduling and soil moisture levels.";
            }
        }
    }

    private List<String> buildPestAlerts(double temp, int humidity, double rain, String season, String lang) {
        List<String> alerts = new ArrayList<>();

        if ("MR".equals(lang)) {
            if (humidity > 75) {
                alerts.add("उच्च आर्द्रतेमुळे कापूस व सोयाबीनवर करपा व मूळकूज रोगाचा प्रादुर्भाव वाढू शकतो.");
                alerts.add("द्राक्ष व भाजीपाला पिकांवर डाऊनी मिल्ड्यू (केवडा) रोगावर बारीक लक्ष ठेवा.");
            }
            if (temp > 32.0 && humidity < 60) {
                alerts.add("उष्ण व कोरड्या वातावरणामुळे भाजीपाला, कांदा व मिरचीवर फुलकिडे (थ्रिप्स) आणि लाल कोळीची शक्यता.");
            }
            if (alerts.isEmpty()) {
                alerts.add("हरभरा व तूर पिकावर घाटे अळीचा प्रादुर्भाव रोखण्यासाठी एकरी ५ कामगंध सापळे लावा.");
                alerts.add("पिकांवर मित्र कीटकांची (उदा. लेडीबर्ड बीटल) उपस्थिती तपासा.");
            }
        } else if ("HI".equals(lang)) {
            if (humidity > 75) {
                alerts.add("अधिक नमी के कारण दलहनी और तिलहनी फसलों में झुलसा और जड़ गलन रोग की संभावना।");
                alerts.add("सब्जियों और टमाटर में अगेती/पछेती झुलसा के लक्षणों पर नजर रखें।");
            }
            if (temp > 32.0 && humidity < 60) {
                alerts.add("गर्म और शुष्क मौसम में थ्रिप्स, सफेद मक्खी और माइट्स का प्रकोप बढ़ सकता है।");
            }
            if (alerts.isEmpty()) {
                alerts.add("चने और अरहर में फल छेदक सुंडी की निगरानी के लिए फेरोमोन ट्रैप लगाएं।");
                alerts.add("आवश्यकता होने पर 5% नीम अर्क (एनएसकेई) का छिड़काव करें।");
            }
        } else {
            if (humidity > 75) {
                alerts.add("High humidity increases risk of fungal leaf spots, downy mildew, and root rot in pulse and cash crops.");
                alerts.add("Monitor tomato and potato crops closely for early and late blight lesions.");
            }
            if (temp > 32.0 && humidity < 60) {
                alerts.add("Warm, dry weather accelerates sucking pest proliferation (Thrips, Aphids, Red Spider Mites).");
            }
            if (alerts.isEmpty()) {
                alerts.add("Install pheromone traps (5 traps/acre) to monitor Helicoverpa armigera pod borer in legume crops.");
                alerts.add("Adopt preventive biological sprays like Neem Seed Kernel Extract (NSKE 5%).");
            }
        }

        return alerts;
    }

    private List<String> buildFieldWork(double temp, int humidity, double rain, double wind, String season, String lang) {
        List<String> works = new ArrayList<>();

        if ("MR".equals(lang)) {
            if (wind > 15.0) {
                works.add(String.format("वाऱ्याचा वेग जास्त (%.1f km/h) असल्याने कीटकनाशकांची फवारणी टाळा, अन्यथा औषध हवेत उडून जाईल.", wind));
            } else if (rain > 1.0) {
                works.add("जमीन ओली असल्याने आंतरमशागत व ट्रॅक्टरची कामे पाऊस उघडेपर्यंत थांबवा.");
            } else {
                works.add("हवामान शांत असल्याने सकाळी ८ ते ११ या वेळेत आवश्यक सूक्ष्म अन्नद्रव्ये व फवारणी करू शकता.");
            }
            works.add("पिकांच्या संवेदनशील वाढीच्या टप्प्यावर गरजेनुसार हलके सिंचन द्या.");
        } else if ("HI".equals(lang)) {
            if (wind > 15.0) {
                works.add(String.format("हवा की गति अधिक (%.1f km/h) होने के कारण कीटनाशक छिड़काव से बचें ताकि दवा व्यर्थ न जाए।", wind));
            } else if (rain > 1.0) {
                works.add("खेत में अत्यधिक नमी के समय निराई-गुड़ाई का कार्य मौसम साफ होने तक टालें।");
            } else {
                works.add("शांत मौसम के दौरान सुबह के समय पोषक तत्वों का छिड़काव उपयुक्त रहेगा।");
            }
            works.add("फसलों में क्रांतिक विकास अवस्थाओं पर समय पर संतुलित सिंचाई सुनिश्चित करें।");
        } else {
            if (wind > 15.0) {
                works.add(String.format("Wind speed exceeds safe threshold (%.1f km/h). Postpone spraying to prevent pesticide spray drift.", wind));
            } else if (rain > 1.0) {
                works.add("Soil is saturated; postpone intercultural tillage operations until topsoil dries appropriately.");
            } else {
                works.add("Calm morning weather window (07:00 - 10:30 AM) is optimal for foliar nutrient and bio-fungicide sprays.");
            }
            works.add("Ensure timely split doses of nitrogenous fertilizers coupled with scheduled irrigations.");
        }

        return works;
    }

    private String formatWindDirection(Integer deg) {
        if (deg == null) return "Variable";
        if (deg >= 337.5 || deg < 22.5) return "N (" + deg + "°)";
        if (deg < 67.5) return "NE (" + deg + "°)";
        if (deg < 112.5) return "E (" + deg + "°)";
        if (deg < 157.5) return "SE (" + deg + "°)";
        if (deg < 202.5) return "S (" + deg + "°)";
        if (deg < 247.5) return "SW (" + deg + "°)";
        if (deg < 292.5) return "W (" + deg + "°)";
        return "NW (" + deg + "°)";
    }
}
