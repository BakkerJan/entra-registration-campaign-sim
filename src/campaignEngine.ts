export type CampaignState = 'disabled' | 'enabled' | 'managed'
export type TargetMethod = 'authenticator' | 'passkey'
export type Os = 'windows' | 'macos' | 'ios' | 'android' | 'linux'
export type BrowserFamily = 'chrome' | 'other'
export type PasskeyProfile =
  | 'unrestricted'
  | 'syncedOnly'
  | 'deviceBoundOnly'
  | 'aaguidRestricted'
  | 'attestationEnforced'
export type LocalPasskeyType =
  | 'windowsHello'
  | 'microsoftEntraWindows'
  | 'googlePasswordManager'
  | 'icloudKeychain'
  | 'macosPlatformSSO'
  | 'samsungPass'
  | 'authenticatorPasskey'
  | 'crossPlatformSecurityKey'
export type SupportedAaguidProvider =
  | 'icloudKeychain'
  | 'googlePasswordManager'
  | 'microsoftAuthenticatorPasskey'
  | 'microsoftEntraPasskeyWindows'
export type SignInMfaMethod =
  | 'none'
  | 'sms'
  | 'voiceCall'
  | 'certificateBasedAuthentication'
  | 'microsoftAuthenticatorPush'
  | 'microsoftAuthenticatorCode'
  | 'passkeyOrFido2SecurityKey'
  | 'windowsHelloForBusiness'
  | 'platformSSO'
  | 'softwareOath'
  | 'hardwareOath'
  | 'temporaryAccessPass'
  | 'thirdPartyAuthenticator'

export interface Scenario {
  campaignState: CampaignState
  targetMethod: TargetMethod
  passkeySelfServiceSetup: boolean
  passkeyProfile: PasskeyProfile
  aaguidProviders: SupportedAaguidProvider[]
  os: Os
  browserFamily: BrowserFamily
  signInMfaMethod: SignInMfaMethod
  selectedLocalPasskeys: LocalPasskeyType[]
  ssoSessionActive: boolean
  registerSecurityInfoBlocked: boolean
  termsOfUseVisible: boolean
  customControlsVisible: boolean
  sameSessionAsMethodRegistration: boolean
}

export interface Evaluation {
  nudged: boolean
  headline: string
  summary: string
  primaryReason: string
  scenarioClass: string
  decisionSource: string
  trace: string[]
  notes: string[]
}

export const campaignStateOptions = [
  { value: 'disabled', label: 'Disabled' },
  { value: 'enabled', label: 'Enabled' },
  { value: 'managed', label: 'Microsoft managed' },
] as const

export const methodOptions = [
  { value: 'authenticator', label: 'Microsoft Authenticator' },
  { value: 'passkey', label: 'Passkey (FIDO2)' },
] as const

export const osOptions = [
  { value: 'windows', label: 'Windows' },
  { value: 'macos', label: 'macOS' },
  { value: 'ios', label: 'iOS' },
  { value: 'android', label: 'Android' },
  { value: 'linux', label: 'Linux' },
] as const

export const browserFamilyOptions = [
  {
    value: 'chrome',
    label: 'Chrome / Chromium',
    examples: 'Windows + Chrome, macOS + Chrome',
  },
  {
    value: 'other',
    label: 'Other browsers',
    examples: 'Windows + other browsers, macOS + other browsers',
  },
] as const

export const signInMfaOptions = [
  { value: 'none', label: 'No MFA' },
  { value: 'sms', label: 'SMS' },
  { value: 'voiceCall', label: 'Voice call' },
  { value: 'certificateBasedAuthentication', label: 'Certificate Based Authentication (CBA)' },
  { value: 'microsoftAuthenticatorPush', label: 'Microsoft Authenticator push notification' },
  { value: 'microsoftAuthenticatorCode', label: 'Microsoft Authenticator code' },
  { value: 'passkeyOrFido2SecurityKey', label: 'Passkey / FIDO2 security key' },
  { value: 'windowsHelloForBusiness', label: 'Windows Hello for Business' },
  { value: 'platformSSO', label: 'Platform SSO' },
  { value: 'softwareOath', label: 'Software OATH token' },
  { value: 'hardwareOath', label: 'Hardware OATH token' },
  { value: 'temporaryAccessPass', label: 'Temporary Access Pass' },
  { value: 'thirdPartyAuthenticator', label: 'Third-party authenticator' },
] as const

export const passkeyProfileOptions = [
  { value: 'unrestricted', label: 'Unrestricted' },
  { value: 'syncedOnly', label: 'Synced-only' },
  { value: 'deviceBoundOnly', label: 'Device-bound-only' },
  { value: 'aaguidRestricted', label: 'AAGUID-restricted' },
  { value: 'attestationEnforced', label: 'Device-bound with attestation enforced' },
] as const

