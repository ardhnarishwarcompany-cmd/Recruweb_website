import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../utils/api";

const empty = {
  firstName:"", middleName:"", lastName:"", gender:"", dateOfBirth:"", maritalStatus:"",
  nationality:"Indian", bloodGroup:"", religion:"", category:"",
  fatherName:"", motherName:"", spouseName:"",
  emergencyContactPerson:"", emergencyContactRelationship:"", emergencyContactNumber:"",
  phone:"", alternatePhone:"", personalEmail:"", officialEmail:"",
  currentAddress:{houseFlat:"",street:"",landmark:"",city:"",state:"",country:"India",pincode:""},
  permanentAddress:{houseFlat:"",street:"",landmark:"",city:"",state:"",country:"India",pincode:""},
  sameAddress:true,
  aadharNumber:"", panNumber:"", passportNumber:"", drivingLicenseNumber:"", voterIdNumber:"",
  employeeId:"", joiningDate:"", employeeType:"Full Time", department:"", designation:"",
  reportingManager:"", workLocation:"", shiftTiming:"", probationPeriod:"", noticePeriod:"",
  professionalSummary:"", careerObjective:"", coreStrengths:[],
  educationDetails:[
    {level:"Class 10",schoolName:"",board:"",passingYear:"",percentage:""},
    {level:"Class 12",schoolName:"",board:"",passingYear:"",percentage:""},
    {level:"Graduation",degree:"",specialization:"",university:"",passingYear:"",percentage:""},
    {level:"Post Graduation",degree:"",specialization:"",university:"",passingYear:"",percentage:""},
    {level:"Doctorate",qualification:"",institution:"",researchArea:"",completionYear:""}
  ],
  certifications:[], technicalSkills:[], functionalSkills:[], skillLevels:{}, languagesKnown:[], references:[{name:"",designation:"",organization:"",phone:"",email:""},{name:"",designation:"",organization:"",phone:"",email:""}],
  workExperience:[], bankDetails:{accountHolderName:"",bankName:"",branchName:"",accountNumber:"",confirmAccountNumber:"",ifscCode:"",upiId:""},
  familyInformation:{father:{name:"",occupation:"",contactNumber:""},mother:{name:"",occupation:"",contactNumber:""},spouse:{name:"",occupation:"",contactNumber:""},children:[]},
  nomineeInformation:{name:"",relationship:"",dateOfBirth:"",contactNumber:"",address:""},
  socialProfiles:{linkedin:"",github:"",portfolio:"",personalWebsite:"",behance:"",dribbble:"",twitter:""},
  assetRequirements:[], verificationConsent:false, declarationConfirmed:false, declaration:false,
  aadhaarVerificationStatus:"not-started", panVerificationStatus:"not-started"
};

const steps = [
  ["Profile & Personal", "1–4", "👤"],
  ["Career & Education", "5–7", "🎓"],
  ["Skills & Experience", "8–10", "💼"],
  ["Banking & Family", "11–13", "🏦"],
  ["Documents & Declaration", "14–18", "✅"]
];

const strengths=["Leadership","Team Management","Communication","Problem Solving","Negotiation","Client Handling","Time Management","Strategic Planning","Decision Making","Creativity","Innovation","Adaptability"];
const tech=["React JS","Angular","Vue JS","Node JS","Java","Python","PHP","Laravel",".NET","MySQL","MongoDB","PostgreSQL","AWS","Azure","Docker","Kubernetes","DevOps","AI/ML","Data Analytics","Power BI","Tableau"];
const functional=["Recruitment","Payroll","HR Operations","Sales","Marketing","Finance","Accounting","Customer Support","Project Management","Business Development"];
const assets=["Laptop","Desktop","Email Account","VPN Access","ID Card","Biometric Access","Office SIM","Microsoft 365","Google Workspace","HRMS Access","ERP Access","CRM Access"];

function Field({label, children, required=false, className=""}) {
  return <label className={`j-field ${className}`}><span>{label}{required && <b> *</b>}</span>{children}</label>;
}
function Input({value,onChange,type="text",placeholder="",required=false,disabled=false}) {
  return <input className="j-input" type={type} value={value ?? ""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} required={required} disabled={disabled}/>;
}
function Select({value,onChange,options,required=false}) {
  return <select className="j-input" value={value ?? ""} onChange={e=>onChange(e.target.value)} required={required}><option value="">Select</option>{options.map(x=><option key={x}>{x}</option>)}</select>;
}
function Section({n,title,children}) {
  return <section className="j-section"><div className="j-section-head"><span className="j-section-no">{String(n).padStart(2,"0")}</span><div><h2>{title}</h2></div></div>{children}</section>;
}
function Upload({label,name,files,setFiles,accept="image/*",capture}) {
  const f=files[name];
  const preview=f && /^image\//.test(f.type) ? URL.createObjectURL(f) : null;
  return <div className="j-upload">
    <div className="j-upload-title">{label}</div>
    <input type="file" accept={accept} capture={capture} onChange={e=>setFiles(x=>({...x,[name]:e.target.files?.[0]||null}))}/>
    {f && <div className="j-file-row"><span>📎 {f.name}</span><button type="button" onClick={()=>setFiles(x=>({...x,[name]:null}))}>Clear</button></div>}
    {preview && <img className="j-upload-preview" src={preview} alt="Preview"/>}
  </div>;
}
function ToggleChips({items,value,onChange}) {
  return <div className="j-chips">{items.map(item=><button type="button" key={item} className={value.includes(item)?"on":""} onClick={()=>onChange(value.includes(item)?value.filter(x=>x!==item):[...value,item])}>{value.includes(item)?"✓ ":""}{item}</button>)}</div>;
}

