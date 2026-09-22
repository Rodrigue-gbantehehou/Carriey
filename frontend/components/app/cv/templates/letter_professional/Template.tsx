import React from 'react';
import './style.css';
import { TemplateProps } from '@/types/cv';

export default function Template({ data, config, apiBaseUrl }: TemplateProps) {
  const { profile, recipient, letter_body } = data;
  const { tokens } = config;

  return (
    <div
      className="template-container"
      style={{
        fontFamily: tokens.fontBody,
        color: tokens.colorTextMain || '#2d3748',
        backgroundColor: '#ffffff',
        lineHeight: tokens.lineHeight || 1.6,
        fontSize: tokens.fontSize ? `${tokens.fontSize}px` : '14px',
        padding: '25mm 25mm',
        minHeight: '297mm', // A4 min height
        boxSizing: 'border-box',
        borderTop: `8px solid ${tokens.colorPrimary}`
      }}
    >
      <div style={{ display: 'flex', gap: '40px' }}>
        
        {/* Left Sidebar (Sender Info) */}
        <div style={{ width: '30%', borderRight: `2px solid ${tokens.colorSecondary || '#edf2f7'}`, paddingRight: '20px' }}>
          <h1 style={{ 
            fontFamily: tokens.fontHeading, 
            fontSize: '22px', 
            fontWeight: 700,
            color: tokens.colorPrimary,
            margin: '0 0 5px 0',
            lineHeight: 1.2
          }}>
            {profile.name}
          </h1>
          {profile.title && (
            <div style={{ 
              fontSize: '13px', 
              fontWeight: 600, 
              color: '#718096',
              marginBottom: '25px'
            }}>
              {profile.title}
            </div>
          )}

          <div style={{ fontSize: '11px', color: '#4a5568', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {profile.location && (
              <div>
                <strong style={{ display: 'block', color: tokens.colorPrimary, marginBottom: '2px' }}>ADRESSE</strong>
                {profile.location}
              </div>
            )}
            {profile.phone && (
              <div>
                <strong style={{ display: 'block', color: tokens.colorPrimary, marginBottom: '2px' }}>TÉLÉPHONE</strong>
                {profile.phone}
              </div>
            )}
            {profile.email && (
              <div>
                <strong style={{ display: 'block', color: tokens.colorPrimary, marginBottom: '2px' }}>EMAIL</strong>
                {profile.email}
              </div>
            )}
          </div>
        </div>

        {/* Right Main Content */}
        <div style={{ width: '70%', paddingLeft: '10px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '35px', alignItems: 'flex-start' }}>
            {/* Date & Location */}
            <div style={{ fontSize: '12px', color: '#718096' }}>
              {letter_body?.date_location}
            </div>

            {/* Recipient Info */}
            <div style={{ textAlign: 'right', width: '60%' }}>
              {recipient?.company_name && (
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#1a202c', marginBottom: '2px' }}>
                  {recipient.company_name}
                </div>
              )}
              {recipient?.contact_name && (
                <div style={{ fontWeight: 600, color: '#4a5568' }}>
                  {recipient.contact_name}
                </div>
              )}
              {recipient?.contact_title && (
                <div style={{ fontSize: '12px', color: '#718096', marginBottom: '2px' }}>
                  {recipient.contact_title}
                </div>
              )}
              {recipient?.address && (
                <div style={{ fontSize: '12px', whiteSpace: 'pre-wrap', color: '#4a5568', marginTop: '5px' }}>
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
              fontSize: '14px',
              color: '#1a202c',
              backgroundColor: tokens.colorSecondary || '#edf2f7',
              padding: '10px 15px',
              borderRadius: '4px'
            }}>
              Objet : {letter_body.subject}
            </div>
          )}

          {/* Opening */}
          {letter_body?.opening && (
            <div style={{ marginBottom: '20px', color: '#2d3748' }}>
              {letter_body.opening}
            </div>
          )}

          {/* Body */}
          {letter_body?.body && (
            <div style={{ marginBottom: '30px', textAlign: 'justify', whiteSpace: 'pre-wrap', color: '#4a5568' }}>
              {letter_body.body}
            </div>
          )}

          {/* Closing */}
          {letter_body?.closing && (
            <div style={{ marginBottom: '40px', color: '#2d3748' }}>
              {letter_body.closing}
            </div>
          )}

          {/* Signature */}
          <div>
            <div style={{ fontWeight: 700, fontSize: '16px', color: '#1a202c' }}>
              {profile.name}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
