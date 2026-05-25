// Zodiac sign calculations

export interface ZodiacSign {
  name: string;
  emoji: string;
  dates: [[number, number], [number, number]];
}

export const zodiacSigns: ZodiacSign[] = [
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

export const getZodiacSign = (dob: string | undefined): ZodiacSign | null => {
  if (!dob) return null;
  try {
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return null;
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
  } catch {
    return null;
  }
};
