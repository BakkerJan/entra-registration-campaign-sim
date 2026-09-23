import { useMemo, useState } from 'react'
import './App.css'
import {
  browserFamilyOptions,
  campaignStateOptions,
  evaluateScenario,
  localPasskeyOptions,
  methodOptions,
  osOptions,
  passkeyProfileOptions,
  signInMfaOptions,
  supportedProviderOptions,
  type CampaignState,
  type LocalPasskeyType,
  type Os,
  type PasskeyProfile,
  type Scenario,
  type SupportedAaguidProvider,
  type TargetMethod,
} from './campaignEngine'

const defaultScenario: Scenario = {
  campaignState: 'enabled',
  targetMethod: 'passkey',
  passkeySelfServiceSetup: true,
  passkeyProfile: 'aaguidRestricted',
  aaguidProviders: ['microsoftAuthenticatorPasskey'],
  os: 'windows',
  browserFamily: 'chrome',
  signInMfaMethod: 'sms',
  selectedLocalPasskeys: ['googlePasswordManager'],
  ssoSessionActive: false,
  registerSecurityInfoBlocked: false,
  termsOfUseVisible: false,
  customControlsVisible: false,
  sameSessionAsMethodRegistration: false,
}

function App() {
  const [scenario, setScenario] = useState<Scenario>(defaultScenario)

  const campaignDisabled = scenario.campaignState === 'disabled'
  const evaluation = useMemo(() => evaluateScenario(scenario), [scenario])

  function updateScenario<K extends keyof Scenario>(key: K, value: Scenario[K]) {
    setScenario((current) => {
      if (key === 'campaignState' && value === 'managed') {
        return { ...current, campaignState: value, targetMethod: 'passkey' }
      }

      if (key === 'signInMfaMethod') {
        const method = value as Scenario['signInMfaMethod']
        const inferred = inferredLocalPasskeysFromMfa(method)

        if (inferred.length === 0) {
          return { ...current, [key]: value }
        }

        const merged = Array.from(new Set([...current.selectedLocalPasskeys, ...inferred]))
        return { ...current, [key]: value, selectedLocalPasskeys: merged }
      }

      return { ...current, [key]: value }
    })
  }

  function inferredLocalPasskeysFromMfa(method: Scenario['signInMfaMethod']): LocalPasskeyType[] {
    switch (method) {
      case 'windowsHelloForBusiness':
        return ['windowsHello']
      case 'platformSSO':
        return ['macosPlatformSSO']
      case 'passkeyOrFido2SecurityKey':
        return ['crossPlatformSecurityKey']
      default:
        return []
    }
  }

  function toggleLocalPasskey(type: LocalPasskeyType) {
    setScenario((current) => {
      const nextSelected = current.selectedLocalPasskeys.includes(type)
        ? current.selectedLocalPasskeys.filter((item) => item !== type)
        : [...current.selectedLocalPasskeys, type]

      return { ...current, selectedLocalPasskeys: nextSelected }
    })
  }

  function toggleProvider(provider: SupportedAaguidProvider) {
    setScenario((current) => {
      const nextProviders = current.aaguidProviders.includes(provider)
        ? current.aaguidProviders.filter((item) => item !== provider)
        : [...current.aaguidProviders, provider]

      return { ...current, aaguidProviders: nextProviders }
    })
  }

  return (
    <main className="shell">
      <header className="hero-banner">
        <div className="hero-copy">
          <p className="eyebrow">Microsoft Entra campaign simulator</p>
          <h1>To nudge, or not to nudge?</h1>
          <p className="lede">
            Quick what-if tool for Microsoft Entra registration campaigns: tune policy settings
            and instantly see whether a user is nudged now.
          </p>
        </div>

        <div className="hero-actions">
          <button type="button" className="primary-button" onClick={() => setScenario(defaultScenario)}>
            Reset scenario
          </button>
        </div>
      </header>

      <section className="layout">
        <section className="panel panel-controls">
          <div className="panel-title-row">
            <div>
              <p className="panel-kicker">Inputs</p>
              <h2>Policy and context</h2>
            </div>
            <span className="panel-note">Settings only</span>
          </div>

          <div className="form-grid">
            <label>
              <span>Campaign state</span>
              <select
                value={scenario.campaignState}
                onChange={(event) =>
                  updateScenario('campaignState', event.target.value as CampaignState)
                }
              >
                {campaignStateOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {scenario.campaignState === 'managed' ? (
                <span className="field-note">Microsoft managed forces Passkey and locks the method selector.</span>
              ) : null}
            </label>
          </div>

          {campaignDisabled ? (
            <div className="form-grid disabled-state-grid">
              <div className="info-box compact-state-box">
                <strong>Campaign disabled</strong>
                <p>The registration campaign is turned off, so users are not nudged.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="form-grid">
                <label>
                  <span>Target method</span>
                  <select
                    value={scenario.targetMethod}
                    disabled={scenario.campaignState === 'managed'}
                    onChange={(event) => updateScenario('targetMethod', event.target.value as TargetMethod)}
                  >
                    {methodOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>OS</span>
                  <select value={scenario.os} onChange={(event) => updateScenario('os', event.target.value as Os)}>
                    {osOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Browser family</span>
                  <select
                    value={scenario.browserFamily}
                    onChange={(event) =>
                      updateScenario('browserFamily', event.target.value as Scenario['browserFamily'])
                    }
                  >
                    {browserFamilyOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Sign-in MFA method</span>
                  <select
                    value={scenario.signInMfaMethod}
                    onChange={(event) =>
                      updateScenario('signInMfaMethod', event.target.value as Scenario['signInMfaMethod'])
                    }
                  >
                    {signInMfaOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="checklist-card">
                <div className="card-heading">
                  <h3>Local passkeys available on this platform</h3>
                  <p>
                    Select every local passkey type that exists on the current OS and browser family.
                    When your sign-in MFA method is passkey/FIDO2, Windows Hello for Business, or Platform SSO,
                    matching local passkeys are auto-selected.
                  </p>
                </div>

                <div className="chip-grid">
                  {localPasskeyOptions.map((option) => {
                    const selected = scenario.selectedLocalPasskeys.includes(option.value)

                    return (
                      <button
                        key={option.value}
                        type="button"
                        className={selected ? 'chip chip-selected' : 'chip'}
                        onClick={() => toggleLocalPasskey(option.value)}
                      >
                        {option.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="checklist-card">
                <div className="card-heading">
                  <h3>Policy switches</h3>
                  <p>These are the consequence gates the article calls out.</p>
                </div>

                <div className="toggle-list">
                  <label className="toggle-row">
                    <input
                      type="checkbox"
                      checked={scenario.passkeySelfServiceSetup}
                      onChange={(event) => updateScenario('passkeySelfServiceSetup', event.target.checked)}
                    />
                    <span>Passkey self-service setup is allowed</span>
                  </label>

                  <label className="toggle-row">
                    <span>Passkey profile</span>
                    <select
                      value={scenario.passkeyProfile}
                      disabled={scenario.campaignState !== 'managed' || scenario.targetMethod !== 'passkey'}
                      onChange={(event) =>
                        updateScenario('passkeyProfile', event.target.value as PasskeyProfile)
                      }
                    >
                      {passkeyProfileOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  {scenario.campaignState !== 'managed' || scenario.targetMethod !== 'passkey' ? (
                    <div className="info-box">
                      <strong>Passkey profile eligibility is not used in this state</strong>
                      <p>
                        The Microsoft managed passkey-profile eligibility check applies only when the campaign is in the Microsoft managed state and targets passkeys.
                      </p>
                    </div>
                  ) : scenario.passkeyProfile === 'aaguidRestricted' ? (
                    <div>
                      <span className="section-label">AAGUID allow list supported providers</span>
                      <div className="chip-grid">
                        {supportedProviderOptions.map((provider) => {
                          const selected = scenario.aaguidProviders.includes(provider.value)

                          return (
                            <button
                              key={provider.value}
                              type="button"
                              className={selected ? 'chip chip-selected' : 'chip'}
                              onClick={() => toggleProvider(provider.value)}
                            >
                              {provider.label}
                            </button>
                          )
                        })}
                      </div>

                      <div className="info-box">
                        <strong>Only relevant for AAGUID-restricted profiles</strong>
                        <p>
                          The allow list is checked only when the passkey profile is AAGUID-restricted. Other profiles ignore it.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="info-box">
                      <strong>AAGUID allow list is not used here</strong>
                      <p>
                        Only the AAGUID-restricted passkey profile evaluates the supported provider list.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="checklist-card">
                <div className="card-heading">
                  <h3>Environment blockers</h3>
                  <p>These model the article’s sign-in suppressors.</p>
                </div>

                <div className="toggle-list">
                  <label className="toggle-row">
                    <input
                      type="checkbox"
                      checked={scenario.ssoSessionActive}
                      onChange={(event) => updateScenario('ssoSessionActive', event.target.checked)}
                    />
                    <span>Already signed in with SSO</span>
                  </label>

                  <label className="toggle-row">
                    <input
                      type="checkbox"
                      checked={scenario.registerSecurityInfoBlocked}
                      onChange={(event) =>
                        updateScenario('registerSecurityInfoBlocked', event.target.checked)
                      }
                    />
                    <span>Conditional Access blocks Register security information</span>
                  </label>

                  <label className="toggle-row">
                    <input
                      type="checkbox"
                      checked={scenario.termsOfUseVisible}
                      onChange={(event) => updateScenario('termsOfUseVisible', event.target.checked)}
                    />
                    <span>Terms of use appears during sign-in</span>
                  </label>

                  <label className="toggle-row">
                    <input
                      type="checkbox"
                      checked={scenario.customControlsVisible}
                      onChange={(event) => updateScenario('customControlsVisible', event.target.checked)}
                    />
                    <span>Conditional Access custom controls redirect the sign-in</span>
                  </label>

                  <label className="toggle-row">
                    <input
                      type="checkbox"
                      checked={scenario.sameSessionAsMethodRegistration}
                      onChange={(event) =>
                        updateScenario('sameSessionAsMethodRegistration', event.target.checked)
                      }
                    />
                    <span>This is the same session where another authentication method was just registered</span>
                  </label>
                </div>
              </div>
            </>
          )}
        </section>

        <section className="panel panel-output">
          <div className="panel-title-row">
            <div>
              <p className="panel-kicker">Output</p>
              <h2>Consequence trace</h2>
            </div>
            <span className={evaluation.nudged ? 'status status-yes' : 'status status-no'}>
              {evaluation.nudged ? 'Yes, nudged' : 'No, not nudged'}
            </span>
          </div>

          <div className="result-card">
            <div className="result-meta">
              <span className="result-label">Verdict</span>
              <h3>{evaluation.headline}</h3>
              <p>{evaluation.summary}</p>
            </div>

            <div className="result-grid">
              <article>
                <span>Blocking reason</span>
                <strong>{evaluation.primaryReason}</strong>
              </article>
              <article>
                <span>Scenario class</span>
                <strong>{evaluation.scenarioClass}</strong>
              </article>
              <article>
                <span>Decision source</span>
                <strong>{evaluation.decisionSource}</strong>
              </article>
            </div>
          </div>

          <div className="trace-card">
            <div className="card-heading">
              <h3>Reason trace</h3>
              <p>What the tool used to reach the current yes/no outcome.</p>
            </div>

            <ol className="trace-list">
              {evaluation.trace.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>

          <div className="trace-card">
            <div className="card-heading">
              <h3>Notes</h3>
              <p>Useful reminders pulled straight from the policy logic.</p>
            </div>

            <ul className="notes-list">
              {evaluation.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>

          <div className="summary-strip">
            <div>
              <span>Current target</span>
              <strong>
                {scenario.targetMethod === 'authenticator' ? 'Microsoft Authenticator' : 'Passkey'}
              </strong>
            </div>
            <div>
              <span>Platform</span>
              <strong>
                {scenario.os} / {scenario.browserFamily}
              </strong>
            </div>
            <div>
              <span>Campaign state</span>
              <strong>{scenario.campaignState}</strong>
            </div>
          </div>
        </section>
      </section>
    </main>
  )
}

export default App
