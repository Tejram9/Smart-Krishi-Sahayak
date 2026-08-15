package com.smartkrishisahayak.config;

import com.smartkrishisahayak.entity.Crop;
import com.smartkrishisahayak.entity.User;
import com.smartkrishisahayak.entity.VerifiedAgricultureContent;
import com.smartkrishisahayak.entity.enums.PreferredLanguage;
import com.smartkrishisahayak.entity.enums.UserRole;
import com.smartkrishisahayak.repository.CropRepository;
import com.smartkrishisahayak.repository.UserRepository;
import com.smartkrishisahayak.repository.VerifiedAgricultureContentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@Order(2)
public class CropDataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(CropDataInitializer.class);

    private final CropRepository cropRepository;
    private final VerifiedAgricultureContentRepository contentRepository;
    private final UserRepository userRepository;

    @Autowired
    public CropDataInitializer(CropRepository cropRepository,
                               VerifiedAgricultureContentRepository contentRepository,
                               UserRepository userRepository) {
        this.cropRepository = cropRepository;
        this.contentRepository = contentRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (cropRepository.count() > 0) {
            log.info("Crops database already initialized with {} records. Skipping seed data.", cropRepository.count());
            return;
        }

        log.info("Seeding verified crop catalog and agricultural advisory articles...");

        User adminAuthor = userRepository.findByRole(UserRole.ROLE_ADMIN).stream()
                .findFirst()
                .orElse(null);

        if (adminAuthor == null) {
            log.warn("System Admin user not available during crop data initialization. Deferring content authoring.");
            return;
        }

        // 1. Cotton
        Crop cotton = new Crop(
                "Cotton", "कापूस", "कपास",
                "Commercial", "Kharif",
                "Deep black cotton soil (Vertisols), well-drained",
                "Medium (500-700 mm)",
                "High-value fiber and cash crop extensively cultivated in Vidarbha and Marathwada regions of Maharashtra."
        );
        cotton = cropRepository.save(cotton);

        createContent(cotton, adminAuthor,
                "Pink Bollworm Integrated Pest Management",
                "To control Pink Bollworm in Cotton:\n1. Install pheromone traps @ 5 traps/ha for monitoring and 20 traps/ha for mass trapping.\n2. Spray Neem oil (1500 ppm) @ 5 ml/liter water at 45 days after sowing.\n3. Release Trichogramma egg parasitoids @ 1,50,000/ha.\n4. Avoid chemical spraying during early crop stages to protect natural predators.",
                "Pest Control", PreferredLanguage.EN);

        createContent(cotton, adminAuthor,
                "गुलाबी बोंडअळीचे एकात्मिक व्यवस्थापन",
                "कापसावरील गुलाबी बोंडअळीच्या प्रभावी नियंत्रणासाठी:\n१. पीक ४५ दिवसांचे झाल्यावर एकरी ५ कामगंध सापळे लावावेत.\n२. निंबोळी अर्क ५% किंवा ५ मिली निमतेल प्रति लिटर पाण्यात मिसळून फवारावे.\n३. ट्रायकोग्रामा मित्रकीटकांचे ट्रायकोकार्ड्स एकरी ३ ते ४ लावावेत.\n४. किडीची आर्थिक नुकसान पातळी (ETL) गाठल्यास कृषी तज्ज्ञांच्या सल्ल्यानेच शिफारशीत कीटकनाशक वापरावे.",
                "Pest Control", PreferredLanguage.MR);

        createContent(cotton, adminAuthor,
                "गुलाबी सुंडी का एकीकृत कीट प्रबंधन",
                "कपास में गुलाबी सुंडी के नियंत्रण के लिए:\n१. खेत में प्रति एकड़ ५ फेरोमोन ट्रैप लगाएं।\n२. बुवाई के ४५ दिन बाद ५% नीम का अर्क या नीम का तेल (१५०० ppm) ५ मिली प्रति लीटर पानी में मिलाकर छिड़काव करें।\n३. आर्थिक नुकसान सीमा पर पहुंचने पर ही अनुशंसित कीटनाशक का उपयोग करें।",
                "Pest Control", PreferredLanguage.HI);

        createContent(cotton, adminAuthor,
                "Balanced Fertilizer Schedule for Cotton",
                "Apply recommended NPK ratio (100:50:50 kg/ha for Bt Cotton). Apply full dose of Phosphorus and Potash with 20% Nitrogen at sowing. Top-dress remaining Nitrogen in two split doses at square formation and flowering stages.",
                "Fertilizer Management", PreferredLanguage.EN);

        createContent(cotton, adminAuthor,
                "कापूस पिकासाठी संतुलित खत व्यवस्थापन",
                "बीटी कापसासाठी हेक्टरी १००:५०:५० किलो नत्र, स्फुरद व पालाश खतांची शिफारस आहे. पेरणीच्या वेळी संपूर्ण स्फुरद, पालाश व २०% नत्र द्यावे. उर्वरित नत्र पात्या लागताना आणि फुले उमलण्याच्या काळात विभागून द्यावे.",
                "Fertilizer Management", PreferredLanguage.MR);

        // 2. Soybean
        Crop soybean = new Crop(
                "Soybean", "सोयाबीन", "सोयाबीन",
                "Commercial", "Kharif",
                "Well-drained clay loams to medium black soils (pH 6.5-7.5)",
                "Medium (450-650 mm)",
                "Major oilseed and protein-rich crop grown widely across Marathwada, Vidarbha, and Western Maharashtra."
        );
        soybean = cropRepository.save(soybean);

        createContent(soybean, adminAuthor,
                "Soybean Seed Treatment & Sowing Guidelines",
                "Treat seed with Trichoderma viride @ 5g/kg seed followed by Rhizobium japonicum culture @ 25g/kg seed before sowing. Maintain 45 cm row-to-row spacing and sow at depth of 3-4 cm under adequate moisture.",
                "Sowing & Seed Treatment", PreferredLanguage.EN);

        createContent(soybean, adminAuthor,
                "सोयाबीन बीजप्रक्रिया व पेरणी तंत्रज्ञान",
                "सोयाबीन पेरणीपूर्वी प्रतिकिलो बियाण्यास ५ ग्रॅम ट्रायकोडर्मा किंवा कार्बोक्सिन + थायरम २.५ ग्रॅम चोळावे. त्यानंतर रायझोबियम जिवाणू संवर्धन २५ ग्रॅम प्रति किलो बियाण्यास लावून सावलीत सुकवावे. पेरणी ३ ते ४ सेंमी खोलीवर करावी.",
                "Sowing & Seed Treatment", PreferredLanguage.MR);

        createContent(soybean, adminAuthor,
                "सोयाबीन बीजोपचार और बुवाई तकनीक",
                "बुवाई से पहले प्रति किलो बीज को ५ ग्राम ट्राइकोडर्मा और २५ ग्राम राइजोबियम कल्चर से उपचारित करें। कतार से कतार की दूरी ४५ सेमी और गहराई ३-४ सेमी रखें।",
                "Sowing & Seed Treatment", PreferredLanguage.HI);

        // 3. Sugarcane
        Crop sugarcane = new Crop(
                "Sugarcane", "ऊस", "गन्ना",
                "Commercial", "Perennial",
                "Deep fertile loamy to medium-black soils with good drainage",
                "High (1500-2500 mm)",
                "Prominent high-yielding cash crop of Western Maharashtra with robust agro-industrial value."
        );
        sugarcane = cropRepository.save(sugarcane);

        createContent(sugarcane, adminAuthor,
                "Drip Irrigation & Water Management in Sugarcane",
                "Adopting subsurface drip irrigation saves 40-50% water and enhances cane yield by 25%. Maintain irrigation cycles based on soil moisture and apply fertigation for maximum nutrient absorption.",
                "Irrigation", PreferredLanguage.EN);

        createContent(sugarcane, adminAuthor,
                "ऊस पिकामध्ये ठिबक सिंचन व पाणी व्यवस्थापन",
                "उसामध्ये ठिबक सिंचन पद्धती वापरल्यास ४० ते ५०% पाण्याची बचत होते आणि उत्पादनात २० ते २५% वाढ होते. खतांचा वापर ठिबक सिंचनाद्वारे (व्हेंचुरी) केल्यास खतांची कार्यक्षमता वाढते.",
                "Irrigation", PreferredLanguage.MR);

        // 4. Onion
        Crop onion = new Crop(
                "Onion", "कांदा", "प्याज",
                "Vegetables", "Rabi",
                "Rich sandy loam to clay loam soils with high organic matter",
                "Medium (350-550 mm)",
                "Major vegetable crop of Maharashtra, especially in Nashik, Ahmednagar, and Pune districts."
        );
        onion = cropRepository.save(onion);

        createContent(onion, adminAuthor,
                "Purple Blotch (Karpa) Disease Control in Onion",
                "Purple blotch caused by Alternaria porri causes purple lesions on leaves. Spray Mancozeb 75% WP @ 2.5 g/L or Difenoconazole 25% EC @ 1 ml/L along with sticker during humid conditions.",
                "Pest & Disease Control", PreferredLanguage.EN);

        createContent(onion, adminAuthor,
                "कांद्यावरील करपा (Purple Blotch) रोगाचे व्यवस्थापन",
                "कांदा पिकावरील करपा रोगाच्या नियंत्रणासाठी मँकोझेब २.५ ग्रॅम किंवा डायफेनोकोनाझोल १ मिली प्रति लिटर पाण्यात मिसळून १०-१२ दिवसांच्या अंतराने फवारावे. फवारणी करताना स्टीकर (चिकट द्रव्य) अवश्य वापरावे.",
                "Pest & Disease Control", PreferredLanguage.MR);

        createContent(onion, adminAuthor,
                "प्याज में झुलसा (करपा) रोग की रोकथाम",
                "प्याज में पत्तों पर जामुनी धब्बे दिखने पर मैंकोजेब २.५ ग्राम या डाईफेनोकोनाजोल १ मिली प्रति लीटर पानी में घोल बनाकर स्टीकर के साथ छिड़कें।",
                "Pest & Disease Control", PreferredLanguage.HI);

        // 5. Wheat
        Crop wheat = new Crop(
                "Wheat", "गहू", "गेहूं",
                "Cereals", "Rabi",
                "Well-drained clayey loam or deep black soil",
                "Medium (400-500 mm)",
                "Essential winter cereal crop in Maharashtra suitable for irrigated and semi-irrigated zones."
        );
        wheat = cropRepository.save(wheat);

        createContent(wheat, adminAuthor,
                "Critical Irrigation Stages for Wheat",
                "Wheat requires 4 to 6 irrigations at crucial developmental stages: 1. Crown Root Initiation (CRI at 21 days), 2. Tillering (40-45 days), 3. Jointing (60-65 days), 4. Flowering (80-85 days), and 5. Grain filling (100-105 days).",
                "Irrigation", PreferredLanguage.EN);

        createContent(wheat, adminAuthor,
                "गहू पिकाच्या संवेदनशील अवस्थांमध्ये पाणी नियोजन",
                "गव्हाला एकूण ४ ते ६ पाण्याच्या पाळ्यांची गरज असते. महत्त्वाच्या अवस्था: १. मुकुट मुळे फुटण्याची अवस्था (२१ दिवस), २. फुटवे फुटण्याची अवस्था (४०-४५ दिवस), ३. कांडी धरण्याची अवस्था (६०-६५ दिवस), ४. फुलोरा (८०-८५ दिवस), आणि ५. दाणे भरण्याची अवस्था.",
                "Irrigation", PreferredLanguage.MR);

        // 6. Turmeric
        Crop turmeric = new Crop(
                "Turmeric", "हळद", "हल्दी",
                "Commercial", "Kharif",
                "Well-drained sandy loam or friable clay loam rich in humus",
                "High (1200-1500 mm)",
                "Prized spice crop cultivated extensively in Sangli, Hingoli, and Nanded with high medicinal value."
        );
        turmeric = cropRepository.save(turmeric);

        createContent(turmeric, adminAuthor,
                "Rhizome Rot Prevention in Turmeric",
                "Rhizome rot is a destructive fungal disease. Ensure raised bed cultivation with proper drainage. Drench root zone with Copper Oxychloride (3 g/L) or Metalaxyl-Mancozeb (2 g/L) at first symptom appearance.",
                "Pest & Disease Control", PreferredLanguage.EN);

        createContent(turmeric, adminAuthor,
                "हळदीमधील कंदकुज रोगाचे नियंत्रण",
                "हळदीच्या कंदकुज नियंत्रणासाठी गादीवाफ्यावर लागवड करावी जेणेकरून शेतात पाणी साचणार नाही. लक्षणे दिसताच कॉपर ऑक्सिक्लोराईड ३ ग्रॅम किंवा मेटलॅक्सिल + मँकोझेब २ ग्रॅम प्रति लिटर पाण्यात मिसळून आळवणी (ड्रेंचिंग) करावी.",
                "Pest & Disease Control", PreferredLanguage.MR);

        // 7. Pomegranate
        Crop pomegranate = new Crop(
                "Pomegranate", "डाळिंब", "अनार",
                "Fruits", "Perennial",
                "Light to medium well-drained loamy soil (pH 6.5-7.5)",
                "Low to Medium (Drip irrigation recommended)",
                "Drought-tolerant high-value fruit crop exported globally from Solapur, Nashik, and Sangli."
        );
        pomegranate = cropRepository.save(pomegranate);

        createContent(pomegranate, adminAuthor,
                "Bacterial Blight (Telya) Management in Pomegranate",
                "Prune infected twigs and burn them immediately. Spray Streptocycline @ 0.5 g/L + Copper Oxychloride @ 2.5 g/L. Maintain orchard sanitation and avoid excess nitrogen fertilization during rainy spells.",
                "Pest & Disease Control", PreferredLanguage.EN);

        createContent(pomegranate, adminAuthor,
                "डाळिंबावरील तेलकट डाग (तैलिया) रोग नियंत्रण",
                "तेलकट डाग रोगाच्या नियंत्रणासाठी बागेची स्वच्छता ठेवावी. बाधित फांद्या छाटून नष्ट कराव्यात. स्ट्रेप्टोमायसीन सल्फेट ०.५ ग्रॅम + कॉपर ऑक्सिक्लोराईड २.५ ग्रॅम प्रति लिटर पाण्यात मिसळून फवारावे.",
                "Pest & Disease Control", PreferredLanguage.MR);

        // 8. Jowar
        Crop jowar = new Crop(
                "Jowar (Sorghum)", "ज्वारी", "ज्वार",
                "Cereals", "Kharif",
                "Medium to deep black soil with moderate moisture capacity",
                "Low (400-500 mm)",
                "Nutritious drought-hardy traditional staple food grain suited for rainfed and dryland farming."
        );
        cropRepository.save(jowar);

        // 9. Gram
        Crop gram = new Crop(
                "Gram (Chickpea)", "हरभरा", "चना",
                "Pulses", "Rabi",
                "Medium to heavy black soil with moisture retention capacity",
                "Low (250-350 mm)",
                "Vital pulse crop that enriches soil through atmospheric nitrogen fixation; popular varieties include Vijay and Digvijay."
        );
        cropRepository.save(gram);

        // 10. Tomato
        Crop tomato = new Crop(
                "Tomato", "टोमॅटो", "टमाटर",
                "Vegetables", "Kharif",
                "Well-drained sandy loam or red loam soils (pH 6.0-7.5)",
                "Medium (600-800 mm)",
                "Widely consumed vegetable cultivated round the year across Nashik, Pune, and Satara districts."
        );
        cropRepository.save(tomato);

        log.info("Successfully seeded 10 crops and associated verified agricultural advisories.");
    }

    private void createContent(Crop crop, User author, String title, String body, String category, PreferredLanguage language) {
        VerifiedAgricultureContent content = new VerifiedAgricultureContent(
                crop, author, title, body, category, language, true
        );
        contentRepository.save(content);
    }
}
