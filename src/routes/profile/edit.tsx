import { Show, createSignal, createMemo, onMount } from "solid-js";
import { useAuth } from "~/lib/auth";
import { useNavigate, useSearchParams } from "@solidjs/router";
import { useProfileEdit } from "~/hooks/useProfileEdit";
import { useDisplayName } from "~/hooks/useDisplayName";
import { useThemeSelection, themes } from "~/hooks/useThemeSelection";
import { useUnsavedChanges } from "~/hooks/useUnsavedChanges";
import { useZodiacAndBirthday } from "~/hooks/useZodiacAndBirthday";
import EditHeader from "~/components/profile/EditHeader";
import CollapsibleSection from "~/components/profile/edit/CollapsibleSection";
import PhotoSection from "~/components/profile/edit/PhotoSection";
import DisplayNameSection from "~/components/profile/edit/DisplayNameSection";
import ThemeSelector from "~/components/profile/edit/ThemeSelector";
import LookingForSelector from "~/components/profile/edit/LookingForSelector";
import BadgeEditor from "~/components/profile/edit/BadgeEditor";
import VisibilityToggles from "~/components/profile/edit/VisibilityToggles";
import SaveButton from "~/components/profile/SaveButton";

export default function ProfileEdit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [expandedSection, setExpandedSection] = createSignal<string | null>(typeof searchParams.section === 'string' ? searchParams.section : null);

  const {
    profileData,
    initialSnapshot,
    saving,
    saved,
    localChanges,
    setLocalChanges,
    toggleFeature,
    updateCustomText,
    updateCustomArray,
    handleSave
  } = useProfileEdit();

  const {
    displayNameInput,
    setDisplayNameInput,
    displayNameError,
    displayNameTouched,
    updateDisplayName,
    isDisplayNameValid
  } = useDisplayName(profileData, setLocalChanges, localChanges);

  const {
    selectedTheme,
    setSelectedTheme,
    themeInitialized
  } = useThemeSelection(profileData);

  const { zodiac, birthdayInfo } = useZodiacAndBirthday(profileData);

  const {
    hasUnsavedChanges
  } = useUnsavedChanges(
    initialSnapshot,
    profileData,
    localChanges,
    selectedTheme,
    themeInitialized,
    saved
  );

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleLookingForToggle = (option: string) => {
    const current = localChanges()["customization.lookingFor"] ?? profileData()?.customization?.lookingFor ?? [];
    const selected = Array.isArray(current) ? current : [];
    const isSelected = selected.includes(option);
    const newValue = isSelected ? selected.filter((o: string) => o !== option) : [...selected, option];
    updateCustomArray("lookingFor", newValue);
  };


  const lookingForSelected = createMemo(() => {
    const current = localChanges()["customization.lookingFor"] ?? profileData()?.customization?.lookingFor ?? [];
    return Array.isArray(current) ? current : [];
  });

  const showZodiacValue = createMemo(() =>
    localChanges()["showZodiac"] ?? (profileData()?.showZodiac !== false)
  );

  const showBirthdayValue = createMemo(() =>
    localChanges()["showBirthdayCard"] ?? (profileData()?.showBirthdayCard !== false)
  );

  const badgeTextValue = createMemo(() =>
    localChanges()["customization.badgeText"] ?? (profileData()?.customization?.badgeText || "")
  );

  const showCustomBadgeValue = createMemo(() =>
    localChanges()["showCustomBadge"] ?? (profileData()?.showCustomBadge || false)
  );

  const ageValue = createMemo(() =>
    localChanges()["age"] ?? (profileData()?.age || null)
  );

  const showAgeValue = createMemo(() =>
    localChanges()["showAge"] ?? (profileData()?.showAge !== false)
  );

  const currentPhotos = createMemo(() => {
    const profile = profileData();
    return localChanges().photos ?? profile?.photos ?? [];
  });

  const hasAtLeastOnePhoto = createMemo(() => {
    return currentPhotos().length >= 1;
  });

  return (
    <main class="min-h-screen bg-white dark:bg-black">
      <EditHeader
        hasUnsavedChanges={hasUnsavedChanges()}
        onBack={handleBackClick}
      />

      <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-32 space-y-6">
        <Show when={profileData()}>
          {(profile) => (
            <div class="space-y-4">
              <CollapsibleSection
                title="Photos"
                badge={
                  <span class="text-xs text-white/60 bg-white/10 px-2 py-1 rounded-full">
                    {currentPhotos().length}/6
                  </span>
                }
                expanded={expandedSection() === "photos"}
                onToggle={() => setExpandedSection(expandedSection() === "photos" ? null : "photos")}
              >
                <PhotoSection
                  photos={currentPhotos()}
                  userId={user()!.uid}
                  onPhotosChange={(newPhotos) => {
                    setLocalChanges({ ...localChanges(), photos: newPhotos });
                  }}
                  hasError={!hasAtLeastOnePhoto()}
                />
              </CollapsibleSection>

              <CollapsibleSection
                title="Name"
                badge={
                  <Show when={displayNameInput()}>
                    <span class="text-xs text-white/60 bg-white/10 px-2 py-1 rounded-full truncate max-w-[150px]">
                      {displayNameInput()}
                    </span>
                  </Show>
                }
                expanded={expandedSection() === "displayName"}
                onToggle={() => setExpandedSection(expandedSection() === "displayName" ? null : "displayName")}
              >
                <DisplayNameSection
                  displayNameInput={displayNameInput()}
                  displayNameError={displayNameError()}
                  displayNameTouched={displayNameTouched()}
                  onInput={updateDisplayName}
                />
              </CollapsibleSection>

              <CollapsibleSection
                title="Theme"
                badge={
                  <Show when={selectedTheme()}>
                    <span class="text-xs text-white/60 bg-white/10 px-2 py-1 rounded-full">
                      {themes.find(t => t.id === selectedTheme())?.name}
                    </span>
                  </Show>
                }
                expanded={expandedSection() === "theme"}
                onToggle={() => setExpandedSection(expandedSection() === "theme" ? null : "theme")}
              >
                <ThemeSelector
                  selectedTheme={selectedTheme()}
                  onSelect={setSelectedTheme}
                />
              </CollapsibleSection>

              <CollapsibleSection
                title="Looking For"
                badge={
                  <Show when={lookingForSelected().length > 0}>
                    <span class="text-xs text-white/60 bg-white/10 px-2 py-1 rounded-full">
                      {lookingForSelected().length} selected
                    </span>
                  </Show>
                }
                expanded={expandedSection() === "lookingFor"}
                onToggle={() => setExpandedSection(expandedSection() === "lookingFor" ? null : "lookingFor")}
              >
                <LookingForSelector
                  selectedOptions={lookingForSelected()}
                  onToggle={handleLookingForToggle}
                />
              </CollapsibleSection>


              <CollapsibleSection
                title="Special Badge"
                badge={
                  <Show when={showCustomBadgeValue() && badgeTextValue().trim()}>
                    <span class="text-xs text-white/60 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 px-2 py-1 rounded-full">
                      {badgeTextValue()}
                    </span>
                  </Show>
                }
                expanded={expandedSection() === "badge"}
                onToggle={() => setExpandedSection(expandedSection() === "badge" ? null : "badge")}
              >
                <BadgeEditor
                  badgeText={badgeTextValue()}
                  showCustomBadge={showCustomBadgeValue()}
                  onBadgeTextChange={(value) => updateCustomText("badgeText", value)}
                  onVisibilityToggle={() => toggleFeature("showCustomBadge")}
                />
              </CollapsibleSection>

              <CollapsibleSection
                title="Visibility"
                expanded={expandedSection() === "visibility"}
                onToggle={() => setExpandedSection(expandedSection() === "visibility" ? null : "visibility")}
              >
                <VisibilityToggles
                  showZodiac={showZodiacValue()}
                  showBirthdayCard={showBirthdayValue()}
                  showAge={showAgeValue()}
                  age={ageValue()}
                  zodiac={zodiac()}
                  birthdayInfo={birthdayInfo()}
                  onToggleZodiac={() => toggleFeature("showZodiac")}
                  onToggleBirthday={() => toggleFeature("showBirthdayCard")}
                  onToggleAge={() => toggleFeature("showAge")}
                  onAgeChange={(val) => setLocalChanges({ ...localChanges(), age: val })}
                />
              </CollapsibleSection>
            </div>
          )}
        </Show>

        <div class="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-black/80 backdrop-blur-lg border-t border-gray-200 dark:border-white/10 z-50">
          <div class="max-w-2xl mx-auto">
            <SaveButton
              saving={saving()}
              saved={saved()}
              disabled={!isDisplayNameValid() || !hasAtLeastOnePhoto() || (ageValue() !== null && ageValue() < 19)}
              onSave={() => handleSave(selectedTheme())}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
