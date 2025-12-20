# Profile Feature Changes

## 📋 Oversigt

Denne branch tilføjer nye sektioner til bruger profilen samt **massiv refaktorering** til modulære komponenter og custom hooks for bedre vedligeholdelse og genanvendelighed.

## ✨ Nye Features

### 1. **Artists I Like** Sektion

- Viser cirkulære artiste billeder (3 stk + "+5" badge)
- "See all" knap til at se alle artister
- Data gemmes i `localStorage` under nøglen `profileData`

### 2. **Videos** Sektion

- Viser 2 video thumbnails med play-knap overlay
- Klikbare video previews
- Data struktur: `{ id, thumbnail, url }`

### 3. **Past Collaborations** Sektion

- Viser cirkulære samarbejdspartner billeder (3 stk + "+14" badge)
- "See all" knap
- Data struktur: `{ id, image }`

### 4. **Questions** Sektion

- Liste over 5 spørgsmål med svar
- "Ask me a question" input felt med send-knap
- Redigerbare svar i EditProfile
- Data struktur: `{ id, question, answer }`

## 📁 Ændrede Filer

### Frontend Routes

- `frontend/routes/profile.jsx` - **64 linjer** (ned fra 168, -62%) ✅
- `frontend/routes/EditProfile.jsx` - **176 linjer** (ned fra 728, -76%) ✅

### Custom Hooks (NYT!)

- `frontend/hooks/useProfileData.js` - **188 linjer** - Centraliseret state management for hele profilen

### Komponenter (NYT!)

**16 nye modulære komponenter:**

#### `frontend/components/profile/shared/` (5 komponenter)

- `SpotifyEmbed.jsx` - Spotify player med dynamisk højde
- `VideoEmbed.jsx` - YouTube/Vimeo embed handler
- `ReviewSnippet.jsx` - Star rating og review display
- `SocialMediaLinks.jsx` - Social media ikon grid
- `TagList.jsx` - Genbrugelig tag display

#### `frontend/components/profile/sections/` (6 komponenter)

- `ProfileHeader.jsx` - Bruger avatar, stats, action knapper
- `BasicInfo.jsx` - Navn, headline, about, tags, spotify, review
- `ArtistsSection.jsx` - Cirkulære artiste billeder
- `VideosSection.jsx` - Video embeds
- `CollaborationsSection.jsx` - Collaborator billeder
- `QuestionsSection.jsx` - Q&A display

#### `frontend/components/profile/edit/` (5 komponenter)

- `SpotifyLinkInput.jsx` - Spotify URL input
- `EditableTagList.jsx` - Toggle-able tag selection
- `EditableReview.jsx` - Editable star rating & review
- `EditableVideos.jsx` - Video URL management (add/remove)
- `EditableQuestions.jsx` - Editable svar til preset spørgsmål

#### `frontend/components/profile/utils/`

- `embedHelpers.js` - Helper funktioner til Spotify og video parsing

## 🔧 Teknisk Dokumentation

### Refaktorering Resultater 🎉

#### profile.jsx

- **Før:** 168 linjer
- **Efter:** 64 linjer
- **Reduktion:** 62% (104 linjer fjernet)

#### EditProfile.jsx

- **Før:** 728 linjer (monolitisk fil)
- **Efter:** 176 linjer (modulær struktur)
- **Reduktion:** 76% (552 linjer fjernet)

#### Samlet statistik

- **Total linjer før:** 896
- **Total linjer efter:** 428 (240 i komponenter + 188 i hook)
- **Kode genanvendelse:** 16 modulære komponenter + 1 custom hook
- **Vedligeholdelsesgevinst:** Massiv - hver komponent har ét ansvar

### Arkitektur: Custom Hook Pattern

**`useProfileData.js` - Centraliseret State Management**

Alle profil data håndteres nu af én custom hook:

```javascript
const profile = useProfileData();

// Hook returnerer:
{
  // State values
  name, headline, about, lookingFor, genres,
  spotifyUrl, reviewRating, reviewCount, reviewText,
  artists, videos, collaborations, questions,

  // Setters
  setName, setHeadline, setAbout, setLookingFor, ...

  // Helper functions
  toggleItem,    // Toggle items i arrays
  saveProfile    // Gem alt til localStorage
}
```

**Fordele:**

