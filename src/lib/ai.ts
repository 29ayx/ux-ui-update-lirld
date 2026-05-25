import { AdminUserData } from "./admin";

/**
 * Interface for AI Response
 */
export interface AIResponse {
    text: string;
    error?: string;
}

/**
 * Service to handle AI interactions
 */
export class AIService {
    private static instance: AIService;

    // TODO: Replace with your actual API Key
    // You can get an xAI key from https://console.x.ai/
    // or an OpenAI key from https://platform.openai.com/
    private apiKey: string = "xai-YOUR_API_KEY_HERE";
    private apiUrl: string = "https://api.x.ai/v1/chat/completions"; // Or https://api.openai.com/v1/chat/completions

    private constructor() { }

    public static getInstance(): AIService {
        if (!AIService.instance) {
            AIService.instance = new AIService();
        }
        return AIService.instance;
    }

    /**
     * Generate a response from the AI agent
     * @param message The user's message
     * @param agent The AI agent user data
     * @returns Promise<AIResponse>
     */
    public async generateResponse(message: string, agent: AdminUserData): Promise<AIResponse> {
        // 1. Try to use the real API if a key is configured (and not the placeholder)
        if (this.apiKey && !this.apiKey.includes("YOUR_API_KEY")) {
            try {
                const response = await this.callLLM(message, agent);
                return { text: response };
            } catch (error) {
                console.error("API call failed, falling back to mock:", error);
                // Fallback to mock if API fails
            }
        }

        // 2. Fallback to improved mock response
        // Simulate network delay for realism
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

        return {
            text: this.getMockResponse(message, agent)
        };
    }

    /**
     * Call the LLM API (xAI / OpenAI compatible)
     */
    private async callLLM(message: string, agent: AdminUserData): Promise<string> {
        const persona = agent.aiPersona || "You are a helpful assistant.";
        const tone = agent.aiTone || "friendly";
        const model = agent.aiModel || "grok-beta";

        const systemPrompt = `${persona}\n\nYour tone should be: ${tone}.\nKeep your responses concise and natural, like a real person chatting.`;

        const response = await fetch(this.apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: message }
                ],
                temperature: 0.7,
                max_tokens: 150
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`API Error: ${response.status} ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || "...";
    }

    /**
     * Generate a mock response based on persona and tone
     */
    private getMockResponse(message: string, agent: AdminUserData): string {
        const msg = message.toLowerCase();
        const persona = agent.aiPersona || "friend";

        // More natural conversational patterns
        const greetings = ["hey", "hello", "hi", "yo", "sup"];
        if (greetings.some(g => msg.includes(g))) {
            return this.randomChoice([
                `Hey there! How's it going?`,
                `Hi! Nice to hear from you.`,
                `Hello! What's on your mind?`,
                `Hey! How are you doing today?`
            ]);
        }

        if (msg.includes("how are you") || msg.includes("how r u")) {
            return this.randomChoice([
                `I'm doing great, thanks for asking! You?`,
                `Pretty good! Just chilling. How about you?`,
                `I'm good! Having a nice day.`,
                `Doing well! What are you up to?`
            ]);
        }

        if (msg.includes("name") || msg.includes("who are you")) {
            return `I'm ${agent.name || "a friend"}. Nice to meet you!`;
        }

        if (msg.includes("lol") || msg.includes("haha") || msg.includes("lmao")) {
            return this.randomChoice([
                "Haha! 😂",
                "Glad I could make you laugh!",
                "😂",
                "Right??"
            ]);
        }

        if (msg.includes("real") || msg.includes("bot") || msg.includes("ai")) {
            return "I'm just me! 😊";
        }

        // Context-aware generic responses
        if (msg.endsWith("?")) {
            return this.randomChoice([
                "That's an interesting question! I'd say... it depends.",
                "Hmm, I'm not entirely sure, but I'd love to hear your thoughts.",
                "Good question! What do you think?",
                "I guess so! Why do you ask?"
            ]);
        }

        return this.randomChoice([
            "That's interesting!",
            "Tell me more about that.",
            "I see what you mean.",
            "Yeah, totally.",
            "For sure!",
            "No way!",
            "Really?"
        ]);
    }

    private randomChoice(options: string[]): string {
        return options[Math.floor(Math.random() * options.length)];
    }
}

export const aiService = AIService.getInstance();
