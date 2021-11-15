import flatten from 'flat'

/**
 * List of the supported locales.
 * FIXME: generate this list from available yml files in the i18n folder instead
 * (even if we end up loading locale data using fetch).
 */
const locales = {
  en: {
    us: 'en-US'
  },
  fr: {
    fr: 'fr-FR'
  }
}

/**
 * Match the provided locale (language and region) to the list of supported locales.
 * Default to english if unsupported.
 */
function getMatchingLocaleString (locale = '', defaultLocale = 'en-US') {
  const [lang, region] = locale.toLowerCase().split('-')
  const language = locales[lang]
  if (!language) return defaultLocale
  const defaultRegion = Object.keys(language)[0]
  return language[region] || language[defaultRegion]
}

/*
 * Load the localized strings for all languages here,
 * merge with the provided customized strings from state.otp.config.language
 * (overrides can be defined per language or for all languages)
 * and flatten to a map of
 *   id => string.
 * FIXME: Load languages on demand using fetch.
 */
export async function loadLocaleData (locale, customMessages) {
  const matchedLocale = getMatchingLocaleString(locale)
  let messages
  switch (matchedLocale) {
    case 'fr-FR':
      messages = await import('../../i18n/fr-FR.yml')
      break
    default:
      messages = await import('../../i18n/en-US.yml')
      break
  }

  // Merge custom strings into the standard language strings.
  const mergedMessages = {
    ...flatten(messages),
    // Override the predefined strings with the custom ones, if any provided.
    ...flatten(customMessages['allLanguages'] || {}),
    ...flatten(customMessages[locale] || {})
  }

  return mergedMessages
}

/**
 * Gets the localization > defaultLocale configuration setting, or 'en-US' if not set.
 */
export function getDefaultLocale (config) {
  const { localization = {} } = config
  return localization.defaultLocale || 'en-US'
}

/**
 * Obtains the time format (12 or 24 hr) based on the redux user state.
 * FIXME: Remove after OTP-UI components can determine the time format on their own.
 */
export function getTimeFormat (state) {
  const use24HourFormat = state.user.loggedInUser?.use24HourFormat ?? false
  return use24HourFormat ? 'H:mm' : 'h:mm a'
}