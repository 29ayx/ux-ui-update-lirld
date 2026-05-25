import { fakerEN, fakerDE, fakerES, fakerFR, fakerIT, fakerJA, fakerZH_CN } from '@faker-js/faker';

// Map countries to relevant Faker locales
const getFakerForCountry = (country: string) => {
    const normalizedCountry = country.toLowerCase().trim();

    if (normalizedCountry.includes('germany') || normalizedCountry.includes('deutschland')) return fakerDE;
    if (normalizedCountry.includes('spain') || normalizedCountry.includes('mexico') || normalizedCountry.includes('argentina')) return fakerES;
    if (normalizedCountry.includes('france')) return fakerFR;
    if (normalizedCountry.includes('italy')) return fakerIT;
    if (normalizedCountry.includes('japan')) return fakerJA;
    if (normalizedCountry.includes('india')) return fakerEN; // fakerHI unavailable in this version
    if (normalizedCountry.includes('china')) return fakerZH_CN;

    // Default to English
    return fakerEN;
};

export interface FakeUser {
    name: string;
    email: string;
    country: string;
    language: string;
    bio: string;
    gender: string;
}

export const generateFakeUser = (country: string = 'United States'): FakeUser => {
    const faker = getFakerForCountry(country);

    // Random gender
    const sex = faker.person.sexType();
    const firstName = faker.person.firstName(sex);
    const gender = sex === 'female' ? 'Female' : 'Male';

    // Fancy styling logic (30% chance of being fancy)
    let name = firstName;
    if (Math.random() < 0.3) {
        const decorators = ['✨', '🌸', '💖', '🦋', '🌙', '💫', '👑'];
        const decorator = decorators[Math.floor(Math.random() * decorators.length)];
        // Randomly place decorator
        name = Math.random() > 0.5 ? `${name} ${decorator}` : `${decorator} ${name}`;
    }

    const email = faker.internet.email({ firstName, lastName: '' }).toLowerCase();

    // Generate a somewhat realistic bio
    const bio = faker.person.bio();

    // Determine language based on country (simple mapping)
    let language = "English";
    const c = country.toLowerCase();
    if (c.includes('germany')) language = "German, English";
    else if (c.includes('spain')) language = "Spanish, English";
    else if (c.includes('france')) language = "French, English";
    else if (c.includes('italy')) language = "Italian, English";
    else if (c.includes('japan')) language = "Japanese, English";
    else if (c.includes('india')) language = "Hindi, English";
    else if (c.includes('china')) language = "Chinese, English";

    return {
        name,
        email,
        country, // Keep the requested country
        language,
        bio,
        gender
    };
};

// Map supported countries to randomuser.me NAT codes
const getNatForCountry = (country: string): string | null => {
    const c = country.toLowerCase();
    if (c.includes('india')) return 'in';
    if (c.includes('united states') || c.includes('usa')) return 'us';
    if (c.includes('united kingdom') || c.includes('uk')) return 'gb';
    if (c.includes('germany')) return 'de';
    if (c.includes('spain')) return 'es';
    if (c.includes('france')) return 'fr';
    if (c.includes('italy')) return 'it'; // API docs say NO IT, but sometimes works or falls back.
    if (c.includes('brazil')) return 'br';
    if (c.includes('australia')) return 'au';
    return null;
};

export const fetchFakeUser = async (country: string = 'United States', options?: { gender?: 'male' | 'female', useUsername?: boolean }): Promise<FakeUser> => {
    const nat = getNatForCountry(country);

    // If country not supported by API, fallback to local generation
    if (!nat) {
        return generateFakeUser(country);
    }

    try {
        let url = `https://randomuser.me/api/?nat=${nat}`;
        if (options?.gender) {
            url += `&gender=${options.gender}`;
        }

        const response = await fetch(url);
        const data = await response.json();
        const user = data.results[0];

        // Map API gender to capitalized
        const gender = user.gender === 'female' ? 'Female' : 'Male';

        let name = "";

        // Logic for name:
        // 1. If options.useUsername is explicitly true => ALWAYS use username
        // 2. If options.useUsername is explicitly false => ALWAYS use real name
        // 3. If options.useUsername is undefined => 50/50 chance (legacy behavior)

        let shouldUseUsername = false;
        if (options?.useUsername !== undefined) {
            shouldUseUsername = options.useUsername;
        } else {
            shouldUseUsername = Math.random() > 0.5;
        }

        if (shouldUseUsername) {
            name = user.login.username;
        } else {
            name = `${user.name.first} ${user.name.last}`;

            // Apply fancy styling only to real names (30% chance)
            if (Math.random() < 0.3) {
                const decorators = ['✨', '🌸', '💖', '🦋', '🌙', '💫', '👑'];
                const decorator = decorators[Math.floor(Math.random() * decorators.length)];
                name = Math.random() > 0.5 ? `${name} ${decorator}` : `${decorator} ${name}`;
            }
        }

        // Generate bio locally since API items are limited or generic
        const bio = getFakerForCountry(country).person.bio();

        let language = "English";
        const c = country.toLowerCase();
        if (c.includes('germany')) language = "German, English";
        else if (c.includes('spain')) language = "Spanish, English";
        else if (c.includes('france')) language = "French, English";
        else if (c.includes('italy')) language = "Italian, English";
        else if (c.includes('japan')) language = "Japanese, English";
        else if (c.includes('india')) language = "Hindi, English";
        else if (c.includes('china')) language = "Chinese, English";
        else if (c.includes('brazil')) language = "Portuguese, English";

        return {
            name,
            email: user.email,
            country,
            language,
            bio,
            gender
        };
    } catch (e) {
        console.error("Failed to fetch fake user, falling back to local:", e);
        return generateFakeUser(country);
    }
};

export const SUPPORTED_COUNTRIES = [
    "United States",
    "United Kingdom",
    "Germany",
    "Spain",
    "France",
    "Italy",
    "Japan",
    "India",
    "China",
    "Brazil",
    "Australia"
];