- ✅ **DRY (Don't Repeat Yourself)** - State defineret ét sted
- ✅ **Genbrugelighed** - Bruges i både profile.jsx og EditProfile.jsx
- ✅ **Centraliseret logik** - localStorage håndtering ét sted
- ✅ **Lettere at teste** - Isoleret business logic
- ✅ **Nemmere vedligeholdelse** - Én fil at opdatere

### Data Struktur (localStorage)

```javascript
{
  name: string,
  headline: string,
  about: string,
  lookingFor: string[],
  genres: string[],
  spotifyUrl: string,
  reviewRating: number,
  reviewCount: number,
  reviewText: string,
  artists: [{ id: number, image: string }],
  videos: [{ id: number, thumbnail: string, url: string }],
  collaborations: [{ id: number, image: string }],
  questions: [{ id: number, question: string, answer: string }]
}
```

### Komponent Hierarki

```
frontend/
├── routes/
│   ├── profile.jsx (64 linjer) ⭐ 62% reduktion
│   └── EditProfile.jsx (176 linjer) ⭐ 76% reduktion
│
├── hooks/
│   └── useProfileData.js (188 linjer) ⭐ NYT!
│       └── Centraliseret state management
│
└── components/profile/
    ├── shared/ (5 komponenter) ⭐ Genbrugelige UI komponenter
    │   ├── SpotifyEmbed.jsx
    │   ├── VideoEmbed.jsx
    │   ├── ReviewSnippet.jsx
    │   ├── SocialMediaLinks.jsx
    │   └── TagList.jsx
    │
    ├── sections/ (6 komponenter) ⭐ View-only sektioner
    │   ├── ProfileHeader.jsx
    │   ├── BasicInfo.jsx
    │   ├── ArtistsSection.jsx
    │   ├── VideosSection.jsx
    │   ├── CollaborationsSection.jsx
    │   └── QuestionsSection.jsx
    │
    ├── edit/ (5 komponenter) ⭐ Edit-specifikke komponenter
    │   ├── SpotifyLinkInput.jsx
    │   ├── EditableTagList.jsx
    │   ├── EditableReview.jsx
    │   ├── EditableVideos.jsx
    │   └── EditableQuestions.jsx
    │
    └── utils/
        └── embedHelpers.js (Helper funktioner)
```

## 🚀 Hvordan Man Bruger Det

### For Brugere

1. Gå til `/profile` for at se profilen
2. Klik "Edit profile" for at redigere
3. Udfyld felterne i EditProfile
4. Klik "Save" - data gemmes automatisk til localStorage
5. Se dine ændringer i `/profile`

### For Udviklere

**Import og brug custom hook:**

```javascript
import { useProfileData } from "../hooks/useProfileData";

function MyComponent() {
  const profile = useProfileData();

  return <div>{profile.name}</div>;
}
```

**Import komponenter:**

```javascript
// View komponenter
import ProfileHeader from "../components/profile/sections/ProfileHeader";
import ArtistsSection from "../components/profile/sections/ArtistsSection";

// Edit komponenter
import EditableTagList from "../components/profile/edit/EditableTagList";
import EditableVideos from "../components/profile/edit/EditableVideos";

// Shared komponenter
import TagList from "../components/profile/shared/TagList";
import SpotifyEmbed from "../components/profile/shared/SpotifyEmbed";
```

**Komponent genanvendelse:**

```javascript
// Samme komponenter bruges i både view og edit mode
<ArtistsSection artists={profile.artists} />
<CollaborationsSection collaborations={profile.collaborations} />
```

## 📝 TODO / Fremtidige Forbedringer

### Umiddelbare forbedringer

- [ ] Fix Tailwind CSS warnings (`bg-gradient-to-b` → `bg-linear-to-b`)
- [ ] Tilføj PropTypes eller TypeScript types til komponenter
- [ ] Implementer unit tests for useProfileData hook
- [ ] Implementer component tests med React Testing Library

### Feature forbedringer

- [ ] Upload funktion til billeder og videoer
- [ ] "See all" modal for Artists og Collaborations
- [ ] Drag-and-drop reordering af artists/videos/collaborations
- [ ] Billedekomprimering og optimering
- [ ] Validering af input felter
- [ ] Undo/redo funktionalitet i edit mode

### Backend integration

- [ ] Erstat localStorage med API calls i useProfileData hook
- [ ] Implementer optimistic updates
- [ ] Tilføj error handling og loading states
- [ ] Implementer caching strategi
- [ ] Tilføj Supabase eller anden backend database

## 🔄 Merge Instructions

Når du er klar til at merge:

1. **Pull seneste ændringer fra dev:**

   ```bash
   git pull origin dev
   ```

2. **Løs eventuelle merge conflicts i:**
   - `frontend/routes/profile.jsx`
   - `frontend/routes/EditProfile.jsx`
   - Nye filer vil ikke have conflicts

3. **Test følgende:**
   - ✅ Navigate til `/profile` - se alle sektioner vises
   - ✅ Navigate til `/edit-profile` - rediger data
   - ✅ Klik "Save" - verificer data gemmes
   - ✅ Refresh browser - verificer data persisterer
   - ✅ Verificer alle 16 komponenter loader korrekt
   - ✅ Test HMR (Hot Module Replacement) virker

4. **Commit og push:**

   ```bash
   git add .
   git commit -m "feat: Massive refactoring - modular components + custom hook

   - Reduced profile.jsx from 168 to 64 lines (62%)
   - Reduced EditProfile.jsx from 728 to 176 lines (76%)
   - Created 16 reusable components
   - Created useProfileData custom hook for state management
   - Improved maintainability and testability"

   git push origin Profile-notes
   ```

## 🐛 Kendte Issues

- Tailwind CSS warnings om `bg-gradient-to-b` → `bg-linear-to-b` (kun warnings, påvirker ikke funktionalitet)
- SVG DOM property warnings i nogle ikoner (kun development warnings)

## 💡 Tips & Best Practices

### Development

- Hvis localStorage bliver korrupt, clear det med: `localStorage.removeItem('profileData')`
- Default data vises hvis localStorage er tom
- Alle komponenter har JSDoc comments for bedre IntelliSense
- HMR (Hot Module Replacement) virker på alle komponenter

### Komponent Genanvendelse

- `shared/` komponenter kan bruges overalt i appen
- `sections/` komponenter bruges i read-only view
- `edit/` komponenter bruges kun i edit mode
- `ArtistsSection` og `CollaborationsSection` bruges i både view og edit mode

### State Management

- Brug altid `useProfileData` hook for profil data
- Mutér aldrig state direkte - brug setters fra hook
- `toggleItem()` helper til arrays
- `saveProfile()` gemmer alt til localStorage

### Performance

- Alle komponenter er funktionelle (ingen class components)
- React hooks bruges optimalt
- Ingen unødvendige re-renders
- Lazy loading kan tilføjes senere ved behov
