import React from 'react';
import { TemplateProps } from '@/types/cv';

export default function Template({ data, config, apiBaseUrl }: TemplateProps) {
  const { profile, recipient, letter_body } = data;
  const { tokens } = config;

  // Render HTML safely (handling line breaks)
  const renderBody = (text: string) => {
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <div
      className="template-container"
      style={{
        fontFamily: tokens.fontBody,
        color: tokens.colorTextMain || '#1c1c1c',
        backgroundColor: '#ffffff',
        lineHeight: tokens.lineHeight || 1.5,
        fontSize: tokens.fontSize ? `${tokens.fontSize}px` : '14px',
        padding: '30mm 20mm', // standard letter margins
        minHeight: '297mm', // A4 min height
        boxSizing: 'border-box',
      }}
    >
      {/* Sender Info (Left aligned) */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ 
          fontFamily: tokens.fontHeading, 
          fontSize: '24px', 
          fontWeight: 700,
          color: tokens.colorPrimary,
          margin: '0 0 5px 0'
        }}>
          {profile.name}
        </h1>
        {profile.title && (
          <div style={{ 
            fontSize: '14px', 
            fontWeight: 600, 
            color: tokens.colorSecondary,
            marginBottom: '10px'
          }}>
            {profile.title}
          </div>
        )}
        <div style={{ fontSize: '12px', color: tokens.colorTextMuted || '#666', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {profile.location && <div>{profile.location}</div>}
          {profile.phone && <div>{profile.phone}</div>}
          {profile.email && <div>{profile.email}</div>}
        </div>
      </div>

      {/* Recipient Info (Right aligned) */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px' }}>
        <div style={{ width: '50%' }}>
          {recipient?.company_name && (
            <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '5px' }}>
              {recipient.company_name}
            </div>
          )}
          {recipient?.contact_name && (
            <div style={{ fontWeight: 600 }}>
              {recipient.contact_name}
            </div>
          )}
          {recipient?.contact_title && (
            <div style={{ fontSize: '12px', color: tokens.colorTextMuted || '#666', marginBottom: '5px' }}>
              {recipient.contact_title}
            </div>
          )}
          {recipient?.address && (
            <div style={{ fontSize: '12px', whiteSpace: 'pre-wrap' }}>
              {recipient.address}
            </div>
          )}
        </div>
      </div>

      {/* Date & Location (Right aligned) */}
      {letter_body?.date_location && (
        <div style={{ textAlign: 'right', marginBottom: '30px', fontSize: '12px' }}>
          {letter_body.date_location}
        </div>
      )}

      {/* Subject */}
      {letter_body?.subject && (
        <div style={{ 
          fontWeight: 700, 
          marginBottom: '20px', 
          borderBottom: `1px solid ${tokens.colorPrimary}`,
          paddingBottom: '5px',
          display: 'inline-block'
        }}>
          Objet: {letter_body.subject}
        </div>
      )}

      {/* Opening */}
      {letter_body?.opening && (
        <div style={{ marginBottom: '20px' }}>
          {letter_body.opening}
        </div>
      )}

      {/* Body */}
      {letter_body?.body && (
        <div style={{ marginBottom: '30px', textAlign: 'justify', whiteSpace: 'pre-wrap' }}>
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
        <div style={{ fontWeight: 700, color: tokens.colorPrimary }}>
          {profile.name}
        </div>
      </div>
    </div>
  );
}