export const localPasskeyOptions = [
  { value: 'windowsHello', label: 'Windows Hello for Business' },
  { value: 'microsoftEntraWindows', label: 'Entra passkey on Windows' },
  { value: 'googlePasswordManager', label: 'Google Password Manager' },
  { value: 'icloudKeychain', label: 'iCloud Keychain' },
  { value: 'macosPlatformSSO', label: 'macOS Platform SSO' },
  { value: 'samsungPass', label: 'Samsung Pass' },
  { value: 'authenticatorPasskey', label: 'Passkey in Microsoft Authenticator' },
  { value: 'crossPlatformSecurityKey', label: 'Cross-platform security key' },
] as const

export const supportedProviderOptions = [
  {
    value: 'icloudKeychain',
    label: 'iCloud Keychain',
  },
  {
    value: 'googlePasswordManager',
    label: 'Google Password Manager',
  },
  {
    value: 'microsoftAuthenticatorPasskey',
    label: 'Microsoft Authenticator passkey',
  },
  {
    value: 'microsoftEntraPasskeyWindows',
    label: 'Microsoft Entra passkey on Windows',
  },
] as const

function platformKey(scenario: Scenario) {
  if (scenario.os === 'linux') {
    return 'linux'
  }

  if (scenario.os === 'ios') {
    return 'ios'
  }

  if (scenario.os === 'android') {
    return 'android'
  }

  return `${scenario.os}-${scenario.browserFamily}` as
    | 'windows-chrome'
    | 'windows-other'
    | 'macos-chrome'
    | 'macos-other'
}

function hasPasskeyForPlatform(scenario: Scenario) {
  if (scenario.os === 'linux') {
    return false
  }

  const currentPlatform = platformKey(scenario)

  return scenario.selectedLocalPasskeys.some((type) => {
    switch (type) {
      case 'crossPlatformSecurityKey':
        return true
      case 'windowsHello':
      case 'microsoftEntraWindows':
        return currentPlatform === 'windows-chrome' || currentPlatform === 'windows-other'
      case 'googlePasswordManager':
        return (
          currentPlatform === 'windows-chrome' ||
          currentPlatform === 'macos-chrome' ||
          currentPlatform === 'android'
        )
      case 'icloudKeychain':
        return (
          currentPlatform === 'macos-chrome' ||
          currentPlatform === 'macos-other' ||
          currentPlatform === 'ios'
        )
      case 'macosPlatformSSO':
        return currentPlatform === 'macos-chrome' || currentPlatform === 'macos-other'
      case 'samsungPass':
        return currentPlatform === 'android'
      case 'authenticatorPasskey':
        return currentPlatform === 'ios' || currentPlatform === 'android'
      default:
        return false
    }
  })
}

function providerForLocalPasskey(type: LocalPasskeyType): SupportedAaguidProvider | null {
  switch (type) {
    case 'googlePasswordManager':
      return 'googlePasswordManager'
    case 'icloudKeychain':
      return 'icloudKeychain'
    case 'authenticatorPasskey':
      return 'microsoftAuthenticatorPasskey'
    case 'microsoftEntraWindows':
      return 'microsoftEntraPasskeyWindows'
    default:
      return null
  }
}

function hasAllowedProviderPasskey(scenario: Scenario) {
  return scenario.selectedLocalPasskeys.some((type) => {
    const provider = providerForLocalPasskey(type)
    return provider !== null && scenario.aaguidProviders.includes(provider)
  })
}

function isSupportedProvider(value: SupportedAaguidProvider) {
  return supportedProviderOptions.some((option) => option.value === value)
}

function passkeyProfileEligible(scenario: Scenario) {
  switch (scenario.passkeyProfile) {
    case 'unrestricted':
    case 'syncedOnly':
    case 'deviceBoundOnly':
    case 'attestationEnforced':
      return true
    case 'aaguidRestricted':
      return scenario.aaguidProviders.some(isSupportedProvider)
    default:
      return false
  }
}

function isAnyMfa(method: SignInMfaMethod) {
  return method !== 'none'
}

function isSmsOrVoice(method: SignInMfaMethod) {
  return method === 'sms' || method === 'voiceCall'
}

