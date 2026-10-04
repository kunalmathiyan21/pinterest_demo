import { useEffect, useMemo, useState } from 'react'
import {
  Bell, Bookmark, ChevronDown, CircleUserRound, Compass, Heart, Home,
  ImagePlus, Menu, Plus, Search, Share2, Sparkles, X
} from 'lucide-react'
import { categories, seedPins } from './data'

const STORAGE_KEY = 'pinspire-saved-v1'

function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function App() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeTab, setActiveTab] = useState('home')
  const [selectedPin, setSelectedPin] = useState(null)
  const [savedIds, setSavedIds] = useState(loadSaved)
  const [showCreate, setShowCreate] = useState(false)
  const [showMobileNav, setShowMobileNav] = useState(false)
  const [toast, setToast] = useState('')
  const [customPins, setCustomPins] = useState([])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedIds))
  }, [savedIds])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 2200)
    return () => clearTimeout(t)
  }, [toast])

  const allPins = useMemo(() => [...customPins, ...seedPins], [customPins])

  const visiblePins = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allPins.filter((pin) => {
      const categoryMatch = activeCategory === 'All' || pin.category === activeCategory
      const savedMatch = activeTab !== 'saved' || savedIds.includes(pin.id)
      const searchMatch = !q || [pin.title, pin.author, pin.category, pin.description, ...(pin.tags || [])]
        .join(' ').toLowerCase().includes(q)
      return categoryMatch && savedMatch && searchMatch
    })
  }, [activeCategory, activeTab, allPins, query, savedIds])

  function toggleSave(pinId) {
    setSavedIds((current) => current.includes(pinId)
      ? current.filter((id) => id !== pinId)
      : [...current, pinId])
  }

  function notify(message) {
    setToast(message)
  }

  function handleCreate(pin) {
    const newPin = { ...pin, id: crypto.randomUUID(), height: 460 }
    setCustomPins((current) => [newPin, ...current])
    setShowCreate(false)
    setActiveTab('home')
    setActiveCategory('All')
    notify('Pin added to your demo feed')
  }

  function navigate(tab) {
    setActiveTab(tab)
    setShowMobileNav(false)
    if (tab === 'saved') setActiveCategory('All')
    if (tab === 'home') setQuery('')
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand" onClick={() => navigate('home')} role="button" tabIndex={0}>
          <div className="brand-mark">P</div><span>Pinspire</span>
        </div>
        <nav className="desktop-nav" aria-label="Main navigation">
          <button className={activeTab === 'home' ? 'nav-link active' : 'nav-link'} onClick={() => navigate('home')}>Home</button>
          <button className={activeTab === 'explore' ? 'nav-link active' : 'nav-link'} onClick={() => navigate('explore')}>Explore</button>
          <button className={activeTab === 'saved' ? 'nav-link active' : 'nav-link'} onClick={() => navigate('saved')}>Saved</button>
        </nav>
        <div className="search-wrap">
          <Search size={20} strokeWidth={2.1} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search ideas" aria-label="Search ideas" />
          {query && <button className="clear-search" onClick={() => setQuery('')} aria-label="Clear search"><X size={16} /></button>}
        </div>
        <div className="actions">
          <button className="icon-button" aria-label="Notifications" onClick={() => notify('No new notifications in demo mode')}><Bell size={21} /></button>
          <button className="icon-button" aria-label="Profile" onClick={() => navigate('profile')}><CircleUserRound size={23} /></button>
          <button className="avatar" aria-label="Open profile" onClick={() => navigate('profile')}>K</button>
          <button className="icon-button mobile-menu" aria-label="Menu" onClick={() => setShowMobileNav((value) => !value)}><Menu size={23} /></button>
        </div>
      </header>

      {showMobileNav && (
        <div className="mobile-nav-card">
          <button onClick={() => navigate('home')}><Home size={17} /> Home</button>
          <button onClick={() => navigate('explore')}><Compass size={17} /> Explore</button>
          <button onClick={() => navigate('saved')}><Bookmark size={17} /> Saved</button>
          <button onClick={() => navigate('profile')}><CircleUserRound size={17} /> Profile</button>
        </div>
      )}

      <main className="content">
        <section className="hero">
          <div className="eyebrow"><Sparkles size={16} /> Visual discovery demo</div>
          <h1>{activeTab === 'saved' ? 'Your saved ideas' : activeTab === 'profile' ? 'Kunal’s profile' : activeTab === 'explore' ? 'Explore what inspires you' : 'Ideas worth saving'}</h1>
          <p>{activeTab === 'saved' ? 'Everything you bookmarked in this browser.' : 'A frontend-first Pinterest-style experience ready for a backend later.'}</p>
        </section>

        {activeTab !== 'profile' && (
          <>
            <div className="category-row" aria-label="Categories">
              {categories.map((category) => (
                <button key={category} className={activeCategory === category ? 'chip selected' : 'chip'} onClick={() => setActiveCategory(category)}>
                  {category}
                </button>
              ))}
            </div>
            <div className="feed-toolbar">
              <div className="result-count">{visiblePins.length} ideas</div>
              <button className="create-button" onClick={() => setShowCreate(true)}><Plus size={18} /> Create</button>
            </div>

            {visiblePins.length ? (
              <div className="pin-grid">
                {visiblePins.map((pin) => (
                  <article className="pin-card" key={pin.id} onClick={() => setSelectedPin(pin)}>
                    <div className="pin-image-wrap" style={{ aspectRatio: '4 / ' + Math.max(3, Math.round(pin.height / 100)) }}>
                      <img src={pin.image} alt={pin.title} loading="lazy" />
                      <div className="pin-overlay">
                        <button
                          className={savedIds.includes(pin.id) ? 'save-button saved' : 'save-button'}
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleSave(pin.id)
                            notify(savedIds.includes(pin.id) ? 'Removed from saved' : 'Saved to your ideas')
                          }}
                        >
                          {savedIds.includes(pin.id) ? 'Saved' : 'Save'}
                        </button>
                        <button className="floating-button" onClick={(e) => { e.stopPropagation(); setSelectedPin(pin) }} aria-label="Open pin"><ChevronDown size={18} /></button>
                      </div>
                    </div>
                    <div className="pin-meta">
                      <h2>{pin.title}</h2>
                      <span>{pin.author} · {pin.category}</span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon"><Bookmark size={26} /></div>
                <h2>No ideas here yet</h2>
                <p>Try another category or search, or create a new pin for this demo.</p>
                <button className="create-button" onClick={() => setShowCreate(true)}><Plus size={18} /> Create pin</button>
              </div>
            )}
          </>
        )}

        {activeTab === 'profile' && (
          <section className="profile-card">
            <div className="profile-avatar">K</div>
            <div>
              <h2>Kunal Mathiyan</h2>
              <p>Frontend demo account · {savedIds.length} saved ideas</p>
              <div className="profile-stats">
                <span><strong>{allPins.length}</strong> pins in demo</span>
                <span><strong>{savedIds.length}</strong> saved</span>
                <span><strong>8</strong> boards planned</span>
              </div>
            </div>
            <button className="outline-button" onClick={() => notify('Profile editing comes with the backend phase')}>Edit profile</button>
          </section>
        )}
      </main>

      {selectedPin && (
        <div className="modal-backdrop" onClick={() => setSelectedPin(null)}>
          <div className="pin-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedPin(null)} aria-label="Close"><X size={20} /></button>
            <img src={selectedPin.image} alt={selectedPin.title} />
            <div className="modal-content">
              <div className="modal-topline">
                <span className="small-label">{selectedPin.category}</span>
                <button className={savedIds.includes(selectedPin.id) ? 'save-button saved' : 'save-button'} onClick={() => toggleSave(selectedPin.id)}>
                  {savedIds.includes(selectedPin.id) ? 'Saved' : 'Save'}
                </button>
              </div>
              <h2>{selectedPin.title}</h2>
              <p>{selectedPin.description}</p>
              <div className="modal-actions">
                <button onClick={() => notify('Like action queued for backend')}><Heart size={18} /> Like</button>
                <button onClick={() => notify('Share link copied in backend phase')}><Share2 size={18} /> Share</button>
                <button onClick={() => notify('Board selection UI comes next')}><Bookmark size={18} /> Board</button>
              </div>
              <div className="author-row">
                <div className="mini-avatar">{selectedPin.author.charAt(0)}</div>
                <span>Posted by <strong>{selectedPin.author}</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreate && <CreatePinModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
      <button className="floating-create" onClick={() => setShowCreate(true)} aria-label="Create a pin"><Plus size={25} /></button>
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

function CreatePinModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ title: '', description: '', category: 'Design', author: 'Kunal Mathiyan', image: '' })
  const [error, setError] = useState('')

  function submit(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.image.trim()) {
      setError('Title and image URL are required for the demo.')
      return
    }
    onCreate({ ...form, title: form.title.trim(), description: form.description.trim() || 'A new idea shared from the Pinspire demo.' })
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="create-modal" onSubmit={submit} onClick={(e) => e.stopPropagation()}>
        <div className="create-head">
          <div><span className="small-label">Demo only</span><h2>Create a pin</h2></div>
          <button type="button" className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <label>Title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Cozy workspace" /></label>
        <label>Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Tell people why this idea matters" rows="3" /></label>
        <label>Image URL<input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://images.unsplash.com/..." /></label>
        <label>Category<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{categories.filter((item) => item !== 'All').map((item) => <option key={item}>{item}</option>)}</select></label>
        {error && <div className="form-error">{error}</div>}
        <div className="create-preview"><ImagePlus size={18} /><span>Images are stored as URLs locally. File upload comes with the backend/storage phase.</span></div>
        <button className="submit-button" type="submit">Publish demo pin</button>
      </form>
    </div>
  )
}

export default App
