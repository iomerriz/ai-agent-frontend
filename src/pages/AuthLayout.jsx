import { Link } from 'react-router-dom'

function Sparkle({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2.5 14.5 9.5 21.5 12 14.5 14.5 12 21.5 9.5 14.5 2.5 12 9.5 9.5 12 2.5Z" fill="currentColor" />
    </svg>
  )
}

export { Sparkle }

export default function AuthLayout({ children, mode }) {
  return (
    <main className="auth-page">
      <div className="auth-shell">
        <section className="auth-story" aria-label="About Muse">
          <div className="auth-story-top">
            <Link className="auth-brand auth-brand-light" to="/login" aria-label="Muse home">
              <span className="auth-brand-mark"><Sparkle size={19} /></span>
              <span>muse<span className="auth-brand-period">.</span></span>
            </Link>
            <span className="auth-edition">YOUR SPACE TO THINK</span>
          </div>

          <div className="auth-story-main">
            <div className="auth-eyebrow"><span className="auth-live-dot" /> AN AI COMPANION FOR YOUR IDEAS</div>
            <h1>Good ideas start<br />with a <em>question.</em></h1>
            <p>Think out loud, explore what’s possible, and find clarity in the conversation. Your next idea is one message away.</p>
            <div className="auth-preview" aria-hidden="true">
              <div className="auth-preview-heading"><span className="auth-preview-orb"><Sparkle size={17} /></span> A little inspiration</div>
              <div className="auth-preview-question">“Help me turn this idea into a plan.”</div>
              <div className="auth-preview-answer"><span className="auth-preview-line auth-preview-line-long" /><span className="auth-preview-line" /><span className="auth-preview-line auth-preview-line-short" /></div>
              <span className="auth-preview-glow" />
            </div>
          </div>

          <div className="auth-story-bottom"><span>CREATE. EXPLORE. GO FURTHER.</span><span>✳</span></div>
        </section>

        <section className="auth-panel" aria-label={mode === 'login' ? 'Sign in' : 'Create an account'}>
          <div className="auth-panel-inner">
            <Link className="auth-brand auth-mobile-brand" to="/login" aria-label="Muse home">
              <span className="auth-brand-mark"><Sparkle size={18} /></span>
              <span>muse<span className="auth-brand-period">.</span></span>
            </Link>
            <div className="auth-topline"><span className="auth-step">{mode === 'login' ? 'WELCOME BACK' : 'GET STARTED'}</span><span className="auth-topline-star">✳</span></div>
            {children}
            <div className="auth-footer">A calmer place to get things done. <Sparkle size={13} /></div>
          </div>
        </section>
      </div>
    </main>
  )
}
