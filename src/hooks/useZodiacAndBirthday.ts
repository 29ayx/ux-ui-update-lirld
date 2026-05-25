import { createMemo } from "solid-js";

const zodiacSigns = [
  { name: "Capricorn", emoji: "♑", dates: [[12, 22], [1, 19]] },
  { name: "Aquarius", emoji: "♒", dates: [[1, 20], [2, 18]] },
  { name: "Pisces", emoji: "♓", dates: [[2, 19], [3, 20]] },
  { name: "Aries", emoji: "♈", dates: [[3, 21], [4, 19]] },
  { name: "Taurus", emoji: "♉", dates: [[4, 20], [5, 20]] },
  { name: "Gemini", emoji: "♊", dates: [[5, 21], [6, 20]] },
  { name: "Cancer", emoji: "♋", dates: [[6, 21], [7, 22]] },
  { name: "Leo", emoji: "♌", dates: [[7, 23], [8, 22]] },
  { name: "Virgo", emoji: "♍", dates: [[8, 23], [9, 22]] },
  { name: "Libra", emoji: "♎", dates: [[9, 23], [10, 22]] },
  { name: "Scorpio", emoji: "♏", dates: [[10, 23], [11, 21]] },
  { name: "Sagittarius", emoji: "♐", dates: [[11, 22], [12, 21]] },
];

function getZodiacSign(dob: string) {
  if (!dob) return null;
  const birthDate = new Date(dob);
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();

  for (const sign of zodiacSigns) {
    const [startMonth, startDay] = sign.dates[0];
    const [endMonth, endDay] = sign.dates[1];

    if (startMonth === endMonth) {
      if (month === startMonth && day >= startDay && day <= endDay) {
        return sign;
      }
    } else {
      if (month === startMonth && day >= startDay) return sign;
      if (month === endMonth && day <= endDay) return sign;
    }
  }
  return null;
}

function getBirthdayInfo(dob: string) {
  if (!dob) return null;
  const birthDate = new Date(dob);
  const today = new Date();
  const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
  const nextBirthday = thisYearBirthday < today
    ? new Date(today.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate())
    : thisYearBirthday;

  const daysUntil = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return {
    month: birthDate.toLocaleDateString("en-US", { month: "long" }),
    day: birthDate.getDate(),
    daysUntil
  };
}

export function useZodiacAndBirthday(profileData: () => any) {
  const zodiac = createMemo(() => getZodiacSign(profileData()?.dob));
  const birthdayInfo = createMemo(() => getBirthdayInfo(profileData()?.dob));

  return { zodiac, birthdayInfo };
}
