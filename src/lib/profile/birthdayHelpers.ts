// Birthday calculations

export interface BirthdayInfo {
  month: string;
  day: number;
  daysUntil: number;
}

export const getBirthdayInfo = (dob: string | undefined): BirthdayInfo | null => {
  if (!dob) return null;
  try {
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return null;
    const today = new Date();
    const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    const nextBirthday = thisYearBirthday < today
      ? new Date(today.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate())
      : thisYearBirthday;

    const daysUntil = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return {
      month: birthDate.toLocaleDateString("en-US", { month: "long" }),
      day: birthDate.getDate(),
      daysUntil: daysUntil >= 0 ? daysUntil : 0,
    };
  } catch {
    return null;
  }
};