export function evaluateScenario(scenario: Scenario): Evaluation {
  const trace: string[] = []
  const notes: string[] = []
  const blockers: string[] = []

  trace.push(`Campaign state: ${scenario.campaignState}`)
  trace.push(`Targeted method: ${scenario.targetMethod}`)

  if (scenario.campaignState === 'disabled') {
    blockers.push('The registration campaign is disabled.')
  } else {
    if (scenario.registerSecurityInfoBlocked) {
      blockers.push('Conditional Access blocks the Register security information page.')
    }

    if (scenario.termsOfUseVisible) {
      blockers.push('A terms-of-use screen is present during sign-in.')
    }

    if (scenario.customControlsVisible) {
      blockers.push('Conditional Access custom controls redirect the sign-in.')
    }

    if (scenario.ssoSessionActive) {
      blockers.push('The user is already signed in with SSO.')
    }

    if (scenario.sameSessionAsMethodRegistration) {
      blockers.push('This is the same session where another authentication method was just registered.')
    }

    if (scenario.targetMethod === 'authenticator') {
      trace.push('Authenticator path selected.')

      if (!isAnyMfa(scenario.signInMfaMethod)) {
        blockers.push('Authenticator campaigns only evaluate after an MFA sign-in.')
      } else if (scenario.campaignState === 'managed' && !isSmsOrVoice(scenario.signInMfaMethod)) {
        blockers.push('Microsoft managed Authenticator campaigns prompt only after SMS or voice call MFA.')
      }
    }

    if (scenario.targetMethod === 'passkey') {
      trace.push('Passkey path selected.')

      if (!isAnyMfa(scenario.signInMfaMethod)) {
        blockers.push('Passkey campaigns only evaluate after an MFA sign-in.')
      }

      if (!scenario.passkeySelfServiceSetup) {
        blockers.push('Passkey self-service setup is not allowed by policy.')
      }

      if (scenario.campaignState === 'managed' && !passkeyProfileEligible(scenario)) {
        blockers.push('The selected passkey profile is not eligible for Microsoft managed targeting.')
      }

      if (scenario.os === 'linux') {
        blockers.push('Linux users are not nudged by passkey registration campaigns.')
      }

      if (scenario.passkeyProfile === 'aaguidRestricted') {
        if (hasAllowedProviderPasskey(scenario)) {
          blockers.push('An allow-listed local passkey already exists for the current snapshot.')
        }
      } else if (hasPasskeyForPlatform(scenario)) {
        blockers.push(
          `A qualifying local passkey already exists for the current ${scenario.os} / ${scenario.browserFamily} combination.`,
        )
      }

      if (scenario.passkeyProfile === 'aaguidRestricted') {
        notes.push(
          'For AAGUID-restricted profiles, the allow list must match a selected local passkey provider: iCloud Keychain, Google Password Manager, Microsoft Authenticator passkey, or Microsoft Entra passkey on Windows.',
        )
        notes.push('Exclude and Block lists are ignored for the eligibility check.')
      }
    }
  }

  if (scenario.targetMethod === 'passkey' && scenario.campaignState !== 'disabled') {
    if (scenario.passkeyProfile === 'aaguidRestricted') {
      trace.push(
        hasAllowedProviderPasskey(scenario)
          ? 'AAGUID allow list matches at least one selected local passkey provider.'
          : 'AAGUID allow list does not match any selected local passkey provider.',
      )
    }

    trace.push(
      scenario.passkeyProfile === 'aaguidRestricted'
        ? hasAllowedProviderPasskey(scenario)
          ? 'An allow-listed passkey is present for the current snapshot.'
          : 'No allow-listed passkey is present for the current snapshot.'
        : hasPasskeyForPlatform(scenario)
          ? `Current platform has a qualifying local passkey: ${scenario.os} / ${scenario.browserFamily}.`
          : `No qualifying local passkey suppresses the current ${scenario.os} / ${scenario.browserFamily} combination.`,
    )
  }

  if (scenario.targetMethod === 'authenticator' && scenario.campaignState !== 'disabled') {
    trace.push(
      isSmsOrVoice(scenario.signInMfaMethod)
        ? 'The current MFA method is SMS or voice call.'
        : `The current MFA method is ${scenario.signInMfaMethod}.`,
    )
  }

  const nudged = blockers.length === 0

  if (nudged) {
    trace.push('No blocking condition remains, so the nudge is shown now.')
  } else {
    trace.push(`Blocking condition(s) found: ${blockers[0]}`)
  }

  const primaryReason = blockers[0] ?? 'All configured checks passed.'

  return {
    nudged,
    headline: nudged ? 'Yes, nudged now' : 'No, not nudged',
    summary: nudged
      ? 'The selected settings allow the registration campaign prompt to appear now.'
      : 'At least one configured setting blocks the prompt for this scenario.',
    primaryReason,
    scenarioClass: scenario.targetMethod === 'passkey' ? 'Passkey campaign' : 'Authenticator campaign',
    decisionSource: scenario.campaignState === 'managed' ? 'Microsoft managed rules' : 'Enabled rules',
    trace,
    notes,
  }
}