import { createMemo } from "solid-js";
import { getZodiacSign } from "~/lib/profile/zodiacHelpers";
import { getBirthdayInfo } from "~/lib/profile/birthdayHelpers";

export function useProfileData(profileData: () => any) {
  const data = createMemo(() => profileData() || {});
  
  const posts = createMemo(() => data()?.posts || []);
  
  const zodiac = createMemo(() => getZodiacSign(data()?.dob));
  
  const birthdayInfo = createMemo(() => getBirthdayInfo(data()?.dob));
  
  const lookingFor = createMemo(() => data()?.customization?.lookingFor || []);

  return {
    data,
    posts,
    zodiac,
    birthdayInfo,
    lookingFor
  };
}
