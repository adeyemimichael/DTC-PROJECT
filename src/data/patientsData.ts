export interface MedicalRecordItem {
  id: string;
  title: string;
  type: 'Lab Result' | 'Prescription' | 'Clinical Progress Note' | 'Imaging Report';
  date: string;
  details: string;
  author?: string;
  fileUrl?: string;
}

export interface VisitHistoryItem {
  date: string;
  year: string;
  title: string;
  summary: string;
}

export interface VitalHistoryRow {
  date: string;
  weight: string;
  temp: string;
  hr: string;
  bp: string;
  fbs: string;
}

export interface PatientData {
  id: string;
  name: string;
  avatar: string;
  gender: string;
  age: number;
  bloodType: string;
  visitsCount: number;
  since: string;
  contact: string;
  address: string;
  condition: string;
  lastVisit: string;
  nextAppointment: string;
  vitals: {
    bp: string;
    hr: string;
    weight: string;
    tsh: string;
    biomarkerName: string;
  };
  summary: {
    totalVisits: number;
    lastVisit: string;
    nextAppointment: string;
    medicalRecordsCount: number;
  };
  vitalsHistory: VitalHistoryRow[];
  medicalRecords: MedicalRecordItem[];
  visitHistory: VisitHistoryItem[];
}

export const mockPatientsList: PatientData[] = [
  {
    id: '1',
    name: 'Sarah Mitchell',
    avatar: '/images/sarah_avatar.png',
    gender: 'Female',
    age: 37,
    bloodType: 'O+',
    visitsCount: 6,
    since: 'June 2024',
    contact: 'emily.rodriguez@email.com · +1 (312) 555-0412',
    address: '890 North State Street, Chicago, IL 60610',
    condition: 'Hypothyroidism',
    lastVisit: 'May 18, 2026',
    nextAppointment: 'June 3, 2026',
    vitals: {
      bp: '118/76',
      hr: '72',
      weight: '142',
      tsh: '2.4 mIU/L',
      biomarkerName: 'TSH Level',
    },
    summary: {
      totalVisits: 3,
      lastVisit: 'May 30, 2026',
      nextAppointment: 'None',
      medicalRecordsCount: 3,
    },
    vitalsHistory: [
      {
        date: 'May 30, 2026',
        weight: '58.1 kg',
        temp: '36.4 °C',
        hr: '68 bpm',
        bp: '112/72',
        fbs: '85 mg/dL',
      },
      {
        date: 'Mar 15, 2026',
        weight: '58.5 kg',
        temp: '36.6 °C',
        hr: '70 bpm',
        bp: '110/70',
        fbs: '88 mg/dL',
      },
    ],
    medicalRecords: [
      {
        id: 'r1',
        title: 'Thyroid Panel',
        type: 'Lab Result',
        date: '2026-05-18',
        author: 'Emily Rodriguez',
        details: 'TSH 2.4 mIU/L — normalized. Free T4 within range.',
        fileUrl: '/images/serviceimage1.jpg',
      },
      {
        id: 'r2',
        title: 'Levothyroxine 75mcg',
        type: 'Prescription',
        date: '2026-05-30',
        author: 'Dr. Stephen Adeyemi',
        details: 'Once daily, 30 min before breakfast.',
        fileUrl: '/images/serviceimage2.jpg',
      },
    ],
    visitHistory: [
      {
        date: 'May 30',
        year: '2026',
        title: 'General Consultation — Thyroid follow-up',
        summary: 'TSH normalized. Continue current dose. Patient reports feeling much better.',
      },
      {
        date: 'Mar 15',
        year: '2026',
        title: 'General Consultation — Fatigue and weight gain',
        summary: 'Initial hypothyroidism diagnosis. Started levothyroxine 50mcg.',
      },
    ],
  },
  {
    id: '2',
    name: 'Courtney Henry',
    avatar: '/images/stephen.jpg',
    gender: 'Male',
    age: 37,
    bloodType: 'AB+',
    visitsCount: 6,
    since: 'January 2024',
    contact: 'courtney.h@email.com · +1 (312) 555-0198',
    address: '450 West Michigan Ave, Chicago, IL 60611',
    condition: 'Hypertension',
    lastVisit: 'May 20, 2026',
    nextAppointment: '---',
    vitals: {
      bp: '128/82',
      hr: '76',
      weight: '175',
      tsh: '95 mg/dL',
      biomarkerName: 'Fasting Blood Sugar',
    },
    summary: {
      totalVisits: 6,
      lastVisit: 'May 20, 2026',
      nextAppointment: 'None',
      medicalRecordsCount: 4,
    },
    vitalsHistory: [
      {
        date: 'May 20, 2026',
        weight: '79.3 kg',
        temp: '36.5 °C',
        hr: '76 bpm',
        bp: '128/82',
        fbs: '95 mg/dL',
      },
      {
        date: 'Feb 10, 2026',
        weight: '81.0 kg',
        temp: '36.7 °C',
        hr: '80 bpm',
        bp: '134/86',
        fbs: '98 mg/dL',
      },
    ],
    medicalRecords: [
      {
        id: 'r3',
        title: 'Lipid Profile & BP Log',
        type: 'Lab Result',
        date: '2026-05-20',
        author: 'Dr. Stephen Adeyemi',
        details: 'LDL 110 mg/dL, HDL 48 mg/dL. BP well controlled on Lisinopril 10mg.',
        fileUrl: '/images/serviceimage.jpg',
      },
      {
        id: 'r4',
        title: 'Lisinopril 10mg',
        type: 'Prescription',
        date: '2026-05-20',
        author: 'Dr. Stephen Adeyemi',
        details: 'Take 1 tablet daily in the morning.',
        fileUrl: '/images/serviceimage1.jpg',
      },
    ],
    visitHistory: [
      {
        date: 'May 20',
        year: '2026',
        title: 'Hypertension Routine Review',
        summary: 'Blood pressure improved. Continue Lisinopril 10mg daily and regular exercise.',
      },
      {
        date: 'Feb 10',
        year: '2026',
        title: 'Cardiovascular Evaluation',
        summary: 'Mild BP elevation noted. Dietary sodium restriction advised.',
      },
    ],
  },
  {
    id: '3',
    name: 'Cameron Williamson',
    avatar: '/images/sarah_avatar.png',
    gender: 'Male',
    age: 37,
    bloodType: 'AB+',
    visitsCount: 6,
    since: 'March 2024',
    contact: 'cameron.w@email.com · +1 (312) 555-0811',
    address: '122 Oak Street, Chicago, IL 60614',
    condition: 'Asthma Follow-up',
    lastVisit: 'May 24, 2026',
    nextAppointment: 'June 3, 2026',
    vitals: {
      bp: '120/78',
      hr: '70',
      weight: '168',
      tsh: '98%',
      biomarkerName: 'Oxygen Saturation',
    },
    summary: {
      totalVisits: 6,
      lastVisit: 'May 24, 2026',
      nextAppointment: 'June 3, 2026',
      medicalRecordsCount: 2,
    },
    vitalsHistory: [
      {
        date: 'May 24, 2026',
        weight: '76.2 kg',
        temp: '36.6 °C',
        hr: '70 bpm',
        bp: '120/78',
        fbs: '90 mg/dL',
      },
    ],
    medicalRecords: [
      {
        id: 'r5',
        title: 'Spirometry Function Test',
        type: 'Lab Result',
        date: '2026-05-24',
        author: 'Dr. Stephen Adeyemi',
        details: 'FEV1 92% predicted. Mild reversible airway obstruction.',
        fileUrl: '/images/serviceimage2.jpg',
      },
      {
        id: 'r6',
        title: 'Albuterol HFA Inhaler',
        type: 'Prescription',
        date: '2026-05-24',
        author: 'Dr. Stephen Adeyemi',
        details: '2 puffs every 4 to 6 hours as needed for shortness of breath.',
        fileUrl: '/images/serviceimage.jpg',
      },
    ],
    visitHistory: [
      {
        date: 'May 24',
        year: '2026',
        title: 'Pulmonary Assessment',
        summary: 'Symptoms well controlled on inhaler. Next follow-up in June.',
      },
    ],
  },
  {
    id: '4',
    name: 'Jerome Bell',
    avatar: '/images/stephen.jpg',
    gender: 'Male',
    age: 37,
    bloodType: 'AB+',
    visitsCount: 6,
    since: 'August 2023',
    contact: 'jerome.b@email.com · +1 (312) 555-0377',
    address: '710 Dearborn St, Chicago, IL 60605',
    condition: 'Type 2 Diabetes',
    lastVisit: 'May 30, 2026',
    nextAppointment: 'June 3, 2026',
    vitals: {
      bp: '122/80',
      hr: '74',
      weight: '182',
      tsh: '6.2%',
      biomarkerName: 'HbA1c',
    },
    summary: {
      totalVisits: 6,
      lastVisit: 'May 30, 2026',
      nextAppointment: 'June 3, 2026',
      medicalRecordsCount: 5,
    },
    vitalsHistory: [
      {
        date: 'May 30, 2026',
        weight: '82.5 kg',
        temp: '36.5 °C',
        hr: '74 bpm',
        bp: '122/80',
        fbs: '104 mg/dL',
      },
    ],
    medicalRecords: [
      {
        id: 'r7',
        title: 'HbA1c Glycated Hemoglobin',
        type: 'Lab Result',
        date: '2026-05-30',
        author: 'Dr. Stephen Adeyemi',
        details: 'HbA1c 6.2% (Target < 7.0%). Excellent glycemic control.',
        fileUrl: '/images/serviceimage1.jpg',
      },
      {
        id: 'r8',
        title: 'Metformin 500mg ER',
        type: 'Prescription',
        date: '2026-05-30',
        author: 'Dr. Stephen Adeyemi',
        details: 'Take 1 tablet twice daily with meals.',
        fileUrl: '/images/serviceimage2.jpg',
      },
    ],
    visitHistory: [
      {
        date: 'May 30',
        year: '2026',
        title: 'Diabetic Health Checkup',
        summary: 'Blood glucose stable. Reinforced dietary plan.',
      },
    ],
  },
  {
    id: '5',
    name: 'Robert Fox',
    avatar: '/images/stephen.jpg',
    gender: 'Male',
    age: 37,
    bloodType: 'AB+',
    visitsCount: 6,
    since: 'November 2023',
    contact: 'robert.f@email.com · +1 (312) 555-0942',
    address: '330 LaSalle St, Chicago, IL 60604',
    condition: 'Seasonal Allergies',
    lastVisit: 'May 31, 2026',
    nextAppointment: '---',
    vitals: {
      bp: '116/74',
      hr: '68',
      weight: '160',
      tsh: 'Normal',
      biomarkerName: 'IgE Levels',
    },
    summary: {
      totalVisits: 6,
      lastVisit: 'May 31, 2026',
      nextAppointment: 'None',
      medicalRecordsCount: 2,
    },
    vitalsHistory: [
      {
        date: 'May 31, 2026',
        weight: '72.5 kg',
        temp: '36.4 °C',
        hr: '68 bpm',
        bp: '116/74',
        fbs: '88 mg/dL',
      },
    ],
    medicalRecords: [
      {
        id: 'r9',
        title: 'Cetirizine 10mg',
        type: 'Prescription',
        date: '2026-05-31',
        author: 'Dr. Stephen Adeyemi',
        details: 'Take 1 tablet daily as needed for allergic rhinitis.',
        fileUrl: '/images/serviceimage.jpg',
      },
    ],
    visitHistory: [
      {
        date: 'May 31',
        year: '2026',
        title: 'Allergy Consultation',
        summary: 'Prescribed antihistamines for seasonal pollen exposure.',
      },
    ],
  },
  {
    id: '6',
    name: 'Cody Fisher',
    avatar: '/images/stephen.jpg',
    gender: 'Male',
    age: 37,
    bloodType: 'AB+',
    visitsCount: 6,
    since: 'January 2024',
    contact: 'cody.f@email.com · +1 (312) 555-0211',
    address: '512 Clark Street, Chicago, IL 60607',
    condition: 'Migraine Management',
    lastVisit: 'April 15, 2026',
    nextAppointment: 'June 3, 2026',
    vitals: {
      bp: '118/75',
      hr: '72',
      weight: '170',
      tsh: 'Normal',
      biomarkerName: 'Neurological Exam',
    },
    summary: {
      totalVisits: 6,
      lastVisit: 'April 15, 2026',
      nextAppointment: 'June 3, 2026',
      medicalRecordsCount: 3,
    },
    vitalsHistory: [
      {
        date: 'Apr 15, 2026',
        weight: '77.0 kg',
        temp: '36.5 °C',
        hr: '72 bpm',
        bp: '118/75',
        fbs: '91 mg/dL',
      },
    ],
    medicalRecords: [
      {
        id: 'r10',
        title: 'Sumatriptan 50mg',
        type: 'Prescription',
        date: '2026-04-15',
        author: 'Dr. Stephen Adeyemi',
        details: 'Take 1 tablet at onset of acute migraine headache.',
        fileUrl: '/images/serviceimage1.jpg',
      },
    ],
    visitHistory: [
      {
        date: 'Apr 15',
        year: '2026',
        title: 'Neurology Consultation',
        summary: 'Frequency of migraines reduced. Routine follow-up scheduled.',
      },
    ],
  },
  {
    id: '7',
    name: 'Theresa Webb',
    avatar: '/images/sarah_avatar.png',
    gender: 'Female',
    age: 37,
    bloodType: 'A+',
    visitsCount: 6,
    since: 'February 2024',
    contact: 'theresa.w@email.com · +1 (312) 555-0633',
    address: '901 Wabash Ave, Chicago, IL 60605',
    condition: 'Vitamin D Deficiency',
    lastVisit: 'May 20, 2026',
    nextAppointment: '---',
    vitals: {
      bp: '114/72',
      hr: '66',
      weight: '138',
      tsh: '42 ng/mL',
      biomarkerName: '25-OH Vitamin D',
    },
    summary: {
      totalVisits: 6,
      lastVisit: 'May 20, 2026',
      nextAppointment: 'None',
      medicalRecordsCount: 2,
    },
    vitalsHistory: [
      {
        date: 'May 20, 2026',
        weight: '62.5 kg',
        temp: '36.6 °C',
        hr: '66 bpm',
        bp: '114/72',
        fbs: '86 mg/dL',
      },
    ],
    medicalRecords: [
      {
        id: 'r11',
        title: 'Ergocalciferol 50,000 IU',
        type: 'Prescription',
        date: '2026-05-20',
        author: 'Dr. Stephen Adeyemi',
        details: 'Take 1 capsule weekly for 8 weeks.',
        fileUrl: '/images/serviceimage2.jpg',
      },
    ],
    visitHistory: [
      {
        date: 'May 20',
        year: '2026',
        title: 'Nutritional Follow-up',
        summary: 'Vitamin D levels improving. Maintain weekly supplement dose.',
      },
    ],
  },
  {
    id: '8',
    name: 'Marvin McKinney',
    avatar: '/images/stephen.jpg',
    gender: 'Male',
    age: 37,
    bloodType: 'AB+',
    visitsCount: 6,
    since: 'May 2024',
    contact: 'marvin.m@email.com · +1 (312) 555-0789',
    address: '610 Adams St, Chicago, IL 60606',
    condition: 'Routine Physical Checkup',
    lastVisit: 'June 18, 2026',
    nextAppointment: 'June 3, 2026',
    vitals: {
      bp: '120/78',
      hr: '72',
      weight: '172',
      tsh: 'Normal',
      biomarkerName: 'Overall Physical',
    },
    summary: {
      totalVisits: 6,
      lastVisit: 'June 18, 2026',
      nextAppointment: 'June 3, 2026',
      medicalRecordsCount: 1,
    },
    vitalsHistory: [
      {
        date: 'June 18, 2026',
        weight: '78.0 kg',
        temp: '36.5 °C',
        hr: '72 bpm',
        bp: '120/78',
        fbs: '89 mg/dL',
      },
    ],
    medicalRecords: [
      {
        id: 'r12',
        title: 'Annual Physical Clearance Report',
        type: 'Clinical Progress Note',
        date: '2026-06-18',
        author: 'Dr. Stephen Adeyemi',
        details: 'Patient in overall excellent health. Clearance granted for sport activities.',
        fileUrl: '/images/serviceimage.jpg',
      },
    ],
    visitHistory: [
      {
        date: 'June 18',
        year: '2026',
        title: 'Annual Wellness Exam',
        summary: 'All vital signs normal. Scheduled preventive screening for next year.',
      },
    ],
  },
];
