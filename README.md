# Leadow CRM

Prosta aplikacja CRM do zarządzania leadami dla jednoosobowej działalności zajmującej się
tworzeniem stron internetowych dla lokalnych firm. Instalowalna jako PWA (Windows, Android,
iPhone), z danymi w Supabase — synchronizują się między urządzeniami po zalogowaniu.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- shadcn/ui (styl `base-nova`, oparty o [Base UI](https://base-ui.com))
- lucide-react (ikony)
- react-router-dom (routing)
- react-hook-form + zod (formularze i walidacja)
- **Supabase** (Postgres + Auth + Row Level Security) — główne źródło danych
- **vite-plugin-pwa** (manifest, service worker, instalowalność, offline dla powłoki aplikacji)
- **Cloudflare Workers** (Static Assets + Worker) — hosting appki i serwerowy endpoint importu z Google Maps
- Dexie (IndexedDB) — tylko jako źródło jednorazowej migracji danych sprzed wprowadzenia Supabase

## Szybki start (lokalnie)

```bash
npm install
cp .env.example .env
```

Uzupełnij w `.env` przynajmniej `VITE_SUPABASE_URL` i `VITE_SUPABASE_ANON_KEY` (patrz sekcja
„Konfiguracja Supabase” niżej), następnie:

```bash
npm run dev
```

Aplikacja wystartuje pod adresem podanym w konsoli (domyślnie `http://localhost:5173`). Bez
skonfigurowanego Supabase ekran logowania pokaże czytelny komunikat zamiast się wywalać.

Import z Google Maps w `npm run dev` **nie zadziała** — ten endpoint obsługuje Cloudflare Worker
(`worker/index.ts`), a nie Vite. Do pełnego testu lokalnego (razem z importem z Google Maps) użyj:

```bash
npm run build
cp .dev.vars.example .dev.vars   # wklej GOOGLE_PLACES_API_KEY
npm run dev:cf
```

`npm run dev:cf` uruchamia `wrangler dev`, czyli lokalny odpowiednik produkcyjnego Workera —
serwuje zbudowaną appkę z `dist/` i obsługuje `/api/places/lookup` dokładnie tak jak na produkcji.
Po każdej zmianie w `src/` trzeba przebudować (`npm run build`) — to nie ma hot-reloadu jak
`npm run dev`.

## Konfiguracja Supabase

### 1. Utwórz projekt

Załóż projekt na [supabase.com](https://supabase.com) (darmowy plan wystarcza).

### 2. Wykonaj SQL

W Supabase Studio: **SQL Editor -> New query**, wklej całą zawartość [`supabase/schema.sql`](supabase/schema.sql) i uruchom. Tworzy to:

- tabele `leads`, `tasks`, `activities` (każda z `user_id` wskazującym na `auth.users`),
- indeksy przyspieszające zapytania,
- trigger automatycznie odświeżający `updated_at`,
- **Row Level Security** — każdy użytkownik widzi i modyfikuje wyłącznie własne rekordy
  (`auth.uid() = user_id`), wymuszone na poziomie bazy, niezależnie od kodu frontendu.

Skrypt jest bezpieczny do wielokrotnego uruchomienia.

### 3. Utwórz swoje konto (jeden właściciel)

Aplikacja ma tylko ekran logowania, bez publicznej rejestracji — to celowe, dla bezpieczeństwa
CRM wystawionego publicznie w internecie. Załóż swoje konto ręcznie: **Authentication -> Users ->
Add user**, wpisz e-mail i hasło. Tym logujesz się w aplikacji.

### 4. Klucze API

**Project Settings -> API**:

- `Project URL` -> `VITE_SUPABASE_URL`
- klucz `anon` / `public` -> `VITE_SUPABASE_ANON_KEY`

**Nigdy** nie używaj klucza `service_role` w tej aplikacji — nie jest i nie powinien być
potrzebny na froncie; dostęp do danych chroni wyłącznie RLS + klucz `anon`.

## Konfiguracja Google Places (import z Google Maps)

Endpoint `/api/places/lookup` obsługuje Cloudflare Worker ([`worker/index.ts`](worker/index.ts),
logika w [`server/googlePlaces.ts`](server/googlePlaces.ts)) — klucz Google nigdy nie trafia do
kodu React ani do zmiennych `VITE_*`.

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) -> utwórz projekt,
   włącz płatne rozliczenia (Places API nie jest w pełni darmowe), włącz „Places API”.
2. Utwórz klucz API.
3. Ustaw go jako sekret:
   - **lokalnie**: plik `.dev.vars` (skopiuj `.dev.vars.example`), używany przez `npm run dev:cf`,
   - **produkcyjnie**: Cloudflare dashboard -> Twój Worker/projekt -> **Settings -> Variables and
     Secrets -> Add -> Secret** -> nazwa `GOOGLE_PLACES_API_KEY`.

Żeby całkowicie ukryć funkcję importu z Google Maps (np. nie chcesz płacić za Places API), ustaw
`VITE_ENABLE_GOOGLE_IMPORT=false` w `.env` — przycisk i strona importu znikają, ręczne dodawanie
leadów działa bez zmian.

## Wdrożenie na Cloudflare

Cloudflare łączy dziś Pages i Workers w jeden produkt — ten projekt wdraża się jako **Worker ze
statycznymi zasobami** (Static Assets), nie jako klasyczny Pages. Worker serwuje zbudowaną appkę
z `dist/` i dodatkowo obsługuje `/api/places/lookup`; routing SPA (odświeżanie podstron typu
`/leady/123`) załatwia `not_found_handling = "single-page-application"` w `wrangler.toml`.

1. Wypchnij repozytorium na GitHub/GitLab.
2. W Cloudflare: **Workers & Pages -> Create -> Pages -> Connect to Git**, wybierz repozytorium.
3. Ustawienia builda:
   - **Build command**: `npm run build`
   - **Deploy command**: `npx wrangler deploy`
4. Zmienne środowiskowe (**Settings -> Variables and Secrets**, lub przed pierwszym deployem w
   formularzu tworzenia projektu):
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — zwykłe zmienne, potrzebne w kroku *build*
     (Vite wbudowuje je w kod)
   - `GOOGLE_PLACES_API_KEY` jako **Secret** — potrzebny w kroku *deploy*/runtime Workera
     (opcjonalnie `VITE_ENABLE_GOOGLE_IMPORT=false`, jeśli wolisz całkiem wyłączyć import)
5. Deploy.

`wrangler.toml` (`name`, `main`, `[assets]`) definiuje Workera — nazwa projektu w Cloudflare musi
się z nim zgadzać (`name = "apps-leadow"` w tym repo). Lokalnie to samo robi `npm run deploy`
(`wrangler deploy`).

## Instalacja jako aplikacja (PWA)

Po otwarciu wdrożonej wersji (musi być pod `https://`, wymóg PWA):

**Windows / Desktop (Chrome, Edge)** — w Sidebar pojawi się przycisk „Zainstaluj aplikację”, gdy
przeglądarka to umożliwia; alternatywnie ikona instalacji w pasku adresu.

**Android (Chrome)** — menu (⋮) -> „Zainstaluj aplikację” / „Dodaj do ekranu głównego”, albo
przycisk „Zainstaluj aplikację” w Sidebar.

**iPhone (Safari)** — Safari nie wspiera `beforeinstallprompt`, instalacja jest ręczna: przycisk
Udostępnij (kwadrat ze strzałką) -> **Dodaj do ekranu początkowego**. Aplikacja ma skonfigurowane
meta tagi (`apple-mobile-web-app-capable`, `apple-touch-icon`) więc po dodaniu otwiera się jako
pełnoekranowa aplikacja, bez paska Safari.

Po instalacji aplikacja działa offline na poziomie powłoki (interfejs ładuje się bez sieci dzięki
service workerowi) — operacje na danych nadal wymagają połączenia z Supabase. Nowa wersja
aplikacji pokazuje komunikat „Dostępna jest nowa wersja” z przyciskiem odświeżenia.

## Migracja danych sprzed wprowadzenia Supabase

Jeśli używałeś wcześniejszej wersji aplikacji (dane w IndexedDB, bez logowania), po zalogowaniu w
widoku **Dane** pojawi się karta „Migracja danych lokalnych do Supabase” z wykrytą liczbą leadów i
zadań. Kliknięcie:

1. pobiera automatyczną kopię zapasową JSON (na wszelki wypadek),
2. wgrywa te dane do Twojego konta Supabase.

Dane lokalne **nie są** usuwane automatycznie — osobny przycisk „Wyczyść dane lokalne” (z
potwierdzeniem) pojawia się dopiero po udanej migracji, żebyś mógł się upewnić, że wszystko
przeszło poprawnie, zanim skasujesz kopię w przeglądarce.

## Build produkcyjny (lokalnie)

```bash
npm run build
npm run preview
```

## Struktura projektu

```
worker/
  index.ts                    – Cloudflare Worker: serwuje dist/ (Static Assets) + POST /api/places/lookup
server/
  googlePlaces.ts             – czysta logika: rozpoznawanie linku Maps, wywołania Places API, normalizacja (używana przez worker/)
supabase/
  schema.sql                  – tabele, indeksy, RLS — do wklejenia w Supabase SQL Editor
src/
  types/
    lead.ts                  – model Lead, statusy, priorytety, kategorie
    task.ts                   – model Task (osobna encja, dowolna liczba zadań per lead), TaskType, TaskStatus
    activity.ts                – model Activity (log historii, osobna tabela)
    googlePlaces.ts             – kształt danych zwracanych przez /api/places/lookup
  lib/
    supabaseClient.ts          – klient Supabase (z .env), requireUserId()
    caseConvert.ts              – konwersja camelCase <-> snake_case (kolumny Postgresa)
    features.ts                  – flaga VITE_ENABLE_GOOGLE_IMPORT
    dates.ts                      – formatowanie i porównywanie dat (date-fns, pl)
    taskViews.ts                   – czyste funkcje filtrujące widoki zadań (Dzisiaj/Zaległe/…)
    validation.ts                   – schematy walidacji (zod), w tym logowanie i pełny import danych
    importExport.ts                  – eksport/import JSON (leady+zadania+aktywności+wersja) i CSV
    googlePlaces.ts                   – klient wywołujący /api/places/lookup
  data/
    db.ts                      – Dexie (IndexedDB) — tylko jako źródło migracji do Supabase
    repositories/                – LeadRepository, TaskRepository, ActivityRepository (zapytania do Supabase, odseparowane od UI)
    automationService.ts          – logika szybkich akcji i jednoklikowych zadań (status + historia + zadania)
    dataService.ts                 – operacje na całym zbiorze danych w Supabase (eksport, import, dane demo, wyczyść wszystko)
    migrateToSupabase.ts             – migracja z lokalnego IndexedDB do Supabase (z automatycznym backupem JSON)
    migration.ts                      – starsza, jednorazowa migracja z localStorage do IndexedDB
    config.ts                          – kolory/etykiety statusów/priorytetów, mapowanie kategorii Google, QUICK_ACTIONS
    demoData.ts                         – generator przykładowych leadów + zadań + aktywności
  hooks/
    useAuth.tsx                – sesja Supabase, logowanie/wylogowanie
    useLeads.tsx                 – Context + CRUD na leadach (fetch + odśwież po mutacji)
    useTasks.tsx                   – Context + CRUD na zadaniach
    useActivities.tsx                – historia aktywności dla danego leada
  components/
    ui/                        – komponenty shadcn/ui
    layout/                      – Sidebar, AppShell, ThemeToggle
    auth/                          – RequireAuth (ochrona tras)
    pwa/                             – UpdatePrompt, InstallButton
    leads/                            – StatusBadge, PriorityBadge, LeadForm, GoogleImportForm, QuickActionsPanel, LeadActionsMenu, ContactHistoryList
    tasks/                              – TaskRow, TaskFormDialog
    dashboard/                            – StatCard
  pages/                        – LoginPage, DashboardPage, LeadsListPage, LeadFormPage, LeadDetailsPage, GoogleImportPage, TasksPage, DataPage
```

## Funkcje

- **Logowanie** – e-mail i hasło (Supabase Auth), jeden właściciel, bez publicznej rejestracji.
- **Dashboard** – liczba leadów, zaległe i dzisiejsze zadania na górze (z szybkim oznaczaniem jako wykonane), leady bez aktywnego zadania, oczekujące na odpowiedź, zainteresowani, wysłane oferty, pozyskani klienci, ostatnio dodane leady.
- **Wszystkie leady** – tabela z wyszukiwarką, filtrami (status, branża, miasto, priorytet), sortowaniem po terminie najbliższego aktywnego zadania, zakładkami Aktywne/Zarchiwizowane.
- **Zadania** – osobny moduł z widokami Dzisiaj / Zaległe / Najbliższe 7 dni / Bez terminu / Wykonane / Wszystkie. Każde zadanie: oznaczenie jako wykonane, otwarcie powiązanego leada, szybka zmiana terminu, przeniesienie na jutro, edycja, usunięcie. Zadanie może, ale nie musi być powiązane z leadem.
- **Formularz leada** – dodawanie i edycja z pełną walidacją.
- **Importuj firmę z Google Maps** – wklejasz link do wizytówki, aplikacja pobiera nazwę, adres, telefon, stronę, ocenę, liczbę opinii, godziny otwarcia i kategorię, pokazuje formularz podglądu do poprawy przed zapisem (razem z pierwszym zadaniem) i wykrywa duplikaty po Place ID. Można całkowicie wyłączyć flagą `VITE_ENABLE_GOOGLE_IMPORT=false`.
- **Szczegóły leada** – dane kontaktowe z klikalnymi linkami, dane z Google Maps (gdy lead pochodzi z importu), szybkie akcje (10 przycisków zmieniających status, zamykających bieżące zadania i tworzących kolejne wg reguł follow-upu), lista zadań leada z jednoklikowym tworzeniem (Analiza/Demo/Wiadomość/E-mail/Telefon/Inne), notatki, historia aktywności.
- **Dane** – eksport do JSON (leady + zadania + aktywności + wersja schematu, walidowane Zodem przy imporcie) i CSV (leady), import z JSON, ładowanie danych demo, usuwanie wszystkich danych, migracja danych lokalnych do Supabase — wszystko z potwierdzeniem przed nieodwracalnymi operacjami.
- **PWA** – instalowalna na Windows/Android/iPhone, offline dla powłoki interfejsu, komunikat o aktualizacji.
- Jasny/ciemny/systemowy motyw, w pełni responsywny interfejs (desktop i telefon).

## Uwagi

- Dane synchronizują się między urządzeniami przez Supabase — wystarczy zalogować się tym samym
  kontem. Odświeżenie strony zawsze pobiera aktualny stan z serwera.
- Import z JSON **zastępuje** całą bazę (leady, zadania, aktywności) — nie scala z istniejącymi danymi.
- Usunięcie leada kasuje też wszystkie powiązane z nim zadania i wpisy historii (klucze obce z `ON DELETE CASCADE` w `supabase/schema.sql`).
- Regularnie rób eksport do JSON jako niezależną kopię zapasową (widok **Dane**).
