// Free Hiring Resource Center — Payroll Calculator.
// Computes an approximate CTC -> in-hand salary breakdown for Indian
// payroll. All figures are estimates for guidance only (actual numbers
// depend on company policy & the employee's tax declarations).

const PT_SLABS_MONTHLY = {
  // Professional Tax — flat approximations by state, monthly (INR). 0 where
  // PT doesn't apply (e.g. UP/Delhi/NCR/Haryana have no PT).
  "Uttar Pradesh": 0,
  Delhi: 0,
  Haryana: 0,
  Maharashtra: 200,
  Karnataka: 200,
  "West Bengal": 200,
  "Andhra Pradesh": 200,
  Telangana: 200,
  "Tamil Nadu": 208,
};

const round = (n) => Math.round(n * 100) / 100;

// Simplified New Tax Regime (FY 2024-25) slabs applied to annual taxable
// income (after ₹50,000 standard deduction). Approximate — for a quick
// ballpark figure only, not tax advice.
const estimateAnnualTax = (annualTaxableIncome) => {
  const slabs = [
    { upto: 300000, rate: 0 },
    { upto: 600000, rate: 0.05 },
    { upto: 900000, rate: 0.1 },
    { upto: 1200000, rate: 0.15 },
    { upto: 1500000, rate: 0.2 },
    { upto: Infinity, rate: 0.3 },
  ];

  let tax = 0;
  let lastCap = 0;
  for (const slab of slabs) {
    if (annualTaxableIncome > lastCap) {
      const taxableInSlab = Math.min(annualTaxableIncome, slab.upto) - lastCap;
      tax += taxableInSlab * slab.rate;
      lastCap = slab.upto;
    } else break;
  }

  // Section 87A rebate — nil tax up to ₹7L taxable income under new regime.
  if (annualTaxableIncome <= 700000) tax = 0;

  // 4% health & education cess.
  return round(tax * 1.04);
};

// Main entry point: calculateSalaryBreakup({ annualCTC, state, basicPercent })
export const calculateSalaryBreakup = ({
  annualCTC,
  state = "Uttar Pradesh",
  basicPercent = 40,
}) => {
  const ctc = Number(annualCTC);
  if (!ctc || ctc <= 0) {
    throw new Error("annualCTC must be a positive number");
  }
  const basicPct = Math.min(Math.max(Number(basicPercent) || 40, 30), 60);

  const annualBasic = round(ctc * (basicPct / 100));
  const annualHRA = round(annualBasic * 0.5); // 50% of basic (metro convention)

  // Employer PF — 12% of basic, capped at ₹15,000/month basic for PF purposes.
  const pfWageBaseMonthly = Math.min(annualBasic / 12, 15000);
  const employerPFMonthly = round(pfWageBaseMonthly * 0.12);
  const employeePFMonthly = round(pfWageBaseMonthly * 0.12);
  const annualEmployerPF = round(employerPFMonthly * 12);
  const annualEmployeePF = round(employeePFMonthly * 12);

  // Gratuity provision (informational — part of CTC, not paid monthly).
  const annualGratuity = round((annualBasic * 4.81) / 100);

  // Special allowance = balancing figure so components sum to CTC.
  const annualSpecialAllowance = round(
    ctc - annualBasic - annualHRA - annualEmployerPF - annualGratuity,
  );

  const grossMonthly = round(
    (annualBasic + annualHRA + Math.max(annualSpecialAllowance, 0)) / 12,
  );

  // ESI — applicable only if gross <= ₹21,000/month.
  const esiApplicable = grossMonthly <= 21000;
  const employeeESIMonthly = esiApplicable ? round(grossMonthly * 0.0075) : 0;
  const employerESIMonthly = esiApplicable ? round(grossMonthly * 0.0325) : 0;

  const professionalTaxMonthly = PT_SLABS_MONTHLY[state] ?? 0;

  const annualGrossForTax = grossMonthly * 12;
  const standardDeduction = 50000;
  const annualTaxableIncome = Math.max(
    annualGrossForTax - standardDeduction,
    0,
  );
  const estimatedAnnualTDS = estimateAnnualTax(annualTaxableIncome);
  const monthlyTDS = round(estimatedAnnualTDS / 12);

  const monthlyDeductions = round(
    employeePFMonthly +
      employeeESIMonthly +
      professionalTaxMonthly +
      monthlyTDS,
  );
  const netMonthlyInHand = round(grossMonthly - monthlyDeductions);

  return {
    inputs: { annualCTC: ctc, state, basicPercent: basicPct },
    annual: {
      basic: annualBasic,
      hra: annualHRA,
      specialAllowance: Math.max(annualSpecialAllowance, 0),
      employerPF: annualEmployerPF,
      gratuity: annualGratuity,
      ctc: ctc,
    },
    monthly: {
      basic: round(annualBasic / 12),
      hra: round(annualHRA / 12),
      specialAllowance: round(Math.max(annualSpecialAllowance, 0) / 12),
      gross: grossMonthly,
      employeePF: employeePFMonthly,
      employerPF: employerPFMonthly,
      employeeESI: employeeESIMonthly,
      employerESI: employerESIMonthly,
      professionalTax: professionalTaxMonthly,
      estimatedTDS: monthlyTDS,
      totalDeductions: monthlyDeductions,
      netInHand: netMonthlyInHand,
    },
    disclaimer:
      "Approximate estimate for guidance only — actual pay depends on your " +
      "company's salary structure and your tax declarations/regime choice.",
  };
};
