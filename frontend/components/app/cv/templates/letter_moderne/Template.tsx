import React from 'react';
import { TemplateProps } from '@/types/cv';

export default function Template({ data, config, apiBaseUrl }: TemplateProps) {
  const { profile, recipient, letter_body } = data;
  const { tokens } = config;

  return (
    <div
      className="template-container"
      style={{
        fontFamily: tokens.fontBody,
        color: tokens.colorTextMain || '#333333',
        backgroundColor: '#ffffff',
        lineHeight: tokens.lineHeight || 1.6,
        fontSize: tokens.fontSize ? `${tokens.fontSize}px` : '14px',
        padding: '0',
        minHeight: '297mm', // A4 min height
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header (Top colored bar) */}
      <div style={{
        backgroundColor: tokens.colorPrimary,
        color: '#ffffff',
        padding: '30mm 20mm 20mm 20mm',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}>
        <div>
          <h1 style={{ 
            fontFamily: tokens.fontHeading, 
            fontSize: '32px', 
            fontWeight: 800,
            margin: '0 0 5px 0',
            letterSpacing: '-0.5px'
          }}>
            {profile.name}
          </h1>
          {profile.title && (
            <div style={{ 
              fontSize: '16px', 
              fontWeight: 500, 
              opacity: 0.9,
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              {profile.title}
            </div>
          )}
        </div>
        
        <div style={{ 
          fontSize: '12px', 
          opacity: 0.8, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '5px',
          textAlign: 'right'
        }}>
          {profile.location && <div>{profile.location}</div>}
          {profile.phone && <div>{profile.phone}</div>}
          {profile.email && <div>{profile.email}</div>}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ padding: '20mm 20mm', flex: 1 }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
          {/* Date & Location */}
          <div style={{ fontSize: '12px', color: tokens.colorTextMuted || '#777', marginTop: '10px' }}>
            {letter_body?.date_location}
          </div>

          {/* Recipient Info */}
          <div style={{ width: '45%', backgroundColor: '#f8f9fa', padding: '15px', borderRadius: tokens.borderRadius || '8px', borderLeft: `4px solid ${tokens.colorAccent || tokens.colorPrimary}` }}>
            {recipient?.company_name && (
              <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '4px', color: '#1a1a1a' }}>
                {recipient.company_name}
              </div>
            )}
            {recipient?.contact_name && (
              <div style={{ fontWeight: 600, color: '#333' }}>
                À l'attention de: {recipient.contact_name}
              </div>
            )}
            {recipient?.contact_title && (
              <div style={{ fontSize: '12px', color: tokens.colorTextMuted || '#666', marginBottom: '4px' }}>
                {recipient.contact_title}
              </div>
            )}
            {recipient?.address && (
              <div style={{ fontSize: '12px', whiteSpace: 'pre-wrap', marginTop: '8px' }}>
                {recipient.address}
              </div>
            )}
          </div>
        </div>

        {/* Subject */}
        {letter_body?.subject && (
          <div style={{ 
            fontWeight: 700, 
            marginBottom: '25px',
            fontSize: '15px',
            color: tokens.colorPrimary
          }}>
            Objet: {letter_body.subject}
          </div>
        )}

        {/* Opening */}
        {letter_body?.opening && (
          <div style={{ marginBottom: '20px', fontWeight: 600 }}>
            {letter_body.opening}
          </div>
        )}

        {/* Body */}
        {letter_body?.body && (
          <div style={{ marginBottom: '30px', textAlign: 'justify', whiteSpace: 'pre-wrap', color: '#444' }}>
            {letter_body.body}
          </div>
        )}

        {/* Closing */}
        {letter_body?.closing && (
          <div style={{ marginBottom: '40px' }}>
            {letter_body.closing}
          </div>
        )}

        {/* Signature */}
        <div>
          <div style={{ fontWeight: 800, fontSize: '18px', color: '#1a1a1a', fontFamily: tokens.fontHeading }}>
            {profile.name}
          </div>
        </div>

      </div>
    </div>
  );
}
