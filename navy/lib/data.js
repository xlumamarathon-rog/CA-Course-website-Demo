/* ================= DATA ================= */
export const VID = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

export function sec(t, l){ return {title:t, lectures:l}; }
export function lec(t, d, type){ return {title:t, dur:d, type:type||"video"}; }

export const COURSES = [
{
  id:"audit", cat:"flagship", badge:"Best-selling",
  title:"Audit MasterClass — Statutory & Internal",
  tag:"File your first Big 4 working paper, end to end.",
  instructor:"CA Archit Agarwal", exFirm:"Ex-KPMG", initials:"AA",
  hours:30, lectures:42, templates:12, rating:4.8, reviews:612, learners:9840,
  price:2999, mrp:4284, updated:"Jul 2026", level:"Intermediate", lang:"English + Hindi",
  outcomes:[
    "Draft a statutory audit plan and risk-assessment memo from a real trial balance",
    "Perform substantive testing on revenue, payables and inventory with sampling logic",
    "Build the working-paper file an engagement manager will actually sign off",
    "Run an internal audit walkthrough and write the control-deficiency report",
    "Answer the audit questions that decide Big 4 interviews"
  ],
  forWhom:["CA finalists and freshly qualified CAs","Semi-qualified articles moving to industry","B.Com / M.Com graduates targeting audit roles"],
  sections:[
    sec("Foundations of audit",[
      lec("How an audit actually gets staffed and run","6:12"),
      lec("Reading a trial balance like an auditor","9:40"),
      lec("Materiality — the number that shapes everything","8:05"),
      lec("Risk assessment: the memo template","11:20"),
      lec("Foundations quiz","5 questions","quiz")
    ]),
    sec("Substantive testing",[
      lec("Revenue: cut-off, occurrence, completeness","12:30"),
      lec("Sampling that survives review","10:15"),
      lec("Payables and the search for unrecorded liabilities","9:55"),
      lec("Inventory count — what to do on the floor","13:02"),
      lec("Working paper: revenue testing (template)","Download","file")
    ]),
    sec("Internal audit & controls",[
      lec("Designing a walkthrough","8:48"),
      lec("Identifying a control deficiency","10:22"),
      lec("Writing the observation: issue, impact, action","11:10"),
      lec("Presenting to the audit committee","7:35")
    ]),
    sec("Capstone & interviews",[
      lec("Capstone brief: full file for a mid-size manufacturer","4:20"),
      lec("Capstone walkthrough and review","15:40"),
      lec("The 20 audit interview questions that repeat","14:05"),
      lec("Certificate & next steps","3:10")
    ])
  ]
},
{
  id:"fdd", cat:"flagship", badge:"New",
  title:"Financial Due Diligence (FDD) MasterClass",
  tag:"Build the quality-of-earnings analysis a deal team relies on.",
  instructor:"CA Jheel Jethwani", exFirm:"Ex-Deloitte", initials:"JJ",
  hours:10, lectures:22, templates:6, rating:4.7, reviews:188, learners:2410,
  price:2999, mrp:4284, updated:"Jun 2026", level:"Advanced", lang:"English",
  outcomes:[
    "Normalise EBITDA and defend every adjustment you make",
    "Build a quality-of-earnings schedule from raw management accounts",
    "Identify working-capital leakage and net-debt items that move the price",
    "Write the red-flag report a deal partner reads first"
  ],
  forWhom:["CAs targeting transaction services","Analysts in corporate development","Anyone moving from audit to deals"],
  sections:[
    sec("The deal context",[
      lec("Why buyers pay for diligence","7:20"),
      lec("Scope, timelines and the data room","9:05"),
      lec("Reading management accounts critically","11:35")
    ]),
    sec("Quality of earnings",[
      lec("EBITDA normalisation — the adjustment log","13:50"),
      lec("One-offs, run-rate and pro-forma logic","12:10"),
      lec("QoE schedule (template)","Download","file"),
      lec("Case: a manufacturer with three red flags","16:25")
    ]),
    sec("Balance sheet & reporting",[
      lec("Net debt and debt-like items","10:40"),
      lec("Working capital: normalised level and peg","12:55"),
      lec("Writing the red-flag report","11:15"),
      lec("Presenting findings to the investment committee","8:30")
    ])
  ]
},
{
  id:"tax", cat:"flagship", badge:"New",
  title:"Income Tax MasterClass — Corporate & International",
  tag:"Compute, file and defend a corporate tax position.",
  instructor:"CA Sapna Datwani", exFirm:"Ex-Grant Thornton", initials:"SD",
  hours:25, lectures:38, templates:10, rating:4.8, reviews:294, learners:5120,
  price:2999, mrp:4284, updated:"Jul 2026", level:"Intermediate", lang:"English + Hindi",
  outcomes:[
    "Compute corporate tax with MAT, deferred tax and disallowances handled correctly",
    "Apply treaty positions and read a DTAA article without guessing",
    "Prepare Form 3CD and the tax audit annexures",
    "Handle a scrutiny notice from first reply to closure"
  ],
  forWhom:["CA finalists","Tax executives in industry","Practitioners expanding into international tax"],
  sections:[
    sec("Corporate computation",[
      lec("From book profit to taxable income","10:05"),
      lec("Disallowances that get caught in assessment","12:20"),
      lec("MAT and deferred tax together","13:40"),
      lec("Computation sheet (template)","Download","file")
    ]),
    sec("International tax",[
      lec("Residence, source and the charging section","11:30"),
      lec("Reading a DTAA article properly","14:15"),
      lec("Withholding on cross-border payments","12:45"),
      lec("Permanent establishment — the practical test","10:50")
    ]),
    sec("Compliance & litigation",[
      lec("Tax audit: Form 3CD line by line","15:20"),
      lec("Responding to a scrutiny notice","13:05"),
      lec("Drafting grounds of appeal","11:40"),
      lec("Interview prep: tax role questions","9:25")
    ])
  ]
},
{
  id:"ma", cat:"flagship", badge:null,
  title:"Mergers & Acquisitions MasterClass",
  tag:"Model, structure and price a real transaction.",
  instructor:"Rahul Sachdeva", exFirm:"Ex-EY", initials:"RS",
  hours:15, lectures:26, templates:9, rating:4.9, reviews:94, learners:1680,
  price:2999, mrp:4284, updated:"May 2026", level:"Advanced", lang:"English",
  outcomes:[
    "Build a merger model with accretion/dilution that ties",
    "Choose between slump sale, share purchase and amalgamation on tax and speed",
    "Run a DCF and a comparables analysis that survive challenge",
    "Draft the valuation section of an information memorandum"
  ],
  forWhom:["Investment banking aspirants","CAs in corporate finance","MBA finance students"],
  sections:[
    sec("Deal architecture",[
      lec("Why deals happen — and why they fail","8:15"),
      lec("Structures: share purchase vs slump sale vs scheme","14:30"),
      lec("Regulatory map: Companies Act, SEBI, FEMA","12:05")
    ]),
    sec("Valuation",[
      lec("DCF: the assumptions that actually matter","16:20"),
      lec("Comparables and precedent transactions","13:10"),
      lec("Merger model (template)","Download","file"),
      lec("Accretion / dilution mechanics","15:45")
    ]),
    sec("Execution",[
      lec("Term sheet to SPA — the clauses that bite","12:35"),
      lec("Purchase price adjustments in practice","11:20"),
      lec("Drafting the IM valuation section","10:15")
    ])
  ]
},
{
  id:"excel", cat:"tools", badge:"Best-selling",
  title:"MS-Excel for Finance — Modelling MasterClass",
  tag:"Model like an analyst, not a spreadsheet user.",
  instructor:"CA Nikhil Dhingra", exFirm:"Ex-Amazon", initials:"ND",
  hours:18, lectures:34, templates:15, rating:4.9, reviews:1104, learners:14200,
  price:1999, mrp:2856, updated:"Jul 2026", level:"Beginner to Advanced", lang:"English + Hindi",
  outcomes:[
    "Build a three-statement model that flows and flags its own errors",
    "Use INDEX/XLOOKUP, dynamic arrays and Power Query on real messy data",
    "Create dashboards a CFO can read in ten seconds",
    "Audit someone else's broken model and fix it"
  ],
  forWhom:["Anyone in finance who lives in Excel","Students preparing for analyst roles","Professionals moving to FP&A"],
  sections:[
    sec("Foundations that speed you up",[
      lec("Structure: inputs, calculations, outputs","7:40"),
      lec("Lookup family: XLOOKUP, INDEX/MATCH","12:15"),
      lec("Dynamic arrays in practice","11:05"),
      lec("Keyboard-only modelling drill","9:30")
    ]),
    sec("Three-statement model",[
      lec("Revenue build and driver logic","14:20"),
      lec("Linking P&L, balance sheet, cash flow","18:40"),
      lec("Circularity and the interest problem","12:50"),
      lec("Error checks that catch you early","10:10"),
      lec("Three-statement model (template)","Download","file")
    ]),
    sec("Data & dashboards",[
      lec("Power Query: cleaning a messy export","15:35"),
      lec("PivotTables that don't lie","11:25"),
      lec("Dashboard design for finance","13:50")
    ])
  ]
},
{
  id:"placement", cat:"free", badge:"Free",
  title:"Placement Program — Interview & Resume Intensive",
  tag:"Get shortlisted, then convert. Free for every learner.",
  instructor:"Ledgerline Team", exFirm:"Placement cell", initials:"LL",
  hours:6, lectures:14, templates:5, rating:4.6, reviews:842, learners:22400,
  price:0, mrp:0, updated:"Jul 2026", level:"All levels", lang:"English + Hindi",
  outcomes:[
    "Write a finance resume that survives a six-second scan",
    "Answer the behavioural questions Big 4 panels repeat",
    "Structure a technical answer under pressure",
    "Negotiate a first offer without losing it"
  ],
  forWhom:["Every Ledgerline learner","Final-year students","Anyone switching into finance"],
  sections:[
    sec("Getting shortlisted",[
      lec("The six-second resume scan","8:10"),
      lec("Resume template that clears ATS","Download","file"),
      lec("LinkedIn that recruiters search for","9:25")
    ]),
    sec("Converting the interview",[
      lec("Structuring a technical answer","11:40"),
      lec("The behavioural questions that repeat","12:15"),
      lec("Mock interview: full transcript breakdown","16:30"),
      lec("Negotiating the first offer","9:05")
    ])
  ]
}
];

