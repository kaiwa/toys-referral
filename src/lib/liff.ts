import liff from '@line/liff'

const LIFF_ID = import.meta.env.VITE_LIFF_ID as string
const APP_URL = import.meta.env.VITE_APP_URL as string

let initialized = false

export async function initLiff(): Promise<void> {
  if (initialized) return
  await liff.init({ liffId: LIFF_ID })
  initialized = true
}

export function isLoggedIn(): boolean {
  return liff.isLoggedIn()
}

export function login(): void {
  liff.login()
}

export function getProfile() {
  return liff.getProfile()
}

export function getIdToken(): string | null {
  return liff.getIDToken()
}

export function isInClient(): boolean {
  return liff.isInClient()
}

export function getReferralCodeFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search)
  // LIFF passes query params via liff.state
  const liffState = params.get('liff.state')
  if (liffState) {
    const inner = new URLSearchParams(liffState.startsWith('?') ? liffState.slice(1) : liffState)
    return inner.get('ref')
  }
  return params.get('ref')
}

export async function shareReferral(referralCode: string): Promise<boolean> {
  const referralUrl = `${APP_URL}/?ref=${referralCode}`
  const jobTitle = import.meta.env.VITE_JOB_TITLE || 'Job Opportunity'
  const jobDescription = import.meta.env.VITE_JOB_DESCRIPTION || 'Check out this opportunity!'

  const available = await liff.shareTargetPicker(
    [
      {
        type: 'flex',
        altText: `${jobTitle} – Job Referral`,
        contents: {
          type: 'bubble',
          size: 'kilo',
          header: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '✨ Job Opportunity',
                color: '#ffffff',
                size: 'sm',
                weight: 'bold',
              },
            ],
            backgroundColor: '#06C755',
            paddingAll: '12px',
          },
          body: {
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            contents: [
              {
                type: 'text',
                text: jobTitle,
                size: 'lg',
                weight: 'bold',
                color: '#1a1a1a',
                wrap: true,
              },
              {
                type: 'text',
                text: jobDescription,
                size: 'sm',
                color: '#555555',
                wrap: true,
                margin: 'sm',
              },
            ],
            paddingAll: '16px',
          },
          footer: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'button',
                action: {
                  type: 'uri',
                  label: 'View & Apply / Share',
                  uri: referralUrl,
                },
                style: 'primary',
                color: '#06C755',
                height: 'sm',
              },
            ],
            paddingAll: '12px',
          },
        },
      },
    ],
    { isMultiple: true },
  )

  return !!available
}
