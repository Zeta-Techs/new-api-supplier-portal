## ADDED Requirements

### Requirement: Bilingual UI With Default Chinese
The portal SHALL support Chinese and English UI text, defaulting to Chinese.

#### Scenario: First visit
- **WHEN** a user visits the portal for the first time
- **THEN** the UI is shown in Chinese by default

#### Scenario: User toggles language
- **WHEN** a user changes the language to English (or Chinese)
- **THEN** the UI updates immediately
- **AND** the selection is persisted for future visits

### Requirement: Bilingual Error Messages
The portal SHALL present user-facing errors in the selected language.

#### Scenario: Backend returns an error
- **WHEN** the portal receives an error response from the backend
- **THEN** the UI displays an error message in the current language