export const COMBOS = [
  {id:"combo-mega", title:"All MasterClasses — Mega Package", items:12, hours:200, price:34188, mrp:48840},
  {id:"combo-audit", title:"Audit + Internal Audit + IND AS", items:3, hours:70, price:7994, mrp:11424},
  {id:"combo-tax", title:"Direct Tax + GST + Transfer Pricing", items:3, hours:78, price:7994, mrp:11424}
];

export const ALUMNI = [
  {n:"Chirag Maindan", f:"Glenmark", c:"Transfer Pricing", i:"CM"},
  {n:"Reema Sharma", f:"Accenture", c:"Interview MasterClass", i:"RS"},
  {n:"Jeevesh Wadhwa", f:"EY", c:"Transfer Pricing", i:"JW"},
  {n:"Naman Jain", f:"Deloitte", c:"Audit MasterClass", i:"NJ"},
  {n:"Vulli Saikiran", f:"Dr. Reddy's", c:"Career MasterClass", i:"VS"},
  {n:"Sanchita Agarwal", f:"KPMG", c:"GST MasterClass", i:"SA"},
  {n:"Som Khandelwal", f:"CRISIL", c:"Audit MasterClass", i:"SK"},
  {n:"Aditi Khaitan", f:"Grant Thornton", c:"Audit MasterClass", i:"AK"}
];

