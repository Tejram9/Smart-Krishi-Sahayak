/**
 * Smart Krishi Sahayak - Crop Disease & Pest Advisory Data & Match Engine
 * Authentic agricultural guidance based on ICAR, SAUs (MPKV Rahuri, VNMKV Parbhani, PDKV Akola),
 * CIBRC registered package of practices, and State Agriculture Departments.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CropDiseaseAdvisoryData = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  // SVG Icons for Crop & Category Indicators
  const ICONS = {
    crop: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="advisory-icon"><path d="M12 22V8M12 8C12 5 15 3 18 3c0 3-2 6-6 5zm0 0C12 5 9 3 6 3c0 3 2 6 6 5z"/></svg>`,
    disease: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="advisory-icon"><circle cx="12" cy="12" r="6"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>`,
    pest: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="advisory-icon"><path d="m8 2 1.88 1.88M14.12 3.88 16 2M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9M6.53 9C4.6 8.8 3 7.1 3 5M6 13H2M3 21c0-2.1 1.7-3.9 3.8-4M20.97 5c0 2.1-1.6 3.8-3.5 4M18 13h4M17.2 17c2.1.1 3.8 1.9 3.8 4"/></svg>`,
    deficiency: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="advisory-icon"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/><path d="M12 10v4M12 18h.01"/></svg>`,
    other: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="advisory-icon"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>`,
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="advisory-icon"><path d="M20 6L9 17l-5-5"/></svg>`,
    alert: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="advisory-icon"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`
  };

  // Supported crops library covering all 10 existing crops in the application
  const SUPPORTED_CROPS = [
    {
      id: 'cotton',
      name: { en: 'Cotton', mr: 'कापूस', hi: 'कपास' },
      category: 'Commercial',
      categoryLabel: { en: 'Commercial Cash Crop', mr: 'व्यापारी नगदी पीक', hi: 'व्यावसायिक नकदी फसल' },
      season: 'Kharif',
      seasonLabel: { en: 'Kharif (Monsoon)', mr: 'खरीप हंगाम', hi: 'खरीफ मौसम' },
      icon: 'bi-flower3',
      description: {
        en: 'High-value fiber and cash crop cultivated extensively in Maharashtra (Vidarbha, Marathwada, Khandesh).',
        mr: 'महाराष्ट्रातील विदर्भ, मराठवाडा व खान्देशात मोठ्या प्रमाणावर घेतले जाणारे महत्त्वाचे नगदी धागा पीक.',
        hi: 'महाराष्ट्र के विदर्भ, मराठवाड़ा और खानदेश में बड़े पैमाने पर उगाई जाने वाली प्रमुख नकदी रेशा फसल।'
      }
    },
    {
      id: 'soybean',
      name: { en: 'Soybean', mr: 'सोयाबीन', hi: 'सोयाबीन' },
      category: 'Commercial',
      categoryLabel: { en: 'Oilseed & Protein Crop', mr: 'गळीतधान्य व प्रथिनयुक्त पीक', hi: 'तिलहन एवं दलहन फसल' },
      season: 'Kharif',
      seasonLabel: { en: 'Kharif (Monsoon)', mr: 'खरीप हंगाम', hi: 'खरीफ मौसम' },
      icon: 'bi-record-circle',
      description: {
        en: 'Major rainfed oilseed and protein crop forming the backbone of farmers in Marathwada and Vidarbha.',
        mr: 'मराठवाडा व विदर्भातील शेतकऱ्यांचे प्रमुख नगदी व तेलबिया पीक.',
        hi: 'मराठवाड़ा और विदर्भ के किसानों की प्रमुख तिलहनी और नकदी फसल।'
      }
    },
    {
      id: 'sugarcane',
      name: { en: 'Sugarcane', mr: 'ऊस', hi: 'गन्ना' },
      category: 'Commercial',
      categoryLabel: { en: 'Perennial Cash Crop', mr: 'बारमाही नगदी पीक', hi: 'बारहमासी नकदी फसल' },
      season: 'Perennial',
      seasonLabel: { en: 'Perennial / Adsali / Suru', mr: 'बारमाही / आडसाली / सुरू', hi: 'बारहमासी / अड़साली / सुरू' },
      icon: 'bi-slash-circle',
      description: {
        en: 'Prominent agro-industrial cash crop with high water and nutrient dynamics across Western Maharashtra.',
        mr: 'पश्चिम महाराष्ट्रातील प्रमुख बागायती व साखर उद्योगाला कच्चा माल देणारे नगदी पीक.',
        hi: 'पश्चिम महाराष्ट्र की प्रमुख सिंचित एवं कृषि-औद्योगिक नकदी फसल।'
      }
    },
    {
      id: 'onion',
      name: { en: 'Onion', mr: 'कांदा', hi: 'प्याज' },
      category: 'Vegetables',
      categoryLabel: { en: 'Vegetable & Bulb Crop', mr: 'भाजीपाला व कंद पीक', hi: 'सब्जी एवं कंद फसल' },
      season: 'Rabi / Kharif',
      seasonLabel: { en: 'Rabi / Late Kharif', mr: 'रब्बी / रांगडा / खरीप', hi: 'रबी / खरीफ / पछेती खरीफ' },
      icon: 'bi-egg',
      description: {
        en: 'Crucial horticultural crop of Nashik, Pune, and Ahmednagar prone to foliar blights and thrips.',
        mr: 'नाशिक, पुणे, अहमदनगर भागातील प्रमुख बागायती पीक; करपा व फुलकिडे किडीसाठी संवेदनशील.',
        hi: 'नासिक, पुणे और अहमदनगर की प्रमुख बागवानी फसल; झुलसा और थ्रिप्स के प्रति संवेदनशील।'
      }
    },
    {
      id: 'wheat',
      name: { en: 'Wheat', mr: 'गहू', hi: 'गेहूं' },
      category: 'Cereals',
      categoryLabel: { en: 'Cereal Grain', mr: 'अन्नधान्य तृणधान्य', hi: 'प्रमुख खाद्यान्न' },
      season: 'Rabi',
      seasonLabel: { en: 'Rabi (Winter)', mr: 'रब्बी हंगाम (हिवाळा)', hi: 'रबी मौसम (शीतकाल)' },
      icon: 'bi-feather',
      description: {
        en: 'Essential winter cereal grain requiring cool dry conditions, susceptible to rusts and smuts.',
        mr: 'थंड हवामानात येणारे महत्त्वाचे रब्बी अन्नधान्य पीक; तांबेरा व काजळी रोगासाठी विशेष दक्षता आवश्यक.',
        hi: 'सर्दियों का प्रमुख खाद्यान्न; रतुआ (गेरुआ) और कंडुआ रोग से संरक्षण आवश्यक।'
      }
    },
    {
      id: 'turmeric',
      name: { en: 'Turmeric', mr: 'हळद', hi: 'हल्दी' },
      category: 'Commercial',
      categoryLabel: { en: 'Spice & Medicinal', mr: 'मसाला व औषधी पीक', hi: 'मसाला एवं औषधीय फसल' },
      season: 'Kharif',
      seasonLabel: { en: 'Kharif (Long Duration)', mr: 'खरीप (दीर्घकालीन)', hi: 'खरीफ (दीर्घकालिक)' },
      icon: 'bi-sun',
      description: {
        en: 'High-value rhizome spice extensively grown in Sangli, Hingoli, and Nanded vulnerable to rhizome rot.',
        mr: 'सांगली, हिंगोली, नांदेड भागात पिकवले जाणारे मौल्यवान मसाला पीक; कंदकुज रोग व्यवस्थापन अतिशय महत्त्वाचे.',
        hi: 'सांगली, हिंगोली और नांदेड़ की मूल्यवान मसाला फसल; कंद सड़न से बचाव अत्यंत महत्वपूर्ण।'
      }
    },
    {
      id: 'pomegranate',
      name: { en: 'Pomegranate', mr: 'डाळिंब', hi: 'अनार' },
      category: 'Fruits',
      categoryLabel: { en: 'Arid Horticultural Fruit', mr: 'फळबाग पीक', hi: 'फल बागवानी फसल' },
      season: 'Perennial',
      seasonLabel: { en: 'Perennial (Ambe/Mrig/Hasta Bahar)', mr: 'बारमाही (आंबे / मृग / हस्त बहार)', hi: 'बारहमासी (अंबे / मृग / हस्त बहार)' },
      icon: 'bi-circle-half',
      description: {
        en: 'Premium export-oriented fruit crop of Solapur, Nashik, and Sangli sensitive to bacterial blight (Telya).',
        mr: 'सोलापूर, नाशिक, सांगली भागातील निर्यातक्षम फळबाग; तेलकट डाग (तैलिया) रोगासाठी तत्काळ व्यवस्थापन गरजेचे.',
        hi: 'सोलापुर, नासिक की उच्च मूल्य निर्यात फसल; जीवाणु झुलसा (तैलिया) से विशेष सतर्कता आवश्यक।'
      }
    },
    {
      id: 'jowar',
      name: { en: 'Jowar (Sorghum)', mr: 'ज्वारी', hi: 'ज्वार' },
      category: 'Cereals',
      categoryLabel: { en: 'Nutri-Cereal / Millet', mr: 'पौष्टिक भरडधान्य', hi: 'पोषक मोटा अनाज' },
      season: 'Kharif / Rabi',
      seasonLabel: { en: 'Kharif & Rabi (Maldandi)', mr: 'खरीप व रब्बी (मालदांडी)', hi: 'खरीफ एवं रबी (मालदांडी)' },
      icon: 'bi-droplet',
      description: {
        en: 'Drought-hardy nutrient-rich staple cereal grown in dryland zones facing shoot fly and grain mold.',
        mr: 'कोरडवाहू भागातील पौष्टिक व दुष्काळ सोसणारे मुख्य अन्नधान्य पीक; खोडमाशी व कणसावरील बुरशी प्रमुख समस्या.',
        hi: 'सूखा-रोधी पोषक खाद्यान्न; तना मक्खी और दाना फफूंद से सुरक्षा आवश्यक।'
      }
    },
    {
      id: 'gram',
      name: { en: 'Gram (Chickpea)', mr: 'हरभरा (चना)', hi: 'चना (हरभरा)' },
      category: 'Pulses',
      categoryLabel: { en: 'Pulse / Legume', mr: 'कडधान्य / डाळवर्गीय', hi: 'दलहन फसल' },
      season: 'Rabi',
      seasonLabel: { en: 'Rabi (Post-Monsoon)', mr: 'रब्बी हंगाम', hi: 'रबी मौसम' },
      icon: 'bi-shield-check',
      description: {
        en: 'Vital nitrogen-fixing pulse of Maharashtra frequently challenged by Fusarium wilt and pod borer.',
        mr: 'जमीन सुपीक करणारे महत्त्वाचे रब्बी कडधान्य पीक; मर रोग व घाटे अळी व्यवस्थापन उत्पादन वाढीसाठी आवश्यक.',
        hi: 'मिट्टी की उर्वरता बढ़ाने वाली प्रमुख रबी दलहनी फसल; उकठा और फली छेदक मुख्य कीट/रोग हैं।'
      }
    },
    {
      id: 'tomato',
      name: { en: 'Tomato', mr: 'टोमॅटो', hi: 'टमाटर' },
      category: 'Vegetables',
      categoryLabel: { en: 'Solanaceous Vegetable', mr: 'भाजीपाला पीक', hi: 'सब्जी फसल' },
      season: 'Round the Year',
      seasonLabel: { en: 'Kharif / Rabi / Summer', mr: 'खरीप / रब्बी / उन्हाळी', hi: 'खरीफ / रबी / जायद' },
      icon: 'bi-circle',
      description: {
        en: 'High-intensity vegetable susceptible to leaf curl virus, early/late blight, and blossom end rot.',
        mr: 'मोठ्या प्रमाणावर पिकवला जाणारा भाजीपाला; पाने चुरमुरणे (व्हायरस), करपा आणि कॅल्शियम कमतरता सामान्य.',
        hi: 'व्यापक रूप से उगाई जाने वाली सब्जी; पर्ण कुंचन वायरस, झुलसा और फल सड़न से सुरक्षा जरूरी।'
      }
    }
  ];

  // Verified Disease, Pest, and Deficiency Structured Library
  const DISEASE_PEST_ENTRIES = [
    // 1. Cotton - Pink Bollworm
    {
      id: 'cotton-pink-bollworm',
      cropId: 'cotton',
      cropName: { en: 'Cotton', mr: 'कापूस', hi: 'कपास' },
      name: { en: 'Pink Bollworm', mr: 'गुलाबी बोंडअळी', hi: 'गुलाबी सुंडी' },
      scientificName: 'Pectinophora gossypiella (Saunders)',
      category: 'pest',
      categoryLabel: { en: 'Insect Pest', mr: 'कीड / किटक', hi: 'कीट' },
      affectedParts: ['flower', 'fruit'],
      affectedPartsLabel: { en: 'Flower Buds, Squares, Green Bolls', mr: 'पात्या, फुले व हिरवी बोंडे', hi: 'फूल, कलियां और गूलर' },
      symptoms: {
        en: [
          'Rosetted flowers that fail to open normally into flat blooms',
          'Small micro-punctures on 20-30 day old green bolls that seal with plant sap',
          'Interiors of developing bolls show chewed locules, damaged fiber, and stained lint',
          'Immature bolls drop prematurely or open prematurely with unfertilized locules'
        ],
        mr: [
          'पात्या व फुलांचे पाकळ्यांचे टोक एकत्र गुंफून गुलाब कळीसारखी (Rosetted) फुले दिसतात',
          '२० ते ३० दिवसांच्या कोवळ्या बोंडांवर बारीक छिद्र पडून डिंकासारखा स्त्राव पाझरतो',
          'बोंडाच्या आत बिया पोखरलेल्या असतात आणि कापूस खराब व पिवळसर-तपकिरी पडतो',
          'अपरिपक्व बोंडे अकाली गळून पडतात किंवा अपूर्ण उमलतात'
        ],
        hi: [
          'फूलों की पंखुड़ियां आपस में जुड़कर गुलाब के फूल जैसी (रोसेट) बन जाती हैं',
          '२० से ३० दिन के कच्चे गूलर पर सूक्ष्म छिद्र बनते हैं और रस रिसकर सूख जाता है',
          'गूलर के भीतर रेशे और बीज नष्ट हो जाते हैं तथा बिनौले खोखले हो जाते हैं',
          'गूलर समय से पहले खिल जाते हैं और कपास की गुणवत्ता खराब हो जाती है'
        ]
      },
      symptomKeywords: ['rosetted flower', 'bollworm', 'punctured bolls', 'stained lint', 'कळी', 'बोंड', 'अळी', 'गुलाब कळी', 'सुंडी', 'गूलर'],
      typicalConditions: {
        en: 'Late squaring and boll formation stages (45-120 days), moderate temperatures (24-30°C) with intermittent rain and cloudy weather.',
        mr: 'पीक ४५ ते १२० दिवसांचे असताना, दमट हवामान, अधूनमधून पाऊस आणि ढगाळ वातावरण.',
        hi: 'फसल की ४५ से १२० दिन की अवस्था, मध्यम तापमान (२४-३०°C) और उमस भरा बादलों वाला मौसम।'
      },
      prevention: {
        en: [
          'Sow certified non-Bt refuge seeds along borders as recommended',
          'Complete sowing within a 15-day window to break the pest reproductive cycle',
          'Avoid extending the crop season beyond 140-150 days (avoid ratoon cotton)',
          'Install pheromone traps @ 2 traps/acre at 45 days after sowing for timely monitoring'
        ],
        mr: [
          'शिफारस केलेले नॉन-बीटी रिफ्युज बियाणे बांधाभोवती आवर्जून लावावे',
          'पेरणी १५ दिवसांच्या मर्यादित कालावधीत पूर्ण करावी जेणेकरून किडीचा जीवनक्रम खंडित होईल',
          'कापसाचे पीक १४०-१५० दिवसांच्या पुढे वाढवू नये (फरदड कापूस घेणे टाळावे)',
          'पेरणीनंतर ४५ दिवसांनी एकरी २ कामगंध सापळे केवळ देखरेखीसाठी लावावेत'
        ],
        hi: [
          'खेत की सीमाओं पर अनुशंसित नॉन-बीटी रिफ्यूज बीज अवश्य लगाएं',
          'बुवाई १५ दिनों के भीतर एक साथ पूरी करें ताकि कीट चक्र टूट सके',
          'फसल को १४०-१५० दिनों से अधिक न खींचे (फरदड़ या रैटून फसल न लें)',
          'बुवाई के ४५ दिन बाद प्रति एकड़ २ फेरोमोन ट्रैप केवल निगरानी के लिए लगाएं'
        ]
      },
      integratedManagement: {
        cultural: {
          en: [
            'Collect and destroy rosetted flowers by burying them deep in soil',
            'Graze sheep or goats after final harvest to consume remnant unopened bolls',
            'Deep summer ploughing to expose hibernating larvae to sunlight and birds'
          ],
          mr: [
            'गुलाब कळी दिसणारी फुले तोडून खोल जमिनीत गाडून नष्ट करावीत',
            'शेवटच्या वेचणीनंतर शेतात शेळ्या-मेंढ्या चरवून उरलेली बोंडे संपवावीत',
            'उन्हाळ्यात खोल नांगरट करून जमिनीतील कोश उन्हात व पक्ष्यांच्या भक्ष्यासाठी उघडे करावेत'
          ],
          hi: [
            'रोसेट फूलों को हाथ से तोड़कर मिट्टी में गहरा दबा दें',
            'अंतिम चुनाई के बाद बकरियों या भेड़ों को चराकर शेष गूलर नष्ट करें',
            'गर्मी में गहरी जुताई करें ताकि सुंडी के प्यूपा धूप और चिड़ियों द्वारा नष्ट हों'
          ]
        },
        biologicalMechanical: {
          en: [
            'Erect 8-10 pheromone traps per acre for mass trapping if catches cross 8 moths/trap/night',
            'Spray 5% Neem Seed Kernel Extract (NSKE) or Neem Oil 1500 ppm @ 5 ml/liter at square stage',
            'Release egg parasitoid Trichogramma bactrae @ 60,000/acre at weekly intervals during peak egg-laying'
          ],
          mr: [
            'सापळ्यात सलग ३ रात्री ८ किंवा अधिक पतंग आढळल्यास एकरी ८-१० कामगंध सापळे लावावेत',
            'पात्या लागण्याच्या अवस्थेत ५% निंबोळी अर्क किंवा १५०० पीपीएम निमतेल ५ मिली प्रति लिटर पाण्यात मिसळून फवारावे',
            'अंडी अवस्थेतील नियंत्रणासाठी ट्रायकोकार्ड्स (ट्रायकोग्रामा बॅक्ट्री) एकरी ६०,००० प्रति आठवडा सोडावेत'
          ],
          hi: [
            'यदि ट्रैप में लगातार ३ रात ८ से अधिक पतंगे आएं तो प्रति एकड़ ८-१० फेरोमोन ट्रैप लगाएं',
            'कली अवस्था में ५% नीम बीज अर्क या नीम तेल (१५०० ppm) ५ मिली प्रति लीटर पानी में छिड़कें',
            'अंडे नष्ट करने हेतु ट्राइकोग्रामा परजीवी कार्ड ६०,००० प्रति एकड़ की दर से लगाएं'
          ]
        },
        chemicalCautionGuidance: {
          en: 'Apply chemical measures strictly when Economic Threshold Level (ETL) is breached (8 moths/trap/night for 3 consecutive days or 10% damaged green bolls). Do not mix arbitrary pesticides. Check CIBRC registered label claims for cotton pink bollworm and consult your local KVK / Taluka Agriculture Officer before spraying.',
          mr: 'केवळ आर्थिक नुकसान पातळी (ETL) ओलांडल्यावरच (सलग ३ दिवस कामगंध सापळ्यात ८ पतंग किंवा १०% हिरवी बोंडे बाधित) रासायनिक फवारणीचा विचार करावा. कोणतेही कीटकनाशक स्वतःच्या मनाने मिसळू नये. सीआयबीआरसी (CIBRC) नोंदणीकृत लेबल क्लेम तपासा व स्थानिक कृषी विज्ञान केंद्र (KVK) अथवा तालुका कृषी अधिकाऱ्यांच्या सल्ल्यानुसारच योग्य द्रावण वापरावे.',
          hi: 'रासायनिक छिड़काव केवल तभी करें जब आर्थिक क्षति स्तर (ETL) पार हो (लगातार ३ दिन ट्रैप में ८ पतंगे या १०% गूलर ग्रसित हों)। कीटनाशकों का मनमाना मिश्रण न बनाएं। CIBRC पंजीकृत लेबल दावों का पालन करें और स्थानीय केवीके/कृषि अधिकारी से सलाह लें।'
        }
      },
      expertConsultationSigns: {
        en: [
          'More than 15-20% green bolls sampled show internal feeding holes',
          'Standard pheromone catches remain persistently high (>20 moths/trap) after biological control',
          'Premature boll opening and widespread locule rotting across large field tracts'
        ],
        mr: [
          'नमुन्यात तपासलेल्या २० पैकी ३ पेक्षा जास्त हिरव्या बोंडात अळी किंवा खाल्लेल्या खाणाखुणा दिसल्यास',
          'जैविक उपायानंतरही सापळ्यांमध्ये दररोज २० पेक्षा जास्त पतंग सतत अडकत राहिल्यास',
          'मोठ्या प्रमाणावर बोंडे अकाली सडून शेतात गळून पडू लागल्यास'
        ],
        hi: [
          'नमूने में जांचे गए गूलरों में १५-२०% से अधिक में आंतरिक क्षति दिखाई दे',
          'जैविक नियंत्रण के बाद भी ट्रैप में लगातार २० से अधिक पतंगे पकड़े जाएं',
          'खेत में बड़े पैमाने पर गूलर समय पूर्व सड़कर गिरने लगें'
        ]
      },
      safetyNotice: {
        en: 'Warning: This advisory is based on symptoms and ICAR IPM recommendations. Pesticide applications depend on field stage and CIBRC label directions. Always wear PPE masks and gloves.',
        mr: 'सूचना: हा सल्ला प्राथमिक लक्षणांवर आणि ICAR एकात्मिक कीड व्यवस्थापनावर आधारित आहे. फवारणीपूर्वी नेहमी संरक्षणात्मक मास्क व हातमोजे वापरा आणि स्थानिक कृषी अधिकाऱ्यांचा सल्ला घ्या.',
        hi: 'चेतावनी: यह सलाह लक्षणों और ICAR एकीकृत कीट प्रबंधन पर आधारित है। कीटनाशक प्रयोग से पहले सुरक्षा मास्क और दस्ताने पहनें तथा स्थानीय कृषि अधिकारी से मार्गदर्शन लें।'
      },
      authoritativeSource: {
        institution: {
          en: 'ICAR - Central Institute for Cotton Research (CICR), Nagpur',
          mr: 'आयसीएआर - केंद्रीय कापूस संशोधन संस्था (CICR), नागपूर',
          hi: 'भाकृअनुप - केंद्रीय कपास अनुसंधान संस्थान (CICR), नागपुर'
        },
        referenceDocument: {
          en: 'Integrated Pest Management Package of Practices for Cotton in Central India (ICAR-CICR)',
          mr: 'कापूस एकात्मिक कीड व्यवस्थापन कृषी कार्यपद्धती (आयसीएआर-सीआयसीआर व म.फु.कृ.वि. राहुरी)',
          hi: 'मध्य भारत हेतु कपास एकीकृत कीट प्रबंधन संदर्शिका (ICAR-CICR)'
        },
        portalUrl: 'https://cicr.icar.gov.in',
        portalName: 'ICAR-CICR Official Agriculture Portal'
      },
      aiModelClassId: 'cotton_pink_bollworm'
    },

    // 2. Cotton - Bacterial Blight / Angular Leaf Spot
    {
      id: 'cotton-bacterial-blight',
      cropId: 'cotton',
      cropName: { en: 'Cotton', mr: 'कापूस', hi: 'कपास' },
      name: { en: 'Bacterial Blight / Angular Leaf Spot', mr: 'कापसावरील करपा / काळा हात (बॅक्टेरियल ब्लाईट)', hi: 'जीवाणु झुलसा / कोणीय पत्ता धब्बा' },
      scientificName: 'Xanthomonas citri pv. malvacearum',
      category: 'disease',
      categoryLabel: { en: 'Bacterial Disease', mr: 'जिवाणूजन्य रोग', hi: 'जीवाणु रोग' },
      affectedParts: ['leaves', 'stem', 'fruit'],
      affectedPartsLabel: { en: 'Leaves, Petioles, Stems (Black Arm), Bolls', mr: 'पाने, देठ, फांद्या व बोंडे', hi: 'पत्ते, डंठल, तना और गूलर' },
      symptoms: {
        en: [
          'Angular water-soaked translucent lesions bounded strictly by small leaf veinlets',
          'Lesions turn dark reddish-brown to black on upper leaf surface',
          'Black elongated cankers on petiole and main stem causing twig breakage ("Black Arm" phase)',
          'Round dark water-soaked sunken spots on green bolls turning dark brown'
        ],
        mr: [
          'पानांच्या शिरांनी मर्यादित असलेले कोनीय, पाणी धरल्यासारखे पारदर्शक डाग पडतात',
          'डाग नंतर गडद लालसर-तपकिरी ते काळे होतात आणि पाने वाळून गळतात',
          'पानांचे देठ आणि फांद्यांवर काळे लांबट चट्टे पडतात, त्यामुळे फांद्या मोडतात (काळा हात अवस्था)',
          'हिरव्या बोंडांवर खोलगट काळे ठिपके पडून बोंडे सडतात'
        ],
        hi: [
          'पत्तियों की नसों से घिरे हुए कोणीय, जलसिक्त पारदर्शी धब्बे बनते हैं',
          'धब्बे बाद में गहरे लाल-भूरे या काले हो जाते हैं और पत्तियां सूखकर गिरती हैं',
          'डंठल और तनों पर काले लंबे घाव बन जाते हैं जिससे शाखाएं टूट जाती हैं ("ब्लैक आर्म" अवस्था)',
          'कच्चे गूलर पर गोल गहरे धंसे हुए धब्बे पड़ते हैं और गूलर सड़ने लगते हैं'
        ]
      },
      symptomKeywords: ['angular spots', 'black arm', 'water soaked', 'vein bounded', 'करपा', 'काळा हात', 'कोनीय डाग', 'झुलसा', 'काला तना'],
      typicalConditions: {
        en: 'Warm temperatures (28-34°C) with continuous high atmospheric humidity (>85%) and rain showers that splash bacterial cells.',
        mr: 'उबदार तापमान (२८-३४°C), हवेत जास्त आर्द्रता (>८५%) आणि पावसाचे थेंब उडाल्यामुळे जिवाणूंचा वेगाने प्रसार होतो.',
        hi: 'गर्म तापमान (२८-३४°C), अत्यधिक आर्द्रता (>८५%) और बारिश की बूंदों से जीवाणुओं का फैलाव।'
      },
      prevention: {
        en: [
          'Use acid-delinted and certified disease-free cotton seeds',
          'Seed treatment with Copper Oxychloride or hot water treatment prior to sowing',
          'Maintain proper plant spacing (90x30 cm or 120x45 cm) for good aeration',
          'Destroy crop residues from previous infected seasons thoroughly'
        ],
        mr: [
          'केवळ प्रमाणित व ऍसिड-डिलिंटेड (बियाण्यावरील लव काढलेले) बियाणे वापरावे',
          'पेरणीपूर्वी बियाण्यास कॉपर ऑक्सिक्लोराईड किंवा शिफारशीत जिवाणूनाशक प्रक्रिया करावी',
          'हवा खेळती राहण्यासाठी पिकात योग्य अंतर ठेवावे',
          'मागील हंगामातील पिकाचे अवशेष शेतातून पूर्णपणे गोळा करून नष्ट करावेत'
        ],
        hi: [
          'केवल प्रमाणित और एसिड-डिलिंटेड रोगमुक्त बीजों का प्रयोग करें',
          'बुवाई से पूर्व अनुशंसित बीजोपचार अवश्य करें',
          'हवा के संचरण हेतु पौधों के बीच उचित दूरी बनाए रखें',
          'पिछले मौसम के अवशेषों को खेत से बाहर निकालकर नष्ट करें'
        ]
      },
      integratedManagement: {
        cultural: {
          en: [
            'Avoid excessive nitrogen fertilization which causes succulent vulnerable growth',
            'Apply balanced potash (MOP) to enhance plant cell wall resistance',
            'Collect and burn fallen blighted foliage from field edges'
          ],
          mr: [
            'नत्राचा (युरिया) अतिवापर टाळावा, कारण जास्त कोवळी पालवी रोगास लगेच बळी पडते',
            'रोगाशी लढण्याची ताकद वाढवण्यासाठी पालाश खताचा (पोटॅश) संतुलित वापर करावा',
            'गळून पडलेली करपाग्रस्त पाने शेतातून गोळा करून नष्ट करावीत'
          ],
          hi: [
            'यूरिया (नाइट्रोजन) का अत्यधिक प्रयोग न करें, इससे कोमल पत्तियां जल्दी रोगग्रस्त होती हैं',
            'पौधे की प्रतिरोधक क्षमता बढ़ाने के लिए पोटाश का संतुलित प्रयोग करें',
            'खेत में गिरे रोगग्रस्त पत्तों को इकट्ठा कर नष्ट करें'
          ]
        },
        biologicalMechanical: {
          en: [
            'Foliar application of Pseudomonas fluorescens @ 10 g/liter or 5 ml/liter at first sign of spots',
            'Apply enriched vermicompost inoculated with beneficial antagonistic microbes'
          ],
          mr: [
            'प्राथमिक डाग दिसताच स्युडोमोनास फ्लुरोसन्स जिवाणू १० ग्रॅम किंवा ५ मिली प्रति लिटर पाण्यात मिसळून फवारावे',
            'जमिनीतून जैविक घटकांनी समृद्ध गांडूळखत द्यावे'
          ],
          hi: [
            'प्रारंभिक लक्षण दिखते ही स्यूडोमोनास फ्लोरोसेंस १० ग्राम प्रति लीटर पानी में छिड़कें',
            'खेत में जैविक खाद और मित्र सूक्ष्मजीवों का प्रयोग करें'
          ]
        },
        chemicalCautionGuidance: {
          en: 'If blight spreads aggressively during heavy rains, spray Copper Oxychloride 50% WP (25-30 g per 10 L water) along with Streptocycline or Plantomycin (1 to 1.5 g per 10 L water) as recommended by ICAR-CICR and SAUs. Always check label claim, avoid continuous repeated antibiotic sprays, and consult your Agriculture Officer for waiting periods.',
          mr: 'रोग वेगाने पसरत असल्यास ICAR आणि कृषी विद्यापीठाच्या शिफारशीनुसार कॉपर ऑक्सिक्लोराईड ५०% WP (२५-३० ग्रॅम प्रति १० लिटर पाणी) अधिक स्ट्रेप्टोमायसीन सल्फेट किंवा प्लँटोमायसीन (१ ते १.५ ग्रॅम प्रति १० लिटर पाणी) फवारावे. सतत अँटिबायोटिक फवारणी करू नये. स्थानिक कृषी विज्ञान केंद्र (KVK) च्या सल्ल्यानेच वापर करावा.',
          hi: 'तेजी से फैलने पर आईसीएआर/विश्वविद्यालय अनुसार कॉपर ऑक्सीक्लोराइड २५-३० ग्राम प्रति १० लीटर पानी में स्ट्रेप्टोमाइसिन/प्लांटोमाइसिन १-१.५ ग्राम मिलाकर छिड़कें। लेबल निर्देशों का पालन करें और स्थानीय केवीके से परामर्श लें।'
        }
      },
      expertConsultationSigns: {
        en: [
          'Main stem develops black girdling lesions causing lodging of upper branches',
          'Blight symptoms appear on more than 30% crop canopy within 48-72 hours of rain',
          'Extensive rot on immature bolls with premature locule death'
        ],
        mr: [
          'मुख्य खोडावर काळा पट्टा पडून फांद्या वाळू लागल्यास व मोडू लागल्यास',
          'पावसानंतर २ ते ३ दिवसांत शेतातील ३०% पेक्षा जास्त झाडांवर तीव्र करपा पसरल्यास',
          'बोंडांवर काळे खोलगट डाग पडून बोंडे काळी पडू लागल्यास'
        ],
        hi: [
          'मुख्य तने पर काले घाव बनने से शाखाएं टूटकर सूखने लगें',
          'बारिश के २-३ दिनों में ३०% से अधिक पौधों पर काले धब्बे फैल जाएं',
          'कच्चे गूलर तेजी से काले पड़कर सड़ने लगें'
        ]
      },
      safetyNotice: {
        en: 'Caution: Streptocycline/antibiotics must be used strictly per registered agricultural label directions and never at arbitrary dosages. Consult your KVK agronomist.',
        mr: 'दक्षता सूचना: जिवाणूनाशकांचा वापर केवळ अधिकृत लेबल क्लेमनुसारच करावा. औषधांचे मनमानी प्रमाण वापरू नका. जवळच्या कृषी सहाय्यकाशी चर्चा करा.',
        hi: 'सावधानी: जीवाणुनाशक का उपयोग केवल लेबल पर दी गई अनुशंसित मात्रा में ही करें। अपने स्थानीय कृषि अधिकारी से पुष्टि करें।'
      },
      authoritativeSource: {
        institution: {
          en: 'Mahatma Phule Krishi Vidyapeeth (MPKV), Rahuri & ICAR-CICR',
          mr: 'महात्मा फुले कृषी विद्यापीठ (राहुरी) व आयसीएआर-सीआयसीआर',
          hi: 'महात्मा फुले कृषि विद्यापीठ (राहुरी) एवं आईसीएआर-सीआईसीआर'
        },
        referenceDocument: {
          en: 'Package of Practices for Kharif Crops: Cotton Diseases (MPKV Extension Bulletin)',
          mr: 'खरीप पिके कीड व रोग नियंत्रण मार्गदर्शिका (म.फु.कृ.वि. राहुरी विस्तार पुस्तिका)',
          hi: 'खरीफ फसल सुरक्षा संदर्शिका (एमपीकेवी राहुरी एवं आईसीएआर)'
        },
        portalUrl: 'https://mpkv.ac.in',
        portalName: 'MPKV Rahuri Agriculture University Portal'
      },
      aiModelClassId: 'cotton_bacterial_blight'
    },

    // 3. Cotton - Lalya / Magnesium Deficiency
    {
      id: 'cotton-magnesium-deficiency',
      cropId: 'cotton',
      cropName: { en: 'Cotton', mr: 'कापूस', hi: 'कपास' },
      name: { en: 'Magnesium Deficiency ("Lalya" / Reddening of Leaves)', mr: 'कापसातील लाल्या (मॅग्नेशियम कमतरता)', hi: 'कपास में लाल्या रोग (मैग्नीशियम की कमी)' },
      scientificName: 'Physiological / Abiotic Nutrient Deficiency (Mg Deficiency)',
      category: 'deficiency',
      categoryLabel: { en: 'Nutrient Deficiency', mr: 'पोषकद्रव्य कमतरता', hi: 'पोषक तत्व की कमी' },
      affectedParts: ['leaves'],
      affectedPartsLabel: { en: 'Lower & Middle Mature Leaves', mr: 'खालची व मधली जुनी पाने', hi: 'निचली एवं मध्यम परिपक्व पत्तियां' },
      symptoms: {
        en: [
          'Interveinal chlorosis starting on older lower leaves while veins remain green',
          'Chlorotic leaf blade areas turn bright purple-red to bronze under intense sunlight',
          'Leaves become brittle, curl downward, and drop prematurely',
          'Square formation slows and boll weight remains underdeveloped'
        ],
        mr: [
          'पानांच्या मुख्य शिरा हिरव्या राहून शिरांमधील भाग पिवळसर पडतो',
          'उन्हाच्या तडाख्यामुळे शिरांमधील पिवळा भाग नंतर गर्द जांभळट-लाल (लाल्या) होतो',
          'पाने कडक व ठिसूळ बनून खाली वाकतात आणि अकाली गळून पडतात',
          'झाडाची वाढ खुंटते आणि बोंडांचे वजन कमी भरते'
        ],
        hi: [
          'पत्तियों की मुख्य नसें हरी रहती हैं और बीच का भाग पीला पड़ता है',
          'धूप में पत्तियों का पीला हिस्सा गहरा लाल-बैंगनी हो जाता है (लाल्या)',
          'पत्तियां कड़ी व भंगुर होकर नीचे मुड़ती हैं और समय से पहले झड़ जाती हैं',
          'गूलर का आकार छोटा रहता है और पैदावार प्रभावित होती है'
        ]
      },
      symptomKeywords: ['red leaves', 'purple', 'magnesium', 'interveinal chlorosis', 'lalya', 'लाल्या', 'लाल पाने', 'मॅग्नेशियम', 'पत्ते लाल होना'],
      typicalConditions: {
        en: 'Boll development and maturity stage (65-105 days) on light or leached soils, heavy rains followed by bright dry sun, or high potassium fertilizer imbalance.',
        mr: 'बोंडे भरण्याच्या काळात (६५-१०५ दिवस), हलक्या जमिनीत, सततच्या पावसानंतर अचानक कडक ऊन पडल्यास किंवा पोटॅश खताचा अतिरेकी वापर झाल्यास.',
        hi: 'गूलर भरने की अवस्था (६५-१०५ दिन), हल्की बलुई मिट्टी, भारी बारिश के बाद तेज धूप, या पोटाश के अत्यधिक असंतुलन से।'
      },
      prevention: {
        en: [
          'Conduct routine soil testing before sowing to identify exchangeable magnesium levels',
          'Incorporate balanced farmyard manure (FYM) or compost (5 tonnes/ha)',
          'Apply soil-grade Magnesium Sulphate (20-25 kg/ha) at sowing or first top-dressing in deficient soils'
        ],
        mr: [
          'पेरणीपूर्वी माती परीक्षण करून जमिनीतील मॅग्नेशियमचे प्रमाण तपासावे',
          'जमिनीत चांगले कुजलेले शेणखत किंवा कंपोस्ट खत एकरी २ ट्रॅक्टर मिसळावे',
          'कमतरता असणाऱ्या जमिनीत पेरणीवेळी किंवा खतांच्या पहिल्या मात्रेसोबत मॅग्नेशियम सल्फेट एकरी १० किलो द्यावे'
        ],
        hi: [
          'बुवाई से पहले मिट्टी परीक्षण कराएं ताकि मैग्नीशियम की कमी पहचानी जा सके',
          'खेत में पर्याप्त मात्रा में सड़ी गोबर की खाद मिलाएं',
          'कमी वाले क्षेत्रों में बुवाई के समय मैग्नीशियम सल्फेट ८-१० किलो प्रति एकड़ दें'
        ]
      },
      integratedManagement: {
        cultural: {
          en: [
            'Maintain optimal soil moisture; avoid waterlogging followed by severe soil moisture stress',
            'Maintain balanced NPK ratio (avoid excessive Potassium which blocks Magnesium uptake)'
          ],
          mr: [
            'जमिनीत वाफसा स्थिती राखावी; पाणी साचू देऊ नये किंवा तीव्र पाण्याचा ताण पडू देऊ नये',
            'संतुलित खतांचा वापर करावा (अतिरिक्त पोटॅशमुळे मॅग्नेशियम शोषणात अडथळा येतो)'
          ],
          hi: [
            'खेत में जलभराव न होने दें और न ही अत्यधिक सूखा पड़ने दें',
            'संतुलित उर्वरकों का प्रयोग करें'
          ]
        },
        biologicalMechanical: {
          en: [
            'Soil application of mycorrhiza and organic humus to enhance root micronutrient absorption'
          ],
          mr: [
            'मुळांची अन्नद्रव्य शोषणक्षमता वाढवण्यासाठी मायकोरायझा व ह्युमिक ऍसिडचा योग्य वापर करावा'
          ],
          hi: [
            'जड़ों द्वारा पोषक तत्वों के बेहतर अवशोषण हेतु माइकोराइजा का प्रयोग करें'
          ]
        },
        chemicalCautionGuidance: {
          en: 'Foliar spray of Magnesium Sulphate (MgSO4 @ 10 g/liter or 1%) + Urea (10 g/liter or 1%) or 19:19:19 (5 g/L) at boll development stage (70-75 days and repeated at 90 days) as per university recommendation. Note: This is an abiotic nutritional deficiency; chemical insecticides or fungicides will not cure leaf reddening. Check product label directions and consult your local KVK or Agriculture Officer before purchasing remedies.',
          mr: 'लाल्याची लक्षणे दिसताच किंवा पीक ७० व ९० दिवसांचे असताना मॅग्नेशियम सल्फेट (१० ग्रॅम प्रति लिटर किंवा १%) अधिक युरिया (१० ग्रॅम प्रति लिटर किंवा १%) यांचे द्रावण फवारावे. लक्षात ठेवा: लाल्या हा कोणताही बुरशीजन्य रोग किंवा कीड नाही, त्यामुळे कीटकनाशके किंवा बुरशीनाशके फवारून पैसे वाया घालवू नयेत. स्थानिक कृषी विज्ञान केंद्र (KVK) अथवा कृषी अधिकाऱ्यांचा सल्ला घ्यावा.',
          hi: 'लक्षण दिखते ही मैग्नीशियम सल्फेट (१० ग्राम प्रति लीटर) और यूरिया (१० ग्राम प्रति लीटर) का घोल बनाकर छिड़काव करें। ध्यान रहे: यह कीट या फफूंद रोग नहीं बल्कि पोषक तत्व की कमी है; इस पर अनावश्यक कीटनाशक न छिड़कें। स्थानीय केवीके या कृषि अधिकारी से पुष्टि करें।'
        }
      },
      expertConsultationSigns: {
        en: [
          'Reddening is accompanied by leaf curling, sticky honeydew, or soot (suggesting sucking pests like jassids/whiteflies rather than pure deficiency)',
          'Foliar spray of MgSO4 fails to arrest leaf drop across >40% of the plot'
        ],
        mr: [
          'पाने लाल होण्यासोबतच पानांच्या कडा खाली वळलेल्या आणि चिकट स्त्राव दिसत असल्यास (हा तुडतुडे किंवा पांढऱ्या माशीचा प्रादुर्भाव असू शकतो)',
          'मॅग्नेशियम सल्फेट फवारणीनंतरही ४०% पेक्षा जास्त झाडांची पाने गळत असल्यास'
        ],
        hi: [
          'पत्ते लाल होने के साथ किनारों पर मुड़े हों और चिपचिपा पदार्थ दिखे (यह रस चूसक कीटों का लक्षण हो सकता है)',
          'मैग्नीशियम छिड़काव के बाद भी खेत में भारी पत्ती झड़ने की समस्या बनी रहे'
        ]
      },
      safetyNotice: {
        en: 'Safety Note: Never apply foliar fertilizers during peak afternoon sun to prevent leaf scorching. Spray during cool morning or evening hours.',
        mr: 'दक्षता सूचना: दुपारच्या कडक उन्हात विद्राव्य खतांची फवारणी करू नये; पाने करपू शकतात. फवारणी नेहमी सकाळी किंवा संध्याकाळी थंड वातावरणात करावी.',
        hi: 'सुरक्षा सूचना: दोपहर की तेज धूप में घुलनशील खादों का छिड़काव न करें; सुबह या शाम के ठंडे समय में ही छिड़कें।'
      },
      authoritativeSource: {
        institution: {
          en: 'Vasantrao Naik Marathwada Krishi Vidyapeeth (VNMKV), Parbhani & ICAR-CICR',
          mr: 'वसंतराव नाईक मराठवाडा कृषी विद्यापीठ (परभणी) व आयसीएआर-सीआयसीआर',
          hi: 'वसंतराव नाईक मराठवाड़ा कृषि विद्यापीठ (परभणी) एवं आईसीएआर'
        },
        referenceDocument: {
          en: 'Physiological Disorders and Micronutrient Management in Bt Cotton (VNMKV Research Advisory)',
          mr: 'कापूस पिकातील शरीरक्रियात्मक विकृती व अन्नद्रव्य व्यवस्थापन (वनामकृवि परभणी संशोधन पत्रिका)',
          hi: 'कपास में पोषक तत्व विकार एवं निवारण (वीएनएमकेवी परभणी)'
        },
        portalUrl: 'https://vnmkv.ac.in',
        portalName: 'VNMKV Parbhani Portal'
      },
      aiModelClassId: 'cotton_magnesium_deficiency'
    },

    // 4. Soybean - Soybean Rust
    {
      id: 'soybean-rust',
      cropId: 'soybean',
      cropName: { en: 'Soybean', mr: 'सोयाबीन', hi: 'सोयाबीन' },
      name: { en: 'Soybean Rust', mr: 'सोयाबीनवरील तांबेरा रोग', hi: 'सोयाबीन का गेरुआ / रतुआ रोग' },
      scientificName: 'Phakopsora pachyrhizi (Sydow)',
      category: 'disease',
      categoryLabel: { en: 'Fungal Disease', mr: 'बुरशीजन्य रोग', hi: 'फफूंद रोग' },
      affectedParts: ['leaves'],
      affectedPartsLabel: { en: 'Lower to Upper Leaves, Petioles', mr: 'खालची ते वरची पाने व देठ', hi: 'निचली से ऊपरी पत्तियां' },
      symptoms: {
        en: [
          'Pinhead-sized water-soaked spots that rapidly turn polygonal reddish-brown to tan pustules on lower leaf surface',
          'Raised volcanic-shaped pustules (uredinia) releasing powdery masses of rusty spores when rubbed',
          'Yellowing of foliage progressing rapidly upward from bottom leaves',
          'Severe premature defoliation leading to unfilled shriveled pods'
        ],
        mr: [
          'पानांच्या मागच्या बाजूला सुईच्या टोकासारखे बारीक तांबूस-तपकिरी रंगाचे पुरळ (पुळ्या) दिसतात',
          'बोटाने चोळल्यास बोटाला तांबूस-तपकिरी रंगाची पावडर (बुरशीचे बीजाणू) लागते',
          'खालून वरच्या बाजूला पाने पिवळी पडून संपूर्ण शेत तांबूस-पिवळे दिसू लागते',
          'झाडाची पाने अकाली गळतात आणि शेंगांमध्ये दाणे न भरता पोचट राहतात'
        ],
        hi: [
          'पत्तियों की निचली सतह पर सुई की नोक जैसे लाल-भूरे उभरे हुए दाने (फुंसियां) बनते हैं',
          'हाथ से रगड़ने पर उंगलियों पर तांबे या गेरुए रंग का चूर्ण लग जाता है',
          'पत्तियां तेजी से पीली पड़कर नीचे से ऊपर की ओर सूखने लगती हैं',
          'पत्तियां समय से पहले गिर जाती हैं और फलियां खाली रह जाती हैं'
        ]
      },
      symptomKeywords: ['rust', 'pustules', 'powdery spores', 'reddish brown', 'defoliation', 'तांबेरा', 'तपकिरी डाग', 'पावडर', 'गेरुआ', 'रतुआ'],
      typicalConditions: {
        en: 'Prolonged cloudy overcast weather, continuous drizzle, temperatures between 18-28°C with high relative humidity (>80%) at flowering and pod filling.',
        mr: 'फुलवरा व शेंगा भरण्याच्या अवस्थेत सतत ढगाळ हवामान, रिमझिम पाऊस, १८ ते २८ अंश सेल्सिअस तापमान आणि हवेतील जास्त आर्द्रता.',
        hi: 'फूल और फली बनने के समय लगातार बादल, हल्की बूंदाबांदी, १८-२८°C तापमान और उच्च आर्द्रता।'
      },
      prevention: {
        en: [
          'Cultivate rust-tolerant varieties recommended by ICAR-IISR Indore and state universities',
          'Adopt timely sowing with optimum row spacing (45 cm) to facilitate sunlight penetration',
          'Seed treatment with Trichoderma or authorized carboxin + thiram formulations'
        ],
        mr: [
          'कृषी विद्यापीठाने शिफारस केलेल्या तांबेरा-प्रतिकारक जातींची पेरणी करावी',
          'वेळेवर पेरणी करावी आणि दोन ओळींत ४५ सेंमी अंतर ठेवून सूर्यप्रकाश खेळता ठेवावा',
          'पेरणीपूर्वी बियाण्यास ट्रायकोडर्मा किंवा कार्बोक्सिन + थायरम बुरशीनाशकाची बीजप्रक्रिया करावी'
        ],
        hi: [
          'आईसीएआर अनुशंसित रतुआ-प्रतिरोधी किस्मों की बुवाई करें',
          'समय पर ४५ सेमी कतार दूरी पर बुवाई करें ताकि धूप नीचे तक पहुंचे',
          'बुवाई से पूर्व ट्राइकोडर्मा या अनुशंसित फफूंदनाशक से बीजोपचार अवश्य करें'
        ]
      },
      integratedManagement: {
        cultural: {
          en: [
            'Maintain weed-free plots, particularly removing alternate leguminous weed hosts',
            'Avoid excessive vegetative canopy through balanced fertilizer use'
          ],
          mr: [
            'शेतातील तण काढून शेत स्वच्छ ठेवावे',
            'नत्राचा अतिरिक्त वापर टाळावा'
          ],
          hi: [
            'खेत को खरपतवार मुक्त रखें',
            'संतुलित खाद का प्रयोग करें'
          ]
        },
        biologicalMechanical: {
          en: [
            'Spray bio-fungicide Ampelomyces quisqualis or Trichoderma harzianum at early vegetative stage'
          ],
          mr: [
            'वाढीच्या सुरुवातीच्या अवस्थेत ट्रायकोडर्मा किंवा जैविक बुरशीनाशक फवारावे'
          ],
          hi: [
            'शुरुआती अवस्था में जैविक फफूंदनाशक का छिड़काव करें'
          ]
        },
        chemicalCautionGuidance: {
          en: 'On first observation of rust pustules in the area, apply CIBRC-registered fungicides such as Hexaconazole 5% EC (1 ml/L) or Propiconazole 25% EC (1 ml/L) or Tebuconazole 25.9% EC (1 ml/L) with sticker as per ICAR-IISR recommendations. Adhere to pre-harvest interval (PHI) and consult your local Agriculture Officer.',
          mr: 'परिसरात तांबेरा रोगाची पहिली पुळी दिसताच ICAR-IISR आणि कृषी विद्यापीठाच्या शिफारशीनुसार प्रोपिकोनाझोल २५% EC (१ मिली प्रति लिटर) किंवा टेब्युकोनाझोल २५.९% EC (१ मिली प्रति लिटर) किंवा हेक्साकोनाझोल ५% EC (१ मिली प्रति लिटर) स्टीकरसह फवारावे. औषधाचा प्रतीक्षा काळ (PHI) पाळावा आणि कृषी अधिकाऱ्यांचा सल्ला घ्यावा.',
          hi: 'रोग के प्रारंभिक लक्षण दिखते ही अनुशंसित प्रोपिकोनाजोल या टेबुकोनाजोल १ मिली प्रति लीटर पानी में स्टीकर के साथ छिड़कें। लेबल पर दिए प्रतीक्षा काल (PHI) का ध्यान रखें।'
        }
      },
      expertConsultationSigns: {
        en: [
          'Pustules spread to more than 20% of leaf area across entire field before pod fill',
          'Defoliation starts accelerating despite initial fungicide spray'
        ],
        mr: [
          'शेंगा भरण्यापूर्वीच शेतातील २०% पेक्षा जास्त पानांवर तांबेऱ्याची पुरळ पसरल्यास',
          'फवारणीनंतरही पाने झपाट्याने गळू लागल्यास'
        ],
        hi: [
          'फली भरने से पहले २०% से अधिक पत्तियों पर लाल दाने फैल जाएं',
          'छिड़काव के बाद भी पत्तियां तेजी से झड़ना जारी रहे'
        ]
      },
      safetyNotice: {
        en: 'Safety Note: Wear rubber gloves and a face shield during fungicide handling. Do not wash spray equipment near drinking water sources.',
        mr: 'सुरक्षा सूचना: बुरशीनाशक हाताळताना हातमोजे व मास्क वापरा. फवारणीचे पंप पिण्याच्या पाण्याच्या स्रोताजवळ धुवू नका.',
        hi: 'सुरक्षा सूचना: फफूंदनाशक का छिड़काव करते समय दस्ताने और मास्क पहनें। पानी के स्रोतों को दूषित न करें।'
      },
      authoritativeSource: {
        institution: {
          en: 'ICAR - Indian Institute of Soybean Research (IISR), Indore',
          mr: 'आयसीएआर - भारतीय सोयाबीन संशोधन संस्था (IISR), इंदूर',
          hi: 'भाकृअनुप - भारतीय सोयाबीन अनुसंधान संस्थान (IISR), इंदौर'
        },
        referenceDocument: {
          en: 'Standard Package of Practices for Soybean Disease Management (ICAR-IISR)',
          mr: 'सोयाबीन पीक संरक्षण व रोग व्यवस्थापन मार्गदर्शिका (आयसीएआर-आयआयएसआर)',
          hi: 'सोयाबीन रोग एवं कीट प्रबंधन मार्गदर्शिका (ICAR-IISR इंदौर)'
        },
        portalUrl: 'https://iisrindore.icar.gov.in',
        portalName: 'ICAR-IISR Indore Portal'
      },
      aiModelClassId: 'soybean_rust'
    },

    // 5. Soybean - Girdle Beetle
    {
      id: 'soybean-girdle-beetle',
      cropId: 'soybean',
      cropName: { en: 'Soybean', mr: 'सोयाबीन', hi: 'सोयाबीन' },
      name: { en: 'Girdle Beetle', mr: 'सोयाबीनवरील चक्रीभुंगा (गर्डल बीटल)', hi: 'सोयाबीन का गर्डल बीटल (चक्रीय भृंग)' },
      scientificName: 'Obereopsis brevis (Gahan)',
      category: 'pest',
      categoryLabel: { en: 'Insect Pest', mr: 'कीड / किटक', hi: 'कीट' },
      affectedParts: ['stem', 'leaves'],
      affectedPartsLabel: { en: 'Petiole, Stem, Side Branches', mr: 'पानाचा देठ, मुख्य खोड व फांद्या', hi: 'डंठल, मुख्य तना और शाखाएं' },
      symptoms: {
        en: [
          'Female beetle cuts two distinct parallel ring-like girdles around the petiole or stem and deposits an egg between them',
          'Leaf or plant part above the girdled rings droops, wilts, turns brown, and dries up within 2-3 days',
          'Hatched larva bores internally through the stem pith making the plant hollow',
          'Infested stems break easily during wind or harvesting'
        ],
        mr: [
          'मादी भुंगा पानाच्या देठावर किंवा खोडावर दोन समांतर चक्रे (रिंगा) पाडून मधे अंडे घालतो',
          'चक्री पाडलेल्या भागाच्या वरील पान किंवा शेंडा कोमेजून वाळतो आणि उलटा लोंबकळतो',
          'अंड्यातून निघालेली अळी खोडाच्या आत शिरून पोकळ करून खाते',
          'बाधित रोपाचे खोड वाऱ्याने किंवा काढणीच्या वेळी सहज मोडते'
        ],
        hi: [
          'मादा कीट डंठल या तने पर दो समानांतर गोल छल्ले (चक्र) काटकर बीच में अंडा देती है',
          'छल्ले के ऊपर का भाग मुरझाकर सूख जाता है और उल्टा लटक जाता है',
          'अंडे से निकली सुंडी तने के अंदर सुरंग बनाकर गूदा खा जाती है',
          'प्रभावित पौधे हवा चलने पर बीच से टूट जाते हैं'
        ]
      },
      symptomKeywords: ['girdle', 'ring cut', 'drooping leaf', 'stem boring', 'चक्रीभुंगा', 'चक्रे', 'वाळलेला शेंडा', 'छल्ला', 'तना छेदक'],
      typicalConditions: {
        en: 'Vegetative to early flowering stage (25-50 days after sowing) during humid warm conditions following early monsoon rains.',
        mr: 'पेरणीनंतर २५ ते ५० दिवसांच्या दरम्यान, शाकीय वाढ व सुरुवातीचा फुलवरा, दमट व उबदार हवामान.',
        hi: 'बुवाई के २५ से ५० दिन बाद, वानस्पतिक वृद्धि से फूल आने तक, उमस भरा मौसम।'
      },
      prevention: {
        en: [
          'Destroy wild host weeds (e.g. Parthenium, Xanthium) along field borders',
          'Opt for seed treatment with certified insecticide formulations prior to sowing',
          'Deep summer ploughing to expose pupae to predatory birds'
        ],
        mr: [
          'बांधावरील गाजरगवत व इतर तणे काढून शेत स्वच्छ ठेवावे',
          'पेरणीपूर्वी शिफारशीत कीटकनाशकाची बीजप्रक्रिया करावी',
          'उन्हाळ्यात खोल नांगरट करून जमिनीत लपलेले कोष उघडे करावेत'
        ],
        hi: [
          'खेत की मेड़ों से खरपतवार नष्ट करें',
          'अनुशंसित कीटनाशक से बीजोपचार करें',
          'गर्मी में गहरी जुताई करें'
        ]
      },
      integratedManagement: {
        cultural: {
          en: [
            'Hand-pick and destroy girdled leaves or petiole clippings at first detection to eliminate larvae before they reach the main stem'
          ],
          mr: [
            'प्रादुर्भाव दिसताच चक्री पडलेले देठ किंवा शेंडे हाताने खुडून नष्ट करावेत, जेणेकरून अळी मुख्य खोडात शिरणार नाही'
          ],
          hi: [
            'शुरुआती लक्षण दिखते ही छल्ले कटे भागों को तोड़कर नष्ट करें ताकि सुंडी मुख्य तने तक न पहुंचे'
          ]
        },
        biologicalMechanical: {
          en: [
            'Spray 5% Neem Seed Kernel Extract (NSKE) or Neem Oil 1500 ppm @ 5 ml/liter water at 30 days after sowing'
          ],
          mr: [
            'पेरणीनंतर ३० दिवसांनी ५% निंबोळी अर्क किंवा निमतेल ५ मिली प्रति लिटर पाण्यात मिसळून फवारावे'
          ],
          hi: [
            'बुवाई के ३० दिन बाद ५% नीम बीज अर्क या नीम तेल का छिड़काव करें'
          ]
        },
        chemicalCautionGuidance: {
          en: 'When girdle infestation reaches Economic Threshold Level (5-10% plants with active girdles), spray CIBRC-registered products such as Chlorantraniliprole 18.5% SC (0.3 ml/L) or Thiamethoxam + Lambda-cyhalothrin (0.25 ml/L) as recommended by ICAR-IISR. Ensure thorough coverage and consult your Agriculture Extension Officer.',
          mr: 'आर्थिक नुकसान पातळी (५ ते १०% झाडांवर चक्रे) गाठल्यास ICAR-IISR व कृषी विद्यापीठाच्या शिफारशीनुसार क्लोरँट्रानिलीप्रोल १८.५% SC (३ मिली प्रति १० लिटर पाणी) फवारावे. कीटकनाशके लेबल क्लेमनुसारच वापरावीत.',
          hi: 'ईटीएल (५-१०% पौधों में चक्र) होने पर आईसीएआर अनुशंसित क्लोरेंट्रानिलिप्रोल या अन्य पंजीकृत कीटनाशक का उचित मात्रा में छिड़काव करें।'
        }
      },
      expertConsultationSigns: {
        en: [
          'More than 10-15% of the total plant stand displays stem girdling within a single week',
          'Larvae have already bored deep into the ground-level collar region'
        ],
        mr: [
          'एका आठवड्यात शेतातील १० ते १५% पेक्षा जास्त झाडांवर चक्रीभुंग्याचा प्रादुर्भाव दिसल्यास',
          'अळी जमिनीलगतच्या मुख्य खोडात शिरून झाडे आडवी पडू लागल्यास'
        ],
        hi: [
          'एक सप्ताह में १०-१५% से अधिक पौधों पर तना कटने के लक्षण दिखें',
          'सुंडी जमीन के पास मुख्य तने के अंदर पहुंच चुकी हो'
        ]
      },
      safetyNotice: {
        en: 'Warning: Follow safety pre-harvest intervals. Never spray during windy hours or near water bodies.',
        mr: 'दक्षता सूचना: वाऱ्याच्या विरुद्ध दिशेने फवारणी करू नका. सुरक्षित अंतर व प्रतीक्षा कालावधीचे काटेकोर पालन करा.',
        hi: 'चेतावनी: हवा की विपरीत दिशा में छिड़काव न करें और सुरक्षा निर्देशों का पालन करें।'
      },
      authoritativeSource: {
        institution: {
          en: 'ICAR - Indian Institute of Soybean Research (IISR), Indore',
          mr: 'आयसीएआर - भारतीय सोयाबीन संशोधन संस्था (IISR), इंदूर',
          hi: 'भाकृअनुप - भारतीय सोयाबीन अनुसंधान संस्थान (IISR), इंदौर'
        },
        referenceDocument: {
          en: 'Integrated Pest Management in Soybean (ICAR-IISR Technical Folder)',
          mr: 'सोयाबीन एकात्मिक कीड व्यवस्थापन (आयसीएआर-आयआयएसआर पुस्तिका)',
          hi: 'सोयाबीन एकीकृत कीट प्रबंधन (आईसीएआर-आईआईएसआर)'
        },
        portalUrl: 'https://iisrindore.icar.gov.in',
        portalName: 'ICAR-IISR'
      },
      aiModelClassId: 'soybean_girdle_beetle'
    },

    // 6. Sugarcane - Red Rot
    {
      id: 'sugarcane-red-rot',
      cropId: 'sugarcane',
      cropName: { en: 'Sugarcane', mr: 'ऊस', hi: 'गन्ना' },
      name: { en: 'Red Rot', mr: 'उसावरील तांबडे कूज (रेड रॉट)', hi: 'गन्ने का लाल सड़न रोग (रेड रॉट)' },
      scientificName: 'Colletotrichum falcatum (Glomerella tucumanensis)',
      category: 'disease',
      categoryLabel: { en: 'Fungal Disease', mr: 'बुरशीजन्य रोग', hi: 'फफूंद रोग' },
      affectedParts: ['stem', 'leaves', 'whole-plant'],
      affectedPartsLabel: { en: 'Internal Stalk Pith, Third/Fourth Leaf', mr: 'उसाचे आतील खोड (कांडी) व पाने', hi: 'गन्ने का भीतरी गूदा और पत्तियां' },
      symptoms: {
        en: [
          'Third or fourth leaf from crown loses turgidity and starts yellowing/withering from margin to tip',
          'Split cane internally exhibits dull red tissues interspersed with characteristic white cross bands',
          'Alcoholic/fermented sour vinous smell from split infected stalks',
          'Entire stool dries up and cane becomes lightweight, hollow, and brittle'
        ],
        mr: [
          'शेंड्याकडील तिसरे किंवा चौथे पान कडांकडून सुकायला लागते आणि हळूहळू संपूर्ण शेंडा पिवळा पडून वाळतो',
          'ऊस उभा चिरल्यास आतील कांडी लाल भडक दिसते आणि त्यावर आडवे पांढरे पट्टे स्पष्ट दिसतात',
          'ऊस चिरल्यावर आंबट, दारूसारखा दुर्गंध येतो',
          'उसाचे कांड पोकळ होते, वजन घटते आणि संपूर्ण बेट वाळून जाते'
        ],
        hi: [
          'ऊपर से तीसरी या चौथी पत्ती किनारों से पीली पड़कर सूखने लगती है',
          'गन्ने को चीरने पर भीतरी गूदा लाल दिखाई देता है और उस पर सफेद आड़े धब्बे मिलते हैं',
          'चीरे गए गन्ने से सिरके या शराब जैसी खट्टी गंध आती है',
          'गन्ना अंदर से खोखला व हल्का हो जाता है और पूरा थान सूख जाता है'
        ]
      },
      symptomKeywords: ['red rot', 'split cane', 'white cross bands', 'sour smell', 'withering', 'रेड रॉट', 'तांबडे कूज', 'पांढरे पट्टे', 'आंबट वास', 'लाल सड़न'],
      typicalConditions: {
        en: 'Waterlogged fields with poor drainage, monocropping with susceptible varieties, warm humid weather (27-32°C).',
        mr: 'पाण्याचा निचरा न होणारी शेती, शेतात पाणी साचून राहणे, उष्ण व दमट हवामान आणि एकाच वाणाची सलग लागवड.',
        hi: 'खेत में जलभराव, खराब जल निकासी, गर्म और नम मौसम (२७-३२°C)।'
      },
      prevention: {
        en: [
          'Plant certified disease-free sets sourced from registered seed nurseries',
          'Hot Water Treatment (HWT at 52°C for 30 minutes) or Aerated Steam Treatment of seed canes',
          'Treat sets with carbendazim (1 g/L) or Trichoderma viride before planting',
          'Avoid ratooning infected crops and practice 2-3 year crop rotation with paddy or green manure'
        ],
        mr: [
          'नेहमी निरोगी व प्रमाणित बेणे मळ्यातील बेणे वापरावे',
          'लागवडीपूर्वी बेण्यास उष्ण जलप्रक्रिया (५२ अंश से. ३० मिनिटे) करावी',
          'बेणे प्रक्रिया म्हणून बुरशीनाशक किंवा ट्रायकोडर्माच्या द्रावणात १०-१५ मिनिटे बुडवून लागवड करावी',
          'रोगट उसाचा खोडवा ठेवू नये; पीक फेरपालट करावी'
        ],
        hi: [
          'प्रमाणित नर्सरी से रोगमुक्त बीज गन्ने का चयन करें',
          'गर्म जल उपचार (५२°C पर ३० मिनट) कराएं',
          'बुवाई से पूर्व फफूंदनाशक या ट्राइकोडर्मा के घोल में बीज उपचार करें',
          'रोगग्रस्त फसल की पेड़ी न लें और फसल चक्र अपनाएं'
        ]
      },
      integratedManagement: {
        cultural: {
          en: [
            'Uproot entire infected stools along with roots and burn outside the field',
            'Ensure laser land leveling and deep drainage channels to prevent water stagnation'
          ],
          mr: [
            'रोगट बेट मुळासकट उपटून शेताबाहेर नेऊन जाळून नष्ट करावे',
            'शेतात पाणी साचणार नाही यासाठी योग्य उताराचे चर काढावेत'
          ],
          hi: [
            'रोगग्रस्त थानों को जड़ सहित उखाड़कर जला दें',
            'खेत में जल निकासी की समुचित व्यवस्था करें'
          ]
        },
        biologicalMechanical: {
          en: [
            'Soil application of Trichoderma harzianum @ 5 kg/ha blended with 500 kg well-decomposed farmyard manure at planting and earthing-up'
          ],
          mr: [
            'लागवडीच्या वेळी व बांधणीच्या वेळी ट्रायकोडर्मा बुरशी शेणखतात मिसळून जमिनीत द्यावी'
          ],
          hi: [
            'बुवाई और मिट्टी चढ़ाने के समय ट्राइकोडर्मा को गोबर की खाद में मिलाकर दें'
          ]
        },
        chemicalCautionGuidance: {
          en: 'Red rot cannot be cured once the fungus has invaded internal vascular bundles. Chemical management is restricted to preventive seed-set dipping with registered fungicides before planting. Do not attempt foliar sprays on standing infected canes; immediately contact VSI Pune or your District Sugarcane Officer.',
          mr: 'एकदा उसाच्या कांड्यात बुरशी शिरल्यास उभा ऊस बरा करण्यासाठी कोणतेही औषध उपलब्ध नाही. रासायनिक उपाय केवळ लागवडीपूर्वी बेणे प्रक्रियेपुरता मर्यादित आहे. उभ्या पिकावर फवारणी करून खर्च करू नका; तात्काळ वसंतदादा शुगर इन्स्टिट्यूट (VSI) किंवा साखर कारखान्याच्या कृषी अधिकाऱ्यांशी संपर्क साधा.',
          hi: 'खड़ी फसल में आंतरिक संक्रमण होने पर कोई रासायनिक छिड़काव कारगर नहीं है। रासायनिक नियंत्रण केवल बुवाई पूर्व बीज शोधन तक सीमित है। तुरंत चीनी मिल/कृषि वैज्ञानिक से संपर्क करें।'
        }
      },
      expertConsultationSigns: {
        en: [
          'Multiple cane clumps drying simultaneously across the field',
          'Internal red staining with sour odor observed in randomly sampled canes'
        ],
        mr: [
          'शेतातील अनेक उसाची बेटे एकाच वेळी सुकू लागल्यास',
          'ऊस चिरून पाहिल्यावर आत लाल रंग व आंबट वास आल्यास'
        ],
        hi: [
          'खेत में कई थान अचानक सूखने लगें और गन्ने में लाल धब्बे दिखें'
        ]
      },
      safetyNotice: {
        en: 'Notice: Never use sets from a red rot affected plot for planting or distribution to other farmers.',
        mr: 'सूचना: तांबडे कूज (रेड रॉट) झालेल्या शेतातील बेणे दुसऱ्या शेतात किंवा इतर शेतकऱ्यांना लागवडीसाठी कधीही देऊ नका.',
        hi: 'सूचना: लाल सड़न से ग्रसित खेत का गन्ना बीज हेतु कभी भी उपयोग न करें।'
      },
      authoritativeSource: {
        institution: {
          en: 'Vasantdada Sugar Institute (VSI), Pune & ICAR-SBI Coimbatore',
          mr: 'वसंतदादा शुगर इन्स्टिट्यूट (VSI), पुणे व आयसीएआर-एसबीआय कोईम्बतूर',
          hi: 'वसंतदादा शुगर इंस्टीट्यूट (VSI), पुणे एवं आईसीएआर-एसबीआई'
        },
        referenceDocument: {
          en: 'Sugarcane Crop Protection Manual (VSI Pune Advisory Bulletin)',
          mr: 'ऊस पीक संरक्षण व रोग व्यवस्थापन (व्हीएसआय पुणे मार्गदर्शिका)',
          hi: 'गन्ना फसल सुरक्षा संदर्शिका (वीएसआई पुणे)'
        },
        portalUrl: 'https://www.vsisugar.com',
        portalName: 'Vasantdada Sugar Institute (VSI)'
      },
      aiModelClassId: 'sugarcane_red_rot'
    },

    // 7. Onion - Purple Blotch
    {
      id: 'onion-purple-blotch',
      cropId: 'onion',
      cropName: { en: 'Onion', mr: 'कांदा', hi: 'प्याज' },
      name: { en: 'Purple Blotch (Karpa)', mr: 'कांद्यावरील जांभळा करपा (पर्पल ब्लॉच)', hi: 'प्याज का बैंगनी धब्बा / झुलसा (पर्पल ब्लॉच)' },
      scientificName: 'Alternaria porri (Ellis) Cif.',
      category: 'disease',
      categoryLabel: { en: 'Fungal Disease', mr: 'बुरशीजन्य रोग', hi: 'फफूंद रोग' },
      affectedParts: ['leaves', 'stem'],
      affectedPartsLabel: { en: 'Foliage Leaves, Seed Stalks', mr: 'पाने व डहाळे (बीज दांडे)', hi: 'पत्तियां और बीज डंठल' },
      symptoms: {
        en: [
          'Small whitish water-soaked sunken spots on leaves that rapidly enlarge into oval or elongated lesions',
          'Center of lesion turns characteristic purplish or dark reddish-brown surrounded by yellow chlorotic halo',
          'Lesions girdle the leaf or seed stalk causing it to break and fall over',
          'Extensive drying of leaf tips progressing downward, drastically reducing bulb size'
        ],
        mr: [
          'पानांवर सुरुवातीला पांढुरके, पाणी साचल्यासारखे खोलगट ठिपके पडतात',
          'नंतर ठिपक्यांचा मध्यभाग जांभळट ते तांबूस-तपकिरी होतो आणि भोवती पिवळसर कडा तयार होते',
          'डाग मोठे होऊन पानाला वेढतात, ज्यामुळे पान किंवा डहाळे मधेच वाकून मोडतात',
          'पाने टोकाकडून वाळत जातात, ज्यामुळे कांद्याची फुगवण थांबते व उत्पादन घटते'
        ],
        hi: [
          'पत्तियों पर छोटे सफेद जलसिक्त धब्बे बनते हैं जो बढ़कर अंडाकार हो जाते हैं',
          'धब्बे का मध्य भाग विशिष्ट बैंगनी या लाल-भूरा हो जाता है और किनारों पर पीला घेरा बनता है',
          'धब्बे बड़े होकर पत्ते या बीज डंठल को घेर लेते हैं जिससे वे बीच से टूट जाते हैं',
          'पत्तियां ऊपर से सूखने लगती हैं और कंद का आकार छोटा रह जाता है'
        ]
      },
      symptomKeywords: ['purple blotch', 'karpa', 'oval purple spots', 'leaf drying', 'onion karpa', 'करपा', 'जांभळा करपा', 'पाने वाळणे', 'झुलसा', 'बैंगनी धब्बा'],
      typicalConditions: {
        en: 'Warm humid weather (25-30°C) with prolonged leaf wetness (>10-12 hours) from morning dew, unseasonal rain, or dense planting.',
        mr: 'उष्ण व दमट हवामान (२५-३०°C), सकाळी पडणारे दाट धुके किंवा दव, अवकाळी पाऊस आणि शेतात जास्त काळ ओलावा राहणे.',
        hi: 'गर्म एवं आर्द्र मौसम (२५-३०°C), ओस या बारिश के कारण पत्तियों का अधिक समय तक गीला रहना।'
      },
      prevention: {
        en: [
          'Follow 2-3 year crop rotation avoiding garlic and other allium crops in rotation',
          'Raise seedlings on broad raised beds (BBF) to prevent standing water',
          'Dip seedling roots in Trichoderma harzianum or carbendazim suspension for 15 minutes before transplanting',
          'Ensure optimum spacing (15x10 cm) to avoid dense crowding'
        ],
        mr: [
          'कांद्याची फेरपालट लसूण किंवा कांदावर्गीय पिकांऐवजी तृणधान्य पिकांसोबत करावी',
          'रोपांची पुनर्लागवड गादीवाफ्यावर (BBF) करावी जेणेकरून अतिरिक्त पाणी निचरा होईल',
          'पुनर्लागवडीपूर्वी रोपांची मुळे ट्रायकोडर्मा किंवा शिफारशीत बुरशीनाशकाच्या द्रावणात १०-१५ मिनिटे बुडवावीत',
          'हवा खेळती राहण्यासाठी योग्य अंतरावर (१५ x १० सेंमी) लागवड करावी'
        ],
        hi: [
          'प्याज-लहसुन के बजाय गैर-एलियम फसलों के साथ फसल चक्र अपनाएं',
          'जलभराव से बचने हेतु उठी हुई क्यारियों पर रोपाई करें',
          'रोपाई से पहले पौध की जड़ों को अनुशंसित फफूंदनाशक या ट्राइकोडर्मा घोल में उपचारित करें',
          'उचित दूरी बनाए रखें'
        ]
      },
      integratedManagement: {
        cultural: {
          en: [
            'Avoid excessive split nitrogen (urea) applications near maturity',
            'Use micro-sprinklers carefully or shift to drip to minimize leaf canopy wetness'
          ],
          mr: [
            'कांदा पक्व होण्याच्या काळात युरियाचा अतिवापर टाळावा',
            'पानांवर पाणी साचून राहू नये यासाठी ठिबक सिंचनाचा वापर करावा'
          ],
          hi: [
            'कंद बनने के समय यूरिया का अधिक प्रयोग न करें',
            'पत्तियों को गीला रखने से बचाने के लिए टपक सिंचाई को प्राथमिकता दें'
          ]
        },
        biologicalMechanical: {
          en: [
            'Foliar spray of Trichoderma viride (5 g/L) + sticker at initial vegetative phase'
          ],
          mr: [
            'सुरुवातीच्या काळात ट्रायकोडर्मा ५ ग्रॅम प्रति लिटर पाण्यात स्टीकरसह फवारावे'
          ],
          hi: [
            'आरंभ में ट्राइकोडर्मा ५ ग्राम प्रति लीटर पानी में स्टीकर के साथ छिड़कें'
          ]
        },
        chemicalCautionGuidance: {
          en: 'On disease onset, apply CIBRC-registered fungicides such as Mancozeb 75% WP (2.5 g/L) or Tebuconazole 25.9% EC (1 ml/L) or Difenoconazole 25% EC (1 ml/L) along with a sticker/spreader (0.5 ml/L) at 10-14 day intervals as per ICAR-DOGR recommendations. Check label claims and consult your local KVK.',
          mr: 'करप्याची लक्षणे दिसताच ICAR-DOGR राजगुरुनगर यांच्या शिफारशीनुसार मँकोझेब ७५% WP (२.५ ग्रॅम प्रति लिटर) किंवा डायफेनोकोनाझोल २५% EC (१ मिली प्रति लिटर) किंवा टेब्युकोनाझोल २५.९% EC (१ मिली प्रति लिटर) स्टीकर (चिकट द्रव्य) मिसळून १०-१२ दिवसांच्या अंतराने फवारावे. कांद्याच्या पानावर मेणाचा थर असल्याने स्टीकर वापरणे अत्यावश्यक आहे.',
          hi: 'लक्षण दिखते ही आईसीएआर-डीओजीआर अनुशंसित मैंकोजेब २.५ ग्राम या डाईफेनोकोनाजोल १ मिली प्रति लीटर पानी में स्टीकर मिलाकर छिड़कें। प्याज की पत्तियां चिकनी होने के कारण स्टीकर का प्रयोग अत्यंत आवश्यक है।'
        }
      },
      expertConsultationSigns: {
        en: [
          'More than 25% of photosynthetic green canopy turns necrotic within a week',
          'Purple blotch is coupled with severe yellow thrips silvering creating compound stress'
        ],
        mr: [
          'एका आठवड्यात २५% पेक्षा जास्त पाने वाळून करपल्यास',
          'करप्यासोबतच फुलकिड्यांचा (थ्रिप्स) मोठा प्रादुर्भाव होऊन पाने पांढरी पडल्यास'
        ],
        hi: [
          'एक सप्ताह में २५% से अधिक पत्तियां सूख जाएं',
          'झुलसे के साथ-साथ थ्रिप्स का भी भारी प्रकोप हो'
        ]
      },
      safetyNotice: {
        en: 'Notice: Always observe the Pre-Harvest Interval (PHI) of 15-20 days before pulling onions to prevent chemical residue in bulbs.',
        mr: 'दक्षता सूचना: कांदा काढणीपूर्वी किमान १५ ते २० दिवस कोणत्याही रासायनिक बुरशीनाशकाची फवारणी करू नका, जेणेकरून कांद्यामध्ये रासायनिक अवशेष राहणार नाहीत.',
        hi: 'सूचना: प्याज उखाड़ने से १५-२० दिन पहले छिड़काव बंद कर दें ताकि कंदों में विषैले अवशेष न रहें।'
      },
      authoritativeSource: {
        institution: {
          en: 'ICAR - Directorate of Onion and Garlic Research (DOGR), Rajgurunagar, Pune',
          mr: 'आयसीएआर - कांदा व लसूण संशोधन संचालनालय (DOGR), राजगुरुनगर, पुणे',
          hi: 'भाकृअनुप - प्याज एवं लहसुन अनुसंधान निदेशालय (DOGR), पुणे'
        },
        referenceDocument: {
          en: 'Disease Management Guidelines for Onion Cultivation in Maharashtra (ICAR-DOGR)',
          mr: 'कांदा पीक संरक्षण व करपा नियंत्रण तंत्रज्ञान (कांदा व लसूण संशोधन संचालनालय पुस्तिका)',
          hi: 'प्याज फसल सुरक्षा संदर्शिका (ICAR-DOGR राजगुरुनगर)'
        },
        portalUrl: 'https://dogr.icar.gov.in',
        portalName: 'ICAR-DOGR Portal'
      },
      aiModelClassId: 'onion_purple_blotch'
    },

    // 8. Wheat - Yellow / Stripe Rust
    {
      id: 'wheat-stripe-rust',
      cropId: 'wheat',
      cropName: { en: 'Wheat', mr: 'गहू', hi: 'गेहूं' },
      name: { en: 'Yellow / Stripe Rust', mr: 'गव्हावरील पिवळा तांबेरा (स्ट्राइप रस्ट)', hi: 'गेहूं का पीला रतुआ / गेरुआ (स्ट्राइप रस्ट)' },
      scientificName: 'Puccinia striiformis f. sp. tritici',
      category: 'disease',
      categoryLabel: { en: 'Fungal Disease', mr: 'बुरशीजन्य रोग', hi: 'फफूंद रोग' },
      affectedParts: ['leaves', 'stem'],
      affectedPartsLabel: { en: 'Leaf Blades, Leaf Sheaths, Glumes', mr: 'पाने, पानांचे आवरण व लोंबी', hi: 'पत्तियां, डंठल और बालियां' },
      symptoms: {
        en: [
          'Bright yellow lemon-colored powdery pustules arranged in distinct continuous linear parallel stripes along leaf veins',
          'Rubbing the leaf leaves a bright yellow dust of fungal urediniospores on farmer fingers',
          'Chlorosis and necrosis of entire leaf surface when stripes coalesce',
          'Shriveled grains and drastic loss of earhead weight'
        ],
        mr: [
          'पानांवर शिरांच्या दिशेने लांबट, समांतर पिवळ्या रंगाच्या पुळ्यांच्या ओळी (पट्टे) दिसतात',
          'पानावर हात फिरवल्यास बोटांना हळदीसारखी पिवळी भुकटी (बीजाणू) लागते',
          'पट्टे एकत्र येऊन संपूर्ण पान पिवळे पडून वाळते',
          'लोंब्यांमध्ये दाणे भरत नाहीत किंवा दाणे बारीक व सुरकुतलेले राहतात'
        ],
        hi: [
          'पत्तियों की नसों के समानांतर लंबी पीली धारियों में चमकीली फुंसियां बनती हैं',
          'पत्ती पर उंगली फेरने पर हल्दी जैसा पीला पाउडर हाथ पर लग जाता है',
          'धारियां मिलकर पूरी पत्ती को सुखा देती हैं',
          'बालियों में दाने सिकुड़ जाते हैं और वजन बहुत कम हो जाता है'
        ]
      },
      symptomKeywords: ['yellow rust', 'stripe rust', 'linear stripes', 'yellow powder', 'पिवळा तांबेरा', 'ओळी', 'हळदीसारखी भुकटी', 'पीला रतुआ', 'पीली धारियां'],
      typicalConditions: {
        en: 'Cool temperatures (10-20°C) with high humidity, morning fog, and dew during December to February in winter cereal tracts.',
        mr: 'डिसेंबर ते फेब्रुवारी दरम्यान थंड हवामान (१०-२०°C), सकाळचे धुके, दव आणि हवेतील भरपूर ओलावा.',
        hi: 'दिसंबर से फरवरी के दौरान ठंडी रातें (१०-२०°C), सुबह का कोहरा, ओस और नम वातावरण।'
      },
      prevention: {
        en: [
          'Sow rust-resistant varieties recommended by ICAR-IIWBR (e.g. DBW series, HD-2967, Netravati, Trimbak in Maharashtra)',
          'Complete timely sowing before mid-November to avoid peak rust window at grain fill',
          'Avoid excessive urea/nitrogen which prolongs susceptibility'
        ],
        mr: [
          'कृषी विद्यापीठ व ICAR शिफारशीत तांबेरा-प्रतिकारक वाण (उदा. नेत्रावती, त्र्यंबक, समाधान) वापरावेत',
          'नोव्हेंबरच्या पहिल्या पंधरवड्यात वेळेवर पेरणी पूर्ण करावी',
          'नत्राचा (युरिया) अतिरेक टाळावा आणि फॉस्फरस व पोटॅशचे योग्य संतुलन ठेवावे'
        ],
        hi: [
          'आईसीएआर अनुशंसित रतुआ-रोधी किस्मों की बुवाई करें',
          'नवंबर मध्य तक समय पर बुवाई पूरी कर लें',
          'यूरिया का अत्यधिक प्रयोग न करें'
        ]
      },
      integratedManagement: {
        cultural: {
          en: [
            'Maintain mixed cropping with non-host crops where feasible',
            'Eradicate volunteer self-sown wheat seedlings from bunds'
          ],
          mr: [
            'बांधावरील गव्हाचे तण किंवा आपोआप उगवलेली रोपे नष्ट करावीत'
          ],
          hi: [
            'मेड़ों पर उगे पुराने पौधों को नष्ट करें'
          ]
        },
        biologicalMechanical: {
          en: [
            'Spray fermented buttermilk (5%) along with neem extract at early vegetative stage as a bio-stimulant'
          ],
          mr: [
            'सुरुवातीच्या अवस्थेत ताक व निंबोळी अर्काची फवारणी करावी'
          ],
          hi: [
            'प्रारंभिक अवस्था में छाछ और नीम अर्क का प्रयोग करें'
          ]
        },
        chemicalCautionGuidance: {
          en: 'Immediately upon observing first linear yellow pustules in the field, spray CIBRC-registered triazole fungicides such as Propiconazole 25% EC (1 ml/L or 500 ml/ha) or Tebuconazole 250 EC (1 ml/L) as recommended by ICAR-IIWBR. Spray only if rust is confirmed in the region; consult your Agriculture Officer.',
          mr: 'पिवळ्या तांबेऱ्याची पहिली लक्षणे दिसताच ICAR-IIWBR कर्नाल व कृषी विद्यापीठाच्या शिफारशीनुसार प्रोपिकोनाझोल २५% EC (१ मिली प्रति लिटर पाण्यात) किंवा टेब्युकोनाझोल (१ मिली प्रति लिटर) ताबडतोब फवारावे. रोगाचा फैलाव खूप वेगवान असतो, त्यामुळे उशीर न करता कृषी अधिकाऱ्यांच्या सल्ल्याने फवारणी करावी.',
          hi: 'पीले रतुआ के शुरुआती लक्षण दिखते ही तुरंत प्रोपिकोनाजोल २५% ईसी १ मिली प्रति लीटर पानी में मिलाकर छिड़कें। इसका फैलाव बहुत तेज होता है, अतः देरी न करें।'
        }
      },
      expertConsultationSigns: {
        en: [
          'Yellow stripe symptoms appear on flag leaves (the top leaf driving grain filling)',
          'Rust foci expand rapidly across more than 10% of field area in 48 hours'
        ],
        mr: [
          'गव्हाच्या ध्वज पानावर (Flag leaf - लोंबीखालील मुख्य पान) पिवळा तांबेरा दिसू लागल्यास',
          'दोन दिवसांत शेतातील १०% पेक्षा जास्त क्षेत्रात पिवळे पट्टे पसरल्यास'
        ],
        hi: [
          'झंडा पत्ती (फ्लैग लीफ) पर पीले रतुआ के लक्षण दिखाई देने लगें',
          '४८ घंटे में खेत में रोग तेजी से फैलने लगे'
        ]
      },
      safetyNotice: {
        en: 'Precaution: Check wind velocity before spraying and do not spray under strong winds. Adhere strictly to the label claim.',
        mr: 'दक्षता सूचना: जोराचा वारा असताना फवारणी करू नका. लेबल क्लेम व योग्य पाणी प्रमाण वापरा.',
        hi: 'सावधानी: तेज हवा में छिड़काव न करें। उचित मात्रा और सुरक्षा नियमों का पालन करें।'
      },
      authoritativeSource: {
        institution: {
          en: 'ICAR - Indian Institute of Wheat and Barley Research (IIWBR), Karnal & MPKV Rahuri',
          mr: 'आयसीएआर - भारतीय गहू व बार्ली संशोधन संस्था (IIWBR), कर्नाल व म.फु.कृ.वि. राहुरी',
          hi: 'भाकृअनुप - भारतीय गेहूं एवं जौ अनुसंधान संस्थान (IIWBR), करनाल'
        },
        referenceDocument: {
          en: 'Wheat Rust Surveillance and Management Protocol (ICAR-IIWBR Bulletin)',
          mr: 'गहू तांबेरा रोग सर्व्हेक्षण व एकात्मिक नियंत्रण (आयसीएआर-आयआयडब्ल्यूबीआर व राहुरी)',
          hi: 'गेहूं रतुआ निगरानी एवं प्रबंधन संदर्शिका (ICAR-IIWBR करनाल)'
        },
        portalUrl: 'https://iiwbr.icar.gov.in',
        portalName: 'ICAR-IIWBR Karnal'
      },
      aiModelClassId: 'wheat_stripe_rust'
    },

    // 9. Turmeric - Rhizome Rot
    {
      id: 'turmeric-rhizome-rot',
      cropId: 'turmeric',
      cropName: { en: 'Turmeric', mr: 'हळद', hi: 'हल्दी' },
      name: { en: 'Rhizome Rot / Soft Rot', mr: 'हळदीवरील कंदकुज रोग (रायझोम रॉट)', hi: 'हल्दी का कंद सड़न रोग' },
      scientificName: 'Pythium aphanidermatum / Fusarium solani',
      category: 'disease',
      categoryLabel: { en: 'Soil-Borne Fungal Disease', mr: 'जमीनजन्य बुरशी रोग', hi: 'मृदा जनित फफूंद रोग' },
      affectedParts: ['root', 'stem', 'leaves'],
      affectedPartsLabel: { en: 'Rhizomes, Pseudostem Base, Roots', mr: 'कंद (गड्डे), खोडाचा तळ व मुळे', hi: 'कंद, तने का निचला भाग और जड़ें' },
      symptoms: {
        en: [
          'Yellowing of leaves starting from margins and tips of lower foliage progressing to upper leaves',
          'Basal collar region of pseudostem turns water-soaked, soft, and dark brown',
          'Pseudostem easily pulls out of the ground with a gentle tug releasing a foul putrid stench',
          'Underground rhizomes turn dark brown, spongy, soft, and decay completely into liquid mush'
        ],
        mr: [
          'खालच्या पानांच्या कडा पिवळ्या पडून हळूहळू संपूर्ण पान वाळते आणि वरच्या पानांवर पिवळेपणा पसरतो',
          'खोडाचा जमिनीलगतचा भाग (तळ) काळा पडून मऊ व पाणी साचल्यासारखा कुजतो',
          'रोप हाताने सहज उपटले जाते आणि खोड उपटल्यावर घाणेरडा कुजका वास येतो',
          'जमिनीतील हळदीचे गड्डे मऊ, पाणीदार होऊन पूर्णपणे कुजतात'
        ],
        hi: [
          'निचली पत्तियों के किनारे पीले होकर सूखने लगते हैं और पीलापन ऊपर फैलता है',
          'तने का निचला हिस्सा जमीन के पास से गीला, मुलायम और भूरा होकर सड़ने लगता है',
          'पौधा थोड़ा खींचने पर ही आसानी से उखड़ जाता है और दुर्गंध आती है',
          'जमीन के अंदर हल्दी के कंद गलकर बदबूदार पानी में तब्दील हो जाते हैं'
        ]
      },
      symptomKeywords: ['rhizome rot', 'soft rot', 'pseudostem pulling', 'decayed rhizome', 'foul smell', 'कंदकुज', 'हळद कुजणे', 'खोडाचा तळ', 'दुर्गंध', 'कंद सड़न'],
      typicalConditions: {
        en: 'Waterlogged clayey soils, continuous heavy rains in July-September with poor subsurface drainage, soil temperatures around 28-32°C.',
        mr: 'जुलै ते सप्टेंबर दरम्यान सतत पडणारा पाऊस, शेतात पाणी साचून राहणे, पाण्याचा अयोग्य निचरा आणि भारी काळी जमीन.',
        hi: 'जुलाई-सितंबर में भारी बारिश, खेत में पानी का जमाव, खराब जल निकासी और भारी मिट्टी।'
      },
      prevention: {
        en: [
          'Plant exclusively on Broad Bed Furrow (BBF) or raised beds (120 cm wide, 15 cm high) with deep drainage furrows',
          'Select healthy, plump mother or finger rhizomes from disease-free seed plots',
          'Mandatory seed rhizome treatment with Trichoderma viride or Metalaxyl-Mancozeb for 30 minutes before planting'
        ],
        mr: [
          'हळदीची लागवड नेहमी गादीवाफ्यावर (BBF) किंवा वरंब्यावर करावी जेणेकरून पावसाचे पाणी शेतात साचणार नाही',
          'लागवडीसाठी निरोगी व वजनदार बेण्याची निवड करावी',
          'लागवडीपूर्वी बेण्यास ट्रायकोडर्मा किंवा मेटलॅक्सिल + मँकोझेबच्या द्रावणात ३० मिनिटे बुडवून बेणे प्रक्रिया करावी'
        ],
        hi: [
          'उठी हुई क्यारियों (BBF) पर ही हल्दी लगाएं ताकि पानी न ठहरे',
          'रोगमुक्त स्वस्थ कंदों का ही बीज के लिए चयन करें',
          'बुवाई पूर्व कंदों को ट्राइकोडर्मा या अनुशंसित फफूंदनाशक घोल में ३० मिनट डुबोकर उपचारित करें'
        ]
      },
      integratedManagement: {
        cultural: {
          en: [
            'Immediately open drainage trenches to flush out standing water after heavy downpours',
            'Carefully remove severely rotten plants with surrounding infested soil and bury outside'
          ],
          mr: [
            'मुसळधार पावसानंतर शेतातून चर खोदून साचलेले पाणी तातडीने बाहेर काढावे',
            'कुजलेली झाडे मातीसह काढून शेताबाहेर खड्ड्यात गाडून नष्ट करावीत'
          ],
          hi: [
            'भारी बारिश के बाद खेत से तुरंत पानी निकालने की नाली बनाएं',
            'सड़े हुए पौधों को मिट्टी सहित बाहर निकाल कर नष्ट करें'
          ]
        },
        biologicalMechanical: {
          en: [
            'Soil drenching with Trichoderma harzianum (50 g / 10 L water) mixed with neem cake at planting and first earthing up'
          ],
          mr: [
            'लागवडीच्या वेळी व भरणीच्या वेळी ट्रायकोडर्मा आणि निंबोळी पेंड जमिनीत आळवणी (ड्रेंचिंग) करावी'
          ],
          hi: [
            'बुवाई और मिट्टी चढ़ाते समय ट्राइकोडर्मा व नीम खली का घोल बनाकर जड़ों में दें'
          ]
        },
        chemicalCautionGuidance: {
          en: 'On initial symptoms, drench root zone around affected patches with CIBRC-registered fungicides such as Copper Oxychloride 50% WP (3 g/L) or Metalaxyl 8% + Mancozeb 64% WP (2.5 g/L) as recommended by ICAR-IISR and SAUs. Drenching must reach the rhizome depth; consult local Agriculture Extension Officer.',
          mr: 'रोगाची पहिली लक्षणे दिसताच बाधित रोपांच्या भोवती कॉपर ऑक्सिक्लोराईड ५०% WP (३ ग्रॅम प्रति लिटर पाणी) किंवा मेटलॅक्सिल + मँकोझेब (२ ते २.५ ग्रॅम प्रति लिटर पाणी) मुळांजवळ आळवणी (ड्रेंचिंग) करावी. केवळ पानांवर फवारणी न करता द्रावण कंदांपर्यंत झिरपणे आवश्यक आहे.',
          hi: 'शुरुआती लक्षण दिखते ही कॉपर ऑक्सीक्लोराइड ३ ग्राम या मेटलॉक्सिल + मैंकोजेब २.५ ग्राम प्रति लीटर पानी का घोल बनाकर कंदों के पास ड्रेन्चिंग (आलवणी) करें।'
        }
      },
      expertConsultationSigns: {
        en: [
          'Yellowing and collar rot spreading rapidly across consecutive raised beds',
          'Water stagnation persisting for over 48 hours with rotting smell'
        ],
        mr: [
          'गादीवाफ्यांवर एकापाठोपाठ एक बेटे पिवळी पडून कुजू लागल्यास',
          'शेतात पाणी साचून राहून कंदकुजीचा दुर्गंध पसरत असल्यास'
        ],
        hi: [
          'लगातार कई क्यारियों में पौधे पीले पड़कर तेजी से गलने लगें'
        ]
      },
      safetyNotice: {
        en: 'Warning: Soil drenching chemicals should not contaminate farm wells or animal drinking water sources.',
        mr: 'दक्षता सूचना: आळवणी करताना औषध विहिरीच्या किंवा पाण्याच्या साठ्यात मिसळणार नाही याची काळजी घ्या.',
        hi: 'सावधानी: जमीन में दवा देते समय कुएं या पीने के पानी के स्रोत सुरक्षित रखें।'
      },
      authoritativeSource: {
        institution: {
          en: 'ICAR - Indian Institute of Spices Research (IISR), Kozhikode & MPKV Rahuri',
          mr: 'आयसीएआर - भारतीय मसाला संशोधन संस्था (IISR), कोझिकोड व म.फु.कृ.वि. राहुरी',
          hi: 'भाकृअनुप - भारतीय मसाला अनुसंधान संस्थान (IISR), कोझिकोड'
        },
        referenceDocument: {
          en: 'Good Agricultural Practices for Turmeric: Rhizome Rot Management (ICAR-IISR)',
          mr: 'हळद पीक सुधारित लागवड तंत्रज्ञान व कंदकुज नियंत्रण (म.फु.कृ.वि. राहुरी विस्तार पुस्तिका)',
          hi: 'हल्दी उन्नत खेती एवं रोग प्रबंधन (ICAR-IISR)'
        },
        portalUrl: 'https://spices.icar.gov.in',
        portalName: 'ICAR-IISR Spices Portal'
      },
      aiModelClassId: 'turmeric_rhizome_rot'
    },

    // 10. Pomegranate - Bacterial Blight (Telya)
    {
      id: 'pomegranate-bacterial-blight-telya',
      cropId: 'pomegranate',
      cropName: { en: 'Pomegranate', mr: 'डाळिंब', hi: 'अनार' },
      name: { en: 'Bacterial Blight ("Telya")', mr: 'डाळिंबावरील तेलकट डाग रोग (तैलिया / तैलकट्या)', hi: 'अनार का जीवाणु झुलसा / तैलिया रोग' },
      scientificName: 'Xanthomonas axonopodis pv. punicae',
      category: 'disease',
      categoryLabel: { en: 'Bacterial Disease', mr: 'जिवाणूजन्य रोग', hi: 'जीवाणु रोग' },
      affectedParts: ['leaves', 'stem', 'fruit'],
      affectedPartsLabel: { en: 'Leaves, Twigs, Stems, Fruit Rind', mr: 'पाने, फांद्या, खोड व फळांची साल', hi: 'पत्ते, शाखाएं, तना और फल का छिलका' },
      symptoms: {
        en: [
          'Dark water-soaked oily spots (1-5 mm) on leaves that turn dark blackish-brown surrounded by yellow halos',
          'Infected leaves turn yellow and drop prematurely',
          'Dark brown to black nodal cankers on twigs causing branch dieback and breakage in wind',
          'Distinctive brown-to-black L-shaped or Y-shaped cracking lesions on fruit rind with oily margins'
        ],
        mr: [
          'पानांवर सुरुवातीला १ ते ५ मिमी आकाराचे पाणीदार तेलकट डाग दिसतात, जे नंतर काळे-तपकिरी होतात',
          'बाधित पाने पिवळी पडून वेगाने गळतात',
          'फांद्यांच्या पेरावर काळे खोलगट चट्टे पडून फांद्या वाळतात व मोडतात (कँकर)',
          'फळांच्या सालीवर तेलकट कडा असलेले काळे डाग पडतात आणि फळाला इंग्रजी ‘L’ किंवा ‘Y’ आकाराचे तडे जातात'
        ],
        hi: [
          'पत्तियों पर पानी सोखे हुए तेल जैसे चिकने धब्बे बनते हैं जो बाद में काले-भूरे हो जाते हैं',
          'पत्तियां पीली होकर समय पूर्व झड़ जाती हैं',
          'टहनियों की गांठों पर काले घाव (कैंकर) बन जाते हैं जिससे शाखाएं सूखकर टूटती हैं',
          'फलों के छिलके पर तेलकट किनारों वाले काले धब्बे पड़ते हैं और फल पर L या Y आकार की दरारें आ जाती हैं'
        ]
      },
      symptomKeywords: ['telya', 'bacterial blight', 'oily spots', 'fruit cracking', 'L-shaped cracks', 'तेलकट डाग', 'तैलिया', 'डाळिंब करपा', 'फळाला तडे', 'तैलकट्या'],
      typicalConditions: {
        en: 'High atmospheric humidity (>70%), warm temperatures (28-35°C), cloudy weather with intermittent rain showers during Mrig Bahar (July-September).',
        mr: 'मृग बहारात (जुलै ते सप्टेंबर) सतत पाऊस, हवेत जास्त आर्द्रता (>७०%), उबदार हवामान (२८-३५°C) आणि ढगाळ वातावरण.',
        hi: 'मृग बहार में अत्यधिक उमस (>७०%), गर्म तापमान (२८-३५°C) और बादलों के साथ रुक-रुक कर बारिश।'
      },
      prevention: {
        en: [
          'Procure disease-free certified tissue culture or air-layered saplings from government-accredited nurseries',
          'Disinfect pruning secateurs in 1% sodium hypochlorite solution between cuts',
          'Maintain clean orchard hygiene; paste tree trunks with Bordeaux paste (10%) twice a year',
          'Avoid taking Mrig Bahar in endemic blight areas; opt for Hasta Bahar (Sept-Oct flowering)'
        ],
        mr: [
          'अधिकृत नर्सरीतून रोगमुक्त खात्रीशीर कलमे किंवा टिशू कल्चर रोपे लावावीत',
          'झाडांची छाटणी करताना छाटणी कात्री १% सोडियम हायपोक्लोराईट द्रावणात बुडवून निर्जंतुक करावी',
          'खोडाला वर्षातून दोनदा (मे व ऑक्टोबर) बोर्डो पेस्ट (१०%) लावावी',
          'रोगप्रवण भागात मृग बहार न घेता हस्त बहार (सप्टेंबर-ऑक्टोबर) घ्यावा'
        ],
        hi: [
          'प्रमाणित नर्सरी से रोगमुक्त पौधे ही लगाएं',
          'कटाई-छंटाई के औजारों को विसंक्रमित करें',
          'तनों पर वर्ष में दो बार बोर्डो लेप लगाएं',
          'रोगग्रस्त क्षेत्रों में मृग बहार की जगह हस्त बहार को प्राथमिकता दें'
        ]
      },
      integratedManagement: {
        cultural: {
          en: [
            'Prune blighted twigs 5 cm below infected cankers, collect in plastic bags, and burn immediately outside the orchard',
            'Cover cut wounds with copper oxychloride paste (5%) or Bordeaux paste'
          ],
          mr: [
            'रोगट फांद्या डागाच्या खाली ५ सेंमी निरोगी भागातून छाटून पिशवीत गोळा करून बागेबाहेर जाळून टाकाव्यात',
            'छाटलेल्या भागावर लगेच कॉपर ऑक्सिक्लोराईड किंवा बोर्डो पेस्ट लावावी'
          ],
          hi: [
            'रोगग्रस्त टहनियों को काटकर तुरंत बगीचे से बाहर जला दें',
            'कटे हुए भाग पर कॉपर पेस्ट लगाएं'
          ]
        },
        biologicalMechanical: {
          en: [
            'Spray antagonistic bacterial bio-agents like Pseudomonas fluorescens or Bacillus subtilis @ 5 g/L during dry breaks'
          ],
          mr: [
            'पावसाच्या उघडीपीत स्युडोमोनास किंवा बॅसिलस सबटिलिस ५ ग्रॅम प्रति लिटर फवारावे'
          ],
          hi: [
            'स्यूडोमोनास या बैसिलस जैविक जीवाणु का छिड़काव करें'
          ]
        },
        chemicalCautionGuidance: {
          en: 'Apply CIBRC-registered schedule recommended by ICAR-NRCP Solapur: Spray Copper Oxychloride 50% WP (2.5 g/L) or Copper Hydroxide (2 g/L) combined with Streptocycline or 2-Bromo-2-nitropropane-1,3-diol (Bacterinol @ 0.5 g/L) along with spreader. Strictly rotate fungicides and avoid indiscriminate antibiotic spraying; consult ICAR-NRCP or your District Horticulture Officer.',
          mr: 'आयसीएआर-एनआरसीपी सोलापूर यांच्या शिफारशीनुसार कॉपर ऑक्सिक्लोराईड ५०% WP (२.५ ग्रॅम प्रति लिटर) किंवा कॉपर हायड्रॉक्साईड (२ ग्रॅम प्रति लिटर) अधिक स्ट्रेप्टोमायसीन सल्फेट (०.५ ग्रॅम प्रति लिटर) किंवा ब्रोनोपोल (०.५ ग्रॅम प्रति लिटर) स्टीकरसह फवारावे. औषधे आलटून-पालटून वापरावीत आणि राष्ट्रीय डाळिंब संशोधन केंद्र (NRCP) किंवा जिल्हा कृषी अधीक्षकांचा सल्ला घ्यावा.',
          hi: 'आईसीएआर-एनआरसीपी सोलापुर अनुसार कॉपर ऑक्सीक्लोराइड २.५ ग्राम में स्ट्रेप्टोमाइसिन या ब्रोनोपोल ०.५ ग्राम प्रति लीटर मिलाकर स्टीकर के साथ छिड़कें। स्थानीय बागवानी अधिकारी से सलाह लें।'
        }
      },
      expertConsultationSigns: {
        en: [
          'Nodal cankers on primary scaffold limbs or main tree trunk',
          'Fruit cracking and drop exceeds 15% of total harvest set within 10 days'
        ],
        mr: [
          'झाडाच्या मुख्य खोडावर किंवा मुख्य फांद्यांवर काळे खोलगट चट्टे पसरू लागल्यास',
          '१० दिवसांत १५% पेक्षा जास्त फळांवर तडे जाऊन फळे गळू लागल्यास'
        ],
        hi: [
          'मुख्य तने पर गहरे काले घाव बन जाएं',
          '१० दिनों में १५% से अधिक फलों में दरारें पड़कर गिरने लगें'
        ]
      },
      safetyNotice: {
        en: 'Crucial: Never move infected fruit or planting material out of diseased zones to prevent spreading quarantine bacterial blight.',
        mr: 'अतिशय महत्त्वाचे: तेलकट डागग्रस्त बागेतील कलमे किंवा बाधित फळे निरोगी भागात नेऊ नका, यामुळे रोगाचा इतरत्र प्रसार होतो.',
        hi: 'अति महत्वपूर्ण: रोगग्रस्त क्षेत्र से कलम या फल अन्य क्षेत्रों में न ले जाएं।'
      },
      authoritativeSource: {
        institution: {
          en: 'ICAR - National Research Centre on Pomegranate (NRCP), Solapur',
          mr: 'आयसीएआर - राष्ट्रीय डाळिंब संशोधन केंद्र (NRCP), सोलापूर',
          hi: 'भाकृअनुप - राष्ट्रीय अनार अनुसंधान केंद्र (NRCP), सोलापुर'
        },
        referenceDocument: {
          en: 'Management of Bacterial Blight of Pomegranate (ICAR-NRCP Comprehensive Advisory)',
          mr: 'डाळिंबावरील तेलकट डाग रोगाचे एकात्मिक व्यवस्थापन (राष्ट्रीय डाळिंब संशोधन केंद्र सोलापूर)',
          hi: 'अनार जीवाणु झुलसा प्रबंधन निर्देशिका (ICAR-NRCP सोलापुर)'
        },
        portalUrl: 'https://nrcpomegranate.icar.gov.in',
        portalName: 'ICAR-NRCP Solapur Official Portal'
      },
      aiModelClassId: 'pomegranate_bacterial_blight'
    },

    // 11. Tomato - Early Blight
    {
      id: 'tomato-early-blight',
      cropId: 'tomato',
      cropName: { en: 'Tomato', mr: 'टोमॅटो', hi: 'टमाटर' },
      name: { en: 'Tomato Early Blight', mr: 'टोमॅटोवरील अल्टरनेरिया करपा (अर्ली ब्लाईट)', hi: 'टमाटर का अगेती झुलसा (अल्टरनेरिया)' },
      scientificName: 'Alternaria solani (Sorauer)',
      category: 'disease',
      categoryLabel: { en: 'Fungal Disease', mr: 'बुरशीजन्य रोग', hi: 'फफूंद रोग' },
      affectedParts: ['leaves', 'stem', 'fruit'],
      affectedPartsLabel: { en: 'Lower Leaves, Stems, Fruit Calyx', mr: 'खालची पाने, खोड व फळे', hi: 'निचली पत्तियां, तना और फल' },
      symptoms: {
        en: [
          'Characteristic target-board concentric dark rings on older lower leaves surrounded by chlorotic yellow halo',
          'Lesions enlarge and merge causing entire leaf blade to turn brown and wither',
          'Collar rot / dark sunken cankers on stems of young transplants near ground level',
          'Dark leathery sunken spots on fruit near the stem attachment end'
        ],
        mr: [
          'खालच्या जुन्या पानांवर गोलाकार, एकाआड एक वलये असलेले (Target board) तपकिरी-काळे डाग दिसतात',
          'डागांभोवती पिवळसर कडा तयार होते आणि डाग मोठे होऊन संपूर्ण पान करपून वाळते',
          'जमिनीलगतच्या खोडावर काळे खोलगट चट्टे पडून रोपे वाकतात',
          'फळाच्या देठाजवळ काळे, कडक व खोलगट डाग पडतात'
        ],
        hi: [
          'निचली पुरानी पत्तियों पर गोल चक्राकार छल्लों जैसे (टारगेट बोर्ड) भूरे-काले धब्बे बनते हैं',
          'धब्बों के चारों ओर पीला घेरा बनता है और पत्तियां झुलसकर सूख जाती हैं',
          'जमीन के पास तने पर काले धंसे हुए घाव बन जाते हैं',
          'फल के डंठल वाले हिस्से पर काले चमड़े जैसे धब्बे पड़ते हैं'
        ]
      },
      symptomKeywords: ['early blight', 'target board', 'concentric rings', 'alternaria', 'अर्ली ब्लाईट', 'वलये', 'करपा', 'अगेती झुलसा', 'छल्ले'],
      typicalConditions: {
        en: 'Warm temperatures (24-30°C) with alternating dry and wet periods, heavy morning dews, or overhead sprinkler splashing.',
        mr: 'उबदार हवामान (२४-३०°C), दमट व कोरड्या वातावरणाचा आलटून-पालटून प्रभाव, सकाळचे दव आणि फवाऱ्याने पाणी देणे.',
        hi: 'गर्म तापमान (२४-३०°C), नमी और सूखे का बारी-बारी से आना, भारी ओस।'
      },
      prevention: {
        en: [
          'Maintain 3-year crop rotation avoiding other solanaceous crops (potato, brinjal, chilli)',
          'Mulch with silver-black plastic or clean straw to prevent soil-splash onto lower leaves',
          'Prune lower leaves touching the soil surface up to 20 cm from ground'
        ],
        mr: [
          'बटाटा, वांगी, मिरची या पिकांनंतर टोमॅटोची लागवड टाळावी; ३ वर्षांची फेरपालट ठेवावी',
          'जमिनीतील बुरशीचे बीजाणू उडून पानांवर येऊ नयेत म्हणून मल्चिंग पेपरचा वापर करावा',
          'जमिनीला टेकणाऱ्या खालच्या पानांची छाटणी करून झाडाचा तळ मोकळा ठेवावा'
        ],
        hi: [
          'आलू, बैंगन, मिर्च के बाद टमाटर न लगाएं; ३ वर्ष का फसल चक्र अपनाएं',
          'मिट्टी के छींटों से बचाने के लिए मल्चिंग का उपयोग करें',
          'जमीन से सटी निचली पत्तियों की छंटाई करें'
        ]
      },
      integratedManagement: {
        cultural: {
          en: [
            'Stake plants properly with bamboo trellises to keep foliage upright and well aerated',
            'Avoid overhead sprinkler irrigation; irrigate strictly via drip'
          ],
          mr: [
            'झाडांना बांबू व तारेच्या सहाय्याने आधार द्यावा जेणेकरून हवा खेळती राहील',
            'स्प्रिंकलरऐवजी ठिबक सिंचनाने पाणी द्यावे'
          ],
          hi: [
            'पौधों को बांस और तार के सहारे बांधें',
            'टपक सिंचाई का ही प्रयोग करें'
          ]
        },
        biologicalMechanical: {
          en: [
            'Foliar spray of Trichoderma harzianum @ 5 g/L or Bacillus subtilis @ 5 g/L at early growth stage'
          ],
          mr: [
            'सुरुवातीच्या काळात ट्रायकोडर्मा ५ ग्रॅम किंवा बॅसिलस सबटिलिस ५ ग्रॅम प्रति लिटर पाण्यात मिसळून फवारावे'
          ],
          hi: [
            'प्रारंभ में ट्राइकोडर्मा या बैसिलस ५ ग्राम प्रति लीटर पानी में छिड़कें'
          ]
        },
        chemicalCautionGuidance: {
          en: 'Apply CIBRC-registered fungicides such as Mancozeb 75% WP (2.5 g/L) or Chlorothalonil 75% WP (2 g/L) or Azoxystrobin 23% SC (1 ml/L) or Difenoconazole 25% EC (1 ml/L) at 10-12 day intervals as per ICAR-IIHR package of practices. Ensure pre-harvest interval adherence; consult local KVK.',
          mr: 'रोगाची लक्षणे दिसताच ICAR-IIHR च्या शिफारशीनुसार मँकोझेब ७५% WP (२.५ ग्रॅम प्रति लिटर) किंवा क्लोरोथॅलोनिल २ ग्रॅम किंवा डायफेनोकोनाझोल १ मिली प्रति लिटर पाण्यात मिसळून फवारावे. औषधांचा प्रतीक्षा काळ (PHI) पाळावा.',
          hi: 'रोग दिखने पर मैंकोजेब २.५ ग्राम या क्लोरोथैलोनिल २ ग्राम या डाईफेनोकोनाजोल १ मिली प्रति लीटर पानी में छिड़कें। लेबल पर प्रतीक्षा काल का ध्यान रखें।'
        }
      },
      expertConsultationSigns: {
        en: [
          'Concentric lesions spread into upper fruit clusters destroying marketability',
          'More than 30% of foliage is lost to blighting before first picking'
        ],
        mr: [
          'फळांवर देठाजवळ काळे डाग पडून फळे सडू लागल्यास',
          'पहिल्या तोड्यापूर्वीच ३०% पेक्षा जास्त पाने वाळून करपल्यास'
        ],
        hi: [
          'फलों पर काले धब्बे फैल जाएं और पहली चुनाई से पहले भारी पत्तियां सूखें'
        ]
      },
      safetyNotice: {
        en: 'Warning: Observe recommended waiting period between spray and fruit harvesting for market safety.',
        mr: 'दक्षता सूचना: फवारणीनंतर काढणीचा शिफारशीत प्रतीक्षा काळ पाळा जेणेकरून खाण्यासाठी फळे सुरक्षित राहतील.',
        hi: 'चेतावनी: छिड़काव और फल तोड़ने के बीच अनुशंसित प्रतीक्षा काल का कड़ाई से पालन करें।'
      },
      authoritativeSource: {
        institution: {
          en: 'ICAR - Indian Institute of Horticultural Research (IIHR), Bengaluru & MPKV Rahuri',
          mr: 'आयसीएआर - भारतीय फलोत्पादन संशोधन संस्था (IIHR), बंगळुरू व म.फु.कृ.वि. राहुरी',
          hi: 'भाकृअनुप - भारतीय बागवानी अनुसंधान संस्थान (IIHR), बेंगलुरु'
        },
        referenceDocument: {
          en: 'Package of Practices for Tomato Cultivation & Disease Control (ICAR-IIHR)',
          mr: 'टोमॅटो सुधारित लागवड व रोग नियंत्रण मार्गदर्शिका (आयसीएआर-आयआयएचआर)',
          hi: 'टमाटर उन्नत उत्पादन एवं रोग सुरक्षा (ICAR-IIHR)'
        },
        portalUrl: 'https://iihr.icar.gov.in',
        portalName: 'ICAR-IIHR Bengaluru'
      },
      aiModelClassId: 'tomato_early_blight'
    },

    // 12. Tomato - Blossom End Rot (Calcium Deficiency)
    {
      id: 'tomato-blossom-end-rot',
      cropId: 'tomato',
      cropName: { en: 'Tomato', mr: 'टोमॅटो', hi: 'टमाटर' },
      name: { en: 'Blossom End Rot (Calcium Deficiency)', mr: 'टोमॅटोतील चट्टा / तळाकडील सड (कॅल्शियम कमतरता)', hi: 'टमाटर का फल सड़न विकार (कैल्शियम की कमी)' },
      scientificName: 'Physiological Disorder / Calcium (Ca) Deficiency & Water Stress',
      category: 'deficiency',
      categoryLabel: { en: 'Nutrient Deficiency', mr: 'पोषकद्रव्य कमतरता', hi: 'पोषक तत्व की कमी' },
      affectedParts: ['fruit'],
      affectedPartsLabel: { en: 'Blossom End of Developing Green Fruits', mr: 'फळाचा तळाकडील भाग (फुलोऱ्याकडील टोक)', hi: 'कच्चे फल का निचला सिरा' },
      symptoms: {
        en: [
          'Water-soaked light tan spot at the blossom end (bottom tip) of young developing green fruits',
          'Spot enlarges, flattens, and turns dark brown to black with a leathery sunken texture',
          'Affected area remains completely dry unless invaded by secondary opportunistic fungi',
          'Fruits ripen prematurely with flattened decayed bottom tips'
        ],
        mr: [
          'हिरव्या फळांच्या तळाकडील (फुलोऱ्याकडील टोकावर) पाणी साचल्यासारखा फिकट डाग पडतो',
          'डाग मोठा होतो, चपटा पडतो आणि काळा-तपकिरी चामड्यासारखा कडक व खोलगट बनतो',
          'हा डाग कोरडा असतो; दुय्यम बुरशीचा संसर्ग न झाल्यास त्यातून पाणी पाझरत नाही',
          'फळाचा खालचा भाग चपटा होऊन फळे वेळेआधीच पिकतात'
        ],
        hi: [
          'कच्चे हरे फल के निचले सिरे पर पानीदार हल्का धब्बा बनता है',
          'धब्बा फैलकर चपटा हो जाता है और गहरा काला-भूरा चमड़े जैसा धंसा हुआ बन जाता है',
          'प्रभावित हिस्सा सूखा रहता है',
          'फल समय से पहले पक जाते हैं और निचला हिस्सा चपटा व सड़ा दिखता है'
        ]
      },
      symptomKeywords: ['blossom end rot', 'calcium deficiency', 'sunken black bottom', 'leathery fruit', 'चट्टा', 'कॅल्शियम', 'तळाकडील सड', 'फल सड़न', 'कैल्शियम की कमी'],
      typicalConditions: {
        en: 'Irregular watering (alternating extreme dry spells and flooding), high nitrogen fertilizer, rapid fruit expansion under hot dry winds.',
        mr: 'पाणी देण्यात अनियमितता (तीव्र ताण पडल्यानंतर अचानक भरपूर पाणी देणे), नत्र खतांचा अतिरेक आणि उष्ण कोरडी हवा.',
        hi: 'सिंचाई में भारी अनियमितता (सूखे के बाद अचानक अधिक पानी), यूरिया की अधिकता और तेज गर्म हवाएं।'
      },
      prevention: {
        en: [
          'Apply agricultural lime or gypsum based on soil pH test prior to planting',
          'Maintain regular uniform drip irrigation schedules to keep root-zone moisture steady',
          'Incorporate balanced farmyard manure to buffer soil moisture swings'
        ],
        mr: [
          'लागवडीपूर्वी माती परीक्षणानुसार जमिनीत जिप्सम किंवा चुना मिसळावा',
          'पाण्याचा ताण पडू न देता ठिबक सिंचनाने नियमित व समतोल पाणी द्यावे',
          'जमिनीत ओलावा टिकून राहण्यासाठी शेणखताचा भरपूर वापर करावा'
        ],
        hi: [
          'मिट्टी परीक्षण अनुसार जिप्सम या चूने का प्रयोग करें',
          'टपक सिंचाई द्वारा नियमित और समान रूप से पानी दें',
          'गोबर की खाद का पर्याप्त प्रयोग करें'
        ]
      },
      integratedManagement: {
        cultural: {
          en: [
            'Use plastic mulch to retain soil moisture and reduce root zone temperature fluctuations',
            'Avoid root pruning during hoeing which reduces calcium uptake capacity'
          ],
          mr: [
            'जमिनीतील ओलावा टिकवण्यासाठी मल्चिंग पेपरचा वापर करावा',
            'खांदणी करताना मुळांना इजा होणार नाही याची काळजी घ्यावी'
          ],
          hi: [
            'नमी बनाए रखने हेतु मल्चिंग का उपयोग करें',
            'निराई-गुड़ाई में जड़ों को कटने से बचाएं'
          ]
        },
        biologicalMechanical: {
          en: [
            'Apply humic acid and mycorrhizal bio-inoculants to expand active root absorption zone'
          ],
          mr: [
            'मुळांची कार्यक्षमता वाढवण्यासाठी ह्युमिक ऍसिड व मायकोरायझाचा वापर करावा'
          ],
          hi: [
            'जड़ों के विकास हेतु माइकोराइजा का प्रयोग करें'
          ]
        },
        chemicalCautionGuidance: {
          en: 'At fruit set, apply foliar sprays of Chelated Calcium (EDTA-Ca @ 1-1.5 g/L) or Calcium Nitrate (Ca(NO3)2 @ 4-5 g/L) twice at 10-day intervals as per ICAR-IIHR guidance. Note: This is an abiotic nutritional disorder; fungicides will not correct blossom end rot. Check fertilizer label claims and consult your local KVK or Agriculture Extension Officer.',
          mr: 'फळ धारणेच्या सुरुवातीला चिलेटेड कॅल्शियम (१ ते १.५ ग्रॅम प्रति लिटर) किंवा कॅल्शियम नायट्रेट (४ ते ५ ग्रॅम प्रति लिटर) ८-१० दिवसांच्या अंतराने २ वेळा फवारावे. लक्षात ठेवा: हा बुरशीजन्य रोग नसून कॅल्शियमची कमतरता व पाण्याचे असंतुलन आहे; बुरशीनाशके फवारू नका. स्थानिक केव्हीके (KVK) किंवा कृषी अधिकाऱ्यांशी संपर्क साधावा.',
          hi: 'फल बनते समय चिलेटेड कैल्शियम १-१.५ ग्राम या कैल्शियम नाइट्रेट ४-५ ग्राम प्रति लीटर पानी में मिलाकर ८-१० दिन के अंतराल पर छिड़कें। यह फफूंद रोग नहीं बल्कि कैल्शियम की कमी है। स्थानीय केवीके या कृषि अधिकारी से मार्गदर्शन लें।'
        }
      },
      expertConsultationSigns: {
        en: [
          'More than 15% developing fruits display blackened sunken bottoms despite foliar calcium application'
        ],
        mr: [
          'कॅल्शियम फवारणीनंतरही १५% पेक्षा जास्त फळांचे तळ काळे पडत असल्यास (जमिनीतील क्षारता तपासणे आवश्यक असू शकते)'
        ],
        hi: [
          'छिड़काव के बाद भी १५% से अधिक फलों में यह समस्या बनी रहे'
        ]
      },
      safetyNotice: {
        en: 'Safety Note: Avoid mixing calcium sprays with phosphorus or sulfate fertilizers in the same tank to prevent insoluble precipitation.',
        mr: 'दक्षता सूचना: कॅल्शियम खतांची फवारणी करताना फॉस्फरस किंवा सल्फेटयुक्त खतांसोबत एकत्र मिसळू नका, अन्यथा द्रावण फुटते.',
        hi: 'सुरक्षा सूचना: कैल्शियम का छिड़काव करते समय फास्फेट या सल्फेट युक्त खादों को एक साथ न मिलाएं।'
      },
      authoritativeSource: {
        institution: {
          en: 'ICAR - Indian Institute of Horticultural Research (IIHR), Bengaluru',
          mr: 'आयसीएआर - भारतीय फलोत्पादन संशोधन संस्था (IIHR), बंगळुरू',
          hi: 'भाकृअनुप - भारतीय बागवानी अनुसंधान संस्थान (IIHR), बेंगलुरु'
        },
        referenceDocument: {
          en: 'Nutrient Deficiency Diagnosis and Correction in Vegetables (ICAR-IIHR Extension Manual)',
          mr: 'भाजीपाला पिकांमधील अन्नद्रव्य कमतरता लक्षणे व उपाय (आयसीएआर-आयआयएचआर)',
          hi: 'सब्जियों में पोषक तत्व विकार एवं उपचार (ICAR-IIHR)'
        },
        portalUrl: 'https://iihr.icar.gov.in',
        portalName: 'ICAR-IIHR Bengaluru'
      },
      aiModelClassId: 'tomato_blossom_end_rot'
    },

    // 13. Gram - Fusarium Wilt
    {
      id: 'gram-fusarium-wilt',
      cropId: 'gram',
      cropName: { en: 'Gram (Chickpea)', mr: 'हरभरा (चना)', hi: 'चना (हरभरा)' },
      name: { en: 'Fusarium Wilt', mr: 'हरभऱ्यावरील मर रोग (फ्युझॅरियम विल्ट)', hi: 'चने का उकठा / विल्ट रोग' },
      scientificName: 'Fusarium oxysporum f. sp. ciceris',
      category: 'disease',
      categoryLabel: { en: 'Soil-Borne Fungal Disease', mr: 'जमीनजन्य बुरशी रोग', hi: 'मृदा जनित फफूंद रोग' },
      affectedParts: ['whole-plant', 'root', 'leaves'],
      affectedPartsLabel: { en: 'Root Vascular System, Leaves, Whole Plant', mr: 'मुळांमधील शिरा, पाने व संपूर्ण झाड', hi: 'जड़ों की नसें, पत्तियां और संपूर्ण पौधा' },
      symptoms: {
        en: [
          'Sudden drooping, dull greying, and wilting of leaves starting at seedling or flowering/podding stage',
          'Leaves retain their dull green-grey color initially without immediate yellowing and then dry up',
          'Splitting the main taproot vertically reveals dark brown to black discoloration of internal vascular pith',
          'Affected plants pull out easily with blackened, shriveled lateral root systems'
        ],
        mr: [
          'रोप किंवा फुलवरा अवस्थेत झाडाची पाने अचानक खाली झुकतात, निस्तेज हिरवी-राखाडी होतात व सुकून वाळतात',
          'पाने पिवळी न पडताच निस्तेज हिरवट असतानाच झाड वाळून जाते',
          'मुख्य मुळी उभी चिरून पाहिल्यास आतील गाभ्यात गर्द तपकिरी ते काळी रेष (रक्तवाहिन्या काळ्या पडलेल्या) दिसते',
          'बाधित झाड सहज उपटले जाते आणि मुळे सडलेली व काळी पडलेली दिसतात'
        ],
        hi: [
          'पौध या फूल आने पर पत्तियां अचानक झुककर मुरझा जाती हैं और पौधा सूख जाता है',
          'पत्तियां पीली पड़ने से पहले ही मटमैली हरी रहकर सूख जाती हैं',
          'मुख्य जड़ को चीरने पर भीतर भूरी या काली रेखाएं (वाहिकाओं का कालापन) दिखाई देती हैं',
          'पौधा आसानी से उखड़ जाता है और जड़ें काली व सड़ी मिलती हैं'
        ]
      },
      symptomKeywords: ['wilt', 'fusarium', 'drooping', 'internal root discoloration', 'mar rog', 'मर रोग', 'हरभरा वाळणे', 'मुळे काळी पडणे', 'उकठा', 'विल्ट'],
      typicalConditions: {
        en: 'Warm soil temperatures (25-30°C) with low soil moisture stress, monocropping with susceptible varieties in heavy black soils.',
        mr: 'जमिनीचे उबदार तापमान (२५-३०°C), जमिनीत ओलाव्याचा ताण आणि सलग हरभऱ्याची लागवड.',
        hi: 'मृदा का गर्म तापमान (२५-३०°C), नमी की कमी और लगातार चने की बुवाई।'
      },
      prevention: {
        en: [
          'Cultivate wilt-resistant varieties recommended by MPKV Rahuri & ICAR-IIPR (e.g. Vijay, Digvijay, Vishal, Phule Vikram)',
          'Avoid early sowing in high temperature; sow in late October to early November when soil cools',
          'Mandatory seed treatment with Trichoderma viride (@ 5 g/kg seed) or carbendazim + thiram before sowing',
          'Adopt 3-year crop rotation with non-host cereals like wheat or jowar'
        ],
        mr: [
          'महात्मा फुले कृषी विद्यापीठाने शिफारस केलेले मर रोग प्रतिकारक वाण (उदा. विजय, दिग्विजय, विशाल, फुले विक्रम) वापरावेत',
          'जास्त उन्हात लवकर पेरणी टाळावी; ऑक्टोबर अखेर ते नोव्हेंबरच्या पहिल्या आठवड्यात तापमान कमी झाल्यावर पेरणी करावी',
          'पेरणीपूर्वी प्रतिकिलो बियाण्यास ट्रायकोडर्मा ५ ग्रॅम किंवा कार्बेन्डाझिम + थायरमची बीजप्रक्रिया आवर्जून करावी',
          'गहू किंवा ज्वारी या तृणधान्य पिकांसोबत ३ वर्षांची फेरपालट ठेवावी'
        ],
        hi: [
          'अनुशंसित उकठा-प्रतिरोधी किस्में (जैसे विजय, दिग्विजय, विशाल) ही बोएं',
          'अक्टूबर अंत या नवंबर प्रथम सप्ताह में तापमान कम होने पर ही बुवाई करें',
          'बुवाई से पूर्व प्रति किलो बीज को ५ ग्राम ट्राइकोडर्मा से उपचारित करें',
          'गेहूं या ज्वार के साथ ३ वर्ष का फसल चक्र अपनाएं'
        ]
      },
      integratedManagement: {
        cultural: {
          en: [
            'Deep summer ploughing to expose fungal chlamydospores to intense sunlight',
            'Uproot wilted plants and burn outside the field to prevent inoculum buildup'
          ],
          mr: [
            'उन्हाळ्यात खोल नांगरट करून जमिनीत लपलेली बुरशी उन्हाने नष्ट करावी',
            'वाळलेली झाडे मुळासकट उपटून शेताबाहेर जाळून नष्ट करावीत'
          ],
          hi: [
            'गर्मी में गहरी जुताई करें ताकि फफूंद के बीजाणु धूप से नष्ट हों',
            'मुरझाए पौधों को उखाड़कर खेत से बाहर जला दें'
          ]
        },
        biologicalMechanical: {
          en: [
            'Apply Trichoderma harzianum @ 2.5 kg/acre blended in 100 kg farmyard manure into the soil during land preparation'
          ],
          mr: [
            'जमीन तयार करताना एकरी २.५ किलो ट्रायकोडर्मा १०० किलो शेणखतात मिसळून जमिनीत द्यावा'
          ],
          hi: [
            'खेत तैयार करते समय ट्राइकोडर्मा को गोबर की खाद में मिलाकर मिट्टी में मिलाएं'
          ]
        },
        chemicalCautionGuidance: {
          en: 'Fusarium wilt is a vascular soil-borne pathogen. Foliar spraying of fungicides on standing wilted plants has no efficacy. Chemical control is strictly restricted to pre-sowing seed treatment with registered fungicides. Consult your local KVK or Agriculture Officer for resistant variety seeds.',
          mr: 'मर रोग हा मुळांच्या आतील पाणी वाहून नेणाऱ्या नलिकांमध्ये होणारा बुरशीजन्य रोग आहे. उभा हरभरा वाळल्यावर त्यावर कोणतीही फवारणी करून उपयोग होत नाही. रासायनिक उपाय केवळ पेरणीपूर्वीच्या बीजप्रक्रियेपुरता मर्यादित आहे. उभ्या पिकावर फवारणी करून पैसे वाया घालवू नयेत; पुढील हंगामासाठी प्रतिकारक वाण निवडावा.',
          hi: 'उकठा रोग जमीन जनित है; खड़े मुरझाए पौधों पर किसी भी फफूंदनाशक छिड़काव का कोई लाभ नहीं होता। रासायनिक नियंत्रण केवल बुवाई पूर्व बीज उपचार तक सीमित है। अनावश्यक छिड़काव न करें।'
        }
      },
      expertConsultationSigns: {
        en: [
          'Wilt patches expand rapidly across more than 10-15% of the field area during early flowering'
        ],
        mr: [
          'फुलवऱ्याच्या काळात शेतात ठिकठिकाणी झाडे वाळण्याचे प्रमाण १० ते १५% पेक्षा जास्त वाढल्यास'
        ],
        hi: [
          'फूल आने के समय खेत में १०-१५% से अधिक पौधे अचानक सूखने लगें'
        ]
      },
      safetyNotice: {
        en: 'Important: Do not use seeds harvested from wilt-infected patches for next season planting.',
        mr: 'महत्त्वाची सूचना: मर रोग पडलेल्या शेतातून काढलेला हरभरा पुढील वर्षी बियाणे म्हणून वापरू नका.',
        hi: 'महत्वपूर्ण सूचना: उकठा प्रभावित खेत से प्राप्त चने को अगले वर्ष बीज हेतु प्रयोग न करें।'
      },
      authoritativeSource: {
        institution: {
          en: 'ICAR - Indian Institute of Pulses Research (IIPR), Kanpur & MPKV Rahuri',
          mr: 'आयसीएआर - भारतीय कडधान्य संशोधन संस्था (IIPR), कानपूर व म.फु.कृ.वि. राहुरी',
          hi: 'भाकृअनुप - भारतीय दलहन अनुसंधान संस्थान (IIPR), कानपुर'
        },
        referenceDocument: {
          en: 'Pulse Crop Protection & Wilt Management Package (ICAR-IIPR & MPKV Extension)',
          mr: 'हरभरा सुधारित शेती व मर रोग व्यवस्थापन (म.फु.कृ.वि. राहुरी विस्तार पुस्तिका)',
          hi: 'दलहन फसल सुरक्षा संदर्शिका (ICAR-IIPR)'
        },
        portalUrl: 'https://iipr.icar.gov.in',
        portalName: 'ICAR-IIPR Kanpur'
      },
      aiModelClassId: 'gram_fusarium_wilt'
    },

    // 14. Jowar (Sorghum) - Sorghum Shoot Fly
    {
      id: 'jowar-shoot-fly',
      cropId: 'jowar',
      cropName: { en: 'Jowar (Sorghum)', mr: 'ज्वारी', hi: 'ज्वार' },
      name: { en: 'Sorghum Shoot Fly', mr: 'ज्वारीवरील खोडमाशी (शूट फ्लाय)', hi: 'ज्वार की तना मक्खी (शूट फ्लाई)' },
      scientificName: 'Atherigona soccata (Rondani)',
      category: 'pest',
      categoryLabel: { en: 'Insect Pest', mr: 'कीड / किटक', hi: 'कीट' },
      affectedParts: ['stem', 'leaves'],
      affectedPartsLabel: { en: 'Central Growing Spindle Shoot, Seedling Base', mr: 'मध्यवर्ती पोंगा (गाभ्यातील पान) व खोड', hi: 'मुख्य मध्य प्ररोह (गाभा) और तना' },
      symptoms: {
        en: [
          'Small white elongated cigar-shaped eggs visible singly on lower surface of seedling leaves (1 to 4 leaf stage)',
          'Maggot bores into central growing shoot cutting the growing point, producing a classic "deadheart"',
          'Dead central shoot dries up, turns brown, and emits an offensive odor when pulled',
          'Damaged seedling produces excessive profuse unviable tillers (bushy stunted growth)'
        ],
        mr: [
          'रोप १ ते ४ पानांचे असताना पाठीमागील बाजूस तांदळाच्या दाण्यासारखी पांढरी लांबट अंडी दिसतात',
          'माशीची अळी खोडात शिरून मुख्य गाभा कुरतडते, त्यामुळे मधला कोंब वाळतो (Deadheart / पोंगा सुकणे)',
          'सुकलेला मधला पोंगा हाताने ओढल्यास सहज बाहेर येतो आणि कुजका दुर्गंध येतो',
          'मुख्य खोड मेल्यामुळे खाली भरपूर निरुपयोगी फुटवे फुटून झाड झुडपासारखे खुंटे दिसते'
        ],
        hi: [
          '१ से ४ पत्ती की अवस्था में पत्तियों के नीचे सफेद चावल जैसे अंडे दिखाई देते हैं',
          'मक्खी की सूंडी मुख्य तने के गाभे को काट देती है जिससे बीच की पत्ती सूख जाती है (डेडहार्ट)',
          'सूखी पत्ती खींचने पर आसानी से बाहर आ जाती है और सड़ी बदबू देती है',
          'पौधा झाड़ीनुमा हो जाता है और पैदावार नहीं देता'
        ]
      },
      symptomKeywords: ['shoot fly', 'deadheart', 'wilting central shoot', 'seedling pest', 'खोडमाशी', 'पोंगा सुकणे', 'गाभा', 'तना मक्खी', 'डेडहार्ट'],
      typicalConditions: {
        en: 'Seedlings within 7-30 days of germination; late-sown crops in August (Kharif) or October (Rabi) face severe shoot fly pressure.',
        mr: 'उगवणीनंतर ७ ते ३० दिवसांच्या आत कोवळी रोपे; उशिरा पेरणी केल्यास खोडमाशीचा प्रादुर्भाव प्रचंड वाढतो.',
        hi: 'अंकुरण के ७ से ३० दिन के भीतर; देर से बोई गई फसल में तना मक्खी का प्रकोप सर्वाधिक होता है।'
      },
      prevention: {
        en: [
          'Complete sowing within 10-15 days of monsoon onset (Kharif) or before October 15 (Rabi) to escape shoot fly peak',
          'Increase seed rate by 20% (use 4-5 kg/acre) and rogue out deadheart seedlings during thinning at 2 weeks',
          'Mandatory seed treatment with authorized formulations such as Imidacloprid 70 WS or Thiamethoxam 30 FS'
        ],
        mr: [
          'खरीपात पावसाच्या सुरुवातीनंतर १५ दिवसांत आणि रब्बीत १ ते १५ ऑक्टोबर दरम्यान पेरणी पूर्ण करावी (वेळेवर पेरणी केल्यास खोडमाशी टळते)',
          'बियाण्याचे प्रमाण २०% जास्त (एकरी ४-५ किलो) वापरावे आणि १५ दिवसांनी विरळणी करताना किडलेली रोपे उपटून नष्ट करावीत',
          'पेरणीपूर्वी इमिडाक्लोप्रिड ७० WS (१० ग्रॅम/किलो) किंवा थायामेथोक्साम ३० FS (१० मिली/किलो) बियाण्यास चोळावे'
        ],
        hi: [
          'समय पर बुवाई पूरी करें (खरीफ में मानसून के तुरंत बाद, रबी में १५ अक्टूबर तक)',
          'बीज दर २०% अधिक रखें और छंटाई के समय मृत पौधों को उखाड़कर नष्ट करें',
          'बुवाई से पहले अनुशंसित कीटनाशक से बीजोपचार अवश्य करें'
        ]
      },
      integratedManagement: {
        cultural: {
          en: [
            'Pull out deadheart seedlings during first interculturing and bury them deeply in soil to kill enclosed maggots'
          ],
          mr: [
            'पहिल्या खुरपणीवेळी पोंगा सुकलेली किडलेली रोपे उपटून खोल जमिनीत गाडून नष्ट करावीत'
          ],
          hi: [
            'पहली निराई के समय मृत पौधों को उखाड़कर मिट्टी में दबा दें'
          ]
        },
        biologicalMechanical: {
          en: [
            'Erect fishmeal traps @ 10-12 traps/hectare to attract and trap adult shoot flies at seedling emergence'
          ],
          mr: [
            'पेरणीनंतर रोपे उगवताच एकरी ४-५ फिशमिल (सुकी मासळी) सापळे लावून प्रौढ माशा आकर्षित करून नष्ट कराव्यात'
          ],
          hi: [
            'अंकुरण के समय फिशमील ट्रैप लगाकर वयस्क मक्खियों को नष्ट करें'
          ]
        },
        chemicalCautionGuidance: {
          en: 'If seed treatment was missed and shoot fly egg counts cross ETL (1 egg/plant or 10% deadhearts), foliar spray CIBRC-registered products such as Cypermethrin 10% EC (1 ml/L) or Quinalphos 25% EC (2 ml/L) directed at the seedling base. Consult local KVK / Agriculture Officer before application.',
          mr: 'बीजप्रक्रिया राहिली असल्यास व प्रादुर्भाव आर्थिक नुकसान पातळी (१०% पोंगा सुकलेली झाडे) ओलांडल्यास ICAR-IIMR शिफारशीनुसार सायपरमेथ्रीन १०% EC (१ मिली प्रति लिटर) किंवा क्विनॉलफॉस २५% EC (२ मिली प्रति लिटर) रोपांच्या बुंध्यावर फवारावे. औषधे लेबल क्लेमनुसारच वापरावीत.',
          hi: 'ईटीएल (१०% मृत गाभा) पार होने पर अनुशंसित कीटनाशक का पौधों के आधार पर छिड़काव करें। स्थानीय कृषि अधिकारी से पुष्टि करें।'
        }
      },
      expertConsultationSigns: {
        en: [
          'More than 25-30% of seedling stand exhibits deadheart within 20 days of emergence'
        ],
        mr: [
          'उगवणीनंतर २० दिवसांच्या आत २५ ते ३०% पेक्षा जास्त रोपांचे पोंगे सुकल्यास'
        ],
        hi: [
          'अंकुरण के २० दिनों में २५-३०% से अधिक पौधों के गाभे सूख जाएं'
        ]
      },
      safetyNotice: {
        en: 'Notice: Protect beneficial field ground predators and adhere to seed treatment chemical handling guidelines.',
        mr: 'दक्षता सूचना: बियाण्याला औषध लावताना हाताला हातमोजे वापरा आणि बियाणे सावलीत वाळवा.',
        hi: 'सूचना: बीज उपचार करते समय दस्ताने पहनें और उपचारित बीजों को बच्चों व पशुओं से दूर रखें।'
      },
      authoritativeSource: {
        institution: {
          en: 'ICAR - Indian Institute of Millets Research (IIMR), Hyderabad & MPKV Rahuri',
          mr: 'आयसीएआर - भारतीय भरडधान्य संशोधन संस्था (IIMR), हैदराबाद व म.फु.कृ.वि. राहुरी',
          hi: 'भाकृअनुप - भारतीय कदन्न अनुसंधान संस्थान (IIMR), हैदराबाद'
        },
        referenceDocument: {
          en: 'Integrated Pest Management in Sorghum (ICAR-IIMR Extension Guidelines)',
          mr: 'ज्वारी सुधारित शेती व कीड नियंत्रण (आयसीएआर-आयआयएमआर व म.फु.कृ.वि. राहुरी)',
          hi: 'ज्वार एकीकृत कीट प्रबंधन संदर्शिका (ICAR-IIMR)'
        },
        portalUrl: 'https://millets.res.in',
        portalName: 'ICAR-IIMR Millets Portal'
      },
      aiModelClassId: 'jowar_shoot_fly'
    }
  ];

  // Helper Methods

  /**
   * Return all supported crops
   */
  function getCropList() {
    return SUPPORTED_CROPS;
  }

  /**
   * Extensible: Add or register a new crop dynamically
   */
  function addCrop(crop) {
    if (!crop || !crop.id) return false;
    const exists = SUPPORTED_CROPS.some(c => c.id === crop.id);
    if (!exists) {
      SUPPORTED_CROPS.push(crop);
      return true;
    }
    return false;
  }

  /**
   * Get single crop by ID
   */
  function getCropById(cropId) {
    if (!cropId) return null;
    return SUPPORTED_CROPS.find(c => c.id.toLowerCase() === cropId.toLowerCase()) || null;
  }

  /**
   * Return all advisory entries
   */
  function getAllAdvisories() {
    return DISEASE_PEST_ENTRIES;
  }

  /**
   * Get advisories for a specific crop
   */
  function getAdvisoriesByCrop(cropId) {
    if (!cropId || cropId === 'all') return DISEASE_PEST_ENTRIES;
    return DISEASE_PEST_ENTRIES.filter(e => e.cropId.toLowerCase() === cropId.toLowerCase());
  }

  /**
   * Get single advisory entry by ID
   */
  function getAdvisoryById(id) {
    if (!id) return null;
    return DISEASE_PEST_ENTRIES.find(e => e.id.toLowerCase() === id.toLowerCase()) || null;
  }

  /**
   * Filter advisories by keyword, crop, category, affected plant part
   */
  function filterAdvisories(entries, { keyword = '', cropId = 'all', category = 'all', affectedPart = 'all' } = {}) {
    let result = entries || DISEASE_PEST_ENTRIES;

    if (cropId && cropId !== 'all') {
      result = result.filter(e => e.cropId.toLowerCase() === cropId.toLowerCase());
    }

    if (category && category !== 'all') {
      result = result.filter(e => e.category.toLowerCase() === category.toLowerCase());
    }

    if (affectedPart && affectedPart !== 'all') {
      result = result.filter(e => e.affectedParts && e.affectedParts.includes(affectedPart));
    }

    if (keyword && keyword.trim() !== '') {
      const q = keyword.trim().toLowerCase();
      result = result.filter(e => {
        const matchName = (e.name.en && e.name.en.toLowerCase().includes(q)) ||
                          (e.name.mr && e.name.mr.toLowerCase().includes(q)) ||
                          (e.name.hi && e.name.hi.toLowerCase().includes(q));

        const matchSci = e.scientificName && e.scientificName.toLowerCase().includes(q);

        const matchCrop = (e.cropName.en && e.cropName.en.toLowerCase().includes(q)) ||
                          (e.cropName.mr && e.cropName.mr.toLowerCase().includes(q)) ||
                          (e.cropName.hi && e.cropName.hi.toLowerCase().includes(q));

        const matchSymptoms = (e.symptoms.en && e.symptoms.en.some(s => s.toLowerCase().includes(q))) ||
                              (e.symptoms.mr && e.symptoms.mr.some(s => s.toLowerCase().includes(q))) ||
                              (e.symptoms.hi && e.symptoms.hi.some(s => s.toLowerCase().includes(q)));

        const matchKeywords = e.symptomKeywords && e.symptomKeywords.some(k => k.toLowerCase().includes(q));

        return matchName || matchSci || matchCrop || matchSymptoms || matchKeywords;
      });
    }

    return result;
  }

  /**
   * Guided Match Engine:
   * Select Crop -> Select Observed Symptoms / Plant Part -> View Possible Issues
   * Computes match scores and returns candidate matches with explicit "possible match" rationale.
   */
  function matchGuidedSymptoms({ cropId, affectedParts = [], symptomKeywords = [], customSymptomQuery = '' }) {
    if (!cropId) return [];

    const cropEntries = getAdvisoriesByCrop(cropId);
    if (!cropEntries || cropEntries.length === 0) return [];

    const normalizedCustom = (customSymptomQuery || '').trim().toLowerCase();
    const customTokens = normalizedCustom.split(/\s+/).filter(t => t.length > 2);

    const matches = [];

    cropEntries.forEach(entry => {
      let score = 0;
      const matchedSymptomsList = { en: [], mr: [], hi: [] };

      // 1. Plant part match weight: up to 30 points
      if (affectedParts.length > 0) {
        const commonParts = entry.affectedParts.filter(p => affectedParts.includes(p));
        if (commonParts.length > 0) {
          score += Math.min(30, (commonParts.length / affectedParts.length) * 30);
        }
      } else {
        // Neutral baseline if no part specified
        score += 15;
      }

      // 2. Symptom keywords match weight: up to 45 points
      if (symptomKeywords.length > 0) {
        let keywordHits = 0;
        symptomKeywords.forEach(kw => {
          const kLower = kw.toLowerCase();
          const inKeywords = entry.symptomKeywords.some(ek => ek.toLowerCase().includes(kLower));
          const inEnSymp = entry.symptoms.en.some(s => s.toLowerCase().includes(kLower));
          const inMrSymp = entry.symptoms.mr.some(s => s.toLowerCase().includes(kLower));
          const inHiSymp = entry.symptoms.hi.some(s => s.toLowerCase().includes(kLower));

          if (inKeywords || inEnSymp || inMrSymp || inHiSymp) {
            keywordHits++;
          }
        });

        if (keywordHits > 0) {
          score += Math.min(45, (keywordHits / symptomKeywords.length) * 45);
        }
      } else {
        score += 20;
      }

      // 3. Custom free text query token matching: up to 25 points
      if (customTokens.length > 0) {
        let tokenHits = 0;
        customTokens.forEach(token => {
          const matchName = entry.name.en.toLowerCase().includes(token) ||
                            entry.name.mr.toLowerCase().includes(token) ||
                            entry.name.hi.toLowerCase().includes(token);
          const matchKeywords = entry.symptomKeywords.some(k => k.toLowerCase().includes(token));
          const matchSymptoms = entry.symptoms.en.some(s => s.toLowerCase().includes(token)) ||
                                entry.symptoms.mr.some(s => s.toLowerCase().includes(token)) ||
                                entry.symptoms.hi.some(s => s.toLowerCase().includes(token));

          if (matchName || matchKeywords || matchSymptoms) {
            tokenHits++;
          }
        });

        score += Math.min(25, (tokenHits / customTokens.length) * 25);
      }

      // Extract matching symptom strings for display
      entry.symptoms.en.forEach((symp, idx) => {
        const sLower = symp.toLowerCase();
        const matchesPart = affectedParts.some(p => sLower.includes(p));
        const matchesKeyword = symptomKeywords.some(k => sLower.includes(k.toLowerCase()));
        const matchesCustom = customTokens.some(t => sLower.includes(t));

        if (matchesPart || matchesKeyword || matchesCustom) {
          matchedSymptomsList.en.push(entry.symptoms.en[idx]);
          matchedSymptomsList.mr.push(entry.symptoms.mr[idx] || entry.symptoms.en[idx]);
          matchedSymptomsList.hi.push(entry.symptoms.hi[idx] || entry.symptoms.en[idx]);
        }
      });

      // Default to top symptom if none isolated
      if (matchedSymptomsList.en.length === 0 && entry.symptoms.en.length > 0) {
        matchedSymptomsList.en.push(entry.symptoms.en[0]);
        matchedSymptomsList.mr.push(entry.symptoms.mr[0]);
        matchedSymptomsList.hi.push(entry.symptoms.hi[0]);
      }

      const finalScore = Math.min(98, Math.max(25, Math.round(score)));

      matches.push({
        entry,
        matchScore: finalScore,
        matchedSymptoms: matchedSymptomsList,
        matchRationale: {
          en: `Possible match based on selected symptoms (${finalScore}% symptom correlation). Field verification recommended.`,
          mr: `निवडलेल्या लक्षणांवर आधारित संभाव्य जुळणी (${finalScore}% लक्षण सुसंगती). प्रत्यक्ष शेतातील पाहणी आवश्यक.`,
          hi: `चुने गए लक्षणों के आधार पर संभावित मिलान (${finalScore}% लक्षण समानता)। खेत में प्रत्यक्ष सत्यापन आवश्यक।`
        }
      });
    });

    // Sort descending by match score
    matches.sort((a, b) => b.matchScore - a.matchScore);
    return matches;
  }

  /**
   * Future AI Readiness Connector:
   * Adapts AI plant leaf image diagnosis results into the standardized advisory schema.
   */
  function adaptAiDiagnosticResult(aiInput) {
    if (!aiInput) return null;

    const { predictedLabel = '', cropId = '', confidenceScore = 0, detectedSymptoms = [], notes = '' } = aiInput;

    const normLabel = predictedLabel.toLowerCase();
    const normCrop = cropId.toLowerCase();

    // Find closest advisory entry by class ID or name
    let matchedEntry = DISEASE_PEST_ENTRIES.find(e => {
      if (e.aiModelClassId && normLabel.includes(e.aiModelClassId.toLowerCase())) return true;
      if (e.id.toLowerCase() === normLabel) return true;
      if (e.name.en.toLowerCase().includes(normLabel)) return true;
      return false;
    });

    // Fallback: match by crop
    if (!matchedEntry && normCrop) {
      const candidates = getAdvisoriesByCrop(normCrop);
      if (candidates.length > 0) {
        matchedEntry = candidates[0];
      }
    }

    if (!matchedEntry) {
      matchedEntry = DISEASE_PEST_ENTRIES[0];
    }

    const conf = Math.round(confidenceScore > 1 ? confidenceScore : confidenceScore * 100);

    return {
      entry: matchedEntry,
      confidenceScore: conf,
      isAiIdentified: true,
      matchConfidenceBadge: `${conf}% Confidence Match`,
      aiNotice: {
        en: `AI leaf scan matched with ${matchedEntry.name.en} (${conf}% model confidence). This is a computer vision suggestion and not a certified lab diagnosis. Confirm with your local KVK.`,
        mr: `एआय (AI) इमेज तपासणीनुसार ${matchedEntry.name.mr} ची संभाव्य शक्यता आढळली (${conf}% मॉडेल अचूकता). हे संगणकीय विश्लेषण असून अधिकृत प्रयोगशाळा चाचणी नाही. स्थानिक कृषी अधिकाऱ्यांकडून खात्री करा.`,
        hi: `एआई पत्ती स्कैन द्वारा ${matchedEntry.name.hi} का संभावित मिलान पाया गया (${conf}% मॉडल विश्वसनीयता)। यह कंप्यूटर विजन आधारित सुझाव है, प्रमाणित प्रयोगशाला निदान नहीं। स्थानीय केवीके से पुष्टि करें।`
      }
    };
  }

  return {
    SUPPORTED_CROPS,
    DISEASE_PEST_ENTRIES,
    ICONS,
    getCropList,
    addCrop,
    getCropById,
    getAllAdvisories,
    getAdvisoriesByCrop,
    getAdvisoryById,
    filterAdvisories,
    matchGuidedSymptoms,
    adaptAiDiagnosticResult
  };
});
