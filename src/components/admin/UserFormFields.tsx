import { Show, createSignal, For } from "solid-js";
import { compressAndUpload, UploadProgress } from "~/lib/profile/photoUpload";
import { generateFakeUser, fetchFakeUser, SUPPORTED_COUNTRIES } from "~/lib/fakeData";
import { HiSolidCloudArrowUp, HiSolidSparkles, HiSolidXMark } from "solid-icons/hi";
import { CgSpinner } from "solid-icons/cg";

interface UserFormFieldsProps {
  formData: {
    name: string;
    email: string;
    photos: string[];
    photoUrl?: string;
    photoUrl2?: string;
    country: string;
    language: string;
    gender: string;
    credits: number;        // Changed from balance: string to credits: number
    pricePerMinute: string;
    isHost: boolean;
    isAdmin: boolean;
    isHidden: boolean;
    forcedOnline: boolean;
    isAI: boolean;
    aiModel: string;
    aiPersona: string;
    aiTone: string;
    aiVoiceId: string;
    hidePrice?: boolean;
    age?: number;
    isFeatured?: boolean;
    featuredGif?: string;
  };
  setFormData: (data: any) => void;
}

export default function UserFormFields(props: UserFormFieldsProps) {
  const [uploading, setUploading] = createSignal<string | null>(null);
  const [generating, setGenerating] = createSignal(false);
  const [useUsername, setUseUsername] = createSignal(false);
  const [uploadingGif, setUploadingGif] = createSignal(false);

  const handleGenerateFakeData = async () => {
    if (generating()) return;
    setGenerating(true);
    try {
      const country = props.formData.country || SUPPORTED_COUNTRIES[Math.floor(Math.random() * SUPPORTED_COUNTRIES.length)];

      const gender = props.formData.gender as 'Female' | 'Male' | 'Other';
      const genderParam = (gender === 'Male' || gender === 'Female') ? gender.toLowerCase() as 'male' | 'female' : undefined;

      const fakeData = await fetchFakeUser(country, {
        gender: genderParam,
        useUsername: useUsername()
      });

      props.setFormData({
        ...props.formData,
        ...fakeData
      });
    } finally {
      setGenerating(false);
    }
  };

  const handlePhotoUpload = async (e: Event, mode: 'new') => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    setUploading(mode);
    try {
      const result = await compressAndUpload(file, "admin_upload");
      props.setFormData({
        ...props.formData,
        photos: [...(props.formData.photos || []), result.downloadURL]
      });
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(null);
      input.value = "";
    }
  };

  const handleGifUpload = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    setUploadingGif(true);
    try {
      const result = await compressAndUpload(file, "featured_gifs");
      props.setFormData({
        ...props.formData,
        featuredGif: result.downloadURL
      });
    } catch (error) {
      console.error("GIF upload failed:", error);
      alert("GIF upload failed. Please try again.");
    } finally {
      setUploadingGif(false);
      input.value = "";
    }
  };

  return (
    <>
      <div class="flex justify-end mb-4 gap-4 items-center">
        <label class="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={useUsername()}
            onChange={(e) => setUseUsername(e.currentTarget.checked)}
            class="w-4 h-4 text-slate-600 border-slate-300 rounded focus:ring-slate-500"
          />
          <span class="text-sm text-slate-600">Use Username</span>
        </label>
        <button
          type="button"
          onClick={handleGenerateFakeData}
          disabled={generating()}
          class={`px-3 py-1.5 bg-slate-100 text-slate-700 rounded border border-slate-200 hover:bg-slate-200 transition-colors text-sm font-medium flex items-center gap-2 ${generating() ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          <Show when={generating()} fallback={<HiSolidSparkles class="w-4 h-4" />}>
            <CgSpinner class="w-4 h-4 animate-spin" />
          </Show>
          {generating() ? 'Generating...' : 'Generate Data'}
        </button>
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Name</label>
        <input
          type="text"
          required
          value={props.formData.name}
          onInput={(e) => props.setFormData({ ...props.formData, name: e.currentTarget.value })}
          class="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-500 focus:border-slate-500 text-slate-900 text-sm"
        />
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email</label>
        <input
          type="email"
          required
          value={props.formData.email}
          onInput={(e) => props.setFormData({ ...props.formData, email: e.currentTarget.value })}
          class="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-500 focus:border-slate-500 text-slate-900 text-sm"
        />
      </div>

      <div class="mb-6">
        <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Photos</label>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-3">
          <For each={props.formData.photos || []}>
            {(photo, index) => (
              <div class="relative aspect-[3/4] rounded-md overflow-hidden group bg-slate-100 border border-slate-200">
                <img src={photo} alt={`Photo ${index() + 1}`} class="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    const newPhotos = [...(props.formData.photos || [])];
                    newPhotos.splice(index(), 1);
                    props.setFormData({ ...props.formData, photos: newPhotos });
                  }}
                  class="absolute top-1 right-1 w-5 h-5 bg-slate-800 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-900"
                >
                  <HiSolidXMark class="w-3 h-3" />
                </button>
              </div>
            )}
          </For>

          <div class="aspect-[3/4] rounded-md border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-2 p-2 hover:bg-slate-50 transition-colors">
            <label class={`cursor-pointer flex flex-col items-center gap-1 ${uploading() === 'new' ? 'opacity-50' : ''}`}>
              <div class="w-7 h-7 rounded bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200">
                <HiSolidCloudArrowUp class="w-4 h-4" />
              </div>
              <span class="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{uploading() === 'new' ? 'Wait...' : 'Upload'}</span>
              <input
                type="file"
                accept="image/*"
                class="hidden"
                disabled={!!uploading()}
                onChange={(e) => handlePhotoUpload(e, 'new')}
              />
            </label>
            <div class="w-full h-px bg-slate-200 my-1"></div>
            <div class="w-full flex gap-1">
              <input
                type="text"
                placeholder="URL..."
                class="w-full text-[10px] px-2 py-1 border border-slate-200 rounded focus:ring-1 focus:ring-slate-400 outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const url = e.currentTarget.value;
                    if (url) {
                      props.setFormData({ ...props.formData, photos: [...(props.formData.photos || []), url] });
                      e.currentTarget.value = '';
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Country</label>
          <input
            list="countries"
            type="text"
            value={props.formData.country}
            onInput={(e) => props.setFormData({ ...props.formData, country: e.currentTarget.value })}
            class="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-500 focus:border-slate-500 text-slate-900 text-sm"
            placeholder="Select..."
          />
          <datalist id="countries">
            <For each={SUPPORTED_COUNTRIES}>
              {(country) => <option value={country} />}
            </For>
          </datalist>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Language</label>
          <input
            type="text"
            value={props.formData.language}
            onInput={(e) => props.setFormData({ ...props.formData, language: e.currentTarget.value })}
            class="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-500 focus:border-slate-500 text-slate-900 text-sm"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Gender</label>
          <select
            value={props.formData.gender}
            onChange={(e) => props.setFormData({ ...props.formData, gender: e.currentTarget.value })}
            class="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-500 focus:border-slate-500 text-slate-900 text-sm bg-white"
          >
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Age</label>
          <input
            type="number"
            min="18"
            max="99"
            placeholder="18"
            value={props.formData.age || ""}
            onInput={(e) => {
              const value = e.currentTarget.valueAsNumber;
              props.setFormData({ ...props.formData, age: isNaN(value) ? undefined : value });
            }}
            class="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-500 focus:border-slate-500 text-slate-900 text-sm"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Credits</label>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={props.formData.credits}
            onInput={(e) => {
              const value = e.currentTarget.valueAsNumber;
              props.setFormData({ ...props.formData, credits: isNaN(value) ? 0 : value });
            }}
            onBlur={(e) => {
              const value = e.currentTarget.valueAsNumber;
              const formatted = isNaN(value) ? 0 : Number(value.toFixed(2));
              props.setFormData({ ...props.formData, credits: formatted });
            }}
            class="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-500 focus:border-slate-500 text-slate-900 text-sm"
          />
        </div>

        <Show when={props.formData.isHost}>
          <div>
            <label class="flex items-center gap-2 mb-3 cursor-pointer">
              <input
                type="checkbox"
                checked={props.formData.hidePrice}
                onChange={(e) => props.setFormData({ ...props.formData, hidePrice: e.currentTarget.checked })}
                class="w-4 h-4 text-slate-600 border-slate-300 rounded focus:ring-slate-500"
              />
              <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Hide Price</span>
            </label>

            <Show when={!props.formData.hidePrice}>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Price/Min</label>
              <input
                type="text"
                placeholder="0.00"
                value={props.formData.pricePerMinute}
                onInput={(e) => {
                  const val = e.currentTarget.value.replace(/[^0-9.]/g, '');
                  const parts = val.split('.');
                  if (parts.length > 2) return;
                  if (parts[1] && parts[1].length > 2) return;
                  props.setFormData({ ...props.formData, pricePerMinute: val });
                }}
                onBlur={(e) => {
                  const val = parseFloat(e.currentTarget.value) || 0;
                  props.setFormData({ ...props.formData, pricePerMinute: val.toFixed(2) });
                }}
                class="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-500 focus:border-slate-500 text-slate-900 text-sm"
              />
            </Show>
          </div>
        </Show>
      </div>

      <div class="flex flex-wrap gap-4 pt-4 border-t border-slate-100">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={props.formData.isHost}
            onChange={(e) => props.setFormData({ ...props.formData, isHost: e.currentTarget.checked })}
            class="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
          />
          <span class="text-xs font-bold text-slate-500 uppercase tracking-tight">Host</span>
        </label>

        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={props.formData.isAdmin}
            onChange={(e) => props.setFormData({ ...props.formData, isAdmin: e.currentTarget.checked })}
            class="w-4 h-4 text-slate-800 border-slate-300 rounded focus:ring-slate-800"
          />
          <span class="text-xs font-bold text-slate-500 uppercase tracking-tight">Admin</span>
        </label>

        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={props.formData.isHidden}
            onChange={(e) => props.setFormData({ ...props.formData, isHidden: e.currentTarget.checked })}
            class="w-4 h-4 text-red-600 border-slate-300 rounded focus:ring-red-500"
          />
          <span class="text-xs font-bold text-slate-500 uppercase tracking-tight text-red-500">Hidden</span>
        </label>

        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={props.formData.forcedOnline}
            onChange={(e) => props.setFormData({ ...props.formData, forcedOnline: e.currentTarget.checked })}
            class="w-4 h-4 text-slate-600 border-slate-300 rounded focus:ring-slate-500"
          />
          <span class="text-xs font-bold text-slate-500 uppercase tracking-tight">Online</span>
        </label>

        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={props.formData.isAI}
            onChange={(e) => props.setFormData({ ...props.formData, isAI: e.currentTarget.checked })}
            class="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500"
          />
          <span class="text-xs font-bold text-slate-500 uppercase tracking-tight">AI</span>
        </label>
      </div>

      <Show when={props.formData.isAI}>
        <div class="mt-4 p-3 bg-slate-50 rounded border border-slate-200 space-y-3">
          <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider">AI Config</h3>

          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Model</label>
            <select
              value={props.formData.aiModel}
              onChange={(e) => props.setFormData({ ...props.formData, aiModel: e.currentTarget.value })}
              class="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-slate-500 text-slate-900 text-sm bg-white font-mono"
            >
              <option value="grok-beta">Grok Beta</option>
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="claude-3-opus">Claude 3 Opus</option>
            </select>
          </div>

          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Persona</label>
            <textarea
              rows={3}
              placeholder="..."
              value={props.formData.aiPersona}
              onInput={(e) => props.setFormData({ ...props.formData, aiPersona: e.currentTarget.value })}
              class="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-slate-500 text-slate-900 text-xs"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tone</label>
              <input
                type="text"
                value={props.formData.aiTone}
                onInput={(e) => props.setFormData({ ...props.formData, aiTone: e.currentTarget.value })}
                class="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-slate-500 text-slate-900 text-xs"
              />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Voice ID</label>
              <input
                type="text"
                value={props.formData.aiVoiceId}
                onInput={(e) => props.setFormData({ ...props.formData, aiVoiceId: e.currentTarget.value })}
                class="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-slate-500 text-slate-900 text-[10px] font-mono"
              />
            </div>
          </div>
        </div>
      </Show>

      {/* Featured Section */}
      <div class="mt-6 pt-6 border-t border-slate-200">
        <label class="flex items-center gap-2 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={props.formData.isFeatured}
            onChange={(e) => props.setFormData({ ...props.formData, isFeatured: e.currentTarget.checked })}
            class="w-4 h-4 text-amber-600 border-slate-300 rounded focus:ring-amber-500"
          />
          <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Featured User</span>
        </label>

        <Show when={props.formData.isFeatured}>
          <div class="p-4 bg-amber-50 rounded-lg border border-amber-100 space-y-4">
            <h3 class="text-xs font-bold text-amber-700 uppercase tracking-wider">Featured GIF</h3>

            <Show when={props.formData.featuredGif}>
              <div class="relative aspect-video rounded-lg overflow-hidden bg-slate-100 border border-amber-200">
                <img src={props.formData.featuredGif} alt="Featured GIF" class="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => props.setFormData({ ...props.formData, featuredGif: "" })}
                  class="absolute top-2 right-2 w-6 h-6 bg-slate-800 text-white rounded-full flex items-center justify-center hover:bg-slate-900 transition-colors"
                >
                  <HiSolidXMark class="w-4 h-4" />
                </button>
              </div>
            </Show>

            <div class="flex gap-3">
              <label class={`flex-1 px-4 py-3 bg-white border-2 border-dashed border-amber-300 rounded-lg hover:bg-amber-50 transition-colors cursor-pointer flex items-center justify-center gap-2 ${uploadingGif() ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <HiSolidCloudArrowUp class="w-5 h-5 text-amber-600" />
                <span class="text-sm font-bold text-amber-700">
                  {uploadingGif() ? 'Uploading...' : 'Upload GIF'}
                </span>
                <input
                  type="file"
                  accept="image/gif,image/webp,video/mp4"
                  class="hidden"
                  disabled={uploadingGif()}
                  onChange={handleGifUpload}
                />
              </label>
            </div>

            <div class="relative">
              <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span class="text-xs font-bold text-slate-400">URL</span>
              </div>
              <input
                type="text"
                placeholder="Or paste GIF URL here..."
                value={props.formData.featuredGif || ""}
                onInput={(e) => props.setFormData({ ...props.formData, featuredGif: e.currentTarget.value })}
                class="w-full pl-12 pr-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-900 text-sm bg-white"
              />
            </div>
          </div>
        </Show>
      </div>
    </>
  );
}