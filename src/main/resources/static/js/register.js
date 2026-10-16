/**
 * Smart Krishi Sahayak - Registration Page Controller
 */
document.addEventListener('DOMContentLoaded', () => {
  if (Auth.isAuthenticated()) {
    Auth.redirectByRole();
    return;
  }

  const registerForm = document.getElementById('registerForm');
  const alertBanner = document.getElementById('alertBanner');
  const submitBtn = document.getElementById('submitBtn');

  // Location Cascading Elements
  const stateSelect = document.getElementById('state');
  const districtSelect = document.getElementById('district');
  const talukaSelect = document.getElementById('taluka');
  const villageSelect = document.getElementById('village');

  const stateCustom = document.getElementById('stateCustom');
  const districtCustom = document.getElementById('districtCustom');
  const talukaCustom = document.getElementById('talukaCustom');
  const villageCustom = document.getElementById('villageCustom');

  function initLocationDropdowns() {
    if (!stateSelect || typeof LocationData === 'undefined') return;

    populateStates();

    // Default to Maharashtra
    stateSelect.value = 'Maharashtra';
    onStateChange('Maharashtra');

    stateSelect.addEventListener('change', () => {
      onStateChange(stateSelect.value);
    });

    districtSelect.addEventListener('change', () => {
      onDistrictChange(districtSelect.value);
    });

    talukaSelect.addEventListener('change', () => {
      onTalukaChange(talukaSelect.value);
    });

    villageSelect.addEventListener('change', () => {
      onVillageChange(villageSelect.value);
    });

    // Update translations when language changes
    document.addEventListener('change', (e) => {
      if (e.target && e.target.classList.contains('lang-select')) {
        setTimeout(updateDropdownLabels, 200);
      }
    });
  }

  function populateStates() {
    const states = LocationData.getStates();
    const defaultPlaceholder = I18n.getTranslation('reg_select_state') || '-- Select State --';
    const otherText = I18n.getTranslation('reg_other_option') || 'Other (Specify)';

    stateSelect.innerHTML = `<option value="">${defaultPlaceholder}</option>`;
    states.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s;
      opt.textContent = s;
      stateSelect.appendChild(opt);
    });
    const otherOpt = document.createElement('option');
    otherOpt.value = 'Other';
    otherOpt.textContent = otherText;
    stateSelect.appendChild(otherOpt);
  }

  function onStateChange(state) {
    if (state === 'Other') {
      if (stateCustom) {
        stateCustom.classList.remove('d-none');
        stateCustom.required = true;
        stateCustom.focus();
      }
    } else {
      if (stateCustom) {
        stateCustom.classList.add('d-none');
        stateCustom.required = false;
        stateCustom.value = '';
      }
    }

    // Reset District
    const distPlaceholder = I18n.getTranslation('reg_select_district') || '-- Select District --';
    districtSelect.innerHTML = `<option value="">${distPlaceholder}</option>`;
    if (districtCustom) {
      districtCustom.classList.add('d-none');
      districtCustom.required = false;
      districtCustom.value = '';
    }

    // Reset Taluka
    const talukaPlaceholder = I18n.getTranslation('reg_select_taluka') || '-- Select Taluka --';
    talukaSelect.innerHTML = `<option value="">${talukaPlaceholder}</option>`;
    talukaSelect.disabled = true;
    if (talukaCustom) {
      talukaCustom.classList.add('d-none');
      talukaCustom.value = '';
    }

    // Reset Village
    const villagePlaceholder = I18n.getTranslation('reg_select_village') || '-- Select Village --';
    villageSelect.innerHTML = `<option value="">${villagePlaceholder}</option>`;
    villageSelect.disabled = true;
    if (villageCustom) {
      villageCustom.classList.add('d-none');
      villageCustom.value = '';
    }

    if (!state) {
      districtSelect.disabled = true;
      return;
    }

    districtSelect.disabled = false;
    const districts = LocationData.getDistricts(state);
    const otherText = I18n.getTranslation('reg_other_option') || 'Other (Specify)';

    if (districts && districts.length > 0) {
      districts.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = d;
        districtSelect.appendChild(opt);
      });
      const otherOpt = document.createElement('option');
      otherOpt.value = 'Other';
      otherOpt.textContent = otherText;
      districtSelect.appendChild(otherOpt);
    } else {
      const otherOpt = document.createElement('option');
      otherOpt.value = 'Other';
      otherOpt.textContent = otherText;
      districtSelect.appendChild(otherOpt);
      districtSelect.value = 'Other';
      onDistrictChange('Other');
    }
  }

  function onDistrictChange(district) {
    if (district === 'Other') {
      if (districtCustom) {
        districtCustom.classList.remove('d-none');
        districtCustom.required = true;
        districtCustom.focus();
      }
    } else {
      if (districtCustom) {
        districtCustom.classList.add('d-none');
        districtCustom.required = false;
        districtCustom.value = '';
      }
    }

    // Reset Taluka
    const talukaPlaceholder = I18n.getTranslation('reg_select_taluka') || '-- Select Taluka --';
    talukaSelect.innerHTML = `<option value="">${talukaPlaceholder}</option>`;
    if (talukaCustom) {
      talukaCustom.classList.add('d-none');
      talukaCustom.value = '';
    }

    // Reset Village
    const villagePlaceholder = I18n.getTranslation('reg_select_village') || '-- Select Village --';
    villageSelect.innerHTML = `<option value="">${villagePlaceholder}</option>`;
    villageSelect.disabled = true;
    if (villageCustom) {
      villageCustom.classList.add('d-none');
      villageCustom.value = '';
    }

    if (!district) {
      talukaSelect.disabled = true;
      return;
    }

    talukaSelect.disabled = false;
    const talukas = LocationData.getTalukas(district);
    const otherText = I18n.getTranslation('reg_other_option') || 'Other (Specify)';

    if (talukas && talukas.length > 0) {
      talukas.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t;
        talukaSelect.appendChild(opt);
      });
    }
    const otherOpt = document.createElement('option');
    otherOpt.value = 'Other';
    otherOpt.textContent = otherText;
    talukaSelect.appendChild(otherOpt);
  }

  function onTalukaChange(taluka) {
    if (taluka === 'Other') {
      if (talukaCustom) {
        talukaCustom.classList.remove('d-none');
        talukaCustom.focus();
      }
    } else {
      if (talukaCustom) {
        talukaCustom.classList.add('d-none');
        talukaCustom.value = '';
      }
    }

    // Reset Village
    const villagePlaceholder = I18n.getTranslation('reg_select_village') || '-- Select Village --';
    villageSelect.innerHTML = `<option value="">${villagePlaceholder}</option>`;
    if (villageCustom) {
      villageCustom.classList.add('d-none');
      villageCustom.value = '';
    }

    if (!taluka) {
      villageSelect.disabled = true;
      return;
    }

    villageSelect.disabled = false;
    const villages = LocationData.getVillages(taluka);
    const otherText = I18n.getTranslation('reg_other_option') || 'Other (Specify)';

    if (villages && villages.length > 0) {
      villages.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v;
        opt.textContent = v;
        villageSelect.appendChild(opt);
      });
    }
    const otherOpt = document.createElement('option');
    otherOpt.value = 'Other';
    otherOpt.textContent = otherText;
    villageSelect.appendChild(otherOpt);
  }

  function onVillageChange(village) {
    if (village === 'Other') {
      if (villageCustom) {
        villageCustom.classList.remove('d-none');
        villageCustom.focus();
      }
    } else {
      if (villageCustom) {
        villageCustom.classList.add('d-none');
        villageCustom.value = '';
      }
    }
  }

  function updateDropdownLabels() {
    const defaultPlaceholderState = I18n.getTranslation('reg_select_state') || '-- Select State --';
    const defaultPlaceholderDistrict = I18n.getTranslation('reg_select_district') || '-- Select District --';
    const defaultPlaceholderTaluka = I18n.getTranslation('reg_select_taluka') || '-- Select Taluka --';
    const defaultPlaceholderVillage = I18n.getTranslation('reg_select_village') || '-- Select Village --';
    const otherText = I18n.getTranslation('reg_other_option') || 'Other (Specify)';

    if (stateSelect && stateSelect.options[0]) stateSelect.options[0].text = defaultPlaceholderState;
    if (districtSelect && districtSelect.options[0]) districtSelect.options[0].text = defaultPlaceholderDistrict;
    if (talukaSelect && talukaSelect.options[0]) talukaSelect.options[0].text = defaultPlaceholderTaluka;
    if (villageSelect && villageSelect.options[0]) villageSelect.options[0].text = defaultPlaceholderVillage;

    [stateSelect, districtSelect, talukaSelect, villageSelect].forEach(sel => {
      if (sel) {
        for (let i = 0; i < sel.options.length; i++) {
          if (sel.options[i].value === 'Other') {
            sel.options[i].text = otherText;
          }
        }
      }
    });
  }

  // Initialize cascading selects
  initLocationDropdowns();

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert();

      const fullName = document.getElementById('fullName').value.trim();
      const mobileNumber = document.getElementById('mobileNumber').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const preferredLanguage = document.getElementById('preferredLanguage').value;

      // Extract location values from select dropdowns or custom input if 'Other'
      let state = stateSelect ? stateSelect.value : 'Maharashtra';
      if (state === 'Other' && stateCustom) {
        state = stateCustom.value.trim();
      }
      if (!state) state = 'Maharashtra';

      let district = districtSelect ? districtSelect.value : '';
      if (district === 'Other' && districtCustom) {
        district = districtCustom.value.trim();
      }

      let taluka = talukaSelect ? talukaSelect.value : '';
      if (taluka === 'Other' && talukaCustom) {
        taluka = talukaCustom.value.trim();
      }

      let village = villageSelect ? villageSelect.value : '';
      if (village === 'Other' && villageCustom) {
        village = villageCustom.value.trim();
      }

      const landSizeAcresVal = document.getElementById('landSizeAcres').value.trim();
      const primaryCrops = document.getElementById('primaryCrops').value.trim();
      const soilType = document.getElementById('soilType').value.trim();

      // Client-side validations
      if (!fullName || !mobileNumber || !password || !confirmPassword || !district) {
        showAlert(I18n.getTranslation('err_required') || 'Please fill in all required fields.', 'danger');
        return;
      }

      if (!/^[0-9]{10}$/.test(mobileNumber)) {
        showAlert(I18n.getTranslation('err_mobile_invalid') || 'Mobile number must be exactly 10 digits.', 'danger');
        return;
      }

      if (password.length < 6) {
        showAlert('Password must be at least 6 characters long.', 'danger');
        return;
      }

      if (password !== confirmPassword) {
        showAlert(I18n.getTranslation('err_pass_mismatch') || 'Passwords do not match.', 'danger');
        return;
      }

      const payload = {
        fullName,
        mobileNumber,
        password,
        preferredLanguage,
        district,
        state
      };

      if (email) payload.email = email;
      if (taluka) payload.taluka = taluka;
      if (village) payload.village = village;
      if (landSizeAcresVal) payload.landSizeAcres = parseFloat(landSizeAcresVal);
      if (primaryCrops) payload.primaryCrops = primaryCrops;
      if (soilType) payload.soilType = soilType;

      Utils.setLoadingButton(submitBtn, true);

      try {
        const response = await Api.post('/api/v1/auth/register', payload);

        if (response && response.success) {
          showAlert('Registration successful! Redirecting to login page...', 'success');
          setTimeout(() => {
            window.location.href = 'login.html?registered=true';
          }, 1500);
        } else {
          showAlert(response?.message || 'Registration failed. Please check input values.', 'danger');
        }
      } catch (error) {
        console.error('Registration error:', error);
        showAlert(error.message || 'Registration failed. Mobile number or email may already exist.', 'danger');
      } finally {
        Utils.setLoadingButton(submitBtn, false);
      }
    });
  }

  function showAlert(message, type = 'danger') {
    if (!alertBanner) return;
    alertBanner.className = `alert-banner alert-banner-${type}`;
    alertBanner.textContent = message;
    alertBanner.style.display = 'block';
  }

  function hideAlert() {
    if (!alertBanner) return;
    alertBanner.style.display = 'none';
  }
});