export const TESTIMONIALS = [
  {q:"The course gave me immense practical insight. It didn't just help in the interview — it helped me deal with case-based questions on the job in week one.", n:"Mayank Sharma", r:"Associate, KPMG", i:"MS"},
  {q:"Everything is explained in real detail, with the actual working papers. I had tried two other platforms before this and neither showed me a real file.", n:"Bhawana Pant", r:"Nangia & Co. LLP", i:"BP"},
  {q:"I recently joined the Adani Group as Assistant Manager. The masterclass is what let me phrase my answers like someone who had done the work.", n:"CA Mamta Jangra", r:"Assistant Manager, Adani", i:"MJ"}
];

export const EXPERTS = [
  {n:"CA Pooja Sharma", s:"Soft Skills · Marketing", y:"10+ yrs", f:"Ledgerline", i:"PS"},
  {n:"CA Chirag Kagzi", s:"Indirect Tax · GST", y:"10+ yrs", f:"Ex-Deloitte", i:"CK"},
  {n:"CA Nikhil Dhingra", s:"Risk · Internal Audit", y:"10+ yrs", f:"Ex-Amazon", i:"ND"},
  {n:"CA Sanat Goyal", s:"Transfer Pricing · Direct Tax", y:"10+ yrs", f:"Ex-EY", i:"SG"}
];

