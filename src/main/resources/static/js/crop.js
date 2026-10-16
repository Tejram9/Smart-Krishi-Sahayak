/**
 * Smart Krishi Sahayak - Crop Information Hub Module
 */
const CropApp = (() => {
  let allCrops = [];
  let currentLanguage = 'EN';
  let searchDebounceTimeout = null;
  let cropDetailModalInstance = null;

  // DOM Elements
  const elements = {
    loading: document.getElementById('cropsLoading'),
    empty: document.getElementById('cropsEmpty'),
    error: document.getElementById('cropsError'),
    grid: document.getElementById('cropGrid'),
    countBadge: document.getElementById('cropCountBadge'),
    searchInput: document.getElementById('cropSearchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    categoryFilter: document.getElementById('categoryFilter'),
    seasonFilter: document.getElementById('seasonFilter'),
    resetBtn: document.getElementById('resetFiltersBtn'),
    emptyResetBtn: document.getElementById('emptyResetBtn'),
    retryBtn: document.getElementById('retryCropsBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
    // Modal elements
    modal: document.getElementById('cropDetailModal'),
    modalLoading: document.getElementById('modalLoading'),
    modalContent: document.getElementById('modalContent'),
    modalCropName: document.getElementById('modalCropName'),
    modalMultilingualNames: document.getElementById('modalMultilingualNames'),
    modalCategoryBadge: document.getElementById('modalCategoryBadge'),
    modalSeasonBadge: document.getElementById('modalSeasonBadge'),
    modalDescription: document.getElementById('modalDescription'),
    modalSoil: document.getElementById('modalSoil'),
    modalWater: document.getElementById('modalWater'),
    modalSeedRate: document.getElementById('modalSeedRate'),
    modalDuration: document.getElementById('modalDuration'),
    modalClimate: document.getElementById('modalClimate'),
    modalYield: document.getElementById('modalYield'),
    modalNpk: document.getElementById('modalNpk'),
    modalPestWatch: document.getElementById('modalPestWatch'),
    modalHarvestSigns: document.getElementById('modalHarvestSigns'),
    modalAdvisoriesContainer: document.getElementById('modalAdvisoriesContainer'),
    modalAdvisoryCount: document.getElementById('modalAdvisoryCount')
  };

  /**
   * Authoritative Scientific Agronomic Encyclopedia for Precision Agriculture
   */
  const AGRONOMY_PROFILES = {
    cotton: {
      seedRate: {
        EN: '1.5 - 2.5 kg/ha (Bt Cotton); Spacing: 90 x 60 cm (rainfed) or 120 x 45 cm (irrigated)',
        MR: '१.५ ते २.५ किलो/हेक्टर (बीटी कापूस); अंतर: ९० x ६० सेंमी (जिरायत) किंवा १२० x ४५ सेंमी (बागायत)',
        HI: '१.५ से २.५ किग्रा/हेक्टेयर (बीटी कपास); दूरी: ९० x ६० सेमी या १२० x ४५ सेमी'
      },
      duration: {
        EN: '150 - 180 Days (Medium-Late Hybrid)',
        MR: '१५० ते १८० दिवस (मध्यम ते उशिरा पक्व होणारे वाण)',
        HI: '१५० से १८० दिन (मध्यम-देर से पकने वाली किस्म)'
      },
      climate: {
        EN: '21°C - 32°C; Warm, sunny climate with frost-free growth period',
        MR: '२१°C ते ३२°C; उष्ण व कोरडे हवामान, मुबलक सूर्यप्रकाश',
        HI: '२१°C से ३२°C; गर्म एवं धूपदार मौसम'
      },
      soilPh: {
        EN: 'pH 6.0 - 8.0 (Deep black cotton Vertisols)',
        MR: 'सामू ६.० ते ८.० (उत्तम निचऱ्याची खोल काळी कसदार जमीन)',
        HI: 'pH ६.० से ८.० (गहरी काली कपास मिट्टी)'
      },
      yield: {
        EN: '10 - 14 Quintals/acre',
        MR: '१० ते १४ क्विंटल/एकर',
        HI: '१० से १४ क्विंटल/एकड़'
      },
      npk: {
        EN: '100:50:50 kg/ha N:P:K (Split N at sowing, squaring & flowering)',
        MR: '१००:५०:५० किलो/हेक्टर नत्र, स्फुरद, पालाश (नत्र विभागून द्यावे)',
        HI: '१००:५०:५० किग्रा/हेक्टेयर NPK (नत्र तीन भागों में)'
      },
      pestWatch: {
        EN: 'Pink Bollworm, Whitefly, Jassids, Aphids, Bacterial Blight, Grey Mildew',
        MR: 'गुलाबी बोंडअळी, पांढरी माशी, तुडतुडे, मावा, करपा व दहिया रोग',
        HI: 'गुलाबी सुंडी, सफेद मक्खी, हरा तेला, माहू, जीवाणु झुलसा'
      },
      harvestSigns: {
        EN: 'Bolls burst open fully in dry sunny weather; pick clean cotton without dried bracts',
        MR: 'बोंडे पूर्ण उमलल्यावर कोरड्या सूर्यप्रकाशात वेचणी करावी; पालापाचोळा विरहित स्वच्छ कापूस वेचावा',
        HI: 'टिंडे पूरी तरह खिलने पर साफ धूप में चुनाई करें'
      }
    },
    soybean: {
      seedRate: {
        EN: '65 - 75 kg/ha; Row spacing: 45 cm, Plant spacing: 5 cm; Depth: 3 - 4 cm',
        MR: '६५ ते ७५ किलो/हेक्टर (२५-३० किलो/एकर); ओळीत ४५ सेंमी, रोपांत ५ सेंमी; खोली ३-४ सेंमी',
        HI: '६५ से ७५ किग्रा/हेक्टेयर; कतार से कतार ४५ सेमी, पौधे से पौधा ५ सेमी'
      },
      duration: {
        EN: '95 - 105 Days (KDS-726 Phule Sangam, JS-335)',
        MR: '९५ ते १०५ दिवस (फुले संगम KDS-726, फुले किमया, JS-335)',
        HI: '९५ से १०५ दिन (जेएस-३३५, फुले संगम)'
      },
      climate: {
        EN: '20°C - 30°C; Warm and moderately humid monsoon season',
        MR: '२०°C ते ३०°C; उबदार व दमट पावसाळी हवामान (७००-१००० मिमी पाऊस)',
        HI: '२०°C से ३०°C; मध्यम आर्द्रतायुक्त मानसूनी मौसम'
      },
      soilPh: {
        EN: 'pH 6.5 - 7.5 (Well-drained clay loams to medium black soils)',
        MR: 'सामू ६.५ ते ७.५ (मध्यम ते भारी पाण्याचा चांगला निचरा होणारी जमीन)',
        HI: 'pH ६.५ से ७.५ (मध्यम से भारी दोमट मिट्टी)'
      },
      yield: {
        EN: '10 - 13 Quintals/acre (Up to 15 Q/acre under drip)',
        MR: '१० ते १३ क्विंटल/एकर (ठिबक व आधुनिक तंत्रज्ञानाने १५ क्विंटलपर्यंत)',
        HI: '१० से १३ क्विंटल/एकड़'
      },
      npk: {
        EN: '30:60:30 kg/ha N:P:K + 20 kg Sulphur/ha + Rhizobium & PSB culture',
        MR: '३०:६०:३० किलो/हेक्टर नत्र, स्फुरद, पालाश + २० किलो गंधक व रायझोबियम संवर्धन',
        HI: '३०:६०:३० किग्रा/हेक्टेयर NPK + २० किग्रा सल्फर'
      },
      pestWatch: {
        EN: 'Girdle Beetle, Stem Fly, Spodoptera (Armyworm), Semilooper, Yellow Mosaic, Rust',
        MR: 'चक्रीभुंगा, खोडमाशी, लष्करी अळी, उंटअळी, तांबेरा रोग व पिवळा मोझॅक',
        HI: 'चक्र भृंग (गर्डल बीटल), तना मक्खी, इल्ली, पीला मोजेक वायरस, गेरुआ'
      },
      harvestSigns: {
        EN: '90-95% leaves turn golden-yellow and drop; pods turn brown and rattle when shaken',
        MR: '९०-९५% पाने पिवळी पडून गळतात; शेंगांचा रंग तपकिरी होऊन हलवल्यास खुळखुळ आवाज येतो',
        HI: 'पत्तियां पीली होकर झड़ जाएं और फलियां सूखकर भूरी हो जाएं'
      }
    },
    sugarcane: {
      seedRate: {
        EN: '25,000 two-bud setts/ha; Row spacing: 120 - 150 cm wide furrow (wide-row planting)',
        MR: '२५,००० दोन डोळ्यांचे बेणे/हेक्टर; पट्टा पद्धत: ४ ते ५ फूट रुंद सरी',
        HI: '२५,००० दो आंख वाले टुकड़े/हेक्टेयर; ४ से ५ फीट चौड़ी कतारें'
      },
      duration: {
        EN: '12 - 14 Months (Suru: 12 mo, Pre-seasonal: 14 mo, Adsali: 16-18 mo)',
        MR: '१२ ते १४ महिने (सुरू: १२ महिने, पूर्वहंगामी: १४-१५ महिने, आडसाली: १६-१८ महिने)',
        HI: '१२ से १४ महीने (अडसाली १६-१८ माह)'
      },
      climate: {
        EN: '24°C - 35°C; Tropical warm humid climate with plentiful sunshine',
        MR: '२४°C ते ३५°C; भरपूर उष्णता व सूर्यप्रकाश, उष्ण व समशीतोष्ण हवामान',
        HI: '२४°C से ३५°C; गर्म एवं आर्द्र उष्णकटिबंधीय जलवायु'
      },
      soilPh: {
        EN: 'pH 6.5 - 8.2 (Deep fertile loams with minimum 1 m effective depth)',
        MR: 'सामू ६.५ ते ८.२ (उत्तम निचऱ्याची भारी कसदार सुपीक काळी जमीन)',
        HI: 'pH ६.५ से ८.२ (उपजाऊ गहरी दोमट मिट्टी)'
      },
      yield: {
        EN: '50 - 75 Tonnes/acre (Adsali can exceed 90-100 Tonnes/acre)',
        MR: '५० ते ७५ टन/एकर (ठिबक व आडसाली हंगामात ९० ते १०० टनांपर्यंत उत्पादन)',
        HI: '५० से ७५ टन/एकड़ (अडसाली में ९०-१०० टन)'
      },
      npk: {
        EN: '250:115:115 kg/ha N:P:K (Pre-seasonal: 340:170:170 kg/ha via 4 splits)',
        MR: '२५०:११५:११५ किलो/हेक्टर (पूर्वहंगामी ३४०:१७०:१७०); ४ हप्त्यांमध्ये किंवा ठिबकद्वारे',
        HI: '२५०:११५:११५ किग्रा/हेक्टेयर NPK'
      },
      pestWatch: {
        EN: 'Early Shoot Borer, Top Borer, White Grub (Humba), Red Rot, Grassy Shoot',
        MR: 'खोडाळी, कांडी अळी, हुमणी, तांबोरा (Red Rot) व चाबूक काणी रोग',
        HI: 'तना छेदक, शीर्ष छेदक, सफेद लट, लाल सड़न (रेड रॉट)'
      },
      harvestSigns: {
        EN: 'Brix reading reaches 19-21% by refractometer; stalks sound metallic when tapped',
        MR: 'हॅन्ड रिफ्रॅक्टोमीटरने ब्रिक्स १९ ते २१% भरते; कांड्यांवर दाबल्यास कडक लागतात',
        HI: 'ब्रिक्स मान १९-२१% हो जाए; गन्ने पर थपकी देने पर धातु जैसी आवाज आए'
      }
    },
    onion: {
      seedRate: {
        EN: '8 - 10 kg seed/ha for nursery; Transplant at 15 cm x 10 cm on flat/raised beds',
        MR: '८ ते १० किलो बियाणे/हेक्टर (रोपवाटिका); पुनर्लागवड: १५ x १० सेंमी अंतरावर',
        HI: '८ से १० किग्रा बीज/हेक्टेयर; रोपाई १५ x १० सेमी दूरी पर'
      },
      duration: {
        EN: '110 - 125 Days after transplanting (Rabi: 120-135 days, Kharif: 95-105 days)',
        MR: 'रोपांच्या पुनर्लागवडीनंतर ११० ते १२५ दिवस (रब्बी: १२०-१३० दिवस, खरीप: ९५-१०५ दिवस)',
        HI: 'रोपाई के बाद ११० से १२५ दिन'
      },
      climate: {
        EN: '13°C - 24°C vegetative; 25°C - 30°C for bulb maturity & drying',
        MR: '१३°C ते २४°C वाढीसाठी; २५°C ते ३०°C कांदा पोसण्यासाठी व सुकण्यासाठी',
        HI: '१५°C से २५°C कंद विकास के लिए'
      },
      soilPh: {
        EN: 'pH 6.0 - 7.5 (Friable sandy loam or silt loam rich in organic matter)',
        MR: 'सामू ६.० ते ७.५ (भुसभुशीत गाळाची, पाण्याचा उत्तम निचरा असणारी मध्यम जमीन)',
        HI: 'pH ६.० से ७.५ (जीवांशयुक्त बलुई दोमट मिट्टी)'
      },
      yield: {
        EN: '100 - 140 Quintals/acre',
        MR: '१०० ते १४० क्विंटल/एकर (रब्बी हंगामात साठवणूकक्षम उत्तम प्रतीचा कांदा)',
        HI: '१०० से १४० क्विंटल/एकड़'
      },
      npk: {
        EN: '100:50:50 kg/ha N:P:K + 30 kg Sulphur/ha (Essential for pungency & storage)',
        MR: '१००:५०:५० किलो/हेक्टर नत्र, स्फुरद, पालाश + ३० किलो गंधक (साठवणुकीसाठी अत्यावश्यक)',
        HI: '१००:५०:५० किग्रा NPK + ३० किग्रा सल्फर प्रति हेक्टेयर'
      },
      pestWatch: {
        EN: 'Thrips (silver patches on foliage), Purple Blotch (Karpa), Stemphylium, Basal Rot',
        MR: 'फुलकिडे (थ्रिप्स), जांभळा व तपकिरी करपा, मुळकूज व कांद्याची सड',
        HI: 'थ्रिप्स (माहू), जामुनी धब्बा (करपा रोग), कंद सड़न'
      },
      harvestSigns: {
        EN: '50% to 70% tops collapse (neck fall); outer scales become papery and colored',
        MR: '५०% ते ७०% माना पडल्यावर (पात वाकल्यावर); मान मऊ होऊन वाळते',
        HI: '५०% से ७०% पौधों की गर्दन झुककर नीचे गिर जाए'
      }
    },
    wheat: {
      seedRate: {
        EN: '100 - 125 kg/ha (Timely sown), 125 - 150 kg/ha (Late sown); Rows: 20 - 22.5 cm',
        MR: '१०० ते १२५ किलो/हेक्टर (वेळेवर पेरणी); दोन ओळींत २० ते २२.५ सेंमी',
        HI: '१०० से १२५ किग्रा/हेक्टेयर; कतारों की दूरी २० से २२.५ सेमी'
      },
      duration: {
        EN: '110 - 120 Days (Phule Samadhan, MACS 6222, GW 496)',
        MR: '११० ते १२० दिवस (फुले समाधान NIAW-1994, त्र्यंबक, GW-496)',
        HI: '११० से १२० दिन (एचडी-२९६७, फुले समाधान)'
      },
      climate: {
        EN: '15°C - 23°C; Cool winter season with bright sunny days during grain filling',
        MR: '१५°C ते २३°C; फुटवे फुटताना थंडी आणि दाणे भरताना स्वच्छ कोरडी हवा',
        HI: '१५°C से २३°C; ठंडा और शुष्क मौसम'
      },
      soilPh: {
        EN: 'pH 6.5 - 7.8 (Heavy clayey loam or medium-to-deep black soils)',
        MR: 'सामू ६.५ ते ७.८ (मध्यम ते भारी पाण्याचा उत्तम निचरा असणारी जमीन)',
        HI: 'pH ६.५ से ७.८ (उपजाऊ चिकनी दोमट मिट्टी)'
      },
      yield: {
        EN: '18 - 24 Quintals/acre under 5-6 critical irrigations',
        MR: '१८ ते २४ क्विंटल/एकर (५ ते ६ संवेदनशील पाण्याच्या पाळ्या दिल्यास)',
        HI: '१८ से २४ क्विंटल/एकड़'
      },
      npk: {
        EN: '120:60:40 kg/ha N:P:K (50% N + full P&K at sowing; remaining N at CRI stage)',
        MR: '१२०:६०:४० किलो/हेक्टर नत्र, स्फुरद, पालाश (अर्धे नत्र व पूर्ण स्फुरद-पालाश पेरणीच्या वेळी)',
        HI: '१२०:६०:४० किग्रा/हेक्टेयर NPK'
      },
      pestWatch: {
        EN: 'Brown/Yellow Rust, Loose Smut, Aphids, Termites at early seedling stage',
        MR: 'तांबेरा (तपकिरी/पिवळा तांबेरा), काजळी रोग, मावा कीड व वाळवी',
        HI: 'गेरुआ (रस्ट), कंडुआ (स्मट), माहू, दीमक'
      },
      harvestSigns: {
        EN: 'Grains become hard; moisture falls below 12-14%; spikes & straw turn golden dry',
        MR: 'दाणे नखाने दाबल्यास तुटत नाहीत; ओंब्या व खोड पिवळे सुकते; ओलावा १२% पेक्षा कमी',
        HI: 'दाने सख्त हो जाएं, बालियां और डंठल सुनहरे पीले होकर सूख जाएं'
      }
    },
    turmeric: {
      seedRate: {
        EN: '20 - 25 Quintals/ha mother/finger rhizomes; Spacing: 45 cm x 30 cm on raised beds',
        MR: '२० ते २५ क्विंटल/हेक्टर निरोगी गड्डे; गादीवाफ्यावर ४५ x ३० सेंमी अंतर',
        HI: '२० से २५ क्विंटल/हेक्टेयर प्रकंद; ४५ x ३० सेमी दूरी पर'
      },
      duration: {
        EN: '8 - 9 Months (Selam: 8.5 months, Phule Swarupa: 8-9 months)',
        MR: '८ ते ९ महिने (सेलम वाण: ८.५ महिने, फुले स्वरूपा: ८-९ महिने)',
        HI: '८ से ९ महीने'
      },
      climate: {
        EN: '20°C - 35°C; Warm and humid tropical climate with partial shade tolerance',
        MR: '२०°C ते ३५°C; उष्ण व दमट हवामान, भरपूर सेंद्रिय खत व संरक्षित सिंचन',
        HI: '२०°C से ३५°C; गर्म एवं तर जलवायु'
      },
      soilPh: {
        EN: 'pH 5.5 - 7.5 (Well-drained sandy loam or friable clay loam rich in humus)',
        MR: 'सामू ५.५ ते ७.५ (गाळाची किंवा पाण्याचा त्वरित निचरा होणारी भुसभुशीत जमीन)',
        HI: 'pH ५.५ से ७.५ (बलुई दोमट या चिकनी दोमट मिट्टी)'
      },
      yield: {
        EN: '80 - 110 Quintals/acre green rhizomes (18 - 25 Q/acre dry cured)',
        MR: '८० ते ११० क्विंटल/एकर ओली हळद (१८ ते २५ क्विंटल/एकर कोरडी हळद)',
        HI: '८० से ११० क्विंटल/एकड़ गीली हल्दी (१८-२५ क्विंटल सूखी)'
      },
      npk: {
        EN: '200:100:100 kg/ha N:P:K + 25-30 tonnes FYM/ha + Zinc & Iron micronutrients',
        MR: '२००:१००:१०० किलो/हेक्टर नत्र, स्फुरद, पालाश + २५-३० टन कुजलेले शेणखत',
        HI: '२००:१००:१०० किग्रा/हेक्टेयर NPK + गोबर की खाद'
      },
      pestWatch: {
        EN: 'Rhizome Rot (Pythium/Fusarium), Leaf Spot (Colletotrichum), Shoot Borer, Scale Insect',
        MR: 'कंदकुज (गड्डा कुजणे), पानावरील ठिपके (करपा), खोडकिडा व खवले कीड',
        HI: 'प्रकंद सड़न, पत्ती धब्बा रोग, तना छेदक'
      },
      harvestSigns: {
        EN: 'Leaves turn yellow, dry completely and lodge on ground; rhizomes show bright orange core',
        MR: 'पाने पिवळी पडून पूर्ण वाळतात व जमिनीवर लोळतात; गड्ड्यांना गर्द पिवळा-नारंगी रंग येतो',
        HI: 'पत्तियां सूखकर नीचे गिर जाएं और प्रकंद गहरा नारंगी-पीला हो जाए'
      }
    },
    pomegranate: {
      seedRate: {
        EN: '400 - 500 Layered Plants/ha; Spacing: 4.5 m x 3.5 m or 4.0 m x 3.0 m',
        MR: '४०० ते ५०० कलमे/हेक्टर (गुटी कलमे); अंतर: ४.५ x ३.५ मीटर (१४ x १० फूट)',
        HI: '४०० से ५०० पौधे/हेक्टेयर; दूरी: ४.५ x ३.५ मीटर'
      },
      duration: {
        EN: 'Perennial Orchard; Fruit development: 150 - 170 Days from flowering (Bahar)',
        MR: 'बहुवार्षिक फळबाग; बहार धरल्यापासून फळे तयार होण्यास १५० ते १७० दिवस (५-६ महिने)',
        HI: 'बहुवर्षीय; फूल आने से फल पकने तक १५०-१७० दिन'
      },
      climate: {
        EN: '25°C - 38°C; Semi-arid warm climate with dry atmosphere during fruit ripening',
        MR: '२५°C ते ३८°C; उष्ण व कोरडे हवामान, फळे पक्व होताना कोरडी हवा आवश्यक',
        HI: '२५°C से ३८°C; गर्म एवं अर्ध-शुष्क जलवायु'
      },
      soilPh: {
        EN: 'pH 6.5 - 8.0 (Deep light loamy to medium well-drained soil)',
        MR: 'सामू ६.५ ते ८.० (हलकी ते मध्यम पाण्याचा उत्तम निचरा असणारी जमीन)',
        HI: 'pH ६.५ से ८.० (उचित जल निकास वाली बलुई दोमट)'
      },
      yield: {
        EN: '6 - 9 Tonnes/acre (Bhagwa variety yields 12-15 kg/tree in 4th-5th year)',
        MR: '६ ते ९ टन/एकर (भगवा वाण; ४ थ्या वर्षापासून प्रति झाड १२ ते १५ किलो दर्जेदार फळे)',
        HI: '६ से ९ टन/एकड़ (भगवा किस्म)'
      },
      npk: {
        EN: '625 g N : 250 g P2O5 : 250 g K2O per bearing tree/year + micronutrient foliar spray',
        MR: 'प्रति झाड दरवर्षी ६२५ ग्रॅम नत्र : २५० ग्रॅम स्फुरद : २५० ग्रॅम पालाश + सूक्ष्म अन्नद्रव्ये',
        HI: '६२५ ग्राम N : २५० ग्राम P : २५० ग्राम K प्रति फलदार पेड़/वर्ष'
      },
      pestWatch: {
        EN: 'Bacterial Blight (Telya / Xanthomonas), Wilt (Ceratocystis), Fruit Borer (Surya), Thrips',
        MR: 'तेलकट डाग (तैलिया रोग), मर रोग (विल्ट), फळ पोखरणारी अळी (सुरसा), फुलकिडे',
        HI: 'जीवाणु झुलसा (तैलिया), उकठा (विल्ट), फल छेदक, थ्रिप्स'
      },
      harvestSigns: {
        EN: 'Calyx lobes curve inward; skin turns glossy saffron-red; metallic sound upon tapping',
        MR: 'फळाचा रंग गर्द शेंदरी-लाल होतो; फुलोरा भाग आतील बाजूने वळतो; फळावर टणक नाद येतो',
        HI: 'छिलके का रंग चमकदार लाल हो जाए और फल के शीर्ष का कैलिक्स मुड़ जाए'
      }
    },
    jowar: {
      seedRate: {
        EN: '8 - 10 kg/ha; Row spacing: 45 cm, Plant spacing: 15 cm; Depth: 3 - 4 cm',
        MR: '८ ते १० किलो/हेक्टर (३ ते ४ किलो/एकर); ओळीत ४५ सेंमी, रोपांत १५ सेंमी अंतर',
        HI: '८ से १० किग्रा/हेक्टेयर; कतार से कतार ४५ सेमी, पौधे से पौधा १५ सेमी'
      },
      duration: {
        EN: '100 - 115 Days (Maldandi 35-1, Phule Anuradha, CSH-16)',
        MR: '१०० ते ११५ दिवस (मालदांडी ३५-१, फुले सुचित्रा, फुले अनुराधा)',
        HI: '१०० से ११५ दिन (मालदंडी ३५-१)'
      },
      climate: {
        EN: '25°C - 34°C; Warm climate, highly drought-hardy and resilient to water stress',
        MR: '२५°C ते ३४°C; कोरडवाहू व अवर्षणप्रवण भागासाठी अत्यंत उपयुक्त, कमी पाण्यात येणारे',
        HI: '२५°C से ३४°C; सूखा-रोधी एवं उष्ण जलवायु'
      },
      soilPh: {
        EN: 'pH 6.0 - 8.5 (Medium to deep black soil with moderate water retention)',
        MR: 'सामू ६.० ते ८.५ (मध्यम ते खोल काळी जमीन जी ओलावा टिकवून ठेवू शकते)',
        HI: 'pH ६.० से ८.५ (मध्यम से भारी काली मिट्टी)'
      },
      yield: {
        EN: '12 - 16 Quintals/acre grain + 3 - 4 tonnes nutritious fodder',
        MR: '१२ ते १६ क्विंटल/एकर धान्य + ३ ते ४ टन पौष्टिक कडबा (चारा)',
        HI: '१२ से १६ क्विंटल/एकड़ दाना + हरा चारा'
      },
      npk: {
        EN: '80:40:40 kg/ha N:P:K (Dryland: 50:25:25 kg/ha; split N at sowing and 30-35 days)',
        MR: '८०:४०:४० किलो/हेक्टर नत्र, स्फुरद, पालाश (जिरायत: ५०:२५:२५ किलो)',
        HI: '८०:४०:४० किग्रा/हेक्टेयर NPK'
      },
      pestWatch: {
        EN: 'Shoot Fly, Stem Borer, Fall Armyworm, Grain Mold, Downy Mildew',
        MR: 'खोडमाशी, खोडकिडा, लष्करी अळी, दाण्यावरील बुरशी (काणी)',
        HI: 'तना मक्खी, तना छेदक, सैनिक कीट (आर्मीवर्म), दाना फफूंद'
      },
      harvestSigns: {
        EN: 'Black spot/layer develops at the hilum of the grain; moisture drops below 15%',
        MR: 'दाण्याच्या बेचक्यात काळा ठिपका (ब्लॅक लेयर) तयार होतो; कणसे वाळतात व पाने पिवळी पडतात',
        HI: 'दाने के निचले सिरे पर काला धब्बा दिखे और बालियां सूख जाएं'
      }
    },
    gram: {
      seedRate: {
        EN: '65 - 75 kg/ha (Desi varieties: Vijay, Digvijay); 85-100 kg/ha (Kabuli); Spacing: 30 x 10 cm',
        MR: '६५ ते ७५ किलो/हेक्टर (देशी: विजय, दिग्विजय); ८५-१०० किलो (काबुली); अंतर: ३० x १० सेंमी',
        HI: '६५ से ७५ किग्रा/हेक्टेयर (देशी), ९०-१०० किग्रा (काबुली); दूरी: ३० x १० सेमी'
      },
      duration: {
        EN: '95 - 110 Days (Vijay: 95-100 days, Digvijay: 105-110 days)',
        MR: '९५ ते ११० दिवस (विजय: ९०-९५ दिवस, दिग्विजय: १०५-११० दिवस)',
        HI: '९५ से ११० दिन'
      },
      climate: {
        EN: '15°C - 25°C; Cool winter season with sunny days during pod development',
        MR: '१५°C ते २५°C; रब्बी हंगामातील कोरडी थंडी व मुबलक सूर्यप्रकाश',
        HI: '१५°C से २५°C; ठंडा और साफ मौसम'
      },
      soilPh: {
        EN: 'pH 6.2 - 7.8 (Medium-deep well-drained black or loamy soils; avoid waterlogging)',
        MR: 'सामू ६.२ ते ७.८ (मध्यम ते भारी पाण्याचा चांगला निचरा होणारी जमीन)',
        HI: 'pH ६.२ से ७.८ (मध्यम से भारी दोमट मिट्टी)'
      },
      yield: {
        EN: '9 - 13 Quintals/acre under 1-2 protective irrigations at branching & pod stage',
        MR: '९ ते १३ क्विंटल/एकर (घाटे भरताना व फांद्या फुटताना १ ते २ संरक्षित पाण्याच्या पाळ्या दिल्यास)',
        HI: '९ से १३ क्विंटल/एकड़'
      },
      npk: {
        EN: '25:50:00 kg/ha N:P:K + 20 kg Sulphur/ha + Rhizobium & PSB (Fixes atmospheric Nitrogen)',
        MR: '२५:५०:०० किलो/हेक्टर नत्र, स्फुरद + २० किलो गंधक व रायझोबियम संवर्धन (हवेतील नत्र स्थिर करते)',
        HI: '२५:५०:० किग्रा/हेक्टेयर NPK + राइजोबियम बीजोपचार'
      },
      pestWatch: {
        EN: 'Gram Pod Borer (Helicoverpa armigera), Fusarium Wilt, Collar Rot, Dry Root Rot',
        MR: 'घाटे अळी (हेलिकोव्हर्पा), मर रोग (फ्युजारियम विल्ट), मूळकुज',
        HI: 'चना फली छेदक (इल्ली), उकठा (विल्ट), जड़ सड़न'
      },
      harvestSigns: {
        EN: 'Plants dry out completely; leaves shed; pods turn light golden yellow and shake with a rattle',
        MR: 'झाड पूर्णपणे सुकते; पाने गळतात; घाटे पिवळसर-तपकिरी होऊन हलवल्यास दाण्यांचा आवाज येतो',
        HI: 'पौधा सूख जाए, पत्तियां गिर जाएं और फलियों को हिलाने पर दाने खड़खड़ाएं'
      }
    },
    tomato: {
      seedRate: {
        EN: '125 - 150 g/ha (Hybrid seeds for nursery); Raised bed spacing: 90 cm x 60 cm with staking',
        MR: '१२५ ते १५० ग्रॅम/हेक्टर (संकरित बियाणे रोपवाटिका); गादीवाफ्यावर ९० x ६० सेंमी, तारेवर आधार',
        HI: '१२५ से १५० ग्राम/हेक्टेयर संकरित बीज; ९० x ६० सेमी दूरी पर रोपाई'
      },
      duration: {
        EN: '120 - 140 Days; First picking begins 60-70 days after transplanting (8-10 pickings)',
        MR: '१२० ते १४० दिवस; पुनर्लागवडीनंतर ६० ते ७० दिवसांनी पहिली तोडणी सुरू होऊन २ महिने चालते',
        HI: '१२० से १४० दिन; पहली तुड़ाई ६०-७० दिन में'
      },
      climate: {
        EN: '18°C - 28°C; Moderate temperature with low humidity to avoid fungal blights',
        MR: '१८°C ते २८°C; मध्यम तापमान, जास्त आर्द्रता किंवा कडक उन्हाळा टाळावा',
        HI: '१८°C से २८°C; मध्यम तापमान'
      },
      soilPh: {
        EN: 'pH 6.0 - 7.5 (Fertile red loam or rich sandy loam with abundant organic compost)',
        MR: 'सामू ६.० ते ७.५ (पाण्याचा उत्तम निचरा होणारी सुपीक मध्यम ते भारी काळी किंवा तांबडी जमीन)',
        HI: 'pH ६.० से ७.५ (जीवांशयुक्त अच्छी जल निकास वाली दोमट मिट्टी)'
      },
      yield: {
        EN: '180 - 250 Quintals/acre (Up to 300 Q/acre under drip, mulching & trellis)',
        MR: '१८० ते २५० क्विंटल/एकर (ठिबक, मल्चिंग व तार-बांबू आधाराने ३०० क्विंटलपर्यंत विक्रमी उत्पादन)',
        HI: '१८० से २५० क्विंटल/एकड़'
      },
      npk: {
        EN: '150:100:100 kg/ha N:P:K + Fertigation of 19:19:19 and Calcium Nitrate + Boron',
        MR: '१५०:१००:१०० किलो/हेक्टर नत्र, स्फुरद, पालाश + १९:१९:१९ व कॅल्शियम नायट्रेट + बोरॉन',
        HI: '१५०:१००:१०० किग्रा/हेक्टेयर NPK + बोरॉन एवं कैल्शियम'
      },
      pestWatch: {
        EN: 'Fruit Borer, Whitefly, Tuta absoluta (Pinworm), Early/Late Blight, Leaf Curl Virus (ToLCV)',
        MR: 'फळ पोखरणारी अळी, पांढरी माशी, नागअळी (टुटा), लवकर व उशिरा येणारा करपा, पर्णगुच्छ (चुरडा-मुरडा)',
        HI: 'फल छेदक, सफेद मक्खी, अगेती एवं पछेती झुलसा, लीफ कर्ल वायरस'
      },
      harvestSigns: {
        EN: 'For distant markets: Breaker stage (pink star at blossom end); Local sales: Firm red ripe',
        MR: 'लांबच्या बाजारासाठी: फळाच्या देठाजवळ गुलाबी-लालसर छटा दिसताच (ब्रेकर स्टेज); स्थानिकसाठी: पूर्ण लाल',
        HI: 'दूर के बाजार के लिए: गुलाबी रंग आने पर; स्थानीय बाजार के लिए: लाल पके फल'
      }
    }
  };

  /**
   * Helper to retrieve agronomic profile for a given crop and language
   */
  function getAgronomicProfile(crop, lang) {
    const l = (lang || 'EN').toUpperCase();
    const nameStr = `${crop.nameEn || ''} ${crop.nameMr || ''} ${crop.nameHi || ''}`.toLowerCase();

    let key = 'cotton';
    if (nameStr.includes('cotton') || nameStr.includes('कापूस') || nameStr.includes('कपास')) key = 'cotton';
    else if (nameStr.includes('soybean') || nameStr.includes('सोयाबीन')) key = 'soybean';
    else if (nameStr.includes('sugar') || nameStr.includes('ऊस') || nameStr.includes('गन्ना')) key = 'sugarcane';
    else if (nameStr.includes('onion') || nameStr.includes('कांदा') || nameStr.includes('प्याज')) key = 'onion';
    else if (nameStr.includes('wheat') || nameStr.includes('गहू') || nameStr.includes('गेहूं')) key = 'wheat';
    else if (nameStr.includes('turmeric') || nameStr.includes('हळद') || nameStr.includes('हल्दी')) key = 'turmeric';
    else if (nameStr.includes('pomegranate') || nameStr.includes('डाळिंब') || nameStr.includes('अनार')) key = 'pomegranate';
    else if (nameStr.includes('jowar') || nameStr.includes('sorghum') || nameStr.includes('ज्वारी') || nameStr.includes('ज्वार')) key = 'jowar';
    else if (nameStr.includes('gram') || nameStr.includes('chickpea') || nameStr.includes('हरभरा') || nameStr.includes('चना')) key = 'gram';
    else if (nameStr.includes('tomato') || nameStr.includes('टोमॅटो') || nameStr.includes('टमाटर')) key = 'tomato';
    else {
      return {
        seedRate: l === 'MR' ? 'प्रमाणित बियाणे प्रमाण (कृषी विद्यापीठ शिफारस)' : (l === 'HI' ? 'प्रमाणित बीज दर (विश्वविद्यालय अनुशंसित)' : 'Standard certified seed rate'),
        duration: crop.suitableSeason === 'Perennial' ? (l === 'MR' ? 'बहुवार्षिक (१+ वर्ष)' : 'Perennial (1+ Year)') : (l === 'MR' ? '९० ते १२० दिवस' : '90 - 120 Days'),
        climate: l === 'MR' ? '१८°C ते ३२°C; मध्यम ते उष्ण हवामान' : '18°C - 32°C; Moderate to warm climate',
        soilPh: l === 'MR' ? 'सामू ६.० ते ७.५; पाण्याचा चांगला निचरा होणारी सुपीक जमीन' : 'pH 6.0 - 7.5; Well-drained fertile loam',
        yield: l === 'MR' ? 'प्रादेशिक सरासरी उत्पादन' : 'Standard regional yield potential',
        npk: l === 'MR' ? 'माती परीक्षणानुसार संतुलित खत वापर' : 'Soil-test based balanced NPK schedule',
        pestWatch: l === 'MR' ? 'रसशोषक किडी, पाने खाणारी अळी व बुरशीजन्य रोग' : 'Monitor common sucking pests, foliar blights & borers',
        harvestSigns: l === 'MR' ? 'पीक पक्व झाल्यावर व आर्द्रता कमी झाल्यावर काढणी करावी' : 'Harvest when grains/pods reach physiological maturity'
      };
    }

    const data = AGRONOMY_PROFILES[key];
    return {
      seedRate: data.seedRate[l] || data.seedRate.EN,
      duration: data.duration[l] || data.duration.EN,
      climate: data.climate[l] || data.climate.EN,
      soilPh: data.soilPh[l] || data.soilPh.EN,
      yield: data.yield[l] || data.yield.EN,
      npk: data.npk[l] || data.npk.EN,
      pestWatch: data.pestWatch[l] || data.pestWatch.EN,
      harvestSigns: data.harvestSigns[l] || data.harvestSigns.EN
    };
  }

  /**
   * Check Authentication status and update Navbar
   */
  function checkAuth() {
    const isAuthed = (typeof Auth !== 'undefined' && Auth.isAuthenticated());
    const loginBtn = document.getElementById('loginNavBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const dashboardLink = document.getElementById('navDashboardLink');

    if (isAuthed) {
      if (loginBtn) loginBtn.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'inline-flex';
      if (dashboardLink) dashboardLink.style.display = 'inline-flex';
    } else {
      if (loginBtn) loginBtn.style.display = 'inline-flex';
      if (logoutBtn) logoutBtn.style.display = 'none';
      if (dashboardLink) dashboardLink.style.display = 'none';
    }
    return true; // Allow guest access for crop hub & advisory
  }

  /**
   * Helper to get localized crop name
   */
  function getLocalizedName(crop, lang) {
    const l = (lang || currentLanguage || 'EN').toUpperCase();
    if (l === 'MR' && crop.nameMr) return crop.nameMr;
    if (l === 'HI' && crop.nameHi) return crop.nameHi;
    return crop.nameEn || crop.nameMr || crop.nameHi;
  }

  /**
   * Helper to get secondary multilingual subtitle
   */
  function getSecondaryNames(crop, lang) {
    const l = (lang || currentLanguage || 'EN').toUpperCase();
    if (l === 'MR') {
      return `${crop.nameEn} | ${crop.nameHi}`;
    } else if (l === 'HI') {
      return `${crop.nameEn} | ${crop.nameMr}`;
    } else {
      return `${crop.nameMr} | ${crop.nameHi}`;
    }
  }

  /**
   * UI State Switchers
   */
  function showLoading() {
    elements.loading.style.display = 'block';
    elements.empty.style.display = 'none';
    elements.error.style.display = 'none';
    elements.grid.style.display = 'none';
  }

  function showEmpty() {
    elements.loading.style.display = 'none';
    elements.empty.style.display = 'block';
    elements.error.style.display = 'none';
    elements.grid.style.display = 'none';
    elements.countBadge.textContent = '0 ' + I18n.getTranslation('crops_count_suffix', 'Crops');
  }

  function showError(msg) {
    elements.loading.style.display = 'none';
    elements.empty.style.display = 'none';
    elements.error.style.display = 'block';
    elements.grid.style.display = 'none';
    const errText = document.getElementById('errorMessageText');
    if (errText && msg) {
      errText.textContent = msg;
    }
  }

  function showContent() {
    elements.loading.style.display = 'none';
    elements.empty.style.display = 'none';
    elements.error.style.display = 'none';
    elements.grid.style.display = 'flex';
  }

  /**
   * Fetch crops from backend API
   */
  async function loadCrops() {
    if (!checkAuth()) return;

    showLoading();

    const keyword = elements.searchInput.value.trim();
    const category = elements.categoryFilter.value;
    const season = elements.seasonFilter.value;
    currentLanguage = I18n.getCurrentLang() || 'EN';

    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (category) params.append('category', category);
    if (season) params.append('season', season);
    if (currentLanguage) params.append('language', currentLanguage);

    const queryString = params.toString() ? `?${params.toString()}` : '';

    try {
      const response = await Api.get(`/api/v1/crops${queryString}`);
      if (response && response.success) {
        allCrops = response.data || [];
        renderCropCards(allCrops);
      } else {
        showError(response?.message || 'Failed to fetch crop data.');
      }
    } catch (error) {
      console.error('Error loading crops:', error);
      showError(error.message || 'Unable to connect to the server.');
    }
  }

  /**
   * Render crop cards into the DOM
   */
  function renderCropCards(crops) {
    if (!crops || crops.length === 0) {
      showEmpty();
      return;
    }

    elements.countBadge.textContent = `${crops.length} ${I18n.getTranslation('crops_count_suffix', 'Crops')}`;
    elements.grid.innerHTML = '';

    crops.forEach(crop => {
      const col = document.createElement('div');
      col.className = 'col-12 col-md-6 col-lg-4';

      const localizedTitle = getLocalizedName(crop, currentLanguage);
      const secondaryTitle = getSecondaryNames(crop, currentLanguage);

      const profile = getAgronomicProfile(crop, currentLanguage);

      col.innerHTML = `
        <div class="crop-card">
          <div class="crop-card-header">
            <div>
              <h5 class="crop-title-main">${Utils.escapeHtml(localizedTitle)}</h5>
              <div class="crop-title-sub">${Utils.escapeHtml(secondaryTitle)}</div>
            </div>
            <span class="badge-category">${Utils.escapeHtml(crop.category || '')}</span>
          </div>

          <div class="d-flex align-items-center gap-2 mb-2">
            <span class="badge-season">${Utils.escapeHtml(crop.suitableSeason || '')}</span>
          </div>

          <div class="crop-meta-grid">
            <div class="crop-meta-item">
              <div class="crop-meta-label">
                <i class="bi bi-layers text-success"></i> <span data-i18n="crop_meta_soil">Soil</span>
              </div>
              <div class="crop-meta-value text-truncate" title="${Utils.escapeHtml(crop.soilRequirements || '-')}">
                ${Utils.escapeHtml(crop.soilRequirements || '-')}
              </div>
            </div>
            <div class="crop-meta-item">
              <div class="crop-meta-label">
                <i class="bi bi-droplet-fill text-primary"></i> <span data-i18n="crop_meta_water">Water</span>
              </div>
              <div class="crop-meta-value text-truncate" title="${Utils.escapeHtml(crop.waterRequirement || '-')}">
                ${Utils.escapeHtml(crop.waterRequirement || '-')}
              </div>
            </div>
            <div class="crop-meta-item">
              <div class="crop-meta-label">
                <i class="bi bi-hourglass-split text-warning"></i> <span data-i18n="crop_meta_duration">Duration</span>
              </div>
              <div class="crop-meta-value text-truncate" title="${Utils.escapeHtml(profile.duration)}">
                ${Utils.escapeHtml(profile.duration)}
              </div>
            </div>
            <div class="crop-meta-item">
              <div class="crop-meta-label">
                <i class="bi bi-graph-up-arrow text-success"></i> <span data-i18n="crop_meta_yield">Yield</span>
              </div>
              <div class="crop-meta-value text-truncate" title="${Utils.escapeHtml(profile.yield)}">
                ${Utils.escapeHtml(profile.yield)}
              </div>
            </div>
          </div>

          <p class="crop-desc-preview">${Utils.escapeHtml(crop.description || '')}</p>

          <button type="button" class="btn-view-crop mt-auto" onclick="CropApp.openCropModal(${crop.id})">
            <i class="bi bi-eye"></i> <span data-i18n="crop_btn_view_details">View Details & Advisories</span>
          </button>
        </div>
      `;

      elements.grid.appendChild(col);
    });

    showContent();
  }

  /**
   * Open & load crop details in the modal
   */
  async function openCropModal(cropId) {
    if (!cropDetailModalInstance) {
      cropDetailModalInstance = new bootstrap.Modal(elements.modal);
    }

    elements.modalLoading.style.display = 'block';
    elements.modalContent.style.display = 'none';
    cropDetailModalInstance.show();

    currentLanguage = I18n.getCurrentLang() || 'EN';

    try {
      const response = await Api.get(`/api/v1/crops/${cropId}?language=${currentLanguage}`);
      if (response && response.success && response.data) {
        renderModalContent(response.data);
      } else {
        elements.modalDescription.textContent = 'Crop details could not be loaded.';
        elements.modalLoading.style.display = 'none';
        elements.modalContent.style.display = 'block';
      }
    } catch (error) {
      console.error('Error fetching crop details:', error);
      elements.modalDescription.textContent = error.message || 'Error loading crop details.';
      elements.modalLoading.style.display = 'none';
      elements.modalContent.style.display = 'block';
    }
  }

  /**
   * Populate modal with detailed crop agronomy and advisories
   */
  function renderModalContent(crop) {
    const localizedTitle = getLocalizedName(crop, currentLanguage);
    const secondaryTitle = getSecondaryNames(crop, currentLanguage);
    const profile = getAgronomicProfile(crop, currentLanguage);
    elements.modalCropName.textContent = localizedTitle;
    elements.modalMultilingualNames.textContent = secondaryTitle;
    elements.modalCategoryBadge.textContent = crop.category || '';
    elements.modalSeasonBadge.textContent = crop.suitableSeason || '';
    elements.modalDescription.textContent = crop.description || 'No description available.';
    elements.modalSoil.textContent = (crop.soilRequirements ? crop.soilRequirements + ' • ' : '') + profile.soilPh;
    elements.modalWater.textContent = crop.waterRequirement || 'Standard irrigation schedule';
    if (elements.modalSeedRate) elements.modalSeedRate.textContent = profile.seedRate;
    if (elements.modalDuration) elements.modalDuration.textContent = profile.duration;
    if (elements.modalClimate) elements.modalClimate.textContent = profile.climate;
    if (elements.modalYield) elements.modalYield.textContent = profile.yield;
    if (elements.modalNpk) elements.modalNpk.textContent = profile.npk;
    if (elements.modalPestWatch) elements.modalPestWatch.textContent = profile.pestWatch;
    if (elements.modalHarvestSigns) elements.modalHarvestSigns.textContent = profile.harvestSigns;

    // Advisories list
    const advisories = crop.verifiedContents || [];
    elements.modalAdvisoryCount.textContent = `${advisories.length} ${I18n.getTranslation('modal_advisories_count_suffix', 'Advisories')}`;

    elements.modalAdvisoriesContainer.innerHTML = '';
    if (advisories.length === 0) {
      elements.modalAdvisoriesContainer.innerHTML = `
        <div class="text-center py-3 text-muted">
          <i class="bi bi-info-circle fs-4 d-block mb-1"></i>
          <span data-i18n="modal_no_advisories">No verified advisories currently published for this crop.</span>
        </div>
      `;
    } else {
      advisories.forEach(advisory => {
        const item = document.createElement('div');
        item.className = 'advisory-item';
        item.innerHTML = `
          <div class="advisory-item-title">
            <span>${Utils.escapeHtml(advisory.title)}</span>
            <div class="d-flex gap-1">
              <span class="badge bg-light text-dark border">${Utils.escapeHtml(advisory.category || 'General')}</span>
              <span class="badge bg-success-subtle text-success border border-success-subtle">${Utils.escapeHtml(advisory.language || '')}</span>
            </div>
          </div>
          <div class="advisory-item-body">${Utils.escapeHtml(advisory.contentBody)}</div>
        `;
        elements.modalAdvisoriesContainer.appendChild(item);
      });
    }

    elements.modalLoading.style.display = 'none';
    elements.modalContent.style.display = 'block';
  }

  /**
   * Reset all search and filter fields
   */
  function resetFilters() {
    elements.searchInput.value = '';
    elements.clearSearchBtn.style.display = 'none';
    elements.categoryFilter.value = '';
    elements.seasonFilter.value = '';
    loadCrops();
  }

  /**
   * Bind DOM event listeners
   */
  function initEvents() {
    // Search input with debounce
    elements.searchInput.addEventListener('input', e => {
      const val = e.target.value;
      elements.clearSearchBtn.style.display = val ? 'block' : 'none';

      clearTimeout(searchDebounceTimeout);
      searchDebounceTimeout = setTimeout(() => {
        loadCrops();
      }, 300);
    });

    // Clear search button
    elements.clearSearchBtn.addEventListener('click', () => {
      elements.searchInput.value = '';
      elements.clearSearchBtn.style.display = 'none';
      loadCrops();
    });

    // Dropdown filters
    elements.categoryFilter.addEventListener('change', () => loadCrops());
    elements.seasonFilter.addEventListener('change', () => loadCrops());

    // Reset buttons
    elements.resetBtn.addEventListener('click', resetFilters);
    elements.emptyResetBtn.addEventListener('click', resetFilters);
    elements.retryBtn.addEventListener('click', loadCrops);

    // Logout
    if (elements.logoutBtn) {
      elements.logoutBtn.addEventListener('click', () => {
        Auth.logout();
      });
    }

    // Tabs & Mode Switching
    const tabCatBtn = document.getElementById('tabCatalogBtn');
    if (tabCatBtn) tabCatBtn.addEventListener('click', () => switchMode('catalog'));

    const tabRecBtn = document.getElementById('tabRecommendBtn');
    if (tabRecBtn) tabRecBtn.addEventListener('click', () => switchMode('recommend'));

    const standaloneForm = document.getElementById('standaloneRecForm');
    if (standaloneForm) {
      standaloneForm.addEventListener('submit', (e) => {
        e.preventDefault();
        runStandaloneRecommendation();
      });
    }

    if (window.location.hash === '#recommend' || window.location.hash === '#recommendation') {
      switchMode('recommend');
    }
    window.addEventListener('hashchange', () => {
      if (window.location.hash === '#recommend' || window.location.hash === '#recommendation') {
        switchMode('recommend');
      } else {
        switchMode('catalog');
      }
    });

    // Language switcher handler (when i18n changes language)
    document.addEventListener('change', e => {
      if (e.target && e.target.classList.contains('lang-select')) {
        currentLanguage = e.target.value;
        renderCropCards(allCrops);
        if (hasRunStandaloneRec) {
          runStandaloneRecommendation();
        }
      }
    });
  }

  let hasRunStandaloneRec = false;

  function switchMode(mode) {
    const catalogSec = document.getElementById('cropCatalogSection');
    const recSec = document.getElementById('cropRecommendationSection');
    const tabCat = document.getElementById('tabCatalogBtn');
    const tabRec = document.getElementById('tabRecommendBtn');

    if (mode === 'recommend') {
      if (catalogSec) catalogSec.style.display = 'none';
      if (recSec) recSec.style.display = 'block';
      if (tabCat) tabCat.classList.remove('active');
      if (tabRec) tabRec.classList.add('active');
      if (window.location.hash !== '#recommend') {
        history.replaceState(null, '', '#recommend');
      }
      if (!hasRunStandaloneRec) {
        runStandaloneRecommendation();
      }
    } else {
      if (catalogSec) catalogSec.style.display = 'block';
      if (recSec) recSec.style.display = 'none';
      if (tabCat) tabCat.classList.add('active');
      if (tabRec) tabRec.classList.remove('active');
      if (window.location.hash === '#recommend') {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
  }

  async function runStandaloneRecommendation() {
    hasRunStandaloneRec = true;
    const season = document.getElementById('standaloneRecSeason')?.value || 'Kharif';
    const soilType = document.getElementById('standaloneRecSoil')?.value || 'Black Soil';
    const waterAvailability = document.getElementById('standaloneRecWater')?.value || 'Medium';
    const district = document.getElementById('standaloneRecDistrict')?.value.trim() || 'Maharashtra';

    const loadingEl = document.getElementById('standaloneRecLoading');
    const emptyEl = document.getElementById('standaloneRecEmpty');
    const gridEl = document.getElementById('standaloneRecResultsGrid');

    if (loadingEl) loadingEl.style.display = 'block';
    if (emptyEl) emptyEl.style.display = 'none';
    if (gridEl) {
      gridEl.style.display = 'none';
      gridEl.innerHTML = '';
    }

    try {
      const activeLang = (currentLanguage || localStorage.getItem('sks_language') || localStorage.getItem('preferred_language') || 'EN').toUpperCase();
      const payload = {
        season,
        soilType,
        waterAvailability,
        district,
        language: activeLang
      };

      const res = await Api.post('/api/v1/advisory/recommend-crops', payload);
      if (loadingEl) loadingEl.style.display = 'none';

      if (res && res.success && res.data) {
        const crops = res.data;
        if (!crops || crops.length === 0) {
          if (emptyEl) emptyEl.style.display = 'block';
          return;
        }

        if (gridEl) {
          gridEl.innerHTML = crops.map(c => `
            <div class="col-12 col-md-6 col-lg-4">
              <div class="rec-result-card">
                <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                  <div>
                    <h5 class="fw-bold text-success mb-0">${Utils.escapeHtml(getLocalizedName(c, currentLanguage))}</h5>
                    <div class="small text-muted">${Utils.escapeHtml(getSecondaryNames(c, currentLanguage))}</div>
                  </div>
                  <span class="rec-match-score flex-shrink-0">
                    <i class="bi bi-patch-check-fill me-1"></i> ${c.matchPercentage}%
                  </span>
                </div>
                <p class="text-dark small flex-grow-1 mb-3">${Utils.escapeHtml(c.recommendationReason)}</p>
                <div class="bg-light p-2 rounded mb-3 small text-muted">
                  <div class="d-flex justify-content-between mb-1">
                    <span><strong>Category:</strong> ${Utils.escapeHtml(c.category)}</span>
                    <span><strong>Season:</strong> ${Utils.escapeHtml(c.suitableSeason)}</span>
                  </div>
                  <div class="text-truncate"><strong>Soil:</strong> ${Utils.escapeHtml(c.soilRequirements || '-')}</div>
                  <div><strong>Water:</strong> ${Utils.escapeHtml(c.waterRequirement || '-')}</div>
                </div>
                <button type="button" class="btn btn-view-crop" onclick="CropApp.openCropModal(${c.cropId})">
                  <i class="bi bi-book-half"></i> Full Cultivation Details
                </button>
              </div>
            </div>
          `).join('');
          gridEl.style.display = 'flex';
        }
      } else {
        if (emptyEl) emptyEl.style.display = 'block';
      }
    } catch (err) {
      if (loadingEl) loadingEl.style.display = 'none';
      if (emptyEl) {
        emptyEl.style.display = 'block';
        const p = emptyEl.querySelector('p');
        if (p) p.textContent = err.message || 'Failed to fetch recommendations.';
      }
    }
  }

  /**
   * Initialization
   */
  function init() {
    checkAuth();
    initEvents();
    loadCrops();
  }

  return {
    init,
    openCropModal,
    loadCrops,
    switchMode,
    runStandaloneRecommendation
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  CropApp.init();
});
