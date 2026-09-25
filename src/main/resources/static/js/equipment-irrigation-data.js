/**
 * Smart Krishi Sahayak - Farm Equipment & Irrigation Data & Engine
 * Contains authentic, verified agronomic and mechanization specifications
 * based on ICAR, Central Institute of Agricultural Engineering (CIAE), and PMKSY guidelines.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.EquipmentIrrigationData = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  // SVG Icons for equipment and irrigation components
  const ICONS = {
    tractor: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="guide-svg-icon"><circle cx="48" cy="46" r="10"/><circle cx="16" cy="48" r="8"/><path d="M16 48h22l2-16H22l-6 16z"/><path d="M38 32V18h14v14"/><path d="M44 18l4-8h6"/><path d="M22 32h16"/></svg>`,
    cultivator: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="guide-svg-icon"><path d="M8 20h48M20 20v14c0 6 6 12 12 12s12-6 12-12V20"/><path d="M14 20v22l-4 8M50 20v22l4 8M32 20v26l-3 4"/></svg>`,
    rotavator: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="guide-svg-icon"><circle cx="32" cy="32" r="18"/><circle cx="32" cy="32" r="6"/><path d="M32 14v-6M32 56v-6M14 32H8M56 32h-6M19 19l-4-4M49 49l-4-4M19 45l-4 4M49 19l-4 4"/></svg>`,
    seedDrill: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="guide-svg-icon"><path d="M12 16h40l-6 16H18L12 16z"/><path d="M22 32v18l-4 6M32 32v24M42 32v18l4 6"/><circle cx="12" cy="50" r="4"/><circle cx="52" cy="50" r="4"/></svg>`,
    plough: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="guide-svg-icon"><path d="M10 18h28l16 26H28L10 18z"/><path d="M28 44l-8 12M44 44l8 8M10 18L4 32h14"/></svg>`,
    sprayer: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="guide-svg-icon"><rect x="18" y="18" width="28" height="34" rx="6"/><path d="M32 18V8h-6M46 28l10-4v18l-10 6"/><circle cx="56" cy="24" r="3"/><path d="M58 20l4-4M56 16v-4"/></svg>`,
    powerTiller: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="guide-svg-icon"><circle cx="20" cy="46" r="10"/><path d="M20 46l18-18h16M38 28l10 10M12 36l8 10M38 28v18l12 6"/></svg>`,
    harvester: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="guide-svg-icon"><rect x="12" y="16" width="36" height="26" rx="4"/><circle cx="22" cy="48" r="8"/><circle cx="44" cy="48" r="8"/><path d="M48 24h10l-4 14h-6M6 34h8v8H6z"/></svg>`,
    waterPump: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="guide-svg-icon"><circle cx="32" cy="36" r="16"/><path d="M32 20V8h12v12M16 36H6M48 36h10"/><circle cx="32" cy="36" r="5"/><path d="M28 32l8 8M36 32l-8 8"/></svg>`,
    thresher: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="guide-svg-icon"><rect x="14" y="20" width="36" height="24" rx="4"/><circle cx="32" cy="32" r="8"/><path d="M8 12l10 8M46 20l12-10M20 44l-6 12M44 44l6 12M28 32h8"/></svg>`,
    drip: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="guide-svg-icon"><path d="M8 24h48M32 24v8c0 8-8 16-8 16s8-8 8-16"/><path d="M32 38c0 4-4 8-4 8s4-4 4-8"/><circle cx="32" cy="54" r="3" fill="currentColor"/></svg>`,
    sprinkler: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="guide-svg-icon"><path d="M32 56V32M24 32h16l-8-12-8 12z"/><path d="M20 20l-8-8M44 20l8-8M32 18V8M14 26H6M50 26h8"/></svg>`,
    surfaceFlood: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="guide-svg-icon"><path d="M8 44c8-4 16 4 24 0s16-4 24 0M8 52c8-4 16 4 24 0s16-4 24 0"/><path d="M12 28l20-14 20 14H12z"/></svg>`,
    furrow: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="guide-svg-icon"><path d="M8 40l12 12 12-12 12 12 12-12"/><path d="M20 30V18M44 30V18M16 22l4-4 4 4M40 22l4-4 4 4"/></svg>`,
    rainGun: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="guide-svg-icon"><path d="M20 54l12-18 12 18M32 36V24l16-8"/><path d="M48 16c6-2 10-4 10-4M46 22c6-1 8-2 8-2M48 10c4-1 6-2 6-2"/></svg>`,
    microIrrigation: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="guide-svg-icon"><path d="M32 54V34M26 34h12l-6-8-6 8z"/><circle cx="20" cy="22" r="2" fill="currentColor"/><circle cx="32" cy="16" r="2" fill="currentColor"/><circle cx="44" cy="22" r="2" fill="currentColor"/><path d="M14 54h36"/></svg>`
  };

  // 1. Farm Equipment Data (10 Categories)
  const EQUIPMENT_LIST = [
    {
      id: 'tractor',
      name: {
        en: 'Tractor',
        mr: 'ट्रॅक्टर (Tractor)',
        hi: 'ट्रैक्टर (Tractor)'
      },
      category: 'Primary Power & Haulage',
      categoryKey: 'power',
      icon: 'bi-truck',
      image: ICONS.tractor,
      badge: 'Versatile Power Engine',
      mainPurpose: {
        en: 'Primary multi-purpose power source for pulling heavy tillage tools, powering rotary implements via PTO shaft, and hauling agricultural produce.',
        mr: 'जमीन मशागतीची अवजारे ओढणे, रोटाव्हेटर/स्प्रेयर चालवणे आणि शेतमाल वाहतुकीसाठी लागणारे मुख्य बहुउद्देशीय शक्तिसाधन.',
        hi: 'गहरी जुताई के उपकरण खींचने, पीटीओ (PTO) शाफ्ट द्वारा यंत्र चलाने और कृषि उपज ढुलाई के लिए मुख्य बहुउद्देशीय शक्ति स्रोत।'
      },
      suitableCrops: {
        en: ['Sugarcane', 'Cotton', 'Soybean', 'Wheat', 'Paddy', 'Maize', 'Gram', 'Horticulture'],
        mr: ['ऊस', 'कापूस', 'सोयाबीन', 'गहू', 'भात', 'मका', 'हरभरा', 'फळबागा'],
        hi: ['गन्ना', 'कपास', 'सोयाबीन', 'गेहूं', 'धान', 'मक्का', 'चना', 'बागवानी']
      },
      bestUseStage: {
        en: 'Land preparation, sowing, intercultural weeding, chemical spraying, harvesting support, and post-harvest transport.',
        mr: 'पूर्व मशागत (नांगरणी/कुळवणी), पेरणी, आंतरमशागत, फवारणी आणि शेतमाल वाहतूक.',
        hi: 'भूमि तैयारी (जुताई), बुवाई, अंतर-शस्य क्रियाएं, कीटनाशक छिड़काव और उपज ढुलाई।'
      },
      basicWorking: {
        en: 'Heavy-duty 3 or 4-cylinder diesel engine generates high low-end torque. Power is delivered to high-traction rear wheels, 3-point hydraulic hitch for implement lifting, and 540 RPM PTO shaft for rotating machinery.',
        mr: '३ किंवा ४ सिलेंडर डिझेल इंजिन उच्च टॉर्क निर्माण करते. ही शक्ती मोठ्या चाकांना, हायड्रॉलिक लिफ्टला आणि फिरणाऱ्या अवजारांसाठी ५४० RPM पीटीओ (PTO) शाफ्टला दिली जाते.',
        hi: 'शक्तिशाली ३ या ४ सिलेंडर डीजल इंजन उच्च टॉर्क प्रदान करता है। यह शक्ति पहियों, हाइड्रोलिक लिफ्ट और घूमने वाले उपकरणों के लिए ५४० आरपीएम पीटीओ शाफ्ट को दी जाती है।'
      },
      keySpecifications: [
        {
          label: { en: 'Power Range', mr: 'अश्वशक्ती (HP)', hi: 'अश्वशक्ति (HP)' },
          value: { en: '35 HP to 65 HP', mr: '३५ ते ६५ एच.पी.', hi: '३५ से ६५ एच.पी.' }
        },
        {
          label: { en: 'PTO Speed', mr: 'पीटीओ गती', hi: 'पीटीओ स्पीड' },
          value: { en: '540 RPM @ standard engine RPM', mr: '५४० RPM प्रमाणित इंजिन वेगावर', hi: '५४० RPM मानक इंजन गति पर' }
        },
        {
          label: { en: 'Hitch System', mr: 'जोडणी पद्धत', hi: 'लिंकेज सिस्टम' },
          value: { en: '3-Point Linkage (Category I / II)', mr: '३-पॉइंट हायड्रॉलिक लिंकेज', hi: '३-पॉइंट हाइड्रोलिक लिंकेज' }
        },
        {
          label: { en: 'Lifting Capacity', mr: 'वजन उचलण्याची क्षमता', hi: 'वजन उठाने की क्षमता' },
          value: { en: '1,200 kg – 2,500 kg', mr: '१,२०० ते २,५०० किलोग्रॅम', hi: '१,२०० से २,५०० किलोग्राम' }
        },
        {
          label: { en: 'Fuel Type', mr: 'इंधन प्रकार', hi: 'ईंधन प्रकार' },
          value: { en: 'High Speed Diesel (HSD)', mr: 'डिझेल (Diesel)', hi: 'डीजल (Diesel)' }
        }
      ],
      maintenance: {
        en: [
          'Daily check of engine oil level, radiator coolant, and air cleaner dust bowl.',
          'Grease kingpins, tie-rod joints, and brake pedals every 50 operating hours.',
          'Drain fuel water separator bowl weekly to prevent diesel pump corrosion.',
          'Change engine oil and oil filter every 250-300 working hours.'
        ],
        mr: [
          'दररोज इंजिन ऑईल पातळी, रेडिएटरमधील पाणी आणि एअर फिल्टरमधील धूळ तपासा.',
          'प्रत्येक ५० तासांनंतर स्टीअरिंग जॉइंट्स, ब्रेक पेडल आणि बेअरिंग्जमध्ये ग्रीसिंग करा.',
          'डिझेल फिल्टरमधून आठवड्यातून एकदा जमा झालेले पाणी काढून टाका.',
          'प्रत्येक २५० ते ३०० तासांनंतर इंजिन ऑईल व ऑईल फिल्टर बदला.'
        ],
        hi: [
          'प्रतिदिन इंजन ऑयल स्तर, रेडिएटर कूलेंट और एयर फिल्टर बाउल की जांच करें।',
          'प्रत्येक ५० कार्य घंटों के बाद स्टीयरिंग लिंकेज व बेयरिंग में ग्रीस लगाएं।',
          'सप्ताह में एक बार डीजल वाटर सेपरेटर से जमा पानी बाहर निकालें।',
          'हर २५०-३०० घंटे चलने पर इंजन ऑयल और ऑयल फिल्टर अवश्य बदलें।'
        ]
      },
      safetyTips: {
        en: [
          'Always use Roll-Over Protective Structure (ROPS) and fasten seat belt.',
          'Ensure the PTO master shield is firmly installed before operating rotary implements.',
          'Never permit anyone to ride on mudguards, drawbar, or trailing implements.',
          'Lock both brake pedals together when driving on public roads.'
        ],
        mr: [
          'नेहमी रोल-ओव्हर सुरक्षा फ्रेम (ROPS) वापरा आणि सीट बेल्ट लावा.',
          'रोटाव्हेटर किंवा थ्रेशर चालवताना पीटीओ (PTO) सेफ्टी कव्हर नेहमी जागेवर ठेवा.',
          'मडगार्डवर किंवा अवजारांवर कोणालाही बसू देऊ नका.',
          'रस्त्यावर चालवताना दोन्ही ब्रेक पेडल नेहमी एकत्र लॉक करून ठेवा.'
        ],
        hi: [
          'हमेशा रोल-ओवर सुरक्षा फ्रेम (ROPS) का उपयोग करें और सीट बेल्ट बांधें।',
          'घूमने वाले उपकरण चलाते समय पीटीओ सेफ्टी शील्ड को हमेशा बंद रखें।',
          'मडगार्ड या उपकरण पर किसी को भी बैठने की अनुमति न दें।',
          'सड़क पर चलते समय दोनों ब्रेक पेडल को एक साथ लॉक रखें।'
        ]
      },
      suitableFarmSize: {
        en: 'Medium to Large farms (> 3 Acres) or Custom Hiring',
        mr: 'मध्यम ते मोठे शेत (> ३ एकर) किंवा भाडेतत्त्वावर',
        hi: 'मध्यम से बड़े खेत (> ३ एकड़) या किराए पर'
      },
      powerSource: { en: 'Diesel Engine', mr: 'डिझेल इंजिन', hi: 'डीजल इंजन' }
    },
    {
      id: 'cultivator',
      name: {
        en: 'Cultivator',
        mr: 'कल्टिव्हेटर / कुळव (Cultivator)',
        hi: 'कल्टीवेटर (Cultivator)'
      },
      category: 'Secondary Tillage & Weeding',
      categoryKey: 'tillage',
      icon: 'bi-grid-3x3',
      image: ICONS.cultivator,
      badge: 'Seedbed & Weeding Implement',
      mainPurpose: {
        en: 'Secondary tillage, shattering hard surface soil crusts, uprooting weeds, and creating a loose, well-aerated seedbed before sowing.',
        mr: 'नांगरणीनंतर ढेकळे फोडणे, तण मुळासकट उपटून काढणे आणि पेरणीपूर्वी जमीन भुसभुशीत व हवा खेळती करणे.',
        hi: 'जुताई के बाद मिट्टी के ढेलों को तोड़ना, खरपतवार को जड़ से उखाड़ना और बुवाई पूर्व भुरभुरी मिट्टी तैयार करना।'
      },
      suitableCrops: {
        en: ['Cotton', 'Soybean', 'Maize', 'Groundnut', 'Pulses', 'Wheat', 'Sunflower'],
        mr: ['कापूस', 'सोयाबीन', 'मका', 'भुईमूग', 'कडधान्ये', 'गहू', 'सूर्यफूल'],
        hi: ['कपास', 'सोयाबीन', 'मक्का', 'मूंगफली', 'दलहन', 'गेहूं', 'सूरजमुखी']
      },
      bestUseStage: {
        en: 'Secondary land preparation (1-2 weeks before sowing) and inter-row weeding during initial vegetative crop growth.',
        mr: 'पेरणीपूर्वीची दुय्यम मशागत आणि पिकाच्या सुरुवातीच्या वाढीच्या काळात आंतरमशागत.',
        hi: 'बुवाई से पहले द्वितीयक तैयारी और फसल के शुरुआती विकास में पंक्तियों के बीच निराई।'
      },
      basicWorking: {
        en: 'Mounted on tractor 3-point hitch. Spring-loaded or rigid vertical tines with reversible duckfoot shovel points penetrate 10-18 cm into soil, breaking soil crusts and dislodging weeds without inverting the subsoil.',
        mr: 'ट्रॅक्टरच्या ३-पॉइंट लिंकेजला जोडलेले स्प्रिंग-लोडेड फाळे जमिनीमध्ये १०-१८ सेंमी आत शिरतात आणि खालची ओल न गमावता वरचा थर मोकळा करतात.',
        hi: 'ट्रैक्टर के ३-पॉइंट लिंकेज पर जुड़ा होता है। स्प्रिंग वाले टाइन मिट्टी में १०-१८ सेमी गहराई तक जाकर ढेलों को तोड़ते हैं और खरपतवार निकालते हैं।'
      },
      keySpecifications: [
        {
          label: { en: 'Number of Tines', mr: 'फाळांची संख्या', hi: 'टाइन की संख्या' },
          value: { en: '7, 9, or 11 tines (Spring loaded)', mr: '७, ९ किंवा ११ फाळे (स्प्रिंग लोडेड)', hi: '७, ९ या ११ टाइन (स्प्रिंग लोडेड)' }
        },
        {
          label: { en: 'Working Depth', mr: 'कार्यकारी खोली', hi: 'काम करने की गहराई' },
          value: { en: '10 cm – 18 cm', mr: '१० ते १८ सेंमी', hi: '१० से १८ सेमी' }
        },
        {
          label: { en: 'Tractor Power Needed', mr: 'आवश्यक ट्रॅक्टर क्षमता', hi: 'आवश्यक ट्रैक्टर शक्ति' },
          value: { en: '35 HP to 50 HP', mr: '३५ ते ५० एच.पी.', hi: '३५ से ५० एच.पी.' }
        },
        {
          label: { en: 'Working Width', mr: 'कार्यकारी रुंदी', hi: 'काम करने की चौड़ाई' },
          value: { en: '1.8 m to 2.4 m', mr: '१.८ ते २.४ मीटर', hi: '१.८ से २.४ मीटर' }
        }
      ],
      maintenance: {
        en: [
          'Inspect and tighten shovel bolts before each day’s work.',
          'Reverse or replace worn shovel points when tips become blunt.',
          'Check spring tension coils and lubricate pivot pins.',
          'Clean off packed wet clay after field use to prevent rust.'
        ],
        mr: [
          'प्रत्येक कामापूर्वी फाळांचे नट-बोल्ट घट्ट आहेत का ते तपासा.',
          'फाळांचे टोक झिजल्यावर ते उलटवून लावा किंवा नवीन बसवा.',
          'स्प्रिंग कॉईल्स आणि पिव्होट पिन्समध्ये ऑईल/ग्रीस लावा.',
          'काम झाल्यावर चिकटलेली माती काढून अवजार स्वच्छ ठेवा.'
        ],
        hi: [
          'काम शुरू करने से पहले फावड़े के बोल्ट कसकर चेक करें।',
          'टाइन के सिरे घिस जाने पर उन्हें पलटें या बदलें।',
          'स्प्रिंग टेंशन और पिवट पिन में तेल लगाएं।',
          'उपयोग के बाद मिट्टी साफ करें ताकि जंग न लगे।'
        ]
      },
      safetyTips: {
        en: [
          'Never stand behind or between tractor and cultivator while hydraulic lift is operated.',
          'Keep clear of spring tines under tension during rock strikes.',
          'Lower implement fully to the ground before parking or disconnecting.'
        ],
        mr: [
          'हायड्रॉलिक लिफ्ट चालू असताना ट्रॅक्टर आणि कल्टिव्हेटरच्या मध्ये उभे राहू नका.',
          'जमिनीतील दगड लागल्यास स्प्रिंग झटका देऊ शकते, त्यामुळे सुरक्षित अंतर ठेवा.',
          'काम थांबवताना अवजार नेहमी जमिनीवर पूर्ण टेकवून ठेवा.'
        ],
        hi: [
          'हाइड्रोलिक उठाते या गिराते समय कल्टीवेटर के पीछे या बीच में न खड़े हों।',
          'पत्थर टकराने पर स्प्रिंग झटके दे सकती है, अतः सुरक्षित दूरी रखें।',
          'पार्किंग करते समय उपकरण को हमेशा जमीन पर पूरी तरह टिकाएं।'
        ]
      },
      suitableFarmSize: {
        en: 'All farm sizes with tractor access',
        mr: 'सर्व आकारांची शेती (ट्रॅक्टर उपलब्ध असल्यास)',
        hi: 'सभी आकार के खेत (ट्रैक्टर उपलब्ध होने पर)'
      },
      powerSource: { en: 'Tractor PTO & Drawbar', mr: 'ट्रॅक्टर ड्रॉबार', hi: 'ट्रैक्टर ड्रॉबार' }
    },
    {
      id: 'rotavator',
      name: {
        en: 'Rotavator (Rotary Tiller)',
        mr: 'रोटाव्हेटर / रोटरी टिलर (Rotavator)',
        hi: 'रोटावेटर / रोटरी टिलर (Rotavator)'
      },
      category: 'Seedbed Pulverization & Residue Mulching',
      categoryKey: 'tillage',
      icon: 'bi-arrow-repeat',
      image: ICONS.rotavator,
      badge: 'Single-Pass Seedbed Machine',
      mainPurpose: {
        en: 'One-pass fine seedbed preparation, clod pulverization, and active soil mixing of crop residues, sugarcane trash, and green manure.',
        mr: 'एकाच फेरीत माती अत्यंत भुसभुशीत करणे, ढेकळे फोडणे आणि उसाचे पाचट किंवा हिरवळीचे खत मातीत एकजीव करणे.',
        hi: 'एक ही चक्कर में मिट्टी को भुरभुरा बनाना, ढेलों को पीसना और फसल अवशेष (जैसे गन्ने की पत्ती) को मिट्टी में मिलाना।'
      },
      suitableCrops: {
        en: ['Paddy (Dry & Wet Puddling)', 'Wheat', 'Sugarcane', 'Cotton', 'Vegetables', 'Maize', 'Soybean'],
        mr: ['भात (चिखलणी व कोरडी मशागत)', 'गहू', 'ऊस', 'कापूस', 'भाजीपाला', 'मका', 'सोयाबीन'],
        hi: ['धान (गीली व सूखी मथाई)', 'गेहूं', 'गन्ना', 'कपास', 'सब्जियां', 'मक्का', 'सोयाबीन']
      },
      bestUseStage: {
        en: 'Pre-sowing seedbed preparation and post-harvest crop stubble incorporation.',
        mr: 'पेरणीपूर्वी जमीन तयार करताना आणि काढणीनंतर उरलेले अवशेष मातीत गाडताना.',
        hi: 'बुवाई से ठीक पहले खेत तैयार करते समय और कटाई के बाद अवशेषों को दबाने के लिए।'
      },
      basicWorking: {
        en: 'Tractor PTO shaft powers an oil-bath gearbox that spins a horizontal rotor with curved high-boron L or C-shaped blades at 210-240 RPM, slicing and beating the soil against an adjustable rear shield.',
        mr: 'ट्रॅक्टरच्या ५४० RPM पीटीओ शाफ्टद्वारे रोटाव्हेटरचे आडवे पाते फिरते. उच्च दर्जाची L किंवा C आकाराची पाती २१०-२४० वेगाने फिरून माती बारीक करतात.',
        hi: 'ट्रैक्टर के पीटीओ द्वारा रोटावेटर की हॉरिजॉन्टल शाफ्ट २१०-२४० आरपीएम पर घूमती है और इसके एल (L) या सी (C) आकार के ब्लेड मिट्टी को बारीक करते हैं।'
      },
      keySpecifications: [
        {
          label: { en: 'Working Width', mr: 'कार्यकारी रुंदी', hi: 'काम करने की चौड़ाई' },
          value: { en: '5 to 7 Feet (1.5 m to 2.1 m)', mr: '५ ते ७ फूट (१.५ ते २.१ मी)', hi: '५ से ७ फीट (१.५ से २.१ मी)' }
        },
        {
          label: { en: 'Blades Count', mr: 'पात्यांची संख्या', hi: 'ब्लेडों की संख्या' },
          value: { en: '36, 42, or 48 L-type blades', mr: '३६, ४२ किंवा ४८ L-आकाराची पाती', hi: '३६, ४२ या ४८ एल-टाइप ब्लेड' }
        },
        {
          label: { en: 'Tractor HP', mr: 'आवश्यक ट्रॅक्टर क्षमता', hi: 'आवश्यक ट्रैक्टर शक्ति' },
          value: { en: '40 HP to 60+ HP', mr: '४० ते ६०+ एच.पी.', hi: '४० से ६०+ एच.पी.' }
        },
        {
          label: { en: 'Working Depth', mr: 'खोली', hi: 'गहराई' },
          value: { en: '10 cm to 15 cm', mr: '१० ते १५ सेंमी', hi: '१० से १५ सेमी' }
        },
        {
          label: { en: 'Gearbox Oil', mr: 'गिअरबॉक्स ऑईल', hi: 'गियरबॉक्स ऑयल' },
          value: { en: 'EP-90 or EP-140 Gear Oil', mr: 'EP-90 किंवा EP-140 ऑईल', hi: 'EP-90 या EP-140 गियर ऑयल' }
        }
      ],
      maintenance: {
        en: [
          'Check side gear drive and central gearbox oil levels every 50 working hours.',
          'Inspect blades daily for wear, bends, and loose fasteners; replace blunt blades.',
          'Grease PTO drive shaft cross joints and shear bolt housing daily.',
          'Clean out entangled weeds, wire, and plastic ropes from rotor shaft after each session.'
        ],
        mr: [
          'दर ५० तासांनी मेन गिअरबॉक्स आणि साईड ड्राईव्हमधील ऑईल पातळी तपासा.',
          'पाती सैल आहेत का किंवा झिजली आहेत का ते तपासा; झिजलेली पाती बदला.',
          'पीटीओ शाफ्टच्या क्रॉस बेअरिंग्जमध्ये दररोज ग्रीसिंग करा.',
          'रोटाव्हेटरच्या शाफ्टमध्ये अडकलेले तण व प्लास्टिक दोऱ्या कामावरून परतल्यावर काढून टाका.'
        ],
        hi: [
          'हर ५० घंटे में मेन गियरबॉक्स और साइड गियर के तेल का स्तर जांचें।',
          'ब्लेड के नट-बोल्ट रोजाना चेक करें और मुड़े हुए ब्लेड बदलें।',
          'पीटीओ क्रॉस बेयरिंग में रोजाना ग्रीस लगाएं।',
          'शाफ्ट पर लिपटे खरपतवार और रस्सियों को नियमित रूप से हटाएं।'
        ]
      },
      safetyTips: {
        en: [
          'NEVER inspect, unclog, or touch rotor blades while tractor engine is running or PTO is engaged.',
          'Always keep the rear trailing flap lowered to contain flying stones and debris.',
          'Ensure shear-bolt is of specified grade to prevent transmission blowouts.'
        ],
        mr: [
          'इंजिन चालू असताना किंवा पीटीओ फिरत असताना कधीही पात्यांजवळ हात लावू नका.',
          'उडालेले दगड कोणाला लागू नयेत म्हणून मागचा संरक्षक पडदा (Flap) नेहमी खाली ठेवा.',
          'गिअरबॉक्स सुरक्षित राहण्यासाठी ठरवून दिलेलाच शिअर-बोल्ट (Shear Bolt) वापरा.'
        ],
        hi: [
          'इंजन चालू होने या पीटीओ लगे होने पर कभी भी ब्लेड के पास हाथ न ले जाएं।',
          'उछलने वाले पत्थरों से बचने के लिए पीछे का सुरक्षात्मक कवर हमेशा नीचे रखें।',
          'गियरबॉक्स की सुरक्षा के लिए केवल सही ग्रेड का शियर-बोल्ट ही लगाएं।'
        ]
      },
      suitableFarmSize: {
        en: 'Medium to Large farms or custom rental service',
        mr: 'मध्यम ते मोठी शेती किंवा भाडेतत्त्वावर सेवा',
        hi: 'मध्यम से बड़े खेत या कस्टम हायरिंग'
      },
      powerSource: { en: 'Tractor PTO (540 RPM)', mr: 'ट्रॅक्टर ५४० RPM पीटीओ', hi: 'ट्रैक्टर ५४० RPM पीटीओ' }
    },
    {
      id: 'seed-drill',
      name: {
        en: 'Seed Drill (Seed-cum-Fertilizer Drill)',
        mr: 'पेरणी यंत्र / सीड ड्रिल (Seed-cum-Fertilizer Drill)',
        hi: 'सीड ड्रिल / बुवाई यंत्र (Seed-cum-Fertilizer Drill)'
      },
      category: 'Sowing & Basal Fertilizer Placement',
      categoryKey: 'sowing',
      icon: 'bi-box-seam',
      image: ICONS.seedDrill,
      badge: 'Precision Sowing Machine',
      mainPurpose: {
        en: 'Precision seed placement at uniform depth and row-to-row spacing with simultaneous subsurface placement of basal fertilizer bands.',
        mr: 'निश्चित खोलीवर आणि दोन ओळींमध्ये योग्य अंतरावर बियाणे पेरणे, तसेच बियाण्याजवळ खताची मात्रा एकाच वेळी देणे.',
        hi: 'निश्चित गहराई और समान पंक्ति दूरी पर बीज बोना और साथ में रासायनिक खाद को सही गहराई पर डालना।'
      },
      suitableCrops: {
        en: ['Wheat', 'Soybean', 'Chickpea (Chana)', 'Mustard', 'Maize', 'Groundnut', 'Barley', 'Millets'],
        mr: ['गहू', 'सोयाबीन', 'हरभरा', 'मोहरी', 'मका', 'भुईमूग', 'ज्वारी', 'बाजरी'],
        hi: ['गेहूं', 'सोयाबीन', 'चना', 'सरसों', 'मक्का', 'मूंगफली', 'जौ', 'बाजरा']
      },
      bestUseStage: {
        en: 'Sowing / Seeding stage at the start of Kharif and Rabi cropping seasons.',
        mr: 'खरीप व रब्बी हंगामाच्या सुरुवातीला पेरणीचा टप्पा.',
        hi: 'खरीफ और रबी मौसम की शुरुआत में बुवाई के समय।'
      },
      basicWorking: {
        en: 'Driven ground wheels rotate fluted roller metering mechanisms inside seed and fertilizer hoppers. Seeds and granules drop through transparent delivery tubes into furrow opener boots that deposit and gently cover them with soil.',
        mr: 'जमिनीवर चालणाऱ्या चाकामुळे बियाणे व खताच्या पेटीतील मोजणी चक्रे (Rollers) फिरतात. पाईप्सद्वारे बियाणे व खत योग्य खोलीवर जमिनीत सोडले जाते आणि माती झाकली जाते.',
        hi: 'पहियों के घूमने से हॉपर के रोलर घूमते हैं और बीज व उर्वरक पाइपों के माध्यम से खांचों में गिरकर मिट्टी से ढक जाते हैं।'
      },
      keySpecifications: [
        {
          label: { en: 'Number of Rows', mr: 'ओळींची संख्या', hi: 'पंक्तियों की संख्या' },
          value: { en: '9, 11, or 13 Rows', mr: '९, ११ किंवा १३ दाते (ओळी)', hi: '९, ११ या १३ लाइन' }
        },
        {
          label: { en: 'Row Spacing', mr: 'ओळींमधील अंतर', hi: 'पंक्ति की दूरी' },
          value: { en: 'Adjustable 15 cm to 30 cm', mr: '१५ ते ३० सेंमी (समायोज्य)', hi: '१५ से ३० सेमी (समायोज्य)' }
        },
        {
          label: { en: 'Sowing Depth', mr: 'पेरणीची खोली', hi: 'बुवाई की गहराई' },
          value: { en: '2.5 cm to 7.5 cm', mr: '२.५ ते ७.५ सेंमी', hi: '२.५ से ७.५ सेमी' }
        },
        {
          label: { en: 'Tractor HP', mr: 'आवश्यक ट्रॅक्टर', hi: 'आवश्यक ट्रैक्टर' },
          value: { en: '35 HP to 45 HP', mr: '३५ ते ४५ एच.पी.', hi: '३५ से ४५ एच.पी.' }
        },
        {
          label: { en: 'Hopper Capacity', mr: 'पेटीची क्षमता', hi: 'हॉपर क्षमता' },
          value: { en: '50-80 kg seed & fertilizer', mr: '५० ते ८० किलो बियाणे व खत', hi: '५० से ८० किलो बीज व खाद' }
        }
      ],
      maintenance: {
        en: [
          'Thoroughly empty and clean all seed and fertilizer hoppers immediately after seasonal use (fertilizer causes severe rusting).',
          'Wash with water, dry completely, and apply protective coating of used motor oil.',
          'Lubricate drive chains, sprockets, and fluted feed shafts regularly.',
          'Check rubber/plastic seed delivery tubes for cracks, bends, or rodent bites.'
        ],
        mr: [
          'काम संपल्यावर खताची व बियाण्याची पेटी पूर्ण रिकामी करा (खतामुळे लोखंड गंजते).',
          'पाण्याने स्वच्छ धुवून वाळवा आणि ऑईलचा थर देऊन कोरड्या जागी ठेवा.',
          'चेन, दात आणि फिरणाऱ्या शाफ्टला नियमित ऑईलिंग करा.',
          'बियाण्याच्या प्लास्टिक नळ्या कुठे तुटल्या आहेत का ते तपासा.'
        ],
        hi: [
          'काम खत्म होने पर खाद और बीज के बक्से तुरंत खाली करें ताकि जंग न लगे।',
          'धोकर सुखाएं और हल्का तेल लगाकर सुरक्षित स्थान पर रखें।',
          'ड्राइव चेन और रोलर शाफ्ट में नियमित रूप से तेल लगाएं।',
          'बीज वितरण पाइपों की जांच करें कि वे कटे या मुड़े तो नहीं हैं।'
        ]
      },
      safetyTips: {
        en: [
          'Never ride on the seed drill platform during high-speed road transport.',
          'Turn off tractor engine and lower implement when clearing clogged furrow openers.',
          'Ensure fertilizer does not come into contact with skin or open cuts.'
        ],
        mr: [
          'ट्रॅक्टर रस्त्यावरून नेताना मागच्या फळीवर कोणालाही उभे राहू देऊ नका.',
          'दात्यांमध्ये अडकलेला कचरा काढताना ट्रॅक्टर बंद करा आणि यंत्र जमिनीवर टेकवा.',
          'रासायनिक खत हाताळताना हाताला जखमा असल्यास काळजी घ्या.'
        ],
        hi: [
          'सड़क पर तेज गति से चलते समय सीड ड्रिल के पीछे किसी को न खड़ा करें।',
          'खांचे साफ करते समय ट्रैक्टर बंद रखें और उपकरण को नीचे रखें।',
          'खाद भरते समय दस्ताने पहनें और आंखों का ध्यान रखें।'
        ]
      },
      suitableFarmSize: {
        en: 'Small, Medium, and Large farms (or custom hire)',
        mr: 'लहान, मध्यम व मोठे शेतकरी (किंवा भाड्याने)',
        hi: 'छोटे, मध्यम और बड़े किसान (या किराए पर)'
      },
      powerSource: { en: 'Tractor 3-Point Hitch & Ground Drive', mr: 'ट्रॅक्टर हायड्रॉलिक व चाकाची गती', hi: 'ट्रैक्टर हाइड्रोलिक व ग्राउंड व्हील' }
    },
    {
      id: 'plough',
      name: {
        en: 'Plough (MB Mouldboard / Disc Plough)',
        mr: 'नांगर / एम.बी. नांगर (Mouldboard / Disc Plough)',
        hi: 'हल / एमबी प्लाऊ (Mouldboard / Disc Plough)'
      },
      category: 'Primary Deep Tillage',
      categoryKey: 'tillage',
      icon: 'bi-scissors',
      image: ICONS.plough,
      badge: 'Primary Deep Tillage',
      mainPurpose: {
        en: 'Deep primary tillage, opening hard compacted soil pan, burying weeds and crop residues, and exposing subsoil to sunlight for pest sterilization.',
        mr: 'जमिनीची खोल प्राथमिक नांगरणी करणे, कडक थर फोडणे, तण मातीत गाडणे आणि सूर्यप्रकाशात कीटकांचे अवशेष नष्ट करण्यासाठी माती उलट-सुलट करणे.',
        hi: 'गहरी प्राथमिक जुताई, सख्त मिट्टी को तोड़ना, खरपतवार को जमीन में दबाना और कीटों को धूप से नष्ट करने के लिए मिट्टी पलटना।'
      },
      suitableCrops: {
        en: ['Sugarcane', 'Cotton', 'Deep Rooted Vegetables', 'Orchards Pre-planting', 'Paddy Fallow'],
        mr: ['ऊस', 'कापूस', 'फळबागा लागवड पूर्व', 'खोल मुळांची पिके', 'उन्हाळी नांगरणी'],
        hi: ['गन्ना', 'कपास', 'बागवानी पौधारोपण से पूर्व', 'गहरी जड़ों वाली फसलें', 'ग्रीष्मकालीन जुताई']
      },
      bestUseStage: {
        en: 'Summer land preparation (May-June) after major crop harvest and before monsoon rains.',
        mr: 'उन्हाळी मशागत (मे-जून) मान्सूनपूर्व पूर्वतयारी.',
        hi: 'ग्रीष्मकालीन जुताई (मई-जून) बारिश से पहले भूमि सुधार हेतु।'
      },
      basicWorking: {
        en: 'Heavy curved mouldboard shares or hardened concave steel discs penetrate 20-35 cm into compacted soil. As tractor moves forward, the share cuts a furrow slice and the mouldboard rolls it 180 degrees into the adjacent furrow.',
        mr: 'नांगराचे टोकदार फाळ जमिनीत २० ते ३५ सेंमी खोल शिरते. ट्रॅक्टर पुढे जाताना मातीचा थर कापून तो बाजूला उलटवून टाकतो.',
        hi: 'मजबूत लोहे का फाल मिट्टी में २०-३५ सेमी गहराई तक प्रवेश करता है। आगे बढ़ते हुए यह मिट्टी की परत को काटकर १८० डिग्री पलट देता है।'
      },
      keySpecifications: [
        {
          label: { en: 'Number of Bottoms', mr: 'फाळांची संख्या', hi: 'तलों की संख्या' },
          value: { en: '2 or 3 Bottoms (Mechanical / Hydraulic Reversible)', mr: '२ किंवा ३ फाळे (उलटणारा / मेकॅनिकल)', hi: '२ या ३ बॉटम (रिवर्सिबल)' }
        },
        {
          label: { en: 'Tillage Depth', mr: 'नांगरणी खोली', hi: 'जुताई की गहराई' },
          value: { en: '20 cm to 35 cm', mr: '२० ते ३५ सेंमी', hi: '२० से ३५ सेमी' }
        },
        {
          label: { en: 'Tractor HP Needed', mr: 'आवश्यक ट्रॅक्टर क्षमता', hi: 'आवश्यक ट्रैक्टर शक्ति' },
          value: { en: '45 HP to 65+ HP', mr: '४५ ते ६५+ एच.पी.', hi: '४५ से ६५+ एच.पी.' }
        },
        {
          label: { en: 'Working Width', mr: 'कार्यकारी रुंदी', hi: 'काम करने की चौड़ाई' },
          value: { en: '60 cm to 90 cm', mr: '६० ते ९० सेंमी', hi: '६० से ९० सेमी' }
        }
      ],
      maintenance: {
        en: [
          'Inspect share points and bar points daily; sharpen or replace when blunted.',
          'Tighten heavy frame bolts to specified torque settings.',
          'Grease reversible hydraulic pivot cylinders and disc hub bearings.',
          'Coat mouldboard surfaces with grease or waste oil during idle monsoon/winter months.'
        ],
        mr: [
          'नांगराचे टोक (Bar Point) झिजले आहे का ते तपासा, आवश्यकतेनुसार वेल्डिंग किंवा नवीन टोक बसवा.',
          'नांगराचे मोठे बोल्ट दररोज कामापूर्वी तपासा.',
          'उलटणाऱ्या नांगराच्या हायड्रॉलिक पिनमध्ये नियमित ग्रीस भरा.',
          'पावसाळ्यात नांगराच्या लोखंडावर गंज चढू नये म्हणून ग्रीस किंवा जुने ऑईल लावून ठेवा.'
        ],
        hi: [
          'फाल की नोक की जांच करें; घिसने पर नई नोक लगाएं।',
          'फ्रेम के भारी बोल्ट्स को अच्छी तरह कसकर रखें।',
          'रिवर्सिबल हाइड्रोलिक शाफ्ट और बेयरिंग में ग्रीस भरें।',
          'ऑफ-सीजन में फाल पर जंग से बचाव के लिए पुराना तेल लगाएं।'
        ]
      },
      safetyTips: {
        en: [
          'Lock 3-point hydraulic transport check valve before traveling on roads.',
          'Keep clear of reversing swing radius when operating hydraulic reversible ploughs.',
          'Watch out for buried telephone cables, pipelines, and large granite boulders.'
        ],
        mr: [
          'रस्त्याने जाताना हायड्रॉलिक लॉक नेहमी बंद करून ठेवा.',
          'हायड्रॉलिक उलटणारा नांगर फिरवताना बाजूला कोणी उभे राहणार नाही याची खात्री करा.',
          'जमिनीतील दगड, पाईपलाईन आणि तारांची खात्री करून नांगरणी करा.'
        ],
        hi: [
          'सड़क पर चलते समय हाइड्रोलिक लॉक वाल्व को सुरक्षित करें।',
          'रिवर्सिबल हल घुमाते समय उसके दायरे से दूर रहें।',
          'खेत में दबे बड़े पत्थरों या पाइपलाइनों से सावधान रहें।'
        ]
      },
      suitableFarmSize: {
        en: 'Medium to Large farms or contract ploughing',
        mr: 'मध्यम व मोठी शेती किंवा कंत्राटी नांगरणी',
        hi: 'मध्यम व बड़े खेत या भाड़े पर'
      },
      powerSource: { en: 'Tractor 3-Point Linkage', mr: 'ट्रॅक्टर हायड्रॉलिक', hi: 'ट्रैक्टर हाइड्रोलिक' }
    },
    {
      id: 'sprayer',
      name: {
        en: 'Sprayer (Battery Knapsack & Tractor Boom)',
        mr: 'फवारणी यंत्र / स्प्रेयर (Battery & Tractor Boom Sprayer)',
        hi: 'स्प्रेयर / छिड़काव यंत्र (Battery & Tractor Boom Sprayer)'
      },
      category: 'Plant Protection & Foliar Nutrition',
      categoryKey: 'protection',
      icon: 'bi-droplet-half',
      image: ICONS.sprayer,
      badge: 'Plant Protection Tool',
      mainPurpose: {
        en: 'Uniform atomization and application of crop protection insecticides, bio-fungicides, micronutrients, and plant growth regulators over foliage.',
        mr: 'पिकांवर कीटकनाशके, बुरशीनाशके आणि विद्राव्य खतांची योग्य दाबाने सूक्ष्म थेंबांमध्ये समान फवारणी करणे.',
        hi: 'फसलों पर कीटनाशक, फफूंदनाशक, सूक्ष्म पोषक तत्व और तरल उर्वरकों का सूक्ष्म बूंदों में एकसमान छिड़काव करना।'
      },
      suitableCrops: {
        en: ['Cotton', 'Soybean', 'Chilli', 'Vegetables', 'Pomegranate', 'Grapes', 'Citrus', 'Pulses'],
        mr: ['कापूस', 'सोयाबीन', 'मिरची', 'भाजीपाला', 'डाळिंब', 'द्राक्षे', 'मोसंबी', 'कडधान्ये'],
        hi: ['कपास', 'सोयाबीन', 'मिर्च', 'सब्जियां', 'अनार', 'अंगूर', 'नींबू वर्गीय फल', 'दलहन']
      },
      bestUseStage: {
        en: 'Vegetative growth, pest threshold incidence, flowering, and fruit development phases.',
        mr: 'शाकीय वाढ, कीड-रोगाचा प्रादुर्भाव, फुलोरा आणि फळधारणा टप्पा.',
        hi: 'वानस्पतिक वृद्धि, कीट-रोग प्रकोप, फूल आने और फल विकास के समय।'
      },
      basicWorking: {
        en: 'A 12V DC diaphragm pump (knapsack) or tractor PTO roller/piston pump draws liquid formulation from tank, pressurizes it to 2-4 bar, and discharges it through hollow-cone or flat-fan nozzles to break the stream into fine droplet mist.',
        mr: '१२ व्होल्ट बॅटरीवर चालणारा डायाफ्राम पंप (किंवा ट्रॅक्टर पंप) टाकीतील औषध २ ते ४ बार दाबाने नोझलकडे पाठवतो, ज्यामुळे औषधाचे सूक्ष्म धुक्यासारखे थेंब तयार होतात.',
        hi: '१२ वोल्ट बैटरी मोटर या ट्रैक्टर पीटीओ पंप घोल को २-४ बार दबाव में नोजल तक भेजता है, जहां से यह महीन बूंदों के रूप में पत्तियों पर फैलता है।'
      },
      keySpecifications: [
        {
          label: { en: 'Capacity Options', mr: 'टाकी क्षमता', hi: 'टैंकी क्षमता' },
          value: { en: '16L - 20L (Battery) / 400L - 600L (Tractor Boom)', mr: '१६-२० लिटर (बॅटरी) / ४००-६०० लिटर (ट्रॅक्टर)', hi: '१६-२० लीटर (बैटरी) / ४००-६०० लीटर (ट्रैक्टर)' }
        },
        {
          label: { en: 'Operating Pressure', mr: 'कार्यकारी दाब', hi: 'काम का दबाव' },
          value: { en: '2.0 to 4.5 bar (30-65 PSI)', mr: '२ ते ४.५ बार', hi: '२ से ४.५ बार' }
        },
        {
          label: { en: 'Battery Type', mr: 'बॅटरी प्रकार', hi: 'बैटरी का प्रकार' },
          value: { en: '12V 8Ah / 12Ah Lead Acid or Lithium-ion', mr: '१२ व्होल्ट बॅटरी (५-६ तास बॅकअप)', hi: '१२ वोल्ट बैटरी (५-६ घंटे बैकअप)' }
        },
        {
          label: { en: 'Nozzle Types', mr: 'नोझल प्रकार', hi: 'नोजल प्रकार' },
          value: { en: 'Hollow Cone, Flat Fan, and Twin Flood', mr: 'हॉलो कोन, फ्लॅट फॅन आणि ड्युएल नोझल', hi: 'होलो कोन, फ्लैट फैन व डुअल नोजल' }
        }
      ],
      maintenance: {
        en: [
          'Thoroughly rinse tank, lance, and nozzles with clean water immediately after every use.',
          'Never poke clogged nozzle orifices with wire or pins (use a soft toothbrush to avoid damaging spray pattern).',
          'Charge the 12V battery fully after every use; never store completely discharged.',
          'Clean suction filter screen to avoid pump cavitation.'
        ],
        mr: [
          'प्रत्येक फवारणीनंतर टाकी, पाईप आणि नोझल स्वच्छ पाण्याने धुवून काढा.',
          'नोझल चोक झाल्यास वायर किंवा टाचणीने टोचू नका; मऊ टूथब्रश वापरा.',
          'वापरानंतर बॅटरी नेहमी पूर्ण चार्ज करून ठेवा; डिस्चार्ज अवस्थेत ठेवू नका.',
          'पंपाच्या इनलेटमधील जाळी नियमित स्वच्छ करा.'
        ],
        hi: [
          'उपयोग के तुरंत बाद टंकी, पाइप और नोजल को साफ पानी से अच्छी तरह धोएं।',
          'नोजल बंद होने पर तार या पिन न डालें, केवल मुलायम ब्रश से साफ करें।',
          'उपयोग के बाद बैटरी पूरी चार्ज करें, डिस्चार्ज स्थिति में न छोड़ें।',
          'पंप इनलेट की छलनी को समय-समय पर साफ करें।'
        ]
      },
      safetyTips: {
        en: [
          'Always wear Personal Protective Equipment (mask, goggles, chemical rubber gloves, apron).',
          'Never spray against prevailing wind direction to prevent inhalation poisoning.',
          'Never smoke, drink, or eat while spraying or mixing agricultural chemicals.',
          'Keep chemicals safely locked away from children and farm animals.'
        ],
        mr: [
          'फवारणी करताना नेहमी मास्क, चष्मा, हातमोजे आणि पूर्ण कपडे घाला.',
          'वाऱ्याच्या विरुद्ध दिशेने कधीही फवारणी करू नका.',
          'फवारणी करताना किंवा औषध तयार करताना खाणे, पिणे किंवा धूम्रपान करू नका.',
          'औषधे नेहमी लहान मुले आणि जनावरांपासून कुलूपात ठेवा.'
        ],
        hi: [
          'छिड़काव के समय हमेशा मास्क, चश्मा और रबर के दस्ताने पहनें।',
          'हवा की उल्टी दिशा में कभी भी छिड़काव न करें।',
          'कीटनाशक मिलाते या छिड़कते समय कुछ भी न खाएं-पिएं।',
          'दवाइयों को बच्चों और मवेशियों की पहुंच से दूर ताले में रखें।'
        ]
      },
      suitableFarmSize: {
        en: 'Knapsack: Marginal & Small farms | Tractor Boom: Medium & Large farms',
        mr: 'बॅटरी: लहान व मध्यम शेतकरी | ट्रॅक्टर: मोठी शेती',
        hi: 'बैटरी: छोटे व सीमांत किसान | ट्रैक्टर बूम: बड़े खेत'
      },
      powerSource: { en: '12V Battery / Tractor PTO', mr: '१२V बॅटरी / ट्रॅक्टर पीटीओ', hi: '१२V बैटरी / ट्रैक्टर पीटीओ' }
    },
    {
      id: 'power-tiller',
      name: {
        en: 'Power Tiller (Two-Wheel Walking Tractor)',
        mr: 'पॉवर टिलर (Power Tiller)',
        hi: 'पावर टिलर (Power Tiller)'
      },
      category: 'Small Farm Mechanization & Wet Puddling',
      categoryKey: 'power',
      icon: 'bi-gear-wide-connected',
      image: ICONS.powerTiller,
      badge: 'Small Farm Workhorse',
      mainPurpose: {
        en: 'Ideal mechanization machine for small landholdings, wet paddy puddling, vegetable ridge making, and narrow orchard intercultural operations.',
        mr: 'लहान शेतकऱ्यांसाठी नांगरणी, भात शेतीतील चिखलणी (Puddling), भाजीपाल्यासाठी सरी तयार करणे आणि फळबागेतील मशागतीसाठी अत्यंत उपयुक्त यंत्र.',
        hi: 'छोटे किसानों के लिए जुताई, धान की गीली मथाई (पडलिंग), सब्जियों के लिए मेड़ बनाना और बगीचों में निराई-गुड़ाई का बेहतरीन यंत्र।'
      },
      suitableCrops: {
        en: ['Paddy', 'Vegetables (Tomato, Brinjal, Onion)', 'Sugarcane Earthing Up', 'Ginger', 'Turmeric', 'Banana'],
        mr: ['भात', 'भाजीपाला (टोमॅटो, वांगी, कांदा)', 'ऊस भरणी', 'आले', 'हळद', 'केळी'],
        hi: ['धान', 'सब्जियां (टमाटर, बैंगन, प्याज)', 'गन्ने की बंधाई', 'अदरक', 'हल्दी', 'केला']
      },
      bestUseStage: {
        en: 'Wetland paddy puddling, seedbed preparation, ridge making, and post-planting intercultural weeding.',
        mr: 'भाताची चिखलणी, गादी वाफे तयार करणे आणि रोपांना मातीची भर लावणे.',
        hi: 'धान की पडलिंग, क्यारियां बनाना और फसलों में मिट्टी चढ़ाना।'
      },
      basicWorking: {
        en: 'Equipped with a 12-15 HP water-cooled single-cylinder diesel engine on a 2-wheel frame with handlebars. Drives traction wheels and a rear rotary tiller with 18-20 curved blades controlled by steering clutches.',
        mr: '१२ ते १५ एच.पी. क्षमतेचे सिंगल सिलेंडर डिझेल इंजिन दोन चाकांवर बसवलेले असते. क्लच आणि हँडलबारच्या साहाय्याने फिरणारी १८-२० पाते माती भुसभुशीत करतात.',
        hi: '१२ से १५ एचपी का सिंगल सिलेंडर डीजल इंजन दो पहियों पर लगा होता है। हैंडलबार और क्लच द्वारा नियंत्रित होकर पीछे के रोटरी ब्लेड मिट्टी को तैयार करते हैं।'
      },
      keySpecifications: [
        {
          label: { en: 'Engine Power', mr: 'इंजिन क्षमता', hi: 'इंजन शक्ति' },
          value: { en: '12 HP to 15 HP Diesel', mr: '१२ ते १५ एच.पी. डिझेल', hi: '१२ से १५ एच.पी. डीजल' }
        },
        {
          label: { en: 'Working Width', mr: 'कार्यकारी रुंदी', hi: 'काम करने की चौड़ाई' },
          value: { en: '600 mm to 800 mm', mr: '६०० ते ८०० मिमी', hi: '६०० से ८०० मिमी' }
        },
        {
          label: { en: 'Fuel Consumption', mr: 'डिझेल वापर', hi: 'डीजल खपत' },
          value: { en: '1.2 to 1.6 Litres / hour', mr: '१.२ ते १.६ लिटर / तास', hi: '१.२ से १.६ लीटर / घंटा' }
        },
        {
          label: { en: 'Weight', mr: 'वजन', hi: 'वजन' },
          value: { en: '350 kg to 480 kg', mr: '३५० ते ४८० किलो', hi: '३५० से ४८० किलोग्राम' }
        }
      ],
      maintenance: {
        en: [
          'Top up radiator water daily and clean cooling fins.',
          'Check engine oil level (15W-40) and change after initial 50 hours, then every 200 hours.',
          'Inspect and tension V-belts and primary transmission chain.',
          'Service air cleaner oil bath with fresh oil.'
        ],
        mr: [
          'रेडिएटरमधील पाण्याचे प्रमाण दररोज तपासा.',
          'इंजिन ऑईलची पातळी तपासा आणि दर २०० तासांनी ऑईल बदला.',
          'व्ही-बेल्ट आणि चेनचा ताण योग्य आहे का ते पहा.',
          'एअर फिल्टरमधील ऑईल स्वच्छ ठेवा.'
        ],
        hi: [
          'रेडिएटर में पानी का स्तर रोज चेक करें।',
          'इंजन ऑयल की जांच करें और हर २०० घंटे पर बदलें।',
          'वी-बेल्ट और ड्राइव चेन का तनाव सही रखें।',
          'एयर क्लीनर ऑयल बाथ की नियमित सफाई करें।'
        ]
      },
      safetyTips: {
        en: [
          'Always disengage rotary tines before engaging reverse gear to prevent foot injuries.',
          'Maintain a firm two-handed grip on the handle controls at all times.',
          'Do not operate on steep embankments exceeding 15 degrees tilt.',
          'Always wear sturdy leather boots with steel toes while walking behind.'
        ],
        mr: [
          'रिव्हर्स गिअर टाकण्यापूर्वी रोटरी पाते पूर्ण बंद करा, जेणेकरून पायाला इजा होणार नाही.',
          'दोन्ही हातांनी हँडल घट्ट धरूनच यंत्र चालवा.',
          '१५ अंशांपेक्षा जास्त तीव्र उतारावर टिलर चालवू नका.',
          'काम करताना पायात नेहमी मजबूत बूट घाला.'
        ],
        hi: [
          'रिवर्स गियर लगाने से पहले रोटरी ब्लेड को अवश्य बंद करें ताकि पैरों को चोट न पहुंचे।',
          'हैंडलबार को हमेशा दोनों हाथों से मजबूती से पकड़ें।',
          '१५ डिग्री से अधिक तीखे ढलानों पर इसे न चलाएं।',
          'पीछे चलते समय हमेशा मजबूत जूते पहनें।'
        ]
      },
      suitableFarmSize: {
        en: 'Marginal & Small farms (< 3 Acres) & Hilly terraces',
        mr: 'लहान व सीमांत शेतकरी (< ३ एकर) आणि डोंगराळ शेती',
        hi: 'सीमांत व छोटे किसान (< ३ एकड़) और पहाड़ी खेत'
      },
      powerSource: { en: '12-15 HP Diesel Engine', mr: '१२-१५ HP डिझेल इंजिन', hi: '१२-१५ HP डीजल इंजन' }
    },
    {
      id: 'harvester',
      name: {
        en: 'Harvester (Combine Harvester / Reaper)',
        mr: 'हार्वेस्टर / कंबाईन हार्वेस्टर (Combine Harvester)',
        hi: 'कंबाइन हार्वेस्टर (Combine Harvester)'
      },
      category: 'Harvesting, Threshing & Cleaning',
      categoryKey: 'harvesting',
      icon: 'bi-speedometer2',
      image: ICONS.harvester,
      badge: 'High Capacity Harvesting',
      mainPurpose: {
        en: 'Performs cutting, threshing, separation, and grain cleaning simultaneously in a single continuous field pass, eliminating manual labor bottlenecks.',
        mr: 'उभ्या पिकाची कापणी, मळणी, दाणे वेगळे करणे आणि भुसा साफ करणे ही सर्व कामे एकाच फेरीत अत्यंत वेगाने करणे.',
        hi: 'खड़ी फसल की कटाई, गहाई, दानों को अलग करना और भूसा साफ करना एक ही चक्कर में तेजी से पूरा करना।'
      },
      suitableCrops: {
        en: ['Wheat', 'Paddy', 'Soybean', 'Gram (Chickpea)', 'Mustard', 'Maize'],
        mr: ['गहू', 'भात', 'सोयाबीन', 'हरभरा', 'मोहरी', 'मका'],
        hi: ['गेहूं', 'धान', 'सोयाबीन', 'चना', 'सरसों', 'मक्का']
      },
      bestUseStage: {
        en: 'Crop maturity stage when grain moisture is between 14% and 18% (before shattering losses occur).',
        mr: 'पीक पक्व झाल्यानंतर (दाण्यातील ओलावा १४% ते १८% असताना).',
        hi: 'फसल पकने पर (जब दानों में नमी १४% से १८% के बीच हो)।'
      },
      basicWorking: {
        en: 'Front cutter bar cuts crop stalks; reel and auger feed them into threshing cylinder with rasp bars that beat grain free. Straw walkers separate remaining grain, vibrating sieves and fan blow out chaff, and clean grain is elevated into holding tank.',
        mr: 'पुढचे कटर पिकाचे खोड कापते, थ्रेशिंग ड्रम दाणे वेगळे करतो, चालणी व पंखा कचरा उडवून देतो आणि स्वच्छ दाणे टाकीमध्ये जमा होतात.',
        hi: 'आगे का कटर बार फसल काटता है, थ्रेशिंग ड्रम दानों को अलग करता है, पंखा भूसा उड़ाता है और साफ अनाज सीधे टैंक में जमा होता है।'
      },
      keySpecifications: [
        {
          label: { en: 'Type', mr: 'प्रकार', hi: 'प्रकार' },
          value: { en: 'Self-Propelled / Tractor Mounted', mr: 'सेल्फ-प्रोपेल्ड / ट्रॅक्टर माऊंटेड', hi: 'सेल्फ-प्रोपेल्ड / ट्रैक्टर माउंटेड' }
        },
        {
          label: { en: 'Cutter Bar Width', mr: 'कटर बार रुंदी', hi: 'कटर बार चौड़ाई' },
          value: { en: '10 to 14 Feet (3.0 m to 4.2 m)', mr: '१० ते १४ फूट (३.० ते ४.२ मी)', hi: '१० से १४ फीट (३.० से ४.२ मी)' }
        },
        {
          label: { en: 'Engine Power', mr: 'इंजिन क्षमता', hi: 'इंजन शक्ति' },
          value: { en: '75 HP to 110 HP Diesel', mr: '७५ ते ११० एच.पी.', hi: '७५ से ११० एच.पी.' }
        },
        {
          label: { en: 'Grain Tank Capacity', mr: 'धान्य साठवण क्षमता', hi: 'अनाज टैंक क्षमता' },
          value: { en: '1,500 kg to 2,500 kg', mr: '१,५०० ते २,५०० किलो', hi: '१,५०० से २,५०० किलोग्राम' }
        }
      ],
      maintenance: {
        en: [
          'Blow dry dust and crop chaff away from engine manifold and radiator screen daily to eliminate fire risks.',
          'Grease all high-speed bearings and oscillating elevator shafts every 10 operating hours.',
          'Inspect cutter bar serrated knife sections and replace broken teeth.',
          'Check tension on grain elevator chains and feeder house belts.'
        ],
        mr: [
          'आगीचा धोका टाळण्यासाठी इंजिन आणि रेडिएटरवरील धूळ व पेंढा दररोज ब्लोअरने साफ करा.',
          'सर्व फिरणाऱ्या बेअरिंग्समध्ये दर १० तासांनी हाय-स्पीड ग्रीस भरा.',
          'कटर बारचे तुटलेले किंवा बोथट दाते बदला.',
          'धान्य वाहून नेणाऱ्या साखळीचा (Elevator Chain) ताण तपासा.'
        ],
        hi: [
          'आग के खतरे से बचने के लिए इंजन और साइलेंसर से भूसा-धूल रोज साफ करें।',
          'सभी गतिशील बेयरिंग में हर १० घंटे पर ग्रीस लगाएं।',
          'कटर बार के घिसे या टूटे ब्लेड तुरंत बदलें।',
          'एलीवेटर चेन और बेल्ट का तनाव सही रखें।'
        ]
      },
      safetyTips: {
        en: [
          'NEVER enter the grain tank or reach near threshing drum while engine is running.',
          'Always carry an active chemical dry powder fire extinguisher on the machine.',
          'Be vigilant of low-hanging high-voltage rural electricity lines in fields.',
          'Sound horn and verify bystanders are clear before engaging cutter bar.'
        ],
        mr: [
          'इंजिन चालू असताना मळणी ड्रममध्ये किंवा धान्याच्या टाकीत कधीही हात घालू नका.',
          'हार्वेस्टरवर नेहमी अग्निशामक सिलिंडर (Fire Extinguisher) सज्ज ठेवा.',
          'शेतात काम करताना डोक्यावरील विजेच्या उच्च दाबाच्या तारांकडे बारकाईने लक्ष ठेवा.',
          'कटर बार चालू करण्यापूर्वी हॉर्न वाजवून लोकांना दूर करा.'
        ],
        hi: [
          'इंजन चालू होने पर कभी भी अनाज टैंक या ड्रम में हाथ न डालें।',
          'मशीन पर हमेशा चालू अग्निशामक यंत्र (Fire Extinguisher) रखें।',
          'खेत में लटकती बिजली की तारों से हमेशा सुरक्षित दूरी बनाए रखें।',
          'कटर बार चालू करने से पहले हॉर्न बजाकर लोगों को सावधान करें।'
        ]
      },
      suitableFarmSize: {
        en: 'Large farms (> 10 Acres) or Custom Hiring Services',
        mr: 'मोठी शेती (> १० एकर) किंवा भाडेतत्त्वावर',
        hi: 'बड़े खेत (> १० एकड़) या कस्टम हायरिंग'
      },
      powerSource: { en: '75-110 HP Heavy Diesel Engine', mr: '७५-११० HP डिझेल इंजिन', hi: '७५-११० HP भारी डीजल इंजन' }
    },
    {
      id: 'water-pump',
      name: {
        en: 'Water Pump (Solar, Submersible & Monoblock)',
        mr: 'पाण्याचा पंप (Solar, Submersible & Monoblock Pump)',
        hi: 'वाटर पंप / सिंचाई पंप (Solar, Submersible & Monoblock)'
      },
      category: 'Water Lifting & Pressurization',
      categoryKey: 'irrigation',
      icon: 'bi-droplet',
      image: ICONS.waterPump,
      badge: 'Lifeline Water Lifting Engine',
      mainPurpose: {
        en: 'Lifting water from borewells, open dug wells, farm ponds (shet-tale), and canals, and providing sufficient pressure for micro-irrigation systems.',
        mr: 'बोअरवेल, विहीर, शेततळे किंवा कालव्यातून पाणी उचलणे आणि ठिबक/तुषार सिंचनासाठी आवश्यक दाब निर्माण करणे.',
        hi: 'बोरवेल, कुएं, खेत-तालाब या नहर से पानी उठाना और ड्रिप या स्प्रिंकलर सिस्टम के लिए आवश्यक दबाव बनाना।'
      },
      suitableCrops: {
        en: ['All Irrigated Crops', 'Sugarcane', 'Cotton', 'Orchards', 'Vegetables', 'Wheat', 'Paddy'],
        mr: ['सर्व बागायती पिके', 'ऊस', 'कापूस', 'फळबागा', 'भाजीपाला', 'गहू', 'भात'],
        hi: ['सभी सिंचित फसलें', 'गन्ना', 'कपास', 'बागवानी', 'सब्जियां', 'गेहूं', 'धान']
      },
      bestUseStage: {
        en: 'Continuous use throughout cropping season from pre-sowing till maturity.',
        mr: 'संपूर्ण पीक कालावधीत पेरणीपूर्व तयारीपासून ते काढणीपर्यंत सातत्याने.',
        hi: 'बुवाई से लेकर कटाई तक पूरी फसल अवधि में निरंतर।'
      },
      basicWorking: {
        en: 'Electric motor or solar DC motor spins enclosed bronze or SS impellers at 2900 RPM. Centrifugal force pushes water radially outward into the casing, generating high pressure at delivery pipe and vacuum suction at intake.',
        mr: 'विद्युत मोटर किंवा सौर ऊर्जेवर चालणारी मोटर २९०० वेगाने फिरून पाण्याच्या इम्पेलरद्वारे केंद्रापसारी (Centrifugal) दाब निर्माण करते व पाणी वेगाने बाहेर ढकलते.',
        hi: 'इलेक्ट्रिक या सौर मोटर २९०० आरपीएम पर घूमकर अपकेंद्रीय बल (Centrifugal Force) द्वारा पानी को ऊपर उठाकर उच्च दबाव में पाइप में भेजती है।'
      },
      keySpecifications: [
        {
          label: { en: 'Horsepower Range', mr: 'अश्वशक्ती (HP)', hi: 'अश्वशक्ति (HP)' },
          value: { en: '3 HP, 5 HP, 7.5 HP, up to 10 HP', mr: '३, ५, ७.५ ते १० एच.पी.', hi: '३, ५, ७.५ से १० एच.पी.' }
        },
        {
          label: { en: 'Discharge Output', mr: 'पाण्याचा विसर्ग', hi: 'पानी की क्षमता' },
          value: { en: '150 to 800 Litres / minute', mr: '१५० ते ८०० लिटर / मिनिट', hi: '१५० से ८०० लीटर / मिनट' }
        },
        {
          label: { en: 'Head Delivery', mr: 'पाणी फेकण्याची उंची (Head)', hi: 'पानी उठाने की ऊंचाई (Head)' },
          value: { en: '20 m to 120 m (Borewell depth dependent)', mr: '२० ते १२० मीटर (खोलीनुसार)', hi: '२० से १२० मीटर (गहराई अनुसार)' }
        },
        {
          label: { en: 'Energy Sources', mr: 'ऊर्जा स्रोत', hi: 'ऊर्जा स्रोत' },
          value: { en: '3-Phase Grid, PM-KUSUM Solar, or Diesel', mr: '३-फेज वीज, सौर ऊर्जा (PM-KUSUM) किंवा डिझेल', hi: '३-फेज बिजली, सोलर (PM-KUSUM) या डीजल' }
        }
      ],
      maintenance: {
        en: [
          'NEVER run the pump dry (causes instant burn out of mechanical water seal and impellers).',
          'Install a digital phase preventer and dry-run protection sensor.',
          'Clean intake suction foot-valve strainer from weeds, algae, and sand.',
          'Check electrical earthing resistance every season to prevent shocks.'
        ],
        mr: [
          'पंप कधीही पाश्याशिवाय (कोरडा) चालू करू नका; वॉटर सील जळून नुकसान होते.',
          'ड्राय-रन प्रोटेक्टर आणि सिंगल फेज प्रिव्हेंटर अवश्य बसवा.',
          'विहिरीतील फूट-व्हॉल्व्हच्या जाळीतील कचरा आणि शेवाळ नियमित काढा.',
          'शॉक लागण्याचा धोका टाळण्यासाठी अर्थिंगची तपासणी करा.'
        ],
        hi: [
          'पंप को कभी भी बिना पानी के सूखा न चलाएं; वाटर सील तुरंत खराब हो जाती है।',
          'ड्राय-रन प्रोटेक्टर और फेज प्रिवेंटर जरूर लगवाएं।',
          'फुट-वाल्व की जाली पर जमा कचरा और शैवाल समय-समय पर साफ करें।',
          'अर्थिंग की नियमित जांच करें ताकि करंट का खतरा न रहे।'
        ]
      },
      safetyTips: {
        en: [
          'Ensure robust double earthing with copper wire and salt-charcoal pit.',
          'Never touch starter switches or live motor wires with wet bare hands.',
          'Secure pump well-casing clamps firmly to prevent falling into borewell deep pit.',
          'Keep electrical starter boxes enclosed in waterproof sheds.'
        ],
        mr: [
          'स्टार्टर पॅनेलसाठी दुहेरी तांब्याची अर्थिंग (Earth wire) केलेली असावी.',
          'ओल्या हातांनी स्टार्टर बटणाला किंवा वायरला कधीही हात लावू नका.',
          'बोअरवेलमध्ये पंप सोडताना क्लॅम्प आणि नायलॉन दोरी मजबूत बांधा.',
          'स्टार्टर बॉक्सवर पावसाचे पाणी पडणार नाही अशा शेडमध्ये ठेवा.'
        ],
        hi: [
          'स्टार्टर पैनल के लिए सही अर्थिंग की व्यवस्था अवश्य करें।',
          'गीले हाथों से स्टार्टर या बिजली के तारों को कभी न छुएं।',
          'बोरवेल में पंप लटकाते समय मजबूत क्लैंप और सुरक्षा रस्सी का प्रयोग करें।',
          'स्टार्टर बॉक्स को पानी से सुरक्षित शेड में रखें।'
        ]
      },
      suitableFarmSize: {
        en: 'Essential for all farms with borewell, well, or canal access',
        mr: 'पाण्याचा स्रोत असलेल्या सर्व शेतकऱ्यांसाठी अत्यावश्यक',
        hi: 'सिंचाई का साधन रखने वाले सभी किसानों हेतु अनिवार्य'
      },
      powerSource: { en: 'Electricity / Solar / Diesel', mr: 'वीज / सौर ऊर्जा / डिझेल', hi: 'बिजली / सौर ऊर्जा / डीजल' }
    },
    {
      id: 'thresher',
      name: {
        en: 'Thresher (Multi-Crop Mechanical Thresher)',
        mr: 'मळणी यंत्र / थ्रेशर (Multi-Crop Mechanical Thresher)',
        hi: 'थ्रेशर / मड़ाई यंत्र (Multi-Crop Mechanical Thresher)'
      },
      category: 'Post-Harvest Grain Separation',
      categoryKey: 'harvesting',
      icon: 'bi-recycle',
      image: ICONS.thresher,
      badge: 'Post-Harvest Grain Separator',
      mainPurpose: {
        en: 'Mechanical separation of clean grains and seeds from dry crop stalks and pods, while shredding straw into fine cattle feed (bhusa).',
        mr: 'वाळलेल्या पिकाच्या धांड्यापासून दाणे वेगळे करणे, कचरा साफ करणे आणि जनावरांसाठी बारीक चारा (कुट्टी/भुसा) तयार करणे.',
        hi: 'सूखी फसल की बालियों या फलियों से दाने अलग करना, कचरा उड़ाना और पशुओं के लिए बारीक भूसा तैयार करना।'
      },
      suitableCrops: {
        en: ['Wheat', 'Soybean', 'Chickpea (Chana)', 'Mustard', 'Pigeon Pea (Tur)', 'Barley', 'Millets'],
        mr: ['गहू', 'सोयाबीन', 'हरभरा', 'मोहरी', 'तूर', 'ज्वारी', 'बाजरी'],
        hi: ['गेहूं', 'सोयाबीन', 'चना', 'सरसों', 'अरहर (तूर)', 'जौ', 'बाजरा']
      },
      bestUseStage: {
        en: 'Post-harvest phase after harvested crop bundles have sun-dried to 12-14% grain moisture.',
        mr: 'काढणीनंतर पीक उन्हात सुकवून झाल्यावर (ओलावा १२-१४% असताना).',
        hi: 'कटाई के बाद जब फसल धूप में अच्छी तरह सूख जाए (नमी १२-१४%)।'
      },
      basicWorking: {
        en: 'Crop bundles fed into hopper pass into a high-speed rotating spike-tooth or beater cylinder (700-900 RPM) encased in a concave wire sieve. Grains drop through the screen onto vibrating cleaning sieves while aspiration blowers blow away light straw dust.',
        mr: 'फीडिंग हॉपरमधून टाकलेले पीक फिरणाऱ्या दातेरी ड्रममध्ये जाते. दाणे अलगद सुटे होऊन जाळीतून खाली पडतात आणि पंख्याच्या हवेने भुसा बाहेर उडून जातो.',
        hi: 'फीडिंग ट्रे से डाली गई फसल तेज घूमने वाले स्पाइक सिलेंडर में जाती है। बालियों से दाने टूटकर छलनी से नीचे गिरते हैं और ब्लोअर भूसा बाहर फेंकता है।'
      },
      keySpecifications: [
        {
          label: { en: 'Power Requirement', mr: 'आवश्यक शक्ती', hi: 'शक्ति आवश्यकता' },
          value: { en: '25-45 HP Tractor PTO or 10-15 HP Electric Motor', mr: '२५-४५ HP ट्रॅक्टर किंवा १०-१५ HP मोटर', hi: '२५-४५ HP ट्रैक्टर या १०-१५ HP मोटर' }
        },
        {
          label: { en: 'Output Capacity', mr: 'मळणी क्षमता', hi: 'उत्पादन क्षमता' },
          value: { en: '800 kg to 2,000 kg grain / hour', mr: '८०० ते २,००० किलो धान्य / तास', hi: '८०० से २,००० किलोग्राम / घंटा' }
        },
        {
          label: { en: 'Cleaning System', mr: 'स्वच्छता प्रणाली', hi: 'सफाई प्रणाली' },
          value: { en: 'Dual Blower Aspirators & Interchangeable Sieves', mr: 'डबल ब्लोअर पंखा व बदलता येणाऱ्या चाळण्या', hi: 'डबल ब्लोअर व बदलने योग्य छलनी' }
        },
        {
          label: { en: 'Safety Feature', mr: 'सुरक्षा यंत्रणा', hi: 'सुरक्षा सुविधा' },
          value: { en: 'Reverse gear feeding trough & Extended chute', mr: 'रिव्हर्स गिअर व लांब सेफ फीडिंग ट्रे', hi: 'रिवर्स गियर व लंबी फीडिंग ट्रे' }
        }
      ],
      maintenance: {
        en: [
          'Grease main cylinder bearings before every day of seasonal threshing.',
          'Inspect concave screen for cracks, punctures, or deformed wires.',
          'Check drive belt tensions and alignment; replace frayed V-belts.',
          'Clear trapped straw fragments from blower housing after work.'
        ],
        mr: [
          'दररोज कामाला सुरुवात करण्यापूर्वी मेन बेअरिंग्जमध्ये ग्रीस भरा.',
          'आतील जाळीला छिद्र पडले आहे का ते तपासा, जेणेकरून दाणे फुटणार नाहीत.',
          'पट्ट्यांचा (V-Belts) ताण व्यवस्थित ठेवा.',
          'पंख्याच्या ब्लॉकमधील अडकलेला पेंढा काम संपल्यावर काढून टाका.'
        ],
        hi: [
          'थ्रेशिंग शुरू करने से पहले मुख्य बेयरिंग में अच्छी तरह ग्रीस लगाएं।',
          'अंदरूनी छलनी चेक करें कि उसमें कोई छेद तो नहीं हो गया है।',
          'बेल्ट की जांच करें और ढीली होने पर टाइट करें।',
          'ब्लोअर में फंसा भूसा काम के बाद साफ करें।'
        ]
      },
      safetyTips: {
        en: [
          'STRICT RULE: Never wear loose scarves, gamchha, dupattas, or loose sleeves near spinning pulleys.',
          'Always use a long wooden pusher stick; NEVER push crop into feeding hopper with bare hands.',
          'Ensure the anti-reversal safety guard lever is functional at all times.',
          'Do not operate while fatigued or in poor night lighting.'
        ],
        mr: [
          'अत्यंत महत्त्वाचे: थ्रेशरजवळ काम करताना सैल कपडे, उपरणे किंवा मफलर गळ्यात टाकू नका.',
          'पीक आत ढकलण्यासाठी लाकडी दांडका वापरा; उघड्या हाताने कधीही आत दाबू नका.',
          'फीडिंग ट्रॉलीचा आपत्कालीन रिव्हर्सिंग लीव्हर नेहमी चालू ठेवा.',
          'रात्री अंधारात किंवा थकलेले असताना थ्रेशरवर काम करू नका.'
        ],
        hi: [
          'सख्त नियम: थ्रेशर के पास गमछा, दुपट्टा या ढीले कपड़े बिल्कुल न पहनें।',
          'फसल को अंदर धकेलने के लिए लकड़ी के डंडे का प्रयोग करें, नंगे हाथ कभी अंदर न डालें।',
          'इमरजेंसी रिवर्सिंग लीवर हमेशा चालू स्थिति में रखें।',
          'थके होने पर या रात के अंधेरे में थ्रेशर का संचालन न करें।'
        ]
      },
      suitableFarmSize: {
        en: 'Medium & Large farms or community post-harvest processing',
        mr: 'मध्यम व मोठे शेतकरी किंवा भाडेतत्त्वावर मळणी',
        hi: 'मध्यम व बड़े किसान या किराए पर मड़ाई'
      },
      powerSource: { en: 'Tractor PTO (540 RPM) / Electric Motor', mr: 'ट्रॅक्टर पीटीओ किंवा इलेक्ट्रिक मोटर', hi: 'ट्रैक्टर पीटीओ या इलेक्ट्रिक मोटर' }
    }
  ];

  // 2. Irrigation Types Guide (6 Categories)
  const IRRIGATION_TYPES = [
    {
      id: 'drip',
      name: {
        en: 'Drip Irrigation',
        mr: 'ठिबक सिंचन (Drip Irrigation)',
        hi: 'ड्रिप सिंचाई (Drip Irrigation)'
      },
      category: 'Micro-Irrigation / High Precision',
      categoryKey: 'micro',
      icon: 'bi-droplet-fill',
      image: ICONS.drip,
      badge: 'High-Precision Root Zone Flow',
      subtypes: {
        en: ['In-line Drip System', 'Online Drip Emitters', 'Sub-Surface Drip (SDI)'],
        mr: ['इन-लाइन ठिबक प्रणाली', 'ऑन-लाइन ड्रिपर्स', 'भूगर्भीय ठिबक सिंचन (SDI)'],
        hi: ['इन-लाइन ड्रिप प्रणाली', 'ऑन-लाइन ड्रिपर्स', 'उप-सतह ड्रिप सिंचाई (SDI)']
      },
      howItWorks: {
        en: 'Water is filtered and pumped through a pressurized network of PVC mainlines, sub-mains, and flexible LDPE lateral pipes. Calibrated drippers/emitters release water drop-by-drop (1 to 8 L/hr) directly into the soil at the crop root zone under low operating pressure (1.0 - 2.0 kg/cm²).',
        mr: 'गाळलेले पाणी दाबाखाली मुख्य पीव्हीसी पाईप्स आणि लॅटरल नळ्यांमधून पिकांच्या ओळीत नेले जाते. ठिबक नळ्यांमधील ड्रिपर्सद्वारे पाणी थेट पिकाच्या मुळांशी थेंब थेंब (१ ते ८ लिटर/तास) सोडले जाते.',
        hi: 'फिल्टर किया हुआ पानी मुख्य पाइपों और लचीली लेटरल नलियों के माध्यम से कम दबाव (१-२ किग्रा/सेमी²) पर ड्रिपर्स की मदद से सीधे पौधों की जड़ों में बूंद-बूंद करके टपकाया जाता है।'
      },
      suitableCrops: {
        en: ['Sugarcane', 'Cotton', 'Banana', 'Pomegranate', 'Grapes', 'Tomato', 'Chilli', 'Onion', 'Ginger', 'Turmeric', 'Citrus'],
        mr: ['ऊस', 'कापूस', 'केळी', 'डाळिंब', 'द्राक्षे', 'टोमॅटो', 'मिरची', 'कांदा', 'आले', 'हळद', 'संत्री/मोसंबी'],
        hi: ['गन्ना', 'कपास', 'केला', 'अनार', 'अंगूर', 'टमाटर', 'मिर्च', 'प्याज', 'अदरक', 'हल्दी', 'नींबू वर्गीय फल']
      },
      suitableSoil: {
        en: 'Suitable for all soil types (sandy, loamy, and black clay). Highly effective on undulating topography and sloped land where flood irrigation causes severe erosion.',
        mr: 'सर्व प्रकारच्या जमिनींसाठी (हलकी, मध्यम आणि भारी काळी माती). चढ-उताराच्या व हलक्या जमिनीवर जिथे पाणी वाहून जाते तिथे अत्यंत फायदेशीर.',
        hi: 'सभी प्रकार की मिट्टी (बलुई, दोमट और भारी काली मिट्टी) के लिए उपयुक्त। ऊबड़-खाबड़ और ढलान वाली जमीनों के लिए सर्वोत्तम।'
      },
      waterRequirementEfficiency: {
        efficiencyPercent: '90% - 95%',
        waterSavingPercent: '40% - 60% compared to surface flood irrigation',
        operatingPressure: '1.0 - 2.0 kg/cm² (15 - 30 PSI)',
        details: {
          en: 'Conserves 40-60% water while increasing crop yields by 20-35%. Minimal evaporation loss and zero deep percolation runoff.',
          mr: '४०% ते ६०% पाण्याची बचत आणि पिकांच्या उत्पादनात २०% ते ३५% वाढ. पाण्याचे बाष्पीभवन आणि निचरा नगण्य.',
          hi: 'पारंपरिक सिंचाई की तुलना में ४०-६०% पानी की बचत और २०-३५% अधिक पैदावार। वाष्पीकरण का नुकसान नगण्य।'
        }
      },
      advantages: {
        en: [
          'Maximum water-use efficiency (up to 95%).',
          'Enables fertigation (injecting soluble fertilizers directly to roots with zero leaching).',
          'Drastically suppresses weed growth between rows as inter-row soil remains dry.',
          'Reduces fungal diseases by keeping crop foliage completely dry.',
          'Operates efficiently on uneven or undulating topography without costly land levelling.'
        ],
        mr: [
          '९०% ते ९५% सर्वोच्च पाणी वापर कार्यक्षमता.',
          'व्हेंचुरीद्वारे विद्राव्य खते थेट मुळांना देता येतात (खताची ३०% बचत).',
          'दोन ओळींमधील जागा कोरडी राहत असल्याने तणाचा प्रादुर्भाव खूप कमी होतो.',
          'पानांवर पाणी पडत नसल्याने बुरशीजन्य रोगांचा प्रादुर्भाव घटतो.',
          'जमीन सपाट न करता चढ-उतारावरही उत्तम कार्य करते.'
        ],
        hi: [
          '९०-९५% तक पानी की उच्चतम उपयोग क्षमता।',
          'फर्टिगेशन की सुविधा (घुलनशील खाद सीधे जड़ों तक पहुंचाना)।',
          'पंक्तियों के बीच की जगह सूखी रहने से खरपतवार बहुत कम उगते हैं।',
          'पत्तियों पर पानी न पड़ने से फफूंद जनित रोगों में भारी कमी आती है।',
          'बिना जमीन समतल किए ऊबड़-खाबड़ खेत में भी प्रभावी।'
        ]
      },
      limitations: {
        en: [
          'High initial installation capital investment (partially offset by PMKSY subsidy).',
          'Susceptible to emitter clogging from micro-sand, algae, or calcium carbonate scale.',
          'Vulnerable to rodent/rat chewing damage on thin lateral pipes during dry summer.',
          'Requires skilled periodic maintenance (filter cleaning and chemical acid flushing).'
        ],
        mr: [
          'सुरुवातीचा खर्च जास्त असतो (शासकीय अनुदानामुळे मदत होते).',
          'पाण्यातील क्षार, शेवाळ किंवा बारीक वाळूमुळे ड्रिपर्स चोक होण्याची शक्यता असते.',
          'उन्हाळ्यात उंदीर व घूस लॅटरल नळ्या कुरतडण्याची भीती असते.',
          'नियमित फिल्टर साफसफाई आणि ऍसिड ट्रीटमेंट करणे आवश्यक असते.'
        ],
        hi: [
          'प्रारंभिक स्थापना लागत अधिक (सब्सिडी द्वारा राहत उपलब्ध)।',
          'पानी में नमक, शैवाल या रेत होने पर नोजल बंद (चोक) होने का खतरा।',
          'गर्मियों में चूहों द्वारा पाइप काटने की संभावना।',
          'फिल्टर और पाइपों की नियमित सफाई की आवश्यकता।'
        ]
      },
      basicComponents: [
        {
          name: { en: 'Pump & Motor Unit', mr: 'पंप आणि मोटर', hi: 'पंप व मोटर यूनिट' },
          purpose: { en: 'Lifts water and delivers 2.0-3.0 bar pressure head.', mr: 'पाणी उचलून दाबाने पाईपमध्ये ढकलणे.', hi: 'पानी उठाकर पाइप में दबाव बनाना।' }
        },
        {
          name: { en: 'Filter Station (Hydrocyclone + Disc/Screen)', mr: 'गाळण यंत्रणा (फिल्टर)', hi: 'निस्पंदन प्रणाली (फिल्टर)' },
          purpose: { en: 'Removes sand, silt, and algae to prevent dripper choking.', mr: 'वाळू आणि शेवाळ गाळून ड्रिपर्स बंद पडण्यापासून वाचवणे.', hi: 'रेत और कचरा छानकर ड्रिपर्स को चोक होने से बचाना।' }
        },
        {
          name: { en: 'Venturi Fertilizer Injector', mr: 'व्हेंचुरी खत यंत्र', hi: 'वेंचुरी फर्टिलाइजर इंजेक्टर' },
          purpose: { en: 'Draws dissolved chemical fertilizers directly into irrigation stream.', mr: 'पाण्यासोबत विद्राव्य खते पिकाच्या मुळांपर्यंत देणे.', hi: 'पानी के साथ घुलनशील उर्वरक सीधे जड़ों तक भेजना।' }
        },
        {
          name: { en: 'PVC Mainline & Sub-Mains', mr: 'मुख्य व उप-मुख्य पाईपलाईन', hi: 'मेन व सब-मेन पाइपलाइन' },
          purpose: { en: 'Buried pressure-rated pipes distributing water to individual plots.', mr: 'जमिनीखालील मजबूत पाईप्स जे पाणी विभागापर्यंत पोहोचवतात.', hi: 'जमीन में दबे पाइप जो पानी को खेत के अलग-अलग हिस्सों में ले जाते हैं।' }
        },
        {
          name: { en: 'LDPE Lateral Pipes & Drippers', mr: 'लॅटरल नळ्या व ड्रिपर्स', hi: 'लेटरल पाइप व ड्रिपर्स' },
          purpose: { en: '16mm UV tubes with integrated inline or online emitters spaced along rows.', mr: 'पिकांच्या ओळीत पसरवलेल्या नळ्या ज्या थेंब-थेंब पाणी देतात.', hi: 'पौधों की कतार में बिछी नलियां जो बूंद-बूंद पानी गिराती हैं।' }
        }
      ],
      maintenance: {
        en: [
          'Clean screen/disc filters weekly (or whenever pressure drop exceeds 0.5 kg/cm²).',
          'Flush lateral lines bi-weekly by opening end flush caps for 2 minutes.',
          'Administer seasonal acid treatment (dilute hydrochloric acid at pH 4.0) to dissolve mineral salts.',
          'Inject bleaching powder / chlorine solution to clear organic biological algae slime.'
        ],
        mr: [
          'आठवड्यातून एकदा स्क्रीन किंवा डिस्क फिल्टर पाण्याने स्वच्छ धुवून घ्या.',
          'दर १५ दिवसांनी लॅटरलची टोके (End Caps) उघडून २ मिनिटे साचलेला गाळ बाहेर काढून टाका.',
          'हंगामातून एकदा विहिरीच्या क्षारांचे प्रमाण असल्यास हायड्रोक्लोरिक ऍसिड (HCl) ट्रीटमेंट करा.',
          'शेवाळ घालवण्यासाठी पाण्यातून क्लोरीन किंवा ब्लिचिंग पावडरची प्रक्रिया करा.'
        ],
        hi: [
          'सप्ताह में एक बार डिस्क या स्क्रीन फिल्टर खोलकर साफ करें।',
          'हर १५ दिन में लेटरल के अंतिम छोर (एंड कैप) खोलकर जमा गाद बाहर बहाएं।',
          'खारे पानी से जमा नमक साफ करने के लिए मौसम में एक बार हल्का एसिड ट्रीटमेंट करें।',
          'शैवाल व काई हटाने के लिए ब्लीचिंग पाउडर या क्लोरीन का प्रयोग करें।'
        ]
      },
      whenToChooseIt: {
        en: 'Choose Drip when water is scarce, for high-value orchard and vegetable crops, row crops like sugarcane/cotton, on sloping or light soils, or where precise fertigation is desired.',
        mr: 'पाण्याची टंचाई असेल, फळबागा, भाजीपाला, ऊस किंवा कापूस यांसारखी ओळीतील पिके असतील, जमीन चढ-उताराची असेल आणि खतांची बचत करायची असेल तेव्हा ठिबक सिंचन निवडावे.',
        hi: 'जब पानी की कमी हो, बागवानी व सब्जियां हों, गन्ना या कपास जैसी कतारबद्ध फसलें हों, जमीन ढलान वाली हो और खाद की बचत करनी हो, तो ड्रिप सिंचाई चुनें।'
      }
    },
    {
      id: 'sprinkler',
      name: {
        en: 'Sprinkler Irrigation',
        mr: 'तुषार सिंचन (Sprinkler Irrigation)',
        hi: 'स्प्रिंकलर सिंचाई (Sprinkler Irrigation)'
      },
      category: 'Pressurized Overhead Spray',
      categoryKey: 'overhead',
      icon: 'bi-cloud-rain',
      image: ICONS.sprinkler,
      badge: 'Natural Rainfall Simulator',
      subtypes: {
        en: ['Portable HDPE Sprinkler System', 'Semi-Permanent Sprinkler System', 'Mini-Sprinkler System'],
        mr: ['पोर्टेबल एचडीपीई तुषार संच', 'अर्ध-कायम तुषार संच', 'मिनी-तुषार संच'],
        hi: ['पोर्टेबल एचडीपीई स्प्रिंकलर सेट', 'अर्ध-स्थायी स्प्रिंकलर प्रणाली', 'मिनी-स्प्रिंकलर']
      },
      howItWorks: {
        en: 'Water is pumped under pressure (2.0 to 3.5 kg/cm²) through lightweight quick-coupling HDPE pipes and sprayed into the air through rotating brass/polymer impact nozzles, falling onto crops like natural gentle rainfall.',
        mr: 'दाबाखालील पाणी हलक्या वजनाच्या एचडीपीई (HDPE) पाईप्समधून नेऊन फिरणाऱ्या नोजल्सद्वारे हवेत फवारले जाते, ज्यामुळे ते नैसर्गिक पावसाच्या सरीसारखे पिकांवर पडते.',
        hi: 'पाइपों में पानी को २ से ३.५ किग्रा/सेमी² दबाव में भेजकर घूमने वाली नोजलों द्वारा हवा में फुहार के रूप में छोड़ा जाता है, जो प्राकृतिक बारिश की तरह फसलों पर गिरता है।'
      },
      suitableCrops: {
        en: ['Wheat', 'Groundnut', 'Gram (Chana)', 'Soybean', 'Mustard', 'Barley', 'Leafy Greens', 'Fodder Grass'],
        mr: ['गहू', 'भुईमूग', 'हरभरा', 'सोयाबीन', 'मोहरी', 'ज्वारी', 'पालेभाज्या', 'चारा पिके'],
        hi: ['गेहूं', 'मूंगफली', 'चना', 'सोयाबीन', 'सरसों', 'जौ', 'पत्तेदार सब्जियां', 'चारा फसलें']
      },
      suitableSoil: {
        en: 'Ideal for sandy, sandy-loam, and shallow soils with high infiltration rates. Avoid on poorly drained heavy black clay which puddles rapidly.',
        mr: 'हलकी, वालुकामय आणि मध्यम पोताची जमीन जिथे पाणी लवकर मुरते. निचरा नसलेल्या अति चोपण किंवा अति काळ्या मातीसाठी जपून वापरावे.',
        hi: 'बलुई, रेतीली दोमट और उथली जमीनों के लिए उत्तम। जलभराव वाली अत्यधिक भारी चिकनी मिट्टी पर सावधानी से उपयोग करें।'
      },
      waterRequirementEfficiency: {
        efficiencyPercent: '75% - 85%',
        waterSavingPercent: '30% - 40% compared to surface flood irrigation',
        operatingPressure: '2.0 - 3.5 kg/cm² (30 - 50 PSI)',
        details: {
          en: 'Saves 30-40% water compared to furrow or flood irrigation. Discharges 15 to 30 L/min per sprinkler nozzle.',
          mr: 'पारंपरिक मोकळ्या पाण्यापेक्षा ३०% ते ४०% पाण्याची बचत. प्रत्येक नोजलमधून १५ ते ३० लिटर/मिनिट पाण्याचा फवारा.',
          hi: 'बाढ़ सिंचाई की तुलना में ३०-४०% पानी की बचत। प्रत्येक नोजल १५ से ३० लीटर/मिनट पानी का छिड़काव करता है।'
        }
      },
      advantages: {
        en: [
          'High water application uniformity across undulating and sloping topography.',
          'Provides excellent seedbed conditions for seed germination without soil crusting.',
          'Portable HDPE pipe sets can be easily dismantled and shifted across multiple plots.',
          'Cools microclimate and shields tender crops from frost damage during extreme winter.',
          'Requires no field channels or ridges, saving 10-15% valuable productive land.'
        ],
        mr: [
          'चढ-उताराच्या जमिनीवर समान पाणी वाटप होते.',
          'पेरणीनंतर बियाणे उगवण्यासाठी उत्तम, जमिनीवर घट्ट पपडी धरत नाही.',
          'पाईप्स वजनाने हलके असल्याने सहज एका शेतातून दुसऱ्या शेतात हलवता येतात.',
          'थंडीच्या दिवसांत पिकांना हलक्या थंडीपासून (धुके/दव) संरक्षण देते.',
          'पाट किंवा बांध काढावे लागत नसल्याने १०% ते १५% जमीन लागवडीसाठी वाचते.'
        ],
        hi: [
          'ऊबड़-खाबड़ खेत में भी सभी पौधों को एकसमान पानी मिलता है।',
          'अंकुरण के समय बहुत उपयोगी, मिट्टी पर पपड़ी नहीं जमने देता।',
          'हल्के पाइप होने के कारण एक खेत से दूसरे खेत में ले जाना आसान।',
          'सर्दियों में पाले (Frost) से फसलों की सुरक्षा करता है।',
          'नालियां न बनाने से १०-१५% अतिरिक्त जमीन खेती के लिए बचती है।'
        ]
      },
      limitations: {
        en: [
          'High wind speeds (> 15 km/h) distort spray distribution uniformity.',
          'Higher electrical power required to maintain 2.5-3.5 bar pressure.',
          'High midday evaporation loss in hot summer afternoons.',
          'Prolonged leaf wetness may foster fungal foliar leaf blight in vulnerable crops.'
        ],
        mr: [
          'जोरदार वारा असल्यास फवारा एकाच बाजूला झुकतो व पाण्याचे असमान वाटप होते.',
          'दाब निर्माण करण्यासाठी जास्त अश्वशक्तीच्या पंपाची व विजेची गरज असते.',
          'उन्हाळ्यात दुपारच्या वेळी पाण्याचे बाष्पीभवन जास्त होते.',
          'पानांवर सतत पाणी साचून राहिल्यास काही पिकांमध्ये बुरशीजन्य रोग वाढू शकतात.'
        ],
        hi: [
          'तेज हवा चलने पर पानी का फैलाव असंतुलित हो जाता है।',
          'पानी का दबाव बनाने के लिए अधिक बिजली या हॉर्सपावर की आवश्यकता।',
          'दोपहर की तेज धूप में छिड़काव करने पर वाष्पीकरण अधिक होता है।',
          'पत्तियों के लगातार गीले रहने से कुछ फसलों में फफूंद रोग का खतरा।'
        ]
      },
      basicComponents: [
        {
          name: { en: 'Centrifugal / Submersible Pump', mr: 'पाण्याचा पंप', hi: 'सिंचाई पंप' },
          purpose: { en: 'Supplies 2.5 to 3.5 kg/cm² operating pressure head.', mr: 'अपेक्षित दाबाने पाणी पुरवणे.', hi: 'आवश्यक दबाव पर पानी देना।' }
        },
        {
          name: { en: 'HDPE Quick-Coupling Pipes (63mm or 75mm)', mr: 'एचडीपीई पाईप्स (६३ किंवा ७५ मिमी)', hi: 'एचडीपीई पाइप (६३ या ७५ मिमी)' },
          purpose: { en: 'Portable lightweight pipes with clamps and rubber sealing rings.', mr: 'सहज जोडता व सोडवता येणारे मजबूत पाईप्स.', hi: 'आसानी से जोड़े जाने वाले हल्के पाइप।' }
        },
        {
          name: { en: 'Sprinkler Nozzles & Riser Pipes', mr: 'तुषार नोजल्स व रायझर पाईप्स', hi: 'स्प्रिंकलर नोजल व राइजर पाइप' },
          purpose: { en: 'Vertical stands with impact rotating brass/poly nozzles.', mr: 'उभे पाईप ज्यावर फिरणारे नोझल बसवलेले असतात.', hi: 'खड़े पाइप जिन पर घूमने वाली नोजल लगी होती है।' }
        },
        {
          name: { en: 'End Plugs & Tee Couplers', mr: 'एंड कॅप्स व टी-जॉइंट्स', hi: 'एंड प्लग व टी-कपलर' },
          purpose: { en: 'Direct water flow and securely close lateral pipe ends.', mr: 'पाईपलाईन वळवणे आणि शेवट बंद करणे.', hi: 'पाइपलाइन को मोड़ना और अंतिम छोर बंद करना।' }
        }
      ],
      maintenance: {
        en: [
          'Inspect rotating nozzle arm spring tension and ensure smooth rotation.',
          'Clean nozzle orifice using wooden toothpick if sand particles choke it.',
          'Inspect rubber washer gaskets in couplers; replace worn seals to prevent leaks.',
          'Store HDPE pipes flat and supported off the ground during off-season.'
        ],
        mr: [
          'नोझलची फिरणारी स्प्रिंग व्यवस्थित कार्य करते का ते तपासा.',
          'नोजल अडकल्यास काडीने कचरा काढा, लोखंडी वायर वापरू नका.',
          'पाईपच्या कपलरमधील रबर वॉशर तपासा; पाणी गळती रोखा.',
          'हंगाम संपल्यावर पाईप्स उन्हात न टाकता सपाट जमिनीवर किंवा शेडमध्ये ठेवा.'
        ],
        hi: [
          'नोजल के घूमने वाले स्प्रिंग की जांच करें कि वह सही घूम रही है।',
          'नोजल में रेत आने पर लकड़ी की सींक से साफ करें।',
          'पाइप जोड़ों के रबर गैस्केट चेक करें ताकि पानी लीक न हो।',
          'ऑफ-सीजन में पाइपों को धूप से बचाकर सुरक्षित शेड में रखें।'
        ]
      },
      whenToChooseIt: {
        en: 'Choose Sprinkler for closely spaced field crops like wheat, groundnut, soybean, or gram; on sandy or undulating fields; or when shifting pipes across different plots is practical.',
        mr: 'गहू, भुईमूग, हरभरा, सोयाबीन यांसारख्या दाट पेरणीच्या पिकांसाठी, हलक्या किंवा चढ-उताराच्या जमिनीवर आणि पाईप्स बदलून फिरवायचे असल्यास तुषार सिंचन निवडावे.',
        hi: 'गेहूं, मूंगफली, चना, सरसों जैसी सघन फसलों के लिए, हल्की या ढलान वाली भूमि पर और जब पाइप बदलकर अलग-अलग खेतों में सिंचाई करनी हो, तब स्प्रिंकलर चुनें।'
      }
    },
    {
      id: 'surface-flood',
      name: {
        en: 'Surface/Flood Irrigation',
        mr: 'पृष्ठभाग / पूर सिंचन (Surface/Flood Irrigation)',
        hi: 'सतह / बाढ़ सिंचाई (Surface/Flood Irrigation)'
      },
      category: 'Gravity Flow / Traditional',
      categoryKey: 'traditional',
      icon: 'bi-water',
      image: ICONS.surfaceFlood,
      badge: 'Traditional Gravity Flow',
      subtypes: {
        en: ['Check Basin Flooding', 'Border Strip Irrigation', 'Wild Flooding / Inundation'],
        mr: ['वाफे / आळे सिंचन', 'सपाट वाफा पद्धत', 'मोकळे पूर पाणी'],
        hi: ['क्यारी / थाला विधि', 'बॉर्डर पट्टी सिंचाई', 'खुली बाढ़ सिंचाई']
      },
      howItWorks: {
        en: 'Water is directed by gravity from canal sluices, borewells, or field ditches across the entire unconfined soil surface, flooding the basin beds until the entire soil profile is saturated.',
        mr: 'पाटातून किंवा पाईपमधून आलेले पाणी थेट जमिनीवर मोकळे सोडले जाते आणि ते संपूर्ण शेताच्या पृष्ठभागावर पसरून जमिनीत मुरते.',
        hi: 'नहर या नलकूप से पानी को नालियों के माध्यम से खेत की सतह पर खुला छोड़ दिया जाता है, जो बहते हुए पूरे खेत में फैलता है और मिट्टी में समाता है।'
      },
      suitableCrops: {
        en: ['Wetland Paddy (Transplanted Rice)', 'Pasture & Fodder Grasses'],
        mr: ['भात (खाचरातील भात शेती)', 'गवत व चारा पिके'],
        hi: ['धान (रोपाई वाला धान)', 'घास और चारा फसलें']
      },
      suitableSoil: {
        en: 'Heavy clay and deep black cotton soils with low percolation rates that hold water standing. Unsuitable for sandy soils due to extreme percolation loss.',
        mr: 'फक्त पाणी धरून ठेवणारी अति चिकण माती किंवा भारी काळी जमीन. हलक्या व वालुकामय जमिनीत पाणी जिरून वाया जाते.',
        hi: 'केवल भारी चिकनी मिट्टी और काली मिट्टी जिसमें पानी रोकने की क्षमता अधिक हो। बलुई मिट्टी के लिए बिल्कुल अनुपयुक्त।'
      },
      waterRequirementEfficiency: {
        efficiencyPercent: '40% - 50%',
        waterSavingPercent: 'Baseline (Lowest water efficiency; 50-60% lost)',
        operatingPressure: '0 kg/cm² (Gravity flow)',
        details: {
          en: 'Extremely water-intensive. Over 50% of applied water is lost to deep percolation beyond root depth, surface runoff, and evaporation.',
          mr: 'पाण्याचा प्रचंड वापर. ५०% पेक्षा जास्त पाणी मुळांच्या खाली जिरून, बांधावरून वाहून आणि उन्हाने बाष्पीभवन होऊन वाया जाते.',
          hi: 'पानी की अत्यधिक खपत। ५०% से अधिक पानी जमीन के नीचे गहराई में रिसकर, बहकर और वाष्पीकरण द्वारा व्यर्थ हो जाता है।'
        }
      },
      advantages: {
        en: [
          'Lowest initial equipment investment (no pumps, pipes, or emitters required if using canal gravity flow).',
          'Simple operation requiring zero technical machinery expertise.',
          'Essential for transplanted wetland paddy puddling and standing water weed suppression.',
          'Can wash out surface salts into deep drainage layers in well-drained soils.'
        ],
        mr: [
          'सुरुवातीला कोणतेही महागडे पाईप्स किंवा नोझल खरेदी करावे लागत नाहीत.',
          'चालवण्यासाठी कोणतेही तांत्रिक ज्ञान लागत नाही.',
          'भात पिकासाठी खाचरात पाणी साठवून ठेवण्यासाठी ही पारंपरिक पद्धत चालते.',
          'कालव्याचे पाणी उताराने थेट शेतात घेता येते.'
        ],
        hi: [
          'शुरुआती लागत सबसे कम (नहर के पानी में किसी मशीन की जरूरत नहीं)।',
          'चलाने में बेहद आसान, किसी तकनीकी ज्ञान की आवश्यकता नहीं।',
          'धान की फसल में पानी भरकर रखने के लिए अनिवार्य।',
          'नहर से प्राकृतिक ढलान द्वारा सीधे पानी दिया जा सकता है।'
        ]
      },
      limitations: {
        en: [
          'Massive water wastage (50-60% lost to percolation and evaporation).',
          'High risk of waterlogging, root suffocation, and soil salinization in heavy soils.',
          'Fosters rapid weed germination and proliferation across the entire field bed.',
          'Uneven distribution: head of the field is over-irrigated while tail end remains under-irrigated.'
        ],
        mr: [
          'पाण्याची प्रचंड नासाडी (अर्ध्याहून अधिक पाणी वाया जाते).',
          'जमीन पाणथळ होऊन पिकांची मुळे कुजण्याचा आणि जमीन क्षारपड होण्याचा धोका.',
          'सर्वत्र पाणी साचल्याने तण मोठ्या प्रमाणावर वाढते.',
          'सुरुवातीला खूप जास्त पाणी आणि शेताच्या टोकाला कमी पाणी अशी असमानता होते.'
        ],
        hi: [
          'पानी की भारी बर्बादी (५०% से अधिक पानी व्यर्थ)।',
          'मिट्टी में जलभराव, जड़ों का सड़ना और जमीन के खारी होने का खतरा।',
          'पूरे खेत में खरपतवार बहुत तेजी से फैलते हैं।',
          'खेत के शुरुआती हिस्से में जरूरत से ज्यादा और अंतिम छोर पर कम पानी मिलता है।'
        ]
      },
      basicComponents: [
        {
          name: { en: 'Field Channels & Bunds', mr: 'पाट आणि बांध', hi: 'नालियां और मेड़' },
          purpose: { en: 'Earthen or concrete ditches guiding water to check basins.', mr: 'पाणी शेतात नेणारे मातीचे पाट आणि वाफे.', hi: 'पानी को खेत तक ले जाने वाली नालियां और मेड़ें।' }
        },
        {
          name: { en: 'Inlet Gates & Siphons', mr: 'पाण्याचे नाके व सायफन', hi: 'इनलेट गेट व साइफन' },
          purpose: { en: 'Control water entry into individual border strips.', mr: 'वाफ्यामध्ये पाणी सोडणे व थांबवणे.', hi: 'नाली से क्यारी में पानी का नियंत्रण करना।' }
        }
      ],
      maintenance: {
        en: [
          'De-silt and clear weed blockages from field channels prior to each watering cycle.',
          'Laser-level field basins every 2-3 years to reduce dry patches and ponding.',
          'Repair earthen bunds to eliminate breach leaks.'
        ],
        mr: [
          'पाटातील गाळ आणि वाढलेले गवत वेळोवेळी काढून पाणी सुरळीत वाहू द्या.',
          'प्रत्येक २-३ वर्षांनी जमीन लेझर लेवलरने सपाट करा, जेणेकरून पाणी साचणार नाही.',
          'बांध फुटू नयेत म्हणून त्यांची डागडुजी करा.'
        ],
        hi: [
          'सिंचाई से पहले नालियों की गाद और खरपतवार साफ करें।',
          'खेत को समतल रखें ताकि पानी एक जगह न रुके।',
          'नालियों और मेड़ों की टूट-फूट की मरम्मत करें।'
        ]
      },
      whenToChooseIt: {
        en: 'Only choose Surface/Flood for wetland paddy, where canal water is abundant, or until capital for drip/sprinkler installation is arranged.',
        mr: 'फक्त भात खाचरासाठी किंवा कालव्याचे भरपूर पाणी उपलब्ध असताना आणि ठिबक सिंचनाची सोय होईपर्यंतच याचा वापर करावा.',
        hi: 'केवल धान की खेती में, या जब नहर का प्रचुर पानी उपलब्ध हो और जब तक ड्रिप/स्प्रिंकलर की व्यवस्था न हो सके।'
      }
    },
    {
      id: 'furrow',
      name: {
        en: 'Furrow Irrigation',
        mr: 'सऱ्या सिंचन (Furrow Irrigation)',
        hi: 'कूंड़ / फरो सिंचाई (Furrow Irrigation)'
      },
      category: 'Gravity Channel / Semi-Controlled',
      categoryKey: 'traditional',
      icon: 'bi-distribute-vertical',
      image: ICONS.furrow,
      badge: 'Ridge & Furrow Flow',
      subtypes: {
        en: ['Ridge & Furrow Method', 'Alternate Furrow Irrigation (AFI)', 'Broad Bed Furrow (BBF)'],
        mr: ['सरी-वरंबा पद्धत', 'एकआड एक सरी पद्धत (AFI)', 'रुंद वरंबा-सरी पद्धत (BBF)'],
        hi: ['मेड़-कूंड़ विधि', 'एकान्तर कूंड़ सिंचाई (AFI)', 'चौड़े मेड़ व नाली (BBF)']
      },
      howItWorks: {
        en: 'Water is guided down small, parallel sloping channels (furrows) dug between raised crop ridges. Plants grow on ridge crests, and water infiltrates laterally and downward into the root zone without wetting the plant collar or ridge tops.',
        mr: 'शेतात सऱ्या आणि वरंबे तयार केले जातात. वरंब्यावर पीक लावले जाते आणि सरीमधून पाणी सोडले जाते. पाणी पाझरून मुळांपर्यंत पोहोचते, पण पिकाच्या खोडाला थेट पाणी लागत नाही.',
        hi: 'खेत में मेड़ और नालियां (कूंड़) बनाई जाती हैं। फसल मेड़ों पर बोई जाती है और पानी नालियों में छोड़ा जाता है। पानी रिसकर जड़ों तक पहुंचता है, पर तना पानी से सुरक्षित रहता है।'
      },
      suitableCrops: {
        en: ['Sugarcane', 'Cotton', 'Maize', 'Potato', 'Tobacco', 'Tomato', 'Brinjal', 'Chilli'],
        mr: ['ऊस', 'कापूस', 'मका', 'बटाटा', 'तंबाखू', 'टोमॅटो', 'वांगी', 'मिरची'],
        hi: ['गन्ना', 'कपास', 'मक्का', 'आलू', 'तंबाकू', 'टमाटर', 'बैंगन', 'मिर्च']
      },
      suitableSoil: {
        en: 'Medium to heavy textured soils (loam, silt loam, and clay loam) that permit lateral water soaking. Unsuitable for coarse sand which drains vertically before reaching roots.',
        mr: 'मध्यम ते भारी जमीन (गाळाची माती, पोयटा आणि मध्यम काळी माती). वालुकामय हलक्या जमिनीत पाणी आडवे न पसरता थेट खाली जिरते, त्यामुळे तिथे अयोग्य.',
        hi: 'दोमट, गाद दोमट और मध्यम चिकनी मिट्टी जिसमें पानी किनारे की तरफ भी रिसता है। अत्यधिक बलुई मिट्टी के लिए अनुपयुक्त।'
      },
      waterRequirementEfficiency: {
        efficiencyPercent: '60% - 70%',
        waterSavingPercent: '20% - 30% compared to flat surface flooding',
        operatingPressure: '0.1 - 0.5 kg/cm² (Gravity or low pressure pipe)',
        details: {
          en: 'Saves 20-30% water over flat flood irrigation because only 1/3 to 1/2 of the total field surface area is wetted.',
          mr: 'सपाट वाफ्यांपेक्षा २०% ते ३०% पाण्याची बचत, कारण संपूर्ण शेताऐवजी फक्त सऱ्यांचा भागच ओला होतो.',
          hi: 'समतल बाढ़ सिंचाई से २०-३०% अधिक बचत, क्योंकि केवल नालियों का भाग गीला होता है।'
        }
      },
      advantages: {
        en: [
          'Prevents plant stem and collar rot diseases by keeping the ridge crown dry.',
          'Significantly more water efficient than flat surface flooding.',
          'Facilitates tractor and bullock intercultural operations like weeding and earthing up.',
          'Reduces surface crusting, allowing better soil aeration for root growth.'
        ],
        mr: [
          'पिकाच्या खोडाजवळ कोरडे राहत असल्याने खोडकुजव्या आणि बुरशीजन्य रोग टळतात.',
          'सपाट मोकळ्या पाण्यापेक्षा पाण्याची भरपूर बचत होते.',
          'वरंब्यामुळे पिकांना मातीची भर लावणे आणि खुरपणी करणे सोपे जाते.',
          'मुळांना हवा खेळती राहते आणि जमिनीची धूप कमी होते.'
        ],
        hi: [
          'तने के पास पानी न भरने से कॉलर रॉट और गलन रोग से सुरक्षा मिलती है।',
          'साधारण बहाव सिंचाई से काफी कम पानी खर्च होता है।',
          'निराई-गुड़ाई और पौधों पर मिट्टी चढ़ाना आसान हो जाता है।',
          'मिट्टी में वायु संचार अच्छा रहता है, जिससे जड़ें तेजी से फैलती हैं।'
        ]
      },
      limitations: {
        en: [
          'Requires uniform, gentle field slope grading (0.05% to 0.3%).',
          'Tailwater runoff at end of furrows can cause erosion if not collected in reuse pit.',
          'Labor intensive to form, maintain, and manage water flow into each furrow.',
          'Unsuitable for highly steep or undulating lands.'
        ],
        mr: [
          'जमिनीला विशिष्ट सौम्य उतार (०.१% ते ०.३%) असणे आवश्यक असते.',
          'सरीच्या शेवटी पाणी साचून माती वाहून जाण्याची शक्यता असते.',
          'सऱ्या पाडणे आणि पाणी वळवणे यासाठी मजुरांची गरज लागते.',
          'चढ-उताराच्या शेतामध्ये ही पद्धत वापरता येत नाही.'
        ],
        hi: [
          'खेत में एकसमान हल्का ढलान (०.१ से ०.३%) होना जरूरी है।',
          'नालियों के अंत में पानी बहने से रोकने के लिए निगरानी आवश्यक है।',
          'नालियां बनाने और पानी बदलने में अधिक श्रम लगता है।',
          'ऊबड़-खाबड़ जमीन पर इसका उपयोग कठिन है।'
        ]
      },
      basicComponents: [
        {
          name: { en: 'Ridger / Furrow Opener', mr: 'रिजर / सऱ्या पाडणारे यंत्र', hi: 'रिजर / कूंड़ बनाने वाला यंत्र' },
          purpose: { en: 'Tractor implement that cuts furrows and forms raised ridges.', mr: 'ट्रॅक्टरचे अवजार जे योग्य अंतरावर सऱ्या व वरंबे तयार करते.', hi: 'ट्रैक्टर का उपकरण जो मेड़ और नालियां बनाता है।' }
        },
        {
          name: { en: 'Gated Pipe or Syphon Tubes', mr: 'गेटेड पाईप किंवा सायफन पाईप्स', hi: 'गेटेड पाइप या साइफन ट्यूब' },
          purpose: { en: 'Deliver controlled, uniform flow into individual furrows.', mr: 'प्रत्येक सरीत समान पाणी सोडण्यासाठी नळ्या.', hi: 'प्रत्येक नाली में एकसमान पानी डालने के साधन।' }
        }
      ],
      maintenance: {
        en: [
          'Reshape broken ridge walls during crop intercultural earthing-up operations.',
          'Clear weed and trash obstructions from furrow troughs.',
          'Maintain tail-end drainage bunds to prevent ponding.'
        ],
        mr: [
          'पिकाला भर लावताना फुटलेले वरंबे पुन्हा नीट करा.',
          'सऱ्यांमधील अडकलेला पालापाचोळा काढून टाका.',
          'शेवटी पाणी साचू नये म्हणून निचऱ्याची व्यवस्था ठेवा.'
        ],
        hi: [
          'मिट्टी चढ़ाते समय टूटी हुई मेड़ों को ठीक करें।',
          'नालियों से कचरा और खरपतवार हटाएं।',
          'नाली के अंत में जलभराव रोकने के लिए निकासी रखें।'
        ]
      },
      whenToChooseIt: {
        en: 'Choose Furrow irrigation for row crops like cotton, sugarcane, maize, and potato in leveled fields where drip irrigation equipment is not yet installed.',
        mr: 'कापूस, ऊस, मका, बटाटा यांसारख्या ओळीतील पिकांसाठी सपाट शेतात जेव्हा ठिबक सिंचन उपलब्ध नसेल तेव्हा सऱ्या पद्धत वापरावी.',
        hi: 'कपास, गन्ना, मक्का और आलू जैसी फसलों में समतल खेत होने पर जब ड्रिप सिस्टम न हो, तब कूंड़ सिंचाई अपनाएं।'
      }
    },
    {
      id: 'rain-gun',
      name: {
        en: 'Rain Gun Irrigation',
        mr: 'रेन गन सिंचन (Rain Gun Irrigation)',
        hi: 'रेन गन सिंचाई (Rain Gun Irrigation)'
      },
      category: 'High-Volume Cannon Spray',
      categoryKey: 'cannon',
      icon: 'bi-broadcast-pin',
      image: ICONS.rainGun,
      badge: 'High-Volume Field Cannon',
      subtypes: {
        en: ['Tripod Stand Mounted Rain Gun', 'Mobile Trolley Rain Gun System'],
        mr: ['तिपाई स्टँड रेन गन', 'मोबाईल ट्रॉली रेन गन'],
        hi: ['तिपाई स्टैंड रेन गन', 'मोबाइल ट्रॉली रेन गन']
      },
      howItWorks: {
        en: 'High-capacity, large-nozzle gun sprinkler mounted on a tripod stand operates under high pressure (4.0 to 6.0 kg/cm²). It throws a powerful water jet across a 25 to 45 meter radius over a 360-degree or sector arc, covering 1 to 1.5 acres from a single stand.',
        mr: 'स्टँडवर बसवलेली मोठी तोफेसारखी गन ४ ते ६ बार दाबाखाली चालते. ती २५ ते ४५ मीटर अंतरापर्यंत पाण्याचा प्रचंड फवारा हवेत उडवते, ज्यामुळे एकाच ठिकाणाहून १ ते १.५ एकर क्षेत्र भिजवता येते.',
        hi: 'तिपाई स्टैंड पर लगी बड़ी नोजल गन ४ से ६ किग्रा/सेमी² उच्च दबाव पर काम करती है। यह २५ से ४५ मीटर की दूरी तक पानी की तेज धार फेंकती है और एक ही जगह से १ से १.५ एकड़ क्षेत्र को सींचती है।'
      },
      suitableCrops: {
        en: ['Sugarcane (Tall crop)', 'Fodder Grass & Maize', 'Groundnut', 'Tea & Coffee Plantations', 'Pre-Sowing Field Soaking'],
        mr: ['वाढलेला ऊस', 'चारा पिके व मका', 'भुईमूग', 'चहा व कॉफी बागा', 'पेरणीपूर्व ओलीत'],
        hi: ['बड़ा गन्ना', 'चारा फसलें व मक्का', 'मूंगफली', 'चाय व कॉफी बगान', 'बुवाई पूर्व भारी पलेवा']
      },
      suitableSoil: {
        en: 'Medium to heavy soils with high organic matter that can absorb strong droplet impact without soil erosion.',
        mr: 'मध्यम ते भारी कसदार जमीन जी पाण्याच्या वेगामुळे वाहून जाणार नाही.',
        hi: 'मध्यम से भारी मिट्टी जो तेज बूंदों के प्रभाव को बिना कटाव के झेल सके।'
      },
      waterRequirementEfficiency: {
        efficiencyPercent: '70% - 80%',
        waterSavingPercent: '30% - 35% compared to surface flooding',
        operatingPressure: '4.0 - 6.0 kg/cm² (55 - 85 PSI)',
        details: {
          en: 'High flow rate (200 - 600 Litres/min). Fast irrigation turnaround: irrigates 1 acre in 1.5 to 2.5 hours.',
          mr: 'पाण्याचा मोठा विसर्ग (२०० ते ६०० लिटर/मिनिट). दीड ते दोन तासांत संपूर्ण १ एकर शेत भिजवते.',
          hi: 'उच्च बहाव (२०० से ६०० लीटर/मिनिट)। डेढ़ से दो घंटे में पूरे १ एकड़ की त्वरित सिंचाई।'
        }
      },
      advantages: {
        en: [
          'Massive coverage area from one fixed point with minimal pipe dragging.',
          'Ideal for tall sugarcane where regular sprinklers or laborers cannot enter.',
          'Dramatically slashes irrigation labor time by 70%.',
          'Perfect for rapid pre-sowing soil soaking across large fields.'
        ],
        mr: [
          'एकाच ठिकाणाहून खूप मोठा परिसर भिजतो, सतत पाईप हलवण्याचा त्रास वाचतो.',
          'मोठ्या वाढलेल्या उसात जिथे माणूस जाऊ शकत नाही तिथे वरून पाणी देण्यास सर्वोत्तम.',
          'मजुरीच्या खर्चात आणि वेळेत ७०% बचत होते.',
          'पेरणीपूर्वी संपूर्ण शेतात वेगाने पाणी देण्यासाठी अत्यंत प्रभावी.'
        ],
        hi: [
          'एक ही स्थान से बहुत बड़े क्षेत्र की सिंचाई, बार-बार पाइप बदलने का झंझट नहीं।',
          'गन्ने की ऊंची फसल में जहां अंदर जाना असंभव हो, वहां ऊपर से सिंचाई का सबसे अच्छा तरीका।',
          'सिंचाई के समय और मजदूरी में ७०% तक की बचत।',
          'बुवाई से पहले पूरे खेत को तेजी से भिगोने के लिए आदर्श।'
        ]
      },
      limitations: {
        en: [
          'Requires high horsepower pump (7.5 HP to 15 HP) and high pressure delivery lines.',
          'Heavy water droplets can damage delicate vegetable flowers, young seedlings, or cause fruit drops.',
          'Substantial wind drift loss on gusty days.',
          'Higher energy and electricity consumption.'
        ],
        mr: [
          'चालवण्यासाठी ७.५ ते १५ एच.पी. क्षमतेचा मोठा पंप आणि मजबूत पाईपलाईन लागते.',
          'पाण्याचे मोठे थेंब भाजीपाल्याची नाजूक फुले आणि कोवळी रोपे खराब करू शकतात.',
          'जोरदार वारा असल्यास पाण्याचा फवारा उडून जातो.',
          'विजेचा व पाण्याचा दाब जास्त लागतो.'
        ],
        hi: [
          'चलाने के लिए ७.५ से १५ एचपी के बड़े पंप और मजबूत पाइप की आवश्यकता।',
          'पानी की मोटी बूंदें नाजुक सब्जियों, फूलों और छोटे पौधों को नुकसान पहुंचा सकती हैं।',
          'हवा तेज होने पर पानी हवा में उड़कर दिशा बदल लेता है।',
          'बिजली और ईंधन की खपत अधिक होती है।'
        ]
      },
      basicComponents: [
        {
          name: { en: 'High-Pressure Booster Pump (7.5 - 15 HP)', mr: 'हाय-प्रेशर पंप (७.५ ते १५ HP)', hi: 'हाई-प्रेशर पंप (७.५ - १५ HP)' },
          purpose: { en: 'Delivers 4.5+ bar pressure needed to throw long water jet.', mr: 'पाणी लांब फेकण्यासाठी आवश्यक उच्च दाब निर्माण करणे.', hi: 'लंबी दूरी तक पानी फेंकने के लिए उच्च दबाव बनाना।' }
        },
        {
          name: { en: 'Rain Gun Head with Adjustable Arc', mr: 'रेन गन हेड (नोजल)', hi: 'रेन गन हेड (नोजल)' },
          purpose: { en: 'Heavy-duty alloy/brass gun with interchangeable nozzles (14-22mm).', mr: 'फिरणारे मोठे नोझल जे संपूर्ण वर्तुळात किंवा अर्धवर्तुळात पाणी फेकते.', hi: 'घूमने वाली भारी नोजल जो पूरे या आधे घेरे में पानी फेंकती है।' }
        },
        {
          name: { en: 'Heavy Tripod Stand / Trolley', mr: 'तिपाई स्टँड / ट्रॉली', hi: 'मजबूत तिपाई स्टैंड / ट्रॉली' },
          purpose: { en: 'Rigid anchored stand withstanding powerful hydraulic thrust.', mr: 'पाण्याच्या प्रचंड दाबाने गन हलू नये म्हणून मजबूत आधार.', hi: 'पानी के तेज धक्के से गन को स्थिर रखने वाला मजबूत स्टैंड।' }
        },
        {
          name: { en: 'High-Pressure 75mm / 90mm Quick HDPE Pipes', mr: '७५ किंवा ९० मिमी मजबूत पाईप्स', hi: '७५ या ९० मिमी मजबूत पाइप' },
          purpose: { en: 'Heavy-gauge pressure pipes carrying water without bursting.', mr: 'विना गळती पाणी पोहोचवणारे पाईप्स.', hi: 'बिना फटे उच्च दबाव सहन करने वाले पाइप।' }
        }
      ],
      maintenance: {
        en: [
          'Lubricate the internal drive gear and trip-pin reverse mechanism before each season.',
          'Inspect interchangeable nozzle tip for grit erosion; replace if orifice is scored.',
          'Check tripod anchoring pegs to ensure gun does not topple under 5 bar recoil thrust.'
        ],
        mr: [
          'गनच्या फिरणाऱ्या गिअरमध्ये आणि स्प्रिंगमध्ये नियमित ऑईलिंग करा.',
          'नोझलचे तोंड वाळूमुळे घासले आहे का ते तपासा; आवश्यकतेनुसार नवीन नोझल बसवा.',
          'गन सुरू करताना स्टँड जमिनीत पक्का ठोकलेला आहे याची खात्री करा.'
        ],
        hi: [
          'गन के घूमने वाले गियर और रिवर्स पिन में नियमित तेल लगाएं।',
          'नोजल की नोक की जांच करें कि वह रेत से घिस तो नहीं गई।',
          'स्टैंड को जमीन में मजबूती से गाड़ें ताकि तेज दबाव में गन पलटे नहीं।'
        ]
      },
      whenToChooseIt: {
        en: 'Choose Rain Gun for tall sugarcane, fodder crops, pre-sowing irrigation, or large undulating fields where rapid irrigation with minimum labor is essential.',
        mr: 'मोठ्या उसासाठी, चारा पिकांसाठी, किंवा कमी मजुरांमध्ये संपूर्ण शेत झटपट भिजवायचे असल्यास रेन गन वापरावी.',
        hi: 'ऊंचे गन्ने, चारा फसलों, पलेवा करने या बड़े खेतों में कम समय और कम मजदूरों में सिंचाई करने के लिए रेन गन चुनें।'
      }
    },
    {
      id: 'micro-irrigation',
      name: {
        en: 'Micro-Irrigation',
        mr: 'सूक्ष्म सिंचन (Micro-Irrigation)',
        hi: 'सूक्ष्म सिंचाई (Micro-Irrigation)'
      },
      category: 'Micro-Irrigation / Localized',
      categoryKey: 'micro',
      icon: 'bi-flower2',
      image: ICONS.microIrrigation,
      badge: 'Protected Nursery & Canopy Spray',
      subtypes: {
        en: ['Micro-Sprinklers', 'Overhead Foggers', 'Misters & Micro-Jets'],
        mr: ['मायक्रो-स्प्रिंकलर्स', 'ओव्हरहेड फॉगर्स', 'मिस्टर्स व मायक्रो-जेट्स'],
        hi: ['माइक्रो-स्प्रिंकलर्स', 'ओवरहेड फॉगर्स', 'मिस्टर्स व माइक्रो-जेट्स']
      },
      howItWorks: {
        en: 'Miniature spinning micro-nozzles mounted on small ground stakes or suspended overhead operate at 1.5 to 2.5 kg/cm². They throw gentle fine mist or small droplet spray in a 1 to 3 meter localized circle directly over root beds or young plant canopies.',
        mr: 'लहान दांड्यावर किंवा छतावर बसवलेले छोटे फिरणारे नोझल्स (स्पिनर) १.५ ते २.५ बार दाबावर १ ते ३ मीटर परिसरात अतिशय हलका व बारीक पाण्याचा फवारा सोडतात.',
        hi: 'छोटे स्टैंड पर या ऊपर लटकी हुई सूक्ष्म नोजलें (स्पिनर्स) १.५ से २.५ बार दबाव में १ से ३ मीटर के घेरे में हल्का फव्वारा या कोहरा बनाती हैं।'
      },
      suitableCrops: {
        en: ['Polyhouse / Greenhouse Vegetables', 'Nursery Seedlings', 'Ginger & Turmeric Beds', 'Garlic & Onion', 'Leafy Greens (Coriander, Spinach)', 'High-Density Orchards'],
        mr: ['हरितगृह / पॉलीहाऊस भाजीपाला', 'रोपवाटिका (नर्सरी)', 'आले आणि हळद', 'लसूण व कांदा', 'पालेभाज्या (कोथिंबीर, पालक)', 'फुलशेती'],
        hi: ['पॉलीहाउस व ग्रीनहाउस सब्जियां', 'नर्सरी के पौधे', 'अदरक व हल्दी', 'लहसुन और प्याज', 'पत्तेदार सब्जियां (धनिया, पालक)', 'फूलों की खेती']
      },
      suitableSoil: {
        en: 'Raised vegetable beds, shade-net soil mixes, sandy loam, cocopeat trays, and fertile well-drained loamy soils.',
        mr: 'गादी वाफे, शेडनेटमधील जमीन, कोकोपीट ट्रे आणि चांगला निचरा होणारी पोयट्याची माती.',
        hi: 'उठी हुई क्यारियां, शेडनेट की मिट्टी, कोकोपीट ट्रे और अच्छी जल निकासी वाली दोमट मिट्टी।'
      },
      waterRequirementEfficiency: {
        efficiencyPercent: '85% - 90%',
        waterSavingPercent: '35% - 45% compared to surface flooding',
        operatingPressure: '1.5 - 2.5 kg/cm² (20 - 35 PSI)',
        details: {
          en: 'Low discharge (25 to 100 L/hr per micro-sprinkler). Creates favorable humid micro-climate cooling while protecting fragile germinating seedlings.',
          mr: 'कमी विसर्ग (२५ ते १०० लिटर/तास). हवेतील आर्द्रता टिकवून ठेवून उन्हाळ्यात तापमान कमी करते आणि नाजूक रोपांचे रक्षण करते.',
          hi: 'कम बहाव (२५ से १०० लीटर/घंटा)। खेत का तापमान कम करके ठंडक बनाए रखता है और नाजुक बीजों को बहने से रोकता है।'
        }
      },
      advantages: {
        en: [
          'Provides micro-climate cooling in polyhouses and scorching dry summers.',
          'Gentle water droplets prevent seed dislodging or soil compaction in nurseries.',
          'High water efficiency (85-90%) with excellent root-zone wetting overlap.',
          'Supports foliar micro-nutrient delivery in greenhouse crops.'
        ],
        mr: [
          'उन्हाळ्यात शेडनेट आणि पॉलीहाऊसमध्ये तापमान २-४ अंशांनी थंड ठेवण्यास मदत.',
          'पाण्याचे थेंब अतिशय हलके असल्याने वाफ्यातील बारीक बियाणे किंवा माती उडत नाही.',
          '८५% ते ९०% पाण्याची बचत आणि मुळांच्या भोवती उत्तम ओल टिकून राहते.',
          'द्रावणाद्वारे पानांवर विद्राव्य खते देण्यास सुलभ.'
        ],
        hi: [
          'गर्मियों में ग्रीनहाउस और शेडनेट के तापमान को नियंत्रित कर ठंडक देता है।',
          'बूंदें बहुत हल्की होने से नर्सरी के नाजुक बीज बहते नहीं हैं।',
          '८५-९०% पानी की बचत और जड़ों के पास उत्तम नमी।',
          'पौधों पर पत्तियों द्वारा पोषक तत्व देने में अत्यंत मददगार।'
        ]
      },
      limitations: {
        en: [
          'Fine orifices easily choked by minute algae or calcium sediment.',
          'Micro-tubes vulnerable to detachment or disturbance during field weeding.',
          'Wind drift outside protected structures can disrupt wetting pattern.'
        ],
        mr: [
          'नोझलचे छिद्र अतिशय बारीक असल्याने पाण्यातील शेवाळ किंवा कचऱ्याने लगेच तुंबते.',
          'खुरपणी करताना लहान नळ्या पायाने निसटण्याची शक्यता असते.',
          'उघड्या शेतात जोरदार वारा असल्यास पाण्याचे थेंब हवेत उडतात.'
        ],
        hi: [
          'बारीक छिद्र होने के कारण रेत या शैवाल से जल्दी चोक होने का डर।',
          'निराई करते समय पैरों से पतली नलियां निकलने का खतरा।',
          'खुले खेत में तेज हवा चलने पर पानी का फैलाव बिगड़ जाता है।'
        ]
      },
      basicComponents: [
        {
          name: { en: 'Disc Filter & Pressure Regulator', mr: 'डिस्क फिल्टर व प्रेशर रेग्युलेटर', hi: 'डिस्क फिल्टर व प्रेशर रेगुलेटर' },
          purpose: { en: 'Ensures crystal clear water and precise 1.5-2.0 bar line pressure.', mr: 'बारीक कचरा अडवणे आणि योग्य दाब राखणे.', hi: 'रेत छानना और सही दबाव बनाए रखना।' }
        },
        {
          name: { en: 'PE Distribution Lateral Pipes (16-32mm)', mr: 'पीई पाईप्स (१६ ते ३२ मिमी)', hi: 'पीई पाइप (१६ से ३२ मिमी)' },
          purpose: { en: 'UV-resistant delivery headers carrying water down beds.', mr: 'वाफ्यांवर पाणी वाहून नेणाऱ्या नळ्या.', hi: 'क्यारियों में पानी ले जाने वाली नलियां।' }
        },
        {
          name: { en: 'Micro-Tubes, Support Stakes & Micro-Spinners', mr: 'मायक्रो ट्यूब्स, स्टँड व फिरणारे नोझल', hi: 'माइक्रो-ट्यूब, स्टैंड व नोजल' },
          purpose: { en: 'Elevated miniature sprinklers distributing localized fine droplets.', mr: 'लहान दांड्यांवर बसवलेले स्पिनर्स जे बारीक पाऊस पाडतात.', hi: 'छोटे स्टैंड पर लगे सूक्ष्म फव्वारे जो महीन फुहार छोड़ते हैं।' }
        }
      ],
      maintenance: {
        en: [
          'Flush mainline and disc filter every week without fail.',
          'Submerge choked micro-spinner heads in 1% vinegar/acid solution to dissolve scale.',
          'Check stake alignment so spray heads remain plumb vertical.'
        ],
        mr: [
          'दर आठवड्याला फिल्टर स्वच्छ करा आणि पाईप्स फ्लश करा.',
          'चोक झालेले नोझल्स काढून व्हिनेगर किंवा सौम्य ऍसिडच्या पाण्यात बुडवून स्वच्छ करा.',
          'नोझलचे दांडे सरळ उभे आहेत ना ते तपासा जेणेकरून फवारा व्यवस्थित बसेल.'
        ],
        hi: [
          'हर हफ्ते फिल्टर साफ करें और पाइपलाइन का अंतिम सिरा खोलकर फ्लश करें।',
          'चोक हुई नोजल को हल्के सिरके या एसिड के घोल में डालकर साफ करें।',
          'चेक करें कि स्टैंड सीधे खड़े हैं ताकि फुहार सही दिशा में गिरे।'
        ]
      },
      whenToChooseIt: {
        en: 'Choose Micro-Irrigation for vegetable nursery seedling production, shade-net houses, ginger/turmeric raised beds, or exotic leafy greens.',
        mr: 'भाजीपाला नर्सरी, शेडनेट/पॉलीहाऊस, आले-हळदीचे गादी वाफे किंवा कोथिंबीर/पालक यासाठी सूक्ष्म सिंचन पद्धत निवडावी.',
        hi: 'नर्सरी में पौधे तैयार करने, शेडनेट हाउस, अदरक-हल्दी की क्यारियों और पत्तेदार सब्जियों के लिए सूक्ष्म सिंचाई चुनें।'
      }
    }
  ];

  // 3. Irrigation System Step-by-Step Flow Guide (7 Components)
  const IRRIGATION_SYSTEM_FLOW = [
    {
      step: 1,
      id: 'water-source',
      title: {
        en: 'Water Source',
        mr: 'जलस्रोत (Water Source)',
        hi: 'जल स्रोत (Water Source)'
      },
      role: {
        en: 'Reservoir & Raw Supply Provider',
        mr: 'पाण्याचा मुख्य साठा आणि पुरवठा',
        hi: 'कच्चे पानी का मुख्य भंडार एवं आपूर्ति'
      },
      farmerExplanation: {
        en: 'Every irrigation system begins here. Whether it is a deep borewell, an open dug well, an agricultural farm pond (shet-tale), or a government canal outlet, this provides the raw volume of water needed for your farm.',
        mr: 'सिंचनाची सुरुवात इथून होते. बोअरवेल, विहीर, शेततळे किंवा कालवा हा तुमच्या शेताचा पाण्याचा मुख्य स्त्रोत असतो. पाण्याच्या उपलब्धतेवरच तुमचे संपूर्ण सिंचन नियोजन अवलंबून असते.',
        hi: 'हर सिंचाई प्रणाली की शुरुआत यहीं से होती है। चाहे वह बोरवेल हो, खुला कुआं, खेत-तालाब हो या नहर, यह आपके खेत के लिए आवश्यक पानी का मुख्य स्रोत होता है।'
      },
      farmerTip: {
        en: 'Test water salinity (TDS & Electrical Conductivity EC) before investing in drip. Highly salty water will require special disc filtration and periodic acid washing.',
        mr: 'ठिबक बसवण्यापूर्वी पाण्याचे क्षार (TDS) तपासून घ्या. खारट पाणी असल्यास डिस्क फिल्टर आणि नियमित ऍसिड वॉश आवश्यक ठरते.',
        hi: 'ड्रिप लगाने से पहले पानी के खारेपन (TDS) की जांच कराएं। खारे पानी के लिए डिस्क फिल्टर और एसिड वॉश जरूरी होता है।'
      },
      keyChecks: {
        en: ['Measure seasonal water drawdown', 'Test water pH and EC salinity', 'Ensure silt/mud does not enter pump foot-valve'],
        mr: ['उन्हाळ्यात पाण्याची पातळी किती खाली जाते ते तपासा', 'पाण्याचा सामू (pH) आणि क्षारता तपासा', 'फूट-व्हॉल्व्हमध्ये गाळ जाणार नाही याची काळजी घ्या'],
        hi: ['मौसम में पानी के स्तर की जांच करें', 'पानी का pH और खारापन टेस्ट कराएं', 'पंप के फुट-वाल्व में गाद न जाने दें']
      },
      icon: 'bi-droplet-half'
    },
    {
      step: 2,
      id: 'pump',
      title: {
        en: 'Pump Station',
        mr: 'पंपिंग युनिट (Pump Station)',
        hi: 'पंपिंग स्टेशन (Pump Station)'
      },
      role: {
        en: 'The Heart: Water Lifting & Pressurization Engine',
        mr: 'सिंचन प्रणालीचे हृदय: पाणी उचलणे व दाब निर्माण करणे',
        hi: 'सिस्टम का दिल: पानी उठाना और आवश्यक दबाव बनाना'
      },
      farmerExplanation: {
        en: 'The pump is the heart of your irrigation network. It lifts water from the reservoir and energizes it with enough pressure (2 to 4 kg/cm²) to push it through all filters and pipelines to the farthest crop row.',
        mr: 'पंप हा सिंचन यंत्रणेचे हृदय आहे. तो विहिरीतून किंवा तळ्यातून पाणी उपसून त्याला आवश्यक दाब देतो, जेणेकरून पाणी फिल्टरमधून पार पडून शेताच्या शेवटच्या कोपऱ्यातील पिकापर्यंत पोहोचू शकेल.',
        hi: 'पंप पूरी प्रणाली का हृदय है। यह कुएं या बोरवेल से पानी खींचकर उसमें २ से ४ किग्रा का दबाव बनाता है, ताकि पानी फिल्टर से निकलकर खेत के सबसे दूर वाले छोर तक पहुंच सके।'
      },
      farmerTip: {
        en: 'Always install a non-return check valve and a glycerin-filled pressure gauge right at the pump outlet. It tells you instantly if the pressure is right.',
        mr: 'पंपाच्या तोंडावर नॉन-रिटर्न व्हॉल्व्ह (NRV) आणि प्रेशर गेज (दाबमापक) नक्की बसवा, ज्यामुळे पाईपमधील खरा दाब लगेच समजतो.',
        hi: 'पंप के मुहाने पर नॉन-रिटर्न वाल्व (NRV) और प्रेशर गेज अवश्य लगाएं, जिससे पानी का सटीक दबाव पता चल सके।'
      },
      keyChecks: {
        en: ['Verify motor operating current (Amperes)', 'Ensure zero air leakage in suction pipe', 'Confirm proper earthing for electrical safety'],
        mr: ['मोटरचे ॲम्पिअर तपासा', 'सक्शन पाईपमधून हवा घेत नाही ना ते पहा', 'विद्युत सुरक्षिततेसाठी अर्थिंग तपासा'],
        hi: ['मोटर का करंट (एम्पीयर) चेक करें', 'सक्शन पाइप से हवा लीक न होने दें', 'बिजली सुरक्षा के लिए अर्थिंग की जांच करें']
      },
      icon: 'bi-speedometer'
    },
    {
      step: 3,
      id: 'filter',
      title: {
        en: 'Filter Station (Primary & Secondary)',
        mr: 'गाळण यंत्रणा / फिल्टर (Filter Station)',
        hi: 'निस्पंदन प्रणाली / फिल्टर (Filter Station)'
      },
      role: {
        en: 'The Kidneys: Anti-Clogging Water Purifier',
        mr: 'सिंचनाची किडनी: कचरा अडवून ड्रिपर्स बंद होण्यापासून वाचवणे',
        hi: 'सिस्टम की किडनी: रेत व शैवाल छानकर ड्रिपर्स को बचाना'
      },
      farmerExplanation: {
        en: 'Even clean-looking well water contains invisible silt, sand granules, and algae. The filter acts as the kidney of the system, trapping physical particles before they can enter the fine orifices of your drippers or sprinkler nozzles.',
        mr: 'पाणी स्वच्छ दिसत असले तरी त्यात बारीक वाळू, माती आणि शेवाळ असते. फिल्टर या सर्व कचऱ्याला अडवतो. फिल्टर नसेल तर काही दिवसांतच तुमच्या ठिबकचे बारीक छिद्र चोक होऊन पाणी बंद पडेल.',
        hi: 'दिखने में साफ पानी में भी महीन रेत और काई होती है। फिल्टर इन सभी अशुद्धियों को छान लेता है। यदि फिल्टर न हो, तो कुछ ही दिनों में ड्रिप के बारीक छेद बंद हो जाएंगे।'
      },
      farmerTip: {
        en: 'Monitor the pressure difference between inlet and outlet gauges. If the difference is more than 0.5 kg/cm², clean the filter elements immediately.',
        mr: 'फिल्टरच्या आधीचा आणि नंतरचा प्रेशर गेज पहा. दोघांमध्ये ०.५ किलोग्रॅमपेक्षा जास्त फरक दिसल्यास फिल्टर लगेच साफ करा.',
        hi: 'फिल्टर के इनलेट और आउटलेट प्रेशर गेज को देखें। यदि दोनों में ०.५ किग्रा से अधिक अंतर हो, तो फिल्टर तुरंत धोएं।'
      },
      keyChecks: {
        en: ['Clean disc rings or screen mesh weekly', 'Flush sand separator tank after heavy rain', 'Check rubber sealing O-rings for leaks'],
        mr: ['आठवड्यातून एकदा डिस्क किंवा जाळी धुवून स्वच्छ करा', 'पावसाळ्यानंतर हायड्रोसायक्लॉनमधील वाळू काढा', 'रबर वॉशर नीट बसले आहेत का ते पहा'],
        hi: ['हफ्ते में एक बार डिस्क या जाली को साफ पानी से धोएं', 'सैंड सेपरेटर से जमा बालू बाहर निकालें', 'रबर सील ठीक से लगी होने की जांच करें']
      },
      icon: 'bi-funnel-fill'
    },
    {
      step: 4,
      id: 'main-line',
      title: {
        en: 'Main Line',
        mr: 'मुख्य जलवाहिनी (Main Line)',
        hi: 'मुख्य पाइपलाइन (Main Line)'
      },
      role: {
        en: 'The High-Pressure Highway',
        mr: 'मुख्य जलवाहिनी: पाणी शेतापर्यंत नेणारा हायवे',
        hi: 'उच्च दबाव का राजमार्ग: पानी को खेत के मुख्य भाग तक ले जाना'
      },
      farmerExplanation: {
        en: 'The mainline is a rigid, heavy-duty PVC or HDPE pipe (typically 63mm to 110mm diameter, 4 to 6 kg/cm² pressure rating) buried underground. It safely carries the large volume of pressurized water from the pump house to your farm plots.',
        mr: 'मुख्य लाईन ही जमिनीखाली गाडलेली ६३ मिमी ते ११० मिमी व्यासाची जाड पीव्हीसी पाईप असते. ही पंपापासून निघालेले दाबाखालील पाणी शेताच्या वेगवेगळ्या भागांपर्यंत सुरक्षित पोहोचवते.',
        hi: 'मेन लाइन ६३ से ११० मिमी की मजबूत पीवीसी पाइप होती है जो जमीन के नीचे दबी होती है। यह पंप से निकलने वाले उच्च दबाव वाले पानी को खेत के अलग-अलग ब्लॉकों तक ले जाती है।'
      },
      farmerTip: {
        en: 'Always bury the mainline at least 2 to 2.5 feet underground. This protects it from tractor ploughing, sunlight UV degradation, and heavy farm vehicle traffic.',
        mr: 'मुख्य पाईपलाईन नेहमी जमिनीखाली किमान २ ते २.५ फूट खोल गाडावी, जेणेकरून नांगरणी करताना किंवा ट्रॅक्टर फिरताना पाईप फुटणार नाही.',
        hi: 'मेन पाइपलाइन को जमीन में कम से कम २ से २.५ फीट गहरा दबाएं, ताकि ट्रैक्टर की जुताई या पहियों से पाइप टूटे नहीं।'
      },
      keyChecks: {
        en: ['Inspect air release valves at high points', 'Check for underground water leaks or wet soft spots', 'Confirm proper pipe pressure rating (4 or 6 kg/cm²)'],
        mr: ['उंच ठिकाणी एअर व्हॉल्व्ह व्यवस्थित काम करतो का ते तपासा', 'जमिनीखाली पाईप फुटून पाणी पाझरते का ते पहा', 'पाईपचा प्रेशर रेटिंग (४ किंवा ६ किलो) तपासा'],
        hi: ['ऊंचाई वाले स्थानों पर एयर वाल्व की जांच करें', 'जमीन के नीचे पाइप लीकेज चेक करें', 'पाइप का प्रेशर रेटिंग सही होने की पुष्टि करें']
      },
      icon: 'bi-arrow-right-circle-fill'
    },
    {
      step: 5,
      id: 'sub-main',
      title: {
        en: 'Sub-Main Line & Valves',
        mr: 'उप-मुख्य वाहिनी व व्हॉल्व्ह (Sub-Main Line)',
        hi: 'उप-मुख्य पाइप व वाल्व (Sub-Main Line)'
      },
      role: {
        en: 'The Traffic Controller: Sector-Wise Pressure Distributor',
        mr: 'वाहतूक नियंत्रक: शेताच्या प्रत्येक तुकड्याचे पाणी नियोजन',
        hi: 'ट्रैफिक नियंत्रक: खेत के अलग-अलग भागों में पानी का वितरण'
      },
      farmerExplanation: {
        en: 'The sub-main branches off perpendicular to the main line, running across individual field blocks. Equipped with control ball valves, it allows the farmer to divide a large farm into manageable shifts or zones based on available pump capacity.',
        mr: 'उप-मुख्य लाईन ही मुख्य पाईपला काटकोनात जोडलेली असते. यावर बॉल व्हॉल्व्ह (नळ) बसवलेले असतात, ज्यामुळे शेतकरी आपल्या संपूर्ण शेताचे १-१ किंवा २-२ एकराचे भाग करून आळीपाळीने पाणी देऊ शकतो.',
        hi: 'सब-मेन पाइप मुख्य लाइन से जुड़ा होता है। इस पर कंट्रोल वाल्व लगे होते हैं, जिससे किसान अपने पूरे खेत को अलग-अलग हिस्सों में बांटकर बारी-बारी से पानी दे सकता है।'
      },
      farmerTip: {
        en: 'Install an air release valve and a flush valve at the end of every sub-main line. Opening it regularly purges trapped air and accumulated pipe scale.',
        mr: 'प्रत्येक सब-मेनच्या शेवटी फ्लश व्हॉल्व्ह नक्की बसवा. तो उघडून पाईपलाईनमध्ये साचलेला गाळ वेळोवेळी बाहेर काढता येतो.',
        hi: 'हर सब-मेन के अंत में फ्लश वाल्व जरूर लगाएं, जिससे पाइप में जमा गाद और फंसी हवा आसानी से बाहर निकाली जा सके।'
      },
      keyChecks: {
        en: ['Operate control valves smoothly without water hammer', 'Flush sub-main lines before connecting laterals', 'Check grommets and take-off connectors for leakages'],
        mr: ['व्हॉल्व्ह हळूच उघडा आणि बंद करा जेणेकरून पाईपवर धक्का (Water Hammer) बसणार नाही', 'लॅटरल जोडण्यापूर्वी सब-मेनमधून पाणी सोडून गाळ काढा', 'टेक-ऑफ आणि रबर बुशमधून पाणी गळत नाही ना ते पहा'],
        hi: ['वाल्व को धीरे-धीरे खोलें व बंद करें ताकि पाइप पर झटका न लगे', 'लेटरल जोड़ने से पहले सब-मेन का पानी बहाकर कचरा निकालें', 'रबर ग्रोमेट और कनेक्टर से लीकेज की जांच करें']
      },
      icon: 'bi-diagram-3-fill'
    },
    {
      step: 6,
      id: 'laterals',
      title: {
        en: 'Laterals & Sprinklers / Emitters',
        mr: 'लॅटरल पाईप्स व ड्रिपर्स / तुषार (Laterals & Emitters)',
        hi: 'लेटरल पाइप व ड्रिपर्स / स्प्रिंकलर (Laterals & Emitters)'
      },
      role: {
        en: 'The Delivery Agents: Direct Field Application',
        mr: 'वितरण कर्मचारी: थेट पिकाच्या ओळीत पाण्याचा अचूक पुरवठा',
        hi: 'वितरण एजेंट: पौधों की कतार में सीधे सटीक पानी पहुंचाना'
      },
      farmerExplanation: {
        en: 'Flexible UV-stabilized LDPE pipes (usually 12mm or 16mm diameter) are laid directly along each crop row. Inline or online drippers discharge measured droplets at precise spacing, or risers throw spray over the plants.',
        mr: '१२ किंवा १६ मिमी जाडीच्या लवचिक काळ्या नळ्या पिकांच्या ओळीत अंथरल्या जातात. यामध्ये ठराविक अंतरावर बसवलेले ड्रिपर्स पिकाच्या गरजेनुसार थेंब-थेंब पाणी जमिनीवर सोडतात.',
        hi: '१२ या १६ मिमी की लचीली काली नलियां पौधों की कतार में बिछाई जाती हैं। इनमें लगे ड्रिपर्स या नोजल पौधों की जरूरत के अनुसार बूंद-बूंद या फुहार के रूप में पानी गिराते हैं।'
      },
      farmerTip: {
        en: 'Keep laterals straight along the planting rows. In summer, open the tail-end figure-8 flush caps every fortnight for 2 minutes while the pump runs to clear sediments.',
        mr: 'नळ्या नेहमी सरळ रेषेत ठेवा. दर १५ दिवसांनी नळीचे शेवटचे टोक (End Cap) उघडून पंप चालू असताना २ मिनिटे पाणी वाहू द्या, जेणेकरून साचलेली माती निघून जाईल.',
        hi: 'नलियों को कतार में सीधा बिछाएं। हर १५ दिन में अंतिम छोर की एंड-कैप खोलकर २ मिनट पानी बहाएं ताकि अंदर जमा मिट्टी साफ हो जाए।'
      },
      keyChecks: {
        en: ['Check for uniform dripping across first and last plant', 'Repair pin-hole punctures with joiners', 'Inspect for rat chewing or tractor wheel pinch marks'],
        mr: ['पहिल्या आणि शेवटच्या झाडापाशी समान पाणी पडते का ते तपासा', 'नळीला भोक पडल्यास जॉईनर वापरून जोडून घ्या', 'उंदीर किंवा घूस यांनी नळी कुरतडली आहे का ते पहा'],
        hi: ['पहले और आखिरी पौधे के पास एकसमान पानी टपकने की जांच करें', 'छेद होने पर तुरंत जॉइनर लगाकर जोड़ें', 'चूहों द्वारा पाइप काटे जाने की नियमित जांच करें']
      },
      icon: 'bi-shuffle'
    },
    {
      step: 7,
      id: 'root-zone',
      title: {
        en: 'Crop Root Zone',
        mr: 'पिकांचे मूळ क्षेत्र (Crop Root Zone)',
        hi: 'फसल की जड़ का क्षेत्र (Crop Root Zone)'
      },
      role: {
        en: 'The Destination: Maximum Nutrient & Water Uptake',
        mr: 'अंतिम मुक्काम: पिकाच्या मुळांकडून पाणी व खतांचे १००% शोषण',
        hi: 'अंतिम मंजिल: जड़ों द्वारा पानी और पोषक तत्वों का संपूर्ण अवशोषण'
      },
      farmerExplanation: {
        en: 'The final destination! Water enters the active root zone soil without wetting unwanted weeds or evaporating in the hot sun. Plant roots take up moisture and dissolved fertigation nutrients effortlessly with zero energy loss.',
        mr: 'हा सिंचनाचा अंतिम उद्देश आहे! पाणी थेट पिकाच्या मुळांच्या कार्यक्षेत्रात मुरते. सूर्यप्रकाशात पाण्याचे बाष्पीभवन होत नाही आणि पिकाची मुळे आवश्यक तेवढे पाणी व विरघळलेली खते सहज शोषून घेतात.',
        hi: 'यह पूरी प्रणाली की अंतिम मंजिल है! पानी सीधे पौधों की जड़ों में पहुंचता है, जिससे धूप में पानी भाप बनकर नहीं उड़ता और जड़ें आसानी से पानी व खाद सोखकर तेजी से बढ़ती हैं।'
      },
      farmerTip: {
        en: 'Perform the simple finger test: push your index finger 3 to 4 inches into the soil under the dripper. If it feels moist and cool, irrigation was sufficient. Never over-irrigate to root saturation.',
        mr: 'बोटाने तपासा: झाडाच्या बुंध्याजवळ ३-४ इंच बोट जमिनीत खुपसून पहा. माती ओली व थंड वाटल्यास पाणी पुरेसे झाले आहे. अति पाणी दिल्यास मुळे सडतात.',
        hi: 'उंगली से नमी जांचें: पौधे की जड़ के पास ३-४ इंच उंगली डालकर देखें। यदि मिट्टी नम और ठंडी लगे, तो सिंचाई पर्याप्त है। अधिक पानी देने से जड़ें सड़ सकती हैं।'
      },
      keyChecks: {
        en: ['Verify moisture depth matches effective root depth', 'Ensure no surface water pooling or runoff', 'Observe crop vigor, leaf turgidity, and healthy white root development'],
        mr: ['ओल पिकाच्या मुळांच्या खोलीपर्यंत पोहोचली आहे का ते पहा', 'झाडाभोवती पाण्याचे डबके साचू देऊ नका', 'पानांचा टवटवीतपणा आणि पांढऱ्या मुळांची वाढ तपासा'],
        hi: ['नमी की गहराई जड़ों तक पहुंचने की पुष्टि करें', 'पौधे के पास पानी का जमाव न होने दें', 'पौधों की चमक और सफेद जड़ों के विकास का निरीक्षण करें']
      },
      icon: 'bi-tree-fill'
    }
  ];

  // 4. "Which One Should I Choose?" Decision Engine
  function calculateRecommendation(criteria) {
    const { cropType, soilType, waterAvailability, farmSize } = criteria;

    let primaryIrrigationId = 'drip';
    let efficiencyBadge = '90% - 95% Efficiency';
    let waterSavingNote = {
      en: 'Saves 40% - 60% water compared to surface flooding',
      mr: 'पारंपरिक मोकळ्या पाण्यापेक्षा ४०% ते ६०% पाण्याची बचत',
      hi: 'पारंपरिक बाढ़ सिंचाई की तुलना में ४०% से ६०% पानी की बचत'
    };

    let rationale = { en: '', mr: '', hi: '' };
    let recommendedEquipment = [];
    let subsidyGuidance = { en: '', mr: '', hi: '' };
    let practicalTips = { en: [], mr: [], hi: [] };

    // Logic based on agronomic science
    if (cropType === 'orchard') {
      primaryIrrigationId = 'drip';
      efficiencyBadge = '95% Precision';
      rationale = {
        en: 'Fruit orchards benefit most from Online Pressure-Compensating (PC) Drip Irrigation. It delivers uniform water directly around tree rings, supports precise fertigation, and suppresses inter-row weeds.',
        mr: 'फळबागांसाठी ऑनलाइन प्रेशर-कॉम्पन्सेटिंग (PC) ठिबक सिंचन सर्वोत्तम आहे. यामुळे झाडाच्या आळ्यामध्ये नेमके पाणी मिळते, विद्राव्य खते देता येतात आणि मधल्या जागेत तण होत नाही.',
        hi: 'फलदार बगीचों के लिए ऑनलाइन प्रेशर-कंपनसेटिंग (PC) ड्रिप सबसे उपयुक्त है। यह सीधे पेड़ों के थाले में सटीक पानी पहुंचाता है, फर्टिगेशन संभव बनाता है और खरपतवार रोकता है।'
      };
    } else if (cropType === 'cereals') {
      if (waterAvailability === 'abundant' && soilType === 'clay') {
        primaryIrrigationId = 'surface-flood';
        efficiencyBadge = 'Gravity Basin Flow';
        rationale = {
          en: 'For wetland paddy with heavy clay soil and abundant water, traditional basin/border flood irrigation is suitable for puddling and standing water management.',
          mr: 'पाण्याची मुबलक उपलब्धता आणि भारी चिकण माती असल्यास भाताच्या खाचरासाठी पारंपरिक वाफे/पूर सिंचन योग्य ठरते.',
          hi: 'पर्याप्त पानी और भारी चिकनी मिट्टी होने पर धान की खेती के लिए पारंपरिक क्यारी/बाढ़ सिंचाई अनुकूल है।'
        };
      } else {
        primaryIrrigationId = 'sprinkler';
        efficiencyBadge = '80% - 85% Efficiency';
        rationale = {
          en: 'For close-growing cereal crops like wheat, barley, and gram, Sprinkler Irrigation simulates natural gentle rainfall across the entire field without dividing productive land with earthen channels.',
          mr: 'गहू, हरभरा आणि कडधान्ये यांसारख्या दाट पिकांसाठी तुषार सिंचन सर्वोत्तम आहे. हे संपूर्ण शेतावर नैसर्गिक पावसासारखे पाणी देते आणि पाटांचे बांध काढण्याची गरज नसते.',
          hi: 'गेहूं, चना और घनी फसलों के लिए स्प्रिंकलर (फव्वारा) सिंचाई सबसे अच्छी है। यह पूरे खेत में प्राकृतिक बारिश की तरह पानी देती है और मेड़ें बनाने की जरूरत नहीं पड़ती।'
        };
      }
    } else if (cropType === 'row-crops') {
      if (waterAvailability === 'scarce' || soilType === 'sandy' || soilType === 'rocky') {
        primaryIrrigationId = 'drip';
        efficiencyBadge = '90% - 95% Efficiency';
        rationale = {
          en: 'Row crops like cotton and sugarcane yield 25-35% higher with Inline Drip Irrigation. In water-scarce regions, it minimizes evaporation and enables regular fertigation.',
          mr: 'कापूस आणि ऊस यांसारख्या ओळीतील पिकांसाठी इनलाईन ठिबक सिंचन अत्यंत फायदेशीर आहे. पाण्याच्या टंचाईत बाष्पीभवन रोखते आणि उत्पादनात २५% ते ३५% वाढ करते.',
          hi: 'कपास और गन्ने जैसी कतारबद्ध फसलों के लिए इनलाइन ड्रिप सर्वोत्तम है। पानी की कमी में यह वाष्पीकरण रोककर पैदावार में २५-३५% की वृद्धि करता है।'
        };
      } else {
        primaryIrrigationId = 'furrow';
        efficiencyBadge = '65% - 70% Efficiency';
        rationale = {
          en: 'Broad Bed and Furrow (BBF) irrigation is suitable for row crops in moderate water availability. Crops on ridges stay well-aerated while water moves efficiently down furrows.',
          mr: 'पाण्याची मध्यम उपलब्धता असल्यास सऱ्या-वरंबे (Furrow) पद्धत फायदेशीर ठरते. पिकाचे खोड कोरडे राहते आणि मुळांना भरपूर हवा व पाणी मिळते.',
          hi: 'पानी की मध्यम उपलब्धता होने पर कूंड़ (फरो) सिंचाई अनुकूल है। मेड़ों पर बोई गई फसल के तने सुरक्षित रहते हैं और नालियों से पानी जड़ों तक पहुंचता है।'
        };
      }
    } else if (cropType === 'vegetables') {
      if (waterAvailability === 'scarce') {
        primaryIrrigationId = 'drip';
        efficiencyBadge = '90% - 95% Precision';
        rationale = {
          en: 'Vegetables have shallow root systems and high moisture sensitivity. Inline Drip Irrigation with mulching film provides the ideal root zone moisture balance and prevents fruit rot.',
          mr: 'भाजीपाल्याची मुळे उथळ असतात. मल्चिंग पेपरसोबत इनलाईन ठिबक सिंचन वापरल्यास मातीत सतत योग्य ओल राहते आणि फळे सडत नाहीत.',
          hi: 'सब्जियों की जड़ें उथली होती हैं। मल्चिंग पेपर के साथ इनलाइन ड्रिप लगाने से मिट्टी में नमी का संतुलन बना रहता है और फल सड़ने से बचते हैं।'
        };
      } else {
        primaryIrrigationId = 'micro-irrigation';
        efficiencyBadge = '85% - 90% Efficiency';
        rationale = {
          en: 'Micro-sprinklers are ideal for vegetable beds, onion, garlic, and leafy greens. They cool the canopy microclimate in summer without disturbing fragile seeds.',
          mr: 'कांदा, लसूण, पालेभाज्या आणि गादी वाफ्यांसाठी मायक्रो-स्प्रिंकलर उत्तम आहेत. हे उन्हाळ्यात तापमान थंड ठेवतात आणि नाजूक रोपांचे नुकसान होत नाही.',
          hi: 'प्याज, लहसुन, पत्तेदार सब्जियों और क्यारियों के लिए माइक्रो-स्प्रिंकलर सबसे अच्छा है। यह गर्मियों में खेत को ठंडा रखता है और छोटे पौधों को नुकसान नहीं पहुंचाता।'
        };
      }
    } else if (cropType === 'pulses') {
      primaryIrrigationId = 'sprinkler';
      efficiencyBadge = '80% - 85% Efficiency';
      rationale = {
        en: 'Pulses (gram, soybean, moong) are sensitive to waterlogging. Light, uniform sprinkler irrigation at critical flowering and pod-filling stages maximizes seed setting without rotting roots.',
        mr: 'कडधान्ये (हरभरा, मूग, सोयाबीन) जास्त पाण्याला संवेदनशील असतात. फुलोरा आणि शेंगा भरण्याच्या टप्प्यावर तुषार सिंचनाने हलके पाणी दिल्यास उत्कृष्ट दाणे भरतात.',
        hi: 'दलहनी फसलें (चना, मूंग, सोयाबीन) जलभराव सहन नहीं कर सकतीं। फूल और फली बनने के समय स्प्रिंकलर से हल्की सिंचाई करने पर भरपूर पैदावार मिलती है।'
      };
    } else if (cropType === 'fodder') {
      if (farmSize === 'large' || farmSize === 'medium') {
        primaryIrrigationId = 'rain-gun';
        efficiencyBadge = '75% - 80% High Capacity';
        rationale = {
          en: 'For large fodder grass and maize silage plots, Rain Gun Irrigation covers up to 1.5 acres from a single point, slashing manual pipe-shifting labor.',
          mr: 'मोठ्या क्षेत्रावरील चारा पिकांसाठी रेन गन सिंचन सर्वोत्तम आहे. एकाच ठिकाणाहून १ ते १.५ एकर क्षेत्र झटपट भिजते आणि मजुरीची बचत होते.',
          hi: 'बड़े पैमाने पर चारे और मक्का की खेती के लिए रेन गन सिंचाई बेहतरीन है। एक ही जगह से १ से १.५ एकड़ खेत जल्दी सिंचित हो जाता है।'
        };
      } else {
        primaryIrrigationId = 'sprinkler';
        efficiencyBadge = '80% Efficiency';
        rationale = {
          en: 'Portable sprinkler sets ensure even moisture across fodder grass plots, promoting dense green regrowth after each cut.',
          mr: 'चारा पिकांच्या प्रत्येक कापणीनंतर फुटव्यांची भरघोस वाढ होण्यासाठी तुषार सिंचन अतिशय फायदेशीर ठरते.',
          hi: 'चारे की हर कटाई के बाद नए कल्ले तेजी से फूटने के लिए स्प्रिंकलर सिंचाई सबसे उपयुक्त है।'
        };
      }
    }

    // Equipment Recommendation matching Farm Size
    if (farmSize === 'marginal') {
      recommendedEquipment = [
        {
          id: 'power-tiller',
          name: { en: '12-15 HP Power Tiller', mr: '१२-१५ HP पॉवर टिलर', hi: '१२-१५ HP पावर टिलर' },
          note: { en: 'Compact, low fuel cost, ideal for < 2 acres and narrow plots.', mr: 'कमी डिझेल खर्च, २ एकरापेक्षा कमी शेतासाठी आणि सऱ्या पाडण्यासाठी योग्य.', hi: 'कम ईंधन खर्च, २ एकड़ से छोटे खेतों और क्यारियों के लिए आदर्श।' }
        },
        {
          id: 'sprayer',
          name: { en: '16L Battery Knapsack Sprayer', mr: '१६ लिटर बॅटरी फवारणी पंप', hi: '१६ लीटर बैटरी स्प्रेयर' },
          note: { en: 'Effortless spraying with 12V rechargeable battery.', mr: 'शारीरिक श्रमाशिवाय सहज फवारणी, ५ तास बॅकअप.', hi: 'बिना शारीरिक थकान के आसान छिड़काव, ५ घंटे बैकअप।' }
        },
        {
          id: 'water-pump',
          name: { en: '3 HP Solar / Submersible Pump', mr: '३ HP सोलर किंवा पाणबुडी पंप', hi: '३ HP सोलर या सबमर्सिबल पंप' },
          note: { en: 'Affordable power matched to micro-drip kits.', mr: 'लहान ठिबक संचासाठी पुरेसा पाण्याचा विसर्ग.', hi: 'छोटे ड्रिप सेट के लिए पर्याप्त पानी का दबाव।' }
        }
      ];
    } else if (farmSize === 'small') {
      recommendedEquipment = [
        {
          id: 'power-tiller',
          name: { en: 'Power Tiller or 25-35 HP Mini Tractor', mr: 'पॉवर टिलर किंवा २५-३५ HP मिनी ट्रॅक्टर', hi: 'पावर टिलर या २५-३५ HP मिनी ट्रैक्टर' },
          note: { en: 'Multi-purpose tillage, bed making, and small trailer haulage.', mr: 'नांगरणी, सरी पाडणे आणि शेतमाल वाहतुकीसाठी उत्तम.', hi: 'जुताई, मेड़ बनाने और छोटी ट्रॉली ढुलाई के लिए उपयुक्त।' }
        },
        {
          id: 'cultivator',
          name: { en: '7 or 9-Tine Cultivator', mr: '७ किंवा ९ फाळांचा कल्टिव्हेटर', hi: '७ या ९ टाइन का कल्टीवेटर' },
          note: { en: 'Fast secondary tillage and inter-row weeding.', mr: 'पेरणीपूर्व ढेकळे फोडणे आणि तण काढणे.', hi: 'बुवाई पूर्व जुताई और खरपतवार निकालने के लिए।' }
        },
        {
          id: 'water-pump',
          name: { en: '5 HP Submersible / Solar Pump', mr: '५ HP सबमर्सिबल / सोलर पंप', hi: '५ HP सबमर्सिबल / सोलर पंप' },
          note: { en: 'Operates 2-3 acres of drip or 8-10 sprinklers per shift.', mr: '२-३ एकर ठिबक किंवा एका वेळी ८-१० स्प्रिंकलर चालवण्यासाठी योग्य.', hi: '२-३ एकड़ ड्रिप या एक बार में ८-१० फव्वारे चलाने के लिए पर्याप्त।' }
        }
      ];
    } else if (farmSize === 'medium') {
      recommendedEquipment = [
        {
          id: 'tractor',
          name: { en: '40-50 HP 4-Stroke Tractor', mr: '४०-५० HP शक्तिशाली ट्रॅक्टर', hi: '४०-५० HP शक्तिशाली ट्रैक्टर' },
          note: { en: 'Handles rotavators, heavy ploughs, and seed drills effortlessly.', mr: 'रोटाव्हेटर, नांगर आणि पेरणी यंत्र सहज चालवतो.', hi: 'रोटावेटर, हल और सीड ड्रिल आसानी से चलाता है।' }
        },
        {
          id: 'rotavator',
          name: { en: '5.5 or 6 Feet Rotary Tiller', mr: '५.५ किंवा ६ फूट रोटाव्हेटर', hi: '५.५ या ६ फीट रोटावेटर' },
          note: { en: 'Prepares fine pulverized seedbeds in a single field pass.', mr: 'एकाच फेरीत माती भुसभुशीत करून पेरणीयोग्य करतो.', hi: 'एक ही चक्कर में मिट्टी को भुरभुरा बनाकर बुवाई योग्य करता है।' }
        },
        {
          id: 'seed-drill',
          name: { en: '9 or 11-Row Seed-cum-Fertilizer Drill', mr: '९ किंवा ११ दात्यांचे पेरणी यंत्र', hi: '९ या ११ लाइन का सीड ड्रिल' },
          note: { en: 'Precise seed rate and balanced basal fertilizer placement.', mr: 'बियाणे व खताची योग्य अंतरावर आणि खोलीवर अचूक पेरणी.', hi: 'बीज और खाद को सही दूरी व गहराई पर डालने के लिए।' }
        },
        {
          id: 'thresher',
          name: { en: 'Multi-Crop Mechanical Thresher', mr: 'मल्टी-क्रॉप मळणी यंत्र', hi: 'मल्टी-क्रॉप थ्रेशर' },
          note: { en: 'Processes 1,000 - 1,500 kg grain per hour with clean straw separation.', mr: 'ताशी १,००० ते १,५०० किलो धान्य स्वच्छ मळणी करतो.', hi: 'प्रति घंटा १,००० से १,५०० किलो अनाज की साफ मड़ाई करता है।' }
        }
      ];
    } else {
      // Large farm
      recommendedEquipment = [
        {
          id: 'tractor',
          name: { en: '55-65+ HP 4WD Heavy Tractor', mr: '५५-६५+ HP ४-व्हील ड्राईव्ह ट्रॅक्टर', hi: '५५-६५+ HP ४-व्हील ड्राइव्ह भारी ट्रैक्टर' },
          note: { en: 'High tractive power for heavy implements, lasers, and haulage.', mr: 'मोठ्या अवजारांसाठी आणि जलद मशागतीसाठी सर्वोच्च ताकद.', hi: 'बड़े उपकरणों और तेज जुताई के लिए उच्चतम शक्ति।' }
        },
        {
          id: 'harvester',
          name: { en: 'Self-Propelled Combine Harvester (or Custom Hire)', mr: 'कम्बाईन हार्वेस्टर (किंवा भाडेतत्त्वावर)', hi: 'कंबाइन हार्वेस्टर (या किराए पर)' },
          note: { en: 'Harvests, threshes, and winnows 10-15 acres per day.', mr: 'दररोज १० ते १५ एकर पिकाची एकाच वेळी कापणी व मळणी.', hi: 'प्रतिदिन १० से १५ एकड़ फसल की एक साथ कटाई और मड़ाई।' }
        },
        {
          id: 'sprayer',
          name: { en: 'Tractor-Mounted 400L-600L Boom Sprayer', mr: 'ट्रॅक्टर-माऊंटेड बूम स्प्रेयर (४००-६०० लिटर)', hi: 'ट्रैक्टर-माउंटेड बूम स्प्रेयर (४००-६०० लीटर)' },
          note: { en: 'Covers 10-12 meter swath width, spraying up to 25 acres per day.', mr: '१०-१२ मीटर रुंदीमध्ये फवारणी, दररोज २०-२५ एकर कव्हर करतो.', hi: '१०-१२ मीटर चौड़ाई में छिड़काव, रोजाना २०-२५ एकड़ कवर करता है।' }
        },
        {
          id: 'water-pump',
          name: { en: '7.5 - 10 HP Multi-Stage Pump & Filtration Bank', mr: '७.५ ते १० HP पंप व ऑटोमॅटिक फिल्टर बँक', hi: '७.५ से १० HP पंप व ऑटोमेटिक फिल्टर बैंक' },
          note: { en: 'Operates multi-zone automated drip or rain guns with ease.', mr: 'मोठ्या क्षेत्रावर स्वयंचलित ठिबक किंवा रेन गन चालवण्यासाठी आवश्यक.', hi: 'बड़े क्षेत्र में स्वचालित ड्रिप या रेन गन चलाने के लिए आवश्यक।' }
        }
      ];
    }

    // Subsidy Guidance
    subsidyGuidance = {
      en: 'Government Support: Eligible for 45% - 55% financial assistance under PMKSY (Pradhan Mantri Krishi Sinchayee Yojana - Per Drop More Crop). Small and marginal farmers in Maharashtra receive up to 75-80% subsidy via MahaDBT portal. Farm machinery qualifies for 40-50% subsidy under SMAM (Sub-Mission on Agricultural Mechanization).',
      mr: 'शासकीय योजना: प्रधानमंत्री कृषी सिंचन योजना (PMKSY) अंतर्गत ठिबक व तुषार सिंचनासाठी ४५% ते ५५% अनुदान मिळते. महाराष्ट्रातील अल्प व अत्यल्प भूधारक शेतकऱ्यांना महाडीबीटी (MahaDBT) पोर्टलद्वारे ७५% ते ८०% पर्यंत अनुदान मिळते. अवजारांसाठी कृषी यांत्रिकीकरण उपअभियान (SMAM) अंतर्गत ४०% ते ५०% अनुदान उपलब्ध आहे.',
      hi: 'सरकारी सहायता: प्रधानमंत्री कृषि सिंचाई योजना (PMKSY) के तहत ड्रिप और स्प्रिंकलर पर ४५% से ५५% तक सब्सिडी मिलती है। छोटे व सीमांत किसानों को राज्य पोर्टल द्वारा अतिरिक्त अनुदान मिलता है। कृषि उपकरणों की खरीद पर कृषि यंत्रीकरण उप-मिशन (SMAM) के तहत ४०% से ५०% तक वित्तीय सहायता उपलब्ध है।'
    };

    practicalTips = {
      en: [
        'Always conduct a certified soil and water testing analysis before sizing drip lateral discharge rates.',
        'Choose ISI-marked (BIS certified) pipes and drippers to ensure longevity under strong Indian sun exposure.',
        'Consider Custom Hiring Centers (CHC) for expensive seasonal equipment like Harvesters and Multi-Crop Threshers.'
      ],
      mr: [
        'ठिबक संच बसवण्यापूर्वी शेतातील माती व पाण्याचे परीक्षण प्रयोगशाळेतून नक्की करून घ्या.',
        'नेहमी आयएसआय (ISI) प्रमाणित पाइप्स आणि ड्रिपर्स वापरा, जेणेकरून उन्हात नळ्या खराब होत नाहीत.',
        'हार्वेस्टर आणि थ्रेशर यांसारखी महागडी अवजारे स्वतः विकत घेण्याऐवजी कृषी सेवा केंद्र किंवा भाडेतत्त्वावर (CHC) घेणे फायदेशीर ठरते.'
      ],
      hi: [
        'ड्रिप लगाने से पहले खेत की मिट्टी और पानी की जांच अवश्य करवाएं।',
        'हमेशा आईएसआई (ISI) प्रमाणित पाइप और ड्रिपर्स खरीदें ताकि तेज धूप में खराब न हों।',
        'हार्वेस्टर और थ्रेशर जैसी बड़ी मशीनें खरीदने के बजाय कस्टम हायरिंग सेंटर (CHC) से किराए पर लेना किफायती होता है।'
      ]
    };

    const primaryIrrigationItem = IRRIGATION_TYPES.find(i => i.id === primaryIrrigationId) || IRRIGATION_TYPES[0];

    const authoritativeSource = {
      institution: {
        en: 'ICAR Package of Practices, State Agricultural Universities (SAUs) & MahaDBT Agriculture Schemes',
        mr: 'भारतीय कृषी संशोधन परिषद (ICAR), राज्य कृषी विद्यापीठे (MPKV/PDKV/VNMKV) व महाडीबीटी कृषी योजना',
        hi: 'भारतीय कृषि अनुसंधान परिषद (ICAR), राज्य कृषि विश्वविद्यालय एवं महाडीबीटी कृषि योजनाएं'
      },
      referenceDocument: {
        en: 'PMKSY Guidelines & State Agriculture Mechanization Norms',
        mr: 'प्रधानमंत्री कृषी सिंचन योजना मार्गदर्शक तत्त्वे व राज्य कृषी यांत्रिकीकरण नियम',
        hi: 'प्रधानमंत्री कृषि सिंचाई योजना दिशानिर्देश एवं राज्य कृषि यंत्रीकरण मानक'
      },
      portalName: 'mahadbt.maharashtra.gov.in / pmksy.gov.in',
      portalUrl: 'https://mahadbt.maharashtra.gov.in',
      standardCode: 'PMKSY / SMAM Guidelines'
    };

    const unavailableInfoNotice = {
      en: 'Subsidy sanction percentages and component grants depend on applicant land category (Small/Marginal/SC/ST/General), annual budgetary allocation, and MahaDBT online lottery approval. Verify directly on the official portal before purchase.',
      mr: 'अनुदानाचे प्रमाण आणि मंजुरी अर्जदाराचा शेतकरी प्रवर्ग (अल्प/अत्यल्प/अनु.जाती/जमाती/सर्वसाधारण), वार्षिक अर्थसंकल्पीय तरतूद आणि महाडीबीटी ऑनलाइन सोडतीवर अवलंबून असते. खरेदीपूर्वी अधिकृत पोर्टलवर खात्री करावी.',
      hi: 'सब्सिडी प्रतिशत और स्वीकृति किसान वर्ग (लघु/सीमांत/अजा/अजजा/सामान्य), वार्षिक बजट और महाडीबीटी लॉटरी पर निर्भर करती है। उपकरण खरीदने से पहले आधिकारिक पोर्टल पर अवश्य जांचें।'
    };

    return {
      primaryIrrigationId,
      primaryIrrigationName: primaryIrrigationItem.name,
      efficiencyBadge,
      waterSavingNote,
      rationale,
      recommendedEquipment,
      subsidyGuidance,
      practicalTips,
      authoritativeSource,
      unavailableInfoNotice
    };
  }

  
  // Authoritative Agriculture Sources (ICAR, CIAE Bhopal, IARI, MoA&FW, PMKSY, BIS, MahaKrishi)
  const EQUIPMENT_AUTHORITATIVE_METADATA = {
    'tractor': {
      authoritativeSource: {
        institution: {
          en: 'ICAR - Central Institute of Agricultural Engineering (CIAE), Bhopal & MoA&FW',
          mr: 'भारतीय कृषी संशोधन परिषद - केंद्रीय कृषी अभियांत्रिकी संस्था (CIAE), भोपाळ व कृषी मंत्रालय',
          hi: 'भारतीय कृषि अनुसंधान परिषद - केंद्रीय कृषि अभियांत्रिकी संस्थान (CIAE), भोपाल एवं कृषि मंत्रालय'
        },
        referenceDocument: {
          en: 'CIAE Farm Machinery Directory & CMVR / BIS Standards',
          mr: 'सीआयएई कृषी यंत्रसामग्री निर्देशिका व बीआयएस मानके',
          hi: 'सीआईएई कृषि मशीनरी निर्देशिका एवं बीआईएस मानक'
        },
        portalName: 'agrimachinery.nic.in',
        portalUrl: 'https://agrimachinery.nic.in',
        standardCode: 'BIS IS 12207 / IS 12288'
      },
      unavailableInfoNotice: {
        en: 'Hourly diesel consumption and custom hiring rental rates vary with soil compaction, implement draft, and local market rates. Contact your local Krishi Vigyan Kendra (KVK) or Custom Hiring Centre (CHC) for village-specific estimates rather than estimating.',
        mr: 'ताशी डिझेलचा वापर आणि भाडेतत्त्वावरील दर जमिनीचा घट्टपणा, अवजाराचा प्रकार आणि स्थानिक बाजारभावानुसार बदलतात. अचूक माहितीसाठी स्थानिक कृषी विज्ञान केंद्र (KVK) किंवा अवजार बँकेशी संपर्क साधावा.',
        hi: 'प्रति घंटा डीजल की खपत और किराए की दरें मिट्टी के प्रकार, उपकरण के खिंचाव और स्थानीय बाजार दरों पर निर्भर करती हैं। सटीक विवरण के लिए नजदीकी कृषि विज्ञान केंद्र (KVK) से संपर्क करें।'
      }
    },
    'cultivator': {
      authoritativeSource: {
        institution: {
          en: 'ICAR - Central Institute of Agricultural Engineering (CIAE), Bhopal & SMAM',
          mr: 'केंद्रीय कृषी अभियांत्रिकी संस्था (CIAE), भोपाळ व कृषी यांत्रिकीकरण उप-अभियान (SMAM)',
          hi: 'केंद्रीय कृषि अभियांत्रिकी संस्थान (CIAE), भोपाल एवं कृषि यंत्रीकरण उप-मिशन (SMAM)'
        },
        referenceDocument: {
          en: 'CIAE Technical Bulletin on Secondary Tillage Equipment',
          mr: 'सीआयएई दुय्यम मशागत अवजारे तांत्रिक माहिती पुस्तिका',
          hi: 'सीआईएई द्वितीयक जुताई उपकरण तकनीकी बुलेटिन'
        },
        portalName: 'ciae.icar.gov.in',
        portalUrl: 'https://ciae.icar.gov.in',
        standardCode: 'BIS IS 3342'
      },
      unavailableInfoNotice: {
        en: 'Field capacity (acres/day) and shovel tip wear rates depend on soil stone fraction and moisture. Verify local operational output with your Taluka Agriculture Officer (TAO) or KVK.',
        mr: 'प्रतिदिन कामाचे क्षेत्रफळ आणि फाळांची झीज जमिनीतील खडे व ओलावा यावर अवलंबून असते. स्थानिक माहितीसाठी तालुका कृषी अधिकारी किंवा केव्हीकेशी संपर्क साधा.',
        hi: 'प्रतिदिन कार्य क्षमता और टाइन के घिसने की दर मिट्टी में कंकड़ और नमी पर निर्भर करती है। स्थानीय विवरण के लिए कृषि अधिकारी या केवीके से पुष्टि करें।'
      }
    },
    'rotavator': {
      authoritativeSource: {
        institution: {
          en: 'ICAR - Central Institute of Agricultural Engineering (CIAE), Bhopal & MoA&FW',
          mr: 'केंद्रीय कृषी अभियांत्रिकी संस्था (CIAE), भोपाळ व कृषी आणि शेतकरी कल्याण मंत्रालय',
          hi: 'केंद्रीय कृषि अभियांत्रिकी संस्थान (CIAE), भोपाल एवं कृषि व किसान कल्याण मंत्रालय'
        },
        referenceDocument: {
          en: 'CIAE Testing Protocols & Minimum Performance Standards for Rotary Tillers',
          mr: 'रोटरी टिलर चाचणी पद्धती व किमान कार्यक्षमता मानके',
          hi: 'रोटरी टिलर परीक्षण मानक एवं न्यूनतम प्रदर्शन मानदंड'
        },
        portalName: 'agrimachinery.nic.in',
        portalUrl: 'https://agrimachinery.nic.in',
        standardCode: 'BIS IS 6690 / IS 11531'
      },
      unavailableInfoNotice: {
        en: 'Rotor blade wear life and gearbox oil temperature depend on soil quartz content and trash load. Replacement intervals vary by district agro-climatic conditions.',
        mr: 'रोटाव्हेटरच्या ब्लेडचे आयुष्य जमिनीतील वाळूचे प्रमाण व पिकांचे अवशेष यावर अवलंबून असते. ब्लेड बदलण्याचा कालावधी स्थानिक जमिनीनुसार बदलतो.',
        hi: 'रोटावेटर ब्लेड का जीवनकाल मिट्टी में रेत/क्वार्ट्ज और अवशेषों की मात्रा पर निर्भर करता है। ब्लेड बदलने की अवधि स्थानीय परिस्थितियों अनुसार भिन्न हो सकती है।'
      }
    },
    'seed-drill': {
      authoritativeSource: {
        institution: {
          en: 'ICAR - Indian Agricultural Research Institute (IARI), New Delhi & ICAR - CIAE Bhopal',
          mr: 'भारतीय कृषी संशोधन संस्था (IARI), नवी दिल्ली व सीआयएई भोपाळ',
          hi: 'भारतीय कृषि अनुसंधान संस्थान (IARI), नई दिल्ली एवं सीआईएई भोपाल'
        },
        referenceDocument: {
          en: 'IARI Sowing Machinery Protocols & CIAE Seed-cum-Fertilizer Drill Testing Guide',
          mr: 'आयएआरआय पेरणी यंत्र मार्गदर्शक व सीआयएई चाचणी नियमावली',
          hi: 'आईएआरआई बुवाई मशीन प्रोटोकॉल एवं सीआईएई बीज-सह-उर्वरक ड्रिल परीक्षण गाइड'
        },
        portalName: 'iari.res.in',
        portalUrl: 'https://iari.res.in',
        standardCode: 'BIS IS 6813'
      },
      unavailableInfoNotice: {
        en: 'Seed calibration index (fluted roller setting) is specific to seed variety, seed treatment coating, and 1000-grain weight. Farmers must perform stationary calibration on-field with their actual seed lot before sowing.',
        mr: 'बियाण्याचे प्रमाण (कॅलिब्रेशन) बियाण्याचा वाण, बीजप्रक्रिया आणि बियांच्या आकारावर अवलंबून असते. प्रत्यक्ष पेरणीपूर्वी चाचणी कॅलिब्रेशन करणे आवश्यक आहे.',
        hi: 'बीज दर का पैमाना बीज की किस्म, बीज उपचार और दाने के आकार पर निर्भर करता है। खेत में बुवाई से पहले अपने वास्तविक बीज से अंशांकन (कैलिब्रेशन) अवश्य करें।'
      }
    },
    'plough': {
      authoritativeSource: {
        institution: {
          en: 'ICAR - Central Institute of Agricultural Engineering (CIAE), Bhopal & State Agricultural Universities (SAUs)',
          mr: 'केंद्रीय कृषी अभियांत्रिकी संस्था (CIAE), भोपाळ व राज्य कृषी विद्यापीठे',
          hi: 'केंद्रीय कृषि अभियांत्रिकी संस्थान (CIAE), भोपाल एवं राज्य कृषि विश्वविद्यालय'
        },
        referenceDocument: {
          en: 'ICAR Package of Practices: Deep Primary Tillage Guidelines',
          mr: 'आयसीएआर खोल नांगरणी कार्यपद्धती मार्गदर्शिका',
          hi: 'आईसीएआर गहरी जुताई पैकेज ऑफ प्रैक्टिसेज दिशानिर्देश'
        },
        portalName: 'icar.org.in',
        portalUrl: 'https://icar.org.in',
        standardCode: 'BIS IS 6288'
      },
      unavailableInfoNotice: {
        en: 'Specific soil draft resistance ranges between 0.4 kg/cm² in light alluvial soils to over 0.9 kg/cm² in dry deep black cotton soil (Vertisols). Tractor power matching must be determined by local soil resistance.',
        mr: 'नांगर ओढण्यासाठी लागणारी शक्ती हलक्या जमिनीत ०.४ किलो/चौ.सेंमी तर काळ्या जमिनीत ०.९ किलो/चौ.सेंमीपेक्षा जास्त असू शकते. ट्रॅक्टरची निवड स्थानिक जमिनीनुसार करावी.',
        hi: 'जुताई के लिए आवश्यक खिंचाव हल्की मिट्टी में ०.४ किग्रा/सेमी² और गहरी काली मिट्टी में ०.९ किग्रा/सेमी² से अधिक होता है। ट्रैक्टर का चयन स्थानीय मिट्टी अनुसार करें।'
      }
    },
    'sprayer': {
      authoritativeSource: {
        institution: {
          en: 'Central Insecticide Board & Registration Committee (CIBRC) & ICAR - CIAE Bhopal',
          mr: 'केंद्रीय कीटकनाशक मंडळ आणि नोंदणी समिती (CIBRC) व सीआयएई भोपाळ',
          hi: 'केंद्रीय कीटनाशक बोर्ड एवं पंजीकरण समिति (CIBRC) एवं सीआईएई भोपाल'
        },
        referenceDocument: {
          en: 'CIBRC Safety Guidelines for Agricultural Sprayers & BIS Plant Protection Standards',
          mr: 'सीआयबीआरसी फवारणी सुरक्षा मार्गदर्शक व बीआयएस मानके',
          hi: 'सीआईबीआरसी छिड़काव सुरक्षा दिशानिर्देश एवं बीआईएस पौधे सुरक्षा मानक'
        },
        portalName: 'cibrc.gov.in',
        portalUrl: 'https://cibrc.gov.in',
        standardCode: 'BIS IS 3652 / IS 8480'
      },
      unavailableInfoNotice: {
        en: 'Chemical dilution dosages, nozzle pressure, and pre-harvest intervals (PHI) must strictly follow approved CIBRC product labels and SAU recommendations. Never estimate or guess pesticide dosages.',
        mr: 'रासायनिक औषध प्रमाण, पाण्याचे प्रमाण आणि सुरक्षित फवारणी अंतर नेहमी अधिकृत सीआयबीआरसी लेबल व कृषी विद्यापीठाच्या शिफारशीनुसारच ठेवावे. अंदाजाने औषध वापरू नये.',
        hi: 'दवा की मात्रा, पानी का अनुपात और कटाई पूर्व अंतराल हमेशा सीआईबीआरसी अनुमोदित लेबल और कृषि विश्वविद्यालय की अनुशंसा अनुसार ही रखें। कभी भी अनुमान से छिड़काव न करें।'
      }
    },
    'power-tiller': {
      authoritativeSource: {
        institution: {
          en: 'Northern Region Farm Machinery Training and Testing Institute (NRFMTTI) & ICAR - CIAE Bhopal',
          mr: 'उत्तर विभागीय कृषी यंत्रसामग्री प्रशिक्षण व चाचणी संस्था (NRFMTTI) व सीआयएई भोपाळ',
          hi: 'उत्तरी क्षेत्र कृषि मशीनरी प्रशिक्षण एवं परीक्षण संस्थान (NRFMTTI) एवं सीआईएई भोपाल'
        },
        referenceDocument: {
          en: 'NRFMTTI Commercial Test Reports & SMAM Operational Standards',
          mr: 'एनआरएफएमटीटीआय व्यावसायिक चाचणी अहवाल व एसएमएएम मानके',
          hi: 'एनआरएफएमटीटीआई वाणिज्यिक परीक्षण रिपोर्ट एवं एसएमएएम मानक'
        },
        portalName: 'nrfmtti.gov.in',
        portalUrl: 'https://nrfmtti.gov.in',
        standardCode: 'BIS IS 9980'
      },
      unavailableInfoNotice: {
        en: 'Puddling efficiency in wetland paddy and fuel burn rate depend on subsoil hardpan depth and clay percentage. Consult local KVK rice specialists for regional rotor gearing.',
        mr: 'भात खाचरातील चिखलणी आणि इंधनाचा वापर जमिनीतील थरावर अवलंबून असतो. योग्य गिअर निवडीसाठी स्थानिक कृषी विज्ञान केंद्रातील तज्ज्ञांचा सल्ला घ्यावा.',
        hi: 'धान के खेत में लेव (कादो) बनाने की क्षमता और ईंधन खपत मिट्टी की संरचना पर निर्भर करती है। उचित गियर चयन हेतु स्थानीय केवीके विशेषज्ञों से सलाह लें।'
      }
    },
    'harvester': {
      authoritativeSource: {
        institution: {
          en: 'ICAR - Central Institute of Agricultural Engineering (CIAE), Bhopal & MoA&FW',
          mr: 'केंद्रीय कृषी अभियांत्रिकी संस्था (CIAE), भोपाळ व कृषी मंत्रालय',
          hi: 'केंद्रीय कृषि अभियांत्रिकी संस्थान (CIAE), भोपाल एवं कृषि मंत्रालय'
        },
        referenceDocument: {
          en: 'ICAR Grain Harvesting Guidelines & Combine Loss Evaluation Protocols',
          mr: 'आयसीएआर धान्य काढणी मार्गदर्शक व नुकसान मूल्यांकन मानके',
          hi: 'आईसीएआर अनाज कटाई दिशानिर्देश एवं कंबाइन नुकसान मूल्यांकन मानक'
        },
        portalName: 'agrimachinery.nic.in',
        portalUrl: 'https://agrimachinery.nic.in',
        standardCode: 'BIS IS 15806'
      },
      unavailableInfoNotice: {
        en: 'Grain shattering loss is governed by crop moisture percentage at cutting time (optimum 14-16% for grain harvesting). Tehsil-level per-acre harvesting rates fluctuate dynamically during peak harvest season.',
        mr: 'काढणीच्या वेळी धान्यातील ओलाव्याचे प्रमाण (१४-१६% योग्य) महत्त्वाचे असते. पीक काढणीच्या हंगामात प्रति एकर भाडे दर स्थानिक मागणीनुसार बदलतात.',
        hi: 'कटाई के समय दाने में नमी (१४-१६% उपयुक्त) दाना झड़ने से रोकती है। कटाई के चरम मौसम में प्रति एकड़ किराए की दरें स्थानीय मांग अनुसार बदलती हैं।'
      }
    },
    'water-pump': {
      authoritativeSource: {
        institution: {
          en: 'Bureau of Energy Efficiency (BEE) & Ministry of New and Renewable Energy (MNRE PM-KUSUM)',
          mr: 'ऊर्जा कार्यक्षमता ब्युरो (BEE) व नवीन आणि नवीकरणीय ऊर्जा मंत्रालय (MNRE PM-KUSUM)',
          hi: 'ऊर्जा दक्षता ब्यूरो (BEE) एवं नवीन और नवीकरणीय ऊर्जा मंत्रालय (MNRE PM-KUSUM)'
        },
        referenceDocument: {
          en: 'BEE Standards & Labeling for Agricultural Pump Sets & PM-KUSUM Operational Guidelines',
          mr: 'बीईई कृषी पंप स्टार लेबलिंग मानके व पीएम-कुसुम योजना मार्गदर्शक तत्त्वे',
          hi: 'बीईई कृषि पंप स्टार लेबलिंग मानक एवं पीएम-कुसुम परिचालन दिशानिर्देश'
        },
        portalName: 'pmkusum.mnre.gov.in',
        portalUrl: 'https://pmkusum.mnre.gov.in',
        standardCode: 'BIS IS 8034 / IS 9079'
      },
      unavailableInfoNotice: {
        en: 'Discharge rate (liters per second) and power draw depend on static water level, drawdown depth, and pipeline friction head. A drawdown pump test on the borewell/well is mandatory before sizing the pump.',
        mr: 'पाण्याचा प्रवाह (लिटर/सेकंद) आणि विजेचा भार पाण्याच्या पातळीवर व पाईपमधील घर्षणावर अवलंबून असतो. पंप खरेदीपूर्वी विहिरीतील पाण्याची चाचणी घेणे गरजेचे आहे.',
        hi: 'पानी का डिस्चार्ज और बिजली की खपत जल स्तर, गिरावट और पाइपलाइन के दबाव पर निर्भर करती है। पंप स्थापित करने से पहले बोरवेल की जल क्षमता जांचना आवश्यक है।'
      }
    },
    'thresher': {
      authoritativeSource: {
        institution: {
          en: 'ICAR - Central Institute of Agricultural Engineering (CIAE), Bhopal & DAC&FW',
          mr: 'केंद्रीय कृषी अभियांत्रिकी संस्था (CIAE), भोपाळ व कृषी विभाग',
          hi: 'केंद्रीय कृषि अभियांत्रिकी संस्थान (CIAE), भोपाल एवं कृषि विभाग'
        },
        referenceDocument: {
          en: 'CIAE Multi-Crop Thresher Safety Guidelines & BIS Standard Codes',
          mr: 'सीआयएई बहुपीक मळणी यंत्र सुरक्षा नियमावली व बीआयएस मानके',
          hi: 'सीआईएई बहु-फसली थ्रेशर सुरक्षा नियम एवं बीआईएस मानक'
        },
        portalName: 'ciae.icar.gov.in',
        portalUrl: 'https://ciae.icar.gov.in',
        standardCode: 'BIS IS 9020 / IS 9129'
      },
      unavailableInfoNotice: {
        en: 'Sieve hole size and aspirator blower speed must be reset for every crop species and moisture level. Follow manufacturer authorized crop mesh charts.',
        mr: 'चाळणीचा आकार आणि ब्लोअरचा वेग प्रत्येक पिकाच्या प्रकारानुसार आणि दाण्यांच्या ओलाव्यानुसार बदलावा लागतो. उत्पादकाच्या तक्त्यानुसारच चाळणी वापरावी.',
        hi: 'जाली का आकार और ब्लोअर की हवा की गति हर फसल और दाने की नमी अनुसार बदलनी होती है। निर्माता के अधिकृत चार्ट अनुसार ही सेटिंग करें।'
      }
    }
  };

  // Authoritative Sources for Irrigation Methods
  const IRRIGATION_AUTHORITATIVE_METADATA = {
    'drip': {
      authoritativeSource: {
        institution: {
          en: 'Ministry of Agriculture & Farmers Welfare (PMKSY - Per Drop More Crop) & ICAR - IARI WTC',
          mr: 'कृषी व शेतकरी कल्याण मंत्रालय (PMKSY - प्रति थेंब अधिक पीक) व आयएआरआय वॉटर टेक्नॉलॉजी सेंटर',
          hi: 'कृषि एवं किसान कल्याण मंत्रालय (PMKSY - प्रति बूंद अधिक फसल) एवं आईएआरआई जल प्रौद्योगिकी केंद्र'
        },
        referenceDocument: {
          en: 'PMKSY Operational Guidelines & NCPAH Micro-Irrigation Handbook',
          mr: 'पीएमकेएसवाय मार्गदर्शक तत्त्वे व एनसीपीएएच सूक्ष्म सिंचन पुस्तिका',
          hi: 'पीएमकेएसवाई दिशानिर्देश एवं एनसीपीएएच सूक्ष्म सिंचाई हैंडबुक'
        },
        portalName: 'pmksy.gov.in',
        portalUrl: 'https://pmksy.gov.in',
        standardCode: 'BIS IS 13487 / IS 13488'
      },
      unavailableInfoNotice: {
        en: 'Exact lateral spacing, dripper spacing (30cm vs 50cm), and discharge (2 LPH vs 4 LPH) require soil texture infiltration analysis and crop row spacing. Customized hydraulic layout must be designed by certified micro-irrigation engineers under PMKSY.',
        mr: 'लॅटरलचे अंतर, ड्रिपर्समधील अंतर (३० किंवा ५० सेंमी) आणि पाण्याचा प्रवाह जमिनीच्या प्रकारावर अवलंबून असतो. अधिकृत सूक्ष्म सिंचन अभियंत्याकडून डिझाइन करून घेणे आवश्यक आहे.',
        hi: 'ड्रिप पाइप की दूरी, ड्रिपर की दूरी (३० या ५० सेमी) और डिस्चार्ज मिट्टी की संरचना पर निर्भर करता है। पीएमकेएसवाई के तहत प्रमाणित इंजीनियर से ही नक्शा बनवाएं।'
      }
    },
    'sprinkler': {
      authoritativeSource: {
        institution: {
          en: 'PMKSY - Per Drop More Crop & ICAR - IARI Water Technology Centre',
          mr: 'पीएमकेएसवाय - प्रति थेंब अधिक पीक व आयएआरआय वॉटर टेक्नॉलॉजी सेंटर',
          hi: 'पीएमकेएसवाई - प्रति बूंद अधिक फसल एवं आईएआरआई जल प्रौद्योगिकी केंद्र'
        },
        referenceDocument: {
          en: 'PMKSY Pressurized Irrigation Technical Manual & BIS Codes',
          mr: 'पीएमकेएसवाय दाबाखालील सिंचन तांत्रिक पुस्तिका व बीआयएस मानके',
          hi: 'पीएमकेएसवाई दबावयुक्त सिंचाई तकनीकी नियमावली एवं बीआईएस कोड'
        },
        portalName: 'pmksy.gov.in',
        portalUrl: 'https://pmksy.gov.in',
        standardCode: 'BIS IS 12232 / IS 14151'
      },
      unavailableInfoNotice: {
        en: 'Operating spray radius is distorted when local wind speed exceeds 15 km/h. Working pressure at nozzle ends must be monitored with a field pressure gauge rather than estimated.',
        mr: 'वाऱ्याचा वेग १५ किमी/तास पेक्षा जास्त असल्यास पाण्याचे वाटप असमान होते. नोझलजवळील पाण्याचा दाब नेहमी प्रेशर गेजद्वारे तपासावा.',
        hi: 'हवा की गति १५ किमी/घंटे से अधिक होने पर छिड़काव प्रभावित होता है। नोजल पर काम करने वाला दबाव हमेशा प्रेशर गेज से मापें, अनुमान न लगाएं।'
      }
    },
    'surface-flood': {
      authoritativeSource: {
        institution: {
          en: 'ICAR - Central Soil Salinity Research Institute (CSSRI), Karnal & FAO',
          mr: 'केंद्रीय मृदा क्षारता संशोधन संस्था (CSSRI), कर्नाल व एफएओ',
          hi: 'केंद्रीय मृदा लवणता अनुसंधान संस्थान (CSSRI), करनाल एवं एफएओ'
        },
        referenceDocument: {
          en: 'CSSRI Water Management & Soil Salinity Guidelines',
          mr: 'सीएसएसआरआय पाणी व्यवस्थापन व जमीन क्षारता मार्गदर्शिका',
          hi: 'सीएसएसआरआई जल प्रबंधन एवं मृदा लवणता दिशानिर्देश'
        },
        portalName: 'cssri.icar.gov.in',
        portalUrl: 'https://cssri.icar.gov.in',
        standardCode: 'ICAR Agronomic Standard Practices'
      },
      unavailableInfoNotice: {
        en: 'Deep percolation and waterlogging risk depend on clay pan depth and subsoil drainage. Field conveyance losses in unlined channels must be assessed locally on each farm.',
        mr: 'पाणी जिरण्याचे प्रमाण आणि पाणथळ होण्याचा धोका जमिनीच्या थरावर अवलंबून असतो. कच्च्या पाटातील पाण्याची गळती प्रत्येक शेतानुसार प्रत्यक्ष तपासावी लागते.',
        hi: 'पानी रिसने और जलभराव का खतरा मिट्टी की गहराई व जल निकासी पर निर्भर करता है। कच्ची नालियों में पानी का नुकसान स्थानीय रूप से मापा जाना चाहिए।'
      }
    },
    'furrow': {
      authoritativeSource: {
        institution: {
          en: 'ICAR - Indian Agricultural Research Institute (IARI) & ICAR - CICR Nagpur',
          mr: 'भारतीय कृषी संशोधन संस्था (IARI) व केंद्रीय कापूस संशोधन संस्था (CICR), नागपूर',
          hi: 'भारतीय कृषि अनुसंधान संस्थान (IARI) एवं केंद्रीय कपास अनुसंधान संस्थान (CICR), नागपुर'
        },
        referenceDocument: {
          en: 'IARI Ridge & Furrow Irrigation Technical Guide & CICR Agronomy Bulletins',
          mr: 'आयएआरआय सरी-वरंबा सिंचन तंत्रज्ञान पुस्तिका व सीआयसीआर कृषी बुलेटिन',
          hi: 'आईएआरआई मेड़-नाली सिंचाई तकनीकी गाइड एवं सीआईसीआर कृषि बुलेटिन'
        },
        portalName: 'cicr.icar.gov.in',
        portalUrl: 'https://cicr.icar.gov.in',
        standardCode: 'ICAR Package of Practices'
      },
      unavailableInfoNotice: {
        en: 'Furrow length and inflow stream size must be calibrated against soil slope (optimal 0.05% to 0.3%) to avoid head-end soil erosion and tail-end water stagnation.',
        mr: 'सरीची लांबी आणि पाण्याचा प्रवाह जमिनीच्या उतारानुसार (०.०५% ते ०.३%) ठरवावा लागतो, अन्यथा मातीची धूप होते किंवा पाणी साचून राहते.',
        hi: 'नाली की लंबाई और पानी के बहाव को ढलान (०.०५% से ०.३%) के अनुसार समायोजित करना पड़ता है ताकि मिट्टी का कटाव या जलभराव न हो।'
      }
    },
    'rain-gun': {
      authoritativeSource: {
        institution: {
          en: 'Department of Agriculture, Government of Maharashtra (MahaKrishi) & ICAR - IGFRI Jhansi',
          mr: 'कृषी विभाग, महाराष्ट्र शासन (महाकृषी) व भारतीय कुरण आणि चारा संशोधन संस्था (IGFRI)',
          hi: 'कृषि विभाग, महाराष्ट्र सरकार (महाकृषि) एवं भारतीय चरागाह और चारा अनुसंधान संस्थान (IGFRI)'
        },
        referenceDocument: {
          en: 'MahaKrishi High-Volume Irrigation Guidelines & IGFRI Fodder Mechanization Bulletins',
          mr: 'महाकृषी रेनगन सिंचन मार्गदर्शक व आयजीएफआरआय चारा यांत्रिकीकरण माहिती',
          hi: 'महाकृषि रेनगन सिंचाई दिशानिर्देश एवं आईजीएफआरआई चारा यंत्रीकरण बुलेटिन'
        },
        portalName: 'krishi.maharashtra.gov.in',
        portalUrl: 'https://krishi.maharashtra.gov.in',
        standardCode: 'State Agriculture Department Technical Norms'
      },
      unavailableInfoNotice: {
        en: 'Requires high pump operating pressure (3.0 to 5.0 kg/cm²). Large droplet impact makes it unsuitable for flowering and fruiting stages due to flower shedding risk.',
        mr: 'यासाठी पंपाचा दाब ३.० ते ५.० किलो/चौ.सेंमी असणे आवश्यक असते. पाण्याचे थेंब मोठे असल्याने फुलधारणेच्या किंवा फळधारणेच्या काळात फुले गळण्याचा धोका असतो.',
        hi: 'इसके लिए ३.० से ५.० किग्रा/सेमी² उच्च पंप दबाव आवश्यक है। बूंदें भारी होने के कारण फूल आने या फल लगने के समय फूल झड़ने का खतरा रहता है।'
      }
    },
    'micro-irrigation': {
      authoritativeSource: {
        institution: {
          en: 'National Committee on Precision Agriculture and Horticulture (NCPAH) & PMKSY',
          mr: 'अचूक कृषी आणि फलोत्पादन राष्ट्रीय समिती (NCPAH) व पीएमकेएसवाय',
          hi: 'सटीक कृषि और बागवानी राष्ट्रीय समिति (NCPAH) एवं पीएमकेएसवाई'
        },
        referenceDocument: {
          en: 'NCPAH Micro-Sprinkler & Jet System Design Guidelines',
          mr: 'एनसीपीएएच मायक्रो-स्प्रिंकलर व जेट सिंचन रचना मार्गदर्शक',
          hi: 'एनसीपीएएच माइक्रो-स्प्रिंकलर और जेट सिस्टम डिजाइन दिशानिर्देश'
        },
        portalName: 'pmksy.gov.in',
        portalUrl: 'https://pmksy.gov.in',
        standardCode: 'BIS IS 14644'
      },
      unavailableInfoNotice: {
        en: 'Micro-sprinkler wetting pattern is sensitive to system pressure drops. A pressure-regulating valve at the sub-main head is recommended for uniform wetted area.',
        mr: 'मायक्रो-स्प्रिंकलरचा पाण्याचा फवारा पाईपमधील दाबावर अत्यंत संवेदनशील असतो. सर्व ठिकाणी समान पाण्यासाठी सब-मेनवर प्रेशर रेगुलेटर लावणे फायदेशीर ठरते.',
        hi: 'माइक्रो-स्प्रिंकलर का फैलाव दबाव में उतार-चढ़ाव के प्रति संवेदनशील होता है। एकसमान पानी के लिए सब-मेन लाइन पर प्रेशर रेगुलेटर लगाना चाहिए।'
      }
    }
  };

  // Authoritative Sources for System Flow Steps
  const FLOW_STEP_METADATA = {
    institution: {
      en: 'Bureau of Indian Standards (BIS) & PMKSY Engineering Standards',
      mr: 'भारतीय मानक ब्युरो (BIS) व पीएमकेएसवाय अभियांत्रिकी मानके',
      hi: 'भारतीय मानक ब्यूरो (BIS) एवं पीएमकेएसवाई इंजीनियरिंग मानक'
    },
    referenceDocument: {
      en: 'BIS Micro-Irrigation Piping Standards (IS 12786, IS 13487) & Technical Blueprints',
      mr: 'बीआयएस सूक्ष्म सिंचन पाईप मानके व तांत्रिक नियमावली',
      hi: 'बीआईएस सूक्ष्म सिंचाई पाइप मानक एवं तकनीकी ब्लूप्रिंट'
    },
    portalName: 'bis.gov.in / pmksy.gov.in',
    portalUrl: 'https://pmksy.gov.in',
    unavailableInfoNotice: {
      en: 'Exact pipe diameters, pump horsepower, and filtration mesh size must be computed using field friction head loss formulas (Hazen-Williams). Consult an authorized irrigation engineer for field layout design.',
      mr: 'पाईपचा व्यास, पंपाची अश्वशक्ती आणि फिल्टरची साईज जमिनीच्या लांबी-उतारावर अवलंबून असते. तज्ज्ञ सिंचन अभियंत्याकडून प्रमाणित आराखडा तयार करून घ्यावा.',
      hi: 'पाइप का व्यास, पंप का हॉर्सपावर और फिल्टर की जाली का आकार खेत की लंबाई और ढलान के अनुसार गणना की जानी चाहिए। प्रमाणित सिंचाई इंजीनियर से ही नक्शा बनवाएं।'
    }
  };

  // Attach authoritative sources to equipment items
  EQUIPMENT_LIST.forEach(item => {
    if (EQUIPMENT_AUTHORITATIVE_METADATA[item.id]) {
      Object.assign(item, EQUIPMENT_AUTHORITATIVE_METADATA[item.id]);
    }
  });

  // Attach authoritative sources to irrigation types
  IRRIGATION_TYPES.forEach(item => {
    if (IRRIGATION_AUTHORITATIVE_METADATA[item.id]) {
      Object.assign(item, IRRIGATION_AUTHORITATIVE_METADATA[item.id]);
    }
  });

  // Attach authoritative sources to system flow steps
  IRRIGATION_SYSTEM_FLOW.forEach(step => {
    step.authoritativeSource = {
      institution: FLOW_STEP_METADATA.institution,
      referenceDocument: FLOW_STEP_METADATA.referenceDocument,
      portalName: FLOW_STEP_METADATA.portalName,
      portalUrl: FLOW_STEP_METADATA.portalUrl
    };
    step.unavailableInfoNotice = FLOW_STEP_METADATA.unavailableInfoNotice;
  });

  // Filter helper functions
  function filterEquipment(list, keyword, categoryKey, farmSizeKey) {
    if (!list) return [];
    let filtered = [...list];

    if (categoryKey && categoryKey !== 'all') {
      filtered = filtered.filter(item => item.categoryKey === categoryKey);
    }

    if (keyword && keyword.trim() !== '') {
      const q = keyword.trim().toLowerCase();
      filtered = filtered.filter(item => {
        const matchEn = item.name.en.toLowerCase().includes(q) || item.mainPurpose.en.toLowerCase().includes(q) || item.suitableCrops.en.some(c => c.toLowerCase().includes(q));
        const matchMr = item.name.mr.toLowerCase().includes(q) || item.mainPurpose.mr.toLowerCase().includes(q) || item.suitableCrops.mr.some(c => c.toLowerCase().includes(q));
        const matchHi = item.name.hi.toLowerCase().includes(q) || item.mainPurpose.hi.toLowerCase().includes(q) || item.suitableCrops.hi.some(c => c.toLowerCase().includes(q));
        return matchEn || matchMr || matchHi;
      });
    }

    if (farmSizeKey && farmSizeKey !== 'all') {
      // Small/Marginal vs Medium/Large filter
      filtered = filtered.filter(item => {
        const sizeText = item.suitableFarmSize.en.toLowerCase();
        if (farmSizeKey === 'small') {
          return sizeText.includes('small') || sizeText.includes('marginal') || sizeText.includes('all');
        } else if (farmSizeKey === 'large') {
          return sizeText.includes('medium') || sizeText.includes('large') || sizeText.includes('all');
        }
        return true;
      });
    }

    return filtered;
  }

  function filterIrrigation(list, keyword, categoryKey) {
    if (!list) return [];
    let filtered = [...list];

    if (categoryKey && categoryKey !== 'all') {
      filtered = filtered.filter(item => item.categoryKey === categoryKey || item.id === categoryKey);
    }

    if (keyword && keyword.trim() !== '') {
      const q = keyword.trim().toLowerCase();
      filtered = filtered.filter(item => {
        const matchSubtypesEn = item.subtypes && item.subtypes.en && item.subtypes.en.some(s => s.toLowerCase().includes(q));
        const matchSubtypesMr = item.subtypes && item.subtypes.mr && item.subtypes.mr.some(s => s.toLowerCase().includes(q));
        const matchSubtypesHi = item.subtypes && item.subtypes.hi && item.subtypes.hi.some(s => s.toLowerCase().includes(q));

        const matchEn = item.name.en.toLowerCase().includes(q) || item.howItWorks.en.toLowerCase().includes(q) || item.suitableCrops.en.some(c => c.toLowerCase().includes(q)) || matchSubtypesEn;
        const matchMr = item.name.mr.toLowerCase().includes(q) || item.howItWorks.mr.toLowerCase().includes(q) || item.suitableCrops.mr.some(c => c.toLowerCase().includes(q)) || matchSubtypesMr;
        const matchHi = item.name.hi.toLowerCase().includes(q) || item.howItWorks.hi.toLowerCase().includes(q) || item.suitableCrops.hi.some(c => c.toLowerCase().includes(q)) || matchSubtypesHi;
        return matchEn || matchMr || matchHi;
      });
    }

    return filtered;
  }

  return {
    EQUIPMENT_LIST,
    IRRIGATION_TYPES,
    IRRIGATION_SYSTEM_FLOW,
    calculateRecommendation,
    filterEquipment,
    filterIrrigation,
    ICONS
  };
});