export const HIRERS = ["Deloitte","KPMG","EY","PwC","Accenture","Infosys","ICICI Bank","HDFC Bank","Genpact","Grant Thornton","Dr. Reddy's","Glenmark"];

export const JOBS = [
  {t:"Audit Associate", f:"KPMG", l:"Gurugram", e:"0-2 yrs", s:"₹7–9 LPA", tag:"Big 4"},
  {t:"Transaction Services Analyst", f:"Deloitte", l:"Mumbai", e:"1-3 yrs", s:"₹9–12 LPA", tag:"Big 4"},
  {t:"FP&A Analyst", f:"Accenture", l:"Bengaluru", e:"2-4 yrs", s:"₹12–16 LPA", tag:"MNC"},
  {t:"Internal Audit Executive", f:"Glenmark", l:"Mumbai", e:"1-3 yrs", s:"₹8–11 LPA", tag:"Industry"},
  {t:"Direct Tax Associate", f:"Grant Thornton", l:"Delhi NCR", e:"0-2 yrs", s:"₹6.5–9 LPA", tag:"Consulting"},
  {t:"Financial Reporting Analyst", f:"Genpact", l:"Hyderabad", e:"2-5 yrs", s:"₹10–14 LPA", tag:"MNC"}
];

export const FAQS = [
  {q:"How long do I have access to the course?", a:"Lifetime access to every recorded session, template and update. If a section is re-recorded after a regulatory change, you get the new version at no cost."},
  {q:"Is there a refund policy?", a:"Yes — a 7-day refund, no questions asked, as long as you have watched less than 25% of the course. Refunds are processed to the original payment method within 5 working days."},
  {q:"Do I need to be a CA to take this?", a:"No. The flagship masterclasses assume you can read a trial balance. If you cannot yet, start with the free Placement Program and the Excel masterclass."},
  {q:"Will I get a certificate?", a:"Yes, on completing 100% of the lectures and submitting the capstone. Each certificate carries a verification code that an employer can check on our site."},
  {q:"Does the placement support cost extra?", a:"No. The Placement Program — resume review, mock interviews and the job board — is free for every enrolled learner, forever."},
  {q:"Are the sessions live or recorded?", a:"The masterclasses are recorded so you can learn around a job. Doubt-clearing sessions with the instructor run live every fortnight."}
];

/* helpers */
export function fmt(n){ return "₹" + n.toLocaleString("en-IN"); }
export function findCourse(id){ for(var i=0;i<COURSES.length;i++){ if(COURSES[i].id===id) return COURSES[i]; } return null; }
export function flatLessons(c){
  var out=[];
  for(var s=0;s<c.sections.length;s++){
    for(var l=0;l<c.sections[s].lectures.length;l++){
      out.push({s:s, l:l, sTitle:c.sections[s].title, lesson:c.sections[s].lectures[l]});
    }
  }
  return out;
}
export function totalLessons(c){ return flatLessons(c).length; }

/* "6:12" -> 372 seconds. Non-time labels (Download, 5 questions) -> 0 */
export function parseDur(d){
  if(typeof d !== "string") return 0;
  var m = d.match(/^(\d+):(\d{2})$/);
  if(!m) return 0;
  return parseInt(m[1],10)*60 + parseInt(m[2],10);
}
export function fmtTime(s){
  s = Math.max(0, Math.floor(s||0));
  var m = Math.floor(s/60), r = s%60;
  return m + ":" + (r<10?"0":"") + r;
}
export const CATEGORIES = [
  {id:"all", label:"All courses"},
  {id:"flagship", label:"Flagship MasterClasses"},
  {id:"tools", label:"Finance Tools"},
  {id:"free", label:"Free Courses"}
];
/* 9369 -> "2h 36m" — for course-level totals */
export function fmtLong(s){
  s = Math.max(0, Math.floor(s||0));
  var h = Math.floor(s/3600), m = Math.round((s%3600)/60);
  return h ? (h + "h " + m + "m") : (m + "m");
}
