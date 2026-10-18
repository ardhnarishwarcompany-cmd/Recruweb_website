export const normalizePhone = (value, defaultCountryCode = "+91") => {
  if (!value) return null;

  let phone = String(value).trim();

  phone = phone.replace(/[^\d+]/g, "");

  if (phone.startsWith("00")) {
    phone = `+${phone.slice(2)}`;
  }

  if (!phone.startsWith("+")) {
    if (phone.startsWith("0")) {
      phone = phone.slice(1);
    }

    phone = `${defaultCountryCode}${phone}`;
  }

  const digits = phone.replace(/\D/g, "");

  if (digits.length < 8 || digits.length > 15) {
    throw new Error("Invalid phone number. Use international format.");
  }

  return `+${digits}`;
};