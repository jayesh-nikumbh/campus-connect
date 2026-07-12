import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Users, User, CreditCard, CheckCircle2, Loader2, Plus, Trash2, IndianRupee, Ticket, AlertCircle } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import studentService from '../../services/studentService'

const STEPS = { FORM: 'form', PAYMENT: 'payment', SUCCESS: 'success' }

export default function RegistrationModal({ event, onClose, onSuccess }) {
  const { dark, accentColor } = useTheme()
  const BRAND = accentColor || '#615FFF'

  // For "Both" mode events, let user pick
  const [participationType, setParticipationType] = useState(
    event.mode === 'Solo' ? 'Solo' : event.mode === 'Team' ? 'Team' : 'Solo'
  )
  const [step, setStep] = useState(STEPS.FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Solo fields
  const [soloForm, setSoloForm] = useState({ name: '', rollNo: '', department: '', year: '', phone: '' })

  // Team fields
  const [teamName, setTeamName] = useState('')
  const [members, setMembers] = useState([
    { name: '', rollNo: '', department: '', year: '' },
    { name: '', rollNo: '', department: '', year: '' },
  ])

  // Payment fields
  const [payMethod, setPayMethod] = useState('upi')
  const [upiId, setUpiId] = useState('')
  const [cardNo, setCardNo] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [cardName, setCardName] = useState('')

  const hasFees = event.fees > 0
  const isTeam = participationType === 'Team'
  const minMembers = event.minTeamSize || 2
  const maxMembers = event.maxTeamSize || 5

  /* ── Validation ── */
  function validateForm() {
    if (isTeam) {
      if (!teamName.trim()) return 'Team name is required.'
      for (let i = 0; i < members.length; i++) {
        const m = members[i]
        if (!m.name.trim() || !m.rollNo.trim() || !m.department.trim() || !m.year.trim())
          return `Please fill all details for Member ${i + 1}.`
      }
    } else {
      const { name, rollNo, department, year, phone } = soloForm
      if (!name.trim() || !rollNo.trim() || !department.trim() || !year.trim() || !phone.trim())
        return 'Please fill all required fields.'
      if (!/^\d{10}$/.test(phone.replace(/\s/g, ''))) return 'Enter a valid 10-digit phone number.'
    }
    return null
  }

  function validatePayment() {
    if (payMethod === 'upi') {
      if (!upiId.trim() || !upiId.includes('@')) return 'Enter a valid UPI ID (e.g. name@upi).'
    } else {
      if (!/^\d{16}$/.test(cardNo.replace(/\s/g, ''))) return 'Enter a valid 16-digit card number.'
      if (!cardExpiry.trim()) return 'Card expiry is required.'
      if (!/^\d{3}$/.test(cardCvv)) return 'Enter a valid 3-digit CVV.'
      if (!cardName.trim()) return 'Cardholder name is required.'
    }
    return null
  }

  async function handleFormNext() {
    setError('')
    const err = validateForm()
    if (err) { setError(err); return }
    if (hasFees) { setStep(STEPS.PAYMENT); return }
    await submitRegistration()
  }

  async function handlePaymentSubmit() {
    setError('')
    const err = validatePayment()
    if (err) { setError(err); return }
    await submitRegistration()
  }

  async function submitRegistration() {
    setLoading(true)
    setError('')
    const payload = {
      eventId: event.id,
      participationType,
      ...(isTeam ? { teamName, members } : { ...soloForm }),
      ...(hasFees ? { payment: { method: payMethod, amount: event.fees } } : {}),
    }
    const res = await studentService.registerEvent(event.id, payload)
    setLoading(false)
    if (res.success) {
      setStep(STEPS.SUCCESS)
      setTimeout(() => { onSuccess(event.id) }, 1800)
    } else {
      setError(res.message || 'Registration failed. Please try again.')
    }
  }

  function addMember() {
    if (members.length < maxMembers) setMembers([...members, { name: '', rollNo: '', department: '', year: '' }])
  }
  function removeMember(i) {
    if (members.length > minMembers) setMembers(members.filter((_, idx) => idx !== i))
  }
  function updateMember(i, field, val) {
    setMembers(members.map((m, idx) => idx === i ? { ...m, [field]: val } : m))
  }

  /* ── Styles ── */
  const card = dark ? '#0c1829' : '#ffffff'
  const border = dark ? '#1a3050' : '#e2e8f0'
  const txt = dark ? '#e8f0fe' : '#0f172a'
  const txtSec = dark ? '#7a98bb' : '#64748b'
  const inputBg = dark ? '#060e1c' : '#f8fafc'
  const inputStyle = {
    background: inputBg, border: `1px solid ${border}`, color: txt,
    borderRadius: 10, padding: '9px 12px', fontSize: 13, width: '100%',
    outline: 'none', fontFamily: 'Manrope, sans-serif',
  }
  const labelStyle = { fontSize: 11, fontWeight: 700, color: txtSec, display: 'block', marginBottom: 4 }

  const modal = (
    <div className="fixed inset-0 z-999 flex items-center justify-center px-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col"
        style={{ background: card, border: `1px solid ${border}`, animation: 'regModalIn 0.22s cubic-bezier(0.34,1.56,0.64,1)' }}
      >
        {/* Gradient top bar */}
        <div className="h-1 w-full shrink-0 rounded-t-2xl" style={{ background: `linear-gradient(90deg, ${BRAND}, #a855f7)` }} />

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 shrink-0" style={{ borderBottom: `1px solid ${border}` }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{ background: `${BRAND}18`, color: BRAND }}>
                {event.category}
              </span>
              {hasFees && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 flex items-center gap-1">
                  <IndianRupee size={9} /> {event.fees}
                </span>
              )}
            </div>
            <h2 className="text-[17px] font-black m-0" style={{ color: txt }}>{event.title}</h2>
            <p className="text-[12px] mt-0.5 m-0" style={{ color: txtSec }}>{event.date} · {event.venue}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg border-none cursor-pointer transition-all hover:bg-red-500/10"
            style={{ background: 'transparent', color: txtSec }}>
            <X size={18} />
          </button>
        </div>

        {/* Step indicator */}
        {hasFees && step !== STEPS.SUCCESS && (
          <div className="flex items-center gap-2 px-6 pt-4 pb-0 shrink-0">
            {['Details', 'Payment'].map((s, i) => (
              <React.Fragment key={s}>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black transition-all"
                    style={{
                      background: i === 0 ? (step === STEPS.FORM ? BRAND : `${BRAND}30`) : (step === STEPS.PAYMENT ? BRAND : `${BRAND}18`),
                      color: i === 0 ? (step === STEPS.FORM ? '#fff' : BRAND) : (step === STEPS.PAYMENT ? '#fff' : txtSec),
                    }}>
                    {i + 1}
                  </div>
                  <span className="text-[11px] font-bold" style={{ color: i === (step === STEPS.FORM ? 0 : 1) ? BRAND : txtSec }}>{s}</span>
                </div>
                {i === 0 && <div className="flex-1 h-px" style={{ background: border }} />}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* ── STEP: SUCCESS ── */}
        {step === STEPS.SUCCESS && (
          <div className="flex flex-col items-center justify-center py-12 px-6 gap-3">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2"
              style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}>
              <CheckCircle2 size={32} color="#22c55e" />
            </div>
            <h3 className="text-[20px] font-black m-0" style={{ color: txt }}>Registered!</h3>
            <p className="text-[13px] text-center m-0" style={{ color: txtSec }}>
              {hasFees ? 'Payment successful. ' : ''}You are now registered for <strong>{event.title}</strong>.
            </p>
            <div className="text-[11px] mt-2 font-semibold" style={{ color: txtSec }}>Closing automatically…</div>
          </div>
        )}

        {/* ── STEP: FORM ── */}
        {step === STEPS.FORM && (
          <div className="px-6 py-5 flex flex-col gap-4">
            {event.description && (
              <p className="text-[12px] leading-relaxed m-0 p-3 rounded-xl" style={{ background: `${BRAND}0d`, color: txtSec }}>
                {event.description}
              </p>
            )}

            {/* Mode picker for "Both" events */}
            {event.mode === 'Both' && (
              <div>
                <label style={labelStyle}>Participation Type</label>
                <div className="flex gap-2">
                  {['Solo', 'Team'].map(m => (
                    <button key={m} onClick={() => setParticipationType(m)}
                      className="flex-1 py-2.5 rounded-xl text-[12px] font-bold border cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                      style={{
                        background: participationType === m ? BRAND : 'transparent',
                        color: participationType === m ? '#fff' : txtSec,
                        borderColor: participationType === m ? BRAND : border,
                      }}>
                      {m === 'Solo' ? <User size={13} /> : <Users size={13} />} {m}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Solo Form ── */}
            {!isTeam && (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={labelStyle}>Full Name *</label>
                    <input style={inputStyle} placeholder="Your full name" value={soloForm.name}
                      onChange={e => setSoloForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div>
                    <label style={labelStyle}>Roll Number *</label>
                    <input style={inputStyle} placeholder="21CS001" value={soloForm.rollNo}
                      onChange={e => setSoloForm(p => ({ ...p, rollNo: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={labelStyle}>Department *</label>
                    <select style={inputStyle} value={soloForm.department}
                      onChange={e => setSoloForm(p => ({ ...p, department: e.target.value }))}>
                      <option value="">Select dept</option>
                      {['CSE', 'ECE', 'ME', 'EEE', 'CE', 'IT', 'MBA', 'MCA'].map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Year *</label>
                    <select style={inputStyle} value={soloForm.year}
                      onChange={e => setSoloForm(p => ({ ...p, year: e.target.value }))}>
                      <option value="">Select year</option>
                      {['1st', '2nd', '3rd', '4th', 'PG 1st', 'PG 2nd'].map(y => <option key={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Phone Number *</label>
                  <input style={inputStyle} placeholder="9876543210" maxLength={10} value={soloForm.phone}
                    onChange={e => setSoloForm(p => ({ ...p, phone: e.target.value.replace(/\D/, '') }))} />
                </div>
              </div>
            )}

            {/* ── Team Form ── */}
            {isTeam && (
              <div className="flex flex-col gap-4">
                <div>
                  <label style={labelStyle}>Team Name *</label>
                  <input style={inputStyle} placeholder="Enter your team name" value={teamName}
                    onChange={e => setTeamName(e.target.value)} />
                </div>
                <div className="text-[11px] font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5"
                  style={{ background: `${BRAND}10`, color: BRAND }}>
                  <Users size={12} /> Team: {minMembers}–{maxMembers} members
                </div>
                {members.map((m, i) => (
                  <div key={i} className="p-4 rounded-xl flex flex-col gap-3" style={{ background: inputBg, border: `1px solid ${border}` }}>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-black" style={{ color: BRAND }}>Member {i + 1}</span>
                      {i >= minMembers && (
                        <button onClick={() => removeMember(i)} className="p-1 rounded-lg border-none cursor-pointer text-red-400 hover:bg-red-500/10 transition-all"
                          style={{ background: 'transparent' }}>
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label style={labelStyle}>Name *</label>
                        <input style={inputStyle} placeholder="Full name" value={m.name}
                          onChange={e => updateMember(i, 'name', e.target.value)} />
                      </div>
                      <div>
                        <label style={labelStyle}>Roll No *</label>
                        <input style={inputStyle} placeholder="21CS001" value={m.rollNo}
                          onChange={e => updateMember(i, 'rollNo', e.target.value)} />
                      </div>
                      <div>
                        <label style={labelStyle}>Department *</label>
                        <select style={inputStyle} value={m.department}
                          onChange={e => updateMember(i, 'department', e.target.value)}>
                          <option value="">Select</option>
                          {['CSE', 'ECE', 'ME', 'EEE', 'CE', 'IT', 'MBA', 'MCA'].map(d => <option key={d}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Year *</label>
                        <select style={inputStyle} value={m.year}
                          onChange={e => updateMember(i, 'year', e.target.value)}>
                          <option value="">Select</option>
                          {['1st', '2nd', '3rd', '4th', 'PG 1st', 'PG 2nd'].map(y => <option key={y}>{y}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
                {members.length < maxMembers && (
                  <button onClick={addMember}
                    className="flex items-center gap-1.5 text-[12px] font-bold py-2 px-4 rounded-xl border border-dashed cursor-pointer transition-all hover:opacity-80"
                    style={{ background: 'transparent', borderColor: BRAND, color: BRAND }}>
                    <Plus size={13} /> Add Member
                  </button>
                )}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-[12px] font-semibold text-red-400 px-3 py-2.5 rounded-xl"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <AlertCircle size={14} /> {error}
              </div>
            )}

            {/* Footer */}
            <div className="flex gap-3 pt-1">
              <button onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-bold border cursor-pointer transition-all hover:opacity-80"
                style={{ background: 'transparent', color: txtSec, borderColor: border }}>
                Cancel
              </button>
              <button onClick={handleFormNext} disabled={loading}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-bold border-none cursor-pointer text-white flex items-center justify-center gap-1.5 transition-all hover:opacity-90"
                style={{ background: BRAND, opacity: loading ? 0.7 : 1 }}>
                {loading ? <Loader2 size={14} className="animate-spin" /> : hasFees ? <><CreditCard size={14} /> Pay ₹{event.fees}</> : <><Ticket size={14} /> Register</>}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: PAYMENT ── */}
        {step === STEPS.PAYMENT && (
          <div className="px-6 py-5 flex flex-col gap-4">
            {/* Amount summary */}
            <div className="flex items-center justify-between p-4 rounded-xl"
              style={{ background: `${BRAND}0d`, border: `1px solid ${BRAND}30` }}>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: BRAND }}>Amount to Pay</div>
                <div className="text-[22px] font-black mt-0.5" style={{ color: txt }}>₹{event.fees}</div>
              </div>
              <div className="text-right">
                <div className="text-[11px]" style={{ color: txtSec }}>Event</div>
                <div className="text-[13px] font-bold" style={{ color: txt }}>{event.title}</div>
              </div>
            </div>

            {/* Method selector */}
            <div>
              <label style={labelStyle}>Payment Method</label>
              <div className="flex gap-2">
                {[
                  { key: 'upi', label: 'UPI', icon: '₹' },
                  { key: 'card', label: 'Card', icon: '💳' },
                ].map(({ key, label, icon }) => (
                  <button key={key} onClick={() => setPayMethod(key)}
                    className="flex-1 py-2.5 rounded-xl text-[12px] font-bold border cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                    style={{
                      background: payMethod === key ? BRAND : 'transparent',
                      color: payMethod === key ? '#fff' : txtSec,
                      borderColor: payMethod === key ? BRAND : border,
                    }}>
                    {icon} {label}
                  </button>
                ))}
              </div>
            </div>

            {/* UPI fields */}
            {payMethod === 'upi' && (
              <div>
                <label style={labelStyle}>UPI ID *</label>
                <input style={inputStyle} placeholder="yourname@upi" value={upiId}
                  onChange={e => setUpiId(e.target.value)} />
                <p className="text-[11px] mt-1.5 m-0" style={{ color: txtSec }}>e.g. 9876543210@ybl, name@okicici</p>
              </div>
            )}

            {/* Card fields */}
            {payMethod === 'card' && (
              <div className="flex flex-col gap-3">
                <div>
                  <label style={labelStyle}>Card Number *</label>
                  <input style={inputStyle} placeholder="1234 5678 9012 3456" maxLength={19}
                    value={cardNo.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim()}
                    onChange={e => setCardNo(e.target.value.replace(/\D/g, '').slice(0, 16))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={labelStyle}>Expiry (MM/YY) *</label>
                    <input style={inputStyle} placeholder="08/27" maxLength={5} value={cardExpiry}
                      onChange={e => {
                        let v = e.target.value.replace(/\D/g, '').slice(0, 4)
                        if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2)
                        setCardExpiry(v)
                      }} />
                  </div>
                  <div>
                    <label style={labelStyle}>CVV *</label>
                    <input style={inputStyle} placeholder="•••" maxLength={3} type="password" value={cardCvv}
                      onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Cardholder Name *</label>
                  <input style={inputStyle} placeholder="Name on card" value={cardName}
                    onChange={e => setCardName(e.target.value)} />
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-[12px] font-semibold text-red-400 px-3 py-2.5 rounded-xl"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <AlertCircle size={14} /> {error}
              </div>
            )}

            {/* Mock notice */}
            <div className="text-[11px] font-medium px-3 py-2 rounded-lg" style={{ background: 'rgba(245,158,11,0.08)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
              🔒 This is a simulated payment. No real transaction will occur.
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setStep(STEPS.FORM); setError('') }}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-bold border cursor-pointer transition-all hover:opacity-80"
                style={{ background: 'transparent', color: txtSec, borderColor: border }}>
                ← Back
              </button>
              <button onClick={handlePaymentSubmit} disabled={loading}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-bold border-none cursor-pointer text-white flex items-center justify-center gap-1.5 transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)', opacity: loading ? 0.7 : 1 }}>
                {loading ? <Loader2 size={14} className="animate-spin" /> : <><CheckCircle2 size={14} /> Pay ₹{event.fees}</>}
              </button>
            </div>
          </div>
        )}

        <style>{`
          @keyframes regModalIn {
            from { opacity: 0; transform: scale(0.92) translateY(16px); }
            to   { opacity: 1; transform: scale(1)    translateY(0); }
          }
        `}</style>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