export default function EmployeeJoiningForm(){
  const [step,setStep]=useState(1), [form,setForm]=useState(empty), [files,setFiles]=useState({});
  const [status,setStatus]=useState(null),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[message,setMessage]=useState("");
  const sigRef=useRef(null), drawing=useRef(false);
  const [sigMode,setSigMode]=useState("draw");

  useEffect(()=>{api.candidatePortal.getJoiningForm().then(r=>{
    if(r?.success&&r.data){setStatus(r.data.status||null);setForm({...empty,...r.data, currentAddress:{...empty.currentAddress,...(r.data.currentAddress||{})},permanentAddress:{...empty.permanentAddress,...(r.data.permanentAddress||{})},bankDetails:{...empty.bankDetails,...(r.data.bankDetails||{})}});}
    setLoading(false);
  });},[]);

  const set=(key,val)=>setForm(f=>({...f,[key]:val}));
  const nested=(group,key,val)=>setForm(f=>({...f,[group]:{...f[group],[key]:val}}));
  const add=(key,obj)=>setForm(f=>({...f,[key]:[...(f[key]||[]),obj]}));
  const updateArr=(key,i,field,val)=>setForm(f=>({...f,[key]:f[key].map((x,idx)=>idx===i?{...x,[field]:val}:x)}));
  const removeArr=(key,i)=>setForm(f=>({...f,[key]:f[key].filter((_,idx)=>idx!==i)}));

  const draw=(e)=>{
    const c=sigRef.current;if(!c)return;const r=c.getBoundingClientRect(),x=(e.clientX??e.touches?.[0]?.clientX)-r.left,y=(e.clientY??e.touches?.[0]?.clientY)-r.top;
    const ctx=c.getContext("2d");if(drawing.current){ctx.lineTo(x,y);ctx.stroke();}else{ctx.beginPath();ctx.moveTo(x,y);drawing.current=true;}
  };
  const stop=()=>{drawing.current=false};
  const clearSig=()=>{const c=sigRef.current;c?.getContext("2d").clearRect(0,0,c.width,c.height);setFiles(f=>({...f,signature:null}));};
  const signatureFile=async()=>{if(sigMode!=="draw"||!sigRef.current)return null;return new Promise(res=>sigRef.current.toBlob(b=>res(b),"image/png"));};

  const validateStep=()=>{
    const filled = (value) => value !== undefined && value !== null && String(value).trim() !== "";
    const addr = form.currentAddress || {};
    const bank = form.bankDetails || {};

    if(step===1){
      // Keep this validation aligned with the fields visibly marked as required.
      // Use trimmed values so spaces cannot be mistaken for completed details.
      const required = [
        ["First Name", form.firstName],
        ["Last Name", form.lastName],
        ["Gender", form.gender],
        ["Date of Birth", form.dateOfBirth],
        ["Marital Status", form.maritalStatus],
        ["Nationality", form.nationality],
        ["Blood Group", form.bloodGroup],
        ["Father's Name", form.fatherName],
        ["Mother's Name", form.motherName],
        ["Emergency Contact Person", form.emergencyContactPerson],
        ["Emergency Contact Relationship", form.emergencyContactRelationship],
        ["Emergency Contact Number", form.emergencyContactNumber],
        ["Mobile Number", form.phone],
        ["Personal Email Address", form.personalEmail],
        ["Current Address - House/Flat", addr.houseFlat],
        ["Current Address - Street", addr.street],
        ["Current Address - City", addr.city],
        ["Current Address - State", addr.state],
        ["Current Address - Country", addr.country],
        ["Current Address - Pincode", addr.pincode],
      ];
      const missing = required.filter(([,value])=>!filled(value)).map(([label])=>label);
      if(missing.length) return `Please complete: ${missing.join(", ")}.`;
    }
    if(step===2){
      const required = [
        ["Professional Summary", form.professionalSummary],
        ["Career Objective", form.careerObjective],
      ];
      const missing = required.filter(([,value])=>!filled(value)).map(([label])=>label);
      if(missing.length) return `Please complete: ${missing.join(", ")}.`;
    }
    if(step===4){
      const required = [
        ["Account Holder Name", bank.accountHolderName], ["Bank Name", bank.bankName],
        ["Branch Name", bank.branchName], ["Account Number", bank.accountNumber],
        ["Confirm Account Number", bank.confirmAccountNumber], ["IFSC Code", bank.ifscCode],
      ];
      const missing = required.filter(([,value])=>!filled(value)).map(([label])=>label);
      if(missing.length) return `Please complete: ${missing.join(", ")}.`;
      if(String(bank.accountNumber).trim() !== String(bank.confirmAccountNumber).trim()) return "Account Number and Confirm Account Number must match.";
    }
    if(step===5){
      if(!form.verificationConsent) return "Please accept the Background Verification Consent.";
      if(!form.declarationConfirmed || !form.declaration) return "Please confirm the Employee Declaration.";
      const requiredFiles=["profilePhoto","resumeCV","aadhaarFront","aadhaarBack","panCard","education_0","education_1","education_2","cancelledCheque","bankStatement"];
      if(!files.profilePhoto || (!files.signatureUpload && !files.signature) || requiredFiles.some(k=>!files[k])) return "Please upload all mandatory documents marked with * (including your signature).";
    }
    return "";
  };

  const submit=async(e)=>{e.preventDefault();const err=validateStep();if(err){setMessage(err);return;}setSaving(true);setMessage("");
    const fd=new FormData();
    const safeDate = (value) => {
      if (value === undefined || value === null) return "";
      const raw = String(value).trim();
      if (!raw || /^(invalid date|undefined|null|nan)$/i.test(raw)) return "";
      if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) return "";
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    };
    const data={
      ...form,
      joiningDate:safeDate(form.joiningDate),
      dateOfBirth:safeDate(form.dateOfBirth),
      passportExpiry:safeDate(form.passportExpiry),
      officialEmail:form.officialEmail||JSON.parse(localStorage.getItem("user")||"{}")?.email||"",
      declaration:true
    };
    Object.entries(data).forEach(([k,v])=>fd.append(k,typeof v==="object"?JSON.stringify(v):String(v??"")));
    for(const [k,v] of Object.entries(files)) if(v instanceof File) fd.append(k,v);
    const drawn=await signatureFile();if(drawn)fd.append("signature",drawn,"employee-signature.png");
    const r=await api.candidatePortal.submitJoiningFormMultipart(fd);
    if(r?.success){setStatus(r.data.status);setMessage("Joining form submitted successfully. It is now available in Admin → New Joiners.");}
    else setMessage(r?.message||"Unable to submit joining form.");
    setSaving(false);
  };

  if(loading)return <div className="j-loading">Loading your joining form…</div>;

  return <div className="j-page">
    <div className="j-hero"><div><span className="j-kicker">RECRUWEB • NEW JOINER FORM</span><h1>Joining Form <em>— New Joiner</em></h1><p>Complete your complete employee joining profile, verification details and document checklist. This form is independent from Candidate Onboarding and is available directly from your candidate portal.</p></div><div className="j-progress"><b>{step}/5</b><span>{steps[step-1][0]}</span></div></div>
    {message&&<div className={`j-message ${message.includes("successfully")?"ok":"err"}`}>{message}</div>}
    <div className="j-steps">{steps.map((s,i)=><button type="button" key={s[0]} className={step===i+1?"active":step>i+1?"done":""} onClick={()=>{if(i+1<step){setMessage("");setStep(i+1);return;}const err=validateStep();if(!err){setMessage("");setStep(i+1);}else setMessage(err)}}><span>{s[2]}</span><div><b>{s[0]}</b><small>Sections {s[1]}</small></div></button>)}</div>
    <form onSubmit={submit} className="j-form">
      {step===1&&<>
        <Section n={1} title="Profile Information"><div className="j-grid">
          <Upload label="Profile Photo *" name="profilePhoto" files={files} setFiles={setFiles} capture="user"/>
          <Upload label="Signature *" name="signatureUpload" files={files} setFiles={setFiles} accept="image/*,.pdf"/>
          <div className="j-signbox"><b>Draw Signature</b><canvas ref={sigRef} width="560" height="150" onPointerDown={draw} onPointerMove={draw} onPointerUp={stop} onPointerLeave={stop}/><button type="button" onClick={clearSig}>Clear Signature</button></div>
        </div></Section>
        <Section n={2} title="Personal Details"><div className="j-grid">
          <Field label="First Name" required><Input value={form.firstName} onChange={v=>set("firstName",v)} required/></Field><Field label="Middle Name"><Input value={form.middleName} onChange={v=>set("middleName",v)}/></Field><Field label="Last Name" required><Input value={form.lastName} onChange={v=>set("lastName",v)} required/></Field>
          <Field label="Gender" required><Select value={form.gender} onChange={v=>set("gender",v)} options={["Male","Female","Other"]} required/></Field><Field label="Date of Birth" required><Input type="date" value={form.dateOfBirth} onChange={v=>set("dateOfBirth",v)} required/></Field><Field label="Marital Status" required><Select value={form.maritalStatus} onChange={v=>set("maritalStatus",v)} options={["Single","Married","Divorced","Widowed","Other"]} required/></Field>
          <Field label="Nationality" required><Input value={form.nationality} onChange={v=>set("nationality",v)} required/></Field><Field label="Blood Group" required><Select value={form.bloodGroup} onChange={v=>set("bloodGroup",v)} options={["A+","A-","B+","B-","AB+","AB-","O+","O-"]} required/></Field><Field label="Religion"><Input value={form.religion} onChange={v=>set("religion",v)}/></Field><Field label="Category"><Input value={form.category} onChange={v=>set("category",v)}/></Field>
          <Field label="Father's Name" required><Input value={form.fatherName} onChange={v=>set("fatherName",v)} required/></Field><Field label="Mother's Name" required><Input value={form.motherName} onChange={v=>set("motherName",v)} required/></Field><Field label="Spouse Name"><Input value={form.spouseName} onChange={v=>set("spouseName",v)}/></Field>
          <Field label="Emergency Contact Person" required><Input value={form.emergencyContactPerson} onChange={v=>set("emergencyContactPerson",v)} required/></Field><Field label="Emergency Contact Relationship" required><Input value={form.emergencyContactRelationship} onChange={v=>set("emergencyContactRelationship",v)} required/></Field><Field label="Emergency Contact Number" required><Input value={form.emergencyContactNumber} onChange={v=>set("emergencyContactNumber",v)} required/></Field>
          <Field label="Mobile Number" required><Input value={form.phone} onChange={v=>set("phone",v)} required/></Field><Field label="Alternate Mobile Number"><Input value={form.alternatePhone} onChange={v=>set("alternatePhone",v)}/></Field><Field label="Personal Email Address" required><Input type="email" value={form.personalEmail} onChange={v=>set("personalEmail",v)} required/></Field><Field label="Official Email Address (Auto Generated)"><Input value={form.officialEmail||JSON.parse(localStorage.getItem("user")||"{}")?.email||""} onChange={()=>{}} disabled/></Field>
        </div></Section>
        <Section n={3} title="Address Information"><div className="j-address-cols">{["currentAddress","permanentAddress"].map((g,i)=><div className="j-address-card" key={g}><h3>{i?"Permanent Address":"Current Address"}</h3>{i===1&&<label className="j-check"><input type="checkbox" checked={form.sameAddress} onChange={e=>{set("sameAddress",e.target.checked);if(e.target.checked)setForm(f=>({...f,permanentAddress:{...f.currentAddress}}))}}/> Same as Current Address</label>}<div className="j-grid">{["houseFlat","street","landmark","city","state","country","pincode"].map(k=><Field key={k} label={k.replace(/([A-Z])/g," $1")} required={i===0&&["houseFlat","street","city","state","country","pincode"].includes(k)}><Input value={form[g][k]} onChange={v=>nested(g,k,v)} required={i===0&&["houseFlat","street","city","state","country","pincode"].includes(k)}/></Field>)}</div></div>)}</div></Section>
        <Section n={4} title="Identity Verification"><div className="j-grid">
          <Field label="Aadhaar Number" required><Input value={form.aadharNumber} onChange={v=>set("aadharNumber",v)} required/></Field><Upload label="Aadhaar Front *" name="aadhaarFront" files={files} setFiles={setFiles} accept="image/*,.pdf"/><Upload label="Aadhaar Back *" name="aadhaarBack" files={files} setFiles={setFiles} accept="image/*,.pdf"/>
          <Field label="PAN Number" required><Input value={form.panNumber} onChange={v=>set("panNumber",v)} required/></Field><Upload label="PAN Card *" name="panCard" files={files} setFiles={setFiles} accept="image/*,.pdf"/>
          <Field label="Passport Number"><Input value={form.passportNumber} onChange={v=>set("passportNumber",v)}/></Field><Upload label="Passport Upload" name="passport" files={files} setFiles={setFiles} accept="image/*,.pdf"/><Field label="Driving License Number"><Input value={form.drivingLicenseNumber} onChange={v=>set("drivingLicenseNumber",v)}/></Field><Upload label="Driving License Upload" name="drivingLicense" files={files} setFiles={setFiles} accept="image/*,.pdf"/><Field label="Voter ID Number"><Input value={form.voterIdNumber} onChange={v=>set("voterIdNumber",v)}/></Field><Upload label="Voter ID Upload" name="voterId" files={files} setFiles={setFiles} accept="image/*,.pdf"/>
        </div></Section>
      </>}
      {step===2&&<>
        <Section n={5} title="Professional Summary"><div className="j-grid one"><Field label="Tell Us About Yourself" required><textarea className="j-input j-textarea" value={form.professionalSummary} onChange={e=>set("professionalSummary",e.target.value)} required/></Field><Field label="Career Objective" required><textarea className="j-input j-textarea" value={form.careerObjective} onChange={e=>set("careerObjective",e.target.value)} required/></Field></div><div className="j-subtitle">Core Strengths</div><ToggleChips items={strengths} value={form.coreStrengths} onChange={v=>set("coreStrengths",v)}/></Section>
        <Section n={6} title="Educational Qualifications">{form.educationDetails.map((ed,i)=><div className="j-repeat-card" key={ed.level}><h3>{ed.level}{["Post Graduation","Doctorate"].includes(ed.level)?" (If Applicable)":""}</h3><div className="j-grid">{ed.level==="Doctorate"?<><Field label="Qualification"><Input value={ed.qualification} onChange={v=>updateArr("educationDetails",i,"qualification",v)}/></Field><Field label="Institution"><Input value={ed.institution} onChange={v=>updateArr("educationDetails",i,"institution",v)}/></Field><Field label="Research Area"><Input value={ed.researchArea} onChange={v=>updateArr("educationDetails",i,"researchArea",v)}/></Field><Field label="Completion Year"><Input value={ed.completionYear} onChange={v=>updateArr("educationDetails",i,"completionYear",v)}/></Field></>:ed.level==="Post Graduation"?<><Field label="Degree"><Input value={ed.degree} onChange={v=>updateArr("educationDetails",i,"degree",v)}/></Field><Field label="University"><Input value={ed.university} onChange={v=>updateArr("educationDetails",i,"university",v)}/></Field></>:<><Field label={ed.level==="Graduation"?"Degree":"School Name"} required={["Class 10","Class 12","Graduation"].includes(ed.level)}><Input value={ed.schoolName||ed.degree} onChange={v=>updateArr("educationDetails",i,ed.level==="Graduation"?"degree":"schoolName",v)} required={["Class 10","Class 12","Graduation"].includes(ed.level)}/></Field><Field label={ed.level==="Graduation"?"Specialization":"Board"}><Input value={ed.specialization||ed.board} onChange={v=>updateArr("educationDetails",i,ed.level==="Graduation"?"specialization":"board",v)}/></Field><Field label={ed.level==="Graduation"?"University/College":"Passing Year"} required={["Class 10","Class 12","Graduation"].includes(ed.level)}><Input value={ed.university||ed.passingYear} onChange={v=>updateArr("educationDetails",i,ed.level==="Graduation"?"university":"passingYear",v)} required={["Class 10","Class 12","Graduation"].includes(ed.level)}/></Field><Field label="Percentage/CGPA"><Input value={ed.percentage} onChange={v=>updateArr("educationDetails",i,"percentage",v)}/></Field></>}<Upload label="Upload Documents" name={`education_${i}`} files={files} setFiles={setFiles} accept=".pdf,image/*"/></div></div>)}</Section>
        <Section n={7} title="Certifications & Training"><div className="j-repeat-card">{form.certifications.map((c,i)=><div className="j-grid j-row-card" key={i}><Field label="Certification Name"><Input value={c.name} onChange={v=>updateArr("certifications",i,"name",v)}/></Field><Field label="Issuing Organization"><Input value={c.organization} onChange={v=>updateArr("certifications",i,"organization",v)}/></Field><Field label="Issue Date"><Input type="date" value={c.issueDate} onChange={v=>updateArr("certifications",i,"issueDate",v)}/></Field><Field label="Expiry Date"><Input type="date" value={c.expiryDate} onChange={v=>updateArr("certifications",i,"expiryDate",v)}/></Field><Field label="Credential ID"><Input value={c.credentialId} onChange={v=>updateArr("certifications",i,"credentialId",v)}/></Field><Upload label="Certificate" name={`cert_${i}`} files={files} setFiles={setFiles} accept=".pdf,image/*"/><button type="button" className="j-remove" onClick={()=>removeArr("certifications",i)}>Remove</button></div>)}<button type="button" className="j-add" onClick={()=>add("certifications",{name:"",organization:"",issueDate:"",expiryDate:"",credentialId:""})}>+ Add Professional Certification</button></div></Section>
      </>}
      {step===3&&<>
        <Section n={8} title="Skills, Knowledge & Expertise"><div className="j-subtitle">Technical Skills</div><ToggleChips items={tech} value={form.technicalSkills} onChange={v=>set("technicalSkills",v)}/><div className="j-subtitle">Functional Skills</div><ToggleChips items={functional} value={form.functionalSkills} onChange={v=>set("functionalSkills",v)}/><div className="j-repeat-card"><h3>Expertise Level</h3>{[...new Set([...form.technicalSkills,...form.functionalSkills])].map(s=><div className="j-skill-line" key={s}><b>{s}</b><Select value={form.skillLevels[s]||"Intermediate"} onChange={v=>set("skillLevels",{...form.skillLevels,[s]:v})} options={["Beginner","Intermediate","Advanced","Expert"]}/></div>)}</div></Section>
        <Section n={9} title="Languages Known"><div className="j-repeat-card">{form.languagesKnown.map((l,i)=><div className="j-grid j-row-card" key={i}><Field label="Language Name"><Input value={l.name} onChange={v=>updateArr("languagesKnown",i,"name",v)}/></Field>{["read","write","speak","understand"].map(k=><label className="j-check" key={k}><input type="checkbox" checked={!!l[k]} onChange={e=>updateArr("languagesKnown",i,k,e.target.checked)}/>{k}</label>)}<button type="button" className="j-remove" onClick={()=>removeArr("languagesKnown",i)}>Remove</button></div>)}<button type="button" className="j-add" onClick={()=>add("languagesKnown",{name:"",read:false,write:false,speak:false,understand:false})}>+ Add Language</button></div></Section>
        <Section n={10} title="Work Experience"><div className="j-repeat-card">{form.workExperience.map((w,i)=><div className="j-grid j-row-card" key={i}><Field label="Company Name" required><Input value={w.companyName} onChange={v=>updateArr("workExperience",i,"companyName",v)}/></Field><Field label="Industry"><Input value={w.industry} onChange={v=>updateArr("workExperience",i,"industry",v)}/></Field><Field label="Designation"><Input value={w.designation} onChange={v=>updateArr("workExperience",i,"designation",v)}/></Field><Field label="Department"><Input value={w.department} onChange={v=>updateArr("workExperience",i,"department",v)}/></Field><Field label="Employment Type"><Input value={w.employmentType} onChange={v=>updateArr("workExperience",i,"employmentType",v)}/></Field><Field label="Start Date"><Input type="date" value={w.startDate} onChange={v=>updateArr("workExperience",i,"startDate",v)}/></Field><Field label="End Date"><Input type="date" value={w.endDate} onChange={v=>updateArr("workExperience",i,"endDate",v)}/></Field><Field label="Total Experience"><Input value={w.totalExperience} onChange={v=>updateArr("workExperience",i,"totalExperience",v)}/></Field><Field label="Current/Last CTC"><Input value={w.currentLastCTC} onChange={v=>updateArr("workExperience",i,"currentLastCTC",v)}/></Field><Field label="Fixed Salary"><Input value={w.fixedSalary} onChange={v=>updateArr("workExperience",i,"fixedSalary",v)}/></Field><Field label="Variable Salary"><Input value={w.variableSalary} onChange={v=>updateArr("workExperience",i,"variableSalary",v)}/></Field><Field label="Expected CTC"><Input value={w.expectedCTC} onChange={v=>updateArr("workExperience",i,"expectedCTC",v)}/></Field><Field label="Reporting Manager Name"><Input value={w.managerName} onChange={v=>updateArr("workExperience",i,"managerName",v)}/></Field><Field label="Reporting Manager Contact"><Input value={w.managerContact} onChange={v=>updateArr("workExperience",i,"managerContact",v)}/></Field><Field label="Reason for Leaving" required><Input value={w.reasonForLeaving} onChange={v=>updateArr("workExperience",i,"reasonForLeaving",v)}/></Field>{["Experience Letter","Relieving Letter","Offer Letter","Promotion Letter","Last 3 Salary Slips"].map((d,j)=><Upload key={d} label={d+(j<3?" *":"")} name={`exp_${i}_${j}`} files={files} setFiles={setFiles} accept=".pdf,image/*"/>)}<button type="button" className="j-remove" onClick={()=>removeArr("workExperience",i)}>Remove Employment</button></div>)}<button type="button" className="j-add" onClick={()=>add("workExperience",{companyName:"",industry:"",designation:"",department:"",employmentType:"",startDate:"",endDate:"",totalExperience:"",currentLastCTC:"",fixedSalary:"",variableSalary:"",expectedCTC:"",managerName:"",managerContact:"",reasonForLeaving:""})}>+ Add Previous Employment</button></div></Section>

      </>}
      {step===4&&<>
        <Section n={11} title="Banking Information"><div className="j-grid"><Field label="Account Holder Name" required><Input value={form.bankDetails.accountHolderName} onChange={v=>nested("bankDetails","accountHolderName",v)} required/></Field><Field label="Bank Name" required><Input value={form.bankDetails.bankName} onChange={v=>nested("bankDetails","bankName",v)} required/></Field><Field label="Branch Name" required><Input value={form.bankDetails.branchName} onChange={v=>nested("bankDetails","branchName",v)} required/></Field><Field label="Account Number" required><Input value={form.bankDetails.accountNumber} onChange={v=>nested("bankDetails","accountNumber",v)} required/></Field><Field label="Confirm Account Number" required><Input value={form.bankDetails.confirmAccountNumber} onChange={v=>nested("bankDetails","confirmAccountNumber",v)} required/></Field><Field label="IFSC Code" required><Input value={form.bankDetails.ifscCode} onChange={v=>nested("bankDetails","ifscCode",v)} required/></Field><Field label="UPI ID"><Input value={form.bankDetails.upiId} onChange={v=>nested("bankDetails","upiId",v)}/></Field><Upload label="Cancelled Cheque *" name="cancelledCheque" files={files} setFiles={setFiles} accept=".pdf,image/*"/><Upload label="Bank Passbook / Statement *" name="bankStatement" files={files} setFiles={setFiles} accept=".pdf,image/*"/></div></Section>
        <Section n={12} title="Family Information"><div className="j-grid">{["father","mother","spouse"].map(k=><div className="j-repeat-card" key={k}><h3>{k[0].toUpperCase()+k.slice(1)}</h3><Field label="Name"><Input value={form.familyInformation[k].name} onChange={v=>nestedFamily(k,"name",v)}/></Field><Field label="Occupation"><Input value={form.familyInformation[k].occupation} onChange={v=>nestedFamily(k,"occupation",v)}/></Field><Field label="Contact Number"><Input value={form.familyInformation[k].contactNumber} onChange={v=>nestedFamily(k,"contactNumber",v)}/></Field></div>)}<div className="j-repeat-card"><h3>Children (If Applicable)</h3>{form.familyInformation.children.map((c,i)=><div className="j-grid" key={i}><Field label="Name"><Input value={c.name} onChange={v=>updateChild(i,"name",v)}/></Field><Field label="Date of Birth"><Input type="date" value={c.dateOfBirth} onChange={v=>updateChild(i,"dateOfBirth",v)}/></Field><Field label="Relationship"><Input value={c.relationship} onChange={v=>updateChild(i,"relationship",v)}/></Field></div>)}<button type="button" className="j-add" onClick={()=>setForm(f=>({...f,familyInformation:{...f.familyInformation,children:[...f.familyInformation.children,{name:"",dateOfBirth:"",relationship:""}]}}))}>+ Add Child</button></div></div></Section>
        <Section n={13} title="Social & Professional Profiles"><div className="j-grid">{[["linkedin","LinkedIn Profile URL"],["github","GitHub Profile URL"],["portfolio","Portfolio Website"],["personalWebsite","Personal Website"],["behance","Behance Profile"],["dribbble","Dribbble Profile"],["twitter","Twitter/X Profile"]].map(([k,l])=><Field label={l} key={k}><Input value={form.socialProfiles[k]} onChange={v=>nested("socialProfiles",k,v)}/></Field>)}</div></Section>
      </>}
      {step===5&&<>
        <Section n={14} title="Asset & System Requirements"><div className="j-subtitle">Select Required Resources</div><ToggleChips items={assets} value={form.assetRequirements} onChange={v=>set("assetRequirements",v)}/></Section>
        <Section n={15} title="Mandatory Document Uploads"><div className="j-grid">{[["Profile Photo","profilePhoto","image/*"],["Signature","signatureUpload","image/*,.pdf"],["Resume/CV","resumeCV",".pdf,.doc,.docx"],["Aadhaar Card","aadhaarFront","image/*,.pdf"],["PAN Card","panCard","image/*,.pdf"],["10th Marksheet","education_0",".pdf,image/*"],["12th Marksheet","education_1",".pdf,image/*"],["Graduation Degree","education_2",".pdf,image/*"],["Graduation Marksheets","graduationMarksheets",".pdf,image/*"],["Experience Letter","exp_0_0",".pdf,image/*"],["Relieving Letter","exp_0_1",".pdf,image/*"],["Offer Letter","exp_0_2",".pdf,image/*"],["Salary Slips","salarySlips",".pdf,image/*"],["Cancelled Cheque","cancelledCheque",".pdf,image/*"],["Passbook Copy","bankStatement",".pdf,image/*"],["Passport","passport",".pdf,image/*"],["Driving License","drivingLicense",".pdf,image/*"],["Certifications","cert_0",".pdf,image/*"],["Achievements","achievements",".pdf,image/*"]].map(([l,n,a])=><Upload key={n} label={l} name={n} files={files} setFiles={setFiles} accept={a}/>)}</div></Section>
        <Section n={16} title="Background Verification Consent"><div className="j-declare"><p>I authorize the company to verify my educational qualifications, previous employment records, identity documents, criminal records (where legally permissible), and professional references.</p><label className="j-check"><input type="checkbox" checked={form.verificationConsent} onChange={e=>set("verificationConsent",e.target.checked)}/> I Agree</label></div></Section>
        <Section n={17} title="References"><div className="j-grid">{[0,1].map(i=><div className="j-repeat-card" key={i}><h3>Reference {i+1}</h3>{["name","designation","organization","phone","email"].map(k=><Field label={k.replace(/([A-Z])/g," $1")} key={k}><Input value={form.references?.[i]?.[k]||""} onChange={v=>updateArr("references",i,k,v)}/></Field>)}</div>)}</div></Section>
        <Section n={18} title="Employee Declaration"><div className="j-declare"><p>I hereby declare that the information furnished by me in this joining form is true, complete, and accurate to the best of my knowledge. I understand that any false statement, misrepresentation, or omission may lead to disciplinary action, including termination of employment.</p><p>I further agree to abide by all company policies, code of conduct, confidentiality agreements, information security policies, and applicable employment regulations.</p><label className="j-check"><input type="checkbox" checked={form.declarationConfirmed} onChange={e=>{set("declarationConfirmed",e.target.checked);set("declaration",e.target.checked)}}/> I Confirm the Above Declaration</label></div></Section>
      </>}
      <div className="j-footer-actions">{step>1&&<button type="button" className="j-btn secondary" onClick={()=>{setStep(s=>s-1);window.scrollTo(0,0)}}>← Previous</button>}{step<5?<button type="button" className="j-btn primary" onClick={()=>{const e=validateStep();if(e){setMessage(e);return;}setMessage("");setStep(s=>s+1);window.scrollTo(0,0)}}>Save & Continue →</button>:<button type="submit" className="j-btn primary" disabled={saving}>{saving?"Submitting…":"Submit Joining Form ✓"}</button>}</div>
    </form>
    <style>{styles}</style>
  </div>;

  function nestedFamily(k,f,v){setForm(x=>({...x,familyInformation:{...x.familyInformation,[k]:{...x.familyInformation[k],[f]:v}}}));}
  function updateChild(i,f,v){setForm(x=>({...x,familyInformation:{...x.familyInformation,children:x.familyInformation.children.map((c,idx)=>idx===i?{...c,[f]:v}:c)}}));}
}

