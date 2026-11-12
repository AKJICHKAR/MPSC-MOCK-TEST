import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  User,
  Exam,
  Subject,
  Topic,
  Question,
  MockTest,
  PromoCode,
  PaymentRecord,
  TestEnrollment,
  TestAttempt,
  TestResult,
  TestPackage,
  PackageEnrollment
} from '../src/types';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'mpsc_store.json');

// Interface for full database store
export interface DatabaseSchema {
  users: (User & { password_hash: string })[];
  exams: Exam[];
  subjects: Subject[];
  topics: Topic[];
  questions: Question[];
  tests: MockTest[];
  test_questions: { id: string; test_id: string; question_id: string; question_order: number }[];
  packages: TestPackage[];
  package_tests: { id: string; package_id: string; test_id: string; sort_order: number }[];
  package_enrollments: PackageEnrollment[];
  promo_codes: PromoCode[];
  payments: PaymentRecord[];
  enrollments: TestEnrollment[];
  attempts: TestAttempt[];
  results: TestResult[];
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_mpsc_salt_2026').digest('hex');
}

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed dataset with rich bilingual MPSC syllabus questions
function getInitialSeedData(): DatabaseSchema {
  const adminId = 'u_admin_001';
  const studentId = 'u_student_001';

  const exams: Exam[] = [
    {
      id: 'exam_rajyaseva',
      code: 'RAJYASEVA',
      title_en: 'MPSC State Services (Rajyaseva)',
      title_mr: 'महाराष्ट्र नागरी सेवा राजपत्रित (राज्यसेवा)',
      description_en: 'Class 1 & Class 2 Gazetted posts including Deputy Collector, DySP, Tehsildar, etc.',
      description_mr: 'उपजिल्हाधिकारी, डीवायएसपी, तहसीलदार आदी वर्ग-१ व वर्ग-२ पदांसाठीची परीक्षा.',
      is_active: true
    },
    {
      id: 'exam_combine_b',
      code: 'COMBINE_B',
      title_en: 'MPSC Combine Group B (Non-Gazetted)',
      title_mr: 'महाराष्ट्र दुय्यम सेवा गट-ब (अराजपत्रित संयुक्त)',
      description_en: 'Police Sub Inspector (PSI), State Tax Inspector (STI), Assistant Section Officer (ASO).',
      description_mr: 'पोलीस उपनिरीक्षक (PSI), राज्य कर निरीक्षक (STI), सहाय्यक कक्ष अधिकारी (ASO).',
      is_active: true
    },
    {
      id: 'exam_combine_c',
      code: 'COMBINE_C',
      title_en: 'MPSC Combine Group C',
      title_mr: 'महाराष्ट्र दुय्यम सेवा गट-क (अराजपत्रित संयुक्त)',
      description_en: 'Tax Assistant, Clerk-Typist, Excise Sub Inspector, Industry Inspector.',
      description_mr: 'कर सहाय्यक, लिपिक-टंकलेखक, दुय्यम निरीक्षक उत्पादन शुल्क.',
      is_active: true
    }
  ];

  const subjects: Subject[] = [
    {
      id: 'sub_polity',
      exam_id: 'exam_rajyaseva',
      code: 'POLITY',
      name_en: 'Indian Polity & Governance',
      name_mr: 'भारतीय राज्यघटना व शासन',
      description_en: 'Constitution, Fundamental Rights, Parliament, Panchayati Raj in Maharashtra',
      description_mr: 'राज्यघटना, मूलभूत हक्क, संसद आणि महाराष्ट्रातील पंचायत राज'
    },
    {
      id: 'sub_geography',
      exam_id: 'exam_rajyaseva',
      code: 'GEOGRAPHY',
      name_en: 'Geography of Maharashtra & India',
      name_mr: 'महाराष्ट्र व भारताचा भूगोल',
      description_en: 'Physiography, Rivers (Godavari, Krishna, Tapi), Climate, Agriculture & Minerals',
      description_mr: 'प्राकृतिक रचना, नद्या (गोदावरी, कृष्णा, तापी), हवामान, शेती व खनिजे'
    },
    {
      id: 'sub_history',
      exam_id: 'exam_rajyaseva',
      code: 'HISTORY',
      name_en: 'History of Modern India & Maharashtra',
      name_mr: 'आधुनिक भारताचा व महाराष्ट्राचा इतिहास',
      description_en: '1857 Revolt, Social Reformers (Phule, Ambedkar, Shahu Maharaj), Freedom Movement',
      description_mr: '१८५७ चा उठाव, समाजसुधारक (फुले, आंबेडकर, शाहू महाराज), स्वातंत्र्य लढा'
    },
    {
      id: 'sub_economy',
      exam_id: 'exam_rajyaseva',
      code: 'ECONOMY',
      name_en: 'Indian & Maharashtra Economy',
      name_mr: 'भारतीय व महाराष्ट्राची अर्थव्यवस्था',
      description_en: 'National Income, NITI Aayog, GST, Inflation, Maharashtra Budget',
      description_mr: 'राष्ट्रीय उत्पन्न, नीती आयोग, जीएसटी, चलनवाढ, महाराष्ट्राचा अर्थसंकल्प'
    },
    {
      id: 'sub_science',
      exam_id: 'exam_rajyaseva',
      code: 'SCIENCE',
      name_en: 'General Science & Technology',
      name_mr: 'सामान्य विज्ञान व तंत्रज्ञान',
      description_en: 'Physics, Chemistry, Biology, Environmental Ecology, ISRO Space Missions',
      description_mr: 'भौतिकशास्त्र, रसायनशास्त्र, जीवशास्त्र, पर्यावरण आणि इस्रो मोहिमा'
    },
    {
      id: 'sub_marathi',
      exam_id: 'exam_combine_b',
      code: 'MARATHI',
      name_en: 'Marathi Grammar & Language',
      name_mr: 'मराठी व्याकरण व भाषा',
      description_en: 'Vyakaran, Sandhi, Samas, Prayog, Alankar, Shuddhalekhan',
      description_mr: 'संधी, समास, प्रयोग, अलंकार, म्हणी, वाक्प्रचार व शुद्धलेखन'
    },
    {
      id: 'sub_csat',
      exam_id: 'exam_rajyaseva',
      code: 'CSAT',
      name_en: 'Mental Ability & Quantitative Aptitude',
      name_mr: 'बुद्धिमत्ता चाचणी व अंकगणित',
      description_en: 'Logical Reasoning, Data Interpretation, Arithmetic, Decision Making',
      description_mr: 'तर्कक्षमता, संख्या मालिका, विधाने व निष्कर्ष, अंकगणित'
    }
  ];

  const topics: Topic[] = [
    { id: 'top_const_amend', subject_id: 'sub_polity', name_en: 'Constitutional Amendments & Panchayati Raj', name_mr: 'घटनादुरुस्त्या व पंचायत राज' },
    { id: 'top_mh_rivers', subject_id: 'sub_geography', name_en: 'Drainage System of Maharashtra', name_mr: 'महाराष्ट्राची जलप्रणाली व नद्या' },
    { id: 'top_mh_reformers', subject_id: 'sub_history', name_en: 'Social Reform Movement in Maharashtra', name_mr: 'महाराष्ट्रातील समाजसुधारणा चळवळ' },
    { id: 'top_samas', subject_id: 'sub_marathi', name_en: 'Samas & Prayog in Marathi', name_mr: 'समास व प्रयोग' },
    { id: 'top_reasoning', subject_id: 'sub_csat', name_en: 'Coding-Decoding & Number Series', name_mr: 'सांकेतिक भाषा व संख्या मालिका' }
  ];

  const questions: Question[] = [
    {
      id: 'q_001',
      exam_id: 'exam_rajyaseva',
      subject_id: 'sub_polity',
      topic_id: 'top_const_amend',
      difficulty: 'medium',
      question_en: 'Under which Constitutional Amendment Act was the Panchayati Raj system granted constitutional status in India?',
      question_mr: 'भारतात कोणत्या घटनादुरुस्ती कायद्यान्वये पंचायत राज व्यवस्थेला घटनात्मक दर्जा प्रदान करण्यात आला?',
      explanation_en: 'The 73rd Constitutional Amendment Act, 1992 added Part IX and the 11th Schedule to the Indian Constitution, granting constitutional status to Panchayati Raj institutions.',
      explanation_mr: '७३ व्या घटनादुरुस्ती कायदा, १९९२ अन्वये भारतीय संविधानात भाग ९ आणि ११ वी अनुसूची समाविष्ट करून पंचायत राज संस्थांना घटनात्मक दर्जा देण्यात आला.',
      marks: 2,
      negative_marks: 0.5,
      is_active: true,
      options: [
        { id: 'opt_001_1', question_id: 'q_001', option_key: '1', text_en: '71st Amendment Act, 1992', text_mr: '७१ वी घटनादुरुस्ती कायदा, १९९२', is_correct: false, sort_order: 1 },
        { id: 'opt_001_2', question_id: 'q_001', option_key: '2', text_en: '73rd Amendment Act, 1992', text_mr: '७३ वी घटनादुरुस्ती कायदा, १९९२', is_correct: true, sort_order: 2 },
        { id: 'opt_001_3', question_id: 'q_001', option_key: '3', text_en: '74th Amendment Act, 1992', text_mr: '७४ वी घटनादुरुस्ती कायदा, १९९२', is_correct: false, sort_order: 3 },
        { id: 'opt_001_4', question_id: 'q_001', option_key: '4', text_en: '86th Amendment Act, 2002', text_mr: '८६ वी घटनादुरुस्ती कायदा, २००२', is_correct: false, sort_order: 4 }
      ]
    },
    {
      id: 'q_002',
      exam_id: 'exam_rajyaseva',
      subject_id: 'sub_geography',
      topic_id: 'top_mh_rivers',
      difficulty: 'medium',
      question_en: 'Which river basin covers the largest geographic area in the state of Maharashtra?',
      question_mr: 'महाराष्ट्राच्या एकूण भौगोलिक क्षेत्रापैकी सर्वाधिक क्षेत्र कोणत्या नदीच्या खोऱ्याने व्यापले आहे?',
      explanation_en: 'The Godavari river basin is the largest in Maharashtra, occupying approximately 49% of the state’s total land area.',
      explanation_mr: 'गोदावरी नदी खोरे महाराष्ट्रातील सर्वात मोठे नदी खोरे असून ते राज्याच्या एकूण क्षेत्रफळाच्या सुमारे ४९% क्षेत्र व्यापते.',
      marks: 2,
      negative_marks: 0.5,
      is_active: true,
      options: [
        { id: 'opt_002_1', question_id: 'q_002', option_key: '1', text_en: 'Krishna River Basin', text_mr: 'कृष्णा नदी खोरे', is_correct: false, sort_order: 1 },
        { id: 'opt_002_2', question_id: 'q_002', option_key: '2', text_en: 'Tapi-Purna Basin', text_mr: 'तापी-पूर्णा खोरे', is_correct: false, sort_order: 2 },
        { id: 'opt_002_3', question_id: 'q_002', option_key: '3', text_en: 'Godavari River Basin', text_mr: 'गोदावरी नदी खोरे', is_correct: true, sort_order: 3 },
        { id: 'opt_002_4', question_id: 'q_002', option_key: '4', text_en: 'Bhima River Basin', text_mr: 'भीमा नदी खोरे', is_correct: false, sort_order: 4 }
      ]
    },
    {
      id: 'q_003',
      exam_id: 'exam_rajyaseva',
      subject_id: 'sub_history',
      topic_id: 'top_mh_reformers',
      difficulty: 'easy',
      question_en: 'In which year did Mahatma Jyotirao Phule establish the Satyashodhak Samaj in Pune?',
      question_mr: 'महात्मा ज्योतिराव फुले यांनी पुण्यामध्ये सत्यशोधक समाजाची स्थापना कोणत्या वर्षी केली?',
      explanation_en: 'Mahatma Jyotirao Phule founded the Satyashodhak Samaj on 24 September 1873 to promote social equality, education for the oppressed, and women’s emancipation.',
      explanation_mr: 'महात्मा ज्योतिराव फुले यांनी २४ सप्टेंबर १८७३ रोजी बहुजन समाजाच्या उद्धारासाठी व सामाजिक समतेसाठी सत्यशोधक समाजाची स्थापना केली.',
      marks: 2,
      negative_marks: 0.5,
      is_active: true,
      options: [
        { id: 'opt_003_1', question_id: 'q_003', option_key: '1', text_en: '1848', text_mr: '१८४८', is_correct: false, sort_order: 1 },
        { id: 'opt_003_2', question_id: 'q_003', option_key: '2', text_en: '1873', text_mr: '१८७३', is_correct: true, sort_order: 2 },
        { id: 'opt_003_3', question_id: 'q_003', option_key: '3', text_en: '1885', text_mr: '१८८५', is_correct: false, sort_order: 3 },
        { id: 'opt_003_4', question_id: 'q_003', option_key: '4', text_en: '1902', text_mr: '१९०२', is_correct: false, sort_order: 4 }
      ]
    },
    {
      id: 'q_004',
      exam_id: 'exam_combine_b',
      subject_id: 'sub_marathi',
      topic_id: 'top_samas',
      difficulty: 'easy',
      question_en: 'Identify the type of Samas (Compound Word) in the word "यथाशक्ती" (Yathashakti):',
      question_mr: '"यथाशक्ती" या सामासिक शब्दाचा समास कोणता ते ओळखा:',
      explanation_en: 'In "यथाशक्ती", the first word "यथा" is an indeclinable Sanskrit prefix (Avyaya) denoting "according to". Therefore, it is an Avyayibhava Samas.',
      explanation_mr: '"यथाशक्ती" या शब्दात पहिले पद "यथा" हे अव्यय असून ते महत्त्वाचे आहे, म्हणून हा अव्ययीभाव समास आहे (शक्तीप्रमाणे).',
      marks: 2,
      negative_marks: 0.5,
      is_active: true,
      options: [
        { id: 'opt_004_1', question_id: 'q_004', option_key: '1', text_en: 'Tatpurush Samas', text_mr: 'तत्पुरुष समास', is_correct: false, sort_order: 1 },
        { id: 'opt_004_2', question_id: 'q_004', option_key: '2', text_en: 'Dwandwa Samas', text_mr: 'द्वंद्व समास', is_correct: false, sort_order: 2 },
        { id: 'opt_004_3', question_id: 'q_004', option_key: '3', text_en: 'Avyayibhava Samas', text_mr: 'अव्ययीभाव समास', is_correct: true, sort_order: 3 },
        { id: 'opt_004_4', question_id: 'q_004', option_key: '4', text_en: 'Bahuvrihi Samas', text_mr: 'बहुव्रीही समास', is_correct: false, sort_order: 4 }
      ]
    },
    {
      id: 'q_005',
      exam_id: 'exam_rajyaseva',
      subject_id: 'sub_csat',
      topic_id: 'top_reasoning',
      difficulty: 'medium',
      question_en: 'Find the missing number in the following series: 3, 7, 15, 31, 63, ?',
      question_mr: 'खालील संख्या मालिकेत प्रश्नचिन्हाच्या (?) जागी येणारी संख्या शोधा: ३, ७, १५, ३१, ६३, ?',
      explanation_en: 'Pattern is: (Previous number * 2) + 1. (3*2+1=7), (7*2+1=15), (15*2+1=31), (31*2+1=63), (63*2+1 = 127).',
      explanation_mr: 'नियम: मागील संख्येची दुप्पट अधिक १. ३×२+१=७, ७×२+१=१५, १५×२+१=३१, ३१×२+१=६३, ६३×२+१ = १२७.',
      marks: 2,
      negative_marks: 0.5,
      is_active: true,
      options: [
        { id: 'opt_005_1', question_id: 'q_005', option_key: '1', text_en: '124', text_mr: '१२४', is_correct: false, sort_order: 1 },
        { id: 'opt_005_2', question_id: 'q_005', option_key: '2', text_en: '127', text_mr: '१२७', is_correct: true, sort_order: 2 },
        { id: 'opt_005_3', question_id: 'q_005', option_key: '3', text_en: '129', text_mr: '१२९', is_correct: false, sort_order: 3 },
        { id: 'opt_005_4', question_id: 'q_005', option_key: '4', text_en: '135', text_mr: '१३५', is_correct: false, sort_order: 4 }
      ]
    },
    {
      id: 'q_006',
      exam_id: 'exam_rajyaseva',
      subject_id: 'sub_economy',
      topic_id: 'top_const_amend',
      difficulty: 'hard',
      question_en: 'Which Committee recommended the introduction of the Goods and Services Tax (GST) in India?',
      question_mr: 'भारतात वस्तू व सेवा कर (GST) लागू करण्याची शिफारस कोणत्या कार्यगटाने / समितीने केली होती?',
      explanation_en: 'The Kelkar Task Force on Implementation of the FRBM Act (2004) strongly advocated for a comprehensive national Goods and Services Tax (GST).',
      explanation_mr: 'विजय केळकर कार्यगटाने (Kelkar Task Force, 2004) भारतात एकात्मिक वस्तू व सेवा कर (GST) लागू करण्याची प्रमुख शिफारस केली होती.',
      marks: 2,
      negative_marks: 0.5,
      is_active: true,
      options: [
        { id: 'opt_006_1', question_id: 'q_006', option_key: '1', text_en: 'Chelliah Committee', text_mr: 'राजा चेलय्या समिती', is_correct: false, sort_order: 1 },
        { id: 'opt_006_2', question_id: 'q_006', option_key: '2', text_en: 'Kelkar Task Force', text_mr: 'विजय केळकर कार्यगट', is_correct: true, sort_order: 2 },
        { id: 'opt_006_3', question_id: 'q_006', option_key: '3', text_en: 'Rangarajan Committee', text_mr: 'सी. रंगराजन समिती', is_correct: false, sort_order: 3 },
        { id: 'opt_006_4', question_id: 'q_006', option_key: '4', text_en: 'Tarapore Committee', text_mr: 'एस. एस. तारापोर समिती', is_correct: false, sort_order: 4 }
      ]
    },
    {
      id: 'q_007',
      exam_id: 'exam_rajyaseva',
      subject_id: 'sub_science',
      topic_id: 'top_const_amend',
      difficulty: 'medium',
      question_en: 'Which gland in the human body is known as the "Master Gland"?',
      question_mr: 'मानवी शरीरातील कोणत्या ग्रंथीला "मास्टर ग्रंथी" (मुख्य ग्रंथी) म्हणून ओळखले जाते?',
      explanation_en: 'The pituitary gland produces hormones that control many functions of other endocrine glands, hence termed the master gland.',
      explanation_mr: 'पियुषिका ग्रंथी (Pituitary Gland) इतर सर्व आंतरस्रावी ग्रंथींच्या कार्याचे नियंत्रण करते, म्हणून तिला मास्टर ग्रंथी म्हणतात.',
      marks: 2,
      negative_marks: 0.5,
      is_active: true,
      options: [
        { id: 'opt_007_1', question_id: 'q_007', option_key: '1', text_en: 'Thyroid Gland', text_mr: 'थायरॉईड ग्रंथी', is_correct: false, sort_order: 1 },
        { id: 'opt_007_2', question_id: 'q_007', option_key: '2', text_en: 'Pituitary Gland', text_mr: 'पियुषिका ग्रंथी (Pituitary)', is_correct: true, sort_order: 2 },
        { id: 'opt_007_3', question_id: 'q_007', option_key: '3', text_en: 'Adrenal Gland', text_mr: 'अधिवृक्क ग्रंथी (Adrenal)', is_correct: false, sort_order: 3 },
        { id: 'opt_007_4', question_id: 'q_007', option_key: '4', text_en: 'Pancreas', text_mr: 'स्वादुपिंड (Pancreas)', is_correct: false, sort_order: 4 }
      ]
    },
    {
      id: 'q_008',
      exam_id: 'exam_combine_b',
      subject_id: 'sub_polity',
      topic_id: 'top_const_amend',
      difficulty: 'hard',
      question_en: 'According to Article 213 of the Constitution of India, who has the power to promulgate Ordinances during the recess of the State Legislature?',
      question_mr: 'भारतीय संविधानाच्या कलम २१३ अन्वये, राज्य विधिमंडळाचे अधिवेशन चालू नसताना वटहुकूम काढण्याचा अधिकार कोणास आहे?',
      explanation_en: 'Article 213 empowers the Governor of a state to promulgate ordinances during the recess of the state legislature if circumstances require immediate action.',
      explanation_mr: 'कलम २१३ अन्वये राज्यपालांना विधिमंडळाचे अधिवेशन चालू नसताना तातडीच्या परिस्थितीत वटहुकूम काढण्याचे अधिकार दिलेले आहेत.',
      marks: 2,
      negative_marks: 0.5,
      is_active: true,
      options: [
        { id: 'opt_008_1', question_id: 'q_008', option_key: '1', text_en: 'Chief Minister', text_mr: 'मुख्यमंत्री', is_correct: false, sort_order: 1 },
        { id: 'opt_008_2', question_id: 'q_008', option_key: '2', text_en: 'Governor', text_mr: 'राज्यपाल', is_correct: true, sort_order: 2 },
        { id: 'opt_008_3', question_id: 'q_008', option_key: '3', text_en: 'Chief Justice of High Court', text_mr: 'उच्च न्यायालयाचे मुख्य न्यायाधीश', is_correct: false, sort_order: 3 },
        { id: 'opt_008_4', question_id: 'q_008', option_key: '4', text_en: 'Speaker of Legislative Assembly', text_mr: 'विधानसभा अध्यक्ष', is_correct: false, sort_order: 4 }
      ]
    }
  ];

  const tests: MockTest[] = [
    {
      id: 'test_mpsc_gs1_full',
      exam_id: 'exam_rajyaseva',
      title_en: 'MPSC Rajyaseva Prelims GS Paper 1 Mock #1',
      title_mr: 'राज्यसेवा पूर्व परीक्षा पेपर-१ संपूर्ण सराव टेस्ट १',
      description_en: 'Comprehensive full-length mock test based on latest MPSC syllabus with negative marking (1/4th penalty).',
      description_mr: 'एमपीएससी च्या ताज्या अभ्यासक्रमावर आधारित संपूर्ण सराव चाचणी. १/४ निगेटिव्ह मार्किंगसह.',
      duration_minutes: 60,
      total_marks: 100,
      passing_marks: 40,
      negative_mark_factor: 0.25,
      price: 199,
      is_published: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'test_mpsc_combine_b_mock',
      exam_id: 'exam_combine_b',
      title_en: 'MPSC Combine Group B Prelims Mock Test #1',
      title_mr: 'संयुक्त गट-ब पूर्व परीक्षा विशेष सराव टेस्ट #१',
      description_en: 'Focused on PSI, STI, ASO syllabus with Maharashtra Geography, History, and Polity coverage.',
      description_mr: 'पीएसआय, एसटीआय, एएसओ परीक्षेसाठी भूगोल, इतिहास, राज्यव्यवस्था विषयांवर आधारित टेस्ट.',
      duration_minutes: 60,
      total_marks: 100,
      passing_marks: 42,
      negative_mark_factor: 0.25,
      price: 149,
      is_published: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'test_marathi_free',
      exam_id: 'exam_combine_b',
      title_en: 'MPSC Marathi Vyakaran Diagnostic Test (Free)',
      title_mr: 'मराठी व्याकरण विनामूल्य सराव चाचणी (Free Starter)',
      description_en: 'Free starter test covering Samas, Sandhi, Prayog, and vocabulary for MPSC aspirants.',
      description_mr: 'सर्व विद्यार्थ्यांसाठी मोफत सराव चाचणी - समास, प्रयोग, संधी आणि शब्दसंग्रह.',
      duration_minutes: 30,
      total_marks: 50,
      passing_marks: 20,
      negative_mark_factor: 0.25,
      price: 0,
      is_published: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'test_csat_speed',
      exam_id: 'exam_rajyaseva',
      title_en: 'MPSC CSAT & Mental Ability Speed Booster',
      title_mr: 'सीएसएटी बुद्धिमत्ता व अंकगणित स्पीड बुस्टर टेस्ट',
      description_en: 'Targeted reasoning and arithmetic questions to boost speed and score high in Paper 2.',
      description_mr: 'पेपर-२ मधील गती व अचूकता वाढवण्यासाठी विशेष तर्कक्षमता व अंकगणित टेस्ट.',
      duration_minutes: 45,
      total_marks: 50,
      passing_marks: 25,
      negative_mark_factor: 0.25,
      price: 99,
      is_published: true,
      created_at: new Date().toISOString()
    }
  ];

  // Map questions to tests
  const test_questions = [
    { id: 'tq_1', test_id: 'test_mpsc_gs1_full', question_id: 'q_001', question_order: 1 },
    { id: 'tq_2', test_id: 'test_mpsc_gs1_full', question_id: 'q_002', question_order: 2 },
    { id: 'tq_3', test_id: 'test_mpsc_gs1_full', question_id: 'q_003', question_order: 3 },
    { id: 'tq_4', test_id: 'test_mpsc_gs1_full', question_id: 'q_005', question_order: 4 },
    { id: 'tq_5', test_id: 'test_mpsc_gs1_full', question_id: 'q_006', question_order: 5 },
    { id: 'tq_6', test_id: 'test_mpsc_gs1_full', question_id: 'q_007', question_order: 6 },
    { id: 'tq_7', test_id: 'test_mpsc_combine_b_mock', question_id: 'q_001', question_order: 1 },
    { id: 'tq_8', test_id: 'test_mpsc_combine_b_mock', question_id: 'q_002', question_order: 2 },
    { id: 'tq_9', test_id: 'test_mpsc_combine_b_mock', question_id: 'q_004', question_order: 3 },
    { id: 'tq_10', test_id: 'test_mpsc_combine_b_mock', question_id: 'q_008', question_order: 4 },
    { id: 'tq_11', test_id: 'test_marathi_free', question_id: 'q_004', question_order: 1 },
    { id: 'tq_12', test_id: 'test_marathi_free', question_id: 'q_003', question_order: 2 },
    { id: 'tq_13', test_id: 'test_csat_speed', question_id: 'q_005', question_order: 1 }
  ];

  const promo_codes: PromoCode[] = [
    {
      id: 'promo_mpsc2026',
      code: 'MPSC2026',
      discount_type: 'percentage',
      discount_value: 20,
      min_order_amount: 100,
      max_discount_amount: 50,
      usage_limit: 500,
      times_used: 14,
      valid_from: '2025-01-01T00:00:00.000Z',
      valid_until: '2026-12-31T23:59:59.000Z',
      is_active: true,
      eligible_test_ids: []
    },
    {
      id: 'promo_topper50',
      code: 'TOPPER50',
      discount_type: 'percentage',
      discount_value: 50,
      min_order_amount: 150,
      max_discount_amount: 100,
      usage_limit: 100,
      times_used: 3,
      valid_from: '2025-01-01T00:00:00.000Z',
      valid_until: '2026-12-31T23:59:59.000Z',
      is_active: true,
      eligible_test_ids: []
    },
    {
      id: 'promo_save50',
      code: 'SAVE50',
      discount_type: 'fixed',
      discount_value: 50,
      min_order_amount: 149,
      max_discount_amount: 50,
      usage_limit: 200,
      times_used: 8,
      valid_from: '2025-01-01T00:00:00.000Z',
      valid_until: '2026-12-31T23:59:59.000Z',
      is_active: true,
      eligible_test_ids: []
    }
  ];

  const users: (User & { password_hash: string })[] = [
    {
      id: adminId,
      email: 'admin@mpsc.gov',
      password_hash: hashPassword('admin123'),
      full_name: 'MPSC Platform Administrator',
      phone: '+91 9820011223',
      role: 'admin',
      created_at: new Date().toISOString()
    },
    {
      id: studentId,
      email: 'student@mpsc.gov',
      password_hash: hashPassword('student123'),
      full_name: 'Aniket Deshmukh',
      phone: '+91 9890044556',
      role: 'student',
      created_at: new Date().toISOString()
    }
  ];

  const enrollments: TestEnrollment[] = [
    {
      id: 'enr_free_01',
      user_id: studentId,
      test_id: 'test_marathi_free',
      enrolled_at: new Date().toISOString()
    }
  ];

  const payments: PaymentRecord[] = [
    {
      id: 'pay_demo_001',
      user_id: studentId,
      user_name: 'Aniket Deshmukh',
      user_email: 'student@mpsc.gov',
      test_id: 'test_mpsc_gs1_full',
      test_title: 'MPSC Rajyaseva Prelims GS Paper 1 Mock #1',
      razorpay_order_id: 'order_demo_987654321',
      razorpay_payment_id: 'pay_demo_123456789',
      razorpay_signature: 'sig_verified_mock_hmac_sha256',
      amount: 159.20,
      original_amount: 199.00,
      discount_amount: 39.80,
      currency: 'INR',
      status: 'paid',
      promo_code: 'MPSC2026',
      verified_at: new Date(Date.now() - 86400000).toISOString(),
      created_at: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  const packages: TestPackage[] = [
    {
      id: 'pkg_group_c_complete',
      name_en: 'MPSC Group C Complete Mock Test Package (35+ Tests)',
      name_mr: 'एमपीएससी गट-क सर्वसमावेशक टेस्ट सिरीज महा-पॅकेज (३५+ पेपर्स)',
      description_en: 'Complete test series bundle for Clerk-Typist, Tax Assistant, and Excise Sub Inspector with comprehensive syllabus coverage, CSAT, and Marathi grammar.',
      description_mr: 'लिपिक-टंकलेखक, कर सहाय्यक आणि दुय्यम निरीक्षक परीक्षांसाठी परिपूर्ण ३५+ सराव चाचण्यांचा संच. घटकनिहाय व संपूर्ण सराव पेपर्स.',
      image_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80',
      exam_id: 'exam_combine_c',
      price: 499,
      discount_price: 299,
      validity_days: 180,
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'pkg_amvi_mock',
      name_en: 'MPSC AMVI & Technical Services Prelims Package',
      name_mr: 'एमपीएससी सहाय्यक मोटार वाहन निरीक्षक (AMVI) विशेष पॅकेज',
      description_en: 'Targeted mock test pack for Assistant Motor Vehicle Inspector Prelims & Maharashtra Engineering / Technical Services examinations.',
      description_mr: 'सहाय्यक मोटार वाहन निरीक्षक (AMVI) आणि महाराष्ट्र तांत्रिक सेवा पूर्व परीक्षेसाठी विशेष सराव चाचण्यांचा संच.',
      image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
      exam_id: 'exam_combine_b',
      price: 599,
      discount_price: 349,
      validity_days: 365,
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'pkg_rajyaseva_master',
      name_en: 'MPSC Rajyaseva Prelims Master Pack (GS + CSAT)',
      name_mr: 'महाराष्ट्र राज्यसेवा पूर्व परीक्षा महा-सराव पॅक (GS-1 + CSAT)',
      description_en: 'All-inclusive State Services prelims test package with full length GS Paper 1, CSAT Paper 2, and Subject boosters with in-depth analytics.',
      description_mr: 'राज्यसेवा पूर्व परीक्षेसाठी सामान्य अध्ययन पेपर-१ आणि बुद्धिमत्ता चाचणी पेपर-२ च्या संपूर्ण टेस्ट्सचे महा-पॅकेज. अचूक निगेटिव्ह मार्किंग व स्पष्टीकरणांसह.',
      image_url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80',
      exam_id: 'exam_rajyaseva',
      price: 799,
      discount_price: 399,
      validity_days: 365,
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const package_tests = [
    { id: 'pt_1', package_id: 'pkg_group_c_complete', test_id: 'test_mpsc_combine_b_mock', sort_order: 1 },
    { id: 'pt_2', package_id: 'pkg_group_c_complete', test_id: 'test_marathi_free', sort_order: 2 },
    { id: 'pt_3', package_id: 'pkg_group_c_complete', test_id: 'test_csat_speed', sort_order: 3 },
    { id: 'pt_4', package_id: 'pkg_amvi_mock', test_id: 'test_mpsc_gs1_full', sort_order: 1 },
    { id: 'pt_5', package_id: 'pkg_amvi_mock', test_id: 'test_csat_speed', sort_order: 2 },
    { id: 'pt_6', package_id: 'pkg_amvi_mock', test_id: 'test_mpsc_combine_b_mock', sort_order: 3 },
    { id: 'pt_7', package_id: 'pkg_rajyaseva_master', test_id: 'test_mpsc_gs1_full', sort_order: 1 },
    { id: 'pt_8', package_id: 'pkg_rajyaseva_master', test_id: 'test_csat_speed', sort_order: 2 },
    { id: 'pt_9', package_id: 'pkg_rajyaseva_master', test_id: 'test_mpsc_combine_b_mock', sort_order: 3 },
    { id: 'pt_10', package_id: 'pkg_rajyaseva_master', test_id: 'test_marathi_free', sort_order: 4 }
  ];

  return {
    users,
    exams,
    subjects,
    topics,
    questions,
    tests,
    test_questions,
    packages,
    package_tests,
    package_enrollments: [],
    promo_codes,
    payments,
    enrollments,
    attempts: [],
    results: []
  };
}

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure all required keys exist and migrate if needed
        if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.questions)) {
          parsed.packages = parsed.packages || [];
          parsed.package_tests = parsed.package_tests || [];
          parsed.package_enrollments = parsed.package_enrollments || [];
          
          if (parsed.packages.length === 0) {
            const initial = getInitialSeedData();
            parsed.packages = initial.packages;
            parsed.package_tests = initial.package_tests;
            parsed.package_enrollments = initial.package_enrollments;
          }
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Could not read existing database file, initializing seed data:', err);
    }

    const initial = getInitialSeedData();
    this.saveData(initial);
    return initial;
  }

  public saveData(customData?: DatabaseSchema): void {
    const toSave = customData || this.data;
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(toSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  // --- Users & Auth ---
  public findUserByEmail(email: string) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string) {
    return this.data.users.find(u => u.id === id);
  }

  public createUser(email: string, passwordHash: string, fullName: string, role: 'admin' | 'student', phone?: string) {
    const newUser = {
      id: 'u_' + crypto.randomUUID().slice(0, 8),
      email: email.toLowerCase(),
      password_hash: passwordHash,
      full_name: fullName,
      phone,
      role,
      created_at: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.saveData();
    return newUser;
  }

  public getAllUsers() {
    return this.data.users.map(({ password_hash, ...rest }) => rest);
  }

  // --- Exams, Subjects, Topics ---
  public getExams() {
    return this.data.exams;
  }

  public getSubjects(examId?: string) {
    if (examId) {
      return this.data.subjects.filter(s => s.exam_id === examId);
    }
    return this.data.subjects;
  }

  public getTopics(subjectId?: string) {
    if (subjectId) {
      return this.data.topics.filter(t => t.subject_id === subjectId);
    }
    return this.data.topics;
  }

  public addTopic(subjectId: string, nameEn: string, nameMr: string) {
    const newTopic: Topic = {
      id: 'top_' + crypto.randomUUID().slice(0, 8),
      subject_id: subjectId,
      name_en: nameEn,
      name_mr: nameMr
    };
    this.data.topics.push(newTopic);
    this.saveData();
    return newTopic;
  }

  // --- Questions ---
  public getQuestions(filters?: { exam_id?: string; subject_id?: string; difficulty?: string }) {
    let list = this.data.questions;
    if (filters?.exam_id) list = list.filter(q => q.exam_id === filters.exam_id);
    if (filters?.subject_id) list = list.filter(q => q.subject_id === filters.subject_id);
    if (filters?.difficulty) list = list.filter(q => q.difficulty === filters.difficulty);
    return list;
  }

  public getQuestionById(id: string) {
    return this.data.questions.find(q => q.id === id);
  }

  public createQuestion(q: Omit<Question, 'id'>) {
    const id = 'q_' + crypto.randomUUID().slice(0, 8);
    const options = (q.options || []).map((opt, idx) => ({
      ...opt,
      id: opt.id || 'opt_' + crypto.randomUUID().slice(0, 8),
      question_id: id,
      sort_order: idx + 1
    }));

    const newQuestion: Question = {
      ...q,
      id,
      options,
      created_at: new Date().toISOString()
    };
    this.data.questions.push(newQuestion);
    this.saveData();
    return newQuestion;
  }

  public updateQuestion(id: string, updates: Partial<Question>) {
    const index = this.data.questions.findIndex(q => q.id === id);
    if (index === -1) return null;
    this.data.questions[index] = {
      ...this.data.questions[index],
      ...updates
    };
    this.saveData();
    return this.data.questions[index];
  }

  public deleteQuestion(id: string) {
    const index = this.data.questions.findIndex(q => q.id === id);
    if (index === -1) return false;
    this.data.questions.splice(index, 1);
    // remove mappings in test_questions
    this.data.test_questions = this.data.test_questions.filter(tq => tq.question_id !== id);
    this.saveData();
    return true;
  }

  // --- Tests ---
  public getTests(publishedOnly = false) {
    let tests = this.data.tests;
    if (publishedOnly) {
      tests = tests.filter(t => t.is_published);
    }
    // attach question count
    return tests.map(test => {
      const qIds = this.data.test_questions.filter(tq => tq.test_id === test.id).map(tq => tq.question_id);
      return {
        ...test,
        question_count: qIds.length
      };
    });
  }

  public getTestById(id: string, includeFullQuestions = false) {
    const test = this.data.tests.find(t => t.id === id);
    if (!test) return null;

    const mappings = this.data.test_questions
      .filter(tq => tq.test_id === id)
      .sort((a, b) => a.question_order - b.question_order);

    const questions: Question[] = [];
    for (const m of mappings) {
      const q = this.data.questions.find(item => item.id === m.question_id);
      if (q) questions.push(q);
    }

    return {
      ...test,
      question_count: questions.length,
      questions: includeFullQuestions ? questions : undefined
    };
  }

  public createTest(test: Omit<MockTest, 'id'>, questionIds: string[] = []) {
    const id = 'test_' + crypto.randomUUID().slice(0, 8);
    const newTest: MockTest = {
      ...test,
      id,
      created_at: new Date().toISOString()
    };
    this.data.tests.push(newTest);

    // Save test question mappings
    questionIds.forEach((qId, idx) => {
      this.data.test_questions.push({
        id: 'tq_' + crypto.randomUUID().slice(0, 8),
        test_id: id,
        question_id: qId,
        question_order: idx + 1
      });
    });

    this.saveData();
    return newTest;
  }

  public updateTest(id: string, updates: Partial<MockTest>, questionIds?: string[]) {
    const index = this.data.tests.findIndex(t => t.id === id);
    if (index === -1) return null;

    this.data.tests[index] = {
      ...this.data.tests[index],
      ...updates
    };

    if (questionIds) {
      this.data.test_questions = this.data.test_questions.filter(tq => tq.test_id !== id);
      questionIds.forEach((qId, idx) => {
        this.data.test_questions.push({
          id: 'tq_' + crypto.randomUUID().slice(0, 8),
          test_id: id,
          question_id: qId,
          question_order: idx + 1
        });
      });
    }

    this.saveData();
    return this.data.tests[index];
  }

  public deleteTest(id: string) {
    const index = this.data.tests.findIndex(t => t.id === id);
    if (index === -1) return false;
    this.data.tests.splice(index, 1);
    this.data.test_questions = this.data.test_questions.filter(tq => tq.test_id !== id);
    this.saveData();
    return true;
  }

  // --- Promo Codes ---
  public getPromoCodes() {
    return this.data.promo_codes;
  }

  public findPromoCode(code: string) {
    return this.data.promo_codes.find(p => p.code.toUpperCase() === code.trim().toUpperCase());
  }

  public createPromoCode(promo: Omit<PromoCode, 'id' | 'times_used'>) {
    const newPromo: PromoCode = {
      ...promo,
      id: 'promo_' + crypto.randomUUID().slice(0, 8),
      code: promo.code.trim().toUpperCase(),
      times_used: 0
    };
    this.data.promo_codes.push(newPromo);
    this.saveData();
    return newPromo;
  }

  public updatePromoCode(id: string, updates: Partial<PromoCode>) {
    const index = this.data.promo_codes.findIndex(p => p.id === id);
    if (index === -1) return null;
    this.data.promo_codes[index] = {
      ...this.data.promo_codes[index],
      ...updates
    };
    this.saveData();
    return this.data.promo_codes[index];
  }

  public deletePromoCode(id: string) {
    const index = this.data.promo_codes.findIndex(p => p.id === id);
    if (index === -1) return false;
    this.data.promo_codes.splice(index, 1);
    this.saveData();
    return true;
  }

  public incrementPromoUsage(code: string) {
    const promo = this.findPromoCode(code);
    if (promo) {
      promo.times_used = (promo.times_used || 0) + 1;
      this.saveData();
    }
  }

  // --- Payments & Enrollments ---
  public createPayment(payment: PaymentRecord) {
    this.data.payments.unshift(payment);
    this.saveData();
    return payment;
  }

  public updatePaymentStatus(orderId: string, status: 'paid' | 'failed', paymentId?: string, signature?: string) {
    const payment = this.data.payments.find(p => p.razorpay_order_id === orderId);
    if (payment) {
      payment.status = status;
      if (paymentId) payment.razorpay_payment_id = paymentId;
      if (signature) payment.razorpay_signature = signature;
      if (status === 'paid') payment.verified_at = new Date().toISOString();
      this.saveData();
    }
    return payment;
  }

  public getAllPayments() {
    return this.data.payments;
  }

  public enrollUserInTest(userId: string, testId: string, paymentId?: string, packageId?: string) {
    const exists = this.data.enrollments.some(e => e.user_id === userId && e.test_id === testId);
    if (exists) return true;

    this.data.enrollments.push({
      id: 'enr_' + crypto.randomUUID().slice(0, 8),
      user_id: userId,
      test_id: testId,
      payment_id: paymentId,
      package_id: packageId,
      enrolled_at: new Date().toISOString()
    });
    this.saveData();
    return true;
  }

  public isUserEnrolled(userId: string, testId: string) {
    const test = this.data.tests.find(t => t.id === testId);
    if (!test) return false;
    if (test.price === 0) return true; // Free test is accessible to all

    // 1. Direct individual test enrollment
    const hasDirect = this.data.enrollments.some(e => e.user_id === userId && e.test_id === testId);
    if (hasDirect) return true;

    // 2. Package enrollment check
    const activePkgEnrollments = this.getUserPackageEnrollments(userId);
    for (const pkgEnroll of activePkgEnrollments) {
      const isTestInPkg = (this.data.package_tests || []).some(
        pt => pt.package_id === pkgEnroll.package_id && pt.test_id === testId
      );
      if (isTestInPkg) return true;
    }

    return false;
  }

  public getUserEnrollments(userId: string) {
    return this.data.enrollments.filter(e => e.user_id === userId);
  }

  // --- PACKAGES MANAGEMENT ---
  public getPackages(publishedOnly = false) {
    let list = this.data.packages || [];
    if (publishedOnly) {
      list = list.filter(p => p.is_published);
    }
    return list.map(pkg => {
      const mappings = (this.data.package_tests || [])
        .filter(pt => pt.package_id === pkg.id)
        .sort((a, b) => a.sort_order - b.sort_order);
      const testIds = mappings.map(m => m.test_id);
      return {
        ...pkg,
        test_count: testIds.length,
        test_ids: testIds
      };
    });
  }

  public getPackageById(id: string, includeFullTests = false) {
    const pkg = (this.data.packages || []).find(p => p.id === id);
    if (!pkg) return null;

    const mappings = (this.data.package_tests || [])
      .filter(pt => pt.package_id === id)
      .sort((a, b) => a.sort_order - b.sort_order);

    const testIds = mappings.map(m => m.test_id);
    let tests: any[] | undefined = undefined;

    if (includeFullTests) {
      tests = mappings
        .map(m => this.getTestById(m.test_id, false))
        .filter((t): t is NonNullable<typeof t> => t !== null);
    }

    return {
      ...pkg,
      test_count: testIds.length,
      test_ids: testIds,
      tests
    };
  }

  public createPackage(pkg: Omit<TestPackage, 'id' | 'created_at' | 'updated_at'>, testIds: string[] = []) {
    const id = 'pkg_' + crypto.randomUUID().slice(0, 8);
    const newPkg: TestPackage = {
      ...pkg,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    if (!this.data.packages) this.data.packages = [];
    if (!this.data.package_tests) this.data.package_tests = [];

    this.data.packages.push(newPkg);

    testIds.forEach((tId, idx) => {
      this.data.package_tests.push({
        id: 'pt_' + crypto.randomUUID().slice(0, 8),
        package_id: id,
        test_id: tId,
        sort_order: idx + 1
      });
    });

    this.saveData();
    return this.getPackageById(id, true);
  }

  public updatePackage(id: string, updates: Partial<TestPackage>, testIds?: string[]) {
    if (!this.data.packages) this.data.packages = [];
    const idx = this.data.packages.findIndex(p => p.id === id);
    if (idx === -1) return null;

    this.data.packages[idx] = {
      ...this.data.packages[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };

    if (testIds) {
      if (!this.data.package_tests) this.data.package_tests = [];
      this.data.package_tests = this.data.package_tests.filter(pt => pt.package_id !== id);
      testIds.forEach((tId, sIdx) => {
        this.data.package_tests.push({
          id: 'pt_' + crypto.randomUUID().slice(0, 8),
          package_id: id,
          test_id: tId,
          sort_order: sIdx + 1
        });
      });
    }

    this.saveData();
    return this.getPackageById(id, true);
  }

  public deletePackage(id: string) {
    if (!this.data.packages) return false;
    const idx = this.data.packages.findIndex(p => p.id === id);
    if (idx === -1) return false;

    this.data.packages.splice(idx, 1);
    if (this.data.package_tests) {
      this.data.package_tests = this.data.package_tests.filter(pt => pt.package_id !== id);
    }
    this.saveData();
    return true;
  }

  // --- Package Enrollments ---
  public enrollUserInPackage(userId: string, packageId: string, paymentId?: string) {
    if (!this.data.package_enrollments) this.data.package_enrollments = [];
    const pkg = this.getPackageById(packageId, true);
    if (!pkg) return false;

    const days = pkg.validity_days || 180;
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

    const existingIdx = this.data.package_enrollments.findIndex(
      pe => pe.user_id === userId && pe.package_id === packageId
    );

    if (existingIdx !== -1) {
      this.data.package_enrollments[existingIdx].expires_at = expiresAt;
      this.data.package_enrollments[existingIdx].payment_id = paymentId;
    } else {
      this.data.package_enrollments.push({
        id: 'pe_' + crypto.randomUUID().slice(0, 8),
        user_id: userId,
        package_id: packageId,
        package_name_en: pkg.name_en,
        package_name_mr: pkg.name_mr,
        payment_id: paymentId,
        enrolled_at: new Date().toISOString(),
        expires_at: expiresAt
      });
    }

    // Automatically unlock all individual tests inside this package for this user
    if (pkg.test_ids && pkg.test_ids.length > 0) {
      for (const tId of pkg.test_ids) {
        this.enrollUserInTest(userId, tId, paymentId, packageId);
      }
    }

    this.saveData();
    return true;
  }

  public isUserEnrolledInPackage(userId: string, packageId: string) {
    if (!this.data.package_enrollments) return false;
    const now = new Date();
    return this.data.package_enrollments.some(
      pe => pe.user_id === userId && pe.package_id === packageId && new Date(pe.expires_at) > now
    );
  }

  public getUserPackageEnrollments(userId: string) {
    if (!this.data.package_enrollments) return [];
    const now = new Date();
    return this.data.package_enrollments.filter(
      pe => pe.user_id === userId && new Date(pe.expires_at) > now
    );
  }

  // --- Attempts, Answers, Results ---
  public createAttempt(userId: string, testId: string) {
    const test = this.data.tests.find(t => t.id === testId);
    const newAttempt: TestAttempt = {
      id: 'att_' + crypto.randomUUID().slice(0, 8),
      user_id: userId,
      test_id: testId,
      test_title_en: test?.title_en,
      test_title_mr: test?.title_mr,
      started_at: new Date().toISOString(),
      status: 'in_progress',
      time_spent_seconds: 0,
      answers: {}
    };
    this.data.attempts.push(newAttempt);
    this.saveData();
    return newAttempt;
  }

  public getAttemptById(attemptId: string) {
    return this.data.attempts.find(a => a.id === attemptId);
  }

  public saveAttemptAnswers(attemptId: string, answers: Record<string, any>, timeSpentSeconds: number) {
    const attempt = this.data.attempts.find(a => a.id === attemptId);
    if (!attempt) return null;
    attempt.answers = answers;
    attempt.time_spent_seconds = timeSpentSeconds;
    this.saveData();
    return attempt;
  }

  public saveResult(result: TestResult) {
    // replace if exists
    const idx = this.data.results.findIndex(r => r.attempt_id === result.attempt_id);
    if (idx !== -1) {
      this.data.results[idx] = result;
    } else {
      this.data.results.push(result);
    }
    this.saveData();
    return result;
  }

  public getResultByAttemptId(attemptId: string) {
    return this.data.results.find(r => r.attempt_id === attemptId);
  }

  public getUserResults(userId: string) {
    return this.data.results.filter(r => r.user_id === userId);
  }

  public getAllResultsForTest(testId: string) {
    return this.data.results.filter(r => r.test_id === testId);
  }

  // --- Backups & Raw Store Export/Import ---
  public getFullStore(): DatabaseSchema {
    return this.data;
  }

  public restoreStore(newStore: DatabaseSchema): boolean {
    if (!newStore.users || !newStore.questions || !newStore.tests) {
      throw new Error('Invalid backup schema format');
    }
    this.data = newStore;
    this.saveData();
    return true;
  }

  // --- Stats for Admin Dashboard ---
  public getStats() {
    const totalStudents = this.data.users.filter(u => u.role === 'student').length;
    const totalQuestions = this.data.questions.length;
    const totalTests = this.data.tests.length;
    const totalPackages = (this.data.packages || []).length;
    const paidPayments = this.data.payments.filter(p => p.status === 'paid');
    const totalRevenue = paidPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const totalAttempts = this.data.attempts.length;
    const completedAttempts = this.data.attempts.filter(a => a.status === 'evaluated' || a.status === 'submitted').length;

    return {
      totalStudents,
      totalQuestions,
      totalTests,
      totalPackages,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders: paidPayments.length,
      totalAttempts,
      completedAttempts
    };
  }
}

export const db = new DatabaseManager();
