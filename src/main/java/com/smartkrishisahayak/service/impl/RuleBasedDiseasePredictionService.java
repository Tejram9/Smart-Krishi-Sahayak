package com.smartkrishisahayak.service.impl;

import com.smartkrishisahayak.dto.response.DiseasePredictionResult;
import com.smartkrishisahayak.service.DiseasePredictionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class RuleBasedDiseasePredictionService implements DiseasePredictionService {

    private static final Logger log = LoggerFactory.getLogger(RuleBasedDiseasePredictionService.class);

    private static final String PROVIDER_NAME = "Rule-Based Agricultural Expert Diagnostic Provider (Dev/Fallback)";

    @Override
    public String getProviderName() {
        return PROVIDER_NAME;
    }

    @Override
    public boolean isTrainedModelActive() {
        return false;
    }

    @Override
    public DiseasePredictionResult predictDisease(String cropName, String originalFilename, String notes, byte[] imageBytes) {
        String cropLower = cropName != null ? cropName.toLowerCase() : "";
        String fileHint = originalFilename != null ? originalFilename.toLowerCase() : "";
        String notesHint = notes != null ? notes.toLowerCase() : "";

        log.debug("Processing disease prediction via Rule-Based Diagnostic Engine [crop={}, fileHint={}, notesLength={}]",
                cropName, fileHint, notes != null ? notes.length() : 0);

        // 1. Tomato Diseases
        if (cropLower.contains("tomato") || fileHint.contains("tomato")) {
            if (fileHint.contains("late") || notesHint.contains("late") || notesHint.contains("water-soaked") || notesHint.contains("black spot")) {
                return new DiseasePredictionResult(
                        "Tomato Late Blight",
                        "Phytophthora infestans (Oomycete)",
                        96.2,
                        "HIGH",
                        "Dark brown to purplish water-soaked lesions on leaves and stems with white fuzzy sporulation on the underside during humid weather.",
                        "Apply Bordeaux mixture (1%) or foliar spray of Bacillus subtilis (10g/L). Remove and destroy all blighted crop debris.",
                        "Spray Metalaxyl 8% + Mancozeb 64% WP (2.5g/L) or Cymoxanil 8% + Mancozeb 64% WP (2g/L) at 7-10 day intervals.",
                        "Avoid overhead drip splashing, ensure 60cm row spacing for ventilation, and avoid planting near potato fields.",
                        PROVIDER_NAME
                );
            } else if (fileHint.contains("curl") || notesHint.contains("curl") || notesHint.contains("yellow")) {
                return new DiseasePredictionResult(
                        "Tomato Leaf Curl Virus (ToLCV)",
                        "Begomovirus (transmitted by Whitefly Bemisia tabaci)",
                        94.8,
                        "MEDIUM",
                        "Upward and downward curling of leaflets, severe stunting of plant growth, thickening of veins, and excessive chlorosis.",
                        "Install yellow sticky traps (15-20 traps/acre). Spray 5% Neem Seed Kernel Extract (NSKE) or Pongamia oil (3ml/L) to repel vector whiteflies.",
                        "Spray Imidacloprid 17.8 SL (0.5ml/L) or Acetamiprid 20 SP (0.3g/L) or Diafenthiuron 50 WP (1g/L) to suppress whitefly population.",
                        "Use virus-tolerant hybrid seeds, erect barrier crops like maize/sorghum around the boundary, and rougue out diseased seedlings early.",
                        PROVIDER_NAME
                );
            } else {
                return new DiseasePredictionResult(
                        "Tomato Early Blight",
                        "Alternaria solani (Fungal)",
                        95.4,
                        "MEDIUM",
                        "Target-like concentric brown rings on older lower leaves surrounded by yellow chlorotic halos, progressing upwards.",
                        "Apply bio-fungicide Trichoderma harzianum (5g/L) foliar spray and enriched neem cake (100kg/acre) in soil. Prune lower diseased foliage.",
                        "Spray Mancozeb 75% WP (2.5g/L) or Azoxystrobin 23% SC (1ml/L) or Difenoconazole 25% EC (0.5ml/L) at first symptom appearance.",
                        "Practice 3-year crop rotation with non-solanaceous crops, use mulch to prevent soil splashing, and maintain clean weed-free borders.",
                        PROVIDER_NAME
                );
            }
        }

        // 2. Cotton Diseases
        if (cropLower.contains("cotton") || fileHint.contains("cotton")) {
            if (fileHint.contains("curl") || notesHint.contains("curl")) {
                return new DiseasePredictionResult(
                        "Cotton Leaf Curl Disease (CLCuD)",
                        "Cotton Leaf Curl Virus (Begomovirus)",
                        93.5,
                        "HIGH",
                        "Upward or downward leaf curling, vein thickening, leaf enations (leaf-like outgrowths) on underside of leaves, and stunted boll development.",
                        "Eradicate alternate weed hosts (Abutilon, Parthenium). Spray Neem oil (5ml/L) and install yellow sticky traps for whitefly suppression.",
                        "Spray Pyriproxyfen 10% EC (2ml/L) or Flonicamid 50% WG (0.4g/L) to eliminate transmitting whiteflies.",
                        "Cultivate CLCuD-resistant Bt cotton hybrids, sow early in season, and avoid excess nitrogen fertilization.",
                        PROVIDER_NAME
                );
            } else {
                return new DiseasePredictionResult(
                        "Cotton Bacterial Blight / Angular Leaf Spot",
                        "Xanthomonas citri pv. malvacearum (Bacterial)",
                        96.8,
                        "HIGH",
                        "Angular water-soaked spots bounded by leaf veins turning reddish-brown to black, with black arm lesions on petioles and stems.",
                        "Foliar spray of Pseudomonas fluorescens (10g/L) and soak seeds in hot water (52°C for 10 mins). Apply vermicompost.",
                        "Spray Copper Oxychloride 50% WP (2.5g/L) combined with Streptocycline (1g per 10 liters of water). Repeat after 12-14 days.",
                        "Use acid-delinted certified seeds, burn previous crop stubbles, and apply balanced potassium to strengthen plant cell walls.",
                        PROVIDER_NAME
                );
            }
        }

        // 3. Rice / Paddy Diseases
        if (cropLower.contains("rice") || cropLower.contains("paddy") || fileHint.contains("rice")) {
            if (fileHint.contains("blight") || notesHint.contains("bacterial") || notesHint.contains("yellow")) {
                return new DiseasePredictionResult(
                        "Rice Bacterial Leaf Blight (BLB)",
                        "Xanthomonas oryzae pv. oryzae (Bacterial)",
                        95.1,
                        "HIGH",
                        "Water-soaked to yellowish wavy stripes along leaf margins, wilting (kresek) in young tillers, and opaque bacterial exudate drops.",
                        "Spray fresh cow dung water supernatant (20% w/v) or neem oil emulsion. Drain stagnant water from field for 3-4 days.",
                        "Foliar spray of Copper Hydroxide 77% WP (2g/L) plus Plantomycin / Streptocycline (1.5g per 10L water).",
                        "Avoid clipping seedling tops during transplanting, apply nitrogen in 3 split doses, and cultivate BLB-resistant varieties (like Improved Samba Mahsuri).",
                        PROVIDER_NAME
                );
            } else {
                return new DiseasePredictionResult(
                        "Rice Blast Disease",
                        "Magnaporthe oryzae (Pyricularia oryzae) (Fungal)",
                        97.4,
                        "HIGH",
                        "Spindle-shaped / diamond-shaped lesions with greyish-white centers and dark brown margins on leaf blades, neck rot at panicle base.",
                        "Seed treatment with Pseudomonas fluorescens (10g/kg seed). Apply silica-rich fertilizers to fortify cuticle toughness.",
                        "Spray Tricyclazole 75% WP (0.6g/L) or Isoprothiolane 40% EC (1.5ml/L) or Kasugamycin 3% SL (2ml/L) at boot leaf stage.",
                        "Avoid excessive urea application, maintain optimum 5cm water level, and treat seeds before nursery sowing.",
                        PROVIDER_NAME
                );
            }
        }

        // 4. Wheat Diseases
        if (cropLower.contains("wheat") || fileHint.contains("wheat")) {
            return new DiseasePredictionResult(
                    "Wheat Yellow / Stripe Rust",
                    "Puccinia striiformis f. sp. tritici (Fungal)",
                    96.5,
                    "HIGH",
                    "Bright yellow powdery pustules (uredinia) arranged in long narrow linear stripes parallel to leaf veins.",
                    "Spray fermented buttermilk (chaas 5%) with neem extract. Practice mixed cropping with chickpea/mustard.",
                    "Spray Propiconazole 25% EC (Tilt - 1ml/L) or Tebuconazole 250 EC (1ml/L) immediately upon observing initial yellow stripes.",
                    "Sow rust-resistant varieties like DBW-187 (Karan Vandana), HD-2967, or PBW-550. Complete sowing before November 25.",
                    PROVIDER_NAME
            );
        }

        // 5. Potato Diseases
        if (cropLower.contains("potato") || fileHint.contains("potato")) {
            return new DiseasePredictionResult(
                    "Potato Early Blight",
                    "Alternaria solani (Fungal)",
                    94.9,
                    "MEDIUM",
                    "Brown angular or circular spots on lower leaves with characteristic concentric rings creating a target-board pattern.",
                    "Spray Trichoderma viride (5g/L) and incorporate neem cake during earthing up. Avoid sprinkler irrigation.",
                    "Spray Chlorothalonil 75% WP (2g/L) or Mancozeb 75% WP (2.5g/L) or Azoxystrobin + Difenoconazole (1ml/L).",
                    "Use disease-free certified seed tubers, follow wide ridge-and-furrow planting, and practice strict crop rotation.",
                    PROVIDER_NAME
            );
        }

        // 6. Grapes Diseases
        if (cropLower.contains("grape") || fileHint.contains("grape")) {
            return new DiseasePredictionResult(
                    "Grape Downy Mildew",
                    "Plasmopara viticola (Oomycete)",
                    97.1,
                    "HIGH",
                    "Translucent yellowish oily spots on upper leaf surface with dense white cottony/downy fungal growth on the underside.",
                    "Spray Bordeaux mixture (1%) or Potassium silicate (3g/L). Thin canopy to enhance sunlight penetration and aeration.",
                    "Spray Fosetyl-Al 80% WP (2g/L) or Dimethomorph 50% WP (1g/L) + Mancozeb (2g/L) or Cymoxanil + Mancozeb (2g/L).",
                    "Maintain canopy pruning height above 1.5m, avoid water stagnation, and monitor leaf wetness during monsoon/winter.",
                    PROVIDER_NAME
            );
        }

        // 7. Soybean Diseases
        if (cropLower.contains("soybean") || fileHint.contains("soybean")) {
            return new DiseasePredictionResult(
                    "Soybean Rust",
                    "Phakopsora pachyrhizi (Fungal)",
                    95.8,
                    "HIGH",
                    "Tiny yellowish to reddish-brown polygon-shaped pustules on the lower leaf surface causing premature defoliation.",
                    "Foliar application of Pseudomonas fluorescens (5g/L) or neem leaf extract (5%).",
                    "Spray Hexaconazole 5% EC (1ml/L) or Propiconazole 25% EC (1ml/L) at R1-R3 flowering/pod formation stage.",
                    "Adopt optimal seed spacing (45 x 5 cm), avoid delayed harvesting, and treat seeds with Carbendazim + Thiram.",
                    PROVIDER_NAME
            );
        }

        // 8. Sugarcane Diseases
        if (cropLower.contains("sugarcane") || fileHint.contains("sugarcane")) {
            return new DiseasePredictionResult(
                    "Sugarcane Red Rot",
                    "Colletotrichum falcatum (Fungal)",
                    95.2,
                    "HIGH",
                    "Yellowing and drying of third and fourth leaves, internal reddening of cane stalk tissue with white cross-bands and alcoholic odor.",
                    "Soak setts in hot water (52°C) with Trichoderma viride (10g/L). Burn trash from infected fields.",
                    "Sett treatment with Carbendazim 50% WP (1g/L) before planting. Avoid ratoon crops in infested fields.",
                    "Use certified disease-free setts (Co 86032, CoM 0265) and avoid waterlogging during germination.",
                    PROVIDER_NAME
            );
        }

        // 9. General / Default Fallback
        return new DiseasePredictionResult(
                "Cercospora Leaf Spot / Foliar Blight",
                "Cercospora spp. (Fungal)",
                92.4,
                "MEDIUM",
                "Small, circular to irregular spots with grayish-white centers and dark reddish-brown margins across foliage.",
                "Spray neem oil formulation (5ml/L) with soap emulsifier. Remove and burn heavily infected foliage.",
                "Spray Carbendazim 50% WP (1g/L) or Copper Oxychloride 50% WP (2.5g/L) thoroughly covering upper and lower leaf surfaces.",
                "Ensure proper plant spacing, avoid prolonged overhead sprinkler irrigation, and maintain soil organic fertility.",
                PROVIDER_NAME
        );
    }
}