const styles=`
.j-page{min-height:100%;padding:28px 34px 60px;background:linear-gradient(180deg,#f8fafc 0%,#eef4ff 100%);color:#0f172a}.j-hero{display:flex;justify-content:space-between;gap:20px;align-items:center;padding:28px 30px;border-radius:24px;background:linear-gradient(135deg,#0b1220,#172554);color:#fff;box-shadow:0 18px 45px rgba(15,23,42,.18);margin-bottom:18px}.j-kicker{font-size:11px;letter-spacing:1.8px;color:#93c5fd;font-weight:900}.j-hero h1{margin:7px 0 8px;font-size:32px;font-weight:950}.j-hero em{font-style:normal;color:#a78bfa}.j-hero p{margin:0;color:#cbd5e1;font-size:13px}.j-progress{min-width:130px;text-align:center;padding:14px 18px;border:1px solid rgba(255,255,255,.15);border-radius:18px;background:rgba(255,255,255,.06)}.j-progress b{display:block;font-size:26px}.j-progress span{font-size:11px;color:#cbd5e1}.j-steps{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin:0 0 18px}.j-steps button{border:1px solid #dbe4f0;background:#fff;border-radius:15px;padding:12px;text-align:left;display:flex;gap:10px;align-items:center;cursor:pointer}.j-steps button.active{border-color:#6366f1;box-shadow:0 8px 24px rgba(99,102,241,.15)}.j-steps button.done{border-color:#a7f3d0}.j-steps span{font-size:20px}.j-steps b{display:block;font-size:12px}.j-steps small{display:block;color:#64748b;font-size:10px;margin-top:2px}.j-form{display:flex;flex-direction:column;gap:16px}.j-section{background:#fff;border:1px solid #dbe4f0;border-radius:20px;padding:22px;box-shadow:0 10px 30px rgba(15,23,42,.05)}.j-section-head{display:flex;gap:12px;align-items:center;margin-bottom:18px}.j-section-no{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;font-weight:900}.j-section h2{font-size:17px;margin:0;font-weight:900}.j-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.j-grid.one{grid-template-columns:1fr 1fr}.j-field{display:flex;flex-direction:column;gap:6px;font-size:11px;font-weight:850;color:#475569}.j-field b{color:#dc2626}.j-input{width:100%;box-sizing:border-box;border:1px solid #d6deea;border-radius:11px;padding:10px 11px;font:inherit;color:#0f172a;background:#fbfdff;outline:none}.j-input:focus{border-color:#818cf8;box-shadow:0 0 0 3px rgba(99,102,241,.10)}.j-input:disabled{background:#f1f5f9;color:#64748b}.j-textarea{min-height:110px;resize:vertical}.j-upload{border:1.5px dashed #b9c5d6;border-radius:14px;padding:13px;background:#f8fafc}.j-upload-preview{display:block;width:90px;height:90px;object-fit:cover;border-radius:10px;margin-top:9px;border:1px solid #dbe4f0}.j-upload-title{font-size:11px;font-weight:900;color:#334155;margin-bottom:8px}.j-upload input{width:100%;font-size:11px}.j-file-row{display:flex;justify-content:space-between;gap:8px;margin-top:8px;font-size:10px;color:#334155;align-items:center}.j-file-row button,.j-signbox button{border:0;border-radius:8px;padding:5px 8px;background:#e2e8f0;cursor:pointer;font-size:10px;font-weight:800}.j-signbox{grid-column:span 2;border:1.5px dashed #b9c5d6;border-radius:14px;padding:13px}.j-signbox b{font-size:11px}.j-signbox canvas{width:100%;height:120px;background:#fff;border:1px solid #e2e8f0;border-radius:10px;display:block;margin:8px 0;touch-action:none}.j-verify{grid-column:span 2;border:1px solid #dbe4f0;border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:9px}.j-verify b{font-size:12px}.j-verify span{font-size:10px;color:#64748b}.j-inline{display:grid;grid-template-columns:auto 1fr;gap:8px}.j-verify button,.j-add{border:0;background:#eef2ff;color:#4338ca;border-radius:9px;padding:8px 11px;font-weight:850;cursor:pointer}.j-address-cols{display:grid;grid-template-columns:1fr 1fr;gap:16px}.j-address-card{border:1px solid #e2e8f0;border-radius:16px;padding:15px;background:#fafcff}.j-address-card h3,.j-repeat-card h3{margin:0 0 12px;font-size:12px;font-weight:900}.j-check{display:flex;align-items:center;gap:7px;font-size:11px;font-weight:800;color:#475569;margin:6px 0}.j-chips{display:flex;flex-wrap:wrap;gap:8px}.j-chips button{border:1px solid #d8e0eb;background:#fff;border-radius:999px;padding:8px 11px;font-size:11px;font-weight:800;color:#475569;cursor:pointer}.j-chips button.on{background:#eef2ff;border-color:#818cf8;color:#4338ca}.j-subtitle{font-size:12px;font-weight:950;color:#334155;margin:4px 0 10px}.j-repeat-card{border:1px solid #e2e8f0;background:#fafcff;border-radius:15px;padding:15px;margin-bottom:12px}.j-row-card{position:relative;margin-bottom:10px;padding:12px;border:1px solid #e2e8f0;border-radius:12px;background:#fff}.j-remove{border:0;background:#fef2f2;color:#dc2626;border-radius:9px;padding:7px 10px;font-weight:850;cursor:pointer}.j-add{margin-top:4px}.j-skill-line{display:grid;grid-template-columns:1fr 180px;gap:12px;align-items:center;padding:8px 0;border-bottom:1px solid #eef2f7;font-size:11px}.j-declare{padding:16px;border:1px solid #dbe4f0;background:#f8fafc;border-radius:14px;font-size:12px;line-height:1.65}.j-declare p{margin:0 0 10px}.j-footer-actions{display:flex;justify-content:flex-end;gap:10px;padding:4px 0 18px}.j-btn{border:0;border-radius:12px;padding:12px 18px;font-weight:900;cursor:pointer}.j-btn.primary{background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;box-shadow:0 10px 25px rgba(79,70,229,.22)}.j-btn.secondary{background:#fff;border:1px solid #dbe4f0;color:#334155}.j-message{padding:12px 15px;border-radius:12px;margin-bottom:15px;font-size:12px;font-weight:800}.j-message.ok{background:#ecfdf5;color:#047857;border:1px solid #a7f3d0}.j-message.err{background:#fff7ed;color:#c2410c;border:1px solid #fed7aa}.j-loading,.j-locked,.j-result{min-height:60vh;display:grid;place-content:center;text-align:center;padding:30px}.j-locked,.j-result{background:#fff;border:1px solid #e2e8f0;border-radius:24px;margin:40px auto;max-width:650px}.j-locked div,.j-result-icon{font-size:52px}.j-locked h1,.j-result h1{font-size:25px;margin:10px 0}.j-locked p,.j-result p{color:#64748b}.j-result small{color:#64748b}@media(max-width:1000px){.j-grid{grid-template-columns:1fr 1fr}.j-steps{grid-template-columns:1fr 1fr}.j-address-cols{grid-template-columns:1fr}.j-signbox,.j-verify{grid-column:span 1}}@media(max-width:650px){.j-page{padding:15px}.j-hero{padding:20px;flex-direction:column;align-items:flex-start}.j-grid,.j-grid.one{grid-template-columns:1fr}.j-steps{grid-template-columns:1fr}.j-section{padding:15px}}
`;
