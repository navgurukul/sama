import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import useReveal from '../../components/Editorial/useReveal';
import '../../styles/editorial.css';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal'
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel'
];

export default function EditorialNgoRegistration() {
  useReveal();
  const { donorId } = useParams();
  const cardRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initial Registration Type Modal (True on first visit, as requested)
  const [showRequestTypeModal, setShowRequestTypeModal] = useState(true);
  const [modalChoice, setModalChoice] = useState('first-time'); // 'first-time' | 'subsequent'
  const [modalSelectedNgo, setModalSelectedNgo] = useState('');
  const [modalNgoSearch, setModalNgoSearch] = useState('');
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const comboboxRef = useRef(null);

  // Dynamic questions fetched from database
  const [dbQuestions, setDbQuestions] = useState([]);

  // Active form mode: 'first-time' | 'subsequent'
  const [requestType, setRequestType] = useState('first-time');

  // Existing NGOs fetched from database
  const [existingNgos, setExistingNgos] = useState([]);
  const [loadingNgos, setLoadingNgos] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');

  // Stepper state
  const [currentStep, setCurrentStep] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [done, setDone] = useState([false, false, false, false]);

  // Form State with all 22 database fields
  const [form, setForm] = useState({
    // Step 1: Organisation & Contact (Fields 1-5)
    organizationName: '',
    registrationNumber: '',
    primaryContactName: '',
    contactNumber: '',
    email: '',

    // Step 2: Operations (Fields 6-10)
    operatingState: '',
    location: [],
    yearsOperating: '',
    focusArea: '',
    focusAreaOther: '',
    worksWithWomen: '',

    // Step 3: Laptop Programme & Impact (Fields 11-22)
    infrastructure: '',
    infrastructureOther: '',
    beneficiarySelection: [],
    beneficiarySelectionOther: '',
    numberOfBeneficiaries: '',
    ageGroup: '',
    ageGroupOther: '',
    primaryUse: [],
    primaryUseOther: '',
    expectedOutcome: '',
    expectedOutcomeOther: '',
    laptopTracking: '',
    laptopTrackingOther: '',
    jobsCreated: '',
    previousProjects: '',
    previousProjectsOther: '',
    sufficientStaff: '',
    sufficientStaffOther: '',
    orgLaptopRequire: '',

    // File upload (Field 22)
    impactReport: null,
    fileName: '',
    fileSizeStr: '',
  });

  const [errors, setErrors] = useState({});
  const [shake, setShake] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedDraftId, setSubmittedDraftId] = useState('');

  // Stepper definitions
  const steps = useMemo(() => [
    { title: 'Organisation', sub: 'Name & contact' },
    { title: 'Operations', sub: 'Where & what you do' },
    { title: 'Laptop programme', sub: 'Needs & infrastructure' },
    { title: 'Review', sub: 'Check & submit' },
  ], []);

  useEffect(() => {
    document.title = "NGO Information Form | Sama";
    window.scrollTo(0, 0);

    // Fetch existing NGOs from PostgreSQL database
    const fetchNgos = async () => {
      setLoadingNgos(true);
      try {
        const apiBase = process.env.REACT_APP_NgoInformationApi || 'http://localhost:8000/ngo-exec';
        const res = await fetch(`${apiBase}?type=registration`);
        const json = await res.json();
        if (json.status === 'success' && Array.isArray(json.data)) {
          const map = new Map();
          json.data.forEach((item) => {
            const name = (item.organizationName || '').trim();
            if (name && !map.has(name.toLowerCase())) {
              map.set(name.toLowerCase(), item);
            }
          });
          const list = Array.from(map.values()).sort((a, b) =>
            (a.organizationName || '').localeCompare(b.organizationName || '')
          );
          setExistingNgos(list);
        }
      } catch (err) {
        console.warn('Could not load existing NGOs:', err);
      } finally {
        setLoadingNgos(false);
      }
    };

    fetchNgos();

    // Fetch questions dynamically from DB
    const fetchQuestions = async () => {
      try {
        const apiBase = process.env.REACT_APP_NgoInformationApi || 'http://localhost:8000/ngo-exec';
        const res = await fetch(`${apiBase}?type=donorQuestion`);
        const json = await res.json();
        if (json.status === 'success' && Array.isArray(json.data)) {
          setDbQuestions(json.data);
        }
      } catch (err) {
        console.warn('Could not load dynamic questions:', err);
      }
    };
    fetchQuestions();

    // Close combobox on outside click
    const handleOutsideClick = (e) => {
      if (comboboxRef.current && !comboboxRef.current.contains(e.target)) {
        setIsComboboxOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showRequestTypeModal) {
        setShowRequestTypeModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showRequestTypeModal]);

  // Dynamic question labels for Additional Request (Image 3)
  const beneficiariesQuestion = useMemo(() => {
    const found = dbQuestions.find((q) => q.name === 'numberOfBeneficiaries');
    return found?.question || 'How many beneficiaries does your NGO plan to serve with the laptops provided?';
  }, [dbQuestions]);

  const laptopsQuestion = useMemo(() => {
    const found = dbQuestions.find((q) => q.name === 'orgLaptopRequire');
    return found?.question || 'How many laptops does your organisation require?';
  }, [dbQuestions]);

  // Selected partner data
  const selectedPartner = useMemo(() => {
    const idOrName = selectedPartnerId || modalSelectedNgo;
    if (!idOrName) return null;
    return existingNgos.find(
      (n) => n.Id === idOrName || n.organizationName === idOrName
    ) || null;
  }, [selectedPartnerId, modalSelectedNgo, existingNgos]);

  const handleModalContinue = () => {
    if (modalChoice === 'first-time') {
      setRequestType('first-time');
      setSelectedPartnerId('');
    } else {
      setRequestType('subsequent');
      setSelectedPartnerId(modalSelectedNgo);
      setForm((prev) => ({
        ...prev,
        organizationName: modalSelectedNgo,
      }));
    }
    setCurrentStep(0);
    setMaxReached(0);
    setDone([false, false, false, false]);
    setErrors({});
    setModalNgoSearch('');
    setIsComboboxOpen(false);
    setShowRequestTypeModal(false);
    if (cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleRequestTypeToggle = (newType) => {
    if (newType === 'subsequent' && !selectedPartnerId) {
      setModalChoice('subsequent');
      setShowRequestTypeModal(true);
      return;
    }
    setRequestType(newType);
    setCurrentStep(0);
    setMaxReached(0);
    setDone([false, false, false, false]);
    setErrors({});
    if (cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const validateMobile = (mobileVal) => {
    const clean = (mobileVal || '').trim();
    if (!clean) return 'Please provide the mobile number.';
    if (!/^\d+$/.test(clean)) return 'Mobile number must contain digits only.';
    if (clean.length < 10) return `Mobile number must be exactly 10 digits (currently ${clean.length}).`;
    if (clean.length > 10) return 'Mobile number cannot exceed 10 digits.';
    if (!/^[6-9]/.test(clean)) return 'Indian mobile numbers must start with 6, 7, 8, or 9.';
    return '';
  };

  const validateEmail = (emailVal) => {
    const clean = (emailVal || '').trim();
    if (!clean) return 'Please provide an email address.';
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(clean)) return 'Please enter a valid email address (e.g. name@organisation.org).';
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleMobileChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    setForm((prev) => ({ ...prev, contactNumber: digitsOnly }));
    const err = validateMobile(digitsOnly);
    setErrors((prev) => {
      const next = { ...prev };
      if (err) next.contactNumber = err;
      else delete next.contactNumber;
      return next;
    });
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setForm((prev) => ({ ...prev, email: val }));
    const err = validateEmail(val);
    setErrors((prev) => {
      const next = { ...prev };
      if (err) next.email = err;
      else delete next.email;
      return next;
    });
  };

  const handleCheckbox = (groupName, val) => {
    setForm((prev) => {
      const current = prev[groupName] || [];
      const updated = current.includes(val)
        ? current.filter((item) => item !== val)
        : [...current, val];
      return { ...prev, [groupName]: updated };
    });
    if (errors[groupName]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[groupName];
        return next;
      });
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setErrors((prev) => ({
        ...prev,
        impactReport: `File size exceeds 50MB (${formatFileSize(file.size)}). Please choose a smaller file.`
      }));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        impactReport: 'Only PDF, DOC, DOCX, and XLSX files are allowed.'
      }));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setForm((prev) => ({
      ...prev,
      impactReport: file,
      fileName: file.name,
      fileSizeStr: formatFileSize(file.size)
    }));

    setErrors((prev) => {
      const next = { ...prev };
      delete next.impactReport;
      return next;
    });
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setForm((prev) => ({
      ...prev,
      impactReport: null,
      fileName: '',
      fileSizeStr: ''
    }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Step Validation
  const validateStep = (stepIdx) => {
    const stepErrors = {};

    if (requestType === 'subsequent') {
      if (stepIdx === 0) {
        if (!selectedPartnerId || !selectedPartner) {
          stepErrors.selectedPartnerId = 'Please select your registered organisation to proceed.';
        }
      } else if (stepIdx === 1) {
        if (!form.numberOfBeneficiaries || parseInt(form.numberOfBeneficiaries, 10) <= 0) {
          stepErrors.numberOfBeneficiaries = 'Please specify how many beneficiaries your NGO plans to serve.';
        }
        if (!form.orgLaptopRequire || parseInt(form.orgLaptopRequire, 10) <= 0) {
          stepErrors.orgLaptopRequire = 'Please specify how many laptops your organisation requires.';
        }
      }
    } else {
      if (stepIdx === 0) {
        if (!form.organizationName.trim()) {
          stepErrors.organizationName = 'Please enter the organization name.';
        } else {
          const exists = existingNgos.some(
            (o) => (o.organizationName || '').trim().toLowerCase() === form.organizationName.trim().toLowerCase()
          );
          if (exists) {
            stepErrors.organizationName = "This organisation already exists. Please select 'Additional Request' if this is your organisation.";
          }
        }
        if (!form.registrationNumber.trim()) {
          stepErrors.registrationNumber = "Please enter the NGO's official registration number.";
        }
        if (!form.primaryContactName.trim()) {
          stepErrors.primaryContactName = 'Please provide the full name of the primary contact person.';
        }
        const mobileErr = validateMobile(form.contactNumber);
        if (mobileErr) stepErrors.contactNumber = mobileErr;

        const emailErr = validateEmail(form.email);
        if (emailErr) stepErrors.email = emailErr;
      } else if (stepIdx === 1) {
        if (!form.operatingState.trim()) {
          stepErrors.operatingState = 'In which state is your organization currently operating?';
        }
        if (!form.yearsOperating) {
          stepErrors.yearsOperating = 'How many years has your organization been working?';
        }
        if (!form.focusArea) {
          stepErrors.focusArea = 'What is the primary focus area of your organization?';
        } else if (form.focusArea === 'Other' && !form.focusAreaOther.trim()) {
          stepErrors.focusAreaOther = 'Please specify your focus area.';
        }
        if (!form.worksWithWomen) {
          stepErrors.worksWithWomen = 'Does your NGO primarily work with underprivileged women?';
        }
      } else if (stepIdx === 2) {
        if (!form.numberOfBeneficiaries || parseInt(form.numberOfBeneficiaries, 10) <= 0) {
          stepErrors.numberOfBeneficiaries = 'How many beneficiaries does your NGO plan to serve with the laptops?';
        }
        if (!form.orgLaptopRequire || parseInt(form.orgLaptopRequire, 10) <= 0) {
          stepErrors.orgLaptopRequire = 'How many laptops does your organisation require?';
        }
        if (!form.infrastructure) {
          stepErrors.infrastructure = 'What infrastructure is available for laptop use?';
        } else if (form.infrastructure === 'Other' && !form.infrastructureOther.trim()) {
          stepErrors.infrastructureOther = 'Please specify your infrastructure.';
        }
      }
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const goTo = (stepIdx) => {
    if (stepIdx === currentStep || stepIdx > maxReached) return;
    if (stepIdx > currentStep) {
      for (let i = currentStep; i < stepIdx; i++) {
        if (!validateStep(i)) {
          triggerShake();
          return;
        }
      }
    }
    setCurrentStep(stepIdx);
    if (cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const goNext = () => {
    if (!validateStep(currentStep)) {
      triggerShake();
      return;
    }
    setDone((prev) => {
      const nextDone = [...prev];
      nextDone[currentStep] = true;
      return nextDone;
    });
    setMaxReached((prev) => Math.max(prev, currentStep + 1));
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    if (cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const goBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    if (cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Review Rows Breakdown
  const reviewRows = useMemo(() => {
    if (requestType === 'subsequent') {
      const p = selectedPartner || {};
      return [
        { label: 'Request Type', value: 'Additional Request', stepIndex: 0 },
        { label: 'Organisation', value: p.organizationName || selectedPartnerId, stepIndex: 0 },
        { label: 'Beneficiaries Served', value: `${form.numberOfBeneficiaries || 0} learners`, stepIndex: 1 },
        { label: 'Laptops Required', value: `${form.orgLaptopRequire || 0} laptops`, stepIndex: 1 },
      ];
    }

    const focusVal = form.focusArea === 'Other' && form.focusAreaOther ? `Other: ${form.focusAreaOther}` : form.focusArea;
    const infraVal = form.infrastructure === 'Other' && form.infrastructureOther ? `Other: ${form.infrastructureOther}` : form.infrastructure;
    const identVal = form.beneficiarySelection
      .map((item) => (item === 'Other' && form.beneficiarySelectionOther ? `Other: ${form.beneficiarySelectionOther}` : item))
      .join(', ');
    const primUseVal = form.primaryUse
      .map((item) => (item === 'Other' && form.primaryUseOther ? `Other: ${form.primaryUseOther}` : item))
      .join(', ');

    return [
      { label: 'Request Type', value: 'New Registration', stepIndex: 0 },
      { label: 'Organisation', value: form.organizationName, stepIndex: 0 },
      { label: 'Registration number', value: form.registrationNumber, stepIndex: 0 },
      { label: 'Primary contact', value: form.primaryContactName, stepIndex: 0 },
      { label: 'Mobile number', value: form.contactNumber, stepIndex: 0 },
      { label: 'Email', value: form.email, stepIndex: 0 },
      { label: 'State of operation', value: form.operatingState, stepIndex: 1 },
      { label: 'Location', value: form.location.join(', ') || '—', stepIndex: 1 },
      { label: 'Years working', value: form.yearsOperating, stepIndex: 1 },
      { label: 'Primary focus area', value: focusVal, stepIndex: 1 },
      { label: 'Works with underprivileged women', value: form.worksWithWomen, stepIndex: 1 },
      { label: 'Beneficiaries served', value: `${form.numberOfBeneficiaries} learners`, stepIndex: 2 },
      { label: 'Laptops required', value: `${form.orgLaptopRequire} laptops`, stepIndex: 2 },
      { label: 'Primary use of laptops', value: primUseVal || '—', stepIndex: 2 },
      { label: 'Age group', value: form.ageGroup || '—', stepIndex: 2 },
      { label: 'Infrastructure available', value: infraVal, stepIndex: 2 },
      { label: 'Beneficiary identification', value: identVal || '—', stepIndex: 2 },
      { label: 'Expected outcomes', value: form.expectedOutcome || '—', stepIndex: 2 },
      { label: 'Laptop tracking', value: form.laptopTracking || '—', stepIndex: 2 },
      { label: 'Jobs created', value: form.jobsCreated || '—', stepIndex: 2 },
      { label: 'Previous projects', value: form.previousProjects || '—', stepIndex: 2 },
      { label: 'Sufficient staff', value: form.sufficientStaff || '—', stepIndex: 2 },
      { label: 'Documentation', value: form.fileName ? `${form.fileName} (${form.fileSizeStr})` : 'None', stepIndex: 2 },
    ];
  }, [requestType, selectedPartner, selectedPartnerId, form]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (requestType === 'subsequent') {
      const stepErrors = {};
      if (!form.numberOfBeneficiaries || parseInt(form.numberOfBeneficiaries, 10) <= 0) {
        stepErrors.numberOfBeneficiaries = 'Please fill out this field (enter number of beneficiaries).';
      }
      if (!form.orgLaptopRequire || parseInt(form.orgLaptopRequire, 10) <= 0) {
        stepErrors.orgLaptopRequire = 'Please fill out this field (enter number of laptops required).';
      }
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        triggerShake();
        return;
      }
    } else {
      for (let i = 0; i < steps.length - 1; i++) {
        if (!validateStep(i)) {
          setCurrentStep(i);
          triggerShake();
          return;
        }
      }
    }

    setSubmitting(true);

    try {
      let base64File = '';
      if (form.impactReport) {
        const reader = new FileReader();
        base64File = await new Promise((resolve) => {
          reader.onload = () => {
            const res = reader.result;
            if (typeof res === 'string') {
              resolve(res.includes(',') ? res.split(',')[1] : res);
            } else {
              resolve('');
            }
          };
          reader.onerror = () => resolve('');
          reader.readAsDataURL(form.impactReport);
        });
      }

      const apiBase = process.env.REACT_APP_NgoInformationApi || 'http://localhost:8000/ngo-exec';
      let payload = {};

      if (requestType === 'subsequent') {
        const p = selectedPartner || {};
        payload = {
          type: 'NGO',
          requestType: 'subsequent',
          organizationName: (p.organizationName || selectedPartnerId || '').trim(),
          organizationId: p.Id || p.displayId || '',
          orgLaptopRequire: form.orgLaptopRequire,
          numberOfBeneficiaries: form.numberOfBeneficiaries,
          beneficiariesCount: form.numberOfBeneficiaries,
          location: p.location || '',
          operatingState: p.operatingState || '',
          primaryUse: p.primaryUse || '',
          primaryContactName: String(p.primaryContactName || '').trim(),
          contactNumber: String(p.contactNumber || '').trim(),
          email: String(p.email || '').trim(),
          yearsOperating: p.yearsOperating || '',
          focusArea: p.focusArea || '',
          infrastructure: p.infrastructure || p['Ngo Type'] || '',
          beneficiarySelection: p.beneficiarySelection || '',
          worksWithWomen: p.worksWithWomen || '',
          ageGroup: p.ageGroup || '',
          expectedOutcome: p.expectedOutcome || '',
          laptopTracking: p.laptopTracking || '',
          registrationNumber: p.registrationNumber || '',
          status: 'Pending Review',
          partnerType: 'AFE Partner',
          donorId: donorId || '',
          file: '',
          fileName: '',
          mimeType: '',
        };
      } else {
        const focusVal = form.focusArea === 'Other' && form.focusAreaOther ? `Other: ${form.focusAreaOther}` : form.focusArea;
        const infraVal = form.infrastructure === 'Other' && form.infrastructureOther ? `Other: ${form.infrastructureOther}` : form.infrastructure;
        const identVal = form.beneficiarySelection.map((b) =>
          b === 'Other' && form.beneficiarySelectionOther ? form.beneficiarySelectionOther : b
        );
        const primUseVal = form.primaryUse.map((u) =>
          u === 'Other' && form.primaryUseOther ? form.primaryUseOther : u
        );

        payload = {
          type: 'NGO',
          requestType: 'first-time',
          organizationName: form.organizationName.trim(),
          registrationNumber: form.registrationNumber.trim(),
          primaryContactName: form.primaryContactName.trim(),
          contactNumber: form.contactNumber.trim(),
          email: form.email.trim(),
          operatingState: form.operatingState.trim(),
          location: form.location,
          yearsOperating: form.yearsOperating,
          focusArea: focusVal,
          worksWithWomen: form.worksWithWomen,
          infrastructure: infraVal,
          beneficiarySelection: identVal,
          orgLaptopRequire: form.orgLaptopRequire,
          numberOfBeneficiaries: form.numberOfBeneficiaries,
          beneficiariesCount: form.numberOfBeneficiaries,
          primaryUse: primUseVal,
          ageGroup: form.ageGroup === 'Other' && form.ageGroupOther ? form.ageGroupOther : form.ageGroup,
          expectedOutcome: form.expectedOutcome === 'Other' && form.expectedOutcomeOther ? form.expectedOutcomeOther : form.expectedOutcome,
          laptopTracking: form.laptopTracking === 'Other' && form.laptopTrackingOther ? form.laptopTrackingOther : form.laptopTracking,
          jobsCreated: form.jobsCreated,
          previousProjects: form.previousProjects === 'Other' && form.previousProjectsOther ? form.previousProjectsOther : form.previousProjects,
          sufficientStaff: form.sufficientStaff === 'Other' && form.sufficientStaffOther ? form.sufficientStaffOther : form.sufficientStaff,
          status: 'Pending Review',
          partnerType: 'AFE Partner',
          donorId: donorId || '',
          file: base64File,
          fileName: form.impactReport?.name || '',
          mimeType: form.impactReport?.type || '',
        };
      }

      const res = await fetch(`${apiBase}?type=NGO`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      const generatedDraftId = data.id || `DRAFT-${Date.now().toString().slice(-4)}`;
      setSubmittedDraftId(generatedDraftId);

      setIsSubmitted(true);
      setDone([true, true, true, true]);

      if (cardRef.current) {
        cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setIsSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm({
      organizationName: '',
      registrationNumber: '',
      primaryContactName: '',
      contactNumber: '',
      email: '',
      operatingState: '',
      location: [],
      yearsOperating: '',
      focusArea: '',
      focusAreaOther: '',
      worksWithWomen: '',
      infrastructure: '',
      infrastructureOther: '',
      beneficiarySelection: [],
      beneficiarySelectionOther: '',
      numberOfBeneficiaries: '',
      ageGroup: '',
      ageGroupOther: '',
      primaryUse: [],
      primaryUseOther: '',
      expectedOutcome: '',
      expectedOutcomeOther: '',
      laptopTracking: '',
      laptopTrackingOther: '',
      jobsCreated: '',
      previousProjects: '',
      previousProjectsOther: '',
      sufficientStaff: '',
      sufficientStaffOther: '',
      orgLaptopRequire: '',
      impactReport: null,
      fileName: '',
      fileSizeStr: '',
    });
    setSelectedPartnerId('');
    setModalSelectedNgo('');
    setModalNgoSearch('');
    setModalChoice('first-time');
    setErrors({});
    setDone([false, false, false, false]);
    setMaxReached(0);
    setCurrentStep(0);
    setIsSubmitted(false);
    setSubmittedDraftId('');
    setShowRequestTypeModal(true);
  };

  // Filtered NGOs for search in modal dialog
  const modalFilteredNgos = useMemo(() => {
    if (!modalNgoSearch.trim()) return existingNgos;
    const q = modalNgoSearch.toLowerCase().trim();
    const filtered = existingNgos.filter(
      (n) =>
        (n.organizationName || '').toLowerCase().includes(q) ||
        (n.Id || '').toLowerCase().includes(q) ||
        (n.operatingState || '').toLowerCase().includes(q)
    );
    // Keep currently selected NGO visible if one was chosen
    if (modalSelectedNgo && !filtered.some((n) => n.organizationName === modalSelectedNgo)) {
      const cur = existingNgos.find((n) => n.organizationName === modalSelectedNgo);
      if (cur) return [cur, ...filtered];
    }
    return filtered;
  }, [existingNgos, modalNgoSearch, modalSelectedNgo]);

  return (
    <div className="editorial-page page" id="page-ngoregistration" data-title="NGO Information Form | Sama">
      {/* Page Hero */}
      <section className="page-hero">
        <div className="wrap reveal">
          <div className="crumbs">
            <Link to="/">Home</Link> / <b>NGO Information Form</b>
          </div>
          <span className="eyebrow">NGO registration</span>
          <h1 className="display h1 mt-s">
            NGO Information <em>Form</em>
          </h1>
          <p className="lede mt-m">
            Tell us about your organisation so we can register you as a Sama partner NGO and match you with laptops for the learners you support. It takes about three minutes.
          </p>
        </div>
      </section>

      {/* Initial Registration Type Modal as requested */}
      {showRequestTypeModal && (
        <div
          className="editorial-modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowRequestTypeModal(false);
            }
          }}
        >
          <div className="editorial-modal">
            <button
              type="button"
              className="editorial-modal-close"
              onClick={() => setShowRequestTypeModal(false)}
              aria-label="Close"
              title="Close"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <div style={{ paddingRight: '36px' }}>
              <h3>Select Registration Type</h3>
              <p className="mt-s">
                Please select whether this is your first time registering or an additional request:
              </p>
            </div>

            <div className="req-types">
              <label className={`req-card ${modalChoice === 'first-time' ? 'is-active' : ''}`}>
                <input
                  type="radio"
                  name="modal_choice"
                  value="first-time"
                  checked={modalChoice === 'first-time'}
                  onChange={() => {
                    setModalChoice('first-time');
                    setModalSelectedNgo('');
                    setModalNgoSearch('');
                  }}
                />
                <div className="req-card-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                  </svg>
                </div>
                <div className="req-card-content">
                  <b>First Time Registration</b>
                  <span>Select this if your organization has never registered before</span>
                </div>
              </label>

              <label className={`req-card ${modalChoice === 'subsequent' ? 'is-active' : ''}`}>
                <input
                  type="radio"
                  name="modal_choice"
                  value="subsequent"
                  checked={modalChoice === 'subsequent'}
                  onChange={() => setModalChoice('subsequent')}
                />
                <div className="req-card-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div className="req-card-content">
                  <b>Additional Request</b>
                  <span>Select this if your organization is already registered</span>
                </div>
              </label>
            </div>

            {modalChoice === 'subsequent' && (
              <div className="fld" ref={comboboxRef} style={{ position: 'relative' }}>
                <label htmlFor="modal-ngo-combobox">
                  Select your existing organization:<span className="req"> *</span>
                </label>
                {loadingNgos ? (
                  <div style={{ padding: '12px', color: 'var(--muted)', fontSize: '14px' }}>
                    Loading registered organizations...
                  </div>
                ) : (
                  <div style={{ position: 'relative' }}>
                    <div
                      onClick={() => setIsComboboxOpen(true)}
                      style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        border: isComboboxOpen ? '1.5px solid var(--sage)' : '1px solid #CFC8BB',
                        borderRadius: '10px',
                        background: '#fff',
                        padding: '0 12px',
                        minHeight: '50px',
                        boxShadow: isComboboxOpen ? '0 0 0 3px rgba(92,120,90,.18)' : 'none',
                        cursor: 'text',
                        transition: 'all .2s ease',
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--muted)', marginRight: '10px', flexShrink: 0 }}>
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      <input
                        id="modal-ngo-combobox"
                        type="text"
                        placeholder={modalSelectedNgo ? modalSelectedNgo : `Search or select organization (${existingNgos.length} available)...`}
                        value={isComboboxOpen ? modalNgoSearch : (modalSelectedNgo || '')}
                        onChange={(e) => {
                          setModalNgoSearch(e.target.value);
                          if (!isComboboxOpen) setIsComboboxOpen(true);
                        }}
                        onFocus={() => {
                          setIsComboboxOpen(true);
                        }}
                        style={{
                          border: 'none',
                          outline: 'none',
                          width: '100%',
                          height: '48px',
                          fontFamily: 'var(--sans)',
                          fontSize: '15px',
                          fontWeight: modalSelectedNgo && !isComboboxOpen ? 700 : 500,
                          color: 'var(--ink)',
                          background: 'transparent',
                        }}
                        autoComplete="off"
                      />
                      {modalSelectedNgo && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalSelectedNgo('');
                            setModalNgoSearch('');
                            setIsComboboxOpen(true);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            color: 'var(--muted)',
                            marginRight: '4px',
                            fontSize: '14px',
                          }}
                          title="Clear selection"
                        >
                          ✕
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsComboboxOpen((prev) => !prev);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '6px',
                          color: 'var(--muted)',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                        title={isComboboxOpen ? 'Close list' : 'Browse all organizations'}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          style={{ transform: isComboboxOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s ease' }}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                    </div>

                    {/* Dropdown Menu with Search Inside */}
                    {isComboboxOpen && (
                      <div
                        className="modal-combobox-menu"
                        style={{
                          position: 'absolute',
                          top: 'calc(100% + 4px)',
                          left: 0,
                          right: 0,
                          maxHeight: '260px',
                          overflowY: 'auto',
                          background: '#fff',
                          border: '1px solid #CFC8BB',
                          borderRadius: '10px',
                          boxShadow: '0 12px 32px rgba(28,25,20,.14)',
                          zIndex: 1000,
                          padding: '6px',
                        }}
                      >
                        <div style={{ padding: '6px 10px', fontSize: '12px', color: 'var(--muted)', borderBottom: '1px solid #F0ECE4', marginBottom: '4px', fontWeight: 600 }}>
                          {modalFilteredNgos.length === 0
                            ? `No organizations match "${modalNgoSearch}"`
                            : modalNgoSearch
                            ? `${modalFilteredNgos.length} matching organization${modalFilteredNgos.length > 1 ? 's' : ''}`
                            : `Showing all ${existingNgos.length} registered organizations`}
                        </div>
                        {modalFilteredNgos.map((org) => {
                          const isSelected = modalSelectedNgo === org.organizationName;
                          return (
                            <div
                              key={org.Id || org.organizationName}
                              onClick={() => {
                                setModalSelectedNgo(org.organizationName);
                                setModalNgoSearch('');
                                setIsComboboxOpen(false);
                              }}
                              style={{
                                padding: '10px 12px',
                                borderRadius: '7px',
                                cursor: 'pointer',
                                fontSize: '14.5px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: isSelected ? 'rgba(92, 120, 90, 0.12)' : 'transparent',
                                fontWeight: isSelected ? '700' : '500',
                                color: isSelected ? 'var(--green, #264e36)' : 'var(--ink)',
                                transition: 'background .15s ease',
                              }}
                              onMouseEnter={(e) => {
                                if (!isSelected) e.currentTarget.style.background = '#F6F4F0';
                              }}
                              onMouseLeave={(e) => {
                                if (!isSelected) e.currentTarget.style.background = 'transparent';
                              }}
                            >
                              <div>
                                <div>{org.organizationName}</div>
                                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                                  {org.Id ? `ID: ${org.Id}` : ''} {org.operatingState ? `• ${org.operatingState}` : ''}
                                </div>
                              </div>
                              {isSelected && (
                                <span style={{ color: 'var(--green, #264e36)', fontWeight: 'bold' }}>✓</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
                {existingNgos.length === 0 && !loadingNgos && (
                  <p className="err">No existing organizations found. Please choose "First Time Registration".</p>
                )}
              </div>
            )}

            <div className="editorial-modal-actions">
              <button
                type="button"
                className="bracket bracket--solid"
                disabled={!modalChoice || (modalChoice === 'subsequent' && !modalSelectedNgo)}
                onClick={handleModalContinue}
              >
                Continue &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Registration Layout */}
      <section className="sec" id="ngo-register">
        <div className="wrap">
          <div className="ngo-layout">
            {/* Left Stepper Aside */}
            <aside className="ngo-aside reveal">
              {requestType === 'subsequent' ? (
                <>
                  <ol className="ngo-steps" id="ngo-stepper">
                    <li className="is-done">
                      <button
                        type="button"
                        onClick={() => {
                          setModalChoice('subsequent');
                          setModalSelectedNgo(selectedPartnerId);
                          setIsComboboxOpen(false);
                          setShowRequestTypeModal(true);
                        }}
                        title="Click to change organisation"
                      >
                        <span className="n">
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M5 12.5l4.5 4.5L19 7.5" />
                          </svg>
                        </span>
                        <span className="t">
                          <b>Organisation</b>
                          <small>Selected</small>
                        </span>
                      </button>
                    </li>
                    <li className="is-current">
                      <button type="button" disabled>
                        <span className="n">
                          <span>2</span>
                        </span>
                        <span className="t">
                          <b>Requirements</b>
                          <small>Laptops & learners</small>
                        </span>
                      </button>
                    </li>
                  </ol>

                  <div className="ngo-help">
                    <b>Need help?</b>
                    Write to <a href="mailto:operations@thesama.in">operations@thesama.in</a> and our team will guide you.
                  </div>
                </>
              ) : (
                <>
                  <ol className="ngo-steps" id="ngo-stepper">
                    {steps.map((s, idx) => {
                      const isCurrent = currentStep === idx;
                      const isDone = done[idx] && !isCurrent;
                      const isDisabled = idx > maxReached && !done[idx];

                      return (
                        <li
                          key={idx}
                          className={`${isCurrent ? 'is-current' : ''} ${isDone ? 'is-done' : ''}`}
                        >
                          <button
                            type="button"
                            onClick={() => goTo(idx)}
                            disabled={isDisabled}
                          >
                            <span className="n">
                              <span>{idx + 1}</span>
                              <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M5 12.5l4.5 4.5L19 7.5" />
                              </svg>
                            </span>
                            <span className="t">
                              <b>{s.title}</b>
                              <small>{s.sub}</small>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ol>

                  <div className="ngo-help">
                    <b>Need help?</b>
                    Write to <a href="mailto:operations@thesama.in">operations@thesama.in</a> and our team will guide you.
                  </div>
                </>
              )}
            </aside>

            {/* Right Form Card */}
            <div
              ref={cardRef}
              className={`ngo-card reveal ${shake ? 'shake' : ''}`}
              id="ngo-card"
            >
              {!isSubmitted && (
                <div className="ngo-head">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div className="req-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <span>Request Type:</span>
                      <b>{requestType === 'first-time' ? 'New Registration' : `Additional Request - ${selectedPartner?.organizationName || selectedPartnerId || ''}`}</b>
                      <button
                        type="button"
                        onClick={() => {
                          setModalChoice(requestType);
                          setModalSelectedNgo(selectedPartnerId);
                          setIsComboboxOpen(false);
                          setShowRequestTypeModal(true);
                        }}
                        style={{
                          background: 'none',
                          border: 0,
                          color: 'var(--sage)',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          marginLeft: 4
                        }}
                      >
                        [Change]
                      </button>
                    </div>

                    {/* Quick Toggle between First Time and Additional Request */}
                    <div style={{ display: 'inline-flex', background: 'var(--stone)', padding: '3px', borderRadius: '8px' }}>
                      <button
                        type="button"
                        onClick={() => handleRequestTypeToggle('first-time')}
                        style={{
                          background: requestType === 'first-time' ? '#fff' : 'none',
                          border: 0,
                          borderRadius: '6px',
                          padding: '5px 12px',
                          fontFamily: 'var(--sans)',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          color: requestType === 'first-time' ? 'var(--ink)' : 'var(--muted)',
                          cursor: 'pointer',
                          boxShadow: requestType === 'first-time' ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
                        }}
                      >
                        First Time
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRequestTypeToggle('subsequent')}
                        style={{
                          background: requestType === 'subsequent' ? '#fff' : 'none',
                          border: 0,
                          borderRadius: '6px',
                          padding: '5px 12px',
                          fontFamily: 'var(--sans)',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          color: requestType === 'subsequent' ? 'var(--ink)' : 'var(--muted)',
                          cursor: 'pointer',
                          boxShadow: requestType === 'subsequent' ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
                        }}
                      >
                        Additional Request
                      </button>
                    </div>
                  </div>

                  {requestType === 'first-time' && (
                    <div className="prog">
                      <div className="prog-row">
                        <span id="ngo-step-name">{steps[currentStep]?.title}</span>
                        <span id="ngo-step-count">Step {currentStep + 1} of {steps.length}</span>
                      </div>
                      <div className="prog-bar">
                        <i
                          id="ngo-bar"
                          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                        ></i>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!isSubmitted ? (
                <form className="ngo-form" id="ngo-form" onSubmit={handleSubmit} noValidate>
                  {/* ========================================================
                      MODE: ADDITIONAL REQUEST (SUBSEQUENT PARTNERS)
                      ======================================================== */}
                  {requestType === 'subsequent' && (
                    <div className="ngo-step" data-title="Additional laptop request" style={{ padding: '24px 28px 16px' }}>
                      <div className="req-banner" style={{ marginBottom: '24px', background: '#F5F5F5', border: '1px solid #E5E5E5', padding: '14px 18px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '15px', color: '#333' }}>
                          Request Type: <strong style={{ color: '#111' }}>Additional Request</strong>
                          {selectedPartner && (
                            <> - Organization: <strong style={{ color: '#111' }}>{selectedPartner.organizationName}</strong></>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setModalChoice('subsequent');
                            setModalSelectedNgo(selectedPartnerId);
                            setIsComboboxOpen(false);
                            setShowRequestTypeModal(true);
                          }}
                          style={{
                            background: 'none',
                            border: 0,
                            color: 'var(--sage, #5C785A)',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            textDecoration: 'underline',
                          }}
                        >
                          Change
                        </button>
                      </div>

                      {/* Question 1: numberOfBeneficiaries */}
                      <div className={`fld ${errors.numberOfBeneficiaries ? 'has-err' : ''}`} style={{ marginBottom: '22px' }}>
                        <label htmlFor="sub-beneficiaries" style={{ fontWeight: 700, fontSize: '15px' }}>
                          {beneficiariesQuestion}<span className="req"> *</span>
                        </label>
                        <input
                          id="sub-beneficiaries"
                          name="numberOfBeneficiaries"
                          type="number"
                          min="1"
                          placeholder="How many beneficiaries does your NGO plan to serve with the laptops provided?"
                          required
                          value={form.numberOfBeneficiaries}
                          onChange={handleChange}
                          style={{ height: '52px' }}
                        />
                        {errors.numberOfBeneficiaries && <p className="err">{errors.numberOfBeneficiaries}</p>}
                      </div>

                      {/* Question 2: orgLaptopRequire */}
                      <div className={`fld ${errors.orgLaptopRequire ? 'has-err' : ''}`} style={{ marginBottom: '24px' }}>
                        <label htmlFor="sub-laptops" style={{ fontWeight: 700, fontSize: '15px' }}>
                          {laptopsQuestion}<span className="req"> *</span>
                        </label>
                        <input
                          id="sub-laptops"
                          name="orgLaptopRequire"
                          type="number"
                          min="1"
                          placeholder="How many laptops does your organisation require?"
                          required
                          value={form.orgLaptopRequire}
                          onChange={handleChange}
                          style={{ height: '52px' }}
                        />
                        {errors.orgLaptopRequire && <p className="err">{errors.orgLaptopRequire}</p>}
                      </div>

                      <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <button
                          type="submit"
                          className={`bracket bracket--solid ${submitting ? 'is-loading' : ''}`}
                          disabled={submitting}
                          style={{
                            padding: '12px 32px',
                            fontSize: '16px',
                            fontWeight: 700,
                            borderRadius: '24px',
                            background: 'var(--sage, #5C785A)',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                        >
                          <span className="lbl">{submitting ? 'Submitting...' : 'Submit'}</span>
                          {submitting && <span className="spin" aria-hidden="true"></span>}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ========================================================
                      MODE: FIRST-TIME REGISTRATION (ALL 22 FIELDS)
                      ======================================================== */}
                  {requestType === 'first-time' && (
                    <>
                      {/* Step 0: Organisation & Contact (Fields 1-5) */}
                      {currentStep === 0 && (
                        <div className="ngo-step" data-title="Organisation">
                          <div>
                            <h2>About your organisation</h2>
                          </div>
                          <p className="sub">Basic details and who we should contact.</p>

                          {/* 1. organizationName */}
                          <div className={`fld ${errors.organizationName ? 'has-err' : ''}`}>
                            <label htmlFor="ngo-name">
                              What is the name of the organization?<span className="req"> *</span>
                            </label>
                            <input
                              id="ngo-name"
                              name="organizationName"
                              type="text"
                              required
                              placeholder="Official organisation name"
                              autoComplete="organization"
                              value={form.organizationName}
                              onChange={handleChange}
                            />
                            {errors.organizationName && <p className="err">{errors.organizationName}</p>}
                          </div>

                          {/* 2. registrationNumber */}
                          <div className={`fld ${errors.registrationNumber ? 'has-err' : ''}`}>
                            <label htmlFor="ngo-reg">
                              What is the NGO's official registration number?<span className="req"> *</span>
                            </label>
                            <input
                              id="ngo-reg"
                              name="registrationNumber"
                              type="text"
                              required
                              placeholder="Trust / Society / Section 8 registration number"
                              value={form.registrationNumber}
                              onChange={handleChange}
                            />
                            {errors.registrationNumber && <p className="err">{errors.registrationNumber}</p>}
                          </div>

                          {/* 3. primaryContactName */}
                          <div className={`fld ${errors.primaryContactName ? 'has-err' : ''}`}>
                            <label htmlFor="ngo-contact">
                              Please provide the full name of the primary contact person for your organization.
                              <span className="req"> *</span>
                            </label>
                            <input
                              id="ngo-contact"
                              name="primaryContactName"
                              type="text"
                              required
                              placeholder="Full name of contact person"
                              autoComplete="name"
                              value={form.primaryContactName}
                              onChange={handleChange}
                            />
                            {errors.primaryContactName && <p className="err">{errors.primaryContactName}</p>}
                          </div>

                          {/* 4. contactNumber */}
                          <div className={`fld ${errors.contactNumber ? 'has-err' : ''}`}>
                            <label htmlFor="ngo-mobile">
                              Please provide the mobile number of the concerned person<span className="req"> *</span>
                            </label>
                            <input
                              id="ngo-mobile"
                              name="contactNumber"
                              type="tel"
                              required
                              inputMode="tel"
                              autoComplete="tel"
                              placeholder="10-digit mobile number"
                              maxLength={10}
                              value={form.contactNumber}
                              onChange={handleMobileChange}
                            />
                            {errors.contactNumber && <p className="err">{errors.contactNumber}</p>}
                          </div>

                          {/* 5. email */}
                          <div className={`fld ${errors.email ? 'has-err' : ''}`}>
                            <label htmlFor="ngo-email">
                              Please provide an email address of the concerned person.<span className="req"> *</span>
                            </label>
                            <input
                              id="ngo-email"
                              name="email"
                              type="email"
                              required
                              autoComplete="email"
                              placeholder="name@organisation.org"
                              value={form.email}
                              onChange={handleEmailChange}
                            />
                            {errors.email && <p className="err">{errors.email}</p>}
                          </div>
                        </div>
                      )}

                      {/* Step 1: Operations (Fields 6-10) */}
                      {currentStep === 1 && (
                        <div className="ngo-step" data-title="Operations">
                          <div>
                            <h2>Where and how you work</h2>
                          </div>
                          <p className="sub">Help us understand the scale and focus of your work.</p>

                          {/* 6. operatingState */}
                          <div className={`fld ${errors.operatingState ? 'has-err' : ''}`}>
                            <label htmlFor="ngo-state">
                              In which state is your organization currently operating?<span className="req"> *</span>
                            </label>
                            <input
                              id="ngo-state"
                              name="operatingState"
                              type="text"
                              required
                              list="ngo-states"
                              autoComplete="off"
                              placeholder="Start typing to search state"
                              value={form.operatingState}
                              onChange={handleChange}
                            />
                            <datalist id="ngo-states">
                              {INDIAN_STATES.map((state) => (
                                <option key={state} value={state}>
                                  {state}
                                </option>
                              ))}
                            </datalist>
                            {errors.operatingState && <p className="err">{errors.operatingState}</p>}
                          </div>

                          {/* 7. location */}
                          <fieldset className="grp">
                            <legend>
                              What is your organization's location of operation?
                              <span className="opt-hint">Select all that apply</span>
                            </legend>
                            <div className="choices">
                              {['Urban', 'Rural', 'Semi-Urban'].map((loc) => {
                                const isChecked = form.location.includes(loc);
                                return (
                                  <label key={loc} className={`choice choice--check ${isChecked ? 'is-selected' : ''}`}>
                                    <input
                                      type="checkbox"
                                      name="location"
                                      value={loc}
                                      checked={isChecked}
                                      onChange={() => handleCheckbox('location', loc)}
                                    />
                                    <span className="mark"></span>
                                    <span>{loc}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </fieldset>

                          {/* 8. yearsOperating */}
                          <fieldset className={`grp ${errors.yearsOperating ? 'has-err' : ''}`}>
                            <legend>
                              How many years has your organization been working?<span className="req"> *</span>
                            </legend>
                            <div className="choices">
                              {[
                                'Less than 2 years',
                                '2 - 5 years',
                                '5 - 10 years',
                                '10+ years',
                              ].map((yr) => {
                                const isChecked = form.yearsOperating === yr;
                                return (
                                  <label key={yr} className={`choice ${isChecked ? 'is-selected' : ''}`}>
                                    <input
                                      type="radio"
                                      name="yearsOperating"
                                      value={yr}
                                      checked={isChecked}
                                      onChange={handleChange}
                                    />
                                    <span className="mark"></span>
                                    <span>{yr}</span>
                                  </label>
                                );
                              })}
                            </div>
                            {errors.yearsOperating && <p className="err">{errors.yearsOperating}</p>}
                          </fieldset>

                          {/* 9. focusArea */}
                          <fieldset className={`grp ${errors.focusArea ? 'has-err' : ''}`}>
                            <legend>
                              What is the primary focus area of your organization?<span className="req"> *</span>
                            </legend>
                            <div className="choices">
                              {[
                                'Education',
                                'Employment/Job placement',
                                'Digital literacy',
                                'Women empowerment',
                                'Other',
                              ].map((foc) => {
                                const isChecked = form.focusArea === foc;
                                return (
                                  <label key={foc} className={`choice ${isChecked ? 'is-selected' : ''}`}>
                                    <input
                                      type="radio"
                                      name="focusArea"
                                      value={foc}
                                      checked={isChecked}
                                      onChange={handleChange}
                                    />
                                    <span className="mark"></span>
                                    <span>{foc}</span>
                                  </label>
                                );
                              })}
                            </div>
                            {form.focusArea === 'Other' && (
                              <div className={`fld other-box ${errors.focusAreaOther ? 'has-err' : ''}`}>
                                <label htmlFor="focusAreaOther">Please specify<span className="req"> *</span></label>
                                <input
                                  id="focusAreaOther"
                                  type="text"
                                  name="focusAreaOther"
                                  placeholder="Describe your focus area"
                                  value={form.focusAreaOther}
                                  onChange={handleChange}
                                />
                                {errors.focusAreaOther && <p className="err">{errors.focusAreaOther}</p>}
                              </div>
                            )}
                            {errors.focusArea && <p className="err">{errors.focusArea}</p>}
                          </fieldset>

                          {/* 10. worksWithWomen */}
                          <fieldset className={`grp ${errors.worksWithWomen ? 'has-err' : ''}`}>
                            <legend>
                              Does your NGO primarily work with underprivileged women?<span className="req"> *</span>
                            </legend>
                            <div className="choices">
                              {[
                                'Yes',
                                'No',
                                'Partially (Some projects focus on this)',
                              ].map((w) => {
                                const isChecked = form.worksWithWomen === w;
                                return (
                                  <label key={w} className={`choice ${isChecked ? 'is-selected' : ''}`}>
                                    <input
                                      type="radio"
                                      name="worksWithWomen"
                                      value={w}
                                      checked={isChecked}
                                      onChange={handleChange}
                                    />
                                    <span className="mark"></span>
                                    <span>{w}</span>
                                  </label>
                                );
                              })}
                            </div>
                            {errors.worksWithWomen && <p className="err">{errors.worksWithWomen}</p>}
                          </fieldset>
                        </div>
                      )}

                      {/* Step 2: Laptop Programme & Beneficiaries (Fields 11-22) */}
                      {currentStep === 2 && (
                        <div className="ngo-step" data-title="Laptop programme">
                          <div>
                            <h2>Your laptop programme</h2>
                          </div>
                          <p className="sub">How the laptops would be used and who would receive them.</p>

                          {/* 11. infrastructure */}
                          <fieldset className={`grp ${errors.infrastructure ? 'has-err' : ''}`}>
                            <legend>
                              What infrastructure is available for laptop use?<span className="req"> *</span>
                            </legend>
                            <div className="choices">
                              {[
                                'Dedicated computer lab',
                                'Beneficiaries will use laptops at home',
                                'Shared space with Wi-Fi',
                                'No specific infrastructure in place',
                                'Other',
                              ].map((inf) => {
                                const isChecked = form.infrastructure === inf;
                                return (
                                  <label key={inf} className={`choice ${isChecked ? 'is-selected' : ''}`}>
                                    <input
                                      type="radio"
                                      name="infrastructure"
                                      value={inf}
                                      checked={isChecked}
                                      onChange={handleChange}
                                    />
                                    <span className="mark"></span>
                                    <span>{inf}</span>
                                  </label>
                                );
                              })}
                            </div>
                            {form.infrastructure === 'Other' && (
                              <div className={`fld other-box ${errors.infrastructureOther ? 'has-err' : ''}`}>
                                <label htmlFor="infrastructureOther">Please specify<span className="req"> *</span></label>
                                <input
                                  id="infrastructureOther"
                                  type="text"
                                  name="infrastructureOther"
                                  placeholder="Describe infrastructure"
                                  value={form.infrastructureOther}
                                  onChange={handleChange}
                                />
                                {errors.infrastructureOther && <p className="err">{errors.infrastructureOther}</p>}
                              </div>
                            )}
                            {errors.infrastructure && <p className="err">{errors.infrastructure}</p>}
                          </fieldset>

                          {/* 12. beneficiarySelection */}
                          <fieldset className="grp">
                            <legend>
                              How does your NGO identify beneficiaries for laptop distribution?
                              <span className="opt-hint">Select all that apply</span>
                            </legend>
                            <div className="choices">
                              {[
                                'Economic background',
                                'Educational background',
                                'Employment status',
                                'Other',
                              ].map((idItem) => {
                                const isChecked = form.beneficiarySelection.includes(idItem);
                                return (
                                  <label key={idItem} className={`choice choice--check ${isChecked ? 'is-selected' : ''}`}>
                                    <input
                                      type="checkbox"
                                      name="beneficiarySelection"
                                      value={idItem}
                                      checked={isChecked}
                                      onChange={() => handleCheckbox('beneficiarySelection', idItem)}
                                    />
                                    <span className="mark"></span>
                                    <span>{idItem}</span>
                                  </label>
                                );
                              })}
                            </div>
                            {form.beneficiarySelection.includes('Other') && (
                              <div className="fld other-box">
                                <label htmlFor="ident_other">Please specify</label>
                                <input
                                  id="ident_other"
                                  name="beneficiarySelectionOther"
                                  type="text"
                                  placeholder="Specify criteria"
                                  value={form.beneficiarySelectionOther}
                                  onChange={handleChange}
                                />
                              </div>
                            )}
                          </fieldset>

                          {/* 13. numberOfBeneficiaries */}
                          <div className={`fld ${errors.numberOfBeneficiaries ? 'has-err' : ''}`}>
                            <label htmlFor="reg-beneficiaries">
                              How many beneficiaries does your NGO plan to serve with the laptops?<span className="req"> *</span>
                            </label>
                            <input
                              id="reg-beneficiaries"
                              name="numberOfBeneficiaries"
                              type="number"
                              min="1"
                              placeholder="e.g. 50"
                              required
                              value={form.numberOfBeneficiaries}
                              onChange={handleChange}
                            />
                            {errors.numberOfBeneficiaries && <p className="err">{errors.numberOfBeneficiaries}</p>}
                          </div>

                          {/* 14. ageGroup */}
                          <fieldset className="grp">
                            <legend>
                              What is the age group of the beneficiaries?
                            </legend>
                            <div className="choices">
                              {[
                                '18-22 years (fresh graduates/college students)',
                                '22-30 years (seeking employment)',
                                '30+ years (returning to education/employment)',
                                'Other'
                              ].map((item) => {
                                const isChecked = form.ageGroup === item;
                                return (
                                  <label key={item} className={`choice ${isChecked ? 'is-selected' : ''}`}>
                                    <input
                                      type="radio"
                                      name="ageGroup"
                                      value={item}
                                      checked={isChecked}
                                      onChange={handleChange}
                                    />
                                    <span className="mark"></span>
                                    <span>{item}</span>
                                  </label>
                                );
                              })}
                            </div>
                            {form.ageGroup === 'Other' && (
                              <div className="fld other-box">
                                <label htmlFor="age_other">Please specify</label>
                                <input
                                  id="age_other"
                                  name="ageGroupOther"
                                  type="text"
                                  placeholder="Specify age group"
                                  value={form.ageGroupOther}
                                  onChange={handleChange}
                                />
                              </div>
                            )}
                          </fieldset>

                          {/* 15. primaryUse */}
                          <fieldset className="grp">
                            <legend>
                              What will be the primary use of the laptops provided to your beneficiaries?
                              <span className="opt-hint">Select all that apply</span>
                            </legend>
                            <div className="choices">
                              {['Education', 'Employment', 'Entrepreneurship', 'Other'].map((item) => {
                                const isChecked = form.primaryUse.includes(item);
                                return (
                                  <label key={item} className={`choice choice--check ${isChecked ? 'is-selected' : ''}`}>
                                    <input
                                      type="checkbox"
                                      name="primaryUse"
                                      value={item}
                                      checked={isChecked}
                                      onChange={() => handleCheckbox('primaryUse', item)}
                                    />
                                    <span className="mark"></span>
                                    <span>{item}</span>
                                  </label>
                                );
                              })}
                            </div>
                            {form.primaryUse.includes('Other') && (
                              <div className="fld other-box">
                                <label htmlFor="reg_prim_other">Please specify</label>
                                <input
                                  id="reg_prim_other"
                                  name="primaryUseOther"
                                  type="text"
                                  placeholder="Describe primary use"
                                  value={form.primaryUseOther}
                                  onChange={handleChange}
                                />
                              </div>
                            )}
                          </fieldset>

                          {/* 16. expectedOutcome */}
                          <fieldset className="grp">
                            <legend>
                              "What are the expected outcomes from the use of the laptops?
                            </legend>
                            <div className="choices">
                              {[
                                'Securing full-time employment',
                                'Securing part-time employment or freelance work',
                                'Completing education or certifications',
                                'Starting a business',
                                'No specific outcome',
                                'Other'
                              ].map((item) => {
                                const isChecked = form.expectedOutcome === item;
                                return (
                                  <label key={item} className={`choice ${isChecked ? 'is-selected' : ''}`}>
                                    <input
                                      type="radio"
                                      name="expectedOutcome"
                                      value={item}
                                      checked={isChecked}
                                      onChange={handleChange}
                                    />
                                    <span className="mark"></span>
                                    <span>{item}</span>
                                  </label>
                                );
                              })}
                            </div>
                            {form.expectedOutcome === 'Other' && (
                              <div className="fld other-box">
                                <label htmlFor="outcomes_other">Please specify</label>
                                <input
                                  id="outcomes_other"
                                  name="expectedOutcomeOther"
                                  type="text"
                                  placeholder="Specify outcomes"
                                  value={form.expectedOutcomeOther}
                                  onChange={handleChange}
                                />
                              </div>
                            )}
                          </fieldset>

                          {/* 17. laptopTracking */}
                          <fieldset className="grp">
                            <legend>
                              How do you plan to track the usage of the laptops?
                            </legend>
                            <div className="choices">
                              {[
                                'Regular beneficiary feedback',
                                'Progress reports from beneficiaries',
                                'Monitoring online course completion',
                                'Employment verification',
                                'Other'
                              ].map((item) => {
                                const isChecked = form.laptopTracking === item;
                                return (
                                  <label key={item} className={`choice ${isChecked ? 'is-selected' : ''}`}>
                                    <input
                                      type="radio"
                                      name="laptopTracking"
                                      value={item}
                                      checked={isChecked}
                                      onChange={handleChange}
                                    />
                                    <span className="mark"></span>
                                    <span>{item}</span>
                                  </label>
                                );
                              })}
                            </div>
                            {form.laptopTracking === 'Other' && (
                              <div className="fld other-box">
                                <label htmlFor="tracking_other">Please specify</label>
                                <input
                                  id="tracking_other"
                                  name="laptopTrackingOther"
                                  type="text"
                                  placeholder="Specify tracking method"
                                  value={form.laptopTrackingOther}
                                  onChange={handleChange}
                                />
                              </div>
                            )}
                          </fieldset>

                          {/* 18. jobsCreated */}
                          <fieldset className="grp">
                            <legend>
                              How many jobs do you anticipate creating in the next year through the use of the laptops?
                            </legend>
                            <div className="choices">
                              {['1 - 10', '10 - 20', '20 - 30', '30 - 50', '50+'].map((item) => {
                                const isChecked = form.jobsCreated === item;
                                return (
                                  <label key={item} className={`choice ${isChecked ? 'is-selected' : ''}`}>
                                    <input
                                      type="radio"
                                      name="jobsCreated"
                                      value={item}
                                      checked={isChecked}
                                      onChange={handleChange}
                                    />
                                    <span className="mark"></span>
                                    <span>{item}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </fieldset>

                          {/* 19. previousProjects */}
                          <fieldset className="grp">
                            <legend>
                              Has your NGO previously undertaken similar projects?
                            </legend>
                            <div className="choices">
                              {[
                                'Yes, multiple similar projects',
                                'Yes, but on a smaller scale',
                                'No, this is our first project of this kind',
                                'Other'
                              ].map((item) => {
                                const isChecked = form.previousProjects === item;
                                return (
                                  <label key={item} className={`choice ${isChecked ? 'is-selected' : ''}`}>
                                    <input
                                      type="radio"
                                      name="previousProjects"
                                      value={item}
                                      checked={isChecked}
                                      onChange={handleChange}
                                    />
                                    <span className="mark"></span>
                                    <span>{item}</span>
                                  </label>
                                );
                              })}
                            </div>
                            {form.previousProjects === 'Other' && (
                              <div className="fld other-box">
                                <label htmlFor="prev_other">Please specify</label>
                                <input
                                  id="prev_other"
                                  name="previousProjectsOther"
                                  type="text"
                                  placeholder="Specify projects"
                                  value={form.previousProjectsOther}
                                  onChange={handleChange}
                                />
                              </div>
                            )}
                          </fieldset>

                          {/* 20. sufficientStaff */}
                          <fieldset className="grp">
                            <legend>
                              Does your NGO have sufficient staff to support beneficiaries in utilizing the laptops?
                            </legend>
                            <div className="choices">
                              {[
                                'Yes, dedicated staff for digital literacy/employment',
                                'Yes, but shared staff with other projects',
                                'No, we will need external support',
                                'Other'
                              ].map((item) => {
                                const isChecked = form.sufficientStaff === item;
                                return (
                                  <label key={item} className={`choice ${isChecked ? 'is-selected' : ''}`}>
                                    <input
                                      type="radio"
                                      name="sufficientStaff"
                                      value={item}
                                      checked={isChecked}
                                      onChange={handleChange}
                                    />
                                    <span className="mark"></span>
                                    <span>{item}</span>
                                  </label>
                                );
                              })}
                            </div>
                            {form.sufficientStaff === 'Other' && (
                              <div className="fld other-box">
                                <label htmlFor="staff_other">Please specify</label>
                                <input
                                  id="staff_other"
                                  name="sufficientStaffOther"
                                  type="text"
                                  placeholder="Specify staffing"
                                  value={form.sufficientStaffOther}
                                  onChange={handleChange}
                                />
                              </div>
                            )}
                          </fieldset>

                          {/* 21. orgLaptopRequire */}
                          <div className={`fld ${errors.orgLaptopRequire ? 'has-err' : ''}`}>
                            <label htmlFor="reg-laptops">
                              How many laptops does your organisation require?<span className="req"> *</span>
                            </label>
                            <input
                              id="reg-laptops"
                              name="orgLaptopRequire"
                              type="number"
                              min="1"
                              placeholder="e.g. 15"
                              required
                              value={form.orgLaptopRequire}
                              onChange={handleChange}
                            />
                            {errors.orgLaptopRequire && <p className="err">{errors.orgLaptopRequire}</p>}
                          </div>

                          {/* 22. impactReport */}
                          <div className="fld">
                            <label>
                              Please share any impact reports or documentation related to your previous projects (Optional)
                            </label>
                            <div
                              className="file-upload-box"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.doc,.docx,.xlsx"
                                onChange={handleFileChange}
                              />
                              <div className="file-upload-icon">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                  <polyline points="17 8 12 3 7 8" />
                                  <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                              </div>
                              <span className="file-upload-label">
                                {form.impactReport ? 'Change selected file' : 'Click to upload impact report'}
                              </span>
                              <span className="file-upload-hint">
                                Allowed file types: PDF, DOC, DOCX, XLSX (Max size: 50MB)
                              </span>
                            </div>

                            {form.impactReport && (
                              <div className="file-selected-chip">
                                <div className="file-selected-info">
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                  </svg>
                                  <div className="file-selected-text">
                                    <b>{form.fileName}</b>
                                    <small>{form.fileSizeStr}</small>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="file-remove-btn"
                                  title="Remove file"
                                  onClick={handleRemoveFile}
                                >
                                  &times;
                                </button>
                              </div>
                            )}
                            {errors.impactReport && <p className="err">{errors.impactReport}</p>}
                          </div>
                        </div>
                      )}

                      {/* Step 3: Review */}
                      {currentStep === 3 && (
                        <div className="ngo-step" data-title="Review">
                          <div>
                            <h2>Review your details</h2>
                          </div>
                          <p className="sub">
                            Please check everything before submitting. You can edit any answer.
                          </p>

                          <dl className="review" id="ngo-review">
                            {reviewRows.map((r, i) => (
                              <div key={i}>
                                <dt>{r.label}</dt>
                                <dd>{r.value || '—'}</dd>
                                <button type="button" onClick={() => goTo(r.stepIndex)}>
                                  Edit
                                </button>
                              </div>
                            ))}
                          </dl>

                          <p className="ngo-note">
                            Submitting opens your email app with these answers addressed to operations@thesama.in. Press send there to complete your registration.
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {/* Stepper Navigation Footer - Only for First Time Registration */}
                  {requestType === 'first-time' && (
                    <div className="ngo-foot">
                      {currentStep > 0 && (
                        <button type="button" className="link-btn" onClick={goBack}>
                          &larr; Back
                        </button>
                      )}
                      <span className="spacer"></span>
                      {currentStep < steps.length - 1 ? (
                        <button type="button" className="bracket bracket--solid" onClick={goNext}>
                          Continue{' '}
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M5 12h14M13 6l6 6-6 6" />
                          </svg>
                        </button>
                      ) : (
                        <button
                          type="submit"
                          className={`bracket bracket--solid ${submitting ? 'is-loading' : ''}`}
                          disabled={submitting}
                        >
                          <span className="lbl">
                            {submitting ? 'Submitting...' : 'Submit registration'}
                          </span>
                          {submitting && <span className="spin" aria-hidden="true"></span>}
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M5 12h14M13 6l6 6-6 6" />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}
                </form>
              ) : (
                /* Success View */
                <div className="ngo-done success" id="ngo-done">
                  <div className="tick">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                  </div>

                  {submittedDraftId && (
                    <div>
                      <div className="draft-badge">
                        <span>Application Reference:</span> <b>{submittedDraftId}</b>
                      </div>
                    </div>
                  )}

                  <h2>
                    {requestType === 'subsequent' ? 'Request Submitted Successfully!' : 'Registration Submitted Successfully!'}
                  </h2>
                  <p>
                    Thank you for your submission. Your application has been recorded in our system. Our operations team will review your request and get in touch with you shortly.
                  </p>

                  <div className="btn-row" style={{ display: 'flex', gap: '14px', justifyContent: 'center', marginTop: '24px' }}>
                    <button type="button" className="bracket bracket--solid" id="ngo-again" onClick={handleReset}>
                      Submit another request
                    </button>
                    <a
                      href="/"
                      className="bracket"
                      style={{
                        padding: '12px 24px',
                        borderRadius: '24px',
                        background: '#fff',
                        border: '1px solid #ddd',
                        textDecoration: 'none',
                        color: 'var(--ink, #111)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        fontWeight: 600
                      }}
                    >
                      Back to Home
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
